import { db } from '../config/db';

async function run() {
  try {
    const exists = await db('items').where({ id: 1 }).first();
    if (!exists) {
      await db('items').insert({
        id: 1,
        name: 'Oil',
        sku: 'OIL-1',
        unit_type: 'kg',
        stock_qty: 100,
        avg_cost_paisa: 15000,
        reorder_level: 10,
        is_active: true
      });
      console.log('Inserted dummy item ID 1');
    } else {
      console.log('Item ID 1 already exists');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await db.destroy();
  }
}
run();
