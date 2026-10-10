package com.chn.gestiontarjetas.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "Consumo", schema = "dbo")
public class Consumo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "consumo_id")
    private Integer consumoId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "numero_tarjeta", nullable = false)
    private TarjetaCredito tarjeta;

    @Column(name = "monto_consumo", nullable = false, precision = 12, scale = 2)
    private BigDecimal montoConsumo;

    @Column(name = "fecha_consumo", nullable = false)
    private LocalDateTime fechaConsumo;

    @Column(name = "descripcion", nullable = false, length = 250)
    private String descripcion;

    public Consumo() {
    }

    public Integer getConsumoId() {
        return consumoId;
    }

    public void setConsumoId(Integer consumoId) {
        this.consumoId = consumoId;
    }

    public TarjetaCredito getTarjeta() {
        return tarjeta;
    }

    public void setTarjeta(TarjetaCredito tarjeta) {
        this.tarjeta = tarjeta;
    }

    public BigDecimal getMontoConsumo() {
        return montoConsumo;
    }

    public void setMontoConsumo(BigDecimal montoConsumo) {
        this.montoConsumo = montoConsumo;
    }

    public LocalDateTime getFechaConsumo() {
        return fechaConsumo;
    }

    public void setFechaConsumo(LocalDateTime fechaConsumo) {
        this.fechaConsumo = fechaConsumo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
}