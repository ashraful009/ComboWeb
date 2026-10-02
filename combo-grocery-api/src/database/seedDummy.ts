import { db } from '../config/db';

async function run() {
  try {
    // Check delivery zone
    let zone = await db('delivery_zones').where({ id: 1 }).first();
    if (!zone) {
      console.log('Seeding Delivery Zone...');
      await db('delivery_zones').insert({
        id: 1,
        name: 'Dhaka North',
        base_fee_paisa: 6000,
        is_active: true
      });
    } else {
      console.log('Delivery Zone exists.');
    }

    // Check user 1 (the default mock user)
    let user = await db('users').where({ id: 1 }).first();
    if (user) {
      // Check address
      let address = await db('addresses').where({ user_id: 1 }).first();
      if (!address) {
        console.log('Seeding Address for user 1...');
        await db('addresses').insert({
          user_id: 1,
          title: 'Home',
          street_address: 'Flat 4B, Road 12, Banani, Dhaka',
          is_default: true,
          recipient_name: 'Test User',
          recipient_phone: '+8801700000000',
          delivery_zone_id: 1
        });
      } else {
        console.log('Address exists for user 1.');
      }
    } else {
      console.log('User 1 does not exist, skipping address seed.');
    }

    // Check Coupon 'SAVE50'
    let coupon = await db('coupons').where({ code: 'SAVE50' }).first();
    if (!coupon) {
      console.log('Seeding Coupon...');
      await db('coupons').insert({
        code: 'SAVE50',
        discount_type: 'fixed',
        discount_value: 5000,
        min_spend_paisa: 10000,
        start_date: new Date(Date.now() - 100000),
        end_date: new Date(Date.now() + 10000000000),
        usage_limit: 100,
        is_active: true
      });
    } else {
      console.log('Coupon exists.');
    }

    // Check Wallet for user 1
    if (user) {
      let wallet = await db('wallets').where({ user_id: 1 }).first();
      if (!wallet) {
        console.log('Seeding Wallet for user 1...');
        await db('wallets').insert({
          user_id: 1,
          balance_paisa: 5000000, // 50,000 BDT
          status: 'active'
        });
      } else {
        console.log('Wallet exists for user 1.');
      }
    }

    console.log('Dummy seed complete.');
  } catch (error) {
    console.error('Error seeding:', error);
  } finally {
    await db.destroy();
  }
}

run();
