
package com.chn.gestiontarjetas.controller;

import com.chn.gestiontarjetas.entity.Cliente;
import com.chn.gestiontarjetas.service.ClienteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin(origins = "http://localhost:5173")
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    // Endpoint para registrar a un cliente
    @PostMapping
    public ResponseEntity<?> registrarCliente(@RequestBody Cliente cliente) {
        try {
            Cliente nuevoCliente = clienteService.registrarCliente(cliente);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoCliente);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Endpoint para listar todos a los clientes
    @GetMapping
    public ResponseEntity<List<Cliente>> listarClientes() {
    return ResponseEntity.ok(clienteService.listarClientes());
    }

    // Endpoint para buscar un cliente por ID
    @GetMapping("/{id}")
    public ResponseEntity<Cliente> obtenerCliente(@PathVariable Integer id) {
        Optional<Cliente> cliente = clienteService.obtenerClienteporId(id);

        return cliente.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Endpoint para actualizar un cliente.
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarCliente( @PathVariable Integer id, @RequestBody Cliente datosCliente) {

        try {
            Cliente clienteActualizado = clienteService.actualizarCliente(id, datosCliente);
               
            return ResponseEntity.ok(clienteActualizado);

        } catch (IllegalArgumentException e) {
            if ("El cliente no existe.".equals(e.getMessage())) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }    
           
    // Endpoint para eliminar un cliente.
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarCliente(@PathVariable Integer id) {
        try {
            clienteService.eliminarCliente(id);
            return ResponseEntity.noContent().build();

        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
                
