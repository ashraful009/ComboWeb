import { pool } from '../config/db';
import { RowDataPacket } from 'mysql2';
import { formatInTimeZone } from 'date-fns-tz';

export const getDashboardStats = async () => {
  const timeZone = 'Asia/Dhaka';
  const now = new Date();
  const todayStr = formatInTimeZone(now, timeZone, 'yyyy-MM-dd');
  const yesterdayStr = formatInTimeZone(new Date(now.getTime() - 86400000), timeZone, 'yyyy-MM-dd');

  // Today Sales
  const [todaySalesRow] = await pool.query<RowDataPacket[]>(
    `SELECT SUM(grand_total) as total FROM orders WHERE DATE(CONVERT_TZ(created_at, '+00:00', '+06:00')) = ? AND order_status != 'cancelled'`,
    [todayStr]
  );
  const todaySales = todaySalesRow[0].total || 0;

  // Yesterday Sales
  const [yesterdaySalesRow] = await pool.query<RowDataPacket[]>(
    `SELECT SUM(grand_total) as total FROM orders WHERE DATE(CONVERT_TZ(created_at, '+00:00', '+06:00')) = ? AND order_status != 'cancelled'`,
    [yesterdayStr]
  );
  const yesterdaySales = yesterdaySalesRow[0].total || 0;
  
  let salesChangePercent = 0;
  if (yesterdaySales > 0) {
    salesChangePercent = Math.round(((todaySales - yesterdaySales) / yesterdaySales) * 100);
  } else if (todaySales > 0) {
    salesChangePercent = 100;
  }

  // Today Orders
  const [todayOrdersRow] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) as count FROM orders WHERE DATE(CONVERT_TZ(created_at, '+00:00', '+06:00')) = ?`,
    [todayStr]
  );
  const todayOrders = todayOrdersRow[0].count;

  // Active Deliveries
  const [activeDeliveriesRow] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) as count FROM orders WHERE order_status IN ('confirmed', 'packed', 'out_for_delivery')`
  );
  const activeDeliveries = activeDeliveriesRow[0].count;

  // Combos
  const [combosRow] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) as total, SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active FROM combos`
  );
  const totalCombos = combosRow[0].total || 0;
  const activeCombos = combosRow[0].active || 0;

  // Recent Orders
  const [recentOrders] = await pool.query<RowDataPacket[]>(
    `SELECT id, order_no, customer_name, grand_total, order_status, payment_status, created_at 
     FROM orders ORDER BY created_at DESC LIMIT 10`
  );

  return {
    todaySales,
    salesChangePercent,
    todayOrders,
    activeDeliveries,
    totalCombos,
    activeCombos,
    recentOrders
  };
};
