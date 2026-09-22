export interface UserModel {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
  profileImageUrl: string;
  createdAt: Date;
}
