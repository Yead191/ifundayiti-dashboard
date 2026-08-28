import type { ReactNode } from "react";
import { ConfigProvider, App as AntdApp, theme as antdTheme } from "antd";
import { Toaster } from "sonner";
import { hubologyTheme } from "@/lib/theme";
import { IFundAyitiProvider } from "@/features/ifundayiti/IFundAyitiContext";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider theme={{ algorithm: antdTheme.darkAlgorithm, ...hubologyTheme }}>
      <AntdApp>
        <IFundAyitiProvider>
          {children}
          <Toaster
            theme="dark"
            position="top-right"
            richColors
            toastOptions={{
              style: {
                background: "#141737",
                border: "1px solid #23274f",
                color: "#eef0fb",
              },
            }}
          />
        </IFundAyitiProvider>
      </AntdApp>
    </ConfigProvider>
  );
}
