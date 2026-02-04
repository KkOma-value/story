"use client";
import { useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const BackgroundBeams = ({ className }: { className?: string }) => {
    const beamsRef = useRef<HTMLDivElement>(null);

    return (
        <div
            ref={beamsRef}
            className={cn(
                "absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden",
                className
            )}
        >
            <svg
                className="absolute inset-0 h-full w-full"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#D4AF37", stopOpacity: 0 }} />
                        <stop offset="50%" style={{ stopColor: "#D4AF37", stopOpacity: 0.3 }} />
                        <stop offset="100%" style={{ stopColor: "#D4AF37", stopOpacity: 0 }} />
                    </linearGradient>
                </defs>
                {[...Array(8)].map((_, i) => (
                    <motion.path
                        key={i}
                        d={`M${50 + i * 100} 0 L${50 + i * 100} ${800}`}
                        stroke="url(#grad1)"
                        strokeWidth="2"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{
                            pathLength: [0, 1, 0],
                            opacity: [0, 0.8, 0],
                        }}
                        transition={{
                            duration: 4 + Math.random() * 3,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                            delay: i * 0.5,
                        }}
                    />
                ))}
            </svg>
            <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent" />
        </div>
    );
};
