import { useState } from "react";
import { Badge, Tabs } from "antd";
import { BookOutlined, ShopOutlined } from "@ant-design/icons";
import { GlassCard } from "@/components/ui/GlassCard";
import { useGetBooksQuery } from "@/redux/features/store/storeApi";
import type { BookType } from "@/redux/features/store/store.types";
import { ProductsCatalog } from "./components/ProductsCatalog";

function useTypeCount(type: BookType) {
  const { data } = useGetBooksQuery({ page: 1, limit: 1, type });
  return data?.pagination?.total ?? 0;
}

export default function StorePage() {
  const [activeType, setActiveType] = useState<BookType>("digital");
  const digitalCount = useTypeCount("digital");
  const officeCount = useTypeCount("office");

  return (
    <div>
      <div className="aurora-field glass-panel mb-6 overflow-hidden p-6 md:p-7">
        <div className="relative flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="pointer-events-none absolute -right-8 -top-16 h-40 w-40 rounded-full bg-violet-600/25 blur-[60px]" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-36 w-36 rounded-full bg-warning/10 blur-[50px]" />

          <div className="relative flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#8131F0] to-[#4A1C8A] shadow-[0_8px_24px_-8px_rgba(129,49,240,0.65)]">
              <ShopOutlined className="text-lg text-white" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-cloud-100">Store catalog</h2>
              <p className="mt-1 max-w-xl text-sm text-mist-400">
                Curate digital downloads and office essentials. Upload cover art, manage stock, and keep
                product details current.
              </p>
            </div>
          </div>

          <div className="relative flex gap-2">
            <div className="rounded-2xl border border-violet-600/25 bg-violet-600/10 px-4 py-3 text-sm">
              <div className="font-semibold text-violet-glow">{digitalCount} digital</div>
              <div className="text-xs text-mist-400">Downloads & guides</div>
            </div>
            <div className="rounded-2xl border border-info/25 bg-info/10 px-4 py-3 text-sm">
              <div className="font-semibold text-info">{officeCount} office</div>
              <div className="text-xs text-mist-400">Physical goods</div>
            </div>
          </div>
        </div>
      </div>

      <GlassCard flat padded={false}>
        <div className="px-4 pt-2 md:px-5">
          <Tabs
            activeKey={activeType}
            onChange={(key) => setActiveType(key as BookType)}
            items={[
              {
                key: "digital",
                label: (
                  <span className="flex items-center gap-2">
                    <BookOutlined />
                    Digital products
                    <Badge
                      count={digitalCount}
                      showZero
                      overflowCount={999}
                      style={{
                        backgroundColor: activeType === "digital" ? "#8131F0" : "#23274f",
                        color: activeType === "digital" ? "#fff" : "#9ca3c9",
                        boxShadow: "none",
                      }}
                    />
                  </span>
                ),
              },
              {
                key: "office",
                label: (
                  <span className="flex items-center gap-2">
                    <ShopOutlined />
                    Office supplies
                    <Badge
                      count={officeCount}
                      showZero
                      overflowCount={999}
                      style={{
                        backgroundColor: activeType === "office" ? "#8131F0" : "#23274f",
                        color: activeType === "office" ? "#fff" : "#9ca3c9",
                        boxShadow: "none",
                      }}
                    />
                  </span>
                ),
              },
            ]}
          />
        </div>

        <div className="border-t border-navy-700/60 p-4 md:p-5">
          <ProductsCatalog type={activeType} />
        </div>
      </GlassCard>
    </div>
  );
}
