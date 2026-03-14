import ParamBlock from '../params/ParamBlock'
import { starFields, controlFields, waveFields } from '../params/paramDefs'

export default function ThermalParametersTab({ params, onParamChange }) {
  return (
    <div style={{
      padding: '32px',
      height: '100%',
      overflowY: 'auto',
    }}>
      <ParamBlock
        title="Star Parameters"
        fields={starFields}
        values={params.star}
        onChange={(name, value) => onParamChange('star', name, value)}
        defaultOpen={true}
      />
      <ParamBlock
        title="Wavelength Parameters"
        fields={waveFields}
        values={params.wave}
        onChange={(name, value) => onParamChange('wave', name, value)}
        defaultOpen={true}
      />
      <ParamBlock
        title="Control Parameters (RADMC-3D)"
        fields={controlFields}
        values={params.control}
        onChange={(name, value) => onParamChange('control', name, value)}
        defaultOpen={false}
      />
    </div>
  )
}
