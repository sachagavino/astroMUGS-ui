import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'

const INPUT_COLOR = '#3b82f6'   // blue
const OUTPUT_COLOR = '#eab308'  // yellow

const dustToggleBtn = (active) => ({
  padding: '4px 10px',
  fontSize: '10px',
  fontWeight: 600,
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'all 0.15s ease',
  background: active ? '#6366f1' : '#e2e8f0',
  color: active ? '#fff' : '#64748b',
})

function EntryNode({ data, selected }) {
  const hasInput = data.kind === 'disk'
  const isDust = data.kind === 'dust'

  return (
    <div style={{
      background: 'linear-gradient(135deg, #fff 0%, #ededed 100%)',
      border: `2px solid ${selected ? '#6366f1' : '#d1d5db'}`,
      borderRadius: '10px',
      padding: '8px 14px',
      minWidth: isDust ? '170px' : '130px',
      boxShadow: selected
        ? '0 0 0 2px #6366f1, 0 4px 16px rgba(99, 102, 241, 0.25)'
        : '0 2px 10px rgba(0, 0, 0, 0.15)',
      transition: 'all 0.2s ease',
    }}>
      {/* Input handle (left) -- only for disk model */}
      {hasInput && (
        <Handle
          type="target"
          position={Position.Left}
          id="input-dust"
          style={{
            width: '10px',
            height: '10px',
            background: '#fff',
            border: `2px solid ${INPUT_COLOR}`,
          }}
        />
      )}

      <div style={{
        color: '#1d1d1d',
        fontWeight: 600,
        fontSize: '12px',
        textAlign: 'center',
      }}>
        {data.label}
      </div>

      {/* Dust type toggle */}
      {isDust && (
        <div style={{ display: 'flex', gap: '4px', marginTop: '6px', justifyContent: 'center' }}>
          <button
            style={dustToggleBtn(data.dustType === 'custom')}
            onClick={(e) => { e.stopPropagation(); data.onDustTypeChange?.('custom') }}
          >
            Custom
          </button>
          <button
            style={dustToggleBtn(data.dustType === 'mrn')}
            onClick={(e) => { e.stopPropagation(); data.onDustTypeChange?.('mrn') }}
          >
            MRN
          </button>
        </div>
      )}

      {/* Output handle (right) */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: '10px',
          height: '10px',
          background: '#fff',
          border: `2px solid ${OUTPUT_COLOR}`,
        }}
      />
    </div>
  )
}

export default memo(EntryNode)
