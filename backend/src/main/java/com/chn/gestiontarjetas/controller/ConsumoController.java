package com.chn.gestiontarjetas.controller;

import com.chn.gestiontarjetas.entity.Consumo;
import com.chn.gestiontarjetas.service.ConsumoService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/consumos")
@CrossOrigin(origins = "http://localhost:5173")
public class ConsumoController {

    private final ConsumoService consumoService;

    public ConsumoController(ConsumoService consumoService) {
        this.consumoService = consumoService;
    }

    // Endpoint para registrar un consumo y devuelve la información guardada.
  
    @PostMapping
    public ResponseEntity<?> registrarConsumo(
            @RequestParam String numeroTarjeta,
            @RequestParam BigDecimal monto,
            @RequestParam String descripcion) {

        try {
            Consumo consumo = consumoService.registrarConsumo( numeroTarjeta, monto, descripcion);

            return ResponseEntity.status(HttpStatus.CREATED).body(consumo);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
                   

    // Enpoint para consultar todos los consumos realizados por tc.
    @GetMapping("/tarjeta/{numeroTarjeta}")
    public ResponseEntity<?> listarConsumosPorTarjeta( @PathVariable String numeroTarjeta) {

        try {
            List<Consumo> consumos =consumoService.listarConsumosPorTarjeta(numeroTarjeta);

            return ResponseEntity.ok(consumos);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    
    // Se agrega Endpoint para consultar todos los consumos registrados de cada tc.
    @GetMapping
    public ResponseEntity<List<Consumo>> listarTodosLosConsumos() {
        return ResponseEntity.ok(consumoService.listarTodosLosConsumos());
    }

}
                    
           