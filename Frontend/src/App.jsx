import { useEffect, useState } from 'react'
import {
  Home, Users, FileText, CreditCard, ShoppingCart,
  CircleDollarSign, ArrowRight, CalendarDays,
  Menu, X, Search, Bell, ChevronDown, Wallet,
  Clock, CheckCircle2, TrendingUp
} from 'lucide-react'

import Clientes from './pages/Clientes'
import Solicitudes from './pages/Solicitudes'
import Tarjetas from './pages/Tarjetas'
import Consumos from './pages/Consumos'
import { apiFetch } from './api'

const menuItems = [
  { label: 'Inicio', icon: Home },
  { label: 'Clientes', icon: Users },
  { label: 'Solicitudes', icon: FileText },
  { label: 'Tarjetas', icon: CreditCard },
  { label: 'Consumos', icon: ShoppingCart },
  { label: 'Pagos', icon: CircleDollarSign },
]

function App() {
  const [activePage, setActivePage] = useState('Inicio')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [resumen, setResumen] = useState({
  clientes: 0,
  solicitudesPendientes: 0,
  tarjetas: 0,
  saldoTotal: 0,
})

const [cargandoResumen, setCargandoResumen] = useState(true)
const [errorResumen, setErrorResumen] = useState('')


useEffect(() => {
  if (activePage !== 'Inicio') return

  async function cargarResumen() {
    setCargandoResumen(true)
    setErrorResumen('')

    try {
      const [
        respuestaClientes,
        respuestaSolicitudes,
        respuestaTarjetas,
      ] = await Promise.all([
        apiFetch('/api/clientes'),
        apiFetch('/api/solicitudes/estado/Pendiente'),
        apiFetch('/api/tarjetas'),
      ])

      if (
        !respuestaClientes.ok ||
        !respuestaSolicitudes.ok ||
        !respuestaTarjetas.ok
      ) {
        throw new Error('No fue posible cargar todos los indicadores.')
      }

      const [clientes, solicitudes, tarjetas] = await Promise.all([
        respuestaClientes.json(),
        respuestaSolicitudes.json(),
        respuestaTarjetas.json(),
      ])

      const saldoTotal = tarjetas.reduce(
        (total, tarjeta) =>
          total + Number(tarjeta.saldoActual ?? 0),
        0,
      )

      setResumen({
        clientes: clientes.length,
        solicitudesPendientes: solicitudes.length,
        tarjetas: tarjetas.length,
        saldoTotal,
      })
    } catch (error) {
      console.error('Error al cargar el resumen:', error)
      setErrorResumen('No fue posible cargar el resumen general.')
    } finally {
      setCargandoResumen(false)
    }
  }

  cargarResumen()
}, [activePage])


  const formatoMoneda = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
  minimumFractionDigits: 2,
})

