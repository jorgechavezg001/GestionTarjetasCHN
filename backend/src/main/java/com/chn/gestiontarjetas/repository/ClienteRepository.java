package com.chn.gestiontarjetas.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chn.gestiontarjetas.entity.Cliente;

public interface ClienteRepository extends JpaRepository<Cliente, Integer> {
    Optional<Cliente> findByNoDpi(String noDpi);
    
}
