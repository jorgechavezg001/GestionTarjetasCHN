package com.chn.gestiontarjetas.controller;

import com.chn.gestiontarjetas.entity.Pago;
import com.chn.gestiontarjetas.service.PagoService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/pagos")
@CrossOrigin(origins = "http://localhost:5173")
public class PagoController {

    private final PagoService pagoService;

    public PagoController(PagoService pagoService) {
        this.pagoService = pagoService;
    }

    // endpoint para registrar un pago.
   
    @PostMapping
    public ResponseEntity<?> registrarPago( @RequestParam String numeroTarjeta, @RequestParam BigDecimal monto, @RequestParam String descripcion) {

        try {
            Pago pago = pagoService.registrarPago( numeroTarjeta, monto, descripcion);            

            return ResponseEntity.status(HttpStatus.CREATED).body(pago);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }                  

    // endpoint para consultar los pagos realizados con una tc.
    @GetMapping("/tarjeta/{numeroTarjeta}")
    public ResponseEntity<?> listarPagosPorTarjeta( @PathVariable String numeroTarjeta) {

        try {
            List<Pago> pagos =  pagoService.listarPagosPorTarjeta(numeroTarjeta);

            return ResponseEntity.ok(pagos);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    
    // Se agrega este endpoint para consultar todos los pagos registrados.
    @GetMapping
    public ResponseEntity<List<Pago>> listarTodosLosPagos() {
        return ResponseEntity.ok(pagoService.listarTodosLosPagos());
    }

           
}
                 