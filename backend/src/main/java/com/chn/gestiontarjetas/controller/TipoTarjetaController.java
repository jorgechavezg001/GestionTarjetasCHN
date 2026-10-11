
package com.chn.gestiontarjetas.controller;

import com.chn.gestiontarjetas.entity.TipoTarjeta;
import com.chn.gestiontarjetas.repository.TipoTarjetaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tipos-tarjeta")
@CrossOrigin(origins = "http://localhost:5173")
public class TipoTarjetaController {

    private final TipoTarjetaRepository tipoTarjetaRepository;

    public TipoTarjetaController(TipoTarjetaRepository tipoTarjetaRepository) {
        this.tipoTarjetaRepository = tipoTarjetaRepository;
    }

    @GetMapping
    public ResponseEntity<List<TipoTarjeta>> listarTiposTarjeta() {
        return ResponseEntity.ok(tipoTarjetaRepository.findAll());
    }
}
            
