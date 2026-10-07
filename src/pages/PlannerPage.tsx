import React, { useState } from 'react';
import {
  PlannerType,
  StoredPlannerState,
  Currency,
} from '../types/planner';
import { Article } from '../types/article';
import { HeroSection } from '../components/HeroSection';
import { HowItWorks } from '../components/HowItWorks';
import { PlannerTypeCards } from '../components/PlannerTypeCards';
import { PlannerActionToolbar } from '../components/PlannerActionToolbar';
import { ToolTipsBox } from '../components/ToolTipsBox';
import { BlogSidebar } from '../components/BlogSidebar';
import { FaqSection } from '../components/FaqSection';
import { AuthorBox } from '../components/AuthorBox';

// Individual views
import { WeeklyPlannerView } from '../components/planners/WeeklyPlannerView';
import { DailyPlannerView } from '../components/planners/DailyPlannerView';
import { BudgetPlannerView } from '../components/planners/BudgetPlannerView';
import { OfficeWorkPlannerView } from '../components/planners/OfficeWorkPlannerView';
import { ProjectPlannerView } from '../components/planners/ProjectPlannerView';
import { StudyPlannerView } from '../components/planners/StudyPlannerView';
import { MealGroceryPlannerView } from '../components/planners/MealGroceryPlannerView';
import { HabitGoalPlannerView } from '../components/planners/HabitGoalPlannerView';

interface PlannerPageProps {
  state: StoredPlannerState;
  onUpdateState: (updated: StoredPlannerState) => void;
  onResetPlanner: (all?: boolean) => void;
  articles: Article[];
  onSelectArticle: (slug: string) => void;
}

export const PlannerPage: React.FC<PlannerPageProps> = ({
  state,
  onUpdateState,
  onResetPlanner,
  articles,
  onSelectArticle,
}) => {
  const [activeType, setActiveType] = useState<PlannerType>(state.activeType || 'weekly');

  const handleSelectType = (type: PlannerType) => {
    setActiveType(type);
    onUpdateState({ ...state, activeType: type });
  };

  const handleCurrencyChange = (currency: Currency) => {
    onUpdateState({
      ...state,
      currency,
      budget: { ...state.budget, currency },
    });
  };

  const lastSavedFormatted = new Date(state.lastUpdated || Date.now()).toLocaleTimeString(
    [],
    { hour: '2-digit', minute: '2-digit' }
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. How it works (3 steps) */}
      <HowItWorks />

      {/* Main Interactive Section */}
      <main id="planner-tool-section" className="py-8 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Planner Type Cards */}
        <PlannerTypeCards activeType={activeType} onSelectType={handleSelectType} />

        {/* 2-Column Responsive Layout: 65% Tool / 35% Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Planner Generator Tool (~65% width) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Toolbar Buttons: Print, PDF, Image, Reset */}
            <PlannerActionToolbar
              plannerType={activeType}
              onReset={onResetPlanner}
              lastSavedText={lastSavedFormatted}
            />

            {/* Printable & Interactive Planner Canvas */}
            <div
              id="planner-print-container"
              className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-8 shadow-sm transition-all"
            >
              {activeType === 'weekly' && (
                <WeeklyPlannerView
                  data={state.weekly}
                  onChange={(updated) => onUpdateState({ ...state, weekly: updated })}
                />
              )}

              {activeType === 'daily' && (
                <DailyPlannerView
                  data={state.daily}
                  onChange={(updated) => onUpdateState({ ...state, daily: updated })}
                />
              )}

              {activeType === 'budget' && (
                <BudgetPlannerView
                  data={state.budget}
                  onChange={(updated) => onUpdateState({ ...state, budget: updated })}
                  currentCurrency={state.currency}
                  onCurrencyChange={handleCurrencyChange}
                />
              )}

              {activeType === 'office' && (
                <OfficeWorkPlannerView
                  data={state.office}
                  onChange={(updated) => onUpdateState({ ...state, office: updated })}
                />
              )}

              {activeType === 'project' && (
                <ProjectPlannerView
                  data={state.project}
                  onChange={(updated) => onUpdateState({ ...state, project: updated })}
                />
              )}

              {activeType === 'study' && (
                <StudyPlannerView
                  data={state.study}
                  onChange={(updated) => onUpdateState({ ...state, study: updated })}
                />
              )}

              {activeType === 'meal' && (
                <MealGroceryPlannerView
                  data={state.meal}
                  onChange={(updated) => onUpdateState({ ...state, meal: updated })}
                />
              )}

              {activeType === 'habit' && (
                <HabitGoalPlannerView
                  data={state.habit}
                  onChange={(updated) => onUpdateState({ ...state, habit: updated })}
                />
              )}
            </div>

            {/* Tool Tips (small text under the tool) */}
            <ToolTipsBox />
          </div>

          {/* Right Column: Blog Sidebar (~35% width on desktop, below on mobile) */}
          <div className="lg:col-span-4">
            <BlogSidebar
              articles={articles}
              onSelectArticle={onSelectArticle}
              onSelectPlannerType={handleSelectType}
              activeType={activeType}
            />
          </div>
        </div>

        {/* Author Box under tool */}
        <div className="mt-12 max-w-4xl mx-auto">
          <AuthorBox />
        </div>
      </main>

      {/* FAQ Section */}
      <FaqSection />
    </div>
  );
};
