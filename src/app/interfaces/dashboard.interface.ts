export type DashboardType = 'project'; // Add more types later

export interface DashboardItem {
  type: DashboardType;
  itemId: number;
}
