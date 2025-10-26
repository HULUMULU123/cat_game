// --- Gifts ---
export type GiftResponse = {
  title: string;
  description: string;
  coins: number;
  expires_at: string | null;
  image_url: string;
  is_active: boolean;
};

// --- Tasks ---
export type TaskAssignmentResponse = {
  task_id: number;
  name: string;
  description: string;
  reward: number;
  icon: string | null;
  link: string | null; // добавлено поле со ссылкой на задание
  is_completed: boolean;
};

// --- Quiz ---
export type QuizResponse = {
  question_text: string; // поле обновлено под актуальную модель
  answers: string[];
  correct_answer_index: number;
};

// --- Leaderboard ---
export type LeaderboardEntryResponse = {
  position: number;
  username: string;
  first_name: string;
  last_name: string;
  score: number;
  duration_seconds: number;
};

export type LeaderboardResponse = {
  entries: LeaderboardEntryResponse[];
  current_user: LeaderboardEntryResponse | null;
};

// --- Simulation ---
export type SimulationConfigResponse = {
  attempt_cost: number;
  reward_level_1: number;
  reward_level_2: number;
  reward_level_3: number;
  description: string;
};

export type SimulationStartResponse = {
  detail: string;
  balance: number;
  cost: number;
};

// --- Rules ---
export type RuleCategoryResponse = {
  id: number;
  category: string;
  rule_text: string;
};

// --- Daily rewards ---
export type DailyRewardResponse = {
  day_number: number;
  reward_amount: number;
};

export type DailyRewardClaimResponse = {
  day_number: number;
  reward_amount: number;
  claimed_at: string;
  balance?: number;
};

// --- Failures (Сбои) ---
export type FailureResponse = {
  id: number;
  name: string;
  start_time: string | null;
  end_time: string | null;
};

// --- Scores ---
export type ScoreEntryResponse = {
  points: number;
  duration_seconds: number;
  earned_at: string;
  failure_id: number | null;
  failure_name: string | null;
};
