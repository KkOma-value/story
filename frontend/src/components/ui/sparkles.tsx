"use client";
import React, { useId, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SparklesProps {
    id?: string;
    className?: string;
    background?: string;
    minSize?: number;
    maxSize?: number;
    speed?: number;
    particleColor?: string;
    particleDensity?: number;
}

export const SparklesCore = (props: SparklesProps) => {
    const {
        id,
        className,
        background = "transparent",
        minSize = 1,
        maxSize = 3,
        speed = 1,
        particleColor = "#D4AF37",
        particleDensity = 100,
    } = props;

    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        setDimensions({ width: window.innerWidth, height: window.innerHeight });

        const handleResize = () => {
            setDimensions({ width: window.innerWidth, height: window.innerHeight });
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const particles = Array.from({ length: particleDensity }, (_, i) => ({
        id: i,
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        size: Math.random() * (maxSize - minSize) + minSize,
        duration: Math.random() * 20 + 10,
        delay: Math.random() * 10,
    }));

    return (
        <div className={cn("h-full w-full relative overflow-hidden", className)}>
            <svg
                className="h-full w-full"
                style={{ background }}
            >
                {particles.map((particle) => (
                    <motion.circle
                        key={particle.id}
                        cx={particle.x}
                        cy={particle.y}
                        r={particle.size}
                        fill={particleColor}
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0],
                        }}
                        transition={{
                            duration: particle.duration / speed,
                            repeat: Infinity,
                            delay: particle.delay / speed,
                        }}
                    />
                ))}
            </svg>
        </div>
    );
};
