
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CreditCard,
  Search,
  RefreshCw,
  Eye,
  X,
  Wallet,
  CircleDollarSign,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { apiFetch } from '../api'

const formatoMoneda = (valor) =>
  new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
  }).format(Number(valor ?? 0))

const obtenerCliente = (tarjeta) => {
  const cliente = tarjeta.solicitud?.cliente

  if (!cliente) return 'Cliente no disponible'

  return `${cliente.nombre ?? ''} ${cliente.apellido ?? ''}`.trim()
}

const ocultarNumero = (numero) => {
  if (!numero) return '—'

  const texto = String(numero)
  return `•••• •••• •••• ${texto.slice(-4)}`
}

function Tarjetas() {
  const [tarjetas, setTarjetas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [detalle, setDetalle] = useState(null)

  const cargarTarjetas = useCallback(async () => {
    setCargando(true)
    setError('')

    try {
      const respuesta = await apiFetch('/api/tarjetas')

      if (!respuesta.ok) {
        throw new Error(
          `Error al consultar tarjetas: HTTP ${respuesta.status}`,
        )
      }

      const datos = await respuesta.json()
      setTarjetas(Array.isArray(datos) ? datos : [])
    } catch (e) {
      console.error('Error al cargar tarjetas:', e)
      setError(
        e.message || 'No fue posible cargar las tarjetas.',
      )
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarTarjetas()
  }, [cargarTarjetas])

  const estadisticas = useMemo(() => ({
    total: tarjetas.length,
    limiteTotal: tarjetas.reduce(
      (total, tarjeta) =>
        total + Number(tarjeta.limiteCredito ?? 0),
      0,
    ),
    saldoTotal: tarjetas.reduce(
      (total, tarjeta) =>
        total + Number(tarjeta.saldoActual ?? 0),
      0,
    ),
    disponibles: tarjetas.reduce(
      (total, tarjeta) =>
        total +
        Math.max(
          0,
          Number(tarjeta.limiteCredito ?? 0) -
            Number(tarjeta.saldoActual ?? 0),
        ),
      0,
    ),
  }), [tarjetas])

  const tarjetasFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()

    return tarjetas.filter((tarjeta) => {
      const cliente = obtenerCliente(tarjeta).toLowerCase()
      const numero = String(tarjeta.numeroTarjeta ?? '').toLowerCase()
      const tipo = String(
        tarjeta.tipoTarjeta?.nombre ?? '',
      ).toLowerCase()

      return (
        numero.includes(termino) ||
        cliente.includes(termino) ||
        tipo.includes(termino)
      )
    })
  }, [tarjetas, busqueda])

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
            <h1>Gestión de tarjetas</h1>
            <p>
              Consulta las tarjetas emitidas y revisa sus límites,
              saldos y crédito disponible.
            </p>
          </div>
        </div>

        <div className="clientes-table-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={cargarTarjetas}
            disabled={cargando}
          >
            <RefreshCw size={17} />
            Actualizar
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon blue">
              <CreditCard size={22} />
            </div>
          </div>
          <span className="stat-title">Tarjetas emitidas</span>
          <strong className="stat-value">{estadisticas.total}</strong>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon purple">
              <CircleDollarSign size={22} />
            </div>
          </div>
          <span className="stat-title">Límite de crédito total</span>
          <strong className="stat-value">
            {formatoMoneda(estadisticas.limiteTotal)}
          </strong>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon orange">
              <Wallet size={22} />
            </div>
          </div>
          <span className="stat-title">Saldo utilizado</span>
          <strong className="stat-value">
            {formatoMoneda(estadisticas.saldoTotal)}
          </strong>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon green">
              <CheckCircle2 size={22} />
            </div>
          </div>
          <span className="stat-title">Crédito disponible</span>
          <strong className="stat-value">
            {formatoMoneda(estadisticas.disponibles)}
          </strong>
        </div>
      </div>

      <section className="clientes-table-card section-block">
        <div className="clientes-table-toolbar">
          <div>
            <h3>Listado de tarjetas</h3>
            <p>
              {tarjetasFiltradas.length} tarjeta(s) encontradas
            </p>
          </div>

          <div className="filters-row">
            <label className="clientes-search">
              <Search size={18} />
              <input
                type="search"
                placeholder="Buscar por número, titular o tipo..."
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
                <th>Número de tarjeta</th>
                <th>Titular</th>
                <th>Tipo</th>
                <th>Límite de crédito</th>
                <th>Saldo actual</th>
                <th>Disponible</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan="7" className="clientes-empty">
                    Cargando tarjetas...
                  </td>
                </tr>
              ) : tarjetasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="7" className="clientes-empty">
                    {tarjetas.length === 0
                      ? 'Todavía no hay tarjetas emitidas.'
                      : 'No se encontraron tarjetas con esa búsqueda.'}
                  </td>
                </tr>
              ) : (
                tarjetasFiltradas.map((tarjeta) => {
                  const disponible = Math.max(
                    0,
                    Number(tarjeta.limiteCredito ?? 0) -
                      Number(tarjeta.saldoActual ?? 0),
                  )

                  return (
                    <tr key={tarjeta.numeroTarjeta}>
                      <td>
                        <span className="table-primary-text">
                          {ocultarNumero(tarjeta.numeroTarjeta)}
                        </span>
                      </td>

                      <td>
                        <span className="table-primary-text">
                          {obtenerCliente(tarjeta)}
                        </span>
                      </td>

                      <td>
                        <span className="status-badge status-active">
                          {tarjeta.tipoTarjeta?.nombre ?? 'Sin tipo'}
                        </span>
                      </td>

                      <td className="table-nowrap">
                        {formatoMoneda(tarjeta.limiteCredito)}
                      </td>

                      <td className="table-nowrap">
                        {formatoMoneda(tarjeta.saldoActual)}
                      </td>

                      <td className="table-nowrap">
                        {formatoMoneda(disponible)}
                      </td>

                      <td>
                        <div className="table-row-actions">
                          <button
                            type="button"
                            className="table-action table-action-view"
                            title="Ver detalle"
                            aria-label="Ver detalle de tarjeta"
                            onClick={() => setDetalle(tarjeta)}
                          >
                            <Eye size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {detalle && (
        <div className="modal-overlay">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-detalle-tarjeta"
          >
            <div className="modal-header">
              <div>
                <span className="modal-subtitle">
                  INFORMACIÓN DE TARJETA
                </span>
                <h2 id="titulo-detalle-tarjeta">
                  Detalle de tarjeta
                </h2>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setDetalle(null)}
                aria-label="Cerrar detalle"
              >
                <X size={21} />
              </button>
            </div>

            <div className="modal-body">
              <div className="clientes-detail-grid">
                <div className="clientes-detail-item">
                  <span>Número de tarjeta</span>
                  <strong>{ocultarNumero(detalle.numeroTarjeta)}</strong>
                </div>

                <div className="clientes-detail-item">
                  <span>Titular</span>
                  <strong>{obtenerCliente(detalle)}</strong>
                </div>

                <div className="clientes-detail-item">
                  <span>DPI</span>
                  <strong>
                    {detalle.solicitud?.cliente?.noDpi ?? '—'}
                  </strong>
                </div>

                <div className="clientes-detail-item">
                  <span>Tipo de tarjeta</span>
                  <strong>
                    {detalle.tipoTarjeta?.nombre ?? '—'}
                  </strong>
                </div>

                <div className="clientes-detail-item">
                  <span>Límite de crédito</span>
                  <strong>
                    {formatoMoneda(detalle.limiteCredito)}
                  </strong>
                </div>

                <div className="clientes-detail-item">
                  <span>Saldo actual</span>
                  <strong>{formatoMoneda(detalle.saldoActual)}</strong>
                </div>

                <div className="clientes-detail-item">
                  <span>Crédito disponible</span>
                  <strong>
                    {formatoMoneda(
                      Math.max(
                        0,
                        Number(detalle.limiteCredito ?? 0) -
                          Number(detalle.saldoActual ?? 0),
                      ),
                    )}
                  </strong>
                </div>

                <div className="clientes-detail-item">
                  <span>Solicitud relacionada</span>
                  <strong>
                    {detalle.solicitud?.solicitudId
                      ? `#${detalle.solicitud.solicitudId}`
                      : '—'}
                  </strong>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDetalle(null)}
              >
                Cerrar
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default Tarjetas
