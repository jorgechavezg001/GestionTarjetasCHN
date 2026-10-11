
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Wallet,
  Search,
  Plus,
  RefreshCw,
  ReceiptText,
  CircleDollarSign,
  CreditCard,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { apiFetch } from '../api'

const formularioInicial = {
  numeroTarjeta: '',
  monto: '',
  descripcion: '',
}

const formatoMoneda = (valor) =>
  new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
  }).format(Number(valor ?? 0))

const formatoFecha = (fecha) => {
  if (!fecha) return '—'

  const valor = new Date(fecha)

  if (Number.isNaN(valor.getTime())) {
    return String(fecha).replace('T', ' ').slice(0, 16)
  }

  return valor.toLocaleString('es-GT')
}

const obtenerTitular = (tarjeta) => {
  const cliente = tarjeta?.solicitud?.cliente

  if (!cliente) return 'Titular no disponible'

  return `${cliente.nombre ?? ''} ${cliente.apellido ?? ''}`.trim()
}

const ocultarNumero = (numero) => {
  if (!numero) return '—'

  return `•••• •••• •••• ${String(numero).slice(-4)}`
}

function Pagos() {
  const [tarjetas, setTarjetas] = useState([])
  const [pagos, setPagos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [busqueda, setBusqueda] = useState('')

  const [modalRegistro, setModalRegistro] = useState(false)
  const [formulario, setFormulario] = useState(formularioInicial)
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)

  const cargarDatos = useCallback(async () => {
    setCargando(true)
    setError('')

    try {
      const [respuestaPagos, respuestaTarjetas] = await Promise.all([
        apiFetch('/api/pagos'),
        apiFetch('/api/tarjetas'),
      ])

      if (!respuestaPagos.ok) {
        throw new Error(
          `Error al consultar pagos: HTTP ${respuestaPagos.status}`,
        )
      }

      if (!respuestaTarjetas.ok) {
        throw new Error(
          `Error al consultar tarjetas: HTTP ${respuestaTarjetas.status}`,
        )
      }

      const [datosPagos, datosTarjetas] = await Promise.all([
        respuestaPagos.json(),
        respuestaTarjetas.json(),
      ])

      setPagos(Array.isArray(datosPagos) ? datosPagos : [])
      setTarjetas(Array.isArray(datosTarjetas) ? datosTarjetas : [])
    } catch (e) {
      console.error('Error al cargar pagos:', e)
      setError(e.message || 'No fue posible cargar los datos.')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  const estadisticas = useMemo(() => {
    const tarjetasUtilizadas = new Set(
      pagos
        .map((pago) => pago.tarjeta?.numeroTarjeta)
        .filter(Boolean),
    )

    return {
      cantidad: pagos.length,
      total: pagos.reduce(
        (suma, pago) => suma + Number(pago.montoPago ?? 0),
        0,
      ),
      tarjetasUtilizadas: tarjetasUtilizadas.size,
      saldoTotal: tarjetas.reduce(
        (suma, tarjeta) => suma + Number(tarjeta.saldoActual ?? 0),
        0,
      ),
    }
  }, [pagos, tarjetas])

  const pagosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()

    return pagos.filter((pago) => {
      const numeroTarjeta = String(
        pago.tarjeta?.numeroTarjeta ?? '',
      ).toLowerCase()

      const titular = obtenerTitular(pago.tarjeta).toLowerCase()
      const descripcion = String(pago.descripcion ?? '').toLowerCase()
      const id = String(pago.pagoId ?? '')
      const monto = String(pago.montoPago ?? '')

      return (
        numeroTarjeta.includes(termino) ||
        titular.includes(termino) ||
        descripcion.includes(termino) ||
        id.includes(termino) ||
        monto.includes(termino)
      )
    })
  }, [pagos, busqueda])

  function abrirRegistro() {
    setFormulario({ ...formularioInicial })
    setErrores({})
    setError('')
    setMensaje('')
    setModalRegistro(true)
  }

  function cambiarCampo(evento) {
    const { name, value } = evento.target

    setFormulario((actual) => ({
      ...actual,
      [name]: value,
    }))

    setErrores((actuales) => ({
      ...actuales,
      [name]: '',
    }))
  }

  function validarFormulario() {
    const nuevosErrores = {}

    if (!formulario.numeroTarjeta) {
      nuevosErrores.numeroTarjeta = 'Selecciona una tarjeta.'
    }

    if (
      formulario.monto === '' ||
      !Number.isFinite(Number(formulario.monto)) ||
      Number(formulario.monto) <= 0
    ) {
      nuevosErrores.monto = 'El monto debe ser mayor que cero.'
    }

    if (!formulario.descripcion.trim()) {
      nuevosErrores.descripcion = 'La descripción es obligatoria.'
    } else if (formulario.descripcion.trim().length > 250) {
      nuevosErrores.descripcion =
        'La descripción no puede superar los 250 caracteres.'
    }

    const tarjeta = tarjetas.find(
      (item) => item.numeroTarjeta === formulario.numeroTarjeta,
    )

    if (tarjeta && formulario.monto !== '') {
      const saldoPendiente = Number(tarjeta.saldoActual ?? 0)

      if (
        Number(formulario.monto) > saldoPendiente &&
        Number(formulario.monto) > 0
      ) {
        nuevosErrores.monto =
          'El pago no puede ser mayor que el saldo pendiente de la tarjeta.'
      }
    }

    setErrores(nuevosErrores)

    return Object.keys(nuevosErrores).length === 0
  }

  async function registrarPago(evento) {
    evento.preventDefault()
    setError('')
    setMensaje('')

    if (!validarFormulario()) return

    setGuardando(true)

    try {
      const parametros = new URLSearchParams({
        numeroTarjeta: formulario.numeroTarjeta,
        monto: formulario.monto,
        descripcion: formulario.descripcion.trim(),
      })

      const respuesta = await apiFetch(
        `/api/pagos?${parametros}`,
        { method: 'POST' },
      )

      if (!respuesta.ok) {
        const texto = await respuesta.text()

        throw new Error(
          texto ||
            `No fue posible registrar el pago (HTTP ${respuesta.status}).`,
        )
      }

      setModalRegistro(false)
      setFormulario({ ...formularioInicial })
      setErrores({})
      setMensaje('Pago registrado correctamente.')

      await cargarDatos()
    } catch (e) {
      setError(e.message || 'Ocurrió un error al registrar el pago.')
    } finally {
      setGuardando(false)
    }
  }

  function cerrarModal() {
    if (!guardando) {
      setModalRegistro(false)
    }
  }

  const tarjetaFormulario = tarjetas.find(
    (tarjeta) =>
      tarjeta.numeroTarjeta === formulario.numeroTarjeta,
  )

  const saldoPendiente = Number(
    tarjetaFormulario?.saldoActual ?? 0,
  )

  return (
    <div className="clientes-page">
      {mensaje && (
        <div className="alert alert-success" role="status">
          <CheckCircle2 size={18} />
          <span>{mensaje}</span>
          <button
            type="button"
            className="alert-close"
            onClick={() => setMensaje('')}
            aria-label="Cerrar mensaje"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button
            type="button"
            className="alert-close"
            onClick={() => setError('')}
            aria-label="Cerrar error"
          >
            <X size={17} />
          </button>
        </div>
      )}

      <div className="clientes-toolbar">
        <div className="page-heading">
          <div>
            <h1>Gestión de pagos</h1>
            <p>
              Registra abonos y consulta los pagos realizados en
              las tarjetas de crédito.
            </p>
          </div>
        </div>

        <div className="clientes-table-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={cargarDatos}
            disabled={cargando}
          >
            <RefreshCw size={17} />
            Actualizar
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={abrirRegistro}
            disabled={tarjetas.length === 0 || cargando}
          >
            <Plus size={18} />
            Registrar pago
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon blue">
              <ReceiptText size={22} />
            </div>
          </div>
          <span className="stat-title">Pagos registrados</span>
          <strong className="stat-value">
            {estadisticas.cantidad}
          </strong>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon purple">
              <CircleDollarSign size={22} />
            </div>
          </div>
          <span className="stat-title">Monto total abonado</span>
          <strong className="stat-value">
            {formatoMoneda(estadisticas.total)}
          </strong>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon orange">
              <Wallet size={22} />
            </div>
          </div>
          <span className="stat-title">Tarjetas con pagos</span>
          <strong className="stat-value">
            {estadisticas.tarjetasUtilizadas}
          </strong>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon green">
              <CreditCard size={22} />
            </div>
          </div>
          <span className="stat-title">Saldo pendiente total</span>
          <strong className="stat-value">
            {formatoMoneda(estadisticas.saldoTotal)}
          </strong>
        </div>
      </div>

      <section className="clientes-table-card section-block">
        <div className="clientes-table-toolbar">
          <div>
            <h3>Historial de pagos</h3>
            <p>
              {pagosFiltrados.length} pago(s) encontrados
            </p>
          </div>

          <div className="filters-row">
            <label className="clientes-search">
              <Search size={18} />
              <input
                type="search"
                placeholder="Buscar por tarjeta, titular o descripción..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>N.º pago</th>
                <th>Número de tarjeta</th>
                <th>Titular</th>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Monto abonado</th>
              </tr>
            </thead>

            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan="6" className="clientes-empty">
                    Cargando pagos...
                  </td>
                </tr>
              ) : pagosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="clientes-empty">
                    {pagos.length === 0
                      ? 'Todavía no hay pagos registrados.'
                      : 'No se encontraron pagos con esa búsqueda.'}
                  </td>
                </tr>
              ) : (
                pagosFiltrados.map((pago) => (
                  <tr key={pago.pagoId}>
                    <td>
                      <span className="table-primary-text">
                        #{pago.pagoId}
                      </span>
                    </td>

                    <td className="table-nowrap">
                      {ocultarNumero(pago.tarjeta?.numeroTarjeta)}
                    </td>

                    <td>
                      <span className="table-primary-text">
                        {obtenerTitular(pago.tarjeta)}
                      </span>
                    </td>

                    <td className="table-nowrap">
                      {formatoFecha(pago.fechaPago)}
                    </td>

                    <td>{pago.descripcion}</td>

                    <td className="table-nowrap">
                      <span className="table-primary-text">
                        {formatoMoneda(pago.montoPago)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {modalRegistro && (
        <div className="modal-overlay">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-pago"
          >
            <div className="modal-header">
              <div>
                <span className="modal-subtitle">
                  GESTIÓN DE PAGOS
                </span>
                <h2 id="titulo-pago">Registrar pago</h2>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={cerrarModal}
                disabled={guardando}
                aria-label="Cerrar formulario"
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={registrarPago}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label
                      htmlFor="numeroTarjeta"
                      className="form-label"
                    >
                      Tarjeta de crédito{' '}
                      <span className="required">*</span>
                    </label>

                    <select
                      id="numeroTarjeta"
                      name="numeroTarjeta"
                      className="form-control"
                      value={formulario.numeroTarjeta}
                      onChange={cambiarCampo}
                      disabled={guardando}
                      required
                    >
                      <option value="">Selecciona una tarjeta</option>

                      {tarjetas.map((tarjeta) => (
                        <option
                          key={tarjeta.numeroTarjeta}
                          value={tarjeta.numeroTarjeta}
                        >
                          {ocultarNumero(tarjeta.numeroTarjeta)} —{' '}
                          {obtenerTitular(tarjeta)} — Saldo:{' '}
                          {formatoMoneda(tarjeta.saldoActual)}
                        </option>
                      ))}
                    </select>

                    {errores.numeroTarjeta && (
                      <small className="form-error">
                        {errores.numeroTarjeta}
                      </small>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="monto" className="form-label">
                      Monto del pago (Q){' '}
                      <span className="required">*</span>
                    </label>

                    <input
                      id="monto"
                      name="monto"
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="Ej. 250.00"
                      className="form-control"
                      value={formulario.monto}
                      onChange={cambiarCampo}
                      disabled={guardando}
                      required
                    />

                    {errores.monto && (
                      <small className="form-error">
                        {errores.monto}
                      </small>
                    )}

                    {formulario.numeroTarjeta && (
                      <small className="form-hint">
                        Saldo pendiente de la tarjeta:{' '}
                        {formatoMoneda(saldoPendiente)}
                      </small>
                    )}
                  </div>

                  <div className="form-group">
                    <label
                      htmlFor="descripcion"
                      className="form-label"
                    >
                      Descripción{' '}
                      <span className="required">*</span>
                    </label>

                    <textarea
                      id="descripcion"
                      name="descripcion"
                      rows={3}
                      maxLength={250}
                      placeholder="Ej. Abono mensual a tarjeta"
                      className="form-control"
                      value={formulario.descripcion}
                      onChange={cambiarCampo}
                      disabled={guardando}
                      required
                    />

                    {errores.descripcion && (
                      <small className="form-error">
                        {errores.descripcion}
                      </small>
                    )}

                    <small className="form-hint">
                      Máximo 250 caracteres.
                    </small>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={cerrarModal}
                  disabled={guardando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={guardando}
                >
                  {guardando ? 'Registrando...' : 'Registrar pago'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}

export default Pagos
