import { useState } from "react";
import { Pagination, Spin } from "antd";
import { TeamOutlined, PlusOutlined } from "@ant-design/icons";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  useGetTeamStatsQuery,
  useGetTeamMembersQuery,
  useCreateTeamMemberMutation,
  useUpdateTeamMemberMutation,
  useChangeTeamStatusMutation,
  useDeleteTeamMemberMutation,
} from "@/redux/features/team/teamApi";
import type { TeamMember, TeamStatus } from "@/redux/features/team/team.types";

import { TeamStatsHeader } from "./components/TeamStatsHeader";
import { TeamFiltersBar } from "./components/TeamFiltersBar";
import { TeamMemberCard } from "./components/TeamMemberCard";
import { TeamMemberTable } from "./components/TeamMemberTable";
import { TeamMemberModal } from "./components/TeamMemberModal";
import { TeamMemberDetailModal } from "./components/TeamMemberDetailModal";
import { RejectVolunteerModal } from "./components/RejectVolunteerModal";

export default function TeamPage() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);

  // Modals state
  const [memberModalOpen, setMemberModalOpen] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);
  const [viewingMember, setViewingMember] = useState<TeamMember | null>(null);

  const [rejectModalOpen, setRejectModalOpen] = useState<boolean>(false);
  const [rejectingMember, setRejectingMember] = useState<TeamMember | null>(
    null,
  );

  // Queries & Mutations
  const {
    data: statsRes,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useGetTeamStatsQuery();

  const queryCategory =
    activeTab === "all"
      ? undefined
      : activeTab === "pending_volunteers"
        ? "volunteer"
        : activeTab;

  const queryStatus =
    activeTab === "pending_volunteers"
      ? "pending"
      : statusFilter === "all"
        ? undefined
        : statusFilter;

  const {
    data: teamRes,
    isLoading: isLoadingTeam,
    isFetching: isFetchingTeam,
    refetch: refetchTeam,
  } = useGetTeamMembersQuery({
    page,
    limit: pageSize,
    searchTerm: searchTerm.trim() || undefined,
    category: queryCategory,
    status: queryStatus,
  });

  const [createTeamMember, { isLoading: isCreating }] =
    useCreateTeamMemberMutation();
  const [updateTeamMember, { isLoading: isUpdating }] =
    useUpdateTeamMemberMutation();
  const [changeTeamStatus, { isLoading: isChangingStatus }] =
    useChangeTeamStatusMutation();
  const [deleteTeamMember] = useDeleteTeamMemberMutation();

  const stats = statsRes?.data;
  const teamMembers = teamRes?.data || [];
  const pagination = teamRes?.pagination || {
    total: 0,
    page: 1,
    limit: pageSize,
    totalPage: 1,
  };

  // Tab & Filter Handlers
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setPage(1);
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handlePageChange = (p: number, ps?: number) => {
    setPage(p);
    if (ps && ps !== pageSize) {
      setPageSize(ps);
    }
  };

  const handleRefreshAll = () => {
    refetchStats();
    refetchTeam();
  };

  // Member CRUD Actions
  const handleOpenAddModal = () => {
    setEditingMember(null);
    setMemberModalOpen(true);
  };

  const handleOpenEditModal = (member: TeamMember) => {
    setEditingMember(member);
    setMemberModalOpen(true);
  };

  const handleOpenDetailModal = (member: TeamMember) => {
    setViewingMember(member);
    setDetailModalOpen(true);
  };

  const handleOpenRejectModal = (member: TeamMember) => {
    setRejectingMember(member);
    setRejectModalOpen(true);
  };

  const handleSaveMember = async (formData: FormData) => {
    try {
      if (editingMember) {
        await updateTeamMember({
          id: editingMember._id,
          body: formData,
        }).unwrap();
        toast.success("Profile updated successfully", {
          description: "The team member profile details have been saved.",
        });
      } else {
        await createTeamMember(formData).unwrap();
        toast.success("Team member added successfully", {
          description: "New member profile has been published to directory.",
        });
      }
      setMemberModalOpen(false);
      setEditingMember(null);
    } catch (err: any) {
      toast.error(
        editingMember ? "Failed to update profile" : "Failed to add member",
        {
          description: err?.data?.message || "An unexpected error occurred",
        },
      );
    }
  };

  const handleChangeStatus = async (
    id: string,
    status: TeamStatus,
    rejectionReason?: string,
  ) => {
    try {
      await changeTeamStatus({
        id,
        body: { status, rejectionReason },
      }).unwrap();

      const statusLabels: Record<TeamStatus, string> = {
        active: "Activated",
        pending: "Moved to Pending",
        rejected: "Rejected",
        blocked: "Blocked",
      };

      toast.success(`Member status updated: ${statusLabels[status] || status}`);
    } catch (err: any) {
      toast.error("Failed to update status", {
        description: err?.data?.message || "An error occurred",
      });
    }
  };

  const handleConfirmReject = async (reason: string) => {
    if (!rejectingMember) return;
    try {
      await changeTeamStatus({
        id: rejectingMember._id,
        body: { status: "rejected", rejectionReason: reason },
      }).unwrap();
      toast.success("Volunteer application rejected", {
        description: `${rejectingMember.name}'s application was marked as rejected.`,
      });
      setRejectModalOpen(false);
      setRejectingMember(null);
    } catch (err: any) {
      toast.error("Failed to reject application", {
        description: err?.data?.message || "An error occurred",
      });
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      await deleteTeamMember(id).unwrap();
      toast.success("Team member deleted successfully");
    } catch (err: any) {
      toast.error("Failed to delete member", {
        description: err?.data?.message || "An error occurred",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Page Title & Subtitle */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#0B3D2E]">
            Team & Volunteers
          </h1>
          <p className="mt-1 text-sm text-mist-600">
            Moderate volunteer applicants, assign focus areas, and govern the
            core foundation team.
          </p>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <TeamStatsHeader
        stats={stats}
        loading={isLoadingStats}
        onSelectTab={(tabKey) => {
          handleTabChange(tabKey);
        }}
      />

      {/* Filters Bar: Tabs, Search, Status Select, View Toggle, Add Button */}
      <TeamFiltersBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        stats={stats}
        onAddMember={handleOpenAddModal}
        onRefresh={handleRefreshAll}
        isFetching={isFetchingTeam}
      />

      {/* Content Area (Grid or Table View) */}
      {isLoadingTeam ? (
        <div className="flex h-64 items-center justify-center">
          <Spin size="large" tip="Loading team directory..." />
        </div>
      ) : teamMembers.length === 0 ? (
        <EmptyState
          icon={<TeamOutlined className="text-5xl text-mist-400" />}
          title="No team members found"
          description={
            searchTerm || statusFilter !== "all" || activeTab !== "all"
              ? "No members match your current filters. Try resetting search or status criteria."
              : "No team members have been added to this directory yet."
          }
          actionLabel="Add Team Member"
          onAction={handleOpenAddModal}
        />
      ) : viewMode === "grid" ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {teamMembers.map((member) => (
              <TeamMemberCard
                key={member._id}
                member={member}
                onView={handleOpenDetailModal}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteMember}
                onChangeStatus={(id, status) => handleChangeStatus(id, status)}
                onOpenRejectModal={handleOpenRejectModal}
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
                showTotal={(tot) => `Total ${tot} members`}
              />
            </div>
          )}
        </div>
      ) : (
        <TeamMemberTable
          data={teamMembers}
          loading={isLoadingTeam}
          page={page}
          pageSize={pageSize}
          total={pagination.total}
          onPageChange={handlePageChange}
          onView={handleOpenDetailModal}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteMember}
          onChangeStatus={(id, status) => handleChangeStatus(id, status)}
          onOpenRejectModal={handleOpenRejectModal}
        />
      )}

      {/* Add / Edit Member Modal */}
      <TeamMemberModal
        open={memberModalOpen}
        member={editingMember}
        loading={isCreating || isUpdating}
        onCancel={() => {
          setMemberModalOpen(false);
          setEditingMember(null);
        }}
        onSubmit={handleSaveMember}
      />

      {/* Detailed Member Profile Viewer */}
      <TeamMemberDetailModal
        open={detailModalOpen}
        member={viewingMember}
        onCancel={() => {
          setDetailModalOpen(false);
          setViewingMember(null);
        }}
        onEdit={(member) => {
          handleOpenEditModal(member);
        }}
        onApprove={(member) => {
          handleChangeStatus(member._id, "active");
        }}
        onReject={(member) => {
          handleOpenRejectModal(member);
        }}
        onBlock={(member) => {
          handleChangeStatus(member._id, "blocked");
        }}
      />

      {/* Volunteer Rejection Modal with Reason */}
      <RejectVolunteerModal
        open={rejectModalOpen}
        member={rejectingMember}
        loading={isChangingStatus}
        onCancel={() => {
          setRejectModalOpen(false);
          setRejectingMember(null);
        }}
        onConfirm={handleConfirmReject}
      />
    </div>
  );
}
