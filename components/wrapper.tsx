import useDisplayScaling from '@/lib/use-display';
import React from 'react';

const AppWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const scale = useDisplayScaling();

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: `${100 / scale}%`,
        height: `${100 / scale}%`,
        transition: 'transform 0.2s ease-in-out',
      }}
    >
      {children}
    </div>
  );
};

export default AppWrapper;
