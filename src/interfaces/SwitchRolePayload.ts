import { Role } from "../constants/roles.enum";

export type SwitchRolePayload = {
  role: Role;

  instructorProfile?: {
    bio: string;
    expertise: string;
  };

  photo?: {
    key: string;
    url: string;
  };

  removePhoto?: boolean; //based on the flag need to remove old photo and replace
};
