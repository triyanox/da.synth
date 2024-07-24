import { EffectPlugin } from '@/types';
import { nanoid } from 'nanoid';
import { KnobControl } from '../knob';
import { Card } from '../ui/card';

export async function loadSonicTransformerWorklet(audioContext: AudioContext) {
  const src = /* javascript */ `
  class SonicTransformerProcessor extends AudioWorkletProcessor {
      constructor() {
          super();
          this.bufferSize = 4096;
          this.inputBuffer = new Float32Array(this.bufferSize);
          this.outputBuffer = new Float32Array(this.bufferSize);
          this.inputWriteIndex = 0;
          this.outputReadIndex = 0;
          this.phase = 0;
          this.lastFrame = new Float32Array(2);
      }

      static get parameterDescriptors() {
          return [{
                  name: 'pitchShift',
                  defaultValue: 0,
                  minValue: -12,
                  maxValue: 12
              },
              {
                  name: 'timeStretch',
                  defaultValue: 1,
                  minValue: 0.5,
                  maxValue: 2
              },
              {
                  name: 'spectralTilt',
                  defaultValue: 0,
                  minValue: -1,
                  maxValue: 1
              }
          ];
      }

      process(inputs, outputs, parameters) {
          const input = inputs[0];
          const output = outputs[0];

          if (!input || !input[0] || input[0].length === 0) {
              return true;
          }

          const pitchShift = parameters.pitchShift[0];
          const timeStretch = parameters.timeStretch[0];
          const spectralTilt = parameters.spectralTilt[0];

          const pitchShiftFactor = Math.pow(2, pitchShift / 12);
          const stretchFactor = 1 / timeStretch;

          for (let i = 0; i < input[0].length; i++) {
              this.inputBuffer[this.inputWriteIndex] = input[0][i];
              this.inputWriteIndex = (this.inputWriteIndex + 1) % this.bufferSize;

              const readPos = (this.outputReadIndex + this.phase) * stretchFactor;
              const intPos = Math.floor(readPos);
              const fracPos = readPos - intPos;

              const sample1 = this.inputBuffer[intPos % this.bufferSize];
              const sample2 = this.inputBuffer[(intPos + 1) % this.bufferSize];
              let interpolatedSample = sample1 + fracPos * (sample2 - sample1);

              const alpha = 0.1;
              this.lastFrame[0] = (1 - alpha) * this.lastFrame[0] + alpha * interpolatedSample;
              this.lastFrame[1] = (1 - alpha) * this.lastFrame[1] + alpha * (interpolatedSample - this.lastFrame[0]);
              interpolatedSample = this.lastFrame[0] + spectralTilt * this.lastFrame[1] * 2;

              for (let channel = 0; channel < output.length; channel++) {
                  output[channel][i] = interpolatedSample;
              }

              this.phase += pitchShiftFactor;
              while (this.phase >= 1) {
                  this.phase -= 1;
                  this.outputReadIndex = (this.outputReadIndex + 1) % this.bufferSize;
              }
          }

          return true;
      }
  }

  registerProcessor('sonic-transformer-processor', SonicTransformerProcessor);`;

  await audioContext.audioWorklet.addModule(
    URL.createObjectURL(new Blob([src], { type: 'application/javascript' })),
  );
}

const SVGSonicTransformerVisualizer = ({
  pitchShift,
  timeStretch,
  spectralTilt,
}: {
  pitchShift: number;
  timeStretch: number;
  spectralTilt: number;
}) => {
  const width = 100;
  const height = 50;
  const centerY = height / 2;

  const pitchY = centerY - (pitchShift / 24) * height;
  const stretchX = ((timeStretch - 0.5) / 1.5) * width;
  const tiltAngle = spectralTilt * 45;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
      <line
        x1="0"
        y1={centerY}
        x2={width}
        y2={centerY}
        stroke="#fb923c"
        strokeWidth="1"
      />
      <line
        x1={width / 2}
        y1="0"
        x2={width / 2}
        y2={height}
        stroke="#fb923c"
        strokeWidth="1"
      />
      <circle cx={stretchX} cy={pitchY} r="6" fill="#4CAF50" />
      <line
        x1={width / 2 - 10}
        y1={centerY}
        x2={width / 2 + 10}
        y2={centerY - Math.tan((tiltAngle * Math.PI) / 180) * 10}
        stroke="#2196F3"
        strokeWidth="2"
      />
    </svg>
  );
};

const sonicTransformerPlugin: EffectPlugin<
  AudioWorkletNode,
  {
    pitchShift: number;
    timeStretch: number;
    spectralTilt: number;
  }
> = {
  id: nanoid(),
  name: 'Sonic Transformer (*)',
  createNode: (audioContext) => {
    const node = new AudioWorkletNode(
      audioContext,
      'sonic-transformer-processor',
    );

    node.onprocessorerror = (event) => {
      console.error(
        'An error from SonicTransformerProcessor was detected:',
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
        console.warn(`Parameter ${key} not found in SonicTransformerProcessor`);
      }
    });
  },
  defaultParams: { pitchShift: 0, timeStretch: 1, spectralTilt: 0 },
  getConnection: (node) => node,
  ControlComponent: ({ params, setParams }) => (
    <div className="grid grid-cols-4 gap-2">
      <KnobControl
        param="pitchShift"
        min={-12}
        max={12}
        value={params.pitchShift}
        onChange={(value) => setParams({ ...params, pitchShift: value })}
      />
      <KnobControl
        param="timeStretch"
        min={0.5}
        max={2}
        value={params.timeStretch}
        onChange={(value) => setParams({ ...params, timeStretch: value })}
      />
      <KnobControl
        param="spectralTilt"
        min={-1}
        max={1}
        value={params.spectralTilt}
        onChange={(value) => setParams({ ...params, spectralTilt: value })}
      />
      <Card className="justify-center bg-black w-[4.5rem] h-[4.5rem] items-center flex p-3">
        <SVGSonicTransformerVisualizer
          pitchShift={params.pitchShift}
          timeStretch={params.timeStretch}
          spectralTilt={params.spectralTilt}
        />
      </Card>
    </div>
  ),
};

export default sonicTransformerPlugin;
