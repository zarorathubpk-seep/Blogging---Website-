import { useState, useEffect, useCallback } from 'react';
import { loadPlannerState, savePlannerState, resetPlannerState } from './utils/storage';
import { StoredPlannerState, Currency, PlannerType } from './types/planner';
import { Article } from './types/article';
import { INITIAL_ARTICLES } from './data/defaultArticles';
import { subscribeArticles } from './services/articleService';
import { updatePageSeo } from './utils/seo';

// Components & Pages
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { PlannerPage } from './pages/PlannerPage';
import { BlogListPage } from './pages/BlogListPage';
import { ArticlePage } from './pages/ArticlePage';
import { AdminPage } from './pages/AdminPage';
import { SitemapPage } from './pages/SitemapPage';

export default function App() {
  const [plannerState, setPlannerState] = useState<StoredPlannerState>(() => loadPlannerState());
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const path = window.location.pathname;
    return path === '/' || path === '' ? '/planner' : path;
  });

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

  const handleResetPlanner = useCallback((allPlanners?: boolean) => {
    if (allPlanners) {
      const resetAll = resetPlannerState();
      setPlannerState(resetAll);
    } else {
      const resetCurrent = resetPlannerState(plannerState.activeType);
      setPlannerState(resetCurrent);
    }
  }, [plannerState.activeType]);

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
      setCurrentPath(path === '/' || path === '' ? '/planner' : path);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Update dynamic SEO on path change
  useEffect(() => {
    if (currentPath === '/planner' || currentPath === '/') {
      updatePageSeo({
        title: 'Free Weekly Planner Generator | Zarorat Hub',
        description:
          'Build a free weekly, budget, work, study, or project planner in seconds. Customize it, print it, or save it as a PDF.',
      });
    } else if (currentPath === '/blog') {
      updatePageSeo({
        title: 'Planner Blog & Productivity Guides | Zarorat Hub',
        description:
          'Practical guides on weekly planning, the 50/30/20 budget method, office work schedules, and Sunday review routines.',
      });
    } else if (currentPath.startsWith('/blog/')) {
      const slug = currentPath.replace('/blog/', '');
      const found = articles.find((a) => a.slug === slug);
      if (found) {
        updatePageSeo({
          title: `${found.title} | Zarorat Hub`,
          description: found.subtitle || found.title,
        });
      }
    } else if (currentPath === '/sitemap') {
      updatePageSeo({
        title: 'HTML Sitemap | Zarorat Hub Planner Hub',
        description:
          'Directory of free planner generators, budgeting sheets, and productivity articles.',
      });
    } else if (currentPath === '/admin') {
      updatePageSeo({
        title: 'Admin Console | Zarorat Hub',
        description: 'Manage articles and sync data in Firestore.',
      });
    }
  }, [currentPath, articles]);

  // Route matching
  const renderCurrentView = () => {
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

    if (currentPath === '/blog') {
      return (
        <BlogListPage
          articles={articles}
          onSelectArticle={(s) => navigate(`/blog/${s}`)}
          onNavigate={navigate}
        />
      );
    }

    if (currentPath === '/admin') {
      return (
        <AdminPage
          articles={articles}
          onRefreshArticles={() => {}}
          onNavigate={navigate}
        />
      );
    }

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

    // Default: Planner page (/planner or /)
    return (
      <PlannerPage
        state={plannerState}
        onUpdateState={handleUpdatePlannerState}
        onResetPlanner={handleResetPlanner}
        articles={articles}
        onSelectArticle={(slug) => navigate(`/blog/${slug}`)}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <Header
        currentPath={currentPath}
        onNavigate={navigate}
        currency={plannerState.currency}
        onCurrencyChange={handleCurrencyChange}
      />

      <div className="flex-1">{renderCurrentView()}</div>

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
