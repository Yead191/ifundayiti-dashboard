import { Input, type InputProps } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { cn } from "@/lib/utils";

type SearchInputProps = Omit<InputProps, "value" | "onChange" | "prefix"> & {
  value: string;
  onChange: (value: string) => void;
};

/**
 * Shared search field used across list pages. Pair with `useDebouncedSearch`
 * so queries fire after the user pauses typing — no Enter required.
 */
export function SearchInput({ value, onChange, className, allowClear = true, ...rest }: SearchInputProps) {
  return (
    <Input
      allowClear={allowClear}
      prefix={<SearchOutlined className="text-mist-600" />}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(className)}
      {...rest}
    />
  );
}
