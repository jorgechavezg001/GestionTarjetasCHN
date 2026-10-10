package com.chn.gestiontarjetas.controller;

import com.chn.gestiontarjetas.entity.SolicitudTarjeta;
import com.chn.gestiontarjetas.service.SolicitudTarjetaService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/solicitudes")
@CrossOrigin(origins = "http://localhost:5173")
public class SolicitudTarjetaController {

    private final SolicitudTarjetaService solicitudService;

    public SolicitudTarjetaController(SolicitudTarjetaService solicitudService) {
        this.solicitudService = solicitudService;
    }
            

    // Endpoint para Registrar una solicitud de tarjeta con estado pendiente.
    
    @PostMapping
    public ResponseEntity<?> registrarSolicitud(@RequestParam Integer clienteId, @RequestParam Integer tipoTarjetaId,  @RequestParam BigDecimal ingreso) {

        try {
            SolicitudTarjeta solicitud = solicitudService.registrarSolicitud( clienteId, tipoTarjetaId, ingreso);
                   
            return ResponseEntity.status(HttpStatus.CREATED).body(solicitud);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }         
            

    // Endpoint para consultar todas las solicitudes registradas.
    @GetMapping
    public ResponseEntity<List<SolicitudTarjeta>> listarSolicitudes() {
        return ResponseEntity.ok(solicitudService.listarSolicitudes());
    }

    // Endpoint para buscar las solicitudes por su estado.
    
    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<SolicitudTarjeta>> listarPorEstado( @PathVariable String estado) {

        return ResponseEntity.ok(solicitudService.listarPorEstado(estado));
    }                  

    // Endpoint para consultar los solicitudes por cliente.
  
    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<SolicitudTarjeta>> listarPorCliente(@PathVariable Integer clienteId) {

        return ResponseEntity.ok( solicitudService.listarPorCliente(clienteId));
        }

    //endpoint para aprobar solicitud pendiente y crear tc
    @PutMapping("/{id}/aprobar")
    public ResponseEntity<?> aprobarSolicitud(@PathVariable("id") Integer id, @RequestParam BigDecimal montoAprobado, @RequestParam(required = false) String motivoComentario){
        try{
            SolicitudTarjeta solicitud = solicitudService.aprobarSolicitud(id, montoAprobado, motivoComentario);

            return ResponseEntity.ok(solicitud);
        } catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().body(e.getMessage());
            
        }
    }

    // Endpint para rechazar una solicitud pendiente y registra el motivo.
    @PutMapping("/{id}/rechazar")
    public ResponseEntity<?> rechazarSolicitud( @PathVariable Integer id, @RequestParam String motivoComentario) {

        try {
            SolicitudTarjeta solicitud = solicitudService.rechazarSolicitud( id, motivoComentario);

            return ResponseEntity.ok(solicitud);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
                   
           
           
    
               
            


