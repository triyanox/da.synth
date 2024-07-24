import { EffectPlugin } from '@/types';
import { nanoid } from 'nanoid';
import { KnobControl } from '../knob';
import { Card } from '../ui/card';

export async function loadPingPongDelayWorklet(audioContext: AudioContext) {
  const src = /* javascript */ `
  class PingPongDelayProcessor extends AudioWorkletProcessor {
      constructor() {
          super();
          this.leftDelay = new Float32Array(48000);
          this.rightDelay = new Float32Array(48000);
          this.leftWriteIndex = 0;
          this.rightWriteIndex = 0;
          this.currentDelayTime = 0.3;
          this.currentFeedback = 0.5;
          this.currentWetDryMix = 0.5;
      }

      static get parameterDescriptors() {
          return [{
                  name: 'delayTime',
                  defaultValue: 0.3,
                  minValue: 0.01,
                  maxValue: 1.0
              },
              {
                  name: 'feedback',
                  defaultValue: 0.5,
                  minValue: 0,
                  maxValue: 0.9
              },
              {
                  name: 'wetDryMix',
                  defaultValue: 0.5,
                  minValue: 0,
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

          const delayTime = parameters.delayTime[0];
          const feedback = parameters.feedback[0];
          const wetDryMix = parameters.wetDryMix[0];

          const smoothingFactor = 0.05;
          this.currentDelayTime += (delayTime - this.currentDelayTime) * smoothingFactor;
          this.currentFeedback += (feedback - this.currentFeedback) * smoothingFactor;
          this.currentWetDryMix += (wetDryMix - this.currentWetDryMix) * smoothingFactor;

          const delaySamples = Math.floor(this.currentDelayTime * sampleRate);

          for (let i = 0; i < input[0].length; i++) {
              const leftReadIndex = (this.leftWriteIndex - delaySamples + this.leftDelay.length) % this.leftDelay.length;
              const rightReadIndex = (this.rightWriteIndex - delaySamples + this.rightDelay.length) % this.rightDelay.length;

              const leftDelayedSample = this.leftDelay[leftReadIndex];
              const rightDelayedSample = this.rightDelay[rightReadIndex];

              const leftInput = input[0][i];
              const leftOutput = leftInput * (1 - this.currentWetDryMix) + leftDelayedSample * this.currentWetDryMix;
              output[0][i] = leftOutput;

              this.rightDelay[this.rightWriteIndex] = leftInput + rightDelayedSample * this.currentFeedback;
              this.rightWriteIndex = (this.rightWriteIndex + 1) % this.rightDelay.length;

              const rightInput = input[1] ? input[1][i] : leftInput;
              const rightOutput = rightInput * (1 - this.currentWetDryMix) + rightDelayedSample * this.currentWetDryMix;
              if (output[1]) {
                  output[1][i] = rightOutput;
              }

              this.leftDelay[this.leftWriteIndex] = rightInput + leftDelayedSample * this.currentFeedback;
              this.leftWriteIndex = (this.leftWriteIndex + 1) % this.leftDelay.length;
          }

          return true;
      }
  }

  registerProcessor('ping-pong-delay-processor', PingPongDelayProcessor);`;

  await audioContext.audioWorklet.addModule(
    URL.createObjectURL(new Blob([src], { type: 'application/javascript' })),
  );
}

const SVGPingPongVisualizer = ({
  delayTime,
  feedback,
}: {
  delayTime: number;
  feedback: number;
}) => {
  const width = 100;
  const height = 50;
  const delayWidth = delayTime * width;
  const feedbackHeight = feedback * height;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
      <line
        x1="0"
        y1={height}
        x2={delayWidth}
        y2="0"
        stroke="#4CAF50"
        strokeWidth="2"
      />
      <line
        x1={delayWidth}
        y1="0"
        x2={width}
        y2={height - feedbackHeight}
        stroke="#2196F3"
        strokeWidth="2"
      />
    </svg>
  );
};

const pingPongDelayPlugin: EffectPlugin<
  AudioWorkletNode,
  {
    delayTime: number;
    feedback: number;
    wetDryMix: number;
  }
> = {
  id: nanoid(),
  name: 'Ping Pong Delay (*)',
  createNode: (audioContext) =>
    new AudioWorkletNode(audioContext, 'ping-pong-delay-processor'),
  updateNode: (node: AudioWorkletNode, params) => {
    Object.entries(params).forEach(([key, value]) => {
      const param = node.parameters.get(key);
      if (param) {
        param.setTargetAtTime(value, node.context.currentTime, 0.05);
      }
    });
  },
  defaultParams: { delayTime: 0.3, feedback: 0.5, wetDryMix: 0.5 },
  getConnection: (res) => res,
  ControlComponent: ({ params, setParams }) => (
    <div className="grid grid-cols-4 gap-2">
      <KnobControl
        param="delayTime"
        min={0.01}
        max={1}
        value={params.delayTime}
        onChange={(value) => setParams({ ...params, delayTime: value })}
      />
      <KnobControl
        param="feedback"
        min={0}
        max={0.9}
        value={params.feedback}
        onChange={(value) => setParams({ ...params, feedback: value })}
      />
      <KnobControl
        param="wetDryMix"
        min={0}
        max={1}
        value={params.wetDryMix}
        onChange={(value) => setParams({ ...params, wetDryMix: value })}
      />
      <Card className="justify-center bg-black w-[4.5rem] h-[4.5rem] items-center flex p-3">
        <SVGPingPongVisualizer
          delayTime={params.delayTime}
          feedback={params.feedback}
        />
      </Card>
    </div>
  ),
};

export default pingPongDelayPlugin;
