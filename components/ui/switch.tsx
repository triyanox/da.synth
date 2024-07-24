import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';

import { cn } from '@/lib/utils';

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      'peer inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-none border-2 border-orange-400 bg-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-50',
      "before:content-['OFF'] before:absolute before:left-1 before:top-1/2 before:-translate-y-1/2 before:text-[8px] before:font-bold before:text-orange-400",
      "after:content-['ON'] after:absolute after:right-1 after:top-1/2 after:-translate-y-1/2 after:text-[8px] after:font-bold after:text-black",
      'data-[state=checked]:bg-orange-400 data-[state=unchecked]:bg-black',
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        'pointer-events-none block h-7 w-7 rounded-none bg-orange-400 shadow-lg ring-0 transition-transform',
        'data-[state=checked]:translate-x-[24px] data-[state=unchecked]:translate-x-0',
        'data-[state=checked]:bg-black data-[state=unchecked]:bg-orange-400',
        "after:content-[''] after:block after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:w-4 after:h-4",
        'data-[state=checked]:after:bg-orange-400 data-[state=unchecked]:after:bg-black',
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
