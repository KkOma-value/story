import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

// Enhanced Sun with corona effect
const Sun = () => {
    const meshRef = useRef<THREE.Mesh>(null);
    const coronaRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.003;
        }
        if (coronaRef.current) {
            coronaRef.current.rotation.y -= 0.002;
            // Subtle pulsing effect
            const scale = 1 + Math.sin(state.clock.getElapsedTime() * 0.5) * 0.05;
            coronaRef.current.scale.setScalar(scale);
        }
    });

    return (
        <group>
            {/* Main sun body */}
            <mesh ref={meshRef}>
                <sphereGeometry args={[1.2, 64, 64]} />
                <meshStandardMaterial
                    emissive="#fbbf24"
                    emissiveIntensity={3}
                    color="#f59e0b"
                    roughness={0.8}
                    toneMapped={false}
                />
            </mesh>

            {/* Corona/Glow layer */}
            <mesh ref={coronaRef}>
                <sphereGeometry args={[1.5, 32, 32]} />
                <meshBasicMaterial
                    color="#fbbf24"
                    transparent
                    opacity={0.3}
                    side={THREE.BackSide}
                />
            </mesh>

            {/* Outer glow */}
            <mesh>
                <sphereGeometry args={[1.8, 32, 32]} />
                <meshBasicMaterial
                    color="#f97316"
                    transparent
                    opacity={0.1}
                    side={THREE.BackSide}
                />
            </mesh>

            {/* Main light source */}
            <pointLight intensity={3} distance={25} decay={1.5} color="#fbbf24" />
            <pointLight position={[0, 0, 0]} intensity={1.5} distance={50} decay={2} color="#f97316" />
        </group>
    );
};

interface PlanetProps {
    radius: number;
    distance: number;
    speed: number;
    color: string;
    offset?: number;
    hasAtmosphere?: boolean;
    atmosphereColor?: string;
    hasRings?: boolean;
    metalness?: number;
    roughness?: number;
}

// Enhanced Planet with atmosphere and better materials
const Planet: React.FC<PlanetProps> = ({
    radius,
    distance,
    speed,
    color,
    offset = 0,
    hasAtmosphere = false,
    atmosphereColor,
    hasRings = false,
    metalness = 0.3,
    roughness = 0.8
}) => {
    const groupRef = useRef<THREE.Group>(null);
    const meshRef = useRef<THREE.Mesh>(null);
    const atmosphereRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.getElapsedTime() * speed + offset;
        }
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.015;
            meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.05;
        }
        if (atmosphereRef.current) {
            atmosphereRef.current.rotation.y -= 0.005;
        }
    });

    return (
        <group ref={groupRef}>
            <group position={[distance, 0, 0]}>
                {/* Main planet body */}
                <mesh ref={meshRef} castShadow receiveShadow>
                    <sphereGeometry args={[radius, 64, 64]} />
                    <meshStandardMaterial
                        color={color}
                        roughness={roughness}
                        metalness={metalness}
                        emissive={color}
                        emissiveIntensity={0.05}
                    />
                </mesh>

                {/* Atmosphere glow */}
                {hasAtmosphere && (
                    <mesh ref={atmosphereRef}>
                        <sphereGeometry args={[radius * 1.15, 32, 32]} />
                        <meshBasicMaterial
                            color={atmosphereColor || color}
                            transparent
                            opacity={0.2}
                            side={THREE.BackSide}
                            blending={THREE.AdditiveBlending}
                        />
                    </mesh>
                )}

                {/* Planet rings (like Saturn) */}
                {hasRings && (
                    <mesh rotation={[Math.PI / 2.5, 0, 0]}>
                        <ringGeometry args={[radius * 1.3, radius * 1.8, 64]} />
                        <meshStandardMaterial
                            color={color}
                            transparent
                            opacity={0.6}
                            side={THREE.DoubleSide}
                            roughness={0.9}
                        />
                    </mesh>
                )}

                {/* Subtle point light for planet glow */}
                <pointLight intensity={0.2} distance={radius * 3} color={color} />
            </group>

            {/* Subtle orbital path */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[distance - 0.01, distance + 0.01, 128]} />
                <meshBasicMaterial
                    color={color}
                    opacity={0.08}
                    transparent
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    );
};

