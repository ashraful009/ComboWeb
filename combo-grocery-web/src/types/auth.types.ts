export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
