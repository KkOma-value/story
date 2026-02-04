"use client";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CanvasRevealEffectProps {
    animationSpeed?: number;
    opacities?: number[];
    colors?: number[][];
    containerClassName?: string;
    dotSize?: number;
}

export const CanvasRevealEffect = ({
    animationSpeed = 0.4,
    opacities = [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1],
    colors = [[212, 175, 55]], // Gold color
    containerClassName,
    dotSize = 3,
}: CanvasRevealEffectProps) => {
    return (
        <div className={cn("h-full relative bg-dark-paper w-full", containerClassName)}>
            <div className="h-full w-full">
                <DotMatrix
                    colors={colors}
                    dotSize={dotSize}
                    opacities={opacities}
                    animationSpeed={animationSpeed}
                />
            </div>
        </div>
    );
};

interface DotMatrixProps {
    colors?: number[][];
    opacities?: number[];
    dotSize?: number;
    animationSpeed?: number;
}

const DotMatrix = ({
    colors = [[212, 175, 55]],
    opacities = [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1],
    dotSize = 3,
    animationSpeed = 0.4,
}: DotMatrixProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resizeCanvas = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        const drawDots = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const spacing = 20;
            for (let x = 0; x < canvas.width; x += spacing) {
                for (let y = 0; y < canvas.height; y += spacing) {
                    const opacity = opacities[Math.floor(Math.random() * opacities.length)];
                    const color = colors[0];
                    ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity})`;
                    ctx.beginPath();
                    ctx.arc(x, y, dotSize, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        };

        drawDots();
        setIsAnimating(true);

        return () => {
            window.removeEventListener("resize", resizeCanvas);
        };
    }, [colors, opacities, dotSize]);

    return (
        <canvas
            ref={canvasRef}
            className="h-full w-full"
        />
    );
};

export const Card = ({
    title,
    icon,
    children,
    className,
}: {
    title?: string;
    icon?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
}) => {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={cn(
                "border border-dark-border group/canvas-card flex items-center justify-center bg-dark-paper relative h-[30rem] rounded-md p-4 overflow-hidden",
                className
            )}
        >
            <Icon className="absolute h-6 w-6 -top-3 -left-3 text-accent" />
            <Icon className="absolute h-6 w-6 -bottom-3 -left-3 text-accent" />
            <Icon className="absolute h-6 w-6 -top-3 -right-3 text-accent" />
            <Icon className="absolute h-6 w-6 -bottom-3 -right-3 text-accent" />

            <AnimatePresence>
                {hovered && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full w-full absolute inset-0"
                    >
                        <CanvasRevealEffect
                            animationSpeed={3}
                            containerClassName="bg-dark-paper"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="relative z-20">
                <div className="text-center group-hover/canvas-card:-translate-y-4 group-hover/canvas-card:opacity-0 transition duration-200 w-full mx-auto flex items-center justify-center">
                    {icon}
                </div>
                <h2 className="text-text-gold opacity-0 group-hover/canvas-card:opacity-100 relative z-10 text-center text-3xl font-bold group-hover/canvas-card:text-white group-hover/canvas-card:-translate-y-2 transition duration-200">
                    {title}
                </h2>
                {children}
            </div>
        </div>
    );
};

const Icon = ({ className }: { className?: string }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className={className}
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
        </svg>
    );
};