const stats = [
  {
    title: 'Total de clientes',
    value: resumen.clientes,
    icon: Users,
    color: 'blue',
    link: 'Clientes',
  },
  {
    title: 'Solicitudes pendientes',
    value: resumen.solicitudesPendientes,
    icon: Clock,
    color: 'orange',
    link: 'Solicitudes',
  },
  {
    title: 'Tarjetas emitidas',
    value: resumen.tarjetas,
    icon: CreditCard,
    color: 'green',
    link: 'Tarjetas',
  },
  {
    title: 'Saldo total en tarjetas',
    value: formatoMoneda.format(resumen.saldoTotal),
    icon: Wallet,
    color: 'purple',
    link: 'Tarjetas',
  },
]

  return (
    <div className="app-layout">
      {sidebarOpen && (
        <button
          className="sidebar-overlay"
          aria-label="Cerrar menú"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">CHN</div>
          <div className="brand-caption">
            <strong>GestionTarjetas</strong>
            <span>Administración bancaria</span>
          </div>
          <button
            className="close-sidebar"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        <div className="menu-label">MENÚ PRINCIPAL</div>

        <nav className="sidebar-nav">
          {menuItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${
                activePage === label ? 'nav-item-active' : ''
              }`}
              onClick={() => {
                setActivePage(label)
                setSidebarOpen(false)
              }}
            >
              <Icon size={20} strokeWidth={1.8} />
              <span>{label}</span>
              {activePage === label && <span className="active-dot" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="footer-symbol">
            <CreditCard size={21} />
          </div>
          <div>
            <strong>GestionTarjetasCHN</strong>
            <span>Sistema de tarjetas de crédito</span>
          </div>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu size={22} />
            </button>
            <div className="breadcrumb">
              <span>CHN</span>
              <span className="breadcrumb-separator">/</span>
              <span>{activePage}</span>
            </div>
          </div>

          <div className="topbar-actions">
            <button className="icon-button" aria-label="Buscar">
              <Search size={20} />
            </button>
            <button className="icon-button notification-button" aria-label="Notificaciones">
              <Bell size={20} />
              <span />
            </button>
            <div className="user-profile">
              <div className="user-avatar">A</div>
              <div className="user-info">
                <strong>Administrador</strong>
                <span>Gestión del sistema</span>
              </div>
              <ChevronDown size={17} />
            </div>
          </div>
        </header>

        <main className="page-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">PANEL DE ADMINISTRACIÓN</div>
              <h1>{activePage === 'Inicio' ? 'Dashboard' : activePage}</h1>
              <p>
                {activePage === 'Inicio'
                  ? 'Bienvenido al sistema de gestión de tarjetas de crédito.'
                  : `Administra y consulta la información de ${activePage.toLowerCase()}.`}
              </p>
            </div>

            <div className="date-chip">
              <CalendarDays size={18} />
              <span>Panel general</span>
            </div>
          </div>

          {activePage === 'Clientes' ? (
            <Clientes />
          ) : activePage === 'Solicitudes' ? (
            <Solicitudes />
          ) : activePage === 'Tarjetas' ? (
              <Tarjetas />
          ) : activePage === 'Consumos' ? (
              <Consumos />
          ) : activePage === 'Inicio' ? (
            <>
              <div className="welcome-banner">
                <div>
                  <span className="welcome-label">SISTEMA BANCO CHN</span>
                  <h2>Gestiona tus operaciones con claridad.</h2>
                  <p>
                    Administra clientes, solicitudes y tarjetas de crédito desde un
                    solo lugar.
                  </p>
                </div>
                <div className="banner-icon">
                  <CreditCard size={57} strokeWidth={1.3} />
                </div>
              </div>

              <section className="section-block">
                <div className="section-heading">
                  <div>
                    <h2>Resumen general</h2>
                    <p>Indicadores principales del sistema</p>
                  </div>
                  <span className="live-label">
                    <span className="live-dot" />
                    Vista general
                  </span>
                </div>

                <div className="stats-grid">
                  {stats.map(({ title, value, icon: Icon, color, link }) => (
                    <button
                      className="stat-card"
                      key={title}
                      onClick={() => setActivePage(link)}
                    >
                      <div className="stat-top">
                        <div className={`stat-icon ${color}`}>
                          <Icon size={23} strokeWidth={1.8} />
                        </div>
                        <span className="stat-arrow">
                          <ArrowRight size={18} />
                        </span>
                      </div>
                      <span className="stat-title">{title}</span>
                      <strong className="stat-value">
                        {cargandoResumen ? 'Cargando...' : errorResumen ? '—' : value}
                      </strong>
                      <span className="stat-link">
                        Ver detalles <ArrowRight size={15} />
                      </span>
                    </button>
                  ))}
                </div>

                {errorResumen && (
                  <p role="alert" className="error-message">
                    {errorResumen}
                  </p>
                )}

              </section>            

              
            </>
          ) : (
            <section className="placeholder-panel">
              <div className="placeholder-icon">
                {activePage === 'Clientes' && <Users size={34} />}
                {activePage === 'Solicitudes' && <FileText size={34} />}
                {activePage === 'Tarjetas' && <CreditCard size={34} />}
                {activePage === 'Consumos' && <ShoppingCart size={34} />}
                {activePage === 'Pagos' && <CircleDollarSign size={34} />}
              </div>
              <h2>Módulo de {activePage.toLowerCase()}</h2>
              <p>
                El espacio de esta pantalla ya está preparado. En el siguiente
                paso implementaremos sus formularios, tablas y conexión con
                el backend.
              </p>
              <button
                className="primary-button"
                onClick={() => setActivePage('Inicio')}
              >
                Volver al inicio <ArrowRight size={17} />
              </button>
            </section>
          )}

          <footer className="page-footer">
            <span><strong>CHN</strong> · Gestión de Tarjetas de Crédito</span>
            <span>Sistema de administración</span>
          </footer>
        </main>
      </div>
    </div>
  )
}

export default App