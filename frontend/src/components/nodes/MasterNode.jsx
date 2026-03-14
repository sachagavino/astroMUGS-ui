import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'

const checkboxes = [
  { key: 'dens',    label: 'write dust_density.inp' },
  { key: 'grid',    label: 'write amr_grid.inp' },
  { key: 'opac',    label: 'write dustopac.inp' },
  { key: 'control', label: 'write radmc3d.inp' },
  { key: 'stars',   label: 'write stars.inp' },
  { key: 'wave',    label: 'write wavelength_micron.inp' },
  { key: 'mcmono',  label: 'write mcmono_wavelength_micron.inp' },
  { key: 'ext',     label: 'write external_source.inp' },
]

const inputEntries = [
  { id: 'input-disk',     label: 'disk model' },
  { id: 'input-envelope', label: 'envelope model' },
  { id: 'input-stars',    label: 'stars' },
  { id: 'input-grid',     label: 'amr grid' },
]

const handleStyle = {
  width: '10px',
  height: '10px',
  background: '#fff',
  border: '2px solid #6366f1',
}

const INPUT_ROW_HEIGHT = 24
const HEADER_HEIGHT = 38
const SECTION_LABEL_HEIGHT = 26
const THERMAL_SECTION_HEIGHT = 58
const INPUTS_TOP = HEADER_HEIGHT + THERMAL_SECTION_HEIGHT + SECTION_LABEL_HEIGHT

function MasterNode({ data, selected }) {
  const flags = data.flags || {}
  const onToggle = data.onToggle
  const thermalPath = data.thermalPath || ''
  const onThermalPathChange = data.onThermalPathChange

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      border: `2px solid ${selected ? '#6366f1' : '#334155'}`,
      borderRadius: '14px',
      padding: '0',
      minWidth: '320px',
      boxShadow: selected
        ? '0 0 0 2px #6366f1, 0 10px 40px rgba(99, 102, 241, 0.3)'
        : '0 6px 30px rgba(0, 0, 0, 0.4)',
      transition: 'all 0.2s ease',
      overflow: 'visible',
      position: 'relative',
    }}>
      {/* Header */}
      <div style={{
        background: '#6366f1',
        padding: '10px 18px',
        borderRadius: '12px 12px 0 0',
      }}>
        <div style={{
          color: '#fff',
          fontWeight: 700,
          fontSize: '14px',
        }}>
          {data.label}
        </div>
      </div>

      {/* Thermal path */}
      <div style={{ padding: '10px 18px 6px' }}>
        <div style={{ color: '#64748b', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
          Thermal path
        </div>
        <input
          type="text"
          value={thermalPath}
          onChange={(e) => onThermalPathChange(e.target.value)}
          placeholder="e.g. thermal/"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            background: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '6px',
            color: '#e2e8f0',
            padding: '5px 10px',
            fontSize: '12px',
            fontFamily: 'monospace',
            outline: 'none',
          }}
        />
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: '#334155', margin: '8px 18px' }} />

      {/* Input labels with aligned handles */}
      <div style={{ padding: '0 18px 4px' }}>
        <div style={{ color: '#64748b', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
          Inputs
        </div>
        {inputEntries.map((entry) => (
          <div
            key={entry.id}
            style={{
              color: '#94a3b8',
              fontSize: '11px',
              height: `${INPUT_ROW_HEIGHT}px`,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {entry.label}
          </div>
        ))}
      </div>

      {/* Positioned input handles -- aligned to each label row */}
      {inputEntries.map((entry, i) => (
        <Handle
          key={entry.id}
          type="target"
          position={Position.Left}
          id={entry.id}
          style={{
            ...handleStyle,
            top: `${INPUTS_TOP + i * INPUT_ROW_HEIGHT + INPUT_ROW_HEIGHT / 2}px`,
          }}
        />
      ))}

      {/* Divider */}
      <div style={{ height: '1px', background: '#334155', margin: '8px 18px' }} />

      {/* Checkboxes */}
      <div style={{ padding: '4px 18px 10px' }}>
        <div style={{ color: '#64748b', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
          Options
        </div>
        {checkboxes.map((cb) => (
          <label
            key={cb.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '3px 0',
              cursor: 'pointer',
              color: flags[cb.key] ? '#e2e8f0' : '#64748b',
              fontSize: '12px',
              transition: 'color 0.15s ease',
            }}
          >
            <input
              type="checkbox"
              checked={!!flags[cb.key]}
              onChange={() => onToggle(cb.key)}
              style={{
                accentColor: '#6366f1',
                width: '14px',
                height: '14px',
                cursor: 'pointer',
              }}
            />
            {cb.label}
          </label>
        ))}
      </div>

      {/* Write button */}
      <div style={{ padding: '6px 18px 14px' }}>
        <button
          onClick={data.onWrite}
          style={{
            width: '100%',
            padding: '10px 0',
            background: '#6366f1',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#4f46e5'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#6366f1'}
        >
          Write
        </button>
      </div>

      {/* Output handle (right side) */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: '12px',
          height: '12px',
          background: '#fff',
          border: '2px solid #6366f1',
        }}
      />
    </div>
  )
}

export default memo(MasterNode)
