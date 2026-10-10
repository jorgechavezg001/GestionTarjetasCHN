package com.chn.gestiontarjetas.service;

import com.chn.gestiontarjetas.entity.TarjetaCredito;
import com.chn.gestiontarjetas.repository.TarjetaCreditoRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class TarjetaCreditoService {

    private final TarjetaCreditoRepository tarjetaRepository;

    public TarjetaCreditoService( TarjetaCreditoRepository tarjetaRepository) {
        this.tarjetaRepository = tarjetaRepository;
    }
           

    // metodo para obtener todas las tc registradas.
    @Transactional(readOnly = true)
    public List<TarjetaCredito> listarTarjetas() {
        return tarjetaRepository.findAll();
    }

    // metodo para buscar una tarjeta por su numero.
   
    @Transactional(readOnly = true)
    public Optional<TarjetaCredito> obtenerTarjeta(String numeroTarjeta) {
        return tarjetaRepository.findById(numeroTarjeta);
    }
}