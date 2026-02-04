"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function HoverBorderGradient({
    children,
    containerClassName,
    className,
    as: Tag = "button",
    duration = 1,
    clockwise = true,
    ...props
}: React.PropsWithChildren<
    {
        as?: React.ElementType;
        containerClassName?: string;
        className?: string;
        duration?: number;
        clockwise?: boolean;
    } & React.HTMLAttributes<HTMLElement>
>) {
    return (
        <Tag
            className={cn(
                "relative flex rounded-md p-[1px] overflow-hidden bg-dark-paper",
                containerClassName
            )}
            {...props}
        >
            <div
                className="absolute inset-0 z-[1] rounded-md"
                style={{
                    background: `conic-gradient(from ${clockwise ? "0deg" : "360deg"} at 50% 50%, transparent 0%, #D4AF37 50%, transparent 100%)`,
                    animation: `spin ${duration}s linear infinite ${clockwise ? "" : "reverse"
                        }`,
                }}
            />
            <div
                className={cn(
                    "relative z-[2] flex w-full h-full items-center justify-center rounded-md bg-dark-paper",
                    className
                )}
            >
                {children}
            </div>
            <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
        </Tag>
    );
}
