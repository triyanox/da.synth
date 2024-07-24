import { EffectPlugin } from '@/types';
import { nanoid } from 'nanoid';
import { KnobControl } from '../knob';

export async function loadDimensionExpanderWorklet(audioContext: AudioContext) {
  const src = /* javascript */ `
  class DimensionExpanderProcessor extends AudioWorkletProcessor {
    constructor() {
      super();
      this.delayLines = [
        new DelayLine(sampleRate * 0.5),
        new DelayLine(sampleRate * 0.5)
      ];
      this.filters = [
        new ResonantFilter(),
        new ResonantFilter()
      ];
      this.lfoPhase = 0;
    }

    static get parameterDescriptors() {
      return [
        {
          name: 'width',
          defaultValue: 0.5,
          minValue: 0,
          maxValue: 1
        },
        {
          name: 'depth',
          defaultValue: 0.5,
          minValue: 0,
          maxValue: 1
        },
        {
          name: 'resonance',
          defaultValue: 0.5,
          minValue: 0,
          maxValue: 0.99
        },
        {
          name: 'modSpeed',
          defaultValue: 0.1,
          minValue: 0.01,
          maxValue: 5
        },
        {
          name: 'dryWet',
          defaultValue: 0.5,
          minValue: 0,
          maxValue: 1
        }
      ];
    }

    process(inputs, outputs, parameters) {
      const input = inputs[0];
      const output = outputs[0];

      const width = parameters.width[0];
      const depth = parameters.depth[0];
      const resonance = parameters.resonance[0];
      const modSpeed = parameters.modSpeed[0];
      const dryWet = parameters.dryWet[0];

      if (!input || input.length === 0 || input[0].length === 0) {
        return true;
      }

      for (let i = 0; i < input[0].length; i++) {
        const lfo = Math.sin(this.lfoPhase);
        this.lfoPhase += 2 * Math.PI * modSpeed / sampleRate;
        if (this.lfoPhase >= 2 * Math.PI) this.lfoPhase -= 2 * Math.PI;

        for (let channel = 0; channel < input.length; channel++) {
          const inputSample = input[channel][i];

          const delayTime = 0.02 + 0.03 * depth * (1 + lfo);
          const delaySample = this.delayLines[channel].read(delayTime);
          this.delayLines[channel].write(inputSample);

          const filterFreq = 200 + 2000 * (0.5 + 0.5 * lfo);
          const filteredSample = this.filters[channel].process(delaySample, filterFreq, resonance);

          const wetAmount = dryWet * (0.5 + 0.25 * lfo);
          output[channel][i] = inputSample * (1 - wetAmount) + filteredSample * wetAmount;
        }

        if (output.length >= 2) {
          const mid = (output[0][i] + output[1][i]) * 0.5;
          const side = (output[0][i] - output[1][i]) * 0.5;
          const widenedSide = side * (1 + width * 0.5);
          output[0][i] = mid + widenedSide;
          output[1][i] = mid - widenedSide;
        }
      }

      return true;
    }
  }

  class DelayLine {
    constructor(maxDelay) {
      this.buffer = new Float32Array(maxDelay);
      this.writeIndex = 0;
    }

    write(sample) {
      this.buffer[this.writeIndex] = sample;
      this.writeIndex = (this.writeIndex + 1) % this.buffer.length;
    }

    read(delaySec) {
      const delaySamples = delaySec * sampleRate;
      const readIndex = (this.writeIndex - delaySamples + this.buffer.length) % this.buffer.length;
      const intIndex = Math.floor(readIndex);
      const fraction = readIndex - intIndex;
      const s1 = this.buffer[intIndex];
      const s2 = this.buffer[(intIndex + 1) % this.buffer.length];
      return s1 + fraction * (s2 - s1);
    }
  }

  class ResonantFilter {
    constructor() {
      this.y1 = 0;
      this.y2 = 0;
    }

    process(input, frequency, resonance) {
      const f = 2 * Math.sin(Math.PI * frequency / sampleRate);
      const q = resonance * 0.8; 
      const input_scaled = input * (1 + q);
      const y0 = input_scaled - this.y2 * q;
      const y1 = this.y1 * f + y0;
      const y2 = this.y2 * f + y1;
      this.y1 = y1;
      this.y2 = y2;
      return y2 * 0.5; 
    }
  }

  registerProcessor('dimension-expander-processor', DimensionExpanderProcessor);
`;

  await audioContext.audioWorklet.addModule(
    URL.createObjectURL(new Blob([src], { type: 'application/javascript' })),
  );
}

const dimensionExpanderPlugin: EffectPlugin<
  AudioWorkletNode,
  {
    width: number;
    depth: number;
    resonance: number;
    modSpeed: number;
    dryWet: number;
  }
> = {
  id: nanoid(),
  name: 'Dimension Expander (*)',
  createNode: (audioContext) => {
    const node = new AudioWorkletNode(
      audioContext,
      'dimension-expander-processor',
    );

    node.onprocessorerror = (event) => {
      console.error(
        'An error from DimensionExpanderProcessor was detected:',
        event,
      );
    };

    return node;
  },
  updateNode: (node: AudioWorkletNode, params) => {
    Object.entries(params).forEach(([key, value]) => {
      const param = node.parameters.get(key);
      if (param) {
        param.setValueAtTime(value, node.context.currentTime);
      } else {
        console.warn(
          `Parameter ${key} not found in DimensionExpanderProcessor`,
        );
      }
    });
  },
  defaultParams: {
    width: 0.5,
    depth: 0.5,
    resonance: 0.5,
    modSpeed: 0.1,
    dryWet: 0.5,
  },
  getConnection: (node) => node,
  ControlComponent: ({ params, setParams }) => (
    <div className="grid grid-cols-5 gap-2">
      <KnobControl
        param="width"
        min={0}
        max={1}
        value={params.width}
        onChange={(value) => setParams({ ...params, width: value })}
      />
      <KnobControl
        param="depth"
        min={0}
        max={1}
        value={params.depth}
        onChange={(value) => setParams({ ...params, depth: value })}
      />
      <KnobControl
        param="resonance"
        min={0}
        max={0.99}
        value={params.resonance}
        onChange={(value) => setParams({ ...params, resonance: value })}
      />
      <KnobControl
        param="modSpeed"
        min={0.01}
        max={5}
        value={params.modSpeed}
        onChange={(value) => setParams({ ...params, modSpeed: value })}
      />
      <KnobControl
        param="dryWet"
        min={0}
        max={1}
        value={params.dryWet}
        onChange={(value) => setParams({ ...params, dryWet: value })}
      />
    </div>
  ),
};

export default dimensionExpanderPlugin;
