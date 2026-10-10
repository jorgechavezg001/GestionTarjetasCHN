package com.chn.gestiontarjetas.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.chn.gestiontarjetas.entity.Cliente;
import com.chn.gestiontarjetas.repository.ClienteRepository;

import org.springframework.transaction.annotation.Transactional;

@Service 
public class ClienteService {
    private final ClienteRepository clienteRepository;

    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    //metodo para registrar a un cliente
    @Transactional 
    public Cliente registrarCliente(Cliente cliente) {

        validarCliente(cliente);

        if(clienteRepository.findByNoDpi(cliente.getNoDpi()).isPresent()) {
            throw new IllegalArgumentException("Ya existe un cliente registrado con ese DPI");
        }
    

    return clienteRepository.save(cliente);

    }

    //Metodo para listar a todos lso clientes
    @Transactional(readOnly  = true)
    public List<Cliente> listarClientes() {
        return clienteRepository.findAll();
    }

    //Metodo para buscar a un cliente por su id
    @Transactional (readOnly = true) 
    public Optional<Cliente> obtenerClienteporId(Integer clienteId) {
        return clienteRepository.findById(clienteId);
    }

    // Metodo para actualizar los datos de un cliente.
    @Transactional
    public Cliente actualizarCliente(Integer clienteId, Cliente datosCliente) {

        Cliente cliente = clienteRepository.findById(clienteId).orElseThrow(() ->  new IllegalArgumentException("El cliente no existe."));
    

        validarCliente(datosCliente);

        // valida que el DPI no pertenezca a otro cliente.
        Optional<Cliente> clienteConDpi =clienteRepository.findByNoDpi(datosCliente.getNoDpi());    

        if (clienteConDpi.isPresent()&& !clienteConDpi.get().getClienteId().equals(clienteId)) {
            throw new IllegalArgumentException( "Ya existe otro cliente registrado con ese DPI.");
        }                                     

        cliente.setNombre(datosCliente.getNombre());
        cliente.setApellido(datosCliente.getApellido());
        cliente.setNoDpi(datosCliente.getNoDpi());
        cliente.setFechaNacimiento(datosCliente.getFechaNacimiento());
        cliente.setDireccion(datosCliente.getDireccion());
        cliente.setCorreo(datosCliente.getCorreo());
        cliente.setTelefono(datosCliente.getTelefono());

        return clienteRepository.save(cliente);
    }

    // Metodo para eliminar un cliente.
    @Transactional
    public void eliminarCliente(Integer clienteId) {

        Cliente cliente = clienteRepository.findById(clienteId) .orElseThrow(() ->  new IllegalArgumentException("El cliente no existe.") );

        clienteRepository.delete(cliente);
    }                  
           

    // Metodo para validar los campos obligatorios del cliente.
    private void validarCliente(Cliente cliente) {

        if (cliente == null) {
            throw new IllegalArgumentException(
                "Los datos del cliente son obligatorios."
            );
        }

        if (cliente.getNombre() == null || cliente.getNombre().isBlank()
                || cliente.getApellido() == null || cliente.getApellido().isBlank()
                || cliente.getNoDpi() == null || cliente.getNoDpi().isBlank()
                || cliente.getDireccion() == null || cliente.getDireccion().isBlank()
                || cliente.getCorreo() == null || cliente.getCorreo().isBlank()
                || cliente.getTelefono() == null || cliente.getTelefono().isBlank()
                || cliente.getFechaNacimiento() == null) {

            throw new IllegalArgumentException("Todos los campos del cliente son obligatorios."
            );
        }
                

        if (cliente.getFechaNacimiento().isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("La fecha de nacimiento no puede ser posterior a la fecha actual."
            );
        }
    }
}
                
