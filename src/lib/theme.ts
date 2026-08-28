import type { ThemeConfig } from "antd";

/**
 * Ant Design theme tokens mapped to the Hubology frontend design system:
 * deep navy base, violet gradient accents, glassmorphic surfaces.
 */
export const hubologyTheme: ThemeConfig = {
  token: {
    colorPrimary: "#0B3D2E",
    colorInfo: "#0B3D2E",
    colorSuccess: "#0D8A5F",
    colorWarning: "#D97706",
    colorError: "#DC2626",
    colorLink: "#0B3D2E",

    colorBgBase: "#F7FAF8",
    colorBgContainer: "#FFFFFF",
    colorBgElevated: "#FFFFFF",
    colorBgLayout: "#F7FAF8",
    colorBgSpotlight: "#142921",

    colorText: "#142921",
    colorTextSecondary: "#455850",
    colorTextTertiary: "#6B7F76",
    colorTextDescription: "#6B7F76",

    colorBorder: "#E2EAE6",
    colorBorderSecondary: "#EBF1EE",
    colorSplit: "#EBF1EE",

    fontFamily: `"Manrope", ui-sans-serif, system-ui, sans-serif`,
    fontSize: 14,
    borderRadius: 10,
    borderRadiusLG: 14,
    borderRadiusSM: 8,

    controlHeight: 38,
    controlHeightLG: 44,

    boxShadow: "0 10px 30px -10px rgba(11, 61, 46, 0.08)",
    boxShadowSecondary: "0 6px 20px -8px rgba(11, 61, 46, 0.06)",
  },
  components: {
    Layout: {
      headerBg: "rgba(247, 250, 248, 0.8)",
      siderBg: "#FFFFFF",
      bodyBg: "#F7FAF8",
    },
    Menu: {
      itemBg: "transparent",
      itemColor: "#455850",
      itemHoverColor: "#142921",
      itemHoverBg: "rgba(11, 61, 46, 0.05)",
      itemSelectedBg: "rgba(11, 61, 46, 0.08)",
      itemSelectedColor: "#0B3D2E",
      subMenuItemBg: "transparent",
      itemBorderRadius: 10,
      itemMarginInline: 8,
    },
    Table: {
      headerBg: "#F0F4F2",
      headerColor: "#455850",
      rowHoverBg: "rgba(11, 61, 46, 0.03)",
      borderColor: "#E2EAE6",
      colorBgContainer: "#FFFFFF",
    },
    Card: {
      colorBgContainer: "#FFFFFF",
      colorBorderSecondary: "#E2EAE6",
    },
    Modal: {
      contentBg: "#FFFFFF",
      headerBg: "#FFFFFF",
      titleColor: "#142921",
    },
    Drawer: {
      colorBgElevated: "#FFFFFF",
    },
    Input: {
      colorBgContainer: "#FFFFFF",
      activeBorderColor: "#0B3D2E",
      hoverBorderColor: "#0F523E",
    },
    Select: {
      colorBgContainer: "#FFFFFF",
      optionSelectedBg: "rgba(11, 61, 46, 0.08)",
    },
    Button: {
      primaryShadow: "0 4px 14px 0 rgba(11, 61, 46, 0.15)",
      fontWeight: 600,
    },
    Tabs: {
      itemColor: "#455850",
      itemSelectedColor: "#0B3D2E",
      itemHoverColor: "#0B3D2E",
      inkBarColor: "#0B3D2E",
    },
    Tag: {
      defaultBg: "#F0F4F2",
      defaultColor: "#455850",
    },
    Tooltip: {
      colorBgSpotlight: "#142921",
    },
    Pagination: {
      colorBgContainer: "#FFFFFF",
    },
    Statistic: {
      colorText: "#142921",
    },
  },
};
