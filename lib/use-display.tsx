import { useCallback, useEffect, useState } from 'react';

const useDisplayScaling = () => {
  const [scale, setScale] = useState(1);

  const updateScale = useCallback(() => {
    const scaleFactor = Math.min(
      window.innerWidth / 1920,
      window.innerHeight / 1080,
    );

    setScale(scaleFactor);

    document.documentElement.style.setProperty(
      '--scale-factor',
      scaleFactor.toString(),
    );
  }, []);

  useEffect(() => {
    updateScale();

    window.addEventListener('resize', updateScale);
    window.addEventListener('orientationchange', updateScale);

    const intervalId = setInterval(() => {
      updateScale();
    }, 250);

    return () => {
      window.removeEventListener('resize', updateScale);
      window.removeEventListener('orientationchange', updateScale);
      clearInterval(intervalId);
    };
  }, [updateScale]);

  return scale;
};

export default useDisplayScaling;
