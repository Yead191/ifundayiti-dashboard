import { StarFilled, StarOutlined } from "@ant-design/icons";

export function RatingStars({ value, size = 12 }: { value: number; size?: number }) {
  const rounded = Math.round(value);
  return (
    <span className="inline-flex items-center gap-0.5" style={{ fontSize: size }}>
      {Array.from({ length: 5 }).map((_, i) =>
        i < rounded ? (
          <StarFilled key={i} className="text-warning" />
        ) : (
          <StarOutlined key={i} className="text-mist-600" />
        )
      )}
    </span>
  );
}
