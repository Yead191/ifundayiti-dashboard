import { useCallback, useEffect, useMemo, useState, type UIEvent } from "react";
import { Avatar, Select, Spin } from "antd";
import { UserOutlined } from "@ant-design/icons";
import type { DefaultOptionType } from "antd/es/select";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { getImageUrl } from "@/lib/getImageUrl";
import { useGetUsersQuery } from "@/redux/features/users/usersApi";
import type { ApiUser } from "@/redux/features/users/users.types";
import type { PartnerUser } from "@/redux/features/partners/partners.types";

const PAGE_SIZE = 20;

function toPartnerUser(user: ApiUser): PartnerUser {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    image: user.image,
  };
}

export function UserSearchSelect({
  value,
  onChange,
  initialUser,
  disabled,
}: {
  value?: string | null;
  onChange: (userId: string | null, user?: PartnerUser | null) => void;
  initialUser?: PartnerUser | null;
  disabled?: boolean;
}) {
  const { value: search, setValue: setSearch, debouncedValue: searchTerm } = useDebouncedSearch();
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<PartnerUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<PartnerUser | null>(initialUser ?? null);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  useEffect(() => {
    setSelectedUser(initialUser ?? null);
  }, [initialUser]);

  const { data, isFetching, isLoading } = useGetUsersQuery({
    page,
    limit: PAGE_SIZE,
    searchTerm,
  });

  useEffect(() => {
    const batch = (data?.data ?? []).map(toPartnerUser);
    if (page === 1) {
      setUsers(batch);
      return;
    }
    setUsers((prev) => {
      const seen = new Set(prev.map((u) => u._id));
      return [...prev, ...batch.filter((u) => !seen.has(u._id))];
    });
  }, [data, page]);

  const hasMore = (data?.pagination?.page ?? 1) < (data?.pagination?.totalPage ?? 1);

  const options: DefaultOptionType[] = useMemo(() => {
    const list = [...users];
    if (selectedUser && !list.some((u) => u._id === selectedUser._id)) {
      list.unshift(selectedUser);
    }
    return list.map((user) => ({
      value: user._id,
      label: user.name,
      user,
    }));
  }, [users, selectedUser]);

  const handlePopupScroll = useCallback(
    (event: UIEvent<HTMLDivElement>) => {
      const target = event.target as HTMLDivElement;
      if (isFetching || !hasMore) return;
      if (target.scrollTop + target.offsetHeight >= target.scrollHeight - 24) {
        setPage((p) => p + 1);
      }
    },
    [hasMore, isFetching]
  );

  return (
    <Select
      allowClear
      showSearch
      filterOption={false}
      placeholder="Link a user account (optional)"
      value={value ?? undefined}
      disabled={disabled}
      loading={isLoading && page === 1}
      notFoundContent={isFetching ? <Spin size="small" /> : "No users found"}
      options={options}
      onSearch={setSearch}
      onPopupScroll={handlePopupScroll}
      onClear={() => {
        setSelectedUser(null);
        onChange(null, null);
      }}
      onChange={(nextId, option) => {
        if (!nextId) {
          setSelectedUser(null);
          onChange(null, null);
          return;
        }
        const user =
          (option as DefaultOptionType & { user?: PartnerUser })?.user ??
          users.find((u) => u._id === nextId) ??
          selectedUser;
        if (user) setSelectedUser(user);
        onChange(nextId, user ?? null);
      }}
      optionRender={(option) => {
        const user = (option.data as { user?: PartnerUser })?.user;
        if (!user) return option.label;
        return (
          <div className="flex items-center gap-2 py-0.5">
            <Avatar
              src={getImageUrl(user.image)}
              icon={<UserOutlined />}
              size={28}
              className="shrink-0 bg-violet-600/25! text-violet-glow!"
            />
            <div className="min-w-0">
              <div className="truncate text-sm text-cloud-100">{user.name}</div>
              <div className="truncate text-xs text-mist-500">{user.email}</div>
            </div>
          </div>
        );
      }}
      labelRender={(props) => {
        const user = selectedUser ?? users.find((u) => u._id === props.value);
        if (!user) return props.label;
        return (
          <span className="flex items-center gap-2">
            <Avatar
              src={getImageUrl(user.image)}
              icon={<UserOutlined />}
              size={20}
              className="bg-violet-600/25! text-violet-glow!"
            />
            <span className="truncate">{user.name}</span>
          </span>
        );
      }}
      className="w-full!"
    />
  );
}
