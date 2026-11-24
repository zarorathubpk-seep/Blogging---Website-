import { useState, useEffect, useCallback } from 'react';
import { loadPlannerState, savePlannerState, resetPlannerState } from './utils/storage';
import { StoredPlannerState, Currency, PlannerType } from './types/planner';
import { Article } from './types/article';
import { INITIAL_ARTICLES } from './data/defaultArticles';
import { subscribeArticles } from './services/articleService';
import { updatePageSeo, SITE_DOMAIN, DEFAULT_OG_IMAGE } from './utils/seo';
import { trackPageView } from './utils/analytics';
import { TOOLS_DATA } from './data/toolsData';
import { TOOL_GUIDES } from './data/toolGuides';

// Components & Pages
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ToolPage } from './pages/ToolPage';
import { PlannerPage } from './pages/PlannerPage';
import { BlogListPage } from './pages/BlogListPage';
import { ArticlePage } from './pages/ArticlePage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { AboutUsPage } from './pages/AboutUsPage';
import { ContactUsPage } from './pages/ContactUsPage';
import { TermsPage } from './pages/TermsPage';
import { DisclaimerPage } from './pages/DisclaimerPage';
import { CookiePolicyPage } from './pages/CookiePolicyPage';
import { AdminPage } from './pages/AdminPage';
import { SitemapPage } from './pages/SitemapPage';
import { ToolSelectorModal } from './components/ToolSelectorModal';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { GeminiChatbot } from './components/chat/GeminiChatbot';
import { HexCrestGame } from './components/game/HexCrestGame';
import { Sparkles, Gamepad2 } from 'lucide-react';

