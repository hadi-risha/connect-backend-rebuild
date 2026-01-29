// This is a central route collector
import { Router } from "express";
import { authRoutes } from "./auth.routes";
import { userRoutes } from "./user.routes";
import { instructorRoutes } from "./instructor.routes";
import { studentRoutes } from "./student.routes";
import { zegoRoutes } from "./zego.routes";
import { chatRoutes } from "./chat.routes";
import { messageRoutes } from "./message.routes";
import { adminRoutes } from "./admin.routes";

export const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/user", userRoutes);
routes.use("/instructor", instructorRoutes);
routes.use("/student", studentRoutes); 
routes.use("/admin", adminRoutes);
routes.use("/video", zegoRoutes);
routes.use("/chat", chatRoutes);
routes.use("/message", messageRoutes);

