import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import { Checkbox } from './ui/checkbox';
import { Slider } from './ui/slider';
import { cn } from '@/lib/utils';

const keyToNote = (key: string): number | null => {
  const keyMap: { [key: string]: number } = {
    a: 60,
    w: 61,
    s: 62,
    e: 63,
    d: 64,
    f: 65,
    t: 66,
    g: 67,
    y: 68,
    h: 69,
    u: 70,
    j: 71,
    k: 72,
  };
  return keyMap[key] || null;
};

interface KeyboardProps {
  playNote: (note: number) => void;
  stopNote: (note: number) => void;
}

const Keyboard: React.FC<KeyboardProps> = React.memo(
  ({ playNote, stopNote }) => {
    const [activeKeys, setActiveKeys] = useState<Set<number>>(new Set());
    const [isArpeggiatorOn, setIsArpeggiatorOn] = useState(false);
    const [isChordsOn, setIsChordsOn] = useState(false);
    const [arpeggiatorSpeed, setArpeggiatorSpeed] = useState(200);
    const arpeggiatorInterval = useRef<number | null>(null);

    const handleNoteOn = useCallback(
      (note: number) => {
        setActiveKeys((prev) => new Set(prev).add(note));
        if (!isArpeggiatorOn) {
          if (isChordsOn) {
            playChord(note);
          } else {
            playNote(note);
          }
        }
      },
      [playNote, isArpeggiatorOn, isChordsOn],
    );

    const handleNoteOff = useCallback(
      (note: number) => {
        setActiveKeys((prev) => {
          const newSet = new Set(prev);
          newSet.delete(note);
          return newSet;
        });
        if (!isArpeggiatorOn) {
          if (isChordsOn) {
            stopChord(note);
          } else {
            stopNote(note);
          }
        }
      },
      [stopNote, isArpeggiatorOn, isChordsOn],
    );

    const playChord = useCallback(
      (root: number) => {
        playNote(root);
        playNote(root + 4);
        playNote(root + 7);
      },
      [playNote],
    );

    const stopChord = useCallback(
      (root: number) => {
        stopNote(root);
        stopNote(root + 4);
        stopNote(root + 7);
      },
      [stopNote],
    );

    const keys = useMemo(
      () => [
        { note: 60, label: 'C', keyLabel: 'A', isBlack: false },
        { note: 61, label: 'C#', keyLabel: 'W', isBlack: true },
        { note: 62, label: 'D', keyLabel: 'S', isBlack: false },
        { note: 63, label: 'D#', keyLabel: 'E', isBlack: true },
        { note: 64, label: 'E', keyLabel: 'D', isBlack: false },
        { note: 65, label: 'F', keyLabel: 'F', isBlack: false },
        { note: 66, label: 'F#', keyLabel: 'T', isBlack: true },
        { note: 67, label: 'G', keyLabel: 'G', isBlack: false },
        { note: 68, label: 'G#', keyLabel: 'Y', isBlack: true },
        { note: 69, label: 'A', keyLabel: 'H', isBlack: false },
        { note: 70, label: 'A#', keyLabel: 'U', isBlack: true },
        { note: 71, label: 'B', keyLabel: 'J', isBlack: false },
        { note: 72, label: 'C', keyLabel: 'K', isBlack: false },
      ],
      [],
    );

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.repeat) return;
        const note = keyToNote(e.key);
        if (note) handleNoteOn(note);
      };

      const handleKeyUp = (e: KeyboardEvent) => {
        const note = keyToNote(e.key);
        if (note) handleNoteOff(note);
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }, [handleNoteOn, handleNoteOff]);

    useEffect(() => {
      if (isArpeggiatorOn) {
        let index = 0;
        arpeggiatorInterval.current = window.setInterval(() => {
          const activeNotes = Array.from(activeKeys);
          if (activeNotes.length > 0) {
            const noteToPlay = activeNotes[index % activeNotes.length];
            if (isChordsOn) {
              playChord(noteToPlay);
              setTimeout(() => stopChord(noteToPlay), arpeggiatorSpeed / 2);
            } else {
              playNote(noteToPlay);
              setTimeout(() => stopNote(noteToPlay), arpeggiatorSpeed / 2);
            }
            index++;
          }
        }, arpeggiatorSpeed);
      } else {
        if (arpeggiatorInterval.current) {
          clearInterval(arpeggiatorInterval.current);
        }
      }

      return () => {
        if (arpeggiatorInterval.current) {
          clearInterval(arpeggiatorInterval.current);
        }
      };
    }, [
      isArpeggiatorOn,
      isChordsOn,
      activeKeys,
      arpeggiatorSpeed,
      playNote,
      stopNote,
      playChord,
      stopChord,
    ]);

    return (
      <div className="w-full max-w-[800px] px-8">
        <div className="bg-gray-200 border-black border-4 p-4 rounded-lg shadow-inner">
          <div className="flex justify-between gap-1 mb-4">
            {keys.map((key) => (
              <button
                key={key.note}
                className={`
                w-14 h-20 flex border-black border-2 flex-col items-center justify-between py-2 px-1
                font-mono text-xs 
                ${
                  activeKeys.has(key.note)
                    ? 'bg-gradient-to-b from-orange-400 to-orange-500 shadow-inner'
                    : key.isBlack
                    ? 'bg-gradient-to-b from-black to-black shadow-md hover:from-gray-700 hover:to-gray-800'
                    : 'bg-gradient-to-b from-gray-100 to-gray-50 shadow-md hover:from-gray-200 hover:to-gray-300'
                }
                rounded-md transition-all duration-50 ease-in-out
                focus:outline-none
              `}
                onMouseDown={() => handleNoteOn(key.note)}
                onMouseUp={() => handleNoteOff(key.note)}
                onMouseLeave={() => handleNoteOff(key.note)}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleNoteOn(key.note);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleNoteOff(key.note);
                }}
              >
                <div className="w-full h-3 flex items-center justify-center mb-1">
                  <div
                    className={cn(`w-1.5 h-1.5 rounded-full
                    ${key.isBlack ? 'bg-white' : 'bg-black'}s
                    `)}
                  ></div>
                </div>
                <span
                  className={`text-[10px] ${
                    key.isBlack ? 'text-gray-300' : 'text-gray-500'
                  }`}
                >
                  {key.keyLabel}
                </span>
                <span
                  className={`font-bold ${
                    key.isBlack ? 'text-white' : 'text-black'
                  }`}
                >
                  {key.label}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 gap-4">
            <div className="flex items-center gap-4">
              <Checkbox
                id="arp"
                checked={isArpeggiatorOn}
                onCheckedChange={(checked) =>
                  setIsArpeggiatorOn(
                    checked === 'indeterminate' ? false : checked,
                  )
                }
              />
              <label htmlFor="arp" className="text-black font-bold">
                Arpeggiator
              </label>
            </div>
            <div className="flex items-center gap-4">
              <Checkbox
                id="chords"
                checked={isChordsOn}
                onCheckedChange={(checked) =>
                  setIsChordsOn(checked === 'indeterminate' ? false : checked)
                }
              />
              <label htmlFor="chords" className="text-black font-bold">
                Chords
              </label>
            </div>
            <div className="flex items-center w-full justify-end gap-4">
              <label htmlFor="arp" className="text-black font-bold">
                Speed
              </label>
              <Slider
                defaultValue={[40]}
                min={10}
                max={500}
                step={10}
                onValueChange={(value) => setArpeggiatorSpeed(value[0])}
                value={[arpeggiatorSpeed]}
                className={cn('w-[40%]')}
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
);

Keyboard.displayName = 'Keyboard';

export default Keyboard;
