import { workletsLoader } from '@/components/plugins';
import { useEffect, useState, useCallback, useRef } from 'react';

export interface AudioContextOptions {
  sampleRate?: number;
  latencyHint?: AudioContextLatencyCategory | number;
  bufferSize?: number;
}

const useAudioContext = (
  options: AudioContextOptions = {
    sampleRate: 44100,
    latencyHint: 'balanced',
    bufferSize: 256,
  },
) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const contextRef = useRef<AudioContext | null>(null);

  const initAudioContext = useCallback(async () => {
    if (contextRef.current) return;

    const newContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)({
      sampleRate: options.sampleRate,
      latencyHint: options.latencyHint,
    });

    try {
      if (options.bufferSize) {
        const buffer = newContext.createBuffer(
          2,
          options.bufferSize,
          newContext.sampleRate,
        );
        const source = newContext.createBufferSource();
        source.buffer = buffer;
        source.connect(newContext.destination);
      }

      await workletsLoader.loadWorklets(newContext);

      contextRef.current = newContext;
      setAudioContext(newContext);
    } catch (err) {
      console.error('Failed to initialize audio context:', err);
      await newContext.close();
    }
  }, [options.sampleRate, options.latencyHint, options.bufferSize]);

  const cleanupAudioContext = useCallback(async () => {
    if (contextRef.current) {
      await contextRef.current.close();
      contextRef.current = null;
      setAudioContext(null);
    }
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cleanupAudioContext();
      } else {
        initAudioContext();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('click', initAudioContext);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('click', initAudioContext);
      cleanupAudioContext();
    };
  }, [initAudioContext, cleanupAudioContext]);

  return audioContext;
};

export default useAudioContext;
