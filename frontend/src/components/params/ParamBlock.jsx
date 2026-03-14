import { useState } from 'react'

const containerStyle = {
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '10px',
  marginBottom: '24px',
  overflow: 'hidden',
}

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '14px 20px',
  cursor: 'pointer',
  userSelect: 'none',
}

const titleStyle = {
  fontSize: '16px',
  fontWeight: 600,
  color: '#e2e8f0',
}

const chevronStyle = (open) => ({
  color: '#64748b',
  fontSize: '12px',
  transition: 'transform 0.2s ease',
  transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
})

const bodyStyle = {
  padding: '0 20px 20px',
}

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
}

const thStyle = {
  textAlign: 'left',
  padding: '8px 12px',
  color: '#64748b',
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  borderBottom: '1px solid #334155',
}

const tdStyle = {
  padding: '8px 12px',
  fontSize: '13px',
  borderBottom: '1px solid #1a1a2e',
  verticalAlign: 'middle',
}

const inputStyle = {
  background: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '6px',
  color: '#e2e8f0',
  padding: '6px 10px',
  fontSize: '13px',
  fontFamily: 'monospace',
  width: '140px',
  outline: 'none',
}

const selectStyle = {
  ...inputStyle,
  width: '160px',
  cursor: 'pointer',
}

const descStyle = {
  color: '#94a3b8',
  fontSize: '12px',
  maxWidth: '320px',
}

function formatDefault(value) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'boolean') return value.toString()
  if (typeof value === 'number' && value !== 0 && (Math.abs(value) >= 1e3 || Math.abs(value) < 0.01)) {
    return value.toExponential(3)
  }
  return String(value)
}

function FieldInput({ field, value, onChange }) {
  if (field.options) {
    return (
      <select
        style={selectStyle}
        value={value ?? ''}
        onChange={(e) => onChange(field.name, e.target.value)}
      >
        {field.options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    )
  }

  if (field.type === 'bool') {
    return (
      <select
        style={selectStyle}
        value={value === true || value === 'true' ? 'true' : 'false'}
        onChange={(e) => onChange(field.name, e.target.value === 'true')}
      >
        <option value="true">True</option>
        <option value="false">False</option>
      </select>
    )
  }

  return (
    <input
      type="text"
      style={inputStyle}
      value={value ?? ''}
      placeholder={formatDefault(field.default)}
      onChange={(e) => onChange(field.name, e.target.value)}
    />
  )
}

export default function ParamBlock({ title, fields, values, onChange, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div style={containerStyle}>
      <div style={headerStyle} onClick={() => setOpen(!open)}>
        <span style={titleStyle}>{title}</span>
        <span style={chevronStyle(open)}>&#9660;</span>
      </div>

      {open && (
        <div style={bodyStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Parameter</th>
                <th style={thStyle}>Value</th>
                <th style={thStyle}>Default</th>
                <th style={thStyle}>Description</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((f) => (
                <tr key={f.name}>
                  <td style={{ ...tdStyle, color: '#e2e8f0', fontWeight: 500, fontFamily: 'monospace' }}>
                    {f.name}
                  </td>
                  <td style={tdStyle}>
                    <FieldInput
                      field={f}
                      value={values[f.name]}
                      onChange={onChange}
                    />
                  </td>
                  <td style={{ ...tdStyle, color: '#64748b', fontFamily: 'monospace', fontSize: '12px' }}>
                    {formatDefault(f.default)}
                  </td>
                  <td style={{ ...tdStyle, ...descStyle }}>
                    {f.desc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
