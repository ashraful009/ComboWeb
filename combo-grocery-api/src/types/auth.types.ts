export interface AuthUser {
  id: number;
  role: 'customer' | 'staff' | 'admin';
}

export interface Viewer {
  userId: number;
  role: 'customer' | 'staff' | 'admin';
}
