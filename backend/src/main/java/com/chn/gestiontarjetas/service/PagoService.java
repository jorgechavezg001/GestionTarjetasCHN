package com.chn.gestiontarjetas.service;

import com.chn.gestiontarjetas.entity.Pago;
import com.chn.gestiontarjetas.entity.TarjetaCredito;
import com.chn.gestiontarjetas.repository.PagoRepository;
import com.chn.gestiontarjetas.repository.TarjetaCreditoRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PagoService {

    private final PagoRepository pagoRepository;
    private final TarjetaCreditoRepository tarjetaRepository;

    public PagoService(PagoRepository pagoRepository, TarjetaCreditoRepository tarjetaRepository) {
        this.pagoRepository = pagoRepository;
        this.tarjetaRepository = tarjetaRepository;
    }                     

    // metodo para registrar un pago y disminuye el saldo actual de la tarjeta Y validacion de tc y datos validos.
    
    @Transactional
    public Pago registrarPago(String numeroTarjeta, BigDecimal monto, String descripcion) {

        TarjetaCredito tarjeta = tarjetaRepository.findById(numeroTarjeta).orElseThrow(() -> new IllegalArgumentException( "La tarjeta no existe."));               

        if (monto == null || monto.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException( "El monto del pago debe ser mayor que cero.");
        }

        if (descripcion == null || descripcion.isBlank()) {
            throw new IllegalArgumentException( "La descripción del pago es obligatoria.");
        }

        BigDecimal nuevoSaldo = tarjeta.getSaldoActual().subtract(monto);                                    

        // Esta parte evita registrar pagos superiores al saldo que tiene.
        if (nuevoSaldo.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException( "El pago no puede ser mayor que el saldo pendiente.");
        }                  

        Pago pago = new Pago();
        pago.setTarjeta(tarjeta);
        pago.setMontoPago(monto);
        pago.setFechaPago(LocalDateTime.now());
        pago.setDescripcion(descripcion);

        tarjeta.setSaldoActual(nuevoSaldo);
        tarjetaRepository.save(tarjeta);

        return pagoRepository.save(pago);
    }                               

    // metodo para consultat todos los pagos realizados de una tc
    @Transactional(readOnly = true)
    public List<Pago> listarPagosPorTarjeta(String numeroTarjeta) {

        TarjetaCredito tarjeta = tarjetaRepository.findById(numeroTarjeta).orElseThrow(() -> new IllegalArgumentException("La tarjeta no existe."));                               
                       
        return pagoRepository.findByTarjeta(tarjeta);
    }
}