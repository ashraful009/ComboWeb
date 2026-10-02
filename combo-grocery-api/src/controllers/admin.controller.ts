import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { db } from '../config/db';

export const getDashboardStats = catchAsync(async (_req, res) => {
  // Aggregate stats from database
  // Note: Using raw queries or simple knex counts for performance on dashboard
  
  const [
    salesResult, 
    ordersResult, 
    investorsResult, 
    combosResult
  ] = await Promise.all([
    db('orders').where('status', 'completed').sum('total_amount_paisa as total').first().catch(() => ({ total: 0 })),
    db('orders').where('status', 'pending').count('* as count').first().catch(() => ({ count: 0 })),
    db('users').where('role', 'investor').count('* as count').first().catch(() => ({ count: 0 })),
    db('combos').where('is_active', true).count('* as count').first().catch(() => ({ count: 0 }))
  ]);

  const stats = {
    todaysSalesPaisa: Number(salesResult?.total || 0),
    monthlyRevenuePaisa: Number(salesResult?.total || 0) * 30, // Mocked projection for now
    pendingOrdersCount: Number(ordersResult?.count || 0),
    lowStockItemsCount: 3, // Mocked for now until inventory threshold is defined
    activeInvestorsCount: Number(investorsResult?.count || 0),
    pendingReviewsCount: 6, // Mocked for now
    totalActiveCombos: Number(combosResult?.count || 0),
    marginHealthPercent: 22.4 // Mocked for now
  };

  sendResponse(res, { message: 'Dashboard stats retrieved', data: stats });
});

export const getPendingInvestors = catchAsync(async (_req, res) => {
  // Fetch users with pending investment status
  // Mocking real structure as table might not be fully populated
  const data = [
    { id: '1', name: 'Md. Rafiq', plan: 'Gold', amount: 25000 },
    { id: '2', name: 'Tania Akter', plan: 'Silver', amount: 10000 }
  ];
  sendResponse(res, { message: 'Pending investors retrieved', data });
});

export const getRecentOrders = catchAsync(async (_req, res) => {
  // Fetch recent orders
  // Mocking for now to match UI until full order flow is tested
  const data = [
    { id: 'ORD-260921-001', customerType: 'investor', totalPaisa: 269500, status: 'pending' },
    { id: 'ORD-260921-002', customerType: 'normal', totalPaisa: 145000, status: 'confirmed' }
  ];
  sendResponse(res, { message: 'Recent orders retrieved', data });
});

export const reviewInvestment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  
  // Update investment status in DB
  await db('investments').where('id', id).update({ status, admin_notes: notes });
  
  // If approved, update user role to investor
  if (status === 'APPROVED') {
    const investment = await db('investments').where('id', id).first();
    if (investment) {
      await db('users').where('id', investment.user_id).update({ role: 'investor' });
    }
  }

  sendResponse(res, { message: `Investment ${status.toLowerCase()} successfully` });
});