// Space dust/particles for depth
const SpaceDust = () => {
    const count = 300;

    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            // Random positions in a sphere around the solar system
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const r = 15 + Math.random() * 20;

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);

            // Warm dust colors
            const colorChoice = Math.random();
            if (colorChoice > 0.7) {
                colors[i * 3] = 0.9;     // R
                colors[i * 3 + 1] = 0.7; // G
                colors[i * 3 + 2] = 0.4; // B
            } else {
                colors[i * 3] = 0.8;
                colors[i * 3 + 1] = 0.8;
                colors[i * 3 + 2] = 0.9;
            }
        }

        return { positions, colors };
    }, []);

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={particles.positions}
                    itemSize={3}
                    args={[particles.positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={count}
                    array={particles.colors}
                    itemSize={3}
                    args={[particles.colors, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.08}
                vertexColors
                transparent
                opacity={0.6}
                sizeAttenuation={true}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
};

export const SolarSystem: React.FC = () => {
    return (
        <group rotation={[0.15, 0, 0.05]}>
            {/* Enhanced ambient lighting */}
            <ambientLight intensity={0.15} color="#4a5568" />

            {/* Distant stars */}
            <Stars
                radius={120}
                depth={80}
                count={8000}
                factor={5}
                saturation={0}
                fade
                speed={0.5}
            />

            {/* Space dust for depth */}
            <SpaceDust />

            {/* The Sun */}
            <Sun />

            {/* Inner rocky planets */}
            <Planet
                radius={0.15}
                distance={2.5}
                speed={0.8}
                color="#8b7355"
                offset={0}
                roughness={0.9}
                metalness={0.1}
            /> {/* Mercury - rocky */}

            <Planet
                radius={0.25}
                distance={3.5}
                speed={0.6}
                color="#e8a87c"
                offset={1.5}
                hasAtmosphere={true}
                atmosphereColor="#f4c095"
                roughness={0.7}
                metalness={0.2}
            /> {/* Venus - cloudy */}

            <Planet
                radius={0.28}
                distance={4.8}
                speed={0.5}
                color="#3b82f6"
                offset={3}
                hasAtmosphere={true}
                atmosphereColor="#60a5fa"
                roughness={0.6}
                metalness={0.4}
            /> {/* Earth - blue water world */}

            <Planet
                radius={0.2}
                distance={6}
                speed={0.4}
                color="#dc2626"
                offset={4.2}
                hasAtmosphere={true}
                atmosphereColor="#ef4444"
                roughness={0.85}
                metalness={0.15}
            /> {/* Mars - red desert */}

            {/* Gas giants */}
            <Planet
                radius={0.55}
                distance={8.5}
                speed={0.25}
                color="#d97706"
                offset={2}
                hasAtmosphere={true}
                atmosphereColor="#f59e0b"
                roughness={0.4}
                metalness={0.6}
            /> {/* Jupiter - gas giant */}

            <Planet
                radius={0.48}
                distance={11}
                speed={0.18}
                color="#fbbf24"
                offset={5.5}
                hasAtmosphere={true}
                atmosphereColor="#fcd34d"
                hasRings={true}
                roughness={0.5}
                metalness={0.5}
            /> {/* Saturn - ringed gas giant */}

            {/* Outer ice giants */}
            <Planet
                radius={0.35}
                distance={13.5}
                speed={0.12}
                color="#06b6d4"
                offset={1}
                hasAtmosphere={true}
                atmosphereColor="#22d3ee"
                roughness={0.3}
                metalness={0.7}
            /> {/* Uranus - ice giant */}

            <Planet
                radius={0.33}
                distance={15.5}
                speed={0.09}
                color="#3730a3"
                offset={3.8}
                hasAtmosphere={true}
                atmosphereColor="#6366f1"
                roughness={0.35}
                metalness={0.65}
            /> {/* Neptune - deep blue ice giant */}
        </group>
    );
};
