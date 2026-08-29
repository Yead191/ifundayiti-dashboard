import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Avatar,
  Spin,
  Space,
  Popconfirm,
  Tag,
  Tooltip,
  Modal,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  DollarCircleOutlined,
  EyeOutlined,
  DownloadOutlined,
  TrophyFilled,
  CloseCircleOutlined,
  CheckCircleOutlined,
  SolutionOutlined,
  StarOutlined,
  RollbackOutlined,
  InboxOutlined,
  DeleteOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileOutlined,
} from "@ant-design/icons";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusTag } from "@/components/ui/StatusTag";
import { formatCurrency, formatDate, formatFileSize } from "@/lib/utils";
import { statusToneMap, statusLabelMap } from "@/features/core/statusMaps";
import {
  useGetApplicationByIdQuery,
  type APIApplication,
} from "@/redux/features/applications/applicationsApi";
import { useApplicationWorkflow } from "./useApplicationWorkflow";
import { ApplicationWorkflowModals } from "./components/ApplicationWorkflowModals";
import { toFileUrl } from "@/config";

export default function ApplicationDetailPage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();

  // Fetch application details from API
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useGetApplicationByIdQuery(applicationId || "", { skip: !applicationId });

  const application = response?.data;

  const workflow = useApplicationWorkflow(() => {
    refetch();
  });

  // State to track which document or image is currently open in the viewer
  const [activeFile, setActiveFile] = useState<{
    type: string;
    url: string;
    label: string;
  } | null>(null);

  const handleDelete = async () => {
    if (applicationId) {
      await workflow.confirmDelete(applicationId);
      navigate("/applications");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spin size="large" tip="Loading application details..." />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-bold text-red-500">
          Error loading application
        </h3>
        <p className="text-mist-500 mt-2">
          The application could not be found or there was a server error.
        </p>
        <Button
          className="mt-4"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/applications")}
        >
          Back to Applications
        </Button>
      </div>
    );
  }

  const { personal, contact, identification, grant, background } = application;

  const getDocumentLabel = (type: string) => {
    const labels: Record<string, string> = {
      nid_card: "National ID Card",
      government_id: "Government ID",
      proof_of_address: "Proof of Address",
      business_plan: "Business Plan Proposal",
      supporting_image: "Supporting Project Photo",
      supporting_document: "Supporting Attachment Document",
      supporting_documents: "Supporting Document",
    };
    return (
      labels[type] ||
      type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    );
  };

  const isPdf = activeFile?.url.toLowerCase().endsWith(".pdf");
  const isImage =
    activeFile?.url && /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(activeFile.url);

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            shape="circle"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/applications")}
            className="border-navy-700/60 hover:text-violet-600 hover:border-violet-600"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-bold tracking-tight text-violet-600">
                {personal?.name || "Applicant Details"}
              </h1>
              <StatusTag
                tone={
                  statusToneMap[
                    application.status as keyof typeof statusToneMap
                  ] || "neutral"
                }
              >
                {statusLabelMap[
                  application.status as keyof typeof statusLabelMap
                ] || application.status}
              </StatusTag>
            </div>
            <p className="text-xs text-mist-500 mt-0.5 font-mono">
              ID: {application._id}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => refetch()}
            className="rounded-xl border-navy-700/60"
          >
            Sync Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Panel: Information & Actions */}
        <div className="space-y-6 lg:col-span-4">
          {/* Winner Showcase Block */}
          {application.status === "winner" && (
            <div className="relative overflow-hidden rounded-2xl border border-[#f5b544]/30 bg-linear-to-r from-[#ffd166]/10 via-[#f5b544]/5 to-transparent p-5">
              <div className="absolute right-3 top-3 text-[#f5b544] text-3xl opacity-20">
                <TrophyFilled />
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-[#c9800f]">
                <TrophyFilled /> Micro-Grant Recipient
              </div>
              <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs text-mist-500">Awarded Amount</div>
                  <div className="font-bold text-[#c9800f] text-base">
                    {formatCurrency(
                      application.awardedAmount || grant.requestedAmount,
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-mist-500">Decision Date</div>
                  <div className="font-medium text-cloud-100">
                    {application.reviewedAt
                      ? formatDate(application.reviewedAt)
                      : "Recently"}
                  </div>
                </div>
              </div>
              {application.quote && (
                <div className="mt-3.5 border-t border-[#f5b544]/20 pt-3">
                  <div className="text-xs font-semibold text-mist-500 uppercase tracking-wider">
                    Featured Quote
                  </div>
                  <p className="mt-1 text-sm italic text-cloud-100 leading-relaxed">
                    "{application.quote}"
                  </p>
                </div>
              )}
              {application.successStory && (
                <div className="mt-3.5 border-t border-[#f5b544]/20 pt-3">
                  <div className="text-xs font-semibold text-mist-500 uppercase tracking-wider">
                    Success Story Impact
                  </div>
                  <p className="mt-1 text-sm text-mist-600 leading-relaxed">
                    {application.successStory}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Rejection Block */}
          {application.status === "rejected" && application.rejectionReason && (
            <div className="rounded-2xl border border-red-200 bg-red-50/50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-red-600">
                <CloseCircleOutlined /> Rejection Notice
              </div>
              <p className="mt-2 text-sm text-red-700 leading-relaxed">
                {application.rejectionReason}
              </p>
              <div className="mt-2 text-[10px] text-red-500 font-mono">
                Reviewed on:{" "}
                {application.reviewedAt
                  ? formatDate(application.reviewedAt)
                  : "Unknown"}
              </div>
            </div>
          )}

          {/* Profile Card */}
          <GlassCard className="border border-navy-700/60 shadow-xs">
            <h3 className="font-display text-sm font-bold text-violet-600 border-b border-navy-700/40 pb-2 mb-4">
              Applicant Profile
            </h3>
            <div className="flex items-center gap-4 mb-5">
              <Avatar
                src={toFileUrl(personal?.image)}
                icon={<UserOutlined />}
                size={68}
                className="border-2 border-violet-600/20"
              />
              <div>
                <h4 className="font-bold text-cloud-100 text-base">
                  {personal?.name}
                </h4>
                <p className="text-xs text-mist-500">
                  {background?.occupation || "Applicant"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Tag className="bg-navy-800/10 text-mist-600 border-navy-700/60 text-[10px]">
                    {personal?.nationality}
                  </Tag>
                </div>
              </div>
            </div>

            <div className="space-y-3.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-mist-500 flex items-center gap-2">
                  <MailOutlined className="text-mist-400" /> Email
                </span>
                <a
                  href={`mailto:${contact?.email}`}
                  className="text-cloud-100 font-medium hover:underline"
                >
                  {contact?.email}
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-mist-500 flex items-center gap-2">
                  <PhoneOutlined className="text-mist-400" /> Phone
                </span>
                <a
                  href={`tel:${contact?.phone}`}
                  className="text-cloud-100 font-medium hover:underline"
                >
                  {contact?.phone}
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-mist-500 flex items-center gap-2">
                  <EnvironmentOutlined className="text-mist-400" /> Location
                </span>
                <span className="text-cloud-100 font-medium text-right max-w-50 truncate">
                  {personal?.location}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-mist-500 flex items-center gap-2">
                  <CalendarOutlined className="text-mist-400" /> Date of Birth
                </span>
                <span className="text-cloud-100 font-medium">
                  {personal?.dob ? formatDate(personal.dob) : "—"}
                </span>
              </div>
              {identification && (
                <div className="border-t border-navy-700/40 pt-3 mt-3 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-mist-500 font-semibold uppercase tracking-wider">
                      National ID
                    </div>
                    <div className="text-sm font-mono text-cloud-100 mt-0.5">
                      {identification.nationalId || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-mist-500 font-semibold uppercase tracking-wider">
                      Passport
                    </div>
                    <div className="text-sm font-mono text-cloud-100 mt-0.5">
                      {identification.passport || "—"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Workflow Action Bar */}
          <GlassCard className="border border-navy-700/60 shadow-xs">
            <h3 className="font-display text-sm font-bold text-violet-600 border-b border-navy-700/40 pb-2 mb-4">
              Workflow Actions
            </h3>
            <div className="space-y-3">
              {application.status === "submitted" && (
                <div className="flex flex-col gap-2.5">
                  <Button
                    type="primary"
                    icon={<SolutionOutlined />}
                    loading={workflow.isUpdatingStatus}
                    onClick={() =>
                      workflow.onAction("underReview", application)
                    }
                    className="w-full btn-linear border-0 rounded-xl"
                  >
                    Start Technical Review
                  </Button>
                  <Button
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={() => workflow.onAction("reject", application)}
                    className="w-full rounded-xl"
                  >
                    Reject Application
                  </Button>
                </div>
              )}

              {application.status === "underReview" && (
                <div className="flex flex-col gap-2.5">
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    loading={workflow.isUpdatingStatus}
                    onClick={() => workflow.onAction("approve", application)}
                    className="w-full btn-linear border-0 rounded-xl"
                  >
                    Approve to Shortlist
                  </Button>
                  <Button
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={() => workflow.onAction("reject", application)}
                    className="w-full rounded-xl"
                  >
                    Reject Application
                  </Button>
                </div>
              )}

              {application.status === "approved" && (
                <div className="flex flex-col gap-2.5">
                  <Button
                    type="primary"
                    icon={<StarOutlined />}
                    loading={workflow.isUpdatingStatus}
                    onClick={() => workflow.onAction("finalist", application)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 border-0 rounded-xl text-white"
                  >
                    Elevate to Top 5 Finalist
                  </Button>
                  <Button
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={() => workflow.onAction("reject", application)}
                    className="w-full rounded-xl"
                  >
                    Reject Application
                  </Button>
                </div>
              )}

              {application.status === "finalist" && (
                <div className="flex flex-col gap-2.5">
                  <Button
                    type="primary"
                    icon={<TrophyFilled />}
                    onClick={() =>
                      workflow.onAction("selectWinner", application)
                    }
                    className="w-full bg-linear-to-r! from-[#f5b544]! to-[#c9800f]! text-white! border-0! rounded-xl shadow-xs"
                  >
                    Select as Cycle Winner
                  </Button>
                  <Button
                    icon={<RollbackOutlined />}
                    loading={workflow.isUpdatingStatus}
                    onClick={() =>
                      workflow.onAction("removeFinalist", application)
                    }
                    className="w-full rounded-xl border-navy-700/60"
                  >
                    Demote to Approved
                  </Button>
                </div>
              )}

              {application.status === "winner" && (
                <div className="flex flex-col gap-2.5">
                  <Button
                    type="primary"
                    icon={<TrophyFilled />}
                    onClick={() => workflow.onAction("editStory", application)}
                    className="w-full btn-linear border-0 rounded-xl"
                  >
                    Edit Winner Success Story
                  </Button>
                  <Button
                    icon={<InboxOutlined />}
                    loading={workflow.isUpdatingStatus}
                    onClick={() => workflow.onAction("archive", application)}
                    className="w-full rounded-xl border-navy-700/60"
                  >
                    Archive Application
                  </Button>
                </div>
              )}

              {application.status === "rejected" && (
                <div className="flex flex-col gap-2.5">
                  <Button
                    icon={<InboxOutlined />}
                    loading={workflow.isUpdatingStatus}
                    onClick={() => workflow.onAction("archive", application)}
                    className="w-full rounded-xl border-navy-700/60"
                  >
                    Archive Record
                  </Button>
                </div>
              )}

              {application.status === "archived" && (
                <div className="rounded-xl bg-navy-800/10 border border-navy-700/60 p-3 text-center text-xs text-mist-500">
                  This application record is archived and read-only.
                </div>
              )}

              {/* Danger Zone: Delete Option */}
              <div className="pt-3 border-t border-navy-700/40 mt-4">
                <Popconfirm
                  title="Delete Application Record"
                  description="Are you sure you want to permanently delete this application from the database? This cannot be undone."
                  onConfirm={handleDelete}
                  okText="Permanently Delete"
                  cancelText="Cancel"
                  okButtonProps={{ danger: true, loading: workflow.isDeleting }}
                >
                  <Button
                    danger
                    type="dashed"
                    icon={<DeleteOutlined />}
                    className="w-full rounded-xl border-dashed border-red-300 hover:border-red-500"
                  >
                    Permanently Delete
                  </Button>
                </Popconfirm>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Panel: Project Details & Attachments */}
        <div className="lg:col-span-8 space-y-6">
          {/* Project Card */}
          <GlassCard className="border border-navy-700/60 shadow-xs">
            <h3 className="font-display text-sm font-bold text-violet-600 border-b border-navy-700/40 pb-2 mb-4">
              Project Information
            </h3>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-mist-500 font-semibold uppercase tracking-wider">
                  Project Name
                </div>
                <h4 className="font-bold text-cloud-100 text-base mt-0.5 leading-snug">
                  {grant?.projectName}
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-mist-500 font-semibold uppercase tracking-wider">
                    Requested Funds
                  </div>
                  <div className="font-bold text-violet-600 text-lg mt-0.5">
                    {formatCurrency(grant?.requestedAmount)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-mist-500 font-semibold uppercase tracking-wider">
                    Grant Cycle
                  </div>
                  <div className="font-medium text-cloud-100 text-sm mt-1 truncate">
                    {application.applicationPeriod?.title || "—"}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs text-mist-500 font-semibold uppercase tracking-wider">
                  Description
                </div>
                <p className="text-sm text-mist-600 mt-1 leading-relaxed text-justify">
                  {grant?.projectDescription}
                </p>
              </div>
              <div>
                <div className="text-xs text-mist-500 font-semibold uppercase tracking-wider">
                  Fund Usage Plan
                </div>
                <p className="text-sm text-mist-600 mt-1 leading-relaxed text-justify">
                  {grant?.fundUsage}
                </p>
              </div>
              <div>
                <div className="text-xs text-mist-500 font-semibold uppercase tracking-wider">
                  Expected Impact
                </div>
                <p className="text-sm text-mist-600 mt-1 leading-relaxed text-justify">
                  {grant?.expectedImpact}
                </p>
              </div>
              {background?.financialBackground && (
                <div className="border-t border-navy-700/40 pt-3">
                  <div className="text-xs text-mist-500 font-semibold uppercase tracking-wider">
                    Financial Background
                  </div>
                  <p className="text-sm text-mist-600 mt-1 leading-relaxed text-justify">
                    {background.financialBackground}
                  </p>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Attachments Card */}
          <GlassCard className="border border-navy-700/60 shadow-xs">
            <h3 className="font-display text-sm font-bold text-violet-600 border-b border-navy-700/40 pb-2 mb-4 flex items-center justify-between">
              <span>Application Materials & Attachments</span>
              <span className="text-xs font-normal text-mist-500">
                {(application.documents?.length || 0) +
                  (application.projectGallery?.length || 0)}{" "}
                files total
              </span>
            </h3>

            <div className="space-y-6">
              {/* Documents */}
              <div>
                <div className="text-[10px] font-bold text-mist-500 uppercase tracking-wider mb-2.5">
                  Documents
                </div>
                {application.documents?.length === 0 ? (
                  <div className="text-xs text-mist-400 italic py-2">
                    No documents attached
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {application.documents?.map((doc, idx) => {
                      const label = getDocumentLabel(doc.type);
                      const isDocPdf = doc.url.toLowerCase().endsWith(".pdf");
                      const icon = isDocPdf ? (
                        <FilePdfOutlined className="text-red-500 text-lg" />
                      ) : (
                        <FileImageOutlined className="text-blue-500 text-lg" />
                      );
                      return (
                        <div
                          key={idx}
                          onClick={() =>
                            setActiveFile({
                              type: doc.type,
                              url: doc.url,
                              label,
                            })
                          }
                          className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border border-navy-700/40 hover:bg-violet-600/5 hover:border-violet-600 bg-white/40 shadow-xs group"
                        >
                          <span className="text-base shrink-0">{icon}</span>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold text-cloud-100 truncate group-hover:text-violet-600 transition-colors">
                              {label}
                            </div>
                            <div className="text-[9px] text-mist-500 font-mono truncate">
                              {doc.url.split("/").pop()}
                            </div>
                          </div>
                          <EyeOutlined className="text-mist-400 group-hover:text-violet-600 transition-colors shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Project Gallery */}
              <div>
                <div className="text-[10px] font-bold text-mist-500 uppercase tracking-wider mb-2.5">
                  Project Gallery
                </div>
                {application.projectGallery?.length === 0 ? (
                  <div className="text-xs text-mist-400 italic py-2">
                    No gallery images uploaded
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {application.projectGallery?.map((url, idx) => {
                      const label = `Gallery Image ${idx + 1}`;
                      return (
                        <div
                          key={idx}
                          onClick={() =>
                            setActiveFile({
                              type: "gallery_image",
                              url,
                              label,
                            })
                          }
                          className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border border-navy-700/40 hover:bg-violet-600/5 hover:border-violet-600 bg-white/40 shadow-xs group"
                        >
                          <span className="text-base shrink-0">
                            <FileImageOutlined className="text-amber-500 text-lg" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold text-cloud-100 truncate group-hover:text-violet-600 transition-colors">
                              {label}
                            </div>
                            <div className="text-[9px] text-mist-500 font-mono truncate">
                              {url.split("/").pop()}
                            </div>
                          </div>
                          <EyeOutlined className="text-mist-400 group-hover:text-violet-600 transition-colors shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* File Preview Modal */}
      <Modal
        open={!!activeFile}
        title={
          <div className="flex items-center justify-between pr-8 border-b border-navy-700/20 pb-3">
            <div>
              <h4 className="font-bold text-base text-violet-600">
                {activeFile?.label}
              </h4>
              <div className="text-[10px] text-mist-500 font-mono truncate max-w-100">
                {activeFile?.url.split("/").pop()}
              </div>
            </div>
            {activeFile && (
              <a
                href={toFileUrl(activeFile.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-violet-600 font-semibold hover:underline mr-4"
              >
                <DownloadOutlined /> Download File
              </a>
            )}
          </div>
        }
        onCancel={() => setActiveFile(null)}
        footer={null}
        width={950}
        centered
        destroyOnClose
        className="document-preview-modal"
      >
        <div className="mt-4 flex items-center justify-center bg-white rounded-xl overflow-hidden shadow-inner border border-navy-700/10 p-2 min-h-125">
          {activeFile && isImage && (
            <img
              src={toFileUrl(activeFile.url)}
              alt={activeFile.label}
              className="max-h-[70vh] max-w-full object-contain transition-all duration-300"
            />
          )}

          {activeFile && isPdf && (
            <iframe
              src={toFileUrl(activeFile.url)}
              title={activeFile.label}
              className="w-full h-[70vh] border-0 rounded-lg"
            />
          )}

          {activeFile && !isImage && !isPdf && (
            <div className="text-center p-8">
              <FileOutlined className="text-mist-400 text-6xl mb-3" />
              <h5 className="font-bold text-sm text-cloud-100">
                Preview Unsupported
              </h5>
              <p className="text-xs text-mist-500 mt-1 max-w-60 mx-auto">
                This document format is not supported for inline display.
              </p>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                href={toFileUrl(activeFile.url)}
                target="_blank"
                className="mt-4 btn-linear border-0 rounded-xl"
              >
                Download to View
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {/* Workflow Modals */}
      <ApplicationWorkflowModals wf={workflow} />
    </div>
  );
}
