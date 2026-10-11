
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Search,
  Plus,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  X,
  AlertCircle,
} from 'lucide-react'
import { apiFetch } from '../api'

const formularioInicial = {
  clienteId: '',
  tipoTarjetaId: '',
  ingreso: '',
}

const estadoNombre = (solicitud) =>
  solicitud.estadoSolicitud?.nombre ?? 'Sin estado'

const formatoFecha = (fecha) => {
  if (!fecha) return '—'

  const fechaLocal = new Date(fecha)

  if (Number.isNaN(fechaLocal.getTime())) {
    return String(fecha).slice(0, 10)
  }

  return fechaLocal.toLocaleDateString('es-GT')
}

const formatoMoneda = (valor) =>
  new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
  }).format(Number(valor ?? 0))

function Solicitudes() {
  const [solicitudes, setSolicitudes] = useState([])
  const [clientes, setClientes] = useState([])
  const [tiposTarjeta, setTiposTarjeta] = useState([])

  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('Todos')

  const [modalRegistro, setModalRegistro] = useState(false)
  const [modalDecision, setModalDecision] = useState(null)
  const [detalle, setDetalle] = useState(null)

  const [formulario, setFormulario] = useState(formularioInicial)
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)

  const [montoAprobado, setMontoAprobado] = useState('')
  const [motivoComentario, setMotivoComentario] = useState('')

  const cargarDatos = useCallback(async () => {
    setCargando(true)
    setError('')

    try {
      const [rSolicitudes, rClientes, rTipos] = await Promise.all([
        apiFetch('/api/solicitudes'),
        apiFetch('/api/clientes'),
        apiFetch('/api/tipos-tarjeta'),
      ])

      if (!rSolicitudes.ok) {
        throw new Error(
          `Error al consultar solicitudes: HTTP ${rSolicitudes.status}`,
        )
      }

      if (!rClientes.ok) {
        throw new Error(
          `Error al consultar clientes: HTTP ${rClientes.status}`,
        )
      }

      if (!rTipos.ok) {
        throw new Error(
          `Error al consultar tipos de tarjeta: HTTP ${rTipos.status}`,
        )
      }

      const [datosSolicitudes, datosClientes, datosTipos] =
        await Promise.all([
          rSolicitudes.json(),
          rClientes.json(),
          rTipos.json(),
        ])

      setSolicitudes(
        Array.isArray(datosSolicitudes) ? datosSolicitudes : [],
      )
      setClientes(Array.isArray(datosClientes) ? datosClientes : [])
      setTiposTarjeta(Array.isArray(datosTipos) ? datosTipos : [])
    } catch (e) {
      console.error('Error al cargar solicitudes:', e)
      setError(e.message || 'No fue posible cargar los datos.')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarDatos()
  }, [cargarDatos])

  const estadisticas = useMemo(
    () => ({
      total: solicitudes.length,
      pendientes: solicitudes.filter(
        (s) => estadoNombre(s) === 'Pendiente',
      ).length,
      aprobadas: solicitudes.filter(
        (s) => estadoNombre(s) === 'Aprobada',
      ).length,
      rechazadas: solicitudes.filter(
        (s) => estadoNombre(s) === 'Rechazada',
      ).length,
    }),
    [solicitudes],
  )

  const solicitudesFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()

    return solicitudes.filter((s) => {
      const nombreCliente =
        `${s.cliente?.nombre ?? ''} ${s.cliente?.apellido ?? ''}`.toLowerCase()

      const coincideBusqueda =
        !termino ||
        nombreCliente.includes(termino) ||
        String(s.solicitudId ?? '').includes(termino) ||
        String(s.cliente?.noDpi ?? '').includes(termino)

      const coincideEstado =
        filtroEstado === 'Todos' || estadoNombre(s) === filtroEstado

      return coincideBusqueda && coincideEstado
    })
  }, [solicitudes, busqueda, filtroEstado])

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

  function abrirRegistro() {
    setFormulario({ ...formularioInicial })
    setErrores({})
    setError('')
    setMensaje('')
    setModalRegistro(true)
  }

  function validarRegistro() {
    const nuevosErrores = {}

    if (!formulario.clienteId) {
      nuevosErrores.clienteId = 'Selecciona un cliente.'
    }

    if (!formulario.tipoTarjetaId) {
      nuevosErrores.tipoTarjetaId = 'Selecciona un tipo de tarjeta.'
    }

    if (
      formulario.ingreso === '' ||
      !Number.isFinite(Number(formulario.ingreso)) ||
      Number(formulario.ingreso) < 0
    ) {
      nuevosErrores.ingreso =
        'Ingresa un ingreso válido mayor o igual a cero.'
    }

    setErrores(nuevosErrores)

    return Object.keys(nuevosErrores).length === 0
  }

  async function registrarSolicitud(evento) {
    evento.preventDefault()
    setError('')
    setMensaje('')

    if (!validarRegistro()) return

    setGuardando(true)

    try {
      const parametros = new URLSearchParams({
        clienteId: formulario.clienteId,
        tipoTarjetaId: formulario.tipoTarjetaId,
        ingreso: formulario.ingreso,
      })

      const respuesta = await apiFetch(
        `/api/solicitudes?${parametros}`,
        { method: 'POST' },
      )

      if (!respuesta.ok) {
        const texto = await respuesta.text()
        throw new Error(
          texto ||
            `No fue posible registrar la solicitud (HTTP ${respuesta.status}).`,
        )
      }

      setModalRegistro(false)
      setFormulario({ ...formularioInicial })
      setMensaje('Solicitud registrada correctamente.')

      await cargarDatos()
    } catch (e) {
      setError(e.message || 'Ocurrió un error al registrar la solicitud.')
    } finally {
      setGuardando(false)
    }
  }

  function abrirDecision(solicitud, tipo) {
    setError('')
    setMensaje('')
    setMontoAprobado('')
    setMotivoComentario('')
    setModalDecision({ solicitud, tipo })
  }

  async function resolverSolicitud(evento) {
    evento.preventDefault()

    if (!modalDecision) return

    setError('')
    setMensaje('')

    if (
      modalDecision.tipo === 'aprobar' &&
      (
        montoAprobado === '' ||
        !Number.isFinite(Number(montoAprobado)) ||
        Number(montoAprobado) <= 0
      )
    ) {
      setError('El monto aprobado debe ser mayor que cero.')
      return
    }

    if (
      modalDecision.tipo === 'rechazar' &&
      !motivoComentario.trim()
    ) {
      setError('El motivo del rechazo es obligatorio.')
      return
    }

    setGuardando(true)

    try {
      const { solicitud, tipo } = modalDecision
      const parametros = new URLSearchParams()

      if (tipo === 'aprobar') {
        parametros.set('montoAprobado', montoAprobado)

        if (motivoComentario.trim()) {
          parametros.set(
            'motivoComentario',
            motivoComentario.trim(),
          )
        }
      } else {
        parametros.set(
          'motivoComentario',
          motivoComentario.trim(),
        )
      }

      const respuesta = await apiFetch(
        `/api/solicitudes/${solicitud.solicitudId}/${
          tipo === 'aprobar' ? 'aprobar' : 'rechazar'
        }?${parametros}`,
        { method: 'PUT' },
      )

      if (!respuesta.ok) {
        const texto = await respuesta.text()
        throw new Error(
          texto ||
            `No fue posible procesar la solicitud (HTTP ${respuesta.status}).`,
        )
      }

      setModalDecision(null)

      setMensaje(
        tipo === 'aprobar'
          ? 'Solicitud aprobada y tarjeta emitida correctamente.'
          : 'Solicitud rechazada correctamente.',
      )

      await cargarDatos()
    } catch (e) {
      setError(e.message || 'Ocurrió un error al procesar la solicitud.')
    } finally {
      setGuardando(false)
    }
  }

  function cerrarModalRegistro() {
    if (!guardando) setModalRegistro(false)
  }

  function cerrarModalDecision() {
    if (!guardando) setModalDecision(null)
  }

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
            <h1>Gestión de solicitudes</h1>
            <p>
              Consulta, registra y administra solicitudes de tarjetas
              de crédito.
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
            disabled={cargando || clientes.length === 0 || tiposTarjeta.length === 0}
          >
            <Plus size={18} />
            Nueva solicitud
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon blue">
              <FileText size={22} />
            </div>
          </div>
          <span className="stat-title">Total de solicitudes</span>
          <strong className="stat-value">{estadisticas.total}</strong>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon orange">
              <Clock size={22} />
            </div>
          </div>
          <span className="stat-title">Pendientes</span>
          <strong className="stat-value">{estadisticas.pendientes}</strong>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon green">
              <CheckCircle2 size={22} />
            </div>
          </div>
          <span className="stat-title">Aprobadas</span>
          <strong className="stat-value">{estadisticas.aprobadas}</strong>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon purple">
              <XCircle size={22} />
            </div>
          </div>
          <span className="stat-title">Rechazadas</span>
          <strong className="stat-value">{estadisticas.rechazadas}</strong>
        </div>
      </div>

      <section className="clientes-table-card section-block">
        <div className="clientes-table-toolbar">
          <div>
            <h3>Listado de solicitudes</h3>
            <p>
              {solicitudesFiltradas.length} registro(s) encontrados
            </p>
          </div>

          <div className="filters-row">
            <label className="clientes-search">
              <Search size={18} />
              <input
                type="search"
                placeholder="Buscar por cliente, DPI o número..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </label>

            <select
              className="form-control"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              aria-label="Filtrar por estado"
            >
              <option value="Todos">Todos los estados</option>
              <option value="Pendiente">Pendientes</option>
              <option value="Aprobada">Aprobadas</option>
              <option value="Rechazada">Rechazadas</option>
            </select>
          </div>
        </div>

        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Solicitud</th>
                <th>Cliente</th>
                <th>Tipo de tarjeta</th>
                <th>Fecha</th>
                <th>Ingreso mensual</th>
                <th>Estado</th>
                <th>Monto aprobado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan="8" className="clientes-empty">
                    Cargando solicitudes...
                  </td>
                </tr>
              ) : solicitudesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="8" className="clientes-empty">
                    No hay solicitudes para mostrar.
                  </td>
                </tr>
              ) : (
                solicitudesFiltradas.map((solicitud) => {
                  const estado = estadoNombre(solicitud)
                  const pendiente = estado === 'Pendiente'

                  const claseEstado =
                    estado === 'Pendiente'
                      ? 'status-pending'
                      : estado === 'Aprobada'
                        ? 'status-approved'
                        : estado === 'Rechazada'
                          ? 'status-rejected'
                          : ''

                  return (
                    <tr key={solicitud.solicitudId}>
                      <td>
                        <span className="table-primary-text">
                          #{solicitud.solicitudId}
                        </span>
                      </td>

                      <td>
                        <span className="table-primary-text">
                          {solicitud.cliente?.nombre ?? 'Cliente'}{' '}
                          {solicitud.cliente?.apellido ?? ''}
                        </span>
                        <span className="table-secondary-text">
                          {solicitud.cliente?.noDpi ?? 'DPI no disponible'}
                        </span>
                      </td>

                      <td>{solicitud.tipoTarjeta?.nombre ?? '—'}</td>
                      <td className="table-nowrap">
                        {formatoFecha(solicitud.fechaSolicitud)}
                      </td>
                      <td className="table-nowrap">
                        {formatoMoneda(solicitud.ingreso)}
                      </td>

                      <td>
                        <span className={`status-badge ${claseEstado}`}>
                          {estado}
                        </span>
                      </td>

                      <td className="table-nowrap">
                        {solicitud.montoAprobado == null
                          ? '—'
                          : formatoMoneda(solicitud.montoAprobado)}
                      </td>

                      <td>
                        <div className="table-row-actions">
                          <button
                            type="button"
                            className="table-action table-action-view"
                            title="Ver detalle"
                            aria-label="Ver detalle"
                            onClick={() => setDetalle(solicitud)}
                          >
                            <Eye size={17} />
                          </button>

                          {pendiente && (
                            <>
                              <button
                                type="button"
                                className="table-action table-action-view"
                                title="Aprobar"
                                aria-label="Aprobar solicitud"
                                onClick={() =>
                                  abrirDecision(solicitud, 'aprobar')
                                }
                              >
                                <CheckCircle2 size={17} />
                              </button>

                              <button
                                type="button"
                                className="table-action table-action-delete"
                                title="Rechazar"
                                aria-label="Rechazar solicitud"
                                onClick={() =>
                                  abrirDecision(solicitud, 'rechazar')
                                }
                              >
                                <XCircle size={17} />
                              </button>
                            </>
                          )}
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

      {modalRegistro && (
        <div className="modal-overlay">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-registro"
          >
            <div className="modal-header">
              <div>
                <span className="modal-subtitle">
                  GESTIÓN DE SOLICITUDES
                </span>
                <h2 id="titulo-registro">Nueva solicitud</h2>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={cerrarModalRegistro}
                disabled={guardando}
                aria-label="Cerrar formulario"
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={registrarSolicitud}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="clienteId" className="form-label">
                      Cliente <span className="required">*</span>
                    </label>

                    <select
                      id="clienteId"
                      name="clienteId"
                      className={`form-control ${errores.clienteId ? 'field-invalid' : ''}`}
                      value={formulario.clienteId}
                      onChange={cambiarCampo}
                      disabled={guardando}
                      required
                    >
                      <option value="">Selecciona un cliente</option>
                      {clientes.map((cliente) => (
                        <option
                          key={cliente.clienteId}
                          value={cliente.clienteId}
                        >
                          {cliente.nombre} {cliente.apellido} — {cliente.noDpi}
                        </option>
                      ))}
                    </select>

                    {errores.clienteId && (
                      <small className="form-error">
                        {errores.clienteId}
                      </small>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="tipoTarjetaId" className="form-label">
                      Tipo de tarjeta <span className="required">*</span>
                    </label>

                    <select
                      id="tipoTarjetaId"
                      name="tipoTarjetaId"
                      className={`form-control ${errores.tipoTarjetaId ? 'field-invalid' : ''}`}
                      value={formulario.tipoTarjetaId}
                      onChange={cambiarCampo}
                      disabled={guardando}
                      required
                    >
                      <option value="">Selecciona un tipo</option>
                      
                        {tiposTarjeta.map((tipo) => {
                        const idTipo = tipo.tipoTarjetaId ?? tipo.TipoTarjetaId

                        return (
                            <option key={idTipo} value={idTipo}>
                            {tipo.nombre}
                            </option>
                        )
                        })}

                    </select>

                    {errores.tipoTarjetaId && (
                      <small className="form-error">
                        {errores.tipoTarjetaId}
                      </small>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="ingreso" className="form-label">
                      Ingreso mensual declarado (Q){' '}
                      <span className="required">*</span>
                    </label>

                    <input
                      id="ingreso"
                      name="ingreso"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Ej. 6500.00"
                      className={`form-control ${errores.ingreso ? 'field-invalid' : ''}`}
                      value={formulario.ingreso}
                      onChange={cambiarCampo}
                      disabled={guardando}
                      required
                    />

                    {errores.ingreso && (
                      <small className="form-error">
                        {errores.ingreso}
                      </small>
                    )}
                  </div>
                </div>

                <p className="form-hint">
                  La solicitud se registrará inicialmente con estado
                  Pendiente.
                </p>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={cerrarModalRegistro}
                  disabled={guardando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={guardando}
                >
                  {guardando ? 'Registrando...' : 'Registrar solicitud'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {modalDecision && (
        <div className="modal-overlay">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-decision"
          >
            <div className="modal-header">
              <div>
                <span className="modal-subtitle">
                  SOLICITUD #{modalDecision.solicitud.solicitudId}
                </span>
                <h2 id="titulo-decision">
                  {modalDecision.tipo === 'aprobar'
                    ? 'Aprobar solicitud'
                    : 'Rechazar solicitud'}
                </h2>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={cerrarModalDecision}
                disabled={guardando}
                aria-label="Cerrar"
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={resolverSolicitud}>
              <div className="modal-body">
                {modalDecision.tipo === 'aprobar' && (
                  <div className="form-group">
                    <label htmlFor="montoAprobado" className="form-label">
                      Monto aprobado (Q){' '}
                      <span className="required">*</span>
                    </label>

                    <input
                      id="montoAprobado"
                      type="number"
                      min="0.01"
                      step="0.01"
                      className="form-control"
                      value={montoAprobado}
                      onChange={(e) => setMontoAprobado(e.target.value)}
                      placeholder="Ej. 10000.00"
                      disabled={guardando}
                      required
                    />

                    <small className="form-hint">
                      Al aprobar, el backend emitirá automáticamente la
                      tarjeta.
                    </small>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="motivoComentario" className="form-label">
                    {modalDecision.tipo === 'aprobar'
                      ? 'Comentario (opcional)'
                      : 'Motivo del rechazo'}

                    {modalDecision.tipo === 'rechazar' && (
                      <span className="required"> *</span>
                    )}
                  </label>

                  <textarea
                    id="motivoComentario"
                    className="form-control"
                    rows={3}
                    maxLength={250}
                    value={motivoComentario}
                    onChange={(e) => setMotivoComentario(e.target.value)}
                    placeholder={
                      modalDecision.tipo === 'aprobar'
                        ? 'Comentario adicional'
                        : 'Escribe el motivo del rechazo'
                    }
                    disabled={guardando}
                    required={modalDecision.tipo === 'rechazar'}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={cerrarModalDecision}
                  disabled={guardando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className={
                    modalDecision.tipo === 'aprobar'
                      ? 'btn btn-primary'
                      : 'btn btn-danger'
                  }
                  disabled={guardando}
                >
                  {guardando
                    ? 'Procesando...'
                    : modalDecision.tipo === 'aprobar'
                      ? 'Confirmar aprobación'
                      : 'Confirmar rechazo'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {detalle && (
        <div className="modal-overlay">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-detalle"
          >
            <div className="modal-header">
              <div>
                <span className="modal-subtitle">
                  INFORMACIÓN DE SOLICITUD
                </span>
                <h2 id="titulo-detalle">
                  Solicitud #{detalle.solicitudId}
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
                  <span>Cliente</span>
                  <strong>
                    {detalle.cliente?.nombre ?? '—'}{' '}
                    {detalle.cliente?.apellido ?? ''}
                  </strong>
                </div>

                <div className="clientes-detail-item">
                  <span>DPI</span>
                  <strong>{detalle.cliente?.noDpi ?? '—'}</strong>
                </div>

                <div className="clientes-detail-item">
                  <span>Tipo de tarjeta</span>
                  <strong>{detalle.tipoTarjeta?.nombre ?? '—'}</strong>
                </div>

                <div className="clientes-detail-item">
                  <span>Fecha de solicitud</span>
                  <strong>{formatoFecha(detalle.fechaSolicitud)}</strong>
                </div>

                <div className="clientes-detail-item">
                  <span>Ingreso mensual</span>
                  <strong>{formatoMoneda(detalle.ingreso)}</strong>
                </div>

                <div className="clientes-detail-item">
                  <span>Estado</span>
                  <strong>{estadoNombre(detalle)}</strong>
                </div>

                <div className="clientes-detail-item">
                  <span>Fecha de decisión</span>
                  <strong>{formatoFecha(detalle.fechaDecision)}</strong>
                </div>

                <div className="clientes-detail-item">
                  <span>Monto aprobado</span>
                  <strong>
                    {detalle.montoAprobado == null
                      ? '—'
                      : formatoMoneda(detalle.montoAprobado)}
                  </strong>
                </div>

                <div className="clientes-detail-item">
                  <span>Motivo o comentario</span>
                  <strong>
                    {detalle.motivoComentario || 'Sin comentario'}
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

              {estadoNombre(detalle) === 'Pendiente' && (
                <>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      const solicitud = detalle
                      setDetalle(null)
                      abrirDecision(solicitud, 'aprobar')
                    }}
                  >
                    Aprobar
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => {
                      const solicitud = detalle
                      setDetalle(null)
                      abrirDecision(solicitud, 'rechazar')
                    }}
                  >
                    Rechazar
                  </button>
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default Solicitudes
