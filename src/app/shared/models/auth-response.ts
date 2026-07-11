export interface AuthResponse {
  success: boolean;
  message: string;
  userId: number | null;
  fullName: string | null;
  username: string | null;
  email: string | null;
  role: string | null;
}