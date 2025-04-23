package com.bootcamp.makemycake.repositories;

import com.bootcamp.makemycake.entities.Client;
import com.bootcamp.makemycake.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    
    /**
     * Find a client by their associated user
     * @param user the user entity
     * @return Optional containing the client if found
     */
    Optional<Client> findByUser(User user);
    
    /**
     * Find a client by their user's email
     * @param email the email address to search for
     * @return Optional containing the client if found
     */
    Optional<Client> findByUserEmail(String email);
} 