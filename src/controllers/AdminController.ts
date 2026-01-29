import { Request, Response } from "express";
import { StatusCodes } from "../constants/statusCodes.enum";
import { AdminService } from "../services/AdminService";
import { ApiError } from "../common/errors/ApiError";

const adminService = new AdminService();

export const getAllUsers  = async (req: Request, res: Response) => {
  const adminId = req.user?.id;
  if (!adminId) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  }
  const users = await adminService.getAllUsers();

  res.status(StatusCodes.OK).json({message: "users fetched successfully", users});
};


export const toggleUserRole = async (req: Request, res: Response) => {
  const user = await adminService.toggleRole(req.params.id);
  res.status(StatusCodes.OK).json({
    message: "User role updated",
    user,
  });
};


export const toggleBlockUser = async (req: Request, res: Response) => {
  const user = await adminService.toggleBlock(req.params.id);
  res.status(StatusCodes.OK).json({
    message: "User block status updated",
    user,
  });
};


export const getAiRatings = async (req: Request, res: Response) => {
  const data = await adminService.getAiRatingsForAdmin();

  res.status(StatusCodes.OK).json({
    message: "AI ratings fetched successfully",
    data,
  });
};


export const getNotifications = async (_req: Request, res: Response) => {
  const data = await adminService.getAllNotifications();
  res.status(StatusCodes.OK).json({ data });
};


export const createNotification = async (req: Request, res: Response) => {
  const adminId = req.user!.id;

  const notif = await adminService.createNotification(
    adminId,
    req.body.title,
    req.body.content
  );

  res.status(StatusCodes.CREATED).json({ message: "Notification created", notif });
};


export const updateNotification = async (req: Request, res: Response) => {
  const notif = await adminService.updateNotification(
    req.params.id,
    req.body.title,
    req.body.content
  );

  res.status(StatusCodes.OK).json({ message: "Notification updated", notif });
};


export const toggleNotificationVisibility = async (req: Request, res: Response) => {
  const notif = await adminService.toggleVisibility(req.params.id);

  res.status(StatusCodes.OK).json({
    message: "Visibility updated",
    notif,
  });
};


export const getAdminDashboard = async (req: Request, res: Response) => {
  const { start, end } = req.query;

  const data = await adminService.getDashboardData(
    start as string,
    end as string
  );

  res.status(StatusCodes.OK).json({
    message: "Dashboard data fetched",
    data,
  });
};




