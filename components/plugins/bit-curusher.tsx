import { EffectPlugin } from '@/types';
import { nanoid } from 'nanoid';
import { KnobControl } from '../knob';
import { Card } from '../ui/card';
import { useMemo } from 'react';

export async function loadBitcrusherWorklet(audioContext: AudioContext) {
  const src = /* javascript */ `
  class BitcrusherProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.phase = 0;
        this.lastSampleValue = 0;
    }

    static get parameterDescriptors() {
        return [{
                name: 'bitDepth',
                defaultValue: 8,
                minValue: 1,
                maxValue: 16
            },
            {
                name: 'frequencyReduction',
                defaultValue: 0.5,
                minValue: 0,
                maxValue: 0.99 
            }
        ];
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        const output = outputs[0];

        const bitDepth = Math.max(1, Math.min(parameters.bitDepth[0], 16));
        let frequencyReduction = parameters.frequencyReduction[0];
        frequencyReduction = Math.max(0, Math.min(frequencyReduction, 0.99)); 

        for (let channel = 0; channel < input.length; ++channel) {
            const inputChannel = input[channel];
            const outputChannel = output[channel];

            for (let i = 0; i < inputChannel.length; ++i) {
                this.phase += frequencyReduction;
                if (this.phase >= 1) {
                    this.phase -= 1;
                    this.lastSampleValue = Math.floor(inputChannel[i] * (1 << bitDepth)) / (1 << bitDepth);
                }

                outputChannel[i] = this.lastSampleValue;
            }
        }

        return true;
    }
  }

  registerProcessor('bitcrusher-processor', BitcrusherProcessor);
  `;

  await audioContext.audioWorklet.addModule(
    URL.createObjectURL(new Blob([src], { type: 'application/javascript' })),
  );
}

const SVGBitcrusherVisualizer = ({
  bitDepth,
  frequencyReduction,
}: {
  bitDepth: number;
  frequencyReduction: number;
}) => {
  const width = 100;
  const height = 50;
  const steps = 1 << bitDepth;
  const stepHeight = height / steps;
  const numSamples = Math.floor(width / Math.max(1 - frequencyReduction, 0.01));

  const items = useMemo(() => {
    return Array.from({ length: numSamples }, (_, i) => i);
  }, [numSamples]);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
      {items.map((i) => {
        const x = i * Math.max(1 - frequencyReduction, 0.01);
        const y = Math.floor(Math.random() * steps) * stepHeight;
        return (
          <line
            key={i}
            x1={x}
            y1={y}
            x2={x + Math.max(1 - frequencyReduction, 0.01)}
            y2={y}
            stroke="#4CAF50"
            strokeWidth="4"
          />
        );
      })}
    </svg>
  );
};

const bitcrusherPlugin: EffectPlugin<
  AudioWorkletNode,
  {
    bitDepth: number;
    frequencyReduction: number;
  }
> = {
  id: nanoid(),
  name: 'Bitcrusher',
  createNode: (audioContext) => {
    const node = new AudioWorkletNode(audioContext, 'bitcrusher-processor');

    node.onprocessorerror = (event) => {
      console.error('An error from BitcrusherProcessor was detected:', event);
    };

    return node;
  },
  updateNode: (node: AudioWorkletNode, params) => {
    Object.entries(params).forEach(([key, value]) => {
      const param = node.parameters.get(key);
      if (param) {
        param.setValueAtTime(value, node.context.currentTime);
      } else {
        console.warn(`Parameter ${key} not found in BitcrusherProcessor`);
      }
    });
  },
  defaultParams: { bitDepth: 8, frequencyReduction: 0.5 },
  getConnection: (node) => node,
  ControlComponent: ({ params, setParams }) => (
    <div className="grid grid-cols-3 gap-2">
      <KnobControl
        param="bitDepth"
        min={1}
        max={16}
        integerSteps
        dragSensitivity={0.1}
        value={params.bitDepth}
        onChange={(value) => setParams({ ...params, bitDepth: value })}
      />
      <KnobControl
        param="freqReduction"
        min={0}
        max={0.95}
        value={params.frequencyReduction}
        onChange={(value) =>
          setParams({ ...params, frequencyReduction: value })
        }
      />
      <Card className="justify-center bg-black w-[4.5rem] h-[4.5rem] items-center flex p-3">
        <SVGBitcrusherVisualizer
          bitDepth={params.bitDepth}
          frequencyReduction={params.frequencyReduction}
        />
      </Card>
    </div>
  ),
};

export default bitcrusherPlugin;
