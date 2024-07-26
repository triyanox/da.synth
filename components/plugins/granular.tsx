import { EffectPlugin } from '@/types';
import { nanoid } from 'nanoid';
import { KnobControl } from '../knob';
import { Card } from '../ui/card';

export async function loadGranularWorklet(audioContext: AudioContext) {
  const src = /* javascript */ `
  class GranularProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.bufferSize = 44100 * 2; 
        this.buffer = new Float32Array(this.bufferSize);
        this.grainPosition = 0;
        this.currentFrame = 0;
        this.nextGrainTime = 0;
        this.sampleRate = 44100;
        this.currentGrainSize = 0.1;
        this.currentGrainSpacing = 0.05;
        this.currentPlaybackRate = 1;
        this.smoothingFactor = 0.05;
        this.tempBuffer = new Float32Array(128); 

        this.port.onmessage = (event) => {
            if (event.data.sampleRate) {
                this.sampleRate = event.data.sampleRate;
            }
        };
    }

    static get parameterDescriptors() {
        return [{
                name: 'grainSize',
                defaultValue: 0.1,
                minValue: 0.01,
                maxValue: 1,
            },
            {
                name: 'grainSpacing',
                defaultValue: 0.05,
                minValue: 0.01,
                maxValue: 1,
            },
            {
                name: 'playbackRate',
                defaultValue: 1,
                minValue: 0.1,
                maxValue: 4,
            },
        ];
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        const output = outputs[0];

        if (!input || !input[0] || input[0].length === 0) {
            return true;
        }

        const grainSize = parameters.grainSize[0];
        const grainSpacing = parameters.grainSpacing[0];
        const playbackRate = parameters.playbackRate[0];

        this.currentGrainSize += (grainSize - this.currentGrainSize) * this.smoothingFactor;
        this.currentGrainSpacing += (grainSpacing - this.currentGrainSpacing) * this.smoothingFactor;
        this.currentPlaybackRate += (playbackRate - this.currentPlaybackRate) * this.smoothingFactor;

        const delaySamples = (this.currentGrainSize * this.sampleRate) | 0; 

        const inputLength = input[0].length;
        for (let channel = 0; channel < input.length; channel++) {
            const inputChannel = input[channel];
            const outputChannel = output[channel];

            for (let i = 0; i < inputLength; i++) {
                this.buffer[this.grainPosition] = inputChannel[i];
                this.grainPosition = (this.grainPosition + 1) % this.bufferSize;

                if (this.nextGrainTime <= this.currentFrame) {
                    this.nextGrainTime = this.currentFrame + (this.currentGrainSpacing * this.sampleRate) | 0;
                    this.grainPosition = Math.random() * this.bufferSize | 0;
                }

                const grainPhase = (this.currentFrame - (this.nextGrainTime - delaySamples)) / delaySamples;
                if (grainPhase >= 0 && grainPhase < 1) {
                    const windowValue = 0.5 * (1 - Math.cos(2 * Math.PI * grainPhase));
                    outputChannel[i] = this.buffer[this.grainPosition | 0] * windowValue;
                } else {
                    outputChannel[i] = 0;
                }

                this.grainPosition = (this.grainPosition + this.currentPlaybackRate) % this.bufferSize;
                this.currentFrame++;
            }
        }

        return true;
      }
  }

  registerProcessor('granular-processor', GranularProcessor);`;

  try {
    await audioContext.audioWorklet.addModule(
      URL.createObjectURL(new Blob([src], { type: 'application/javascript' })),
    );
  } catch (error) {
    console.error('Failed to load granular worklet:', error);
    throw error;
  }
}

const SVGGranularVisualizer = ({
  grainSize,
  grainSpacing,
}: {
  grainSize: number;
  grainSpacing: number;
}) => {
  const width = 100;
  const height = 50;
  const grainWidth = (grainSize / (grainSize + grainSpacing)) * width;
  const spacingWidth = width - grainWidth;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
      <rect x="0" y="0" width={grainWidth} height={height} fill="#4CAF50" />
      <rect
        x={grainWidth}
        y="0"
        width={spacingWidth}
        height={height}
        fill="#2196F3"
      />
    </svg>
  );
};

const granularPlugin: EffectPlugin<
  AudioWorkletNode,
  {
    grainSize: number;
    grainSpacing: number;
    playbackRate: number;
  }
> = {
  id: nanoid(),
  name: 'Granular (*)',
  createNode: (audioContext) => {
    try {
      return new AudioWorkletNode(audioContext, 'granular-processor', {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        outputChannelCount: [2],
        parameterData: {
          grainSize: 0.1,
          grainSpacing: 0.05,
          playbackRate: 1,
        },
      });
    } catch (error) {
      console.error('Failed to create granular node:', error);
      throw error;
    }
  },
  updateNode: (node: AudioWorkletNode, params) => {
    if (!node) return;
    Object.entries(params).forEach(([key, value]) => {
      const param = node.parameters.get(key);
      if (param) {
        param.setTargetAtTime(value, node.context.currentTime, 0.05);
      }
    });
  },
  defaultParams: { grainSize: 0.1, grainSpacing: 0.05, playbackRate: 1 },
  getConnection: (res) => res,
  ControlComponent: ({ params, setParams }) => (
    <div className="grid grid-cols-4 gap-2">
      <KnobControl
        param="grainSize"
        min={0.01}
        max={1}
        value={params.grainSize}
        onChange={(value) => setParams({ ...params, grainSize: value })}
      />
      <KnobControl
        param="grainSpacing"
        min={0.01}
        max={1}
        value={params.grainSpacing}
        onChange={(value) => setParams({ ...params, grainSpacing: value })}
      />
      <KnobControl
        param="playbackRate"
        min={0.1}
        max={4}
        value={params.playbackRate}
        onChange={(value) => setParams({ ...params, playbackRate: value })}
      />
      <Card className="justify-center w-[4.5rem] h-[4.5rem] items-center flex p-3">
        <SVGGranularVisualizer
          grainSize={params.grainSize}
          grainSpacing={params.grainSpacing}
        />
      </Card>
    </div>
  ),
};

export default granularPlugin;
