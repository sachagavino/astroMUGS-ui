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
import '@xyflow/react/dist/style.css'

// Example nodes representing astroMUGS pipeline steps
const initialNodes = [
  {
    id: 'load-data',
    type: 'input',
    position: { x: 100, y: 100 },
    data: { label: 'Load Simulation Data' }
  },
  {
    id: 'process',
    position: { x: 100, y: 200 },
    data: { label: 'Process Data' }
  },
  {
    id: 'visualize',
    type: 'output',
    position: { x: 100, y: 300 },
    data: { label: 'Visualize Results' }
  }
]

const initialEdges = [
  { id: 'e1', source: 'load-data', target: 'process' },
  { id: 'e2', source: 'process', target: 'visualize' }
]

export default function App() {
  const [nodes, setNodes] = useState(initialNodes)
  const [edges, setEdges] = useState(initialEdges)

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
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  )
}