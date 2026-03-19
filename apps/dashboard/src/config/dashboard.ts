export interface DashboardSection {
  id: number;
  componentType: string;
  title: string;
  props?: Record<string, unknown>;
}

export const DASHBOARD_SECTIONS: DashboardSection[] = [
  {
    id: 1,
    componentType: "AnalyticsDashboard",
    title: "Admin Engagement Analytics",
    props: {}
  }
];
