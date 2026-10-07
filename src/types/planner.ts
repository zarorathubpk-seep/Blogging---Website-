export type PlannerType =
  | 'weekly'
  | 'daily'
  | 'budget'
  | 'office'
  | 'project'
  | 'study'
  | 'meal'
  | 'habit';

export type Currency = 'USD' | 'GBP' | 'EUR';

export interface TaskItem {
  id: string;
  text: string;
  done: boolean;
  notes?: string;
  tag?: string;
}

export interface DayTasks {
  dayName: string;
  dateStr?: string;
  tasks: TaskItem[];
}

export interface WeeklyPlannerData {
  title: string;
  weekOf: string;
  topPriorities: TaskItem[];
  days: DayTasks[];
  notes: string;
  weeklyHabit: string;
}

export interface TimeBlock {
  id: string;
  time: string;
  activity: string;
  done: boolean;
}

export interface DailyPlannerData {
  title: string;
  dateStr: string;
  focusGoal: string;
  timeBlocks: TimeBlock[];
  todoList: TaskItem[];
  dailyWins: TaskItem[];
  waterGlasses: number;
  notes: string;
}

export interface BudgetItem {
  id: string;
  category: string;
  name: string;
  planned: number;
  actual: number;
}

export interface BudgetPlannerData {
  title: string;
  monthYear: string;
  currency: Currency;
  income: BudgetItem[];
  fixedBills: BudgetItem[];
  spendingWants: BudgetItem[];
  savingsGoals: BudgetItem[];
  notes: string;
}

export interface OfficeDayRow {
  id: string;
  day: string;
  topTask: string;
  meetings: string;
  focusBlock: string;
  done: boolean;
}

export interface OfficeFollowUpItem {
  id: string;
  waitingOn: string;
  contactPerson: string;
  checkBackDate: string;
  resolved: boolean;
}

export interface OfficeWorkPlannerData {
  title: string;
  weekOf: string;
  threeOutcomes: TaskItem[];
  schedule: OfficeDayRow[];
  followUps: OfficeFollowUpItem[];
  shutdownRoutine: TaskItem[];
  notes: string;
}

export interface ProjectTaskItem {
  id: string;
  task: string;
  owner: string;
  deadline: string;
  status: 'Not Started' | 'In Progress' | 'Review' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
}

export interface ProjectPlannerData {
  projectName: string;
  projectLead: string;
  targetLaunchDate: string;
  objective: string;
  tasks: ProjectTaskItem[];
  milestones: TaskItem[];
  notes: string;
}

export interface StudySessionItem {
  id: string;
  subject: string;
  topic: string;
  scheduledTime: string;
  durationMinutes: number;
  completed: boolean;
}

export interface ExamDateItem {
  id: string;
  subject: string;
  date: string;
  location: string;
  targetGrade?: string;
}

export interface StudyPlannerData {
  title: string;
  termOrWeek: string;
  examDates: ExamDateItem[];
  studySessions: StudySessionItem[];
  revisionChecklist: TaskItem[];
  studyTipsNotes: string;
}

export interface MealDayPlan {
  id: string;
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  category: 'Produce' | 'Protein' | 'Pantry' | 'Dairy & Chilled' | 'Bakery' | 'Other';
  quantity: string;
  done: boolean;
}

export interface MealGroceryPlannerData {
  title: string;
  weekOf: string;
  meals: MealDayPlan[];
  groceries: GroceryItem[];
  prepNotes: string;
}

export interface HabitTrackerItem {
  id: string;
  habitName: string;
  frequency: string;
  daysCompleted: boolean[]; // 7 days (Mon-Sun)
}

export interface HabitGoalPlannerData {
  goalTitle: string;
  timeframe: string;
  whyThisMatters: string;
  actionSteps: TaskItem[];
  habits: HabitTrackerItem[];
  weeklyReflection: string;
}

export interface StoredPlannerState {
  weekly: WeeklyPlannerData;
  daily: DailyPlannerData;
  budget: BudgetPlannerData;
  office: OfficeWorkPlannerData;
  project: ProjectPlannerData;
  study: StudyPlannerData;
  meal: MealGroceryPlannerData;
  habit: HabitGoalPlannerData;
  activeType: PlannerType;
  currency: Currency;
  lastUpdated: string;
}
