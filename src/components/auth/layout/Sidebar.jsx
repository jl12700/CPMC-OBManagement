import Icon from './shared/modals/Icon'

const NAV_CONFIG = {
  user: [
    { id: 'dashboard',    label: 'Dashboard',       icon: 'dashboard' },
    { id: 'create-ob',    label: 'Create OB Request', icon: 'plus'    },
    { id: 'my-requests',  label: 'My Requests',      icon: 'list'     },
  ],
  supervisor: [
    { id: 'dashboard',        label: 'Dashboard',       icon: 'dashboard' },
    { id: 'approvals',        label: 'Pending Approvals', icon: 'approval' },
    { id: 'approved-requests',label: 'View Approved',   icon: 'check'    },
    { id: 'create-ob',    label: 'Create OB Request', icon: 'plus'    },
  { id: 'my-requests',  label: 'My Requests',      icon: 'list'     },
  ],
admin: [
  { id: 'dashboard',    label: 'Dashboard',       icon: 'dashboard' },
  { id: 'approvals',    label: 'Approvals',        icon: 'approval' },
  { id: 'all-requests', label: 'All Requests',     icon: 'list'     },
  { id: 'create-ob',    label: 'Create OB Request', icon: 'plus'    },
  { id: 'my-requests',  label: 'My Requests',      icon: 'list'     },
  { id: 'manage-users', label: 'Manage Users',     icon: 'users'    },
],
  guard: [
    { id: 'approved-requests', label: 'Approved Requests', icon: 'shield' },
  ],
}

export default function Sidebar({ role, currentPage, onNavigate, isOpen, setIsOpen, isMobile }) {
  const items = NAV_CONFIG[role] || NAV_CONFIG.user

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobile && isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 900,
            opacity: isOpen ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}

      {/* Main Drawer Shell */}
      <aside style={{
        position: isMobile ? 'fixed' : 'relative',
        top: isMobile ? 60 : 0,
        left: 0,
        height: isMobile ? 'calc(100vh - 60px)' : '100%',
        width: isMobile ? 260 : (isOpen ? 260 : 0),
        background: '#0F1C2E',
        zIndex: isMobile ? 950 : 10,
        transform: isMobile ? (isOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
        transition: isMobile
          ? 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          : 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isMobile && isOpen ? '4px 0 24px rgba(0,0,0,0.3)' : 'none',
        display: 'flex', flexDirection: 'column',
        overflow: isMobile ? 'visible' : 'hidden',
        flexShrink: 0
      }}>
        {/* Navigation List */}
        <div style={{ padding: '20px 14px', flex: 1, overflowY: 'auto', overflowX: 'hidden', width: 260 }}>
          <div style={{ color: 'rgba(139,163,193,0.45)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 10px', marginBottom: 10 }}>
            Navigation
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {items.map((item) => {
              const active = currentPage === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id)
                    if (isMobile) setIsOpen(false)
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '11px 12px',
                    borderRadius: 8,
                    color: active ? 'white' : '#8BA3C1',
                    background: active ? '#1E56A0' : 'transparent',
                    fontSize: 14, fontWeight: active ? 600 : 500,
                    cursor: 'pointer',
                    border: 'none', width: '100%', textAlign: 'left',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => { 
                    if (!active) {
                      e.currentTarget.style.background = '#1A2D45';
                      e.currentTarget.style.color = 'white';
                    }
                  }}
                  onMouseLeave={(e) => { 
                    if (!active) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#8BA3C1';
                    }
                  }}
                >
                  <Icon name={item.icon} size={18} />
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>
      </aside>
    </>
  )
}
