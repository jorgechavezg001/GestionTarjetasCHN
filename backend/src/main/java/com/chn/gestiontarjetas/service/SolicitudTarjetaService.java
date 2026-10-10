package com.chn.gestiontarjetas.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.chn.gestiontarjetas.entity.Cliente;
import com.chn.gestiontarjetas.entity.EstadoSolicitud;
import com.chn.gestiontarjetas.entity.SolicitudTarjeta;
import com.chn.gestiontarjetas.entity.TipoTarjeta;
import com.chn.gestiontarjetas.repository.ClienteRepository;
import com.chn.gestiontarjetas.repository.EstadoSolicitudRepository;
import com.chn.gestiontarjetas.repository.SolicitudTarjetaRepository;
import com.chn.gestiontarjetas.repository.TipoTarjetaRepository;

import org.springframework.transaction.annotation.Transactional;

@Service 
public class SolicitudTarjetaService {

    private final SolicitudTarjetaRepository solicitudRepository;
    private final ClienteRepository clienteRepository;
    private final TipoTarjetaRepository tipoTarjetaRepository;
    private final EstadoSolicitudRepository estadoSolicitudRepository;

    public SolicitudTarjetaService(SolicitudTarjetaRepository solicitudRepository, ClienteRepository clienteRepository, TipoTarjetaRepository tipoTarjetaRepository, EstadoSolicitudRepository estadoSolicitudRepository) {
        this.solicitudRepository = solicitudRepository;
        this.clienteRepository = clienteRepository;
        this.tipoTarjetaRepository = tipoTarjetaRepository;
        this.estadoSolicitudRepository = estadoSolicitudRepository;
    }

    //metodo para registtar ina solicitud de tarjeta con estado Pendiente y validaciones.
    public SolicitudTarjeta registrarSolicitud(Integer clienteId, Integer tipoTarjetaId, BigDecimal ingreso) {
        Cliente cliente = clienteRepository.findById(clienteId).orElseThrow(()-> new IllegalArgumentException("El cliente no existe"));

        TipoTarjeta tipoTarjeta = tipoTarjetaRepository.findById(tipoTarjetaId).orElseThrow(()-> new IllegalArgumentException("El tipo de tarjeta no exoste"));

        EstadoSolicitud estado = estadoSolicitudRepository.findByNombre("Pendiente").orElseThrow(()-> new IllegalArgumentException("No existe el estado pendiente"));

        if(ingreso == null || ingreso.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("El ingreso debe ser mayor o igual a 0");
        }

        SolicitudTarjeta solicitud = new SolicitudTarjeta();
        solicitud.setCliente(cliente);
        solicitud.setTipoTarjeta(tipoTarjeta);
        solicitud.setEstadoSolicitud(estado);
        solicitud.setIngreso(ingreso);
        solicitud.setFechaSolicitud(LocalDateTime.now());

        return solicitudRepository.save(solicitud);
    }

    // metodo para mostrar todas las solicitudes registradas.
    @Transactional(readOnly = true)
    public List<SolicitudTarjeta> listarSolicitudes() {
        return solicitudRepository.findAll();
    }

    //metodo para listar las solicitudes por estado
    @Transactional(readOnly = true)
    public List<SolicitudTarjeta> listarPorEstado(String estado) {
        return solicitudRepository.findByEstadoSolicitud_Nombre(estado);
    }

    //metodo para mostrar las solicitudes asociadas a unn cliente
    @Transactional(readOnly = true)
    public List<SolicitudTarjeta> listarPorCliente(Integer clienteId){
        return solicitudRepository.findByCliente_ClienteId(clienteId);
    }
   
}
