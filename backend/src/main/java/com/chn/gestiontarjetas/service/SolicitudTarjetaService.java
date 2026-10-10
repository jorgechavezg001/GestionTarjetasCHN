package com.chn.gestiontarjetas.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.chn.gestiontarjetas.entity.Cliente;
import com.chn.gestiontarjetas.entity.EstadoSolicitud;
import com.chn.gestiontarjetas.entity.SolicitudTarjeta;
import com.chn.gestiontarjetas.entity.TarjetaCredito;
import com.chn.gestiontarjetas.entity.TipoTarjeta;
import com.chn.gestiontarjetas.repository.ClienteRepository;
import com.chn.gestiontarjetas.repository.EstadoSolicitudRepository;
import com.chn.gestiontarjetas.repository.SolicitudTarjetaRepository;
import com.chn.gestiontarjetas.repository.TipoTarjetaRepository;
import java.security.SecureRandom;
import com.chn.gestiontarjetas.repository.TarjetaCreditoRepository;

import org.springframework.transaction.annotation.Transactional;

@Service 
public class SolicitudTarjetaService {

    private final SolicitudTarjetaRepository solicitudRepository;
    private final ClienteRepository clienteRepository;
    private final TipoTarjetaRepository tipoTarjetaRepository;
    private final EstadoSolicitudRepository estadoSolicitudRepository;
    private final TarjetaCreditoRepository tarjetaRepository;
    private final SecureRandom random = new SecureRandom();

    public SolicitudTarjetaService(SolicitudTarjetaRepository solicitudRepository, ClienteRepository clienteRepository, TipoTarjetaRepository tipoTarjetaRepository, EstadoSolicitudRepository estadoSolicitudRepository, TarjetaCreditoRepository tarjetaRepository) {
        this.solicitudRepository = solicitudRepository;
        this.clienteRepository = clienteRepository;
        this.tipoTarjetaRepository = tipoTarjetaRepository;
        this.estadoSolicitudRepository = estadoSolicitudRepository;
        this.tarjetaRepository = tarjetaRepository;
    }

    //metodo para registtar ina solicitud de tarjeta con estado Pendiente y validaciones.
    public SolicitudTarjeta registrarSolicitud(Integer clienteId, Integer tipoTarjetaId, BigDecimal ingreso) {
        Cliente cliente = clienteRepository.findById(clienteId).orElseThrow(()-> new IllegalArgumentException("El cliente no existe"));

        TipoTarjeta tipoTarjeta = tipoTarjetaRepository.findById(tipoTarjetaId).orElseThrow(()-> new IllegalArgumentException("El tipo de tarjeta no existe"));

        EstadoSolicitud estado = obtenerEstado("Pendiente");

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


    // Metodo para aprobar una solicitud pendiente y genera automáticamente una tarjeta.
    @Transactional
    public SolicitudTarjeta aprobarSolicitud(Integer solicitudId,  BigDecimal montoAprobado,String motivoComentario) {

        SolicitudTarjeta solicitud = obtenerSolicitudPendiente(solicitudId);                         

        if (montoAprobado == null || montoAprobado.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException( "El monto aprobado debe ser mayor que cero.");
        }                             

        EstadoSolicitud estadoAprobado = obtenerEstado("Aprobada");

        solicitud.setEstadoSolicitud(estadoAprobado);
        solicitud.setFechaDecision(LocalDateTime.now());
        solicitud.setMotivoComentario(motivoComentario);
        solicitud.setMontoAprobado(montoAprobado);

        solicitudRepository.save(solicitud);

        TarjetaCredito tarjeta = new TarjetaCredito();
        tarjeta.setNumeroTarjeta(generarNumeroTarjeta());
        tarjeta.setSolicitud(solicitud);
        tarjeta.setTipoTarjeta(solicitud.getTipoTarjeta());
        tarjeta.setLimiteCredito(montoAprobado);
        tarjeta.setSaldoActual(BigDecimal.ZERO);

        tarjetaRepository.save(tarjeta);

        return solicitud;
    }

    // Metodo para Rechazar una solicitud pendiente y guarda el motivo del rechazo.
    @Transactional
    public SolicitudTarjeta rechazarSolicitud(Integer solicitudId,String motivoComentario) {

        SolicitudTarjeta solicitud = obtenerSolicitudPendiente(solicitudId);                     

        if (motivoComentario == null || motivoComentario.isBlank()) {
            throw new IllegalArgumentException( "El motivo del rechazo es obligatorio.");
        }                 

        EstadoSolicitud estadoRechazado = obtenerEstado("Rechazada");

        solicitud.setEstadoSolicitud(estadoRechazado);
        solicitud.setFechaDecision(LocalDateTime.now());
        solicitud.setMotivoComentario(motivoComentario);
        solicitud.setMontoAprobado(null);

        return solicitudRepository.save(solicitud);
    }

    
    // No deja volver a aprobar o rechazar una solicitud procesada.
    private SolicitudTarjeta obtenerSolicitudPendiente(Integer solicitudId) {

        SolicitudTarjeta solicitud = solicitudRepository.findById(solicitudId).orElseThrow(() ->new IllegalArgumentException( "La solicitud no existe."));                                                                   

        if (!"Pendiente".equals( solicitud.getEstadoSolicitud().getNombre())) {
            throw new IllegalArgumentException("Solo se pueden aprobar o rechazar solicitudes pendientes.");
        }

        return solicitud;
    }                                 

    // metodo que busca un estado por su nombre.
    private EstadoSolicitud obtenerEstado(String nombre) {
        return estadoSolicitudRepository.findByNombre(nombre).orElseThrow(() -> new IllegalArgumentException(  "No existe el estado: " + nombre));
    }                                   
                     

    // metodo que genera un número de tarjeta de 16 dígitos que no esté registrado.
    private String generarNumeroTarjeta() {

        String numeroTarjeta;

        do {
            StringBuilder numero = new StringBuilder();

            for (int i = 0; i < 16; i++) {
                numero.append(random.nextInt(10));
            }

            numeroTarjeta = numero.toString();

        } while (tarjetaRepository.existsById(numeroTarjeta));

        return numeroTarjeta;
    }
}
   