import { useTheme } from './context/ThemeContext';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [plannerState, setPlannerState] = useState<StoredPlannerState>(() => loadPlannerState());
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [isToolSelectorOpen, setIsToolSelectorOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const path = window.location.pathname;
    return path || '/';
  });

  // Tool selector opens via header search button or Cmd+K / Ctrl+K shortcut

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsToolSelectorOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Keep articles subscribed to Firestore
  useEffect(() => {
    const unsub = subscribeArticles(
      (updatedArticles) => {
        if (updatedArticles && updatedArticles.length > 0) {
          setArticles(updatedArticles);
        }
      },
      (err) => {
        console.warn('Using local articles cache due to Firestore state:', err);
      }
    );
    return () => unsub();
  }, []);

  // Save planner state to localStorage on modification
  const handleUpdatePlannerState = useCallback((updated: StoredPlannerState) => {
    setPlannerState(updated);
    savePlannerState(updated);
  }, []);

  const handleResetPlanner = useCallback(
    (allPlanners?: boolean) => {
      if (allPlanners) {
        const resetAll = resetPlannerState();
        setPlannerState(resetAll);
      } else {
        const resetCurrent = resetPlannerState(plannerState.activeType);
        setPlannerState(resetCurrent);
      }
    },
    [plannerState.activeType]
  );

  const handleCurrencyChange = useCallback((cur: Currency) => {
    setPlannerState((prev) => {
      const updated = {
        ...prev,
        currency: cur,
        budget: { ...prev.budget, currency: cur },
      };
      savePlannerState(updated);
      return updated;
    });
  }, []);

  // Routing navigation
  const navigate = useCallback((path: string) => {
    if (path.startsWith('#')) return;
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Listen to browser popstate (back/forward)
  useEffect(() => {
    const onPopState = () => {
      const path = window.location.pathname;
      setCurrentPath(path || '/');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Update dynamic SEO & Schema.org JSON-LD on path change
  useEffect(() => {
    if (currentPath === '/' || currentPath === '') {
      updatePageSeo({
        title: 'ToolCrest — Essential Online PDF, Image & Productivity Tools',
        description:
          `Free browser tools (${TOOLS_DATA.length} utilities) for PDF merging, splitting, compression, OCR, image optimization, QR codes, unit conversion, and planning.`,
        canonicalPath: '/',
        jsonLd: [
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'ToolCrest',
            url: `${SITE_DOMAIN}/`,
            description:
              'Free browser-based utilities for PDFs, images, QR codes, conversions, financial calculations, and daily planners.',
          },
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'ToolCrest',
            url: `${SITE_DOMAIN}/`,
            logo: DEFAULT_OG_IMAGE,
          },
        ],
      });
    } else if (currentPath === '/planner') {
      updatePageSeo({
        title: 'Free Weekly & Budget Planner Generator | ToolCrest',
        description:
          'Build a free weekly, budget, work, study, meal, or habit planner in seconds. Customize locally, print, or save as PDF.',
        canonicalPath: '/planner',
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'ToolCrest Planner Generator',
          url: `${SITE_DOMAIN}/planner`,
          applicationCategory: 'ProductivityApplication',
          operatingSystem: 'All',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
      });
    } else if (
      currentPath.startsWith('/tools/') ||
      TOOLS_DATA.some(
        (t) =>
          '/' + t.slug === currentPath ||
          '/' + t.id === currentPath ||
          (currentPath === '/image-to-pdf' && t.id === 'images-to-pdf') ||
          (currentPath === '/pdf-to-image' && t.id === 'pdf-to-images') ||
          (currentPath === '/pdf-to-jpg' && t.id === 'pdf-to-images')
      )
    ) {
      const slug = currentPath.startsWith('/tools/')
        ? currentPath.replace('/tools/', '')
        : currentPath.replace(/^\//, '');
      const tool =
        TOOLS_DATA.find((t) => t.slug === slug || t.id === slug) ||
        (slug === 'image-to-pdf' ? TOOLS_DATA.find((t) => t.id === 'images-to-pdf') : undefined) ||
        ((slug === 'pdf-to-image' || slug === 'pdf-to-jpg')
          ? TOOLS_DATA.find((t) => t.id === 'pdf-to-images')
          : undefined);

      if (tool) {
        const guide = TOOL_GUIDES[tool.id];
        const schemas: Record<string, unknown>[] = [
          {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: tool.name,
            url: `${SITE_DOMAIN}/tools/${tool.slug}`,
            description: tool.longDesc || tool.shortDesc,
            applicationCategory: 'UtilitiesApplication',
            operatingSystem: 'All',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_DOMAIN}/` },
              { '@type': 'ListItem', position: 2, name: tool.name, item: `${SITE_DOMAIN}/tools/${tool.slug}` },
            ],
          },
        ];
        if (guide && guide.faqs.length > 0) {
          schemas.push({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: guide.faqs.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          });
        }
        updatePageSeo({
          title: `${tool.name} — Free Online Tool | ToolCrest`,
          description: tool.shortDesc,
          canonicalPath: `/tools/${tool.slug}`,
          jsonLd: schemas,
        });
      } else {
        updatePageSeo({
          title: 'Tool Not Found | ToolCrest',
          description: 'The requested tool page could not be found on ToolCrest.',
          canonicalPath: currentPath,
          noindex: true,
        });
      }
    } else if (currentPath === '/blog') {
      updatePageSeo({
        title: 'ToolCrest Blog & Workflow Guides',
        description:
          'Practical guides on weekly planning, PDF merging and OCR workflows, 50/30/20 budgeting, office work schedules, and document security.',
        canonicalPath: '/blog',
      });
    } else if (currentPath.startsWith('/blog/')) {
      const slug = currentPath.replace('/blog/', '');
      const found = articles.find((a) => a.slug === slug && a.isPublished !== false);
      if (found) {
        updatePageSeo({
          title: `${found.title} | ToolCrest`,
          description: found.subtitle || found.title,
          canonicalPath: `/blog/${slug}`,
          ogType: 'article',
          jsonLd: [
            {
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: found.title,
              description: found.subtitle || found.title,
              author: { '@type': 'Organization', name: found.author || 'ToolCrest Editorial Team' },
              publisher: { '@type': 'Organization', name: 'ToolCrest', url: `${SITE_DOMAIN}/` },
              mainEntityOfPage: `${SITE_DOMAIN}/blog/${slug}`,
            },
            {
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_DOMAIN}/` },
                { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_DOMAIN}/blog` },
                { '@type': 'ListItem', position: 3, name: found.title, item: `${SITE_DOMAIN}/blog/${slug}` },
              ],
            },
          ],
        });
      } else {
        updatePageSeo({
          title: 'Article Not Found | ToolCrest',
          description: 'The requested article could not be found on ToolCrest.',
          canonicalPath: currentPath,
          noindex: true,
        });
      }
    } else if (currentPath === '/privacy-policy' || currentPath === '/privacy') {
      updatePageSeo({
        title: 'Privacy Policy | ToolCrest',
        description: 'ToolCrest privacy policy covering browser-local processing, optional AI features, and consent preferences.',
        canonicalPath: '/privacy-policy',
      });
    } else if (currentPath === '/about-us' || currentPath === '/about') {
      updatePageSeo({
        title: 'About Us | ToolCrest',
        description: 'About ToolCrest online tools, maintenance standards, and editorial guides.',
        canonicalPath: '/about-us',
      });
    } else if (currentPath === '/contact-us' || currentPath === '/contact') {
      updatePageSeo({
        title: 'Contact Us | ToolCrest',
        description: 'Get in touch with ToolCrest for bug reports, feature requests, or editorial questions.',
        canonicalPath: '/contact-us',
      });
    } else if (currentPath === '/terms-and-conditions' || currentPath === '/terms') {
      updatePageSeo({
        title: 'Terms & Conditions | ToolCrest',
        description: 'Terms and conditions for using ToolCrest free online tools and content.',
        canonicalPath: '/terms-and-conditions',
      });
    } else if (currentPath === '/disclaimer') {
      updatePageSeo({
        title: 'Disclaimer | ToolCrest',
        description: 'General disclaimer regarding tools, calculators, and informational articles.',
        canonicalPath: '/disclaimer',
      });
    } else if (currentPath === '/cookie-policy') {
      updatePageSeo({
        title: 'Cookie Policy | ToolCrest',
        description: 'Detailed cookie and local storage policy for ToolCrest and advertising partners.',
        canonicalPath: '/cookie-policy',
      });
    } else if (currentPath === '/sitemap') {
      updatePageSeo({
        title: 'HTML Sitemap | ToolCrest',
        description: 'Directory of free online tools, PDF utilities, planners, and guide articles.',
        canonicalPath: '/sitemap',
      });
    } else if (currentPath === '/admin') {
      updatePageSeo({
        title: 'Admin Article Portal | ToolCrest',
        description: 'Manage articles and sync data in Firestore.',
        canonicalPath: '/admin',
        noindex: true,
      });
    } else if (currentPath === '/arcade' || currentPath === '/game') {
      updatePageSeo({
        title: 'HexCrest 3D Cyber Odyssey — Free Online Three.js Arcade | ToolCrest',
        description: 'Pilot the Crest-V golden interceptor in 3D through the cyber canyon. High-speed Three.js flight runner with live Firestore leaderboard.',
        canonicalPath: '/arcade',
      });
    } else {
      updatePageSeo({
        title: 'Page Not Found | ToolCrest',
        description: 'The requested page could not be found on ToolCrest.',
        canonicalPath: currentPath,
        noindex: true,
      });
    }
  }, [currentPath, articles]);

  // Track Google Analytics 4 page views strictly on route changes (prevent duplicate events)
  useEffect(() => {
    const timer = setTimeout(() => {
      trackPageView(currentPath, document.title);
    }, 50);
    return () => clearTimeout(timer);
  }, [currentPath]);

  // Route matching
  const renderCurrentView = () => {
    // 1. Tool Page (Supports both /tools/:slug and direct URLs like /image-to-pdf, /merge-pdf, etc.)
    const directSlug = currentPath.replace(/^\//, '');
    const isDirectTool = TOOLS_DATA.some(
      (t) =>
        t.slug === directSlug ||
        t.id === directSlug ||
        (directSlug === 'image-to-pdf' && t.id === 'images-to-pdf') ||
        ((directSlug === 'pdf-to-image' || directSlug === 'pdf-to-jpg') && t.id === 'pdf-to-images')
    );

    if (currentPath.startsWith('/tools/') || isDirectTool) {
      const slug = currentPath.startsWith('/tools/')
        ? currentPath.replace('/tools/', '')
        : directSlug;
      return (
        <ToolPage
          toolSlug={slug}
          onNavigate={navigate}
          plannerState={plannerState}
          onUpdatePlannerState={handleUpdatePlannerState}
          onResetPlanner={handleResetPlanner}
          articles={articles}
        />
      );
    }

    // 2. Blog Single Article
    if (currentPath.startsWith('/blog/')) {
      const slug = currentPath.replace('/blog/', '');
      const currentArticle = articles.find((a) => a.slug === slug && a.isPublished !== false);
      if (!currentArticle) {
        return (
          <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
            <div className={`max-w-lg w-full rounded-3xl p-8 border text-center space-y-4 shadow-xl ${isDark ? 'bg-[#0c101d] border-amber-500/25 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500">404 • Article Not Found</div>
              <h1 className="text-2xl font-black">Guide Not Found</h1>
              <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                The article slug “{slug}” is unavailable or unpublished. Browse all current tutorials in our Knowledge Center.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/blog')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs cursor-pointer"
                >
                  Browse All Articles
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className={`px-5 py-2.5 rounded-xl border text-xs font-bold cursor-pointer ${isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        );
      }
      return (
        <ArticlePage
          article={currentArticle}
          allArticles={articles}
          onSelectArticle={(s) => navigate(`/blog/${s}`)}
          onNavigate={navigate}
        />
      );
    }

    // 3. Blog List
    if (currentPath === '/blog') {
      return (
        <BlogListPage
          articles={articles}
          onSelectArticle={(s) => navigate(`/blog/${s}`)}
          onNavigate={navigate}
        />
      );
    }

    // 4. Planner Page (Free Planner Generator with 8 planners)
    if (currentPath === '/planner') {
      return (
        <PlannerPage
          state={plannerState}
          onUpdateState={handleUpdatePlannerState}
          onResetPlanner={handleResetPlanner}
          articles={articles}
          onSelectArticle={(slug) => navigate(`/blog/${slug}`)}
          onNavigate={navigate}
        />
      );
    }

    // 5. Monetization & Legal Pages (including short aliases)
    if (currentPath === '/privacy-policy' || currentPath === '/privacy') {
      return <PrivacyPolicyPage onNavigate={navigate} />;
    }
    if (currentPath === '/about-us' || currentPath === '/about') {
      return <AboutUsPage onNavigate={navigate} />;
    }
    if (currentPath === '/contact-us' || currentPath === '/contact') {
      return <ContactUsPage onNavigate={navigate} />;
    }
    if (currentPath === '/terms-and-conditions' || currentPath === '/terms') {
      return <TermsPage onNavigate={navigate} />;
    }
    if (currentPath === '/disclaimer') {
      return <DisclaimerPage onNavigate={navigate} />;
    }
    if (currentPath === '/cookie-policy') {
      return <CookiePolicyPage onNavigate={navigate} />;
    }

    // 6. Admin Page
    if (currentPath === '/admin') {
      return (
        <AdminPage
          articles={articles}
          onRefreshArticles={() => {}}
          onNavigate={navigate}
        />
      );
    }

    // 7. Sitemap Page
    if (currentPath === '/sitemap') {
      return (
        <SitemapPage
          articles={articles}
          onNavigate={navigate}
          onSelectPlannerType={(type: PlannerType) => {
            setPlannerState((prev) => ({ ...prev, activeType: type }));
            navigate('/planner');
          }}
          onSelectArticle={(s) => navigate(`/blog/${s}`)}
        />
      );
    }

    // 8. Homepage vs Explicit 404 Not Found
    if (currentPath === '/' || currentPath === '') {
      return (
        <HomePage
          onNavigate={navigate}
          onSelectTool={(slug) => navigate(`/tools/${slug}`)}
          articles={articles}
        />
      );
    }

    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className={`max-w-lg w-full rounded-3xl p-8 border text-center space-y-4 shadow-xl ${isDark ? 'bg-[#0c101d] border-amber-500/25 text-slate-100' : 'bg-white border-slate-200 text-slate-900'}`}>
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500">404 • Page Not Found</div>
          <h1 className="text-2xl font-black">Page Not Found</h1>
          <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            The path “{currentPath}” does not match any active page or utility on ToolCrest.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs cursor-pointer"
            >
              Go to Homepage
            </button>
            <button
              type="button"
              onClick={() => navigate('/sitemap')}
              className={`px-5 py-2.5 rounded-xl border text-xs font-bold cursor-pointer ${isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
            >
              Browse Sitemap
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 8. Full-Viewport Game Shell (Title Screen -> Playing -> GameOver, zero website navbar/footer clutter)
  if (currentPath === '/arcade' || currentPath === '/game') {
    return <HexCrestGame onExit={() => navigate('/')} />;
  }

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 selection:bg-amber-500/30 ${
        isDark ? 'bg-[#0B0F19] text-slate-100 selection:text-amber-200' : 'bg-[#F8FAFC] text-slate-900 selection:text-amber-700'
      }`}
    >
      <Header
        currentPath={currentPath}
        onNavigate={navigate}
        currency={plannerState.currency}
        onCurrencyChange={handleCurrencyChange}
        onOpenToolSelector={() => setIsToolSelectorOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenGame={() => navigate('/arcade')}
      />

      <div className="flex-1">{renderCurrentView()}</div>

      {/* Floating Gemini AI Assistant Trigger Button */}
      <button
        type="button"
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-gradient-to-r from-[#F3B542] via-amber-400 to-[#d97706] text-slate-950 shadow-2xl hover:scale-105 active:scale-95 transition-transform cursor-pointer flex items-center gap-2 font-black border border-amber-300/60 drop-shadow-[0_4px_16px_rgba(243,181,66,0.4)]"
        title="Ask ToolCrest AI with Search Grounding"
      >
        <Sparkles className="w-5 h-5 fill-current animate-pulse" />
        <span className="hidden sm:inline text-xs font-black tracking-wide pr-1">Ask AI</span>
      </button>

      {/* Gemini AI Multi-Turn Chatbot Drawer */}
      <GeminiChatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Tool Selector Modal Popup */}
      <ToolSelectorModal
        isOpen={isToolSelectorOpen}
        onClose={() => setIsToolSelectorOpen(false)}
        onSelectTool={(slug) => navigate(`/tools/${slug}`)}
      />

      {/* GDPR & ePrivacy Cookie & Analytics Consent Banner */}
      <CookieConsentBanner onNavigate={navigate} />

      <Footer
        theme={theme}
        onNavigate={navigate}
        onSelectPlannerType={(type: PlannerType) => {
          setPlannerState((prev) => ({ ...prev, activeType: type }));
          navigate('/planner');
        }}
      />
    </div>
  );
}
