interface Role {
    id: number;
    name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  userType: string;
  profile_picture
?: string;
  role?:Role;
}
