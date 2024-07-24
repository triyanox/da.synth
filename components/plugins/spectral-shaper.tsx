import { EffectPlugin } from '@/types';
import { nanoid } from 'nanoid';
import { KnobControl } from '../knob';
import { Card } from '../ui/card';

export async function loadSpectralShaperWorklet(audioContext: AudioContext) {
  const src = /* javascript */ `
  class SpectralShaperProcessor extends AudioWorkletProcessor {
      constructor() {
          super();
          this.fftSize = 2048;
          this.hopSize = this.fftSize / 4;
          this.inputBuffer = new Float32Array(this.fftSize);
          this.outputBuffer = new Float32Array(this.fftSize);
          this.window = this.createWindow();
          this.inputWriteIndex = 0;
          this.outputReadIndex = 0;
          this.fft = new FFT(this.fftSize);
          this.ifft = new IFFT(this.fftSize);
          this.frozenSpectrum = new Float32Array(this.fftSize);
          this.freezeCount = 0;
      }

      static get parameterDescriptors() {
          return [{
                  name: 'freqShift',
                  defaultValue: 0,
                  minValue: -1000,
                  maxValue: 1000
              },
              {
                  name: 'freezeProbability',
                  defaultValue: 0,
                  minValue: 0,
                  maxValue: 1
              },
              {
                  name: 'harmonicEnhancement',
                  defaultValue: 0,
                  minValue: 0,
                  maxValue: 1
              }
          ];
      }

      createWindow() {
          const window = new Float32Array(this.fftSize);
          for (let i = 0; i < this.fftSize; i++) {
              window[i] = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (this.fftSize - 1));
          }
          return window;
      }

      process(inputs, outputs, parameters) {
          const input = inputs[0];
          const output = outputs[0];

          if (!input || !input[0] || input[0].length === 0) {
              return true;
          }

          const freqShift = parameters.freqShift[0];
          const freezeProbability = parameters.freezeProbability[0];
          const harmonicEnhancement = parameters.harmonicEnhancement[0];

          for (let i = 0; i < input[0].length; i++) {
              this.inputBuffer[this.inputWriteIndex] = input[0][i];
              this.inputWriteIndex = (this.inputWriteIndex + 1) % this.fftSize;

              if (this.inputWriteIndex % this.hopSize === 0) {
                  const buffer = new Float32Array(this.fftSize);
                  for (let j = 0; j < this.fftSize; j++) {
                      const index = (this.inputWriteIndex - this.fftSize + j + this.fftSize) % this.fftSize;
                      buffer[j] = this.inputBuffer[index] * this.window[j];
                  }

                  const spectrum = this.fft.forward(buffer);

                  if (Math.random() < freezeProbability) {
                      this.frozenSpectrum.set(spectrum);
                      this.freezeCount = Math.floor(Math.random() * 10000) + 5000;
                  }
                  if (this.freezeCount > 0) {
                      spectrum.set(this.frozenSpectrum);
                      this.freezeCount--;
                  }

                  const shiftAmount = Math.floor(freqShift / (sampleRate / this.fftSize));
                  if (shiftAmount !== 0) {
                      const shiftedSpectrum = new Float32Array(this.fftSize);
                      for (let j = 0; j < this.fftSize; j++) {
                          const newIndex = (j + shiftAmount + this.fftSize) % this.fftSize;
                          shiftedSpectrum[newIndex] = spectrum[j];
                      }
                      spectrum.set(shiftedSpectrum);
                  }

                  for (let j = 2; j < this.fftSize / 2; j++) {
                      const harmonic = j * 2;
                      if (harmonic < this.fftSize / 2) {
                          spectrum[harmonic] += spectrum[j] * harmonicEnhancement;
                      }
                  }

                  const processedBuffer = this.ifft.inverse(spectrum);

                  for (let j = 0; j < this.fftSize; j++) {
                      const outputIndex = (this.outputReadIndex + j) % this.fftSize;
                      this.outputBuffer[outputIndex] += processedBuffer[j] * this.window[j];
                  }

                  this.outputReadIndex = (this.outputReadIndex + this.hopSize) % this.fftSize;
              }

              for (let channel = 0; channel < output.length; channel++) {
                  output[channel][i] = this.outputBuffer[this.outputReadIndex];
              }
              this.outputBuffer[this.outputReadIndex] = 0;
              this.outputReadIndex = (this.outputReadIndex + 1) % this.fftSize;
          }

          return true;
      }
  }

  class FFT {
      constructor(size) {
          this.size = size;
          this.reverseBits = new Uint32Array(size);
          this.sinTable = new Float32Array(size);
          this.cosTable = new Float32Array(size);
          this.initialize();
      }

      initialize() {
          for (let i = 0; i < this.size; i++) {
              this.reverseBits[i] = this.reverse(i);
              this.sinTable[i] = Math.sin(-2 * Math.PI * i / this.size);
              this.cosTable[i] = Math.cos(-2 * Math.PI * i / this.size);
          }
      }

      reverse(i) {
          let reversed = 0;
          let bits = Math.log2(this.size);
          for (let j = 0; j < bits; j++) {
              reversed = (reversed << 1) | (i & 1);
              i >>= 1;
          }
          return reversed;
      }

      forward(input) {
          const output = new Float32Array(this.size);
          for (let i = 0; i < this.size; i++) {
              output[i] = input[this.reverseBits[i]];
          }

          for (let size = 2; size <= this.size; size *= 2) {
              const halfSize = size / 2;
              const tablestep = this.size / size;
              for (let i = 0; i < this.size; i += size) {
                  for (let j = i, k = 0; j < i + halfSize; j++, k += tablestep) {
                      const even = output[j];
                      const odd = output[j + halfSize];
                      const cos = this.cosTable[k];
                      const sin = this.sinTable[k];
                      output[j] = even + odd * cos - odd * sin;
                      output[j + halfSize] = even - odd * cos + odd * sin;
                  }
              }
          }
          return output;
      }
  }

  class IFFT extends FFT {
      constructor(size) {
          super(size);
      }

      inverse(input) {
          const conjugate = new Float32Array(this.size);
          for (let i = 0; i < this.size; i++) {
              conjugate[i] = input[i];
          }
          const forward = super.forward(conjugate);
          const output = new Float32Array(this.size);
          const scale = 1 / this.size;
          for (let i = 0; i < this.size; i++) {
              output[i] = forward[i] * scale;
          }
          return output;
      }
  }

  registerProcessor('spectral-shaper-processor', SpectralShaperProcessor);`;

  await audioContext.audioWorklet.addModule(
    URL.createObjectURL(new Blob([src], { type: 'application/javascript' })),
  );
}

