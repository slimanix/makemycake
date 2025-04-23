export interface RegisterRequest {
  email: string;
  password: string;
  role: 'CLIENT' | 'PATISSIER';
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  shopName?: string;
  location?: string;
  siretNumber?: string;
} 