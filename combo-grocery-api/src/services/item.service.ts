import { ItemRepository } from '../repositories/item.repository';
import { SupplierRepository } from '../repositories/supplier.repository';

export class ItemService {
  private itemRepo = new ItemRepository();
  private supplierRepo = new SupplierRepository();

  async createItem(data: any) {
    const id = await this.itemRepo.create(data);
    return { id, ...data };
  }

  async getItems() {
    return this.itemRepo.findAllActive();
  }

  async createSupplier(data: any) {
    const id = await this.supplierRepo.create(data);
    return { id, ...data };
  }
}
