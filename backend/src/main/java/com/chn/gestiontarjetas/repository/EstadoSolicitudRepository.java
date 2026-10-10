package com.chn.gestiontarjetas.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chn.gestiontarjetas.entity.EstadoSolicitud;

public interface EstadoSolicitudRepository extends JpaRepository<EstadoSolicitud, Integer> {
    Optional<EstadoSolicitud> findByNombre(String nombre);
}
