import { useMemo, useState } from "react";
import { Input, Table, type TableProps } from "antd";
import { SearchOutlined, HeartOutlined, GiftOutlined, WalletOutlined, DollarOutlined } from "@ant-design/icons";
import { StatCard } from "@/components/ui/StatCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { useIFundAyiti } from "./IFundAyitiContext";
import { computeStats } from "./selectors";
import type { Donation } from "./types";

export default function DonationsPage() {
  const { donations, applications } = useIFundAyiti();
  const [search, setSearch] = useState("");

  const stats = useMemo(() => computeStats(applications, donations), [applications, donations]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return donations
      .filter((d) =>
        !term
          ? true
          : d.donor.toLowerCase().includes(term) ||
            d.email.toLowerCase().includes(term) ||
            d.transactionId.toLowerCase().includes(term)
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [donations, search]);

  const columns: TableProps<Donation>["columns"] = [
    {
      title: "Donor",
      key: "donor",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-success/12 text-success">
            <HeartOutlined />
          </div>
          <span className="font-medium text-cloud-100">{record.donor}</span>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      responsive: ["md"],
      render: (value: string) => <span className="text-mist-400">{value}</span>,
    },
    {
      title: "Amount",
      key: "amount",
      sorter: (a, b) => a.amount - b.amount,
      render: (_, record) => <span className="font-semibold text-success">{formatCurrency(record.amount)}</span>,
    },
    {
      title: "Transaction ID",
      dataIndex: "transactionId",
      key: "transactionId",
      responsive: ["lg"],
      render: (value: string) => <span className="font-mono text-xs text-mist-400">{value}</span>,
    },
    {
      title: "Date",
      key: "date",
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      render: (_, record) => <span className="text-mist-400">{formatDateTime(record.date)}</span>,
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total donations" value={formatCurrency(stats.totalDonations)} icon={<DollarOutlined />} tone="success" />
        <StatCard label="Awarded grants" value={formatCurrency(stats.awardedGrants)} icon={<GiftOutlined />} tone="gold" />
        <StatCard
          label="Current program fund"
          value={formatCurrency(stats.currentProgramFund)}
          icon={<WalletOutlined />}
          tone="info"
        />
      </div>

      <div className="mb-4 mt-6 flex justify-end">
        <Input
          allowClear
          prefix={<SearchOutlined className="text-mist-600" />}
          placeholder="Search donor, email, transaction…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:!w-72"
        />
      </div>

      <GlassCard flat padded={false}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<HeartOutlined />}
            title="No donations found"
            description="Donations to the IFundAyiti Program Fund will appear here."
          />
        ) : (
          <Table rowKey="id" columns={columns} dataSource={filtered} pagination={{ pageSize: 10, hideOnSinglePage: true }} />
        )}
      </GlassCard>
    </div>
  );
}
