package com.chn.gestiontarjetas.controller;

import com.chn.gestiontarjetas.entity.TarjetaCredito;
import com.chn.gestiontarjetas.service.TarjetaCreditoService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tarjetas")
@CrossOrigin(origins = "http://localhost:5173")
public class TarjetaCreditoController {

    private final TarjetaCreditoService tarjetaService;

    public TarjetaCreditoController( TarjetaCreditoService tarjetaService) {
        this.tarjetaService = tarjetaService;
    }
           

    // endpoint para consultar todas las tarjetas registradas.
    @GetMapping
    public ResponseEntity<List<TarjetaCredito>> listarTarjetas() {
        return ResponseEntity.ok(tarjetaService.listarTarjetas());
    }

    // endpoint para buscar una tarjeta por su numero.
   
    @GetMapping("/{numeroTarjeta}")
    public ResponseEntity<TarjetaCredito> obtenerTarjeta( @PathVariable String numeroTarjeta) {

        Optional<TarjetaCredito> tarjeta =tarjetaService.obtenerTarjeta(numeroTarjeta);

        return tarjeta .map(ResponseEntity::ok) .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
               
               
                