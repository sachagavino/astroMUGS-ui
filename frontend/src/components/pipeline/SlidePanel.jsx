import ParamBlock from '../params/ParamBlock'
import { diskFields, envelopeFields, gridFields, wavelengthFields, mcmonoFields, controlFields, customDustFields, mrnDustFields } from '../params/paramDefs'
import { starFields } from '../params/paramDefs'

const panelConfig = {
  disk: {
    title: 'Disk Parameters',
    fields: diskFields,
    group: 'disk',
    paramKey: 'physical',
  },
  envelope: {
    title: 'Envelope Parameters',
    fields: envelopeFields,
    group: 'envelope',
    paramKey: 'physical',
  },
  star: {
    title: 'Star Parameters',
    fields: starFields,
    group: 'star',
    paramKey: 'thermal',
  },
  grid: {
    title: 'AMR Grid Parameters',
    fields: gridFields,
    group: 'grid',
    paramKey: 'grid',
  },
  wavelength: {
    title: 'Wavelength Grid Parameters',
    fields: wavelengthFields,
    group: 'wavelength',
    paramKey: 'wavelength',
  },
  mcmono: {
    title: 'Monochromatic Wavelength Grid Parameters',
    fields: mcmonoFields,
    group: 'mcmono',
    paramKey: 'mcmono',
  },
  control: {
    title: 'Control Parameters (RADMC-3D)',
    fields: controlFields,
    group: 'control',
    paramKey: 'control',
  },
  dust: {
    title: 'Dust Model Parameters',
    multi: true,
    sections: [
      { title: 'Custom dust distribution', fields: customDustFields, group: 'custom_dust' },
      { title: 'MRN-like distribution', fields: mrnDustFields, group: 'mrn_dust' },
    ],
  },
}

export default function SlidePanel({ kind, params, onChange, onClose }) {
  const config = panelConfig[kind]
  if (!config) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.3)',
          zIndex: 10,
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: '720px',
        maxWidth: '90%',
        background: '#1a1a2e',
        borderLeft: '1px solid #334155',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideIn 0.2s ease-out',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid #334155',
          flexShrink: 0,
        }}>
          <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '15px' }}>
            {config.title}
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px 8px',
              lineHeight: 1,
              fontFamily: 'inherit',
            }}
          >
            &#x2715;
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', padding: '20px' }}>
          {config.multi ? (
            config.sections.map((section) => (
              <ParamBlock
                key={section.group}
                title={section.title}
                fields={section.fields}
                values={params[section.group] || {}}
                onChange={(name, value) => onChange(section.group, name, value)}
                defaultOpen={true}
              />
            ))
          ) : (
            <ParamBlock
              title={config.title}
              fields={config.fields}
              values={params[config.group] || {}}
              onChange={(name, value) => onChange(config.group, name, value)}
              defaultOpen={true}
            />
          )}
        </div>
      </div>
    </>
  )
}
