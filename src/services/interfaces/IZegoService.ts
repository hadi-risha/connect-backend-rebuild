import { Role } from "../../constants/roles.enum";

export interface IZegoService {
  joinVideoSession(
    userId: string,
    bookingId: string
  ): Promise<{
    token: string;
    roomId: string;
    role: Role.STUDENT | Role.INSTRUCTOR;
    userId: string;
  }>;
}

