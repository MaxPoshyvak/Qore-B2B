export interface DashboardTodayTopDish {
    name: string;
    sold: number;
}

// Зведення для головного дашборду веню за поточний день
export interface DashboardTodayResponse {
    revenueToday: number;
    activeOrders: number;
    todayReservations: number;
    topDish: DashboardTodayTopDish | null;
}
