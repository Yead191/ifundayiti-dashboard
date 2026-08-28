import { Button, Dropdown, type MenuProps } from "antd";
import { EyeOutlined, MoreOutlined } from "@ant-design/icons";
import { cn } from "@/lib/utils";
import { ACTION_META, STATUS_ACTIONS, type AppActionKey } from "../applicationActions";
import type { Application } from "../types";

type OnAction = (key: AppActionKey, application: Application) => void;

/**
 * Compact table-row actions: a "View" button plus a dropdown of the
 * status-specific transitions available for this application.
 */
export function ApplicationActionsCell({
  application,
  onAction,
}: {
  application: Application;
  onAction: OnAction;
}) {
  const actions = STATUS_ACTIONS[application.status];

  const menuItems: MenuProps["items"] = actions.map((key) => ({
    key,
    label: ACTION_META[key].label,
    icon: ACTION_META[key].icon,
    danger: ACTION_META[key].danger,
    onClick: () => onAction(key, application),
  }));

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Button size="small" icon={<EyeOutlined />} onClick={() => onAction("view", application)}>
        View
      </Button>
      {actions.length > 0 && (
        <Dropdown menu={{ items: menuItems }} trigger={["click"]} placement="bottomRight">
          <Button size="small" icon={<MoreOutlined />} aria-label="More actions" />
        </Dropdown>
      )}
    </div>
  );
}

/**
 * Full-width action bar used in the detail drawer footer. Renders every
 * status transition as an explicit, clearly-styled button.
 */
export function StatusActionBar({
  application,
  onAction,
}: {
  application: Application;
  onAction: OnAction;
}) {
  const actions = STATUS_ACTIONS[application.status];

  if (actions.length === 0) {
    return (
      <div className="rounded-xl border border-navy-700/60 bg-navy-800/40 px-4 py-3 text-center text-sm text-mist-400">
        This application is archived and read-only.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((key) => {
        const meta = ACTION_META[key];
        return (
          <Button
            key={key}
            block={actions.length === 1}
            danger={meta.danger}
            type={meta.primary ? "primary" : "default"}
            icon={meta.icon}
            className={cn("flex-1", meta.primary && !meta.danger && "btn-gradient !border-0")}
            onClick={() => onAction(key, application)}
          >
            {meta.label}
          </Button>
        );
      })}
    </div>
  );
}
