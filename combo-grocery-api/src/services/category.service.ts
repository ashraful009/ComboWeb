import { CategoryRepository } from '../repositories/category.repository';

export class CategoryService {
  private repo = new CategoryRepository();

  async getAllCategories() {
    return this.repo.findAll();
  }

  async createCategory(data: any) {
    const id = await this.repo.create(data);
    return { id, ...data };
  }
}
