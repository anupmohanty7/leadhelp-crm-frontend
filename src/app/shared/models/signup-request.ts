export interface SignupRequest {
  fullName: string;
  username: string;
  email: string;
  mobile: string;
  password: string;
  role: 'ADMIN' | 'MANAGER' | 'SALES_EXECUTIVE';
}