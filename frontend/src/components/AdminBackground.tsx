import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { SolarSystem } from './SolarSystem';

const BackgroundScene = () => {
    return (
        <>
            <fog attach="fog" args={['#0f172a', 10, 40]} />
            <ambientLight intensity={0.5} />

            <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
                <SolarSystem />
            </Float>
        </>
    );
};

export const AdminBackground: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <div className={`fixed inset-0 -z-10 bg-slate-900 ${className}`}>
            <Canvas camera={{ position: [0, 5, 20], fov: 40 }}>
                <BackgroundScene />
            </Canvas>
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-slate-900/10 to-slate-900/80 pointer-events-none" />
        </div>
    );
};
