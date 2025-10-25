export type GiftResponse = {
  title: string;
  description: string;
  coins: number;
  expires_at: string | null;
  image_url: string;
  is_active: boolean;
};

export type TaskAssignmentResponse = {
  task_id: number;
  name: string;
  description: string;
  reward: number;
  icon: string;
  is_completed: boolean;
};

export type QuizResponse = {
  question: string;
  answers: string[];
  correct_answer_index: number;
  round_number: number;
  total_rounds: number;
};

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

export type SimulationConfigResponse = {
  cost: number;
  description: string;
};

export type SimulationStartResponse = {
  detail: string;
  balance: number;
  cost: number;
};
