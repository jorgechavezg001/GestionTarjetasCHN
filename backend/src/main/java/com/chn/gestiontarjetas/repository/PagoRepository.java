package com.chn.gestiontarjetas.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chn.gestiontarjetas.entity.Pago;
import com.chn.gestiontarjetas.entity.TarjetaCredito;

public interface PagoRepository extends JpaRepository<Pago, Integer> {
    List<Pago> findByTarjeta(TarjetaCredito tarjeta);
}
