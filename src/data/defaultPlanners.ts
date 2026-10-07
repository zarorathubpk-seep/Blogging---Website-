import {
  WeeklyPlannerData,
  DailyPlannerData,
  BudgetPlannerData,
  OfficeWorkPlannerData,
  ProjectPlannerData,
  StudyPlannerData,
  MealGroceryPlannerData,
  HabitGoalPlannerData,
  StoredPlannerState,
} from '../types/planner';

export const DEFAULT_WEEKLY_PLANNER: WeeklyPlannerData = {
  title: 'Weekly Focus & Execution',
  weekOf: 'Current Week',
  topPriorities: [
    { id: 'wp-1', text: 'Finalize quarterly objectives and roadmap presentation', done: false },
    { id: 'wp-2', text: 'Complete weekly budget audit and utility payments', done: false },
    { id: 'wp-3', text: 'Block 3 x 45-minute gym or outdoor running sessions', done: true },
  ],
  days: [
    {
      dayName: 'Monday',
      tasks: [
        { id: 'm-1', text: 'Review inbox & align priorities for the week', done: true },
        { id: 'm-2', text: 'Team kickoff synchronization call (10:00 AM)', done: true },
        { id: 'm-3', text: 'Deep work on core project deliverable', done: false },
      ],
    },
    {
      dayName: 'Tuesday',
      tasks: [
        { id: 'tu-1', text: 'Draft specification documents and review feedback', done: false },
        { id: 'tu-2', text: 'Client follow-up and schedule review', done: false },
      ],
    },
    {
      dayName: 'Wednesday',
      tasks: [
        { id: 'w-1', text: 'Mid-week progress evaluation and blocker removal', done: false },
        { id: 'w-2', text: 'Financial check-in and receipt organization', done: false },
      ],
    },
    {
      dayName: 'Thursday',
      tasks: [
        { id: 'th-1', text: 'Focus time: Finish slide deck and documentation', done: false },
        { id: 'th-2', text: 'Send deliverables for internal review', done: false },
      ],
    },
    {
      dayName: 'Friday',
      tasks: [
        { id: 'f-1', text: 'Wrap up pending email correspondence', done: false },
        { id: 'f-2', text: 'Run 10-minute weekly shutdown and clear desktop', done: false },
      ],
    },
    {
      dayName: 'Saturday',
      tasks: [
        { id: 'sa-1', text: 'Grocery shopping & meal prep for upcoming days', done: false },
        { id: 'sa-2', text: 'Outdoor recreation, family walk, or leisure reading', done: false },
      ],
    },
    {
      dayName: 'Sunday',
      tasks: [
        { id: 'su-1', text: 'Perform 10-minute Sunday weekly review routine', done: false },
        { id: 'su-2', text: 'Set top three priorities for Monday morning', done: false },
      ],
    },
  ],
  notes: 'Rule of thumb: Protect open time blocks on Wednesday & Friday afternoons for unexpected requests.',
  weeklyHabit: '10-minute shutdown at end of workday without checking email after 6:00 PM',
};

