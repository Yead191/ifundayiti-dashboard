export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "Super Admin" | "Admin" | "Moderator";
  avatar: string;
}
