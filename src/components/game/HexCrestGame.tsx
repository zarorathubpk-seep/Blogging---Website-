import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Trophy,
  Volume2,
  VolumeX,
  RotateCcw,
  Play,
  Pause,
  ArrowLeft,
  Flame,
  Shield,
  Zap,
  Sparkles,
  Award,
} from 'lucide-react';
import { saveGameScore, getTopGameScores, GameScoreRecord } from '../../services/userService';
import { auth } from '../../firebase';

interface HexCrestGameProps {
  onExit: () => void;
}

type GameState = 'title' | 'playing' | 'paused' | 'gameover';

export const HexCrestGame: React.FC<HexCrestGameProps> = ({ onExit }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // High-frequency game HUD state (isolated from 60fps render loop)
  const [gameState, setGameState] = useState<GameState>('title');
  const [score, setScore] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [coresCollected, setCoresCollected] = useState<number>(0);
  const [shields, setShields] = useState<number>(3);
  const [boostActive, setBoostActive] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [leaderboard, setLeaderboard] = useState<GameScoreRecord[]>([]);
  const [savingScore, setSavingScore] = useState<boolean>(false);

  // Audio Context ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Sound generator
  const playSound = (type: 'laser' | 'collect' | 'hit' | 'gameover' | 'boost') => {
    if (isMuted) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'laser') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.12);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'collect') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.08); // A5
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'hit') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'boost') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(440, now + 0.3);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'gameover') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(330, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.6);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      }
    } catch {}
  };

  // Mutable Game Loop State (never triggers React re-renders)
  const loopState = useRef({
    state: 'title' as GameState,
    score: 0,
    distance: 0,
    cores: 0,
    shields: 3,
    speed: 38,
    shipX: 0,
    shipY: 1.5,
    shipTilt: 0,
    shipPitch: 0,
    targetX: 0,
    hitstop: 0,
    shake: 0,
    keys: {
      left: false,
      right: false,
      up: false,
      down: false,
      space: false,
      boost: false,
    },
    lasers: [] as { mesh: THREE.Mesh; x: number; y: number; z: number; active: boolean }[],
    obstacles: [] as {
      group: THREE.Group;
      type: 'monolith' | 'gate' | 'barrier';
      x: number;
      y: number;
      z: number;
      width: number;
      height: number;
      active: boolean;
      rotSpeed?: number;
    }[],
    crystals: [] as {
      mesh: THREE.Group;
      x: number;
      y: number;
      z: number;
      active: boolean;
    }[],
    particles: [] as {
      mesh: THREE.Mesh;
      vx: number;
      vy: number;
      vz: number;
      life: number;
      maxLife: number;
    }[],
    lastLaserTime: 0,
    roadSegments: [] as THREE.Mesh[],
  });

  // Load top scores initially
  useEffect(() => {
    getTopGameScores(5).then(setLeaderboard);
  }, []);

  // Three.js Scene Setup & 60fps Loop
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080c18);
    scene.fog = new THREE.FogExp2(0x080c18, 0.018);

    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 150);
    camera.position.set(0, 4.5, 9);
    camera.lookAt(0, 1.8, -10);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true,
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 3. Studio PBR Lighting (Navy cool fill + Gold warm key)
    const hemiLight = new THREE.HemisphereLight(0xffebad, 0x080c18, 0.7);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xf3b542, 1.8);
    dirLight.position.set(12, 24, 15);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 60;
    dirLight.shadow.camera.left = -16;
    dirLight.shadow.camera.right = 16;
    dirLight.shadow.camera.top = 16;
    dirLight.shadow.camera.bottom = -16;
    scene.add(dirLight);

    // 4. Procedural Hex Canyon Floor & Runway
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#0b1020';
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = '#f3b542';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.35;
    // Hexagonal grid pattern
    for (let x = 0; x < 256; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 256);
      ctx.stroke();
    }
    for (let y = 0; y < 256; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }
    const roadTexture = new THREE.CanvasTexture(canvas);
    roadTexture.wrapS = THREE.RepeatWrapping;
    roadTexture.wrapT = THREE.RepeatWrapping;
    roadTexture.repeat.set(4, 30);

    const roadGeo = new THREE.PlaneGeometry(24, 180);
    const roadMat = new THREE.MeshStandardMaterial({
      map: roadTexture,
      roughness: 0.35,
      metalness: 0.65,
    });
    const road1 = new THREE.Mesh(roadGeo, roadMat);
    road1.rotation.x = -Math.PI / 2;
    road1.position.z = -50;
    road1.receiveShadow = true;
    scene.add(road1);

    const road2 = road1.clone();
    road2.position.z = -230;
    scene.add(road2);
    loopState.current.roadSegments = [road1, road2];

    // 5. Build Composite 3D Hero Craft: "Crest-V" (9 distinct parts)
    const shipGroup = new THREE.Group();

    // 1. Sleek Titanium Fuselage
    const fuselageGeo = new THREE.ConeGeometry(0.85, 3.2, 5);
    const fuselageMat = new THREE.MeshStandardMaterial({
      color: 0x0e172a,
      roughness: 0.25,
      metalness: 0.85,
    });
    const fuselage = new THREE.Mesh(fuselageGeo, fuselageMat);
    fuselage.rotation.x = -Math.PI / 2;
    fuselage.castShadow = true;
    shipGroup.add(fuselage);

    // 2. 24K Gold Wing Assembly
    const wingGeo = new THREE.BoxGeometry(4.2, 0.1, 1.2);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf3b542,
      roughness: 0.2,
      metalness: 0.9,
    });
    const wings = new THREE.Mesh(wingGeo, goldMat);
    wings.position.set(0, 0, 0.2);
    wings.castShadow = true;
    shipGroup.add(wings);

    // 3. Wingtip Laser Cannons
    const gunGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.1, 8);
    const gunLeft = new THREE.Mesh(gunGeo, fuselageMat);
    gunLeft.rotation.x = Math.PI / 2;
    gunLeft.position.set(-2.0, 0, -0.2);
    const gunRight = gunLeft.clone();
    gunRight.position.x = 2.0;
    shipGroup.add(gunLeft);
    shipGroup.add(gunRight);

    // 4. Cockpit Canopy (Glowing Cyan/Gold Glass)
    const cockpitGeo = new THREE.SphereGeometry(0.45, 16, 12);
    cockpitGeo.scale(0.8, 0.6, 1.6);
    const cockpitMat = new THREE.MeshPhysicalMaterial({
      color: 0xf3b542,
      emissive: 0x925f0a,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.7,
      transparent: true,
    });
    const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
    cockpit.position.set(0, 0.35, -0.3);
    shipGroup.add(cockpit);

    // 5. Dual Ion Engines
    const engineGeo = new THREE.CylinderGeometry(0.28, 0.35, 0.9, 12);
    const engineL = new THREE.Mesh(engineGeo, goldMat);
    engineL.rotation.x = Math.PI / 2;
    engineL.position.set(-0.6, 0.1, 1.4);
    const engineR = engineL.clone();
    engineR.position.x = 0.6;
    shipGroup.add(engineL);
    shipGroup.add(engineR);

    // 6. Engine Plasma Thruster Glow
    const thrusterGeo = new THREE.ConeGeometry(0.24, 0.9, 8);
    const thrusterMat = new THREE.MeshBasicMaterial({ color: 0xffea85 });
    const thrusterL = new THREE.Mesh(thrusterGeo, thrusterMat);
    thrusterL.rotation.x = -Math.PI / 2;
    thrusterL.position.set(-0.6, 0.1, 2.0);
    const thrusterR = thrusterL.clone();
    thrusterR.position.x = 0.6;
    shipGroup.add(thrusterL);
    shipGroup.add(thrusterR);

    // 7. Ground Radial Shadow
    const shadowGeo = new THREE.PlaneGeometry(3.6, 3.6);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45,
    });
    const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = -1.45;
    shipGroup.add(contactShadow);

    shipGroup.position.set(0, 1.5, 0);
    scene.add(shipGroup);

    // 6. Laser Pool (Reusable)
    const laserGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.2, 8);
    const laserMat = new THREE.MeshBasicMaterial({ color: 0xffe066 });
    for (let i = 0; i < 16; i++) {
      const laser = new THREE.Mesh(laserGeo, laserMat);
      laser.rotation.x = Math.PI / 2;
      laser.visible = false;
      scene.add(laser);
      loopState.current.lasers.push({ mesh: laser, x: 0, y: 0, z: 0, active: false });
    }

    // 7. Procedural Obstacles Spawner Pool
    const monolithMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.3,
      metalness: 0.8,
    });
    const neonTrimMat = new THREE.MeshBasicMaterial({ color: 0xf3b542 });

    const createMonolith = () => {
      const grp = new THREE.Group();
      const h = 4 + Math.random() * 3;
      const b = new THREE.Mesh(new THREE.BoxGeometry(2.4, h, 2.4), monolithMat);
      b.position.y = h / 2;
      b.castShadow = true;
      b.receiveShadow = true;
      grp.add(b);

      const trim = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.3, 2.45), neonTrimMat);
      trim.position.y = h * 0.75;
      grp.add(trim);

      grp.visible = false;
      scene.add(grp);
      return { group: grp, width: 2.4, height: h };
    };

    for (let i = 0; i < 12; i++) {
      const mono = createMonolith();
      loopState.current.obstacles.push({
        group: mono.group,
        type: 'monolith',
        x: 0,
        y: 0,
        z: -999,
        width: mono.width,
        height: mono.height,
        active: false,
      });
    }

    // 8. Gold Hex Crystals (Collectibles)
    const crystalGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.4, 6);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0xf3b542,
      emissive: 0xd97706,
      emissiveIntensity: 0.6,
      metalness: 0.9,
      roughness: 0.1,
    });
    for (let i = 0; i < 10; i++) {
      const cGroup = new THREE.Group();
      const m = new THREE.Mesh(crystalGeo, crystalMat);
      m.rotation.z = Math.PI / 2;
      m.castShadow = true;
      cGroup.add(m);

      const aura = new THREE.Mesh(
        new THREE.RingGeometry(0.8, 1.0, 6),
        new THREE.MeshBasicMaterial({ color: 0xffea85, side: THREE.DoubleSide })
      );
      cGroup.add(aura);

      cGroup.visible = false;
      scene.add(cGroup);
      loopState.current.crystals.push({ mesh: cGroup, x: 0, y: 0, z: -999, active: false });
    }

    // 9. Particle Pool
    const pGeo = new THREE.SphereGeometry(0.12, 6, 6);
    const pMat = new THREE.MeshBasicMaterial({ color: 0xf3b542 });
    for (let i = 0; i < 40; i++) {
      const p = new THREE.Mesh(pGeo, pMat);
      p.visible = false;
      scene.add(p);
      loopState.current.particles.push({ mesh: p, vx: 0, vy: 0, vz: 0, life: 0, maxLife: 1 });
    }

    const spawnParticles = (x: number, y: number, z: number, count = 12) => {
      let spawned = 0;
      for (const p of loopState.current.particles) {
        if (p.life <= 0) {
          p.mesh.position.set(x, y, z);
          p.mesh.visible = true;
          p.vx = (Math.random() - 0.5) * 12;
          p.vy = (Math.random() - 0.5) * 12 + 2;
          p.vz = (Math.random() - 0.5) * 12;
          p.life = 0.4 + Math.random() * 0.3;
          p.maxLife = p.life;
          spawned++;
          if (spawned >= count) break;
        }
      }
    };

    // 10. Key Handling with Coyote & Edge Detection
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'a' || k === 'arrowleft') loopState.current.keys.left = true;
      if (k === 'd' || k === 'arrowright') loopState.current.keys.right = true;
      if (k === 'w' || k === 'arrowup') loopState.current.keys.up = true;
      if (k === 's' || k === 'arrowdown') loopState.current.keys.down = true;
      if (k === 'shift') loopState.current.keys.boost = true;

      // Space: Start game or shoot
      if (e.code === 'Space') {
        e.preventDefault();
        if (loopState.current.state === 'title') {
          startGame();
        } else if (loopState.current.state === 'gameover') {
          startGame();
        } else if (loopState.current.state === 'playing') {
          shootLaser();
        }
      }

      // Enter: Start game
      if (e.code === 'Enter') {
        if (loopState.current.state === 'title' || loopState.current.state === 'gameover') {
          startGame();
        }
      }

      // Escape: Pause
      if (e.code === 'Escape') {
        if (loopState.current.state === 'playing') {
          pauseGame();
        } else if (loopState.current.state === 'paused') {
          resumeGame();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'a' || k === 'arrowleft') loopState.current.keys.left = false;
      if (k === 'd' || k === 'arrowright') loopState.current.keys.right = false;
      if (k === 'w' || k === 'arrowup') loopState.current.keys.up = false;
      if (k === 's' || k === 'arrowdown') loopState.current.keys.down = false;
      if (k === 'shift') loopState.current.keys.boost = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', () => {
      loopState.current.keys = { left: false, right: false, up: false, down: false, space: false, boost: false };
    });

    const shootLaser = () => {
      const now = performance.now();
      if (now - loopState.current.lastLaserTime < 180) return;
      loopState.current.lastLaserTime = now;

      // Find inactive laser
      const laser = loopState.current.lasers.find((l) => !l.active);
      if (laser) {
        laser.active = true;
        laser.x = loopState.current.shipX;
        laser.y = loopState.current.shipY;
        laser.z = -1.2;
        laser.mesh.position.set(laser.x, laser.y, laser.z);
        laser.mesh.visible = true;
        playSound('laser');
      }
    };

    const startGame = () => {
      loopState.current.state = 'playing';
      loopState.current.score = 0;
      loopState.current.distance = 0;
      loopState.current.cores = 0;
      loopState.current.shields = 3;
      loopState.current.speed = 42;
      loopState.current.shipX = 0;
      loopState.current.shipY = 1.5;
      loopState.current.targetX = 0;
      loopState.current.shake = 0;

      // Reset obstacles & crystals
      loopState.current.obstacles.forEach((o, i) => {
        o.active = true;
        o.group.visible = true;
        o.x = (Math.random() - 0.5) * 16;
        o.z = -40 - i * 22;
        o.group.position.set(o.x, 0, o.z);
      });

      loopState.current.crystals.forEach((c, i) => {
        c.active = true;
        c.mesh.visible = true;
        c.x = (Math.random() - 0.5) * 14;
        c.y = 1.2 + Math.random() * 1.5;
        c.z = -30 - i * 28;
        c.mesh.position.set(c.x, c.y, c.z);
      });

      setGameState('playing');
      setScore(0);
      setDistance(0);
      setCoresCollected(0);
      setShields(3);
    };

    const pauseGame = () => {
      loopState.current.state = 'paused';
      setGameState('paused');
    };

    const resumeGame = () => {
      loopState.current.state = 'playing';
      setGameState('playing');
    };

    // 11. Core Animation Loop (60fps)
    let animationFrameId: number;
    let lastTime = performance.now();
    let hudThrottle = 0;

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate);

      const rawDt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      const dt = Math.min(rawDt, 0.05); // Clamped delta time

      const st = loopState.current;

      // Title idle camera sweep
      if (st.state === 'title') {
        const time = currentTime * 0.001;
        shipGroup.position.y = 1.5 + Math.sin(time * 2) * 0.15;
        shipGroup.rotation.z = Math.sin(time) * 0.12;
        camera.position.x = Math.sin(time * 0.5) * 3;
        camera.position.y = 4.2 + Math.cos(time * 0.5) * 0.5;
        camera.lookAt(0, 1.5, -5);
        renderer.render(scene, camera);
        return;
      }

      if (st.state === 'paused') {
        renderer.render(scene, camera);
        return;
      }

      // Hitstop delay
      if (st.hitstop > 0) {
        st.hitstop -= dt;
        renderer.render(scene, camera);
        return;
      }

      // Responsive Input & Movement
      const boostMultiplier = st.keys.boost ? 1.6 : 1.0;
      const moveSpeed = 22 * dt;

      if (st.keys.left) st.targetX = Math.max(st.targetX - moveSpeed, -8.5);
      if (st.keys.right) st.targetX = Math.min(st.targetX + moveSpeed, 8.5);

      // Smooth horizontal interpolation with roll tilt
      st.shipX += (st.targetX - st.shipX) * (1 - Math.exp(-14 * dt));
      const rollTarget = (st.targetX - st.shipX) * -0.22;
      st.shipTilt += (rollTarget - st.shipTilt) * (1 - Math.exp(-12 * dt));

      if (st.keys.up) st.shipY = Math.min(st.shipY + 8 * dt, 4.0);
      if (st.keys.down) st.shipY = Math.max(st.shipY - 8 * dt, 0.8);

      shipGroup.position.set(st.shipX, st.shipY, 0);
      shipGroup.rotation.z = st.shipTilt;
      shipGroup.rotation.x = (st.shipY - 1.5) * 0.08;

      // Thruster pulse scaling
      const thrusterScale = (st.keys.boost ? 1.8 : 1.0) + Math.sin(currentTime * 0.02) * 0.2;
      thrusterL.scale.set(thrusterScale, thrusterScale, thrusterScale);
      thrusterR.scale.set(thrusterScale, thrusterScale, thrusterScale);

      // Camera follow with decay shake
      let shakeX = 0;
      let shakeY = 0;
      if (st.shake > 0) {
        st.shake -= dt * 2.5;
        shakeX = (Math.random() - 0.5) * st.shake * 0.4;
        shakeY = (Math.random() - 0.5) * st.shake * 0.4;
      }
      camera.position.x = st.shipX * 0.4 + shakeX;
      camera.position.y = 4.2 + (st.shipY - 1.5) * 0.3 + shakeY;
      camera.lookAt(st.shipX * 0.6, 1.8, -12);

      // World advancement
      const curSpeed = st.speed * boostMultiplier;
      const frameDist = curSpeed * dt;
      st.distance += frameDist;
      st.score += Math.round(frameDist * 1.5);

      // Road recycling
      st.roadSegments.forEach((road) => {
        road.position.z += frameDist;
        if (road.position.z > 40) {
          road.position.z -= 360;
        }
      });

      // Update Lasers
      st.lasers.forEach((laser) => {
        if (!laser.active) return;
        laser.z -= 90 * dt;
        laser.mesh.position.set(laser.x, laser.y, laser.z);

        // Check laser collision with obstacles
        for (const obs of st.obstacles) {
          if (!obs.active) continue;
          const dx = Math.abs(laser.x - obs.x);
          const dz = Math.abs(laser.z - obs.z);
          if (dx < obs.width / 2 + 0.3 && dz < 1.8) {
            laser.active = false;
            laser.mesh.visible = false;
            obs.active = false;
            obs.group.visible = false;
            spawnParticles(obs.x, 2, obs.z, 20);
            st.score += 250;
            playSound('hit');
            break;
          }
        }

        if (laser.z < -90) {
          laser.active = false;
          laser.mesh.visible = false;
        }
      });

      // Update Obstacles
      st.obstacles.forEach((obs) => {
        if (!obs.active) return;
        obs.z += frameDist;
        obs.group.position.set(obs.x, 0, obs.z);

        // Player Collision check (Box-Sphere proxy)
        const dx = Math.abs(st.shipX - obs.x);
        const dy = Math.abs(st.shipY - (obs.height / 2));
        const dz = Math.abs(obs.z);

        if (dx < obs.width / 2 + 1.2 && dy < obs.height / 2 + 0.6 && dz < 1.4) {
          // Impact!
          obs.active = false;
          obs.group.visible = false;
          st.shields -= 1;
          st.shake = 1.0;
          st.hitstop = 0.06; // 60ms simulation impact stop
          spawnParticles(st.shipX, st.shipY, 0, 24);
          playSound('hit');

          if (st.shields <= 0) {
            st.state = 'gameover';
            setGameState('gameover');
            playSound('gameover');

            // Auto-save game score
            saveScoreRecord(st.score, Math.round(st.distance), st.cores);
          }
        }

        // Recycle obstacle ahead
        if (obs.z > 12) {
          obs.z -= 240 + Math.random() * 40;
          obs.x = (Math.random() - 0.5) * 16;
          obs.active = true;
          obs.group.visible = true;
        }
      });

      // Update Gold Hex Crystals (Collectibles)
      st.crystals.forEach((crystal) => {
        if (!crystal.active) return;
        crystal.z += frameDist;
        crystal.mesh.position.set(crystal.x, crystal.y, crystal.z);
        crystal.mesh.rotation.y += 3.5 * dt;

        // Player Pick-up check
        const dist = Math.hypot(st.shipX - crystal.x, st.shipY - crystal.y, crystal.z);
        if (dist < 2.0) {
          crystal.active = false;
          crystal.mesh.visible = false;
          st.cores += 1;
          st.score += 500;
          spawnParticles(crystal.x, crystal.y, 0, 14);
          playSound('collect');
        }

        // Recycle crystal ahead
        if (crystal.z > 12) {
          crystal.z -= 260 + Math.random() * 50;
          crystal.x = (Math.random() - 0.5) * 14;
          crystal.y = 1.2 + Math.random() * 1.5;
          crystal.active = true;
          crystal.mesh.visible = true;
        }
      });

      // Update Particles
      st.particles.forEach((p) => {
        if (p.life > 0) {
          p.life -= dt;
          p.mesh.position.x += p.vx * dt;
          p.mesh.position.y += p.vy * dt;
          p.mesh.position.z += p.vz * dt;
          const scale = p.life / p.maxLife;
          p.mesh.scale.set(scale, scale, scale);
          if (p.life <= 0) {
            p.mesh.visible = false;
          }
        }
      });

      // Gradually increase speed over time
      st.speed = Math.min(st.speed + dt * 0.8, 85);

      // Throttled HUD update for React state (every 6 frames ~ 100ms)
      hudThrottle++;
      if (hudThrottle % 6 === 0) {
        setScore(st.score);
        setDistance(Math.round(st.distance));
        setCoresCollected(st.cores);
        setShields(st.shields);
        setBoostActive(st.keys.boost);
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const saveScoreRecord = async (finalScore: number, finalDist: number, finalCores: number) => {
    setSavingScore(true);
    const currentUser = auth.currentUser;
    const playerName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Guest Pilot';
    await saveGameScore({
      playerName,
      score: finalScore,
      distance: finalDist,
      coresCollected: finalCores,
      userId: currentUser?.uid,
    });
    const refreshed = await getTopGameScores(5);
    setLeaderboard(refreshed);
    setSavingScore(false);
  };

  const handleStart = () => {
    loopState.current.state = 'playing';
    loopState.current.score = 0;
    loopState.current.distance = 0;
    loopState.current.cores = 0;
    loopState.current.shields = 3;
    loopState.current.speed = 42;
    loopState.current.shipX = 0;
    loopState.current.shipY = 1.5;
    loopState.current.targetX = 0;
    setGameState('playing');
    setScore(0);
    setDistance(0);
    setCoresCollected(0);
    setShields(3);
  };

  return (
    <div className="relative w-full h-[100vh] overflow-hidden select-none bg-[#080c18] font-sans text-white">
      {/* 3D WebGL Canvas Viewport */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* Low-Occlusion Game HUD (pointer-events-none container) */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 z-20">
        {/* Top Perimeter Status Cluster */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onExit}
              className="pointer-events-auto p-2.5 rounded-xl bg-[#0b1020]/80 border border-[#f3b542]/40 text-[#f3b542] hover:bg-[#f3b542]/20 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Exit Arcade</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMuted((prev) => !prev)}
              className="pointer-events-auto p-2.5 rounded-xl bg-[#0b1020]/80 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[#f3b542]" />}
            </button>
          </div>

          {gameState === 'playing' && (
            <div className="flex items-center gap-4 sm:gap-6 bg-[#0b1020]/90 border border-[#f3b542]/40 px-5 py-2.5 rounded-2xl shadow-xl">
              {/* Score */}
              <div className="text-right">
                <span className="text-[10px] tracking-wider text-slate-400 uppercase font-bold block">Score</span>
                <span className="text-lg sm:text-xl font-extrabold text-[#f3b542] tabular-nums font-mono">
                  {score.toLocaleString()}
                </span>
              </div>

              {/* Distance */}
              <div className="text-right">
                <span className="text-[10px] tracking-wider text-slate-400 uppercase font-bold block">Distance</span>
                <span className="text-sm sm:text-base font-bold text-white tabular-nums font-mono">
                  {distance}m
                </span>
              </div>

              {/* Gold Hex Cores */}
              <div className="text-right flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#f3b542] animate-pulse" />
                <div>
                  <span className="text-[10px] tracking-wider text-slate-400 uppercase font-bold block">Cores</span>
                  <span className="text-sm sm:text-base font-bold text-[#f3b542] tabular-nums font-mono">
                    {coresCollected}
                  </span>
                </div>
              </div>

              {/* Hull Shields */}
              <div className="flex items-center gap-1 pl-2 border-l border-slate-700">
                {[1, 2, 3].map((idx) => (
                  <Shield
                    key={idx}
                    className={`w-4 h-4 ${
                      idx <= shields
                        ? 'text-emerald-400 fill-emerald-400/30'
                        : 'text-slate-600 fill-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Control Hint Line (Low-Occlusion Flat Line) */}
        {gameState === 'playing' && (
          <div className="text-center pb-2">
            <span className="inline-block bg-[#0b1020]/80 border border-slate-800 px-4 py-1.5 rounded-full text-xs text-slate-400 font-medium">
              <strong className="text-white">WASD / Arrows</strong> Steer · <strong className="text-white">Space</strong> Plasma Laser · <strong className="text-white">Shift</strong> Boost
            </span>
          </div>
        )}
      </div>

      {/* 1. Title Screen Modal (30-40% Negative Space with Bespoke Lockup) */}
      {gameState === 'title' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-gradient-to-t from-[#080c18]/90 via-[#080c18]/40 to-transparent">
          <div className="max-w-md w-full bg-[#0b1020]/95 border border-[#f3b542]/40 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl backdrop-blur-xs">
            {/* Bespoke HexCrest Inline SVG Lockup */}
            <div className="flex justify-center">
              <svg className="w-20 h-20 drop-shadow-[0_0_20px_#f3b542]" viewBox="0 0 64 64" fill="none">
                <polygon
                  points="32,4 57,18.4 57,45.6 32,60 7,45.6 7,18.4"
                  fill="#111827"
                  stroke="#F3B542"
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M18 22 L32 14 L46 22 L46 28 L36 22 V42 L32 48 L28 42 V22 L18 28 Z"
                  fill="#F3B542"
                />
              </svg>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
                HexCrest <span className="text-[#f3b542]">3D</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Pilot the high-speed Crest-V golden interceptor through the cyber canyon. Dodge obsidian monoliths, collect energy cores, and blast obstacles.
              </p>
            </div>

            {/* Action CTA */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleStart}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#f3b542] via-amber-400 to-[#d97706] text-slate-950 font-extrabold text-base shadow-xl hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>ENGAGE FLIGHT (Press Space)</span>
              </button>
            </div>

            {/* Control Hints */}
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] text-slate-400">
              <p>WASD / Arrow Keys to Move · Space to Fire Lasers · Shift to Boost</p>
            </div>

            {/* Leaderboard Snippet */}
            {leaderboard.length > 0 && (
              <div className="text-left space-y-1.5 pt-2 border-t border-slate-800">
                <div className="text-[11px] font-bold text-[#f3b542] flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Top Firestore Aces</span>
                </div>
                <div className="space-y-1">
                  {leaderboard.slice(0, 3).map((r, i) => (
                    <div key={r.id || i} className="flex items-center justify-between text-xs text-slate-300">
                      <span>#{i + 1} {r.playerName}</span>
                      <span className="font-mono text-[#f3b542] font-bold">{r.score.toLocaleString()} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Game Over Modal */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-[#080c18]/85">
          <div className="max-w-md w-full bg-[#0b1020] border border-red-500/40 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center mx-auto">
              <Flame className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                Hull Integrity Depleted
              </h2>
              <p className="text-xs text-slate-400 mt-1">Flight telemetrics logged to Firestore.</p>
            </div>

            {/* Final Stats */}
            <div className="grid grid-cols-3 gap-2 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Final Score</span>
                <span className="text-lg font-bold text-[#f3b542] font-mono">{score.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Distance</span>
                <span className="text-lg font-bold text-white font-mono">{distance}m</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Cores</span>
                <span className="text-lg font-bold text-[#f3b542] font-mono">{coresCollected}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleStart}
                className="flex-1 py-3.5 rounded-xl bg-[#f3b542] hover:bg-[#dfa234] text-slate-950 font-bold text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Fly Again</span>
              </button>
              <button
                type="button"
                onClick={onExit}
                className="px-5 py-3.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-semibold text-sm transition cursor-pointer"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