export const DEFAULT_DAILY_PLANNER: DailyPlannerData = {
  title: "Today's High-Impact Plan",
  dateStr: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
  focusGoal: 'Complete the project milestone draft and send to review team',
  timeBlocks: [
    { id: 'tb-1', time: '08:30 AM - 09:00 AM', activity: 'Morning coffee, review plan & quick inbox sweep', done: true },
    { id: 'tb-2', time: '09:00 AM - 11:30 AM', activity: 'Deep Work: Project milestone draft (No distractions)', done: true },
    { id: 'tb-3', time: '11:30 AM - 12:30 PM', activity: 'Team sync meeting & stakeholder updates', done: false },
    { id: 'tb-4', time: '12:30 PM - 01:30 PM', activity: 'Healthy lunch & 20-minute restorative walk', done: false },
    { id: 'tb-5', time: '01:30 PM - 03:30 PM', activity: 'Secondary tasks, communications, and revisions', done: false },
    { id: 'tb-6', time: '04:30 PM - 05:00 PM', activity: 'Day-end 2-minute shutdown & tomorrow prep', done: false },
  ],
  todoList: [
    { id: 'td-1', text: 'Reply to accountant regarding Q3 invoice', done: true },
    { id: 'td-2', text: 'Review pull request & submit approval', done: false },
    { id: 'td-3', text: 'Schedule dentist appointment', done: false },
    { id: 'td-4', text: 'Hydrate: Drink 8 glasses of water', done: false },
  ],
  dailyWins: [
    { id: 'dw-1', text: 'Finished high-focus session before 11:30 AM without opening social media', done: true },
    { id: 'dw-2', text: 'Kept meetings strictly under 30 minutes', done: false },
  ],
  waterGlasses: 5,
  notes: 'Energy is highest between 9:00 and 11:30 AM. Save admin tasks for the mid-afternoon dip.',
};

export const DEFAULT_BUDGET_PLANNER: BudgetPlannerData = {
  title: 'Monthly Cash Flow & Savings Plan',
  monthYear: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  currency: 'USD',
  income: [
    { id: 'inc-1', category: 'Salary', name: 'Primary Take-Home Pay (After Tax)', planned: 3200, actual: 3200 },
    { id: 'inc-2', category: 'Side Work', name: 'Freelance & Consulting Work', planned: 600, actual: 650 },
  ],
  fixedBills: [
    { id: 'fb-1', category: 'Housing', name: 'Rent / Mortgage Payment', planned: 1200, actual: 1200 },
    { id: 'fb-2', category: 'Utilities', name: 'Electricity, Gas & Water', planned: 160, actual: 155 },
    { id: 'fb-3', category: 'Food', name: 'Essential Groceries & Household Essentials', planned: 450, actual: 440 },
    { id: 'fb-4', category: 'Connectivity', name: 'Home Internet & Mobile Phone', planned: 95, actual: 95 },
    { id: 'fb-5', category: 'Transit', name: 'Commuter Rail / Fuel / Insurance', planned: 180, actual: 175 },
  ],
  spendingWants: [
    { id: 'sw-1', category: 'Dining Out', name: 'Cafes, Takeout & Weekend Dinners', planned: 250, actual: 230 },
    { id: 'sw-2', category: 'Entertainment', name: 'Streaming Services & Music', planned: 45, actual: 45 },
    { id: 'sw-3', category: 'Personal', name: 'Clothing, Books & Hobbies', planned: 150, actual: 120 },
    { id: 'sw-4', category: 'Social', name: 'Gifts & Weekend Activities', planned: 120, actual: 110 },
  ],
  savingsGoals: [
    { id: 'sg-1', category: 'Emergency Fund', name: 'High-Yield Savings Contribution', planned: 450, actual: 450 },
    { id: 'sg-2', category: 'Investing', name: 'Retirement / Index Fund Transfer', planned: 350, actual: 350 },
    { id: 'sg-3', category: 'Holiday Fund', name: 'Travel & Summer Holiday Pot', planned: 150, actual: 150 },
  ],
  notes: 'Apply the 50/30/20 guideline: aim for ~50% Needs, ~30% Wants, ~20% Savings. Adjust if living in high-cost areas.',
};

