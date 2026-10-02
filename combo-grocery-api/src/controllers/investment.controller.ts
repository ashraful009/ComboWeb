import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { validatedOf } from '../middlewares/validate';
import { createCampaignSchema, createInvestmentSchema } from '../validations/investment.validation';
import { InvestmentService } from '../services/investment.service';
import { requireUser } from '../utils/requireUser';

const service = new InvestmentService();

export const createCampaign = catchAsync(async (req, res) => {
  const { body } = validatedOf(req, createCampaignSchema);
  const data = await service.createCampaign(body);
  sendResponse(res, { statusCode: 201, message: 'Campaign created', data });
});

export const getActiveCampaigns = catchAsync(async (_req, res) => {
  const data = await service.getActiveCampaigns();
  sendResponse(res, { message: 'Active campaigns retrieved', data });
});

export const invest = catchAsync(async (req, res) => {
  const user = requireUser(req);
  const { body } = validatedOf(req, createInvestmentSchema);
  const data = await service.invest(user.id, body);
  sendResponse(res, { statusCode: 201, message: 'Investment request submitted', data });
});

export const getMyInvestments = catchAsync(async (req, res) => {
  const user = requireUser(req);
  const data = await service.getMyInvestments(user.id);
  sendResponse(res, { message: 'User investments retrieved', data });
});

export const getMyPayments = catchAsync(async (req, res) => {
  const user = requireUser(req);
  const data = await service.getMyPayments(user.id);
  sendResponse(res, { message: 'User investment payments retrieved', data });
});

export const getMySavings = catchAsync(async (req, res) => {
  const user = requireUser(req);
  const data = await service.getMySavings(user.id);
  sendResponse(res, { message: 'User savings retrieved', data });
});
