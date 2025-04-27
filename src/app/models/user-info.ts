export interface ClientInfo {
    fullName: string;
    phoneNumber: string;
    address: string;
}

export interface PatisserieInfo {
    id: number;
    shopName: string;
    phoneNumber: string;
    location: string;
    siretNumber: string;
    validated: boolean;
    valid: boolean;
    profilePicture?: string;  // This should match your backend DTO
}

export interface UserInfo {
    id: number;
    email: string;
    role: 'CLIENT' | 'PATISSIER' | 'ADMIN';
    createdAt: string;
    enabled: boolean;
    clientInfo?: ClientInfo;
    patisserieInfo?: PatisserieInfo;
    
}

export interface UserInfoResponse {
    data: UserInfo;
    message: string;
    status: number;
} 