export const DEFAULT_OFFICE_PLANNER: OfficeWorkPlannerData = {
  title: 'Weekly Office & Workload Blueprint',
  weekOf: 'Current Work Week',
  threeOutcomes: [
    { id: 'oo-1', text: 'Outcome 1: Deliver revised client roadmap with executive sign-off', done: false },
    { id: 'oo-2', text: 'Outcome 2: Finalize department hiring job description and post listing', done: true },
    { id: 'oo-3', text: 'Outcome 3: Clear all pending follow-ups and unblock design sprint', done: false },
  ],
  schedule: [
    {
      id: 'os-1',
      day: 'Monday',
      topTask: 'Review weekly KPIs & align with engineering leads',
      meetings: '10:00 AM All-Hands, 2:00 PM Standup',
      focusBlock: '08:30 AM - 10:00 AM (Sprint prep)',
      done: true,
    },
    {
      id: 'os-2',
      day: 'Tuesday',
      topTask: 'Draft Q4 resource budget and headcount model',
      meetings: '1:30 PM Finance review call',
      focusBlock: '10:00 AM - 12:30 PM (Financial modeling)',
      done: false,
    },
    {
      id: 'os-3',
      day: 'Wednesday',
      topTask: 'Execute cross-team stakeholder alignment session',
      meetings: '11:00 AM Product demo, 3:00 PM Sync',
      focusBlock: '01:00 PM - 03:00 PM (Slide deck polish)',
      done: false,
    },
    {
      id: 'os-4',
      day: 'Thursday',
      topTask: 'Conduct one-on-ones and provide strategic feedback',
      meetings: '10:00 AM 1-on-1, 11:30 AM 1-on-1, 2:00 PM HR',
      focusBlock: '03:30 PM - 05:00 PM (Documentation review)',
      done: false,
    },
    {
      id: 'os-5',
      day: 'Friday',
      topTask: 'Publish weekly executive summary and schedule next week',
      meetings: '04:00 PM Team social / retrospective',
      focusBlock: '09:00 AM - 11:00 AM (Weekly wrap-up)',
      done: false,
    },
  ],
  followUps: [
    {
      id: 'fu-1',
      waitingOn: 'Final copy approval for marketing landing page',
      contactPerson: 'Sarah Jenkins (Brand Lead)',
      checkBackDate: 'Thursday 10:00 AM',
      resolved: false,
    },
    {
      id: 'fu-2',
      waitingOn: 'Security compliance sign-off for new vendor API',
      contactPerson: 'David Miller (InfoSec)',
      checkBackDate: 'Wednesday 2:00 PM',
      resolved: true,
    },
  ],
  shutdownRoutine: [
    { id: 'sdr-1', text: 'Clear desktop and close unused browser tabs', done: true },
    { id: 'sdr-2', text: 'Log today\'s completed deliverables and log hours', done: true },
    { id: 'sdr-3', text: 'Write tomorrow\'s top three tasks before shutting laptop', done: false },
  ],
  notes: 'Group emails into two 30-minute processing blocks (11:00 AM and 4:30 PM) instead of watching inbox all day.',
};

export const DEFAULT_PROJECT_PLANNER: ProjectPlannerData = {
  projectName: 'Customer Portal Redesign & Launch',
  projectLead: 'Project Manager',
  targetLaunchDate: 'November 15, 2026',
  objective: 'Modernize user onboarding, improve self-service navigation, and increase completion rate by 25%.',
  tasks: [
    {
      id: 'pt-1',
      task: 'User journey mapping & friction point analysis',
      owner: 'UX Team',
      deadline: 'Oct 12',
      status: 'Done',
      priority: 'High',
    },
    {
      id: 'pt-2',
      task: 'Figma wireframes & component library handoff',
      owner: 'Product Design',
      deadline: 'Oct 19',
      status: 'In Progress',
      priority: 'High',
    },
    {
      id: 'pt-3',
      task: 'Frontend component migration and responsive testing',
      owner: 'Lead Frontend Dev',
      deadline: 'Oct 28',
      status: 'Not Started',
      priority: 'High',
    },
    {
      id: 'pt-4',
      task: 'Payment gateway webhooks & authentication verification',
      owner: 'Backend Team',
      deadline: 'Nov 02',
      status: 'Not Started',
      priority: 'Medium',
    },
    {
      id: 'pt-5',
      task: 'Quality assurance, cross-browser validation & accessibility check',
      owner: 'QA Engineer',
      deadline: 'Nov 08',
      status: 'Not Started',
      priority: 'High',
    },
  ],
  milestones: [
    { id: 'pm-1', text: 'Phase 1: Design sign-off and stakeholder presentation', done: true },
    { id: 'pm-2', text: 'Phase 2: Code freeze and staging deployment', done: false },
    { id: 'pm-3', text: 'Phase 3: Beta customer rollout & analytics verification', done: false },
  ],
  notes: 'Weekly status check-in every Tuesday at 11:00 AM. Escalate blockers directly to project lead.',
};

