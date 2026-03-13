const tabs = [
  { id: 'physical-model', label: 'Physical Model' },
  { id: 'thermal-parameters', label: 'Thermal Parameters' },
  { id: 'pipeline', label: 'Pipeline' },
]

export default function TabBar({ activeTab, onTabChange }) {
  return (
    <div style={{
      display: 'flex',
      background: '#0f0f23',
      borderBottom: '1px solid #334155',
      padding: '0 16px',
    }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            padding: '12px 24px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === tab.id ? '2px solid #6366f1' : '2px solid transparent',
            color: activeTab === tab.id ? '#e2e8f0' : '#64748b',
            fontWeight: activeTab === tab.id ? 600 : 400,
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: 'inherit',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
