package com.chn.gestiontarjetas.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chn.gestiontarjetas.entity.Consumo;
import com.chn.gestiontarjetas.entity.TarjetaCredito;

public interface ConsumoRepository extends JpaRepository<Consumo, Integer> {
    List<Consumo> findByTarjeta(TarjetaCredito tarjeta);
}
