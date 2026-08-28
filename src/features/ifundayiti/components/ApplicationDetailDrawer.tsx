import { useState, type ReactNode } from "react";
import { Avatar, Button, Drawer } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileOutlined,
  EyeOutlined,
  DownloadOutlined,
  TrophyFilled,
} from "@ant-design/icons";
import { StatusTag } from "@/components/ui/StatusTag";
import { formatCurrency, formatDate, formatFileSize } from "@/lib/utils";
import { statusToneMap, statusLabelMap } from "../statusMaps";
import { DOCUMENT_LABELS, type Application, type ApplicationDocument, type ApplicationPeriod } from "../types";
import { StatusActionBar } from "./ApplicationActions";
import { DocumentPreviewModal } from "./DocumentPreviewModal";
import type { AppActionKey } from "../applicationActions";

export function ApplicationDetailDrawer({
  application,
  period,
  open,
  onClose,
  onAction,
}: {
  application: Application | null;
  period?: ApplicationPeriod;
  open: boolean;
  onClose: () => void;
  onAction: (key: AppActionKey, application: Application) => void;
}) {
  const [previewDoc, setPreviewDoc] = useState<ApplicationDocument | null>(null);

  if (!application) return null;

  const { personal, contact, identification, grant } = application;

  return (
    <>
      <Drawer open={open} onClose={onClose} width={520} title="Application details" destroyOnHidden>
        <div className="flex items-start gap-4">
          <Avatar src={personal.image} icon={<UserOutlined />} size={64} />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg font-semibold text-cloud-100">{personal.name}</h2>
            <p className="truncate text-sm text-mist-400">{grant.projectName}</p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <StatusTag tone={statusToneMap[application.status]}>{statusLabelMap[application.status]}</StatusTag>
              <span className="rounded-full border border-navy-600 bg-navy-800/60 px-2 py-0.5 font-mono text-[11px] text-mist-400">
                {application.trackingId}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl border border-navy-700/60 bg-navy-800/40 p-4 text-sm">
          <Field label="Application Period" value={period?.title ?? "—"} span />
          <Field label="Requested Amount" value={formatCurrency(grant.requestedAmount)} />
          <Field label="Submitted" value={formatDate(application.createdAt)} />
        </div>

        {(application.status === "winner" || application.award) && application.award && (
          <div className="mt-4 rounded-xl border border-[#f5b544]/30 bg-[#f5b544]/10 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#f5b544]">
              <TrophyFilled /> Winner award
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Field label="Award Amount" value={formatCurrency(application.award.awardAmount)} tone="gold" />
              <Field label="Transfer Date" value={formatDate(application.award.transferDate)} tone="gold" />
            </div>
            {application.award.adminNotes && (
              <p className="mt-3 text-xs leading-relaxed text-mist-300">{application.award.adminNotes}</p>
            )}
            {application.successStory && (
              <div className="mt-3 border-t border-[#f5b544]/20 pt-3">
                <div className="text-xs font-medium uppercase tracking-wide text-[#f5b544]/80">Success story</div>
                <p className="mt-1.5 text-sm leading-relaxed text-cloud-100">{application.successStory}</p>
              </div>
            )}
          </div>
        )}

        {application.status === "rejected" && application.rejectionReason && (
          <div className="mt-4 rounded-xl border border-danger/25 bg-danger/10 p-3.5 text-sm text-danger">
            <div className="mb-1 text-xs font-medium uppercase tracking-wide">Rejection reason</div>
            {application.rejectionReason}
          </div>
        )}

        <Section title="Personal details">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Field label="Date of Birth" value={formatDate(personal.dob)} />
            <Field label="Nationality" value={personal.nationality} />
            <Field label="Location" value={personal.location} />
            <Field label="Occupation" value={personal.occupation} />
          </div>
          <div className="mt-3">
            <div className="text-xs text-mist-600">Financial Background</div>
            <p className="mt-1 text-sm leading-relaxed text-mist-300">{personal.financialBackground}</p>
          </div>
        </Section>

        <Section title="Contact information">
          <div className="flex flex-col gap-2.5 rounded-xl border border-navy-700/60 bg-navy-800/40 p-4 text-sm">
            <ContactRow icon={<MailOutlined />} value={contact.email} href={`mailto:${contact.email}`} />
            <ContactRow icon={<PhoneOutlined />} value={contact.phone} href={`tel:${contact.phone}`} />
            <ContactRow icon={<EnvironmentOutlined />} value={personal.location} />
          </div>
        </Section>

        <Section title="Identification">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Field label="National ID" value={identification.nationalId || "—"} icon={<IdcardOutlined />} />
            <Field label="Passport" value={identification.passport || "—"} icon={<IdcardOutlined />} />
          </div>
        </Section>

        <Section title="Project information">
          <Field label="Project Name" value={grant.projectName} />
          <div className="mt-3">
            <div className="text-xs text-mist-600">Project Description</div>
            <p className="mt-1 text-sm leading-relaxed text-mist-300">{grant.projectDescription}</p>
          </div>
          <div className="mt-3">
            <div className="text-xs text-mist-600">Fund Usage</div>
            <p className="mt-1 text-sm leading-relaxed text-mist-300">{grant.fundUsage}</p>
          </div>
          <div className="mt-3">
            <div className="text-xs text-mist-600">Expected Impact</div>
            <p className="mt-1 text-sm leading-relaxed text-mist-300">{grant.expectedImpact}</p>
          </div>
        </Section>

        <Section title={`Documents (${application.documents.length})`}>
          {application.documents.length === 0 ? (
            <p className="rounded-xl border border-dashed border-navy-600/70 px-4 py-6 text-center text-sm text-mist-600">
              No documents were uploaded with this application.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {application.documents.map((doc) => (
                <DocumentRow key={doc.id} doc={doc} onPreview={() => setPreviewDoc(doc)} />
              ))}
            </div>
          )}
        </Section>

        <div className="sticky bottom-0 -mx-6 mt-6 border-t border-navy-700/60 bg-[#0f1230]/95 px-6 py-4 backdrop-blur">
          <StatusActionBar application={application} onAction={onAction} />
        </div>
      </Drawer>

      <DocumentPreviewModal doc={previewDoc} open={!!previewDoc} onClose={() => setPreviewDoc(null)} />
    </>
  );
}

