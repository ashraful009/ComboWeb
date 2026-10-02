import { DeliveryRepository } from '../repositories/delivery.repository';
import { withTransaction } from '../config/db';
import type { DeliveryZoneRow, DeliveryZoneAreaRow } from '../types/cart.types';

export class DeliveryService {
  private repo = new DeliveryRepository();

  async getZones(): Promise<DeliveryZoneRow[]> {
    return this.repo.getZones();
  }

  async createZone(data: Partial<DeliveryZoneRow> & { areas?: Partial<DeliveryZoneAreaRow>[] }) {
    return withTransaction(async (trx) => {
      const { areas, ...zoneData } = data;
      const zoneId = await this.repo.createZone(zoneData, trx);
      
      if (areas && areas.length > 0) {
        const zoneAreas = areas.map((a) => ({ zone_id: zoneId, ...a }));
        await this.repo.addAreas(zoneAreas, trx);
      }
      
      return { zoneId, ...data };
    });
  }
}
