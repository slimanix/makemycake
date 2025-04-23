package com.bootcamp.makemycake.dto;

import com.bootcamp.makemycake.entities.UserRole;
import lombok.Data;
import lombok.Builder;

@Data
@Builder
public class UserDTO {
    private Long id;
    private String email;
    private UserRole role;
    private boolean enabled;
    
    // Client specific fields
    private String fullName;
    private String phoneNumber;
    private String address;
    
    // Patissier specific fields
    private String shopName;
    private String location;
    private String siretNumber;
    private boolean validated;
} 