function DocumentRow({ doc, onPreview }: { doc: ApplicationDocument; onPreview: () => void }) {
  const isPdf = doc.mimeType === "application/pdf";
  const isImage = doc.mimeType.startsWith("image/");
  const icon = isPdf ? <FilePdfOutlined /> : isImage ? <FileImageOutlined /> : <FileOutlined />;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-navy-700/60 bg-navy-800/40 p-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-700/60 text-lg text-mist-300">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-cloud-100">{DOCUMENT_LABELS[doc.type]}</div>
        <div className="truncate text-xs text-mist-600">
          {doc.fileName} · {formatFileSize(doc.size)}
        </div>
      </div>
      <Button size="small" icon={<EyeOutlined />} onClick={onPreview}>
        Preview
      </Button>
      <a href={doc.url} download={doc.fileName} target="_blank" rel="noreferrer">
        <Button size="small" icon={<DownloadOutlined />} aria-label="Download" />
      </a>
    </div>
  );
}

function ContactRow({ icon, value, href }: { icon: ReactNode; value: string; href?: string }) {
  const content = (
    <span className="flex items-center gap-2.5 text-mist-300">
      <span className="text-mist-600">{icon}</span>
      <span className="truncate">{value}</span>
    </span>
  );
  return href ? (
    <a href={href} className="transition hover:text-cloud-100">
      {content}
    </a>
  ) : (
    content
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-5">
      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-mist-600">{title}</div>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  icon,
  span,
  tone,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
  span?: boolean;
  tone?: "gold";
}) {
  return (
    <div className={span ? "col-span-2" : undefined}>
      <div className="text-xs text-mist-600">{label}</div>
      <div
        className={`mt-0.5 flex items-center gap-1.5 font-medium ${tone === "gold" ? "text-[#f5b544]" : "text-cloud-100"}`}
      >
        {icon && <span className="text-mist-600">{icon}</span>}
        {value}
      </div>
    </div>
  );
}
