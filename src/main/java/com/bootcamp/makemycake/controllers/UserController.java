package com.bootcamp.makemycake.controllers;

import com.bootcamp.makemycake.dto.ApiResponse;
import com.bootcamp.makemycake.dto.PatisserieResponse;
import com.bootcamp.makemycake.dto.UserDTO;
import com.bootcamp.makemycake.entities.Client;
import com.bootcamp.makemycake.entities.Patisserie;
import com.bootcamp.makemycake.entities.User;
import com.bootcamp.makemycake.entities.UserRole;
import com.bootcamp.makemycake.repositories.ClientRepository;
import com.bootcamp.makemycake.repositories.PatisserieRepository;
import com.bootcamp.makemycake.repositories.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class UserController {

    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final PatisserieRepository patisserieRepository;

    public UserController(UserRepository userRepository, 
                        ClientRepository clientRepository,
                        PatisserieRepository patisserieRepository) {
        this.userRepository = userRepository;
        this.clientRepository = clientRepository;
        this.patisserieRepository = patisserieRepository;
    }

    @GetMapping("/users/me")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserDTO userDTO = buildUserDTO(user);
        
        return ResponseEntity.ok(new ApiResponse<>(userDTO, "User details retrieved successfully", 200));
    }

    @GetMapping("/patisseries/{id}")
    public ResponseEntity<ApiResponse<PatisserieResponse>> getPatisserieById(@PathVariable Long id) {
        Patisserie patisserie = patisserieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patisserie not found"));
        
        PatisserieResponse response = convertToPatisserieResponse(patisserie);
        
        return ResponseEntity.ok(new ApiResponse<>(response, "Patisserie details retrieved successfully", 200));
    }

    private UserDTO buildUserDTO(User user) {
        UserDTO.UserDTOBuilder builder = UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .enabled(user.isEnabled());

        if (user.getRole() == UserRole.CLIENT) {
            Client client = clientRepository.findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Client profile not found"));
            builder.fullName(client.getFullName())
                    .phoneNumber(client.getPhoneNumber())
                    .address(client.getAddress());
        } else if (user.getRole() == UserRole.PATISSIER) {
            Patisserie patisserie = patisserieRepository.findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Patisserie profile not found"));
            builder.shopName(patisserie.getShopName())
                    .location(patisserie.getLocation())
                    .siretNumber(patisserie.getSiretNumber())
                    .validated(patisserie.isValidated());
        }

        return builder.build();
    }

    private PatisserieResponse convertToPatisserieResponse(Patisserie patisserie) {
        PatisserieResponse response = new PatisserieResponse();
        response.setId(patisserie.getId());
        response.setShopName(patisserie.getShopName());
        response.setPhoneNumber(patisserie.getPhoneNumber());
        response.setLocation(patisserie.getLocation());
        response.setProfilePicture(patisserie.getProfilePicture());
        response.setSiretNumber(patisserie.getSiretNumber());
        response.setValid(patisserie.isValidated());

        if (patisserie.getUser() != null) {
            response.setUserEmail(patisserie.getUser().getEmail());
        }

        if (patisserie.getOffres() != null) {
            response.setNombreOffres(patisserie.getOffres().size());
        }

        return response;
    }
} 