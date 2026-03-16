import { useState } from 'react'

export default function PlotModal({ imageSrc, onClose, onRefresh }) {
  const [vmin, setVmin] = useState(-30)
  const [vmax, setVmax] = useState(-15)
  const [loading, setLoading] = useState(false)

  const handleRefresh = async () => {
    setLoading(true)
    try {
      await onRefresh?.(Math.pow(10, vmin), Math.pow(10, vmax))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          zIndex: 100,
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: '#1a1a2e',
        border: '1px solid #334155',
        borderRadius: '14px',
        zIndex: 101,
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '90vw',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid #334155',
          flexShrink: 0,
        }}>
          <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '15px' }}>
            Dust Density Plot
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

        {/* Controls */}
        <div style={{
          display: 'flex',
          gap: '24px',
          alignItems: 'center',
          padding: '12px 20px',
          borderBottom: '1px solid #334155',
          flexShrink: 0,
        }}>
          <label style={{ color: '#94a3b8', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            log(vmin):
            <input
              type="range"
              min={-50}
              max={0}
              step={1}
              value={vmin}
              onChange={(e) => setVmin(Number(e.target.value))}
              style={{ width: '120px', accentColor: '#6366f1' }}
            />
            <span style={{ color: '#e2e8f0', fontFamily: 'monospace', fontSize: '11px', minWidth: '30px' }}>
              {vmin}
            </span>
          </label>
          <label style={{ color: '#94a3b8', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            log(vmax):
            <input
              type="range"
              min={-50}
              max={0}
              step={1}
              value={vmax}
              onChange={(e) => setVmax(Number(e.target.value))}
              style={{ width: '120px', accentColor: '#6366f1' }}
            />
            <span style={{ color: '#e2e8f0', fontFamily: 'monospace', fontSize: '11px', minWidth: '30px' }}>
              {vmax}
            </span>
          </label>
          <button
            onClick={handleRefresh}
            disabled={loading}
            style={{
              padding: '6px 16px',
              background: loading ? '#334155' : '#6366f1',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              fontWeight: 600,
              fontSize: '12px',
              cursor: loading ? 'default' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {loading ? 'Updating...' : 'Update'}
          </button>
        </div>

        {/* Image */}
        <div style={{ flex: 1, overflow: 'auto', padding: '16px', display: 'flex', justifyContent: 'center' }}>
          {imageSrc ? (
            <img
              src={imageSrc}
              alt="Density plot"
              style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
            />
          ) : (
            <div style={{ color: '#64748b', padding: '40px', fontSize: '14px' }}>
              Loading plot...
            </div>
          )}
        </div>
      </div>
    </>
  )
}
