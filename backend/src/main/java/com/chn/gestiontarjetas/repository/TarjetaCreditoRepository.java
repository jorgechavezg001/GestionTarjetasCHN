package com.chn.gestiontarjetas.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.chn.gestiontarjetas.entity.TarjetaCredito;

public interface TarjetaCreditoRepository extends JpaRepository<TarjetaCredito, String> {
    
}
