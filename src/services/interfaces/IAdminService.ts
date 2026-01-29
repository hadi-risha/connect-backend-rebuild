export interface IAdminService {
  getAllUsers(): Promise<any>;

  toggleRole(userId: string): Promise<any>;

  toggleBlock(userId: string): Promise<any>;

  getAiRatingsForAdmin(): Promise<any>;

  getAllNotifications(): Promise<any>;

  createNotification(
    adminId: string,
    title: string,
    content: string
  ): Promise<any>;

  updateNotification(
    id: string,
    title: string,
    content: string
  ): Promise<any>;

  toggleVisibility(id: string): Promise<any>;

  getDashboardData(
    start?: string,
    end?: string
  ): Promise<any>;
}
