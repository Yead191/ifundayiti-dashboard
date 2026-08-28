import type { ReactNode } from "react";
import {
  EyeOutlined,
  SolutionOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  StarOutlined,
  RollbackOutlined,
  TrophyOutlined,
  EditOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import type { ApplicationStatus } from "./types";

export type AppActionKey =
  | "view"
  | "underReview"
  | "approve"
  | "reject"
  | "finalist"
  | "removeFinalist"
  | "selectWinner"
  | "editStory"
  | "archive";

export interface ActionMeta {
  label: string;
  icon: ReactNode;
  danger?: boolean;
  primary?: boolean;
}

export const ACTION_META: Record<AppActionKey, ActionMeta> = {
  view: { label: "View", icon: <EyeOutlined /> },
  underReview: { label: "Move to Under Review", icon: <SolutionOutlined />, primary: true },
  approve: { label: "Approve", icon: <CheckCircleOutlined />, primary: true },
  reject: { label: "Reject", icon: <CloseCircleOutlined />, danger: true },
  finalist: { label: "Move to Finalist", icon: <StarOutlined />, primary: true },
  removeFinalist: { label: "Remove from Finalists", icon: <RollbackOutlined /> },
  selectWinner: { label: "Select Winner", icon: <TrophyOutlined />, primary: true },
  editStory: { label: "Edit Winner Story", icon: <EditOutlined />, primary: true },
  archive: { label: "Archive", icon: <InboxOutlined /> },
};

/** The status-specific actions available beyond "View". */
export const STATUS_ACTIONS: Record<ApplicationStatus, AppActionKey[]> = {
  submitted: ["underReview"],
  underReview: ["approve", "reject"],
  approved: ["finalist", "reject"],
  rejected: ["archive"],
  finalist: ["selectWinner", "removeFinalist"],
  winner: ["editStory", "archive"],
  archived: [],
};
