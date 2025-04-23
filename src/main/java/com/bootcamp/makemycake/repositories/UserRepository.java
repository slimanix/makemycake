package com.bootcamp.makemycake.repositories;

import com.bootcamp.makemycake.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * Find a user by their email address
     * @param email the email address to search for
     * @return Optional containing the user if found
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Find a user by their activation token
     * @param token the activation token to search for
     * @return Optional containing the user if found
     */
    Optional<User> findByActivationToken(String token);
    
    /**
     * Check if a user exists with the given email
     * @param email the email to check
     * @return true if a user exists with this email
     */
    boolean existsByEmail(String email);
    
    /**
     * Find a user by their ID
     * @param id the user ID to search for
     * @return Optional containing the user if found
     */
    Optional<User> findById(Long id);
} 