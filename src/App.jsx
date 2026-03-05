import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './lib/AuthContext'
import { LoginPage, RegisterPage, ForgotPinPage } from './components/auth/AuthPages'
import Dashboard from './pages/Dashboard'
import CreateOBPage from './pages/user/CreateOBPage'
import ManageUsersPage from './pages/admin/ManageUsersPage'
import { useRequests } from './hooks/useRequests'
import { useNotifications } from './hooks/useNotifications'
import { useUsers } from './hooks/useUsers'
import Topbar from './components/auth/layout/Topbar'
import Sidebar from './components/auth/layout/Sidebar'
import RequestsTable from './components/auth/layout/shared/modals/RequestsTable'

// ── Global styles ──────────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 100%; height: 100%; overflow: hidden; }
  body { font-family: 'DM Sans', sans-serif; background: #F0F2F5; color: #1A202C; }
  #root { width: 100%; height: 100%; display: flex; flex-direction: column; }
  @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
  @keyframes dropIn  { from { opacity: 0; transform: translateY(-6px) } to { opacity: 1; transform: translateY(0) } }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #CBD5E0; border-radius: 3px; }
  @media (max-width: 768px) {
    .app-main { padding: 12px !important; }
    .topbar-subtitle { display: none !important; }
    .auth-card-inner { padding: 24px !important; }
  }
`

const DEFAULT_PAGE = {
  user:       'dashboard',
  supervisor: 'dashboard',
  admin:      'dashboard',
  guard:      'approved-requests',
}

// ── Authenticated shell ────────────────────────────────────────
function AppShell() {
  const { currentUser, logout } = useAuth()
  const { requests, loading: reqLoading, approveRequest, declineRequest } = useRequests()
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
  const { users } = useUsers()

  // Restore last visited page from localStorage, fallback to role default
  const getInitialPage = () => {
    const saved = localStorage.getItem(`cpmc_page_${currentUser.id}`)
    if (saved) return saved
    return DEFAULT_PAGE[currentUser.role] || 'dashboard'
  }

  const [page, setPage] = useState(getInitialPage)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) setSidebarOpen(false)
      else setSidebarOpen(true)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Wrapper that saves page to localStorage on every navigation
  const navigate = (newPage) => {
    setPage(newPage)
    localStorage.setItem(`cpmc_page_${currentUser.id}`, newPage)
  }

  // Clear saved page on logout
  const handleLogout = () => {
    localStorage.removeItem(`cpmc_page_${currentUser.id}`)
    logout()
  }

  // ── Request filters ──
  const myRequests        = requests.filter(r => r.employee_id === currentUser.id)
  const supervisorPending = requests.filter(r => r.supervisor_id === currentUser.id && r.status === 'pending')
  const supervisorAll     = requests.filter(r => r.supervisor_id === currentUser.id)
  const adminPending      = requests.filter(r => r.status === 'pending')
  const approvedOnly      = requests.filter(r => r.status === 'approved')

  const dashRequests = {
    user:       myRequests,
    supervisor: supervisorAll,
    admin:      requests,
    guard:      approvedOnly,
  }[currentUser.role] || myRequests

  // ── Page renderer ──
  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return (
          <Dashboard
            requests={dashRequests}
            allUsers={users}
          />
        )

      case 'create-ob':
        return <CreateOBPage />

      case 'my-requests':
        return (
          <RequestsTable
            requests={myRequests}
            title="My Requests"
            subtitle="Track all your OB request submissions."
            loading={reqLoading}
            onApprove={approveRequest}
            onDecline={declineRequest}
          />
        )

      case 'approvals': {
        const toReview = currentUser.role === 'supervisor'
          ? supervisorPending
          : adminPending
        return (
          <RequestsTable
            requests={toReview}
            title="Pending Approvals"
            subtitle="Review and take action on OB requests."
            showEmployee
            loading={reqLoading}
            onApprove={approveRequest}
            onDecline={declineRequest}
          />
        )
      }

      case 'all-requests':
        return (
          <RequestsTable
            requests={requests}
            title="All Requests"
            subtitle="View and manage all OB requests across the system."
            showEmployee
            loading={reqLoading}
            onApprove={approveRequest}
            onDecline={declineRequest}
          />
        )

      case 'approved-requests':
        return (
          <RequestsTable
            requests={approvedOnly}
            title="Approved Requests"
            subtitle={
              currentUser.role === 'guard'
                ? 'Verified approved OB requests.'
                : 'All approved OB requests.'
            }
            showEmployee
            loading={reqLoading}
          />
        )

      case 'manage-users':
        return <ManageUsersPage />

      default:
        return (
          <Dashboard
            requests={dashRequests}
            allUsers={users}
          />
        )
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Topbar
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkRead={markRead}
        onMarkAllRead={markAllRead}
        onLogout={handleLogout}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar
          role={currentUser.role}
          currentPage={page}
          onNavigate={navigate}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          isMobile={isMobile}
        />
        <main className="app-main" style={{ flex: 1, overflowY: 'auto', padding: 24, background: '#F0F2F5' }}>
          {renderPage()}
        </main>
      </div>
    </div>
  )
}

// ── Auth gate ──────────────────────────────────────────────────
function AuthGate() {
  const { currentUser } = useAuth()
  const [authPage, setAuthPage] = useState('login')

  if (currentUser) return <AppShell />

  if (authPage === 'register') return <RegisterPage onBack={() => setAuthPage('login')} />
  if (authPage === 'forgot')   return <ForgotPinPage onBack={() => setAuthPage('login')} />
  return (
    <LoginPage
      onRegister={() => setAuthPage('register')}
      onForgot={() => setAuthPage('forgot')}
    />
  )
}

// ── Root ───────────────────────────────────────────────────────
export default function App() {
  return (
    <>
      <style>{globalStyles}</style>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </>
  )
}