"use client";
import { useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const GridAndDotBackgrounds = ({ className, children }: { className?: string; children?: React.ReactNode }) => {
    return (
        <div className={cn("h-[50rem] w-full bg-dark bg-grid-white/[0.02] relative flex items-center justify-center", className)}>
            {/* Radial gradient for the container to give a faded look */}
            <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-dark [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
            {children}
        </div>
    );
};
