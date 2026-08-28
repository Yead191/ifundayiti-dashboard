import type { ThemeConfig } from "antd";

/**
 * Ant Design theme tokens mapped to the Hubology frontend design system:
 * deep navy base, violet gradient accents, glassmorphic surfaces.
 */
export const hubologyTheme: ThemeConfig = {
  token: {
    colorPrimary: "#8131f0",
    colorInfo: "#8131f0",
    colorSuccess: "#34d399",
    colorWarning: "#f5b544",
    colorError: "#f2617a",
    colorLink: "#9d5cf5",

    colorBgBase: "#090b1b",
    colorBgContainer: "#121531",
    colorBgElevated: "#151935",
    colorBgLayout: "#090b1b",
    colorBgSpotlight: "#191d3f",

    colorText: "#eef0fb",
    colorTextSecondary: "#9ca3c9",
    colorTextTertiary: "#6b7299",
    colorTextDescription: "#9ca3c9",

    colorBorder: "#23274f",
    colorBorderSecondary: "#191d3f",
    colorSplit: "#191d3f",

    fontFamily: `"Manrope", ui-sans-serif, system-ui, sans-serif`,
    fontSize: 14,
    borderRadius: 10,
    borderRadiusLG: 14,
    borderRadiusSM: 8,

    controlHeight: 38,
    controlHeightLG: 44,

    boxShadow: "0 12px 32px -12px rgba(0,0,0,0.55)",
    boxShadowSecondary: "0 8px 24px -10px rgba(0,0,0,0.5)",
  },
  components: {
    Layout: {
      headerBg: "rgba(9, 11, 27, 0.72)",
      siderBg: "#0d1026",
      bodyBg: "#090b1b",
    },
    Menu: {
      itemBg: "transparent",
      itemColor: "#9ca3c9",
      itemHoverColor: "#eef0fb",
      itemHoverBg: "rgba(129,49,240,0.10)",
      itemSelectedBg: "rgba(129,49,240,0.22)",
      itemSelectedColor: "#eef0fb",
      subMenuItemBg: "transparent",
      itemBorderRadius: 10,
      itemMarginInline: 8,
    },
    Table: {
      headerBg: "#151935",
      headerColor: "#9ca3c9",
      rowHoverBg: "rgba(129,49,240,0.07)",
      borderColor: "#1c2044",
      colorBgContainer: "#121531",
    },
    Card: {
      colorBgContainer: "#121531",
      colorBorderSecondary: "#1c2044",
    },
    Modal: {
      contentBg: "#141737",
      headerBg: "#141737",
      titleColor: "#eef0fb",
    },
    Drawer: {
      colorBgElevated: "#0f1230",
    },
    Input: {
      colorBgContainer: "#0f1230",
      activeBorderColor: "#8131f0",
      hoverBorderColor: "#6b26cc",
    },
    Select: {
      colorBgContainer: "#0f1230",
      optionSelectedBg: "rgba(129,49,240,0.18)",
    },
    Button: {
      primaryShadow: "0 8px 24px -8px rgba(129,49,240,0.55)",
      fontWeight: 600,
    },
    Tabs: {
      itemColor: "#9ca3c9",
      itemSelectedColor: "#eef0fb",
      itemHoverColor: "#eef0fb",
      inkBarColor: "#8131f0",
    },
    Tag: {
      defaultBg: "#191d3f",
      defaultColor: "#9ca3c9",
    },
    Tooltip: {
      colorBgSpotlight: "#1c2044",
    },
    Pagination: {
      colorBgContainer: "#121531",
    },
    Statistic: {
      colorText: "#eef0fb",
    },
  },
};
