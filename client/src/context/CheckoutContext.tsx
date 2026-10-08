import React, { createContext, useContext, useState } from 'react';
import { QuoteResponse } from '@freshagro/shared';

type CheckoutSource = 'cart' | 'buy-now';

interface CheckoutContextType {
  source: CheckoutSource;
  setSource: (source: CheckoutSource) => void;
  couponCode: string;
  setCouponCode: (code: string) => void;
  deliveryZone: 'inside_dhaka' | 'outside_dhaka';
  setDeliveryZone: (zone: 'inside_dhaka' | 'outside_dhaka') => void;
  quote: QuoteResponse | null;
  setQuote: (quote: QuoteResponse | null) => void;
  buyNowComboId: number | null;
  setBuyNowComboId: (id: number | null) => void;
  buyNowQuantity: number;
  setBuyNowQuantity: (qty: number) => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export const CheckoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [source, setSource] = useState<CheckoutSource>('cart');
  const [couponCode, setCouponCode] = useState('');
  const [deliveryZone, setDeliveryZone] = useState<'inside_dhaka' | 'outside_dhaka'>('inside_dhaka');
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  
  const [buyNowComboId, setBuyNowComboId] = useState<number | null>(null);
  const [buyNowQuantity, setBuyNowQuantity] = useState(1);

  return (
    <CheckoutContext.Provider value={{ 
      source, setSource, 
      couponCode, setCouponCode, 
      deliveryZone, setDeliveryZone, 
      quote, setQuote,
      buyNowComboId, setBuyNowComboId,
      buyNowQuantity, setBuyNowQuantity
    }}>
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) throw new Error('useCheckout must be used within CheckoutProvider');
  return context;
};
