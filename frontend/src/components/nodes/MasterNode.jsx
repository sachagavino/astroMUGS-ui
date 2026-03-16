import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'

const INPUT_COLOR = '#3b82f6'   // blue
const OUTPUT_COLOR = '#eab308'  // yellow

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
  { id: 'input-disk',       label: 'disk model' },
  { id: 'input-envelope',   label: 'envelope model' },
  { id: 'input-stars',      label: 'stars' },
  { id: 'input-grid',       label: 'amr grid' },
  { id: 'input-wavelength', label: 'wavelength' },
  { id: 'input-mcmono',     label: 'mcmono wavelength' },
]

const outputEntries = [
  { id: 'output-1', label: 'output 1' },
  { id: 'output-2', label: 'output 2' },
  { id: 'output-3', label: 'output 3' },
]

const inputHandleStyle = {
  width: '10px',
  height: '10px',
  background: '#fff',
  border: `2px solid ${INPUT_COLOR}`,
}

const outputHandleStyle = {
  width: '10px',
  height: '10px',
  background: '#fff',
  border: `2px solid ${OUTPUT_COLOR}`,
}

const ROW_HEIGHT = 24
const HEADER_HEIGHT = 38
const THERMAL_SECTION_HEIGHT = 58
const CONTROL_BUTTON_HEIGHT = 42
const DIVIDER_HEIGHT = 17
const SECTION_LABEL_HEIGHT = 26
const INPUTS_TOP = HEADER_HEIGHT + THERMAL_SECTION_HEIGHT + DIVIDER_HEIGHT + CONTROL_BUTTON_HEIGHT + DIVIDER_HEIGHT + SECTION_LABEL_HEIGHT

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
      minWidth: '380px',
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

      {/* Control settings button */}
      <div style={{ padding: '4px 18px 4px' }}>
        <button
          onClick={data.onOpenControl}
          style={{
            width: '100%',
            padding: '8px 0',
            background: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '6px',
            color: '#94a3b8',
            fontWeight: 500,
            fontSize: '12px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#e2e8f0' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.color = '#94a3b8' }}
        >
          Control settings
        </button>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: '#334155', margin: '8px 18px' }} />

      {/* INPUTS and OUTPUTS labels side by side */}
      <div style={{ padding: '0 18px 4px', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ color: '#64748b', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
          Inputs
        </div>
        <div style={{ color: '#64748b', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
          Outputs
        </div>
      </div>

      {/* Input and output label rows */}
      <div style={{ padding: '0 18px 4px', display: 'flex', justifyContent: 'space-between' }}>
        {/* Left column: input labels */}
        <div>
          {inputEntries.map((entry) => (
            <div
              key={entry.id}
              style={{
                color: '#94a3b8',
                fontSize: '11px',
                height: `${ROW_HEIGHT}px`,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {entry.label}
            </div>
          ))}
        </div>
        {/* Right column: output labels */}
        <div>
          {outputEntries.map((entry) => (
            <div
              key={entry.id}
              style={{
                color: '#94a3b8',
                fontSize: '11px',
                height: `${ROW_HEIGHT}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              {entry.label}
            </div>
          ))}
        </div>
      </div>

      {/* Positioned input handles (left, blue) */}
      {inputEntries.map((entry, i) => (
        <Handle
          key={entry.id}
          type="target"
          position={Position.Left}
          id={entry.id}
          style={{
            ...inputHandleStyle,
            top: `${INPUTS_TOP + i * ROW_HEIGHT + ROW_HEIGHT / 2}px`,
          }}
        />
      ))}

      {/* Positioned output handles (right, yellow) */}
      {outputEntries.map((entry, i) => (
        <Handle
          key={entry.id}
          type="source"
          position={Position.Right}
          id={entry.id}
          style={{
            ...outputHandleStyle,
            top: `${INPUTS_TOP + i * ROW_HEIGHT + ROW_HEIGHT / 2}px`,
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
    </div>
  )
}

export default memo(MasterNode)
