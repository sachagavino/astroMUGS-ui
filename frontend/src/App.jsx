import { useState, useCallback, useRef } from 'react'
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
import TabBar from './components/tabs/TabBar'
import PipelineToolbar from './components/pipeline/PipelineToolbar'
import SlidePanel from './components/pipeline/SlidePanel'
import PhysicalModelTab from './components/tabs/PhysicalModelTab'
import ThermalParametersTab from './components/tabs/ThermalParametersTab'

const nodeTypes = {
  entry: EntryNode,
  master: MasterNode,
}

const entryLabels = {
  disk: 'disk model',
  envelope: 'envelope model',
  star: 'stars',
  grid: 'amr grid',
}

const initialNodes = [
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

export default function App() {
  const [activeTab, setActiveTab] = useState('pipeline')
  const [nodes, setNodes] = useState(initialNodes)
  const [edges, setEdges] = useState([])
  const entryCounter = useRef(0)

  // Slide panel state
  const [slidePanel, setSlidePanel] = useState(null)

  // Physical model state
  const [physicalParams, setPhysicalParams] = useState({
    disk: {},
    envelope: {},
  })

  // Grid parameters state
  const [gridParams, setGridParams] = useState({})

  const onGridParamChange = useCallback((_group, name, value) => {
    setGridParams((prev) => ({ ...prev, [name]: value }))
  }, [])

  // Thermal parameters state
  const [thermalParams, setThermalParams] = useState({
    star: {},
    wave: {},
    control: {},
  })

  // write_continuum checkbox flags
  const [wcFlags, setWcFlags] = useState({
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
  const [thermalPath, setThermalPath] = useState('')

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

  // Write button handler -- calls FastAPI backend
  const handleWrite = useCallback(async () => {
    if (!thermalPath) {
      alert('Please set the thermal path first.')
      return
    }

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
  }, [thermalPath, wcFlags, physicalParams, thermalParams, gridParams])

  // Spawn a new entry node
  const addEntryNode = useCallback((kind) => {
    entryCounter.current += 1
    const id = `entry-${kind}-${entryCounter.current}`
    const yOffset = 60 + (entryCounter.current - 1) * 70

    setNodes((nds) => [
      ...nds,
      {
        id,
        type: 'entry',
        position: { x: 80, y: yOffset },
        data: { label: entryLabels[kind] || kind, kind },
      },
    ])
  }, [])

  // Handle node click -- open slide panel for entry nodes
  const onNodeClick = useCallback((_event, node) => {
    if (node.type === 'entry' && node.data.kind) {
      setSlidePanel(node.data.kind)
    }
  }, [])

  // Keep master node data in sync with state
  const nodesWithFlags = nodes.map((n) => {
    if (n.id === 'write-continuum') {
      return {
        ...n,
        data: {
          ...n.data,
          flags: wcFlags,
          onToggle: toggleWcFlag,
          thermalPath,
          onThermalPathChange: setThermalPath,
          onWrite: handleWrite,
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
    physicalParams
  const slidePanelOnChange =
    slidePanel === 'star' ? onThermalParamChange :
    slidePanel === 'grid' ? onGridParamChange :
    onPhysicalParamChange

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1a2e', display: 'flex', flexDirection: 'column' }}>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activeTab === 'physical-model' && (
          <PhysicalModelTab
            params={physicalParams}
            onParamChange={onPhysicalParamChange}
          />
        )}
        {activeTab === 'thermal-parameters' && (
          <ThermalParametersTab
            params={thermalParams}
            onParamChange={onThermalParamChange}
          />
        )}
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
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                fitView
                defaultEdgeOptions={{
                  style: { stroke: '#6366f1', strokeWidth: 2 },
                  type: 'smoothstep',
                }}
              >
                <Background color="#334155" gap={20} />
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
    </div>
  )
}
