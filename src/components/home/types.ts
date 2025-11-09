export type HomeModalType = "" | "prize" | "reward" | "rules" | "rule_category" | "user";

export interface RuleCategory {
  id: number;
  text: string;
  rule: string;
  icon?: string | null;
}
