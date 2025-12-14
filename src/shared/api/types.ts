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
  id: number;
  question_text: string; // поле обновлено под актуальную модель
  answers: string[];
  correct_answer_index: number;
  reward: number;
};

// --- Leaderboard ---
export type LeaderboardEntryResponse = {
  position: number;
  username: string;
  first_name: string;
  last_name: string;
  score: number;
  achieved_at?: string | null; // ← новое поле
  display_time?: string; // фронтовая вспомогательная строка HH:MM
};

export type LeaderboardResponse = {
  entries: LeaderboardEntryResponse[];
  current_user: LeaderboardEntryResponse | null;
  failure: FailureResponse | null;
};

// --- Simulation ---
export type SimulationConfigResponse = {
  attempt_cost: number;
  reward_level_1: number;
  reward_level_2: number;
  reward_level_3: number;
  description: string;
  reward_threshold_1: number;
  reward_amount_1: number;
  reward_threshold_2: number;
  reward_amount_2: number;
  reward_threshold_3: number;
  reward_amount_3: number;
};

export type SimulationStartResponse = {
  detail: string;
  balance: number;
  cost: number;
  duration_seconds: number;
  reward_threshold_1: number;
  reward_amount_1: number;
  reward_threshold_2: number;
  reward_amount_2: number;
  reward_threshold_3: number;
  reward_amount_3: number;
};

export type SimulationAdRewardResponse = {
  detail: string;
  balance: number;
  reward: number;
};

export type SimulationRewardClaimResponse = {
  detail: string;
  threshold: number;
  reward: number;
  balance: number;
};

// --- Adsgram ---
export type AdsgramBlockResponse = {
  block_id: string;
};

export type AdsgramAssignmentResponse = {
  assignment_id: string;
  placement_id: string | null;
  status: "requested" | "completed" | "failed";
  payload: Record<string, unknown> | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  user_id: number | null;
};

// --- Rules ---
export type RuleCategoryResponse = {
  id: number;
  category: string;
  rule_text: string;
  icon: string | null;
};

// --- Daily rewards ---
export type DailyRewardResponse = {
  day_number: number;
  reward_amount: number;
};

export type DailyRewardConfigResponse = {
  rewards: DailyRewardResponse[];
  streak: number;
  last_claim_date: string | null;
  today_claimed: boolean;
  next_day: number;
  current_day: number;
};

export type DailyRewardClaimEntry = {
  day_number: number;
  reward_amount: number;
  sequence_day: number;
  claimed_for_date: string;
  claimed_at: string;
};

export type DailyRewardClaimResponse = {
  detail: string;
  claim: DailyRewardClaimEntry;
  balance: number;
  streak: number;
  next_day: number;
  current_day: number;
};

// --- Failures (Сбои) ---
export type FailureBonusType = "x2" | "x5" | "x10" | "freeze" | "no_bombs";

export type FailureResponse = {
  id: number;
  name: string;
  start_time: string | null;
  end_time: string | null;
  is_active: boolean;
  is_completed: boolean;
  duration_seconds: number;
  attempt_cost: number;
  shop_enabled: boolean;
  bombs_min_count: number;
  bombs_max_count: number;
  max_bonuses_per_run: number;
  bonus_prices: Record<FailureBonusType, number>;
  main_prize_title?: string | null;
  main_prize_image?: string | null;
};

export type FailureStartResponse = {
  detail: string;
  failure: FailureResponse;
  duration_seconds: number;
  bombs_min_count: number;
  bombs_max_count: number;
  max_bonuses_per_run: number;
  purchased_bonuses: FailureBonusType[];
  bonus_prices: Record<FailureBonusType, number>;
  attempt_cost: number;
  balance: number;
};

export type FailureCompleteResponse = {
  detail: string;
  score: number;
  failure: FailureResponse;
};

export type FailureBonusPurchaseResponse = {
  detail: string;
  bonus_type: FailureBonusType;
  purchased_bonuses: FailureBonusType[];
  balance: number;
  max_bonuses_per_run: number;
};

// --- Advertisements ---
export type AdvertisementButtonResponse = {
  id: number;
  title: string;
  link: string;
  order: number;
  image: string | null;
  reward_amount: number;
  available_claims: number;
};

export type AdvertisementButtonClaimResponse = {
  detail: string;
  reward: number;
  balance: number;
};

// --- Frontend config ---
export type FrontendConfigResponse = {
  screen_texture: string | null;
};

// --- Scores ---
export type ScoreEntryResponse = {
  points: number;
  duration_seconds: number;
  earned_at: string;
  failure_id: number | null;
  failure_name: string | null;
};
