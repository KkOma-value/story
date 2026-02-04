import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { SolarSystem } from './SolarSystem';

// Check WebGL support
const isWebGLAvailable = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
};

const Scene = () => {
  return (
    <>
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
        <SolarSystem />
      </Float>
    </>
  );
};

const Hero3DScene = () => {
  const [hasError, setHasError] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check WebGL support
    if (!isWebGLAvailable()) {
      console.warn('WebGL is not supported');
      setHasError(true);
      return;
    }
    setIsReady(true);
  }, []);

  if (hasError || !isReady) {
    // Fallback gradient background
    return (
      <div
        className="absolute inset-0 z-0 bg-slate-900"
        style={{
          background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)'
        }}
      />
    );
  }

  return (
    <Canvas
      camera={{ position: [0, 5, 15], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      className="absolute inset-0 z-0 pointer-events-none"
      style={{ background: '#0f172a' }} // Deep slate background
    >
      <Scene />
    </Canvas>
  );
};

export default Hero3DScene;
