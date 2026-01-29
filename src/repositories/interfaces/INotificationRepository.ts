import { IBaseRepository } from "./IBaseRepository";
import { INotification } from "../../models/Notification.model";

export interface INotificationRepository
  extends IBaseRepository<INotification> {
  findAll(): any;

  findActiveForUsers(): any;
}
