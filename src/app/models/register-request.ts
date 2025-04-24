export interface RegisterRequest {
  email: string;
  password: string;
  role: 'CLIENT' | 'PATISSIER';
  // Client fields
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  // Patissier fields (matching backend exactly)
  shopName?: string;
  location?: string;
  siretNumber?: string;
  profilePicture?: string;  // Added to match Patisserie entity
}