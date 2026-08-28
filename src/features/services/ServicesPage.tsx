import { useEffect, useState } from "react";
import { Button, Image, Segmented, Table, Tooltip, type TableProps } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, StarFilled } from "@ant-design/icons";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageToolbar } from "@/components/ui/PageToolbar";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchInput } from "@/components/ui/SearchInput";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toFileUrl } from "@/config";
import {
  useCreateServiceMutation,
  useDeleteServiceMutation,
  useGetServicesQuery,
  useUpdateServiceMutation,
} from "@/redux/features/services/servicesApi";
import { buildServiceFormData } from "@/redux/features/services/buildServiceFormData";
import type { ApiService, ServiceFormPayload } from "@/redux/features/services/services.types";
import { ServiceFormModal } from "./components/ServiceFormModal";

type FeaturedFilter = "all" | "featured" | "standard";

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const err = error as { data?: { message?: string }; message?: string };
    return err.data?.message ?? err.message ?? "Something went wrong. Please try again.";
  }
  return "Something went wrong. Please try again.";
}

export default function ServicesPage() {
  const { value: search, setValue: setSearch, debouncedValue: searchTerm } = useDebouncedSearch();
  const [featuredFilter, setFeaturedFilter] = useState<FeaturedFilter>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ApiService | null>(null);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const featuredParam =
    featuredFilter === "featured" ? true : featuredFilter === "standard" ? false : ("" as const);

  const { data, isFetching } = useGetServicesQuery({
    page,
    limit,
    searchTerm,
    featured: featuredParam,
  });

  const [createService, { isLoading: isCreating }] = useCreateServiceMutation();
  const [updateService, { isLoading: isUpdating }] = useUpdateServiceMutation();
  const [deleteService] = useDeleteServiceMutation();

  const services = data?.data ?? [];
  const pagination = data?.pagination;

  const deleteFlow = useConfirmDelete<ApiService>(async (record) => {
    try {
      await deleteService(record._id).unwrap();
      toast.success("Service removed", { description: `"${record.title}" is no longer listed.` });
    } catch (error) {
      toast.error("Couldn't delete service", { description: getErrorMessage(error) });
    }
  });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (service: ApiService) => {
    setEditing(service);
    setFormOpen(true);
  };

  const handleSubmit = async (payload: ServiceFormPayload) => {
    const body = buildServiceFormData(payload);
    try {
      if (editing) {
        await updateService({ id: editing._id, body }).unwrap();
        toast.success("Service updated", { description: `"${payload.title}" has been saved.` });
      } else {
        await createService(body).unwrap();
        toast.success("Service created", {
          description: `"${payload.title}" is now live on the services page.`,
        });
      }
      setFormOpen(false);
      setEditing(null);
    } catch (error) {
      toast.error(editing ? "Couldn't update service" : "Couldn't create service", {
        description: getErrorMessage(error),
      });
    }
  };

  const columns: TableProps<ApiService>["columns"] = [
    {
      title: "Service",
      key: "title",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Image
            src={toFileUrl(record.image)}
            alt={record.title}
            width={48}
            height={48}
            className="rounded-lg! object-cover!"
            style={{ objectFit: "cover" }}
            preview={{ mask: false }}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 font-medium text-cloud-100">
              {record.title}
              {record.featured && <StarFilled className="text-[12px] text-warning" />}
            </div>
            <div className="max-w-70 truncate text-xs text-mist-400">{record.tagline}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Price",
      key: "price",
      render: (_, record) => (
        <span className="font-medium text-cloud-100">{formatCurrency(record.price.amount)}</span>
      ),
    },
    {
      title: "Billed",
      key: "frequency",
      responsive: ["md"],
      render: (_, record) => <span className="text-mist-400">{record.price.frequency}</span>,
    },
    {
      title: "Features",
      key: "features",
      responsive: ["lg"],
      render: (_, record) => (
        <span className="text-mist-400">{record.features?.length ?? 0} items</span>
      ),
    },
    {
      title: "Updated",
      key: "updatedAt",
      responsive: ["lg"],
      render: (_, record) => <span className="text-mist-400">{formatDate(record.updatedAt)}</span>,
    },
    {
      title: "",
      key: "actions",
      width: 96,
      render: (_, record) => (
        <div className="flex items-center justify-end gap-1">
          <Tooltip title="Edit">
            <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          </Tooltip>
          <Tooltip title="Delete">
            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => deleteFlow.request(record)} />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageToolbar eyebrow="Manage services" count={pagination?.total}>
        <Segmented
          value={featuredFilter}
          onChange={(v) => {
            setFeaturedFilter(v as FeaturedFilter);
            setPage(1);
          }}
          options={[
            { label: "All", value: "all" },
            { label: "Featured", value: "featured" },
            { label: "Standard", value: "standard" },
          ]}
        />
        <SearchInput
          placeholder="Search services…"
          value={search}
          onChange={setSearch}
          className="w-56!"
        />
        <Button type="primary" icon={<PlusOutlined />} className="btn-gradient border-0!" onClick={openCreate}>
          New service
        </Button>
      </PageToolbar>

      <GlassCard flat padded={false}>
        {!isFetching && services.length === 0 ? (
          <EmptyState
            icon={<PlusOutlined />}
            title="No services found"
            description="Try clearing the search or filter, or create a new service package."
            actionLabel="New service"
            onAction={openCreate}
          />
        ) : (
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={services}
            loading={isFetching}
            pagination={{
              current: pagination?.page ?? page,
              pageSize: pagination?.limit ?? limit,
              total: pagination?.total ?? 0,
              showSizeChanger: true,
              hideOnSinglePage: false,
              onChange: (nextPage, nextPageSize) => {
                setPage(nextPage);
                setLimit(nextPageSize);
              },
            }}
          />
        )}
      </GlassCard>

      <ServiceFormModal
        open={formOpen}
        initial={editing}
        loading={isCreating || isUpdating}
        onCancel={() => {
          if (isCreating || isUpdating) return;
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDeleteModal
        open={deleteFlow.isOpen}
        title={`Delete "${deleteFlow.target?.title}"?`}
        description="This removes the service package from the live services page immediately. This can't be undone."
        loading={deleteFlow.loading}
        onConfirm={deleteFlow.confirm}
        onCancel={deleteFlow.cancel}
      />
    </div>
  );
}
