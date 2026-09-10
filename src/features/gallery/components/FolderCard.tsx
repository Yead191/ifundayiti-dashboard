import { useNavigate } from "react-router-dom";
import { Button, Dropdown } from "antd";
import type { MenuProps } from "antd";
import {
  FolderFilled,
  FolderOpenOutlined,
  PictureOutlined,
  CalendarOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatDate } from "@/lib/utils";
import type { IFolder } from "@/redux/features/gallery/gallery.types";

interface FolderCardProps {
  folder: IFolder;
  onEdit: (folder: IFolder) => void;
  onDelete: (folder: IFolder) => void;
}

export function FolderCard({ folder, onEdit, onDelete }: FolderCardProps) {
  const navigate = useNavigate();
  const count = folder.galleryCount ?? 0;

  const menuItems: MenuProps["items"] = [
    {
      key: "open",
      label: "Open Album",
      icon: <FolderOpenOutlined />,
      onClick: () => navigate(`/gallery/folder/${folder._id}`),
    },
    {
      key: "rename",
      label: "Rename Folder",
      icon: <EditOutlined />,
      onClick: () => onEdit(folder),
    },
    {
      type: "divider",
    },
    {
      key: "delete",
      label: "Delete Folder & Photos",
      danger: true,
      icon: <DeleteOutlined />,
      onClick: () => onDelete(folder),
    },
  ];

  return (
    <GlassCard className="group relative flex flex-col justify-between p-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-700/40 hover:shadow-md cursor-pointer">
      <div onClick={() => navigate(`/gallery/folder/${folder._id}`)}>
        {/* Top bar: Folder icon and menu */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/60 text-emerald-800 border border-emerald-200/60 shadow-2xs group-hover:scale-105 transition-transform">
            <FolderFilled className="text-2xl text-[#0B3D2E]" />
          </div>

          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1"
          >
            <Dropdown menu={{ items: menuItems }} trigger={["click"]} placement="bottomRight">
              <Button
                type="text"
                size="small"
                icon={<MoreOutlined className="text-base text-mist-500" />}
                className="h-8 w-8 rounded-xl hover:bg-gray-100"
              />
            </Dropdown>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-base text-cloud-100 group-hover:text-[#0B3D2E] transition-colors line-clamp-1">
          {folder.name}
        </h3>

        {/* Info row */}
        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-mist-500">
          {/* Photo Count Pill */}
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-900 border border-emerald-200/80">
            <PictureOutlined className="text-emerald-700" />
            {count} {count === 1 ? "Photo" : "Photos"}
          </span>

          <span>·</span>

          {/* Creation Date */}
          <span className="flex items-center gap-1 text-mist-400">
            <CalendarOutlined className="text-[11px]" />
            {formatDate(folder.createdAt)}
          </span>
        </div>
      </div>

      {/* Card Footer Action */}
      <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-[11px] font-medium text-mist-400">
          Album Gallery
        </span>
        <Button
          type="link"
          onClick={() => navigate(`/gallery/folder/${folder._id}`)}
          className="flex items-center gap-1 p-0 text-xs font-semibold text-[#0B3D2E] hover:underline"
        >
          <span>View Images</span>
          <ArrowRightOutlined className="text-[10px]" />
        </Button>
      </div>
    </GlassCard>
  );
}
