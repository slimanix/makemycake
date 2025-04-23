package com.bootcamp.makemycake.repositories;

import com.bootcamp.makemycake.entities.Patisserie;
import com.bootcamp.makemycake.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatisserieRepository extends JpaRepository<Patisserie, Long> {
    
    /**
     * Find a patisserie by their associated user
     * @param user the user entity
     * @return Optional containing the patisserie if found
     */
    Optional<Patisserie> findByUser(User user);
    
    /**
     * Find a patisserie by their user's email
     * @param email the email address to search for
     * @return Optional containing the patisserie if found
     */
    Optional<Patisserie> findByUserEmail(String email);
    
    /**
     * Find all verified patisseries
     * @return List of verified patisseries
     */
    @Query("SELECT p FROM Patisserie p WHERE p.validated = true")
    List<Patisserie> findAllVerifiedPatisseries();
    
    /**
     * Find all non-validated patisseries
     * @return List of non-validated patisseries
     */
    @Query("SELECT p FROM Patisserie p WHERE p.validated = false")
    List<Patisserie> findAllNonValidatedPatisseries();
} 