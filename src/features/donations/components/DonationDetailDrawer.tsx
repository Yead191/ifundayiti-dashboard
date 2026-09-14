import { useState } from "react";
import { Drawer, Button, Tag, Tooltip } from "antd";
import {
  CloseOutlined,
  CopyOutlined,
  CheckOutlined,
  PrinterOutlined,
  DeleteOutlined,
  CalendarOutlined,
  UserOutlined,
  MailOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  ProjectOutlined,
  TrophyOutlined,
  BankOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { IDonation } from "@/redux/features/donations/donations.types";

interface DonationDetailDrawerProps {
  open: boolean;
  donation: IDonation | null;
  onClose: () => void;
  onDelete: (donation: IDonation) => void;
}

export function DonationDetailDrawer({
  open,
  donation,
  onClose,
  onDelete,
}: DonationDetailDrawerProps) {
  const [copiedId, setCopiedId] = useState(false);

  if (!donation) return null;

  const isDonation = donation.type === "donation";

  const handleCopyTransactionId = () => {
    if (!donation.transactionId) return;
    navigator.clipboard.writeText(donation.transactionId);
    setCopiedId(true);
    toast.success("Transaction ID copied to clipboard");
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const applicant = donation.applicant;
  const applicantName = applicant?.personal
    ? `${applicant.personal.firstName || ""} ${applicant.personal.lastName || ""}`.trim()
    : null;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      closable={false}
      width={480}
      styles={{
        body: { padding: 0 },
        header: { display: "none" },
      }}
      className="custom-receipt-drawer"
    >
      <div className="flex flex-col h-full bg-[#f8faf9]">
        {/* Header Bar */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200/80 bg-white">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Audit Receipt
            </span>
            <Tag
              bordered={false}
              className={`rounded-full text-xs font-semibold px-2.5 py-0.5 m-0 ${
                isDonation
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
            >
              {isDonation ? "Donation Inflow" : "Grant Outflow"}
            </Tag>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <CloseOutlined className="text-xs" />
          </button>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Main Amount Card */}
          <div className="rounded-2xl border border-gray-200/80 bg-white p-6 text-center shadow-xs space-y-2">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full mb-1 bg-opacity-15 ring-6 ring-opacity-10 ring-current"
              style={{
                backgroundColor: isDonation ? "rgba(11, 61, 46, 0.1)" : "rgba(217, 119, 6, 0.1)",
                color: isDonation ? "#0B3D2E" : "#d97706",
              }}
            >
              {isDonation ? (
                <ArrowDownOutlined className="text-xl" />
              ) : (
                <ArrowUpOutlined className="text-xl" />
              )}
            </div>

            <p className="text-xs font-medium text-gray-400">
              {isDonation ? "Contribution Amount" : "Grant Disbursement"}
            </p>

            <h2
              className={`font-display text-3xl sm:text-4xl font-extrabold tracking-tight ${
                isDonation ? "text-[#0B3D2E]" : "text-amber-600"
              }`}
            >
              {isDonation ? "+" : "-"}
              {formatCurrency(donation.amount)}
            </h2>

            <p className="text-xs text-gray-400 flex items-center justify-center gap-1.5 pt-1">
              <CalendarOutlined className="text-gray-400" />
              <span>{formatDateTime(donation.createdAt)}</span>
            </p>
          </div>

          {/* Reference & Stripe Transaction ID */}
          <div className="rounded-2xl border border-gray-200/80 bg-white p-5 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Transaction Reference
              </span>
              {donation.transactionId && (
                <button
                  type="button"
                  onClick={handleCopyTransactionId}
                  className="flex items-center gap-1 text-xs font-medium text-emerald-800 hover:text-emerald-950 transition-colors cursor-pointer"
                >
                  {copiedId ? (
                    <>
                      <CheckOutlined className="text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <CopyOutlined />
                      <span>Copy ID</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-150">
              <p className="font-mono text-xs text-gray-700 break-all select-all font-semibold">
                {donation.transactionId || donation._id}
              </p>
            </div>
          </div>

          {/* Donor / Sender Information */}
          <div className="rounded-2xl border border-gray-200/80 bg-white p-5 space-y-3.5 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              {isDonation ? "Donor Information" : "Disbursed By"}
            </span>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <UserOutlined /> Name
                </span>
                <span className="font-bold text-gray-800 text-sm">
                  {donation.name || "Anonymous Supporter"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <MailOutlined /> Email
                </span>
                <span className="font-medium text-gray-700">
                  {donation.email || "No email recorded"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <BankOutlined /> Payment Channel
                </span>
                <span className="font-semibold text-gray-700">
                  {donation.transactionId ? "Stripe Checkout" : "Internal System"}
                </span>
              </div>
            </div>
          </div>

          {/* Grant Details (If Grant) */}
          {applicant && (
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-5 space-y-3.5 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <TrophyOutlined className="text-amber-600" /> Awarded Grantee
              </span>

              <div className="space-y-2.5 text-xs">
                {applicant.projectTitle && (
                  <div>
                    <span className="text-gray-400 text-[11px]">Project Title</span>
                    <h4 className="font-bold text-gray-900 text-sm mt-0.5">
                      {applicant.projectTitle}
                    </h4>
                  </div>
                )}

                {applicantName && (
                  <div className="flex items-center justify-between py-1 border-t border-amber-200/50">
                    <span className="text-gray-500">Applicant</span>
                    <span className="font-semibold text-gray-800">
                      {applicantName}
                    </span>
                  </div>
                )}

                {applicant.applicationPeriod?.title && (
                  <div className="flex items-center justify-between py-1 border-t border-amber-200/50">
                    <span className="text-gray-500">Grant Window</span>
                    <span className="font-semibold text-gray-800">
                      {applicant.applicationPeriod.title}
                    </span>
                  </div>
                )}

                {applicant.quote && (
                  <div className="pt-2 border-t border-amber-200/50">
                    <span className="text-gray-400 text-[11px]">Grantee Quote</span>
                    <p className="text-xs text-gray-700 italic mt-1 bg-white/70 p-2.5 rounded-xl border border-amber-200/60 leading-relaxed">
                      &ldquo;{applicant.quote}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-white border-t border-gray-200/80 flex items-center justify-between gap-3">
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              onClose();
              onDelete(donation);
            }}
            className="rounded-xl h-10 px-4 font-medium border-rose-200 bg-rose-50/60 text-rose-600 hover:bg-rose-100"
          >
            Delete Record
          </Button>

          <Button
            icon={<PrinterOutlined />}
            onClick={handlePrint}
            className="rounded-xl h-10 px-4 font-medium border-gray-200"
          >
            Print Receipt
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
