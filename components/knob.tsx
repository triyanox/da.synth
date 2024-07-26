import React, { forwardRef, useCallback, useMemo } from 'react';
import { useDrag } from '@use-gesture/react';
import { cn } from '@/lib/utils';

interface KnobControlProps {
  param?: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  orientation?: 'horizontal' | 'vertical';
  dragSensitivity?: number;
  includeInTabOrder?: boolean;
  valueFormatter?: (value: number) => string;
  integerSteps?: boolean;
  className?: string;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);
const mapTo01 = (value: number, min: number, max: number) =>
  (value - min) / (max - min);
const mapFrom01 = (value: number, min: number, max: number) =>
  value * (max - min) + min;

export const KnobControl = forwardRef<HTMLDivElement, KnobControlProps>(
  (
    {
      param,
      value,
      min,
      max,
      onChange,
      orientation = 'vertical',
      dragSensitivity = 0.01,
      includeInTabOrder = false,
      valueFormatter,
      integerSteps = false,
      className,
    },
    ref,
  ) => {
    const normalizedValue = useMemo(
      () => mapTo01(value, min, max),
      [value, min, max],
    );
    const rotation = useMemo(
      () => normalizedValue * 270 - 135,
      [normalizedValue],
    );

    const defaultFormatter = useCallback(
      (v: number) => (integerSteps ? v.toFixed(0) : v.toFixed(2)),
      [integerSteps],
    );

    const finalValueFormatter = valueFormatter || defaultFormatter;

    const handleDrag = useCallback(
      ({ delta }: { delta: [number, number] }) => {
        const diff = orientation === 'horizontal' ? delta[0] : -delta[1];
        const newNormalizedValue = clamp(
          normalizedValue + diff * dragSensitivity,
          0,
          1,
        );
        let newValue = mapFrom01(newNormalizedValue, min, max);
        if (integerSteps) {
          newValue = Math.round(newValue);
        }
        onChange(newValue);
      },
      [
        orientation,
        normalizedValue,
        dragSensitivity,
        min,
        max,
        onChange,
        integerSteps,
      ],
    );

    const bindDrag = useDrag(handleDrag, {
      pointer: { touch: true },
    });

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        let step = integerSteps ? 1 : (max - min) / 100;
        let newValue = value;

        switch (e.key) {
          case 'ArrowUp':
          case 'ArrowRight':
            newValue = Math.min(value + step, max);
            break;
          case 'ArrowDown':
          case 'ArrowLeft':
            newValue = Math.max(value - step, min);
            break;
        }

        if (newValue !== value) {
          onChange(integerSteps ? Math.round(newValue) : newValue);
        }
      },
      [value, min, max, onChange, integerSteps],
    );

    return (
      <div className="flex flex-col items-center">
        <div
          ref={ref}
          {...bindDrag()}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={finalValueFormatter(value)}
          aria-label={`${param} control`}
          aria-orientation={orientation}
          tabIndex={includeInTabOrder ? 0 : -1}
          onKeyDown={handleKeyDown}
          className={cn(
            'w-[4.5rem] h-[4.5rem] cursor-grab touch-none relative focus:outline-none',
            className,
          )}
          style={{ touchAction: 'none' }}
        >
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full filter drop-shadow-lg"
          >
            <defs>
              <linearGradient
                id="knobGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#fdba74" />
                <stop offset="100%" stopColor="#fb923c" />
              </linearGradient>
              <filter id="innerShadow">
                <feOffset dx="0" dy="2" />
                <feGaussianBlur stdDeviation="2" result="offset-blur" />
                <feComposite
                  operator="out"
                  in="SourceGraphic"
                  in2="offset-blur"
                  result="inverse"
                />
                <feFlood floodColor="black" floodOpacity="0.3" result="color" />
                <feComposite
                  operator="in"
                  in="color"
                  in2="inverse"
                  result="shadow"
                />
                <feComposite operator="over" in="shadow" in2="SourceGraphic" />
              </filter>
            </defs>
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="url(#knobGradient)"
              filter="url(#innerShadow)"
              stroke="#000000"
              strokeWidth="2"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="#fb923c"
              stroke="#000000"
              strokeWidth="2"
            />
            <line
              x1="50"
              y1="50"
              x2="50"
              y2="15"
              stroke="#000000"
              strokeWidth="4"
              strokeLinecap="round"
              transform={`rotate(${rotation}, 50, 50)`}
            />
            <circle cx="50" cy="50" r="3" fill="#000000" />
          </svg>
        </div>
        <div className="mt-2 text-xs font-mono font-bold uppercase tracking-wider text-orange-500">
          {param}
        </div>
        <div className="text-sm font-bold text-black font-mono">
          {finalValueFormatter(value)}
        </div>
      </div>
    );
  },
);

KnobControl.displayName = 'KnobControl';
