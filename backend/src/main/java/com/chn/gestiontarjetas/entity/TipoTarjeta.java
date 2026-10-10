package com.chn.gestiontarjetas.entity;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity 
@Table(name = "TipoTarjeta", schema = "dbo")
public class TipoTarjeta {
    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    @Column(name = "tipo_tarjeta_id")
    private Integer TipoTarjetaId;

    @Column (name = "nombre", nullable = false, unique = true, length = 20)
    private String nombre;

    public  TipoTarjeta() {

    }

    public Integer getTipoTarjetaId() {
        return TipoTarjetaId;
    }

    public void setTipoTarjetaId(Integer TipoTarjetaId) {
        this.TipoTarjetaId = TipoTarjetaId;
    }

    public String getNombre() {
        return nombre;
    }

    public  void setNombre(String nombre) {
        this.nombre = nombre;
    }
}
