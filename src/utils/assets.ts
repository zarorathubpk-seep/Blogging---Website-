// Centralized reliable image asset registry with Vite imports
import heroWorkspace from '../assets/images/hero_planner_workspace_1791414654531.jpg';
import completeCollection from '../assets/images/complete_planner_collection_1791663700296.jpg';
import weeklyDaily from '../assets/images/weekly_daily_planning_1791414675220.jpg';
import budgetPlan from '../assets/images/budget_financial_plan_1791414691755.jpg';
import officeWork from '../assets/images/office_deep_work_1791414707674.jpg';
import sundayReview from '../assets/images/sunday_weekly_review_1791414720014.jpg';
import studentStudy from '../assets/images/student_study_planner_1791663718865.jpg';
import mealGrocery from '../assets/images/meal_grocery_kitchen_planner_1791663738668.jpg';

export const ASSET_IMAGES = {
  heroWorkspace,
  completeCollection,
  weeklyDaily,
  budgetPlan,
  officeWork,
  sundayReview,
  studentStudy,
  mealGrocery,
};

export const PLANNER_PREVIEW_IMAGES: Record<string, string> = {
  weekly: weeklyDaily,
  daily: completeCollection,
  budget: budgetPlan,
  office: officeWork,
  project: heroWorkspace,
  study: studentStudy,
  meal: mealGrocery,
  habit: sundayReview,
};

export function resolveArticleImage(slug?: string, customUrl?: string): string {
  if (customUrl && customUrl.trim().length > 0) {
    // If it's one of the known paths or valid URL, resolve it
    if (customUrl.includes('budget_financial_plan')) return budgetPlan;
    if (customUrl.includes('weekly_daily_planning')) return weeklyDaily;
    if (customUrl.includes('office_deep_work')) return officeWork;
    if (customUrl.includes('sunday_weekly_review')) return sundayReview;
    if (customUrl.includes('student_study')) return studentStudy;
    if (customUrl.includes('meal_grocery')) return mealGrocery;
    if (customUrl.includes('complete_planner')) return completeCollection;
    if (customUrl.includes('hero_planner_workspace')) return heroWorkspace;
    return customUrl;
  }

  switch (slug) {
    case 'how-to-plan-your-week-in-15-minutes':
      return heroWorkspace;
    case 'weekly-planner-or-daily-planner':
      return weeklyDaily;
    case 'a-simple-budget-planner-the-50-30-20-walkthrough':
      return budgetPlan;
    case 'how-to-build-an-office-work-plan-that-survives-a-busy-week':
      return officeWork;
    case 'why-plans-fail-and-how-to-restart-without-guilt':
      return sundayReview;
    case 'a-10-minute-weekly-review-routine':
      return completeCollection;
    default:
      return heroWorkspace;
  }
}
