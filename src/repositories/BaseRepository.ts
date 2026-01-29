import { IBaseRepository } from "./interfaces/IBaseRepository";

export class BaseRepository<T> implements IBaseRepository<T> {
  constructor(protected model: any) {}

  create(data: Partial<T>) {
    return this.model.create(data);
  }

  findOne(filter: any) {
    return this.model.findOne(filter);
  }

  findById(id: string) {
    return this.model.findById(id);
  }

  find(filter: Partial<Record<keyof T, any>>): Promise<T[]> {
    return this.model.find(filter).lean();
  }

  update(filter: any, update: any) {
    return this.model.updateOne(filter, update);
  }
}
