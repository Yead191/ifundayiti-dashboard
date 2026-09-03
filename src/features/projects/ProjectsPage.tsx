import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pagination, Spin } from "antd";
import { FolderOpenOutlined } from "@ant-design/icons";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  useGetProjectsQuery,
  useGetProjectStatsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useUpdateProjectStatusMutation,
  useToggleProjectFeaturedMutation,
  useDeleteProjectMutation,
} from "@/redux/features/projects/projectsApi";
import type {
  Project,
  ProjectStatus,
  ProjectStats,
} from "@/redux/features/projects/project.types";
import { ProjectStatsHeader } from "./components/ProjectStatsHeader";
import { ProjectFiltersBar } from "./components/ProjectFiltersBar";
import { ProjectCard } from "./components/ProjectCard";
import { ProjectTable } from "./components/ProjectTable";
import { ProjectModal } from "./components/ProjectModal";

export default function ProjectsPage() {
  const navigate = useNavigate();
  // Filters & view modes
  const [activeStatus, setActiveStatus] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);

  // Debounce search input by 350ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Main projects query
  const {
    data: projectsResponse,
    isLoading: isLoadingProjects,
    isFetching: isFetchingProjects,
    refetch: refetchProjects,
  } = useGetProjectsQuery({
    page,
    limit: pageSize,
    searchTerm: debouncedSearch,
    category: categoryFilter,
    status: activeStatus,
  });

  // Dedicated server stats query (cached & invalidated on project mutations)
  const { data: statsResponse, isLoading: isLoadingStats } =
    useGetProjectStatsQuery();

  // Mutations
  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();
  const [updateProjectStatus] = useUpdateProjectStatusMutation();
  const [toggleProjectFeatured] = useToggleProjectFeaturedMutation();
  const [deleteProject] = useDeleteProjectMutation();

  const [togglingFeaturedId, setTogglingFeaturedId] = useState<string | null>(
    null,
  );

  // Modal states
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Extracted data
  const projects = projectsResponse?.data ?? [];
  const pagination = projectsResponse?.pagination ?? {
    page: 1,
    limit: pageSize,
    total: projects.length,
    totalPage: 1,
  };

  // Compute stats: use dedicated server stats when available, or fallback to pagination
  const stats: ProjectStats = useMemo(() => {
    if (statsResponse?.data) {
      return statsResponse.data;
    }

    let published = 0;
    let draft = 0;
    let archived = 0;
    let featured = 0;
    let totalGrantAmount = 0;

    projects.forEach((p) => {
      if (p.status === "Published") published++;
      if (p.status === "Draft") draft++;
      if (p.status === "Archived") archived++;
      if (p.featured) featured++;
      if (typeof p.grantAmount === "number" && !isNaN(p.grantAmount)) {
        totalGrantAmount += p.grantAmount;
      }
    });

    return {
      totalProjects: pagination.total,
      publishedProjects:
        activeStatus === "Published" ? pagination.total : published,
      draftProjects: activeStatus === "Draft" ? pagination.total : draft,
      archivedProjects:
        activeStatus === "Archived" ? pagination.total : archived,
      featuredProjects: featured,
      totalGrantAmount,
    };
  }, [statsResponse, projects, pagination.total, activeStatus]);

  // Handlers
  const handleOpenCreateModal = () => {
    setEditingProject(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (project: Project) => {
    setEditingProject(project);
    setModalOpen(true);
  };

  const handleViewProject = (project: Project) => {
    navigate(`/projects/${project._id}`);
  };

  const handleStatusTabChange = (status: string) => {
    setActiveStatus(status);
    setPage(1);
  };

  const handleCategoryChange = (category: string) => {
    setCategoryFilter(category);
    setPage(1);
  };

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  const handleSubmitModal = async (formData: FormData) => {
    try {
      if (editingProject) {
        await updateProject({
          id: editingProject._id,
          body: formData,
        }).unwrap();
        toast.success("Project updated successfully", {
          description: "All changes and media uploads have been saved.",
        });
      } else {
        await createProject(formData).unwrap();
        toast.success("Project created successfully", {
          description: "New community initiative has been registered.",
        });
      }
      setModalOpen(false);
      setEditingProject(null);
    } catch (err: any) {
      toast.error("Failed to save project", {
        description:
          err?.data?.message || err?.message || "An unexpected error occurred.",
      });
    }
  };

  const handleChangeStatus = async (id: string, status: ProjectStatus) => {
    try {
      await updateProjectStatus({ id, body: { status } }).unwrap();
      toast.success("Project status updated", {
        description: `Project has been transitioned to ${status}.`,
      });
    } catch (err: any) {
      toast.error("Failed to update status", {
        description: err?.data?.message || "An error occurred.",
      });
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      setTogglingFeaturedId(id);
      await toggleProjectFeatured(id).unwrap();
      toast.success("Spotlight status updated");
    } catch (err: any) {
      toast.error("Failed to toggle spotlight", {
        description: err?.data?.message || "An error occurred.",
      });
    } finally {
      setTogglingFeaturedId(null);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteProject(id).unwrap();
      toast.success("Project deleted successfully");
    } catch (err: any) {
      toast.error("Failed to delete project", {
        description: err?.data?.message || "An error occurred.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#0B3D2E]">
            Community Projects
          </h1>
          <p className="mt-1 text-sm text-mist-600">
            Publish, spotlight, and manage grassroots development initiatives
            and funded grant stories.
          </p>
        </div>
      </div>

      {/* KPI Stats Counter Header */}
      <ProjectStatsHeader
        stats={stats}
        loading={isLoadingProjects}
        activeStatusFilter={activeStatus}
        onSelectStatus={handleStatusTabChange}
      />

      {/* Action Bar: Tabs, Search, Category Filter, View Mode Switcher, CTA */}
      <ProjectFiltersBar
        activeStatus={activeStatus}
        onStatusChange={handleStatusTabChange}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={handleCategoryChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        stats={stats}
        onCreateProject={handleOpenCreateModal}
        onRefresh={() => refetchProjects()}
        isFetching={isFetchingProjects}
      />

      {/* Content Area: Grid View or Data Table */}
      {isLoadingProjects ? (
        <div className="flex h-72 items-center justify-center">
          <Spin size="large" tip="Loading project catalog..." />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<FolderOpenOutlined className="text-5xl text-mist-400" />}
          title="No projects found"
          description={
            searchTerm || categoryFilter !== "all" || activeStatus !== "all"
              ? "No projects match your current filter parameters. Try clearing search or status filters."
              : "No community projects have been created in this catalog yet."
          }
          actionLabel="Create New Project"
          onAction={handleOpenCreateModal}
        />
      ) : viewMode === "grid" ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects?.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                onView={handleViewProject}
                onDelete={handleDeleteProject}
                onChangeStatus={handleChangeStatus}
                onToggleFeatured={handleToggleFeatured}
                isTogglingFeatured={togglingFeaturedId === project._id}
              />
            ))}
          </div>

          {/* Grid View Pagination */}
          {pagination.total > pageSize && (
            <div className="flex justify-end border-t border-navy-700/40 pt-4">
              <Pagination
                current={page}
                pageSize={pageSize}
                total={pagination.total}
                onChange={handlePageChange}
                showSizeChanger
                pageSizeOptions={["12", "24", "48"]}
                showTotal={(tot) => `Total ${tot} projects`}
              />
            </div>
          )}
        </div>
      ) : (
        <ProjectTable
          data={projects}
          loading={isFetchingProjects}
          page={page}
          pageSize={pageSize}
          total={pagination.total}
          onPageChange={handlePageChange}
          onView={handleViewProject}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteProject}
          onChangeStatus={handleChangeStatus}
          onToggleFeatured={handleToggleFeatured}
          togglingId={togglingFeaturedId}
        />
      )}

      {/* Create / Edit Project Modal */}
      <ProjectModal
        open={modalOpen}
        project={editingProject}
        loading={isCreating || isUpdating}
        onCancel={() => {
          setModalOpen(false);
          setEditingProject(null);
        }}
        onSubmit={handleSubmitModal}
      />
    </div>
  );
}
