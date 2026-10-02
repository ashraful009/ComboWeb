export type StackingMode = 'additive' | 'sequential';

export interface PriceCalculationArgs {
  basePricePaisa: number;
  overallDiscountPaisa: number; // The absolute discount value from layer 1
  investorDiscountPercentage: number; // e.g. 5 for 5%
  stackingMode: StackingMode;
  costPricePaisa?: number; // Optional guard rail
}

export const calculatePrice = ({
  basePricePaisa,
  overallDiscountPaisa,
  investorDiscountPercentage,
  stackingMode,
  costPricePaisa
}: PriceCalculationArgs): number => {
  let finalPrice = basePricePaisa - overallDiscountPaisa;
  
  if (investorDiscountPercentage > 0) {
    if (stackingMode === 'additive') {
      const investorDiscount = Math.floor(basePricePaisa * (investorDiscountPercentage / 100));
      finalPrice = finalPrice - investorDiscount;
    } else { // sequential
      const sequentialBase = basePricePaisa - overallDiscountPaisa;
      const investorDiscount = Math.floor(sequentialBase * (investorDiscountPercentage / 100));
      finalPrice = finalPrice - investorDiscount;
    }
  }

  // Guard Rails
  if (finalPrice < 0) finalPrice = 0;
  if (costPricePaisa !== undefined && finalPrice < costPricePaisa) {
    finalPrice = costPricePaisa;
  }

  return finalPrice;
};
