import { memo, useState } from 'react'
import { Handle, Position } from '@xyflow/react'

const INPUT_COLOR = '#3b82f6'

const plotOptions = [
  { value: 'density2D', label: 'Dust density' },
  { value: '', label: 'Temperature (coming soon)', disabled: true },
  { value: '', label: 'SED (coming soon)', disabled: true },
]

function PlotNode({ id, data, selected }) {
  const [plotType, setPlotType] = useState(data.plotType || '')
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    if (!plotType) return
    setLoading(true)
    try {
      await data.onCreatePlot?.(id, plotType)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      border: `2px solid ${selected ? '#6366f1' : '#334155'}`,
      borderRadius: '10px',
      padding: '0',
      minWidth: '180px',
      boxShadow: selected
        ? '0 0 0 2px #6366f1, 0 4px 16px rgba(99, 102, 241, 0.25)'
        : '0 2px 10px rgba(0, 0, 0, 0.3)',
      transition: 'all 0.2s ease',
      overflow: 'visible',
    }}>
      {/* Header */}
      <div style={{
        background: '#10b981',
        padding: '8px 14px',
        borderRadius: '8px 8px 0 0',
      }}>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: '12px' }}>
          Plot
        </div>
      </div>

      {/* Input handle (left) */}
      <Handle
        type="target"
        position={Position.Left}
        id="input-data"
        style={{
          width: '10px',
          height: '10px',
          background: '#fff',
          border: `2px solid ${INPUT_COLOR}`,
        }}
      />

      {/* Body */}
      <div style={{ padding: '10px 14px 12px' }}>
        <select
          value={plotType}
          onChange={(e) => setPlotType(e.target.value)}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            background: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '6px',
            color: '#e2e8f0',
            padding: '5px 8px',
            fontSize: '11px',
            fontFamily: 'inherit',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="">Select plot...</option>
          {plotOptions.map((opt, i) => (
            <option key={i} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>

        {plotType && (
          <button
            onClick={handleCreate}
            disabled={loading}
            style={{
              width: '100%',
              marginTop: '8px',
              padding: '7px 0',
              background: loading ? '#334155' : '#10b981',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              fontWeight: 700,
              fontSize: '11px',
              cursor: loading ? 'default' : 'pointer',
              fontFamily: 'inherit',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#059669' }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#10b981' }}
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        )}
      </div>
    </div>
  )
}

export default memo(PlotNode)
