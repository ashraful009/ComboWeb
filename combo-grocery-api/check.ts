import { db } from './src/config/db';
async function run() {
  try {
    const addresses = await db('addresses').select('*');
    const zones = await db('delivery_zones').select('*');
    console.log('Addresses:', addresses);
    console.log('Zones:', zones);
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
run();
