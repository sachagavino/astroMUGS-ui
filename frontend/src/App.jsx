import { useState, useCallback, useRef, useEffect } from 'react'
import {
  ReactFlow,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Background,
  Controls,
  MiniMap
} from '@xyflow/react'
import '@xyflow/react/dist/base.css'
import './index.css'

import EntryNode from './components/nodes/EntryNode'
import MasterNode from './components/nodes/MasterNode'
import PlotNode from './components/nodes/PlotNode'
import TabBar from './components/tabs/TabBar'
import PipelineToolbar from './components/pipeline/PipelineToolbar'
import SlidePanel from './components/pipeline/SlidePanel'
import PlotModal from './components/pipeline/PlotModal'
import DarkVeil from './components/backgrounds/DarkVeil'

const nodeTypes = {
  entry: EntryNode,
  master: MasterNode,
  plot: PlotNode,
}

const entryLabels = {
  disk: 'disk model',
  envelope: 'envelope model',
  star: 'stars',
  grid: 'amr grid',
  wavelength: 'wavelength',
  mcmono: 'mcmono wavelength',
  dust: 'dust model',
}

const STORAGE_KEY = 'astromugs-ui-state'

const defaultNodes = [
  {
    id: 'write-continuum',
    type: 'master',
    position: { x: 400, y: 80 },
    deletable: false,
    data: {
      label: 'Write continuum',
      flags: {},
      onToggle: () => {},
    },
  },
]

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore corrupt data */ }
  return null
}

const saved = loadSaved()

