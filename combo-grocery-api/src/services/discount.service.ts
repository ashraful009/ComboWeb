import { DiscountRepository } from '../repositories/discount.repository';
import { ComboRepository } from '../repositories/combo.repository';
import { InvestmentRepository } from '../repositories/investment.repository';
import { calculatePrice } from '../utils/pricing.util';
import type { DiscountRow } from '../types/discount.types';
import type { PricedCombo, PricedComboDetail } from '../types/pricing.types';

export class DiscountService {
  private discountRepo = new DiscountRepository();
  private comboRepo = new ComboRepository();
  private investmentRepo = new InvestmentRepository();

  private resolveOverallDiscount(combo: any, activeDiscounts: DiscountRow[]): number {
    let matchedDiscount = activeDiscounts.find(d => d.target_type === 'combo' && d.target_id === combo.id);
    if (!matchedDiscount) {
      matchedDiscount = activeDiscounts.find(d => d.target_type === 'category' && d.target_id === combo.category_id);
    }
    if (!matchedDiscount) {
      matchedDiscount = activeDiscounts.find(d => d.target_type === 'global');
    }

    let overallDiscountPaisa = 0;
    if (matchedDiscount) {
      if (matchedDiscount.discount_type === 'fixed') {
        overallDiscountPaisa = matchedDiscount.discount_value;
      } else if (matchedDiscount.discount_type === 'percentage') {
        let calculated = Math.floor(combo.base_price_paisa * (matchedDiscount.discount_value / 100));
        if (matchedDiscount.max_cap_paisa && calculated > matchedDiscount.max_cap_paisa) {
          calculated = matchedDiscount.max_cap_paisa;
        }
        overallDiscountPaisa = calculated;
      }
    }
    return overallDiscountPaisa;
  }

  private async getInvestorDiscountPercentage(userId?: number): Promise<number> {
    if (!userId) return 0;
    const investments = await this.investmentRepo.getMyInvestments(userId);
    if (!investments || investments.length === 0) return 0;
    
    // Find highest active ROI
    const activeInvestments = investments.filter(i => i.status === 'active');
    if (activeInvestments.length === 0) return 0;

    return Math.max(...activeInvestments.map(i => Number(i.roi_percentage)));
  }

  async createDiscount(data: Partial<DiscountRow>): Promise<DiscountRow> {
    const id = await this.discountRepo.create({
      ...data,
      start_date: new Date(data.start_date!),
      end_date: new Date(data.end_date!)
    });
    return { id, ...data } as DiscountRow;
  }

  /** Gets combos and applies active public discounts. */
  async getCombosWithDynamicPrices(): Promise<PricedCombo[]> {
    const combos = await this.comboRepo.findAllActive();
    const activeDiscounts = await this.discountRepo.getActiveDiscounts(new Date());

    return combos.map((combo: any) => {
      const overallDiscountPaisa = this.resolveOverallDiscount(combo, activeDiscounts);

      // Calculate final public price (no investor discount in public view list)
      const finalPrice = calculatePrice({
        basePricePaisa: combo.base_price_paisa,
        overallDiscountPaisa: overallDiscountPaisa,
        investorDiscountPercentage: 0,
        stackingMode: 'additive' // Default for now
      });

      return {
        ...combo,
        overall_discount_paisa: overallDiscountPaisa,
        final_price_paisa: finalPrice,
      };
    });
  }

  async getComboByIdWithDynamicPrices(id: number, userId?: number): Promise<PricedComboDetail | null> {
    const combo = await this.comboRepo.findById(id);
    if (!combo) return null;

    const activeDiscounts = await this.discountRepo.getActiveDiscounts(new Date());
    const overallDiscountPaisa = this.resolveOverallDiscount(combo, activeDiscounts);
    const investorDiscountPercentage = await this.getInvestorDiscountPercentage(userId);

    const finalPrice = calculatePrice({
      basePricePaisa: combo.base_price_paisa,
      overallDiscountPaisa: overallDiscountPaisa,
      investorDiscountPercentage: 0,
      stackingMode: 'additive'
    });

    const investorPrice = calculatePrice({
      basePricePaisa: combo.base_price_paisa,
      overallDiscountPaisa: overallDiscountPaisa,
      investorDiscountPercentage: investorDiscountPercentage,
      stackingMode: 'additive'
    });

    return {
      ...combo,
      discount_paisa: overallDiscountPaisa, // Map to discount_paisa for detail page
      final_price_paisa: finalPrice,
      investor_price_paisa: investorPrice
    };
  }
}
