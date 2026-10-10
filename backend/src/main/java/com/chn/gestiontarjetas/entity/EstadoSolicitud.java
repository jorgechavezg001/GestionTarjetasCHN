package com.chn.gestiontarjetas.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity 
@Table(name="EstadoSolicitud", schema = "dbo")

public class EstadoSolicitud {
    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    @Column(name = "estado_solicitud_id")
    private Integer estadoSolicitudId;

    @Column(name = "nombre", nullable = false, length = 15)
    private String nombre;

    public EstadoSolicitud() {
        
    }
    public Integer getEstadoSolicitudId() {
        return estadoSolicitudId;
    }

    public void setEstadoSolicitudId(Integer estadoSolicitudId) {
        this.estadoSolicitudId = estadoSolicitudId;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
}

