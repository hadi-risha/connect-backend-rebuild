export interface IBaseRepository<T> {
  create(data: Partial<T>): any;

  findOne(filter: any): any;

  findById(id: string): any;

  find(filter: Partial<Record<keyof T, any>>): Promise<T[]>;

  update(filter: any, update: any): any;
}