export const DEFAULT_STUDY_PLANNER: StudyPlannerData = {
  title: 'Semester Revision & Exam Schedule',
  termOrWeek: 'Fall Term Revision Period',
  examDates: [
    { id: 'ed-1', subject: 'Business Statistics', date: 'Oct 24, 2026', location: 'Hall B / Online', targetGrade: 'A' },
    { id: 'ed-2', subject: 'Microeconomics', date: 'Oct 31, 2026', location: 'Lecture Room 4', targetGrade: 'A-' },
    { id: 'ed-3', subject: 'Financial Accounting', date: 'Nov 08, 2026', location: 'Hall A', targetGrade: 'A' },
  ],
  studySessions: [
    { id: 'ss-1', subject: 'Business Statistics', topic: 'Hypothesis testing & regression models', scheduledTime: 'Mon 02:00 PM', durationMinutes: 90, completed: true },
    { id: 'ss-2', subject: 'Microeconomics', topic: 'Market elasticity & consumer surplus curves', scheduledTime: 'Tue 10:00 AM', durationMinutes: 60, completed: true },
    { id: 'ss-3', subject: 'Financial Accounting', topic: 'Cash flow statements & depreciation methods', scheduledTime: 'Wed 03:00 PM', durationMinutes: 90, completed: false },
    { id: 'ss-4', subject: 'Business Statistics', topic: 'Past paper 2025 timed mock trial', scheduledTime: 'Thu 01:00 PM', durationMinutes: 120, completed: false },
  ],
  revisionChecklist: [
    { id: 'rc-1', text: 'Create one-page summary cheat-sheet for Statistics formulas', done: true },
    { id: 'rc-2', text: 'Complete 30 practice problems on Microeconomics elasticity', done: false },
    { id: 'rc-3', text: 'Review flashcards on Accounting terminology and balance sheet ratios', done: false },
  ],
  studyTipsNotes: 'Use the Pomodoro technique (25 min study / 5 min break). Review hardest concepts first in morning sessions.',
};

export const DEFAULT_MEAL_PLANNER: MealGroceryPlannerData = {
  title: 'Weekly Meal Plan & Smart Grocery List',
  weekOf: 'Current Week',
  meals: [
    { id: 'mp-1', day: 'Monday', breakfast: 'Greek yogurt with berries & honey', lunch: 'Quinoa bowl with chickpeas & feta', dinner: 'Grilled salmon with roasted asparagus', snacks: 'Almonds & apple slices' },
    { id: 'mp-2', day: 'Tuesday', breakfast: 'Overnight oats with chia & banana', lunch: 'Salmon leftovers with green salad', dinner: 'Turkey chili with sweet potatoes', snacks: 'Hummus & carrot sticks' },
    { id: 'mp-3', day: 'Wednesday', breakfast: 'Scrambled eggs with whole grain toast', lunch: 'Turkey chili with wholemeal wrap', dinner: 'Stir-fry tofu with broccoli & brown rice', snacks: 'Rice cakes with peanut butter' },
    { id: 'mp-4', day: 'Thursday', breakfast: 'Berry smoothie with protein powder', lunch: 'Tofu stir-fry bowl', dinner: 'Herb-roasted chicken with vegetables', snacks: 'Mixed walnuts' },
    { id: 'mp-5', day: 'Friday', breakfast: 'Avocado toast with poached egg', lunch: 'Chicken salad with olive oil', dinner: 'Homemade sourdough pizza with fresh salad', snacks: 'Dark chocolate square' },
    { id: 'mp-6', day: 'Saturday', breakfast: 'Pancakes with blueberries & maple', lunch: 'Mediterranean mezze plate', dinner: 'Slow-cooked beef stew or pasta', snacks: 'Fresh oranges' },
    { id: 'mp-7', day: 'Sunday', breakfast: 'Poached eggs & grilled mushrooms', lunch: 'Hearty vegetable soup', dinner: 'Light soup & salad prep night', snacks: 'Greek yogurt' },
  ],
  groceries: [
    { id: 'gi-1', name: 'Fresh blueberries, bananas, apples', category: 'Produce', quantity: '1 pack each', done: true },
    { id: 'gi-2', name: 'Broccoli, asparagus, carrots, spinach', category: 'Produce', quantity: 'Weekly bunch', done: true },
    { id: 'gi-3', name: 'Fresh salmon fillets & chicken breasts', category: 'Protein', quantity: '4 servings each', done: false },
    { id: 'gi-4', name: 'Lean ground turkey & firm tofu', category: 'Protein', quantity: '500g / 1 block', done: false },
    { id: 'gi-5', name: 'Quinoa, brown rice, rolled oats, chia seeds', category: 'Pantry', quantity: 'Pantry refill', done: false },
    { id: 'gi-6', name: 'Greek yogurt & organic eggs (dozen)', category: 'Dairy & Chilled', quantity: '2 tubs / 1 dozen', done: true },
    { id: 'gi-7', name: 'Whole grain sourdough bread', category: 'Bakery', quantity: '1 loaf', done: false },
  ],
  prepNotes: 'Roast asparagus and sweet potatoes together on Sunday afternoon to save weekday cooking time.',
};