const spectralShaperPlugin: EffectPlugin<
  AudioWorkletNode,
  {
    freqShift: number;
    freezeProbability: number;
    harmonicEnhancement: number;
  }
> = {
  id: nanoid(),
  name: 'Spectral Shaper',
  createNode: (audioContext) => {
    const node = new AudioWorkletNode(
      audioContext,
      'spectral-shaper-processor',
    );

    node.onprocessorerror = (event) => {
      console.error(
        'An error from SpectralShaperProcessor was detected:',
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
        console.warn(`Parameter ${key} not found in SpectralShaperProcessor`);
      }
    });
  },
  defaultParams: { freqShift: 0, freezeProbability: 0, harmonicEnhancement: 0 },
  getConnection: (node) => node,
  ControlComponent: ({ params, setParams }) => (
    <div className="grid grid-cols-3 gap-2">
      <KnobControl
        param="freqShift"
        min={-1000}
        max={1000}
        value={params.freqShift}
        onChange={(value) => setParams({ ...params, freqShift: value })}
      />
      <KnobControl
        param="freezeProb"
        min={0}
        max={1}
        value={params.freezeProbability}
        onChange={(value) => setParams({ ...params, freezeProbability: value })}
      />
      <KnobControl
        param="hEnhancement"
        min={0}
        max={1}
        value={params.harmonicEnhancement}
        onChange={(value) =>
          setParams({ ...params, harmonicEnhancement: value })
        }
      />
    </div>
  ),
};

export default spectralShaperPlugin;
