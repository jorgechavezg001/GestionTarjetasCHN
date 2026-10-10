package com.chn.gestiontarjetas.service;

import com.chn.gestiontarjetas.entity.Consumo;
import com.chn.gestiontarjetas.entity.TarjetaCredito;
import com.chn.gestiontarjetas.repository.ConsumoRepository;
import com.chn.gestiontarjetas.repository.TarjetaCreditoRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ConsumoService {

    private final ConsumoRepository consumoRepository;
    private final TarjetaCreditoRepository tarjetaRepository;

    public ConsumoService(ConsumoRepository consumoRepository, TarjetaCreditoRepository tarjetaRepository) {
        this.consumoRepository = consumoRepository;
        this.tarjetaRepository = tarjetaRepository;
    }                      

    // Registra un consumo y actualiza el saldo de la tarjeta y verifica que exista la tarjeta y que tenga crédito disponible.

    @Transactional
    public Consumo registrarConsumo(
            String numeroTarjeta,
            BigDecimal monto,
            String descripcion) {

        TarjetaCredito tarjeta = tarjetaRepository.findById(numeroTarjeta).orElseThrow(() -> new IllegalArgumentException(  "La tarjeta no existe."));     

        if (monto == null || monto.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El monto del consumo debe ser mayor que cero.");
        }                   

        if (descripcion == null || descripcion.isBlank()) {
            throw new IllegalArgumentException( "La descripción del consumo es obligatoria.");
        }                 

        BigDecimal nuevoSaldo = tarjeta.getSaldoActual().add(monto);

        if (nuevoSaldo.compareTo(tarjeta.getLimiteCredito()) > 0) {
            throw new IllegalArgumentException( "El consumo supera el límite de crédito disponible.");
        }
                   

        Consumo consumo = new Consumo();
        consumo.setTarjeta(tarjeta);
        consumo.setMontoConsumo(monto);
        consumo.setFechaConsumo(LocalDateTime.now());
        consumo.setDescripcion(descripcion);

        tarjeta.setSaldoActual(nuevoSaldo);
        tarjetaRepository.save(tarjeta);

        return consumoRepository.save(consumo);
    }

    // metodo para consulta todos los consumos registrados para una tarjeta.
    @Transactional(readOnly = true)
    public List<Consumo> listarConsumosPorTarjeta(String numeroTarjeta) {

        TarjetaCredito tarjeta = tarjetaRepository.findById(numeroTarjeta) .orElseThrow(() -> new IllegalArgumentException( "La tarjeta no existe."));

        return consumoRepository.findByTarjeta(tarjeta);
    }
}
                               
                       
               