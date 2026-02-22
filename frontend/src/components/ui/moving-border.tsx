"use client";
import {
    motion,
    useAnimationFrame,
    useMotionTemplate,
    useMotionValue,
    useTransform,
} from "framer-motion";
import React, { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface MovingBorderProps {
    children: React.ReactNode;
    duration?: number;
    rx?: string;
    ry?: string;
}

export function MovingBorder({
    children,
    duration = 2000,
    rx,
    ry,
}: MovingBorderProps) {
    const pathRef = useRef<SVGRectElement>(null);
    const progress = useMotionValue<number>(0);
    const lengthRef = useRef<number>(0);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const updateLength = () => {
            if (!pathRef.current) return;
            try {
                const bbox = pathRef.current.getBBox();
                if (bbox.width > 0 && bbox.height > 0) {
                    const total = pathRef.current.getTotalLength();
                    if (total > 0) {
                        lengthRef.current = total;
                        setReady(true);
                    }
                }
            } catch {
                // SVG not yet laid out
            }
        };

        const raf = requestAnimationFrame(updateLength);

        const observer = new ResizeObserver(updateLength);
        const container = pathRef.current?.parentElement?.parentElement;
        if (container) observer.observe(container);

        return () => {
            cancelAnimationFrame(raf);
            observer.disconnect();
        };
    }, []);

    useAnimationFrame((time) => {
        const len = lengthRef.current;
        if (len > 0) {
            const pxPerMillisecond = len / duration;
            progress.set((time * pxPerMillisecond) % len);
        }
    });

    const x = useTransform(progress, (val) => {
        const len = lengthRef.current;
        if (!pathRef.current || len <= 0) return 0;
        try {
            return pathRef.current.getPointAtLength(val % len).x;
        } catch {
            return 0;
        }
    });

    const y = useTransform(progress, (val) => {
        const len = lengthRef.current;
        if (!pathRef.current || len <= 0) return 0;
        try {
            return pathRef.current.getPointAtLength(val % len).y;
        } catch {
            return 0;
        }
    });

    const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`;

    return (
        <>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
                className="absolute h-full w-full"
            >
                <rect
                    fill="none"
                    width="100%"
                    height="100%"
                    rx={rx}
                    ry={ry}
                    ref={pathRef}
                />
            </svg>
            {ready && (
                <motion.div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        display: "inline-block",
                        transform,
                    }}
                >
                    <div className="h-2 w-2 rounded-full bg-accent shadow-glow-gold" />
                </motion.div>
            )}
            {children}
        </>
    );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    borderRadius?: string;
    children: React.ReactNode;
    as?: React.ElementType;
    containerClassName?: string;
    borderClassName?: string;
    duration?: number;
    className?: string;
}

export function Button({
    borderRadius = "1px",
    children,
    as: Component = "button",
    containerClassName,
    borderClassName,
    duration,
    className,
    ...otherProps
}: ButtonProps) {
    const content = (
        <>
            <div
                className="absolute inset-0"
                style={{ borderRadius: `calc(${borderRadius} * 0.96)` }}
            >
                <MovingBorder duration={duration} rx="30%" ry="30%">
                    <div
                        className={cn(
                            "h-20 w-20 opacity-[0.8] bg-accent",
                            borderClassName
                        )}
                    />
                </MovingBorder>
            </div>

            <div
                className={cn(
                    "relative bg-dark border border-dark-border backdrop-blur-xl text-white flex items-center justify-center w-full h-full font-body antialiased",
                    className
                )}
                style={{
                    borderRadius: `calc(${borderRadius} * 0.96)`,
                }}
            >
                {children}
            </div>
        </>
    );

    return React.createElement(
        Component,
        {
            className: cn(
                "bg-transparent relative text-xl h-12 w-40 p-[1px] overflow-hidden",
                containerClassName
            ),
            style: {
                borderRadius: borderRadius,
            },
            ...otherProps,
        },
        content
    );
}