export const DEFAULT_HABIT_PLANNER: HabitGoalPlannerData = {
  goalTitle: 'Establish a High-Energy Morning Routine & Daily Focus',
  timeframe: 'Next 30 Days',
  whyThisMatters: 'To start every workday feeling calm, clear, and focused rather than rushed and reactive.',
  actionSteps: [
    { id: 'as-1', text: 'Set phone on airplane mode across the room by 10:30 PM', done: true },
    { id: 'as-2', text: 'Drink 500ml water immediately upon waking before looking at screen', done: true },
    { id: 'as-3', text: 'Spend 10 minutes planning the day before opening email inbox', done: false },
    { id: 'as-4', text: 'Take a 20-minute brisk walk during mid-day break', done: false },
  ],
  habits: [
    { id: 'ht-1', habitName: 'No phone in bed before 7:00 AM', frequency: '7x/week', daysCompleted: [true, true, true, false, false, false, false] },
    { id: 'ht-2', habitName: 'Drink 2L of water throughout day', frequency: '7x/week', daysCompleted: [true, true, true, true, false, false, false] },
    { id: 'ht-3', habitName: '30 minutes deep work before meetings', frequency: '5x/week (M-F)', daysCompleted: [true, true, false, false, false, false, false] },
    { id: 'ht-4', habitName: '2-minute evening work shutdown', frequency: '5x/week (M-F)', daysCompleted: [true, true, true, false, false, false, false] },
    { id: 'ht-5', habitName: 'Read 15 pages of non-fiction book', frequency: '6x/week', daysCompleted: [true, false, true, false, false, false, false] },
  ],
  weeklyReflection: 'Celebrate restarting when you slip. Missing one day is normal; not letting it turn into two missed days is the real skill.',
};

export const DEFAULT_PLANNER_STATE: StoredPlannerState = {
  weekly: DEFAULT_WEEKLY_PLANNER,
  daily: DEFAULT_DAILY_PLANNER,
  budget: DEFAULT_BUDGET_PLANNER,
  office: DEFAULT_OFFICE_PLANNER,
  project: DEFAULT_PROJECT_PLANNER,
  study: DEFAULT_STUDY_PLANNER,
  meal: DEFAULT_MEAL_PLANNER,
  habit: DEFAULT_HABIT_PLANNER,
  activeType: 'weekly',
  currency: 'USD',
  lastUpdated: new Date().toISOString(),
};
