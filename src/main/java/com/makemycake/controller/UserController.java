package com.makemycake.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import com.makemycake.dto.ApiResponse;
import com.makemycake.dto.UserDTO;
import com.makemycake.service.UserService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        UserDTO userDTO = userService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(new ApiResponse<>(userDTO, "User details retrieved successfully", true));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserDTO>> updateCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UserDTO updateRequest) {
        UserDTO updated = userService.updateUser(userDetails.getUsername(), updateRequest);
        return ResponseEntity.ok(new ApiResponse<>(updated, "User updated successfully", true));
    }
} 