import React, { useEffect, useState } from 'react';

const PerformanceMonitor: React.FC = () => {
  const [fps, setFps] = useState(0);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();

    const updateFps = () => {
      const now = performance.now();
      frameCount++;

      if (now - lastTime > 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }

      requestAnimationFrame(updateFps);
    };

    const animationId = requestAnimationFrame(updateFps);

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="fixed top-0 right-0 bg-black text-white p-2 text-sm">
      FPS {fps}
    </div>
  );
};

export default PerformanceMonitor;
