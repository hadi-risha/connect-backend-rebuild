export interface IDashboardRepository {
  getUserStats(): Promise<{
    totalUsers: number;
    instructors: number;
    students: number;
  }>;

  getBookingStats(
    start?: Date,
    end?: Date
  ): Promise<{
    totalBookings: number;
    completed: number;
    cancelled: number;
  }>;

  getSessionsStats(): Promise<{
    totalSessions: number;
    upcomingSessions: number;
  }>;

  getRecentBookings(limit?: number): any;
}
