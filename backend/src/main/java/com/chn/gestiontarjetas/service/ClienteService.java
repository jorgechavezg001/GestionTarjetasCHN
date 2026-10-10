package com.chn.gestiontarjetas.service;

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
        if(cliente.getNoDpi() == null || cliente.getNoDpi().isBlank()) {
            throw new IllegalArgumentException("El No. de DPI es obligatorio");
        }

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
    
}
