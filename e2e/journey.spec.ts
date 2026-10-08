import { test, expect } from '@playwright/test';

test.describe('E2E Full Journey', () => {
  test('Complete flow: Admin creates combo -> visitor buys -> admin checks order', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
    
    // 1. Admin login
    await page.goto('/admin');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'secret'); // Or whatever the local test password is
    await page.click('button:has-text("Login")');
    await expect(page.locator('text=Dashboard').first()).toBeVisible();

    // 2. Admin creates a new combo
    await page.click('text=Combos');
    await page.click('button:has-text("Create Combo")');
    await page.fill('input[name="name_en"]', 'E2E Test Combo');
    await page.fill('input[name="name_bn"]', 'ই২ই টেস্ট কম্বো');
    await page.fill('input[name="price"]', '1250');
    await page.fill('input[name="market_price"]', '1500');
    // Add 1 item
    await page.click('button:has-text("Add Item")');
    await page.fill('input[placeholder="Name EN"]', 'Test Item 1');
    await page.fill('input[placeholder="Name BN"]', 'টেস্ট আইটেম ১');
    await page.fill('input[placeholder="Qty (e.g. 1 kg)"]', '1 kg');
    await page.fill('input[placeholder="Mkt Price ৳"]', '600');
    await page.fill('input[placeholder="Our Price ৳"]', '500');
    await page.click('button:has-text("Save Combo")');
    await expect(page.locator('text=E2E Test Combo')).toBeVisible();

    // 3. Admin creates a coupon
    await page.click('text=Coupons');
    await page.click('button:has-text("Create Coupon")');
    await page.fill('input[name="code"]', 'E2ESAVE100');
    await page.selectOption('select[name="type"]', 'fixed');
    await page.fill('input[name="value"]', '100');
    await page.fill('input[name="min_order_amount"]', '500');
    await page.click('button:has-text("Save Coupon")');
    await expect(page.locator('text=E2ESAVE100')).toBeVisible();

    // 4. Visitor opens Home
    await page.goto('/');
    await page.click('button:has-text("EN / বাংলা")'); // Switch to English
    await expect(page.locator('text=E2E Test Combo')).toBeVisible();

    // 5. Add to Cart
    const comboCard = page.locator('.combo-card').filter({ hasText: 'E2E Test Combo' });
    await comboCard.locator('button:has-text("Add to Cart")').click();
    
    // Check Drawer
    await expect(page.locator('button:has-text("View Full Cart")')).toBeVisible();
    // Go to Cart to apply coupon
    await page.click('button:has-text("View Full Cart")');
    
    // Apply coupon in Cart
    await expect(page).toHaveURL(/.*\/cart/);
    await page.fill('input[placeholder="Coupon code"]', 'E2ESAVE100');
    await page.click('button:has-text("Apply")');
    await expect(page.locator('text=৳100')).toBeVisible();
    
    // Proceed to Checkout
    await page.click('button:has-text("Checkout")');

    // 6. Checkout
    await expect(page).toHaveURL(/.*\/checkout/);
    await page.fill('input[name="customer_name"]', 'Test User');
    await page.fill('input[name="phone"]', '01711000000');
    await page.fill('textarea[name="address"]', 'Test Address');
    await page.fill('input[name="thana"]', 'Test Thana');
    await page.selectOption('select[name="division"]', { label: 'Dhaka' });
    await page.selectOption('select[name="district"]', { label: 'Dhaka' });

    // Select COD
    await page.locator('label', { hasText: 'Cash on Delivery' }).click();
    
    // Accept Terms
    await page.locator('label', { hasText: 'I agree to terms' }).click();
    
    // Place Order
    await page.click('button:has-text("Place Order")');

    // 7. Order Confirmation
    await expect(page).toHaveURL(/.*\/order\/.+/);
    await expect(page.locator('text=Your order has been successfully placed.')).toBeVisible();
    
    // 8. Admin checks order
    await page.goto('/admin/orders');
    await expect(page.locator('text=Test User')).toBeVisible();
    await expect(page.locator('text=01711000000')).toBeVisible();
    
    // View Details
    await page.locator('tbody tr').first().locator('button').click();
    await expect(page.locator('text=E2E Test Combo')).toBeVisible();
    
    // Mark as paid
    const paymentSelect = page.locator('label', { hasText: 'Update Payment Status' }).locator('..').locator('select');
    await paymentSelect.selectOption('paid');
    await page.click('button:has-text("Save Changes")');
    // Wait for modal to close (modal title will disappear)
    await expect(page.locator('h2', { hasText: 'Order #' })).not.toBeVisible();
  });
});
