import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'

const categoryColors = {
  input: {
    bg: 'linear-gradient(135deg, #fff 0%, #dededeff 100%)',
    border: '#fff',
    shadow: 'rgba(34, 197, 94, 0.3)'
  },
  process: {
    bg: 'linear-gradient(135deg, #fff 0%, #dededeff 100%)',
    border: '#fff',
    shadow: 'rgba(99, 102, 241, 0.3)'
  },
  output: {
    bg: 'linear-gradient(135deg, #fff 0%, #dededeff 100%)',
    border: '#fff',
    shadow: 'rgba(245, 158, 11, 0.3)'
  }
}

function PipelineNode({ data, selected }) {
  const colors = categoryColors[data.category] || categoryColors.process

  const nodeStyle = {
    background: colors.bg,
    border: `2px solid ${selected ? '#fff' : colors.border}`,
    borderRadius: '12px',
    padding: '12px 16px',
    minWidth: '180px',
    boxShadow: selected 
      ? `0 0 0 2px #fff, 0 10px 40px ${colors.shadow}`
      : `0 4px 20px ${colors.shadow}`,
    transition: 'all 0.2s ease'
  }

  const handleStyle = {
    width: '12px',
    height: '12px',
    background: '#fff',
    border: `2px solid ${colors.border}`,
  }

  return (
    <div style={nodeStyle}>
      {/* Input handle (top) */}
      {data.category !== 'input' && (
        <Handle
          type="target"
          position={Position.Top}
          style={handleStyle}
        />
      )}

      {/* Node content */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '24px' }}>{data.icon}</span>
        <div>
          <div style={{ 
            color: '#1d1d1dff', 
            fontWeight: 600, 
            fontSize: '14px',
            marginBottom: '2px'
          }}>
            {data.label}
          </div>
          <div style={{ 
            color: 'rgba(179, 179, 179, 0.7)', 
            fontSize: '11px' 
          }}>
            {data.description}
          </div>
        </div>
      </div>

      {/* Output handle (bottom) */}
      {data.category !== 'output' && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={handleStyle}
        />
      )}
    </div>
  )
}

export default memo(PipelineNode)