import { useEffect, useMemo, useState } from 'react'
import {
  Search,
  UserPlus,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  Users,
  AlertCircle,
  Eye,
} from 'lucide-react'

const API_URL = 'http://localhost:8080/api/clientes'

const formularioInicial = {
  nombre: '',
  apellido: '',
  noDpi: '',
  fechaNacimiento: '',
  direccion: '',
  correo: '',
  telefono: '',
}

function Clientes() {
  const [clientes, setClientes] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modo, setModo] = useState('crear')
  const [clienteId, setClienteId] = useState(null)
  const [formulario, setFormulario] = useState(formularioInicial)
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [clienteDetalle, setClienteDetalle] = useState(null)
  const [confirmacion, setConfirmacion] = useState(null)

  async function cargarClientes() {
    setCargando(true)
    setError('')

    try {
      const respuesta = await fetch(API_URL)

      if (!respuesta.ok) {
        throw new Error('No fue posible obtener los clientes.')
      }

      const datos = await respuesta.json()
      setClientes(Array.isArray(datos) ? datos : [])
    } catch {
      setError(
        'No se pudieron cargar los clientes. Verifica que Spring Boot esté ejecutándose en el puerto 8080.',
      )
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarClientes()
  }, [])

  const clientesFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()

    if (!termino) return clientes

    return clientes.filter((cliente) => {
      const nombreCompleto =
        `${cliente.nombre ?? ''} ${cliente.apellido ?? ''}`.toLowerCase()

      return (
        nombreCompleto.includes(termino) ||
        String(cliente.noDpi ?? '').toLowerCase().includes(termino) ||
        String(cliente.correo ?? '').toLowerCase().includes(termino)
      )
    })
  }, [clientes, busqueda])

  function abrirCrear() {
    setModo('crear')
    setClienteId(null)
    setFormulario(formularioInicial)
    setErrores({})
    setError('')
    setMensaje('')
    setModalAbierto(true)
  }

  function abrirEditar(cliente) {
    setModo('editar')
    setClienteId(cliente.clienteId)
    setFormulario({
      nombre: cliente.nombre ?? '',
      apellido: cliente.apellido ?? '',
      noDpi: cliente.noDpi ?? '',
      fechaNacimiento: String(cliente.fechaNacimiento ?? '').slice(0, 10),
      direccion: cliente.direccion ?? '',
      correo: cliente.correo ?? '',
      telefono: cliente.telefono ?? '',
    })
    setErrores({})
    setError('')
    setMensaje('')
    setModalAbierto(true)
  }

  function cambiarCampo(evento) {
    const { name, value } = evento.target

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }))

    setErrores((anteriores) => ({
      ...anteriores,
      [name]: '',
    }))
  }

  function validarFormulario() {
    const nuevosErrores = {}

    const camposObligatorios = [
      'nombre',
      'apellido',
      'noDpi',
      'fechaNacimiento',
      'direccion',
      'correo',
      'telefono',
    ]

    camposObligatorios.forEach((campo) => {
      if (!String(formulario[campo] ?? '').trim()) {
        nuevosErrores[campo] = 'Completa este campo.'
      }
    })

    if (
      formulario.fechaNacimiento &&
      formulario.fechaNacimiento > new Date().toLocaleDateString('en-CA')
    ) {
      nuevosErrores.fechaNacimiento =
        'La fecha de nacimiento no puede ser posterior a la fecha actual.'
    }

    if (
      formulario.correo &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.correo)
    ) {
      nuevosErrores.correo = 'Ingresa un correo electrónico válido.'
    }

    if (formulario.noDpi && !/^\d{13}$/.test(formulario.noDpi)) {
      nuevosErrores.noDpi = 'El DPI debe contener exactamente 13 dígitos.'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  async function guardarCliente(evento) {
    evento.preventDefault()
    setError('')
    setMensaje('')

    if (!validarFormulario()) return

    setGuardando(true)

    try {
      const respuesta = await fetch(
        modo === 'crear' ? API_URL : `${API_URL}/${clienteId}`,
        {
          method: modo === 'crear' ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formulario),
        },
      )

      if (!respuesta.ok) {
        const texto = await respuesta.text()
        throw new Error(texto || 'No fue posible guardar el cliente.')
      }

      setModalAbierto(false)
      setMensaje(
        modo === 'crear'
          ? 'Cliente registrado correctamente.'
          : 'Cliente actualizado correctamente.',
      )
      await cargarClientes()
    } catch (errorGuardado) {
      setError(
        errorGuardado.message ||
          'Ocurrió un error al guardar el cliente.',
      )
    } finally {
      setGuardando(false)
    }
  }

  async function eliminarCliente() {
    if (!confirmacion) return

    setError('')
    setMensaje('')

    try {
      const respuesta = await fetch(`${API_URL}/${confirmacion.clienteId}`, {
        method: 'DELETE',
      })

      if (!respuesta.ok) {
        const texto = await respuesta.text()
        throw new Error(texto || 'No fue posible eliminar el cliente.')
      }

      setConfirmacion(null)
      setMensaje('Cliente eliminado correctamente.')
      await cargarClientes()
    } catch (errorEliminacion) {
      setConfirmacion(null)
      setError(
        errorEliminacion.message || 'Ocurrió un error al eliminar el cliente.',
      )
    }
  }

  return (
    <div className="clientes-page">
      <div className="clientes-toolbar">
        <div className="clientes-intro">
          <h2>Directorio de clientes</h2>
          <p>Consulta y administra la información de los clientes registrados.</p>
        </div>

        <button className="clientes-primary-button" onClick={abrirCrear}>
          <UserPlus size={18} />
          Nuevo cliente
        </button>
      </div>

      {mensaje && (
        <div className="clientes-alert clientes-alert-success">
          {mensaje}
          <button onClick={() => setMensaje('')} aria-label="Cerrar mensaje">
            <X size={17} />
          </button>
        </div>
      )}

      {error && (
        <div className="clientes-alert clientes-alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button onClick={() => setError('')} aria-label="Cerrar error">
            <X size={17} />
          </button>
        </div>
      )}

      <section className="clientes-summary">
        <div className="clientes-summary-icon">
          <Users size={24} />
        </div>
        <div>
          <span>Clientes registrados</span>
          <strong>{clientes.length}</strong>
        </div>
        <div className="clientes-summary-note">
          Información obtenida del sistema
        </div>
      </section>

      <section className="clientes-table-card">
        <div className="clientes-table-toolbar">
          <div>
            <h3>Listado de clientes</h3>
            <p>{clientesFiltrados.length} registro(s) encontrados</p>
          </div>

          <div className="clientes-table-actions">
            <label className="clientes-search">
              <Search size={18} />
              <input
                type="search"
                placeholder="Buscar por nombre, DPI o correo..."
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
              />
            </label>

            <button
              className="clientes-refresh-button"
              onClick={cargarClientes}
              disabled={cargando}
              aria-label="Actualizar listado"
              title="Actualizar listado"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        <div className="clientes-table-scroll">
          <table className="clientes-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>DPI</th>
                <th>Correo electrónico</th>
                <th>Teléfono</th>
                <th>Fecha de nacimiento</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan="6" className="clientes-empty">
                    Cargando clientes...
                  </td>
                </tr>
              ) : clientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="clientes-empty">
                    {busqueda
                      ? 'No se encontraron clientes con esa búsqueda.'
                      : 'Todavía no hay clientes registrados.'}
                  </td>
                </tr>
              ) : (
                clientesFiltrados.map((cliente) => (
                  <tr key={cliente.clienteId}>
                    <td>
                      <div className="cliente-cell">
                        <div className="cliente-avatar">
                          {cliente.nombre?.charAt(0)?.toUpperCase() || 'C'}
                        </div>
                        <div>
                          <strong>
                            {cliente.nombre} {cliente.apellido}
                          </strong>
                          <span>ID: {cliente.clienteId}</span>
                        </div>
                      </div>
                    </td>
                    <td>{cliente.noDpi}</td>
                    <td>{cliente.correo}</td>
                    <td>{cliente.telefono}</td>
                    <td>{String(cliente.fechaNacimiento ?? '').slice(0, 10)}</td>
                    <td>
                      <div className="cliente-actions">
                        <button
                          className="cliente-action view"
                          title="Ver detalle"
                          aria-label="Ver detalle"
                          onClick={() => setClienteDetalle(cliente)}
                        >
                          <Eye size={17} />
                        </button>
                        <button
                          className="cliente-action edit"
                          title="Editar cliente"
                          aria-label="Editar cliente"
                          onClick={() => abrirEditar(cliente)}
                        >
                          <Pencil size={17} />
                        </button>
                        <button
                          className="cliente-action delete"
                          title="Eliminar cliente"
                          aria-label="Eliminar cliente"
                          onClick={() => setConfirmacion(cliente)}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {modalAbierto && (
        <div
          className="clientes-modal-overlay"
          onMouseDown={(evento) => {
            if (evento.target === evento.currentTarget && !guardando) {
              setModalAbierto(false)
            }
          }}
        >
          <section
            className="clientes-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cliente-modal-title"
          >
            <div className="clientes-modal-header">
              <div>
                <span>GESTIÓN DE CLIENTES</span>
                <h2 id="cliente-modal-title">
                  {modo === 'crear' ? 'Registrar cliente' : 'Editar cliente'}
                </h2>
              </div>
              <button
                className="clientes-modal-close"
                onClick={() => setModalAbierto(false)}
                disabled={guardando}
                aria-label="Cerrar formulario"
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={guardarCliente}>
              <div className="clientes-form-grid">
                {[
                  { name: 'nombre', label: 'Nombre', placeholder: 'Nombre del cliente' },
                  { name: 'apellido', label: 'Apellido', placeholder: 'Apellido del cliente' },
                  { name: 'noDpi', label: 'DPI', placeholder: '13 dígitos', maxLength: 13 },
                  { name: 'fechaNacimiento', label: 'Fecha de nacimiento', type: 'date' },
                  { name: 'correo', label: 'Correo electrónico', placeholder: 'correo@ejemplo.com', type: 'email' },
                  { name: 'telefono', label: 'Teléfono', placeholder: 'Número de teléfono' },
                ].map(({ name, label, placeholder, type = 'text', maxLength }) => (
                  <div className="clientes-field" key={name}>
                    <label htmlFor={name}>{label} <span>*</span></label>
                    <input
                      id={name}
                      name={name}
                      type={type}
                      placeholder={placeholder}
                      value={formulario[name]}
                      onChange={cambiarCampo}
                      maxLength={maxLength}
                      disabled={guardando}
                      className={errores[name] ? 'field-invalid' : ''}
                    />
                    {errores[name] && (
                      <small className="clientes-field-error">{errores[name]}</small>
                    )}
                  </div>
                ))}

                <div className="clientes-field clientes-field-full">
                  <label htmlFor="direccion">Dirección <span>*</span></label>
                  <textarea
                    id="direccion"
                    name="direccion"
                    placeholder="Dirección de residencia"
                    value={formulario.direccion}
                    onChange={cambiarCampo}
                    rows={3}
                    disabled={guardando}
                    className={errores.direccion ? 'field-invalid' : ''}
                  />
                  {errores.direccion && (
                    <small className="clientes-field-error">{errores.direccion}</small>
                  )}
                </div>
              </div>

              <div className="clientes-modal-footer">
                <button
                  type="button"
                  className="clientes-secondary-button"
                  onClick={() => setModalAbierto(false)}
                  disabled={guardando}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="clientes-primary-button"
                  disabled={guardando}
                >
                  {guardando
                    ? 'Guardando...'
                    : modo === 'crear'
                      ? 'Registrar cliente'
                      : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {clienteDetalle && (
        <div className="clientes-modal-overlay">
          <section className="clientes-modal clientes-detail-modal" role="dialog" aria-modal="true">
            <div className="clientes-modal-header">
              <div>
                <span>INFORMACIÓN DEL CLIENTE</span>
                <h2>Detalle del cliente</h2>
              </div>
              <button
                className="clientes-modal-close"
                onClick={() => setClienteDetalle(null)}
                aria-label="Cerrar detalle"
              >
                <X size={21} />
              </button>
            </div>

            <div className="clientes-detail-profile">
              <div className="cliente-avatar cliente-avatar-large">
                {clienteDetalle.nombre?.charAt(0)?.toUpperCase() || 'C'}
              </div>
              <div>
                <h3>{clienteDetalle.nombre} {clienteDetalle.apellido}</h3>
                <span>Cliente #{clienteDetalle.clienteId}</span>
              </div>
            </div>

            <div className="clientes-detail-grid">
              {[
                ['DPI', clienteDetalle.noDpi],
                ['Fecha de nacimiento', clienteDetalle.fechaNacimiento],
                ['Correo', clienteDetalle.correo],
                ['Teléfono', clienteDetalle.telefono],
                ['Dirección', clienteDetalle.direccion],
              ].map(([etiqueta, valor]) => (
                <div className="clientes-detail-item" key={etiqueta}>
                  <span>{etiqueta}</span>
                  <strong>{valor || 'No disponible'}</strong>
                </div>
              ))}
            </div>

            <div className="clientes-modal-footer">
              <button className="clientes-secondary-button" onClick={() => setClienteDetalle(null)}>
                Cerrar
              </button>
              <button
                className="clientes-primary-button"
                onClick={() => {
                  const cliente = clienteDetalle
                  setClienteDetalle(null)
                  abrirEditar(cliente)
                }}
              >
                <Pencil size={16} /> Editar cliente
              </button>
            </div>
          </section>
        </div>
      )}

      {confirmacion && (
        <div className="clientes-modal-overlay">
          <section className="clientes-confirm-modal" role="alertdialog" aria-modal="true">
            <div className="clientes-confirm-icon">
              <Trash2 size={26} />
            </div>
            <h2>¿Eliminar cliente?</h2>
            <p>
              ¿Deseas eliminar a <strong>{confirmacion.nombre} {confirmacion.apellido}</strong>?
              Esta acción también puede eliminar sus solicitudes y tarjetas asociadas.
            </p>
            <div className="clientes-modal-footer">
              <button className="clientes-secondary-button" onClick={() => setConfirmacion(null)}>
                Cancelar
              </button>
              <button className="clientes-danger-button" onClick={eliminarCliente}>
                Sí, eliminar
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default Clientes