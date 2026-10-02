import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { syncCart } from '../api/cart.api';
import { useAuthStore } from './auth.store';

export interface CartItem {
  comboId: number;
  comboName: string;
  quantity: number;
  basePrice: number;
  finalPrice: number;
  image?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (comboId: number) => void;
  updateQuantity: (comboId: number, delta: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

const syncWithServer = async (items: CartItem[]) => {
  const token = useAuthStore.getState().token;
  if (!token) return;

  try {
    const payload = items.map(i => ({
      combo_id: i.comboId,
      quantity: i.quantity,
      price_paisa: i.finalPrice,
      name: i.comboName
    }));
    await syncCart(payload);
  } catch (error) {
    console.error('Failed to sync cart with server:', error);
  }
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        set((state) => {
          const existingItem = state.items.find(i => i.comboId === newItem.comboId);
          let newItems;
          if (existingItem) {
            newItems = state.items.map(i => 
              i.comboId === newItem.comboId 
                ? { ...i, quantity: i.quantity + newItem.quantity }
                : i
            );
          } else {
            newItems = [...state.items, newItem];
          }
          syncWithServer(newItems);
          return { items: newItems };
        });
      },
      removeItem: (comboId) => {
        set((state) => {
          const newItems = state.items.filter(i => i.comboId !== comboId);
          syncWithServer(newItems);
          return { items: newItems };
        });
      },
      updateQuantity: (comboId, delta) => {
        set((state) => {
          const newItems = state.items.map(i => {
            if (i.comboId === comboId) {
              const newQty = Math.max(1, i.quantity + delta);
              return { ...i, quantity: newQty };
            }
            return i;
          });
          syncWithServer(newItems);
          return { items: newItems };
        });
      },
      clearCart: () => {
        set({ items: [] });
        syncWithServer([]);
      },
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      getSubtotal: () => {
        return get().items.reduce((total, item) => total + (item.finalPrice * item.quantity), 0);
      }
    }),
    {
      name: 'aggrigo-cart-storage',
    }
  )
);