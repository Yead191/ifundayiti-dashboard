import { Avatar, Dropdown, Input, type MenuProps } from "antd";
import {
  SearchOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";
import { toast } from "sonner";
import { useGetProfileQuery } from "@/redux/features/auth/authApi";
import { getImageUrl } from "@/lib/getImageUrl";
import { TopbarNotifications } from "./TopbarNotifications";

export function Topbar({
  title,
  subtitle,
  onOpenMobileNav,
}: {
  title: string;
  subtitle?: string;
  onOpenMobileNav?: () => void;
}) {
  const { logout } = useAuth();
  const { data: profile } = useGetProfileQuery();
  const user = profile?.data;
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.message("Signed out", {
      description: "You've been logged out of IFundAyiti admin.",
    });
    navigate("/login", { replace: true });
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "email",
      label: "Signed in as " + (user?.email ?? ""),
      disabled: true,
    },
    { type: "divider" },
    {
      key: "profile",
      label: "Profile",
      icon: <UserOutlined />,
      onClick: () => navigate("/profile"),
    },
    {
      key: "logout",
      label: "Sign out",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <div className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-[#e2eae6]/80 bg-white/70 px-4 backdrop-blur-md md:px-6 shadow-xs shadow-green-950/[0.01]">
      <button
        type="button"
        onClick={onOpenMobileNav}
        className="rounded-lg p-2 text-mist-400 hover:bg-black/5 hover:text-[#0B3D2E] md:hidden"
        aria-label="Open navigation"
      >
        <MenuOutlined />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate font-display text-[16px] font-semibold text-cloud-100">
          {title}
        </h1>
        {subtitle && (
          <p className="hidden truncate text-xs text-mist-400 sm:block">{subtitle}</p>
        )}
      </div>

      <div className="hidden w-64 shrink-0 lg:block">
        <Input
          prefix={<SearchOutlined className="text-mist-500" />}
          placeholder="Search anything…"
          className="!rounded-full !bg-slate-50/50 hover:!border-[#0B3D2E]/30 focus:!border-[#0B3D2E] hover:!bg-white focus:!bg-white !transition-all !duration-200"
        />
      </div>

      <TopbarNotifications userId={user?._id} />

      <Dropdown menu={{ items: userMenuItems }} trigger={["click"]} placement="bottomRight">
        <button
          type="button"
          className="flex items-center gap-2 rounded-full pl-1.5 pr-3 py-1 border border-[#e2eae6] bg-white/60 hover:bg-white transition-all shadow-xs hover:shadow-sm duration-200"
        >
          <Avatar src={getImageUrl(user?.image)} icon={<UserOutlined />} size={28} className="border border-[#e2eae6]" />
          <span className="hidden text-xs font-semibold text-[#0B3D2E] sm:inline">{user?.name}</span>
        </button>
      </Dropdown>
    </div>
  );
}
