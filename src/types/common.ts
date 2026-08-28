export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral" | "violet" | "gold";

export interface SelectOption<T = string> {
  label: string;
  value: T;
}
