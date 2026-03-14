const buttonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 14px',
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '8px',
  color: '#e2e8f0',
  fontSize: '12px',
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'all 0.15s ease',
}

const plusStyle = {
  color: '#6366f1',
  fontWeight: 700,
  fontSize: '14px',
}

export default function PipelineToolbar({ onAdd }) {
  return (
    <div style={{
      display: 'flex',
      gap: '10px',
      padding: '10px 16px',
      background: '#0f0f23',
      borderBottom: '1px solid #334155',
    }}>
      <button style={buttonStyle} onClick={() => onAdd('disk')}>
        <span style={plusStyle}>+</span> Add disk model
      </button>
      <button style={buttonStyle} onClick={() => onAdd('envelope')}>
        <span style={plusStyle}>+</span> Add envelope model
      </button>
      <button style={buttonStyle} onClick={() => onAdd('star')}>
        <span style={plusStyle}>+</span> Add star model
      </button>
      <button style={buttonStyle} onClick={() => onAdd('grid')}>
        <span style={plusStyle}>+</span> Add amr grid
      </button>
    </div>
  )
}
