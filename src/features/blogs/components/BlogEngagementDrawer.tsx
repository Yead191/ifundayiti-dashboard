import { Drawer, Button, Tag } from "antd";
import { Link } from "react-router-dom";
import {
  FolderFilled,
  EyeOutlined,
  HeartFilled,
  MessageFilled,
} from "@ant-design/icons";
import type { IBlog } from "@/redux/features/blogs/blogs.types";
import { getCategoryName } from "../blogHelpers";
import { BlogEngagementSection } from "./BlogEngagementSection";

interface BlogEngagementDrawerProps {
  open: boolean;
  blog: IBlog | null;
  initialTab?: "comments" | "likes";
  onClose: () => void;
}

export function BlogEngagementDrawer({
  open,
  blog,
  initialTab = "comments",
  onClose,
}: BlogEngagementDrawerProps) {
  if (!blog) return null;

  const categoryName = getCategoryName(blog.category);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={560}
      destroyOnClose
      className="[&_.ant-drawer-header]:border-0 [&_.ant-drawer-body]:p-5"
      title={
        <div className="space-y-1 pr-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
              <FolderFilled className="text-emerald-700 text-[10px]" />
              <span>{categoryName}</span>
            </span>

            {blog.isFeatured && (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                ★ Spotlight
              </span>
            )}

            <span className="text-[11px] text-gray-400 font-mono">
              /{blog.slug}
            </span>
          </div>

          <h3 className="font-display text-base font-bold text-gray-900 line-clamp-1 leading-snug">
            {blog.title}
          </h3>
        </div>
      }
      extra={
        <Link to={`/blogs/${blog._id}`} onClick={onClose}>
          <Button
            size="small"
            icon={<EyeOutlined />}
            className="rounded-lg text-xs font-semibold"
          >
            Full Story
          </Button>
        </Link>
      }
    >
      <BlogEngagementSection
        blogId={blog._id}
        blogSlug={blog.slug}
        totalLikes={blog.totalLikes}
        totalComments={blog.totalComments}
        isLikedByMe={blog.isLikedByMe}
        initialTab={initialTab}
        embedded={true}
      />
    </Drawer>
  );
}
