import { StoredPlannerState, PlannerType, Currency } from '../types/planner';
import { DEFAULT_PLANNER_STATE } from '../data/defaultPlanners';

const STORAGE_KEY = 'zarorat_hub_planner_data_v1';

export function loadPlannerState(): StoredPlannerState {
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    if (!item) return DEFAULT_PLANNER_STATE;
    const parsed = JSON.parse(item);
    return {
      ...DEFAULT_PLANNER_STATE,
      ...parsed,
      weekly: { ...DEFAULT_PLANNER_STATE.weekly, ...(parsed.weekly || {}) },
      daily: { ...DEFAULT_PLANNER_STATE.daily, ...(parsed.daily || {}) },
      budget: { ...DEFAULT_PLANNER_STATE.budget, ...(parsed.budget || {}) },
      office: { ...DEFAULT_PLANNER_STATE.office, ...(parsed.office || {}) },
      project: { ...DEFAULT_PLANNER_STATE.project, ...(parsed.project || {}) },
      study: { ...DEFAULT_PLANNER_STATE.study, ...(parsed.study || {}) },
      meal: { ...DEFAULT_PLANNER_STATE.meal, ...(parsed.meal || {}) },
      habit: { ...DEFAULT_PLANNER_STATE.habit, ...(parsed.habit || {}) },
    };
  } catch (err) {
    console.error('Failed to load saved planner state from localStorage:', err);
    return DEFAULT_PLANNER_STATE;
  }
}

export function savePlannerState(state: StoredPlannerState): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...state,
        lastUpdated: new Date().toISOString(),
      })
    );
  } catch (err) {
    console.error('Failed to persist planner state to localStorage:', err);
  }
}

export function resetPlannerState(plannerType?: PlannerType): StoredPlannerState {
  if (!plannerType) {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    return DEFAULT_PLANNER_STATE;
  }

  const current = loadPlannerState();
  const updated: StoredPlannerState = {
    ...current,
    [plannerType]: DEFAULT_PLANNER_STATE[plannerType],
  };
  savePlannerState(updated);
  return updated;
}
