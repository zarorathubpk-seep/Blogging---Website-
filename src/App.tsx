import { useState, useEffect, useCallback } from 'react';
import { loadPlannerState, savePlannerState, resetPlannerState } from './utils/storage';
import { StoredPlannerState, Currency, PlannerType } from './types/planner';
import { Article } from './types/article';
import { INITIAL_ARTICLES } from './data/defaultArticles';
import { subscribeArticles } from './services/articleService';
import { updatePageSeo } from './utils/seo';
import { trackPageView } from './utils/analytics';
import { TOOLS_DATA } from './data/toolsData';

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
import { Sparkles } from 'lucide-react';

export default function App() {
  const [plannerState, setPlannerState] = useState<StoredPlannerState>(() => loadPlannerState());
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [isToolSelectorOpen, setIsToolSelectorOpen] = useState<boolean>(false);
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const path = window.location.pathname;
    return path || '/';
  });

  // Auto-prompt visitor to pick a tool on first homepage visit
  useEffect(() => {
    const dismissed = localStorage.getItem('toolcrest_welcome_popup_dismissed_v1');
    if (!dismissed && (currentPath === '/' || currentPath === '')) {
      const timer = setTimeout(() => {
        setIsToolSelectorOpen(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [currentPath]);

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

  // Update dynamic SEO on path change
  useEffect(() => {
    if (currentPath === '/' || currentPath === '') {
      updatePageSeo({
        title: 'ToolCrest — All Your Essential Online Tools in One Place',
        description:
          'Free browser tools for PDF merge, split, compress, sign, QR code generation, unit conversions, and productivity planners. 100% private, no sign-up.',
        canonicalPath: '/',
      });
    } else if (currentPath === '/planner') {
      updatePageSeo({
        title: 'Free Weekly & Budget Planner Generator | ToolCrest',
        description:
          'Build a free weekly, budget, work, study, or project planner in seconds. Customize it, print it, or save it as a PDF.',
        canonicalPath: '/planner',
      });
    } else if (currentPath.startsWith('/tools/')) {
      const slug = currentPath.replace('/tools/', '');
      const tool = TOOLS_DATA.find((t) => t.slug === slug);
      if (tool) {
        updatePageSeo({
          title: `${tool.name} — Free Online Tool | ToolCrest`,
          description: tool.shortDesc,
          canonicalPath: `/tools/${slug}`,
        });
      }
    } else if (currentPath === '/blog') {
      updatePageSeo({
        title: 'ToolCrest Blog & Productivity Guides',
        description:
          'Practical guides on weekly planning, PDF workflows, 50/30/20 budget method, office work schedules, and Sunday review routines.',
        canonicalPath: '/blog',
      });
    } else if (currentPath.startsWith('/blog/')) {
      const slug = currentPath.replace('/blog/', '');
      const found = articles.find((a) => a.slug === slug);
      if (found) {
        updatePageSeo({
          title: `${found.title} | ToolCrest`,
          description: found.subtitle || found.title,
          canonicalPath: `/blog/${slug}`,
        });
      }
    } else if (currentPath === '/privacy-policy' || currentPath === '/privacy') {
      updatePageSeo({
        title: 'Privacy Policy | ToolCrest',
        description: 'ToolCrest privacy policy. Client-side processing, zero server file retention, and GDPR compliance.',
        canonicalPath: '/privacy-policy',
      });
    } else if (currentPath === '/about-us' || currentPath === '/about') {
      updatePageSeo({
        title: 'About Us | ToolCrest',
        description: 'About ToolCrest online tools and productivity blogging platform.',
        canonicalPath: '/about-us',
      });
    } else if (currentPath === '/contact-us' || currentPath === '/contact') {
      updatePageSeo({
        title: 'Contact Us | ToolCrest',
        description: 'Get in touch with ToolCrest technical and editorial support team.',
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
    // 1. Tool Page
    if (currentPath.startsWith('/tools/')) {
      const slug = currentPath.replace('/tools/', '');
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
      const currentArticle =
        articles.find((a) => a.slug === slug) ||
        articles[0] ||
        INITIAL_ARTICLES[0];
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
        />
      );
    }

    // 5. Monetization & Legal Pages
    if (currentPath === '/privacy-policy') {
      return <PrivacyPolicyPage onNavigate={navigate} />;
    }
    if (currentPath === '/about-us') {
      return <AboutUsPage onNavigate={navigate} />;
    }
    if (currentPath === '/contact-us') {
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

    // Default: Homepage (Tool selection first)
    return (
      <HomePage
        onNavigate={navigate}
        onSelectTool={(slug) => navigate(`/tools/${slug}`)}
        articles={articles}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-slate-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      <Header
        currentPath={currentPath}
        onNavigate={navigate}
        currency={plannerState.currency}
        onCurrencyChange={handleCurrencyChange}
        onOpenToolSelector={() => setIsToolSelectorOpen(true)}
      />

      <div className="flex-1">{renderCurrentView()}</div>

      {/* Tool Selector Modal Popup */}
      <ToolSelectorModal
        isOpen={isToolSelectorOpen}
        onClose={() => setIsToolSelectorOpen(false)}
        onSelectTool={(slug) => navigate(`/tools/${slug}`)}
      />

      {/* GDPR & ePrivacy Cookie & Analytics Consent Banner */}
      <CookieConsentBanner onNavigate={navigate} />

      <Footer
        onNavigate={navigate}
        onSelectPlannerType={(type: PlannerType) => {
          setPlannerState((prev) => ({ ...prev, activeType: type }));
          navigate('/planner');
        }}
      />
    </div>
  );
}
