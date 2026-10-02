import { CartRepository } from '../repositories/cart.repository';
import { DiscountService } from '../services/discount.service';

export class CartService {
  private cartRepo = new CartRepository();
  private discountService = new DiscountService(); // To get dynamic prices for cart items

  async viewCart(userId: number) {
    const cart = await this.cartRepo.getCartByUserId(userId);
    const items = await this.cartRepo.getCartItems(cart.id);

    // Fetch dynamic prices
    const dynamicallyPricedCombos = await this.discountService.getCombosWithDynamicPrices();

    let subtotalPaisa = 0;
    const enrichedItems = items.map(item => {
      const pricedCombo = dynamicallyPricedCombos.find((c: any) => c.id === item.combo_id);
      const finalUnit = pricedCombo ? pricedCombo.final_price_paisa : item.base_price_paisa;
      const lineTotal = finalUnit * item.quantity;
      subtotalPaisa += lineTotal;
      return {
        ...item,
        unit_price_paisa: finalUnit,
        line_total_paisa: lineTotal
      };
    });

    return {
      cart_id: cart.id,
      items: enrichedItems,
      subtotal_paisa: subtotalPaisa
    };
  }

  async addToCart(userId: number, data: { combo_id: number; quantity: number }) {
    const cart = await this.cartRepo.getCartByUserId(userId);
    await this.cartRepo.addOrUpdateCartItem(cart.id, data.combo_id, data.quantity);
    return this.viewCart(userId);
  }

  async removeFromCart(userId: number, itemId: number) {
    const cart = await this.cartRepo.getCartByUserId(userId);
    await this.cartRepo.removeItem(cart.id, itemId);
    return this.viewCart(userId);
  }

  async syncCart(userId: number, items: { combo_id: number, quantity: number }[]) {
    const cart = await this.cartRepo.getCartByUserId(userId);
    await this.cartRepo.syncCartItems(cart.id, items);
    return this.viewCart(userId);
  }
}
