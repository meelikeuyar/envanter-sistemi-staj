export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'user';
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  siteCount: number;
  itemCount: number;
  createdAt: string;
}

export interface Site {
  _id: string;
  name: string;
  code: string;
  project: string;
  itemCount: number;
  createdAt: string;
}

export interface InventoryItem {
  _id: string;
  name: string;
  ipAddress: string;
  serialNumber: string;
  site: string;
  addedBy: { fullName: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
