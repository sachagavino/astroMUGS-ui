import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'

function EntryNode({ data, selected }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #fff 0%, #ededed 100%)',
      border: `2px solid ${selected ? '#6366f1' : '#d1d5db'}`,
      borderRadius: '10px',
      padding: '8px 14px',
      minWidth: '130px',
      boxShadow: selected
        ? '0 0 0 2px #6366f1, 0 4px 16px rgba(99, 102, 241, 0.25)'
        : '0 2px 10px rgba(0, 0, 0, 0.15)',
      transition: 'all 0.2s ease',
    }}>
      <div style={{
        color: '#1d1d1d',
        fontWeight: 600,
        fontSize: '12px',
        textAlign: 'center',
      }}>
        {data.label}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: '10px',
          height: '10px',
          background: '#fff',
          border: '2px solid #6366f1',
        }}
      />
    </div>
  )
}

export default memo(EntryNode)
