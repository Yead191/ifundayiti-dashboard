import type { ReactNode } from "react";
import { ConfigProvider, App as AntdApp, theme as antdTheme } from "antd";
import { Toaster } from "sonner";
import { hubologyTheme } from "@/lib/theme";
import { IFundAyitiProvider } from "@/features/core/IFundAyitiContext";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider theme={{ algorithm: antdTheme.defaultAlgorithm, ...hubologyTheme }}>
      <AntdApp>
        <IFundAyitiProvider>
          {children}
          <Toaster
            theme="light"
            position="top-right"
            richColors
            toastOptions={{
              style: {
                background: "#ffffff",
                border: "1px solid #e2eae6",
                color: "#142921",
              },
            }}
          />
        </IFundAyitiProvider>
      </AntdApp>
    </ConfigProvider>
  );
}
