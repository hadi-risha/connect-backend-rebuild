import { BaseRepository } from "./BaseRepository";
import { NotificationModel, INotification } from "../models/Notification.model";
import { INotificationRepository } from "./interfaces/INotificationRepository";

export class NotificationRepository extends BaseRepository<INotification> implements INotificationRepository {
  constructor() {
    super(NotificationModel);
  }

  findAll() {
    return NotificationModel.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .lean();
  }

  findActiveForUsers() {
    return NotificationModel.find({ isVisible: true })
      .select("title content createdAt") 
      .sort({ createdAt: -1 })
      .lean();
  }
  
}
