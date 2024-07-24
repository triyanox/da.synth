import { EffectPlugin } from '@/types';
import { nanoid } from 'nanoid';
import { KnobControl } from '../knob';
import { Card } from '../ui/card';

export async function loadFormantFilterWorklet(audioContext: AudioContext) {
  const src = /* javascript */ `
  class FormantFilterProcessor extends AudioWorkletProcessor {
      constructor() {
          super();
          this.formants = {
              a: [800, 1200],
              e: [400, 2000],
              i: [300, 2700],
              o: [450, 800],
              u: [350, 600]
          };
          this.biquadFilters = this.createBiquadFilters();
      }

      static get parameterDescriptors() {
          return [{
                  name: 'vowel',
                  defaultValue: 0,
                  minValue: 0,
                  maxValue: 4,
                  automation: 'k-rate'
              },
              {
                  name: 'intensity',
                  defaultValue: 0.5,
                  minValue: 0,
                  maxValue: 1
              }
          ];
      }

      createBiquadFilters() {
          const filters = [];
          for (let i = 0; i < 2; i++) {
              filters.push({
                  a: [0, 0],
                  b: [0, 0, 0],
                  x1: 0,
                  x2: 0,
                  y1: 0,
                  y2: 0
              });
          }
          return filters;
      }

      calculateCoefficients(frequency, Q, gain) {
          const w0 = 2 * Math.PI * frequency / sampleRate;
          const alpha = Math.sin(w0) / (2 * Q);
          const A = Math.pow(10, gain / 40);

          const b0 = 1 + alpha * A;
          const b1 = -2 * Math.cos(w0);
          const b2 = 1 - alpha * A;
          const a0 = 1 + alpha / A;
          const a1 = -2 * Math.cos(w0);
          const a2 = 1 - alpha / A;

          return {
              a: [a1 / a0, a2 / a0],
              b: [b0 / a0, b1 / a0, b2 / a0]
          };
      }

      process(inputs, outputs, parameters) {
          const input = inputs[0];
          const output = outputs[0];
          const vowelParam = Math.floor(parameters.vowel[0]);
          const intensity = parameters.intensity[0];

          const vowels = ['a', 'e', 'i', 'o', 'u'];
          const currentVowel = vowels[vowelParam];
          const formantFreqs = this.formants[currentVowel];

          for (let i = 0; i < 2; i++) {
              const coeffs = this.calculateCoefficients(formantFreqs[i], 5, 6 * intensity);
              this.biquadFilters[i] = {
                  ...this.biquadFilters[i],
                  ...coeffs
              };
          }

          for (let channel = 0; channel < input.length; ++channel) {
              const inputChannel = input[channel];
              const outputChannel = output[channel];

              for (let i = 0; i < inputChannel.length; ++i) {
                  let sample = inputChannel[i];
                  let filteredSample = sample;

                  for (let j = 0; j < 2; j++) {
                      const filter = this.biquadFilters[j];
                      filteredSample = filter.b[0] * sample + filter.b[1] * filter.x1 + filter.b[2] * filter.x2 -
                          filter.a[0] * filter.y1 - filter.a[1] * filter.y2;

                      filter.x2 = filter.x1;
                      filter.x1 = sample;
                      filter.y2 = filter.y1;
                      filter.y1 = filteredSample;

                      sample = filteredSample;
                  }

                  outputChannel[i] = (1 - intensity) * inputChannel[i] + intensity * filteredSample;
              }
          }

          return true;
      }
  }

  registerProcessor('formant-filter-processor', FormantFilterProcessor);
  `;

  await audioContext.audioWorklet.addModule(
    URL.createObjectURL(new Blob([src], { type: 'application/javascript' })),
  );
}

const SVGFormantFilterVisualizer = ({
  vowel,
  intensity,
}: {
  vowel: number;
  intensity: number;
}) => {
  const width = 100;
  const height = 50;
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  const vowelX = (vowel / 4) * width;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
      <line
        x1={vowelX}
        y1="0"
        x2={vowelX}
        y2={height}
        stroke="#4CAF50"
        strokeWidth="2"
      />
      <text
        x={width / 2}
        y={height / 2}
        textAnchor="middle"
        fill="#000"
        fontSize="20"
        className="font-bold text-2xl"
      >
        {vowels[Math.floor(vowel)]}
      </text>
      <rect
        x="0"
        y={height - intensity * height}
        width={width}
        height={intensity * height}
        fill="#2196F3"
        opacity="0.5"
      />
    </svg>
  );
};

const formantFilterPlugin: EffectPlugin<
  AudioWorkletNode,
  {
    vowel: number;
    intensity: number;
  }
> = {
  id: nanoid(),
  name: 'Formant Filter (*)',
  createNode: (audioContext) => {
    const node = new AudioWorkletNode(audioContext, 'formant-filter-processor');

    node.onprocessorerror = (event) => {
      console.error(
        'An error from FormantFilterProcessor was detected:',
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
        console.warn(`Parameter ${key} not found in FormantFilterProcessor`);
      }
    });
  },
  defaultParams: { vowel: 0, intensity: 0.5 },
  getConnection: (res) => res,
  ControlComponent: ({ params, setParams }) => (
    <div className="grid grid-cols-3 gap-2">
      <KnobControl
        param="vowel"
        min={0}
        max={4}
        value={params.vowel}
        onChange={(value) => setParams({ ...params, vowel: value })}
      />
      <KnobControl
        param="intensity"
        min={0}
        max={1}
        value={params.intensity}
        onChange={(value) => setParams({ ...params, intensity: value })}
      />
      <Card className="justify-center w-[4.5rem] h-[4.5rem] items-center flex p-3">
        <SVGFormantFilterVisualizer
          vowel={params.vowel}
          intensity={params.intensity}
        />
      </Card>
    </div>
  ),
};

export default formantFilterPlugin;
