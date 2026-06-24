import { useState } from 'react'

const baseStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 14px',
  background: 'rgba(30, 41, 59, 0.7)',
  border: '1px solid #334155',
  borderRadius: '8px',
  color: '#e2e8f0',
  fontSize: '12px',
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'all 0.15s ease',
  width: '100%',
  textAlign: 'left',
}

const hoverStyle = {
  ...baseStyle,
  background: 'rgba(99, 102, 241, 0.25)',
  borderColor: '#6366f1',
}

const plusStyle = {
  color: '#6366f1',
  fontWeight: 700,
  fontSize: '14px',
}

function SectionLabel({ children }) {
  return (
    <div style={{ color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>
      {children}
    </div>
  )
}

function Divider() {
  return <hr style={{ border: 'none', borderTop: '1px solid #334155', margin: '6px 0' }} />
}

function NodeButton({ label, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      style={hovered ? hoverStyle : baseStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <span style={plusStyle}>+</span> {label}
    </button>
  )
}

export default function PipelineToolbar({ onAdd }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      padding: '12px',
      width: 180,
      flexShrink: 0,
      overflowY: 'auto',
      borderRight: '1px solid #334155',
      background: 'rgba(15, 15, 35, 0.5)',
    }}>
      <SectionLabel>Model nodes</SectionLabel>
      <NodeButton label="Disk model" onClick={() => onAdd('disk')} />
      <NodeButton label="Envelope model" onClick={() => onAdd('envelope')} />
      <NodeButton label="Star model" onClick={() => onAdd('star')} />
      <NodeButton label="AMR grid" onClick={() => onAdd('grid')} />
      <NodeButton label="Wavelength" onClick={() => onAdd('wavelength')} />
      <NodeButton label="Mcmono wavelength" onClick={() => onAdd('mcmono')} />
      <NodeButton label="Dust model" onClick={() => onAdd('dust')} />

      <Divider />
      <SectionLabel>Analysis nodes</SectionLabel>
      <NodeButton label="Plot" onClick={() => onAdd('plot')} />

      <Divider />
      <SectionLabel>Master nodes</SectionLabel>
      <NodeButton label="Write continuum" onClick={() => onAdd('write-continuum')} />
    </div>
  )
}
