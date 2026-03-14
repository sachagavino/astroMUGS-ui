import { useState, useCallback } from 'react'
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

import PipelineNode from './components/nodes/PipelineNode'
import TabBar from './components/tabs/TabBar'
import PhysicalModelTab from './components/tabs/PhysicalModelTab'
import ThermalParametersTab from './components/tabs/ThermalParametersTab'

const nodeTypes = {
  pipeline: PipelineNode,
}

const initialNodes = [
  {
    id: 'load-data',
    type: 'pipeline',
    position: { x: 100, y: 50 },
    data: {
      label: 'disk model',
      description: 'Load physical disk model to pipeline',
      icon: '',
      category: 'input'
    }
  },
  {
    id: 'process',
    type: 'pipeline',
    position: { x: 100, y: 180 },
    data: {
      label: 'Envelope model',
      description: 'Load physical envelope model to pipeline',
      icon: '',
      category: 'process'
    }
  },
  {
    id: 'visualize',
    type: 'pipeline',
    position: { x: 100, y: 310 },
    data: {
      label: 'Pipeline',
      description: 'run pipeline',
      icon: '',
      category: 'output'
    }
  }
]

const initialEdges = [
  { id: 'e1', source: 'load-data', target: 'process', animated: true },
  { id: 'e2', source: 'process', target: 'visualize' }
]

export default function App() {
  const [activeTab, setActiveTab] = useState('pipeline')
  const [nodes, setNodes] = useState(initialNodes)
  const [edges, setEdges] = useState(initialEdges)

  // Physical model state (disk + envelope)
  const [physicalParams, setPhysicalParams] = useState({
    disk: {},
    envelope: {},
  })

  // Thermal parameters state (star + wave + control)
  const [thermalParams, setThermalParams] = useState({
    star: {},
    wave: {},
    control: {},
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
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    []
  )

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1a2e', display: 'flex', flexDirection: 'column' }}>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
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
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            defaultEdgeOptions={{
              style: { stroke: '#6366f1', strokeWidth: 2 },
              type: 'smoothstep'
            }}
          >
            <Background color="#334155" gap={20} />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                switch (node.data?.category) {
                  case 'input': return '#fff'
                  case 'process': return '#fff'
                  case 'output': return '#fff'
                  default: return '#64748b'
                }
              }}
              maskColor="rgba(0, 0, 0, 0.8)"
            />
          </ReactFlow>
        )}
      </div>
    </div>
  )
}