export default function App() {
  const [activeTab, setActiveTab] = useState('pipeline')
  const [nodes, setNodes] = useState(saved?.nodes || defaultNodes)
  const [edges, setEdges] = useState(saved?.edges || [])
  const entryCounter = useRef(saved?.entryCounter || 0)

  // Slide panel state
  const [slidePanel, setSlidePanel] = useState(null)

  // Plot modal state
  const [plotImage, setPlotImage] = useState(null)
  const [plotSourceNodeId, setPlotSourceNodeId] = useState(null)

  // Physical model state
  const [physicalParams, setPhysicalParams] = useState(
    saved?.physicalParams || { disk: {}, envelope: {} }
  )

  // Grid parameters state
  const [gridParams, setGridParams] = useState(saved?.gridParams || {})

  const onGridParamChange = useCallback((_group, name, value) => {
    setGridParams((prev) => ({ ...prev, [name]: value }))
  }, [])

  // Wavelength grid parameters state
  const [wavelengthParams, setWavelengthParams] = useState(saved?.wavelengthParams || {})

  const onWavelengthParamChange = useCallback((_group, name, value) => {
    setWavelengthParams((prev) => ({ ...prev, [name]: value }))
  }, [])

  // Mcmono wavelength grid parameters state
  const [mcmonoParams, setMcmonoParams] = useState(saved?.mcmonoParams || {})

  const onMcmonoParamChange = useCallback((_group, name, value) => {
    setMcmonoParams((prev) => ({ ...prev, [name]: value }))
  }, [])

  // Thermal parameters state (star + control)
  const [thermalParams, setThermalParams] = useState(
    saved?.thermalParams || { star: {}, control: {} }
  )

  // Control parameters state
  const [controlParams, setControlParams] = useState(saved?.controlParams || {})

  // Dust model parameters state
  const [dustParams, setDustParams] = useState(
    saved?.dustParams || { custom_dust: {}, mrn_dust: {} }
  )

  const onControlParamChange = useCallback((_group, name, value) => {
    setControlParams((prev) => ({ ...prev, [name]: value }))
  }, [])

  const onDustParamChange = useCallback((group, name, value) => {
    setDustParams((prev) => ({
      ...prev,
      [group]: { ...prev[group], [name]: value },
    }))
  }, [])

  // write_continuum checkbox flags
  const [wcFlags, setWcFlags] = useState(saved?.wcFlags || {
    dens: false,
    grid: false,
    opac: false,
    control: false,
    stars: false,
    wave: false,
    mcmono: false,
    ext: false,
  })

  const toggleWcFlag = useCallback((key) => {
    setWcFlags((prev) => ({ ...prev, [key]: !prev[key] }))
  }, [])

  // Thermal path for write_continuum
  const [thermalPath, setThermalPath] = useState(saved?.thermalPath || '')

  // Persist state to localStorage on every change
  useEffect(() => {
    const state = {
      nodes, edges,
      entryCounter: entryCounter.current,
      physicalParams, gridParams, wavelengthParams, mcmonoParams,
      thermalParams, controlParams, dustParams,
      wcFlags, thermalPath,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [nodes, edges, physicalParams, gridParams, wavelengthParams, mcmonoParams, thermalParams, controlParams, dustParams, wcFlags, thermalPath])

  // Convert string values from inputs to proper numeric types
  const coerceParams = (obj) => {
    const result = {}
    for (const [key, val] of Object.entries(obj)) {
      if (val === '' || val === undefined || val === null) continue
      if (typeof val === 'string') {
        if (val === 'true') { result[key] = true; continue }
        if (val === 'false') { result[key] = false; continue }
        const num = Number(val)
        result[key] = isNaN(num) ? val : num
      } else {
        result[key] = val
      }
    }
    return result
  }

  // Open control settings panel
  const handleOpenControl = useCallback(() => {
    setSlidePanel('control')
  }, [])

  // Resolve the path for a plot node by following its incoming edge
  const resolvePlotPath = useCallback((plotNodeId) => {
    // Find the edge going into this plot node
    const incomingEdge = edges.find((e) => e.target === plotNodeId)
    if (!incomingEdge) return null

    const sourceNode = nodes.find((n) => n.id === incomingEdge.source)
    if (!sourceNode) return null

    // If connected to a master node, use its thermal path
    if (sourceNode.type === 'master') {
      return thermalPath || null
    }

    return null
  }, [edges, nodes, thermalPath])

  // Create plot handler — nodeId is the plot node requesting the plot
  const handleCreatePlot = useCallback(async (plotNodeId, plotType, vmin = 1e-30, vmax = 1e-15) => {
    const path = resolvePlotPath(plotNodeId)
    if (!path) {
      alert('Connect the Plot node to a source node (e.g. Write continuum) first.')
      return
    }
    // Store the plot node id so the modal can re-request with new vmin/vmax
    setPlotSourceNodeId(plotNodeId)
    try {
      const res = await fetch('http://localhost:8000/api/plot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plot_type: plotType,
          path,
          vmin,
          vmax,
        }),
      })
      const data = await res.json()
      if (data.status === 'ok') {
        setPlotImage(data.image)
      } else {
        alert('Plot error: ' + data.message)
        console.error(data.traceback)
      }
    } catch (err) {
      alert('Could not reach backend: ' + err.message)
    }
  }, [resolvePlotPath])

  // Write button handler -- calls FastAPI backend
  const handleWrite = useCallback(async () => {
    if (!thermalPath) {
      alert('Please set the thermal path first.')
      return
    }

    // Find dust type from dust entry nodes
    const dustNode = nodes.find((n) => n.data.kind === 'dust')
    const dustType = dustNode?.data.dustType || null

    try {
      const res = await fetch('http://localhost:8000/api/write-continuum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thermal_path: thermalPath,
          flags: wcFlags,
          disk: coerceParams(physicalParams.disk),
          envelope: coerceParams(physicalParams.envelope),
          star: coerceParams(thermalParams.star),
          grid: coerceParams(gridParams),
          wavelength: coerceParams(wavelengthParams),
          mcmono_wave: coerceParams(mcmonoParams),
          control: coerceParams(controlParams),
          dust: {
            dust_type: dustType,
            custom_dust: coerceParams(dustParams.custom_dust),
            mrn_dust: coerceParams(dustParams.mrn_dust),
          },
        }),
      })
      const data = await res.json()
      if (data.status === 'ok') {
        alert(data.message)
      } else {
        alert('Error: ' + data.message)
        console.error(data.traceback)
      }
    } catch (err) {
      alert('Could not reach backend: ' + err.message)
    }
  }, [thermalPath, wcFlags, physicalParams, thermalParams, gridParams, wavelengthParams, mcmonoParams, controlParams, nodes, dustParams])

  // Spawn a new entry node
  const addEntryNode = useCallback((kind) => {
    entryCounter.current += 1
    const id = `entry-${kind}-${entryCounter.current}`
    // Place new nodes in the visible center area with slight random offset to avoid stacking
    const baseX = kind === 'plot' ? 700 : 80
    const yOffset = 100 + Math.random() * 200

    if (kind === 'write-continuum') {
      setNodes((nds) => [
        ...nds,
        {
          id: `write-continuum-${entryCounter.current}`,
          type: 'master',
          position: { x: 400, y: yOffset },
          data: {
            label: 'Write continuum',
            flags: {},
            onToggle: () => {},
          },
        },
      ])
      return
    }

    if (kind === 'plot') {
      setNodes((nds) => [
        ...nds,
        {
          id,
          type: 'plot',
          position: { x: baseX, y: yOffset },
          data: { label: 'Plot', kind: 'plot' },
        },
      ])
      return
    }

    const nodeData = { label: entryLabels[kind] || kind, kind }
    if (kind === 'dust') {
      nodeData.dustType = null
    }

    setNodes((nds) => [
      ...nds,
      {
        id,
        type: 'entry',
        position: { x: baseX, y: yOffset },
        data: nodeData,
      },
    ])
  }, [])

  // Handle node double-click -- open slide panel for entry nodes
  const onNodeDoubleClick = useCallback((_event, node) => {
    if (node.type === 'entry' && node.data.kind) {
      setSlidePanel(node.data.kind)
    }
  }, [])

  // Keep master node data in sync with state
  const nodesWithFlags = nodes.map((n) => {
    if (n.type === 'master') {
      return {
        ...n,
        data: {
          ...n.data,
          flags: wcFlags,
          onToggle: toggleWcFlag,
          thermalPath,
          onThermalPathChange: setThermalPath,
          onWrite: handleWrite,
          onOpenControl: handleOpenControl,
        },
      }
    }
    if (n.data.kind === 'dust') {
      return {
        ...n,
        data: {
          ...n.data,
          onDustTypeChange: (type) => {
            setNodes((nds) => nds.map((node) =>
              node.id === n.id
                ? { ...node, data: { ...node.data, dustType: type } }
                : node
            ))
          },
        },
      }
    }
    if (n.type === 'plot') {
      return {
        ...n,
        data: {
          ...n.data,
          onCreatePlot: handleCreatePlot,
        },
      }
    }
    return n
  })

  const onPhysicalParamChange = useCallback((group, name, value) => {
    setPhysicalParams((prev) => ({
      ...prev,
      [group]: { ...prev[group], [name]: value },
    }))
  }, [])

  const onThermalParamChange = useCallback((group, name, value) => {
    setThermalParams((prev) => ({
      ...prev,
      [group]: { ...prev[group], [name]: value },
    }))
  }, [])

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  )

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  )

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge({ ...connection, animated: true }, eds)),
    []
  )

  // Choose which params to pass to slide panel
  const slidePanelParams =
    slidePanel === 'star' ? thermalParams :
    slidePanel === 'grid' ? { grid: gridParams } :
    slidePanel === 'wavelength' ? { wavelength: wavelengthParams } :
    slidePanel === 'mcmono' ? { mcmono: mcmonoParams } :
    slidePanel === 'control' ? { control: controlParams } :
    slidePanel === 'dust' ? dustParams :
    physicalParams
  const slidePanelOnChange =
    slidePanel === 'star' ? onThermalParamChange :
    slidePanel === 'grid' ? onGridParamChange :
    slidePanel === 'wavelength' ? onWavelengthParamChange :
    slidePanel === 'mcmono' ? onMcmonoParamChange :
    slidePanel === 'control' ? onControlParamChange :
    slidePanel === 'dust' ? onDustParamChange :
    onPhysicalParamChange

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1a2e', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Animated background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <DarkVeil speed={0.3} 
                  hueShift={50} 
                  noiseIntensity={0.1}
                  resolutionScale={1.}
                  scanlineFrequency={0.5}
                  scanlineIntensity={0}

        />
      </div>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* App header with logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', flexShrink: 0 }}>
        <img src="/logo-dark.png" alt="astroMUGS" style={{ height: 52 }} />
        <span style={{ color: '#e2e8f0', fontSize: 30, fontWeight: 700, letterSpacing: 1 }}>
          astroMUGS
        </span>
      </div>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {activeTab === 'pipeline' && (
          <>
            <PipelineToolbar onAdd={addEntryNode} />
            <div style={{ flex: 1, position: 'relative' }}>
              <ReactFlow
                nodes={nodesWithFlags}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeDoubleClick={onNodeDoubleClick}
                nodeTypes={nodeTypes}
                fitView
                defaultEdgeOptions={{
                  style: { stroke: '#6366f1', strokeWidth: 2 },
                  type: 'smoothstep',
                }}
              >
                <Background color="rgba(51,65,85,0.3)" gap={20} />
                <Controls />
                <MiniMap
                  nodeColor={() => '#6366f1'}
                  maskColor="rgba(0, 0, 0, 0.8)"
                />
              </ReactFlow>

              {/* Slide panel overlay */}
              {slidePanel && (
                <SlidePanel
                  kind={slidePanel}
                  params={slidePanelParams}
                  onChange={slidePanelOnChange}
                  onClose={() => setSlidePanel(null)}
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* Plot modal */}
      {plotImage && (
        <PlotModal
          imageSrc={plotImage}
          onClose={() => { setPlotImage(null); setPlotSourceNodeId(null) }}
          onRefresh={async (vmin, vmax) => {
            if (plotSourceNodeId) {
              await handleCreatePlot(plotSourceNodeId, 'density2D', vmin, vmax)
            }
          }}
        />
      )}
      </div>
    </div>
  )
}
