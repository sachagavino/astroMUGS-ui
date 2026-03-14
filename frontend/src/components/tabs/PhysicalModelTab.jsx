import ParamBlock from '../params/ParamBlock'
import { diskFields, envelopeFields } from '../params/paramDefs'

export default function PhysicalModelTab({ params, onParamChange }) {
  return (
    <div style={{
      padding: '32px',
      height: '100%',
      overflowY: 'auto',
    }}>
      <ParamBlock
        title="Disk Parameters"
        fields={diskFields}
        values={params.disk}
        onChange={(name, value) => onParamChange('disk', name, value)}
        defaultOpen={true}
      />
      <ParamBlock
        title="Envelope Parameters"
        fields={envelopeFields}
        values={params.envelope}
        onChange={(name, value) => onParamChange('envelope', name, value)}
        defaultOpen={true}
      />
    </div>
  )
}
