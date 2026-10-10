package com.chn.gestiontarjetas.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chn.gestiontarjetas.entity.SolicitudTarjeta;

public interface SolicitudTarjetaRepository extends JpaRepository<SolicitudTarjeta, Integer> {
    List<SolicitudTarjeta> findByEstadoSolicitud_Nombre(String nombre);
    List<SolicitudTarjeta> findByCliente_ClienteId(Integer clienteId);
}
