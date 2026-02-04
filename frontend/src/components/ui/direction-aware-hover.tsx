"use client";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const DirectionAwareHover = ({
    children,
    childrenClassName,
    imageUrl,
    className,
}: {
    children: React.ReactNode | React.ReactNode[];
    childrenClassName?: string;
    imageUrl: string;
    className?: string;
}) => {
    const ref = useRef<HTMLDivElement>(null);

    const [direction, setDirection] = useState<
        "top" | "bottom" | "left" | "right" | string
    >("left");

    const handleMouseEnter = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
        if (!ref.current) return;

        const direction = getDirection(event, ref.current);
        switch (direction) {
            case 0:
                setDirection("top");
                break;
            case 1:
                setDirection("right");
                break;
            case 2:
                setDirection("bottom");
                break;
            case 3:
                setDirection("left");
                break;
            default:
                setDirection("left");
                break;
        }
    };

    const getDirection = (
        ev: React.MouseEvent<HTMLDivElement, MouseEvent>,
        obj: HTMLDivElement
    ) => {
        const { width: w, height: h, left, top } = obj.getBoundingClientRect();
        const x = ev.clientX - left - (w / 2) * (w > h ? h / w : 1);
        const y = ev.clientY - top - (h / 2) * (h > w ? w / h : 1);
        const d = Math.round(Math.atan2(y, x) / 1.57079633 + 5) % 4;
        return d;
    };

    return (
        <motion.div
            onMouseEnter={handleMouseEnter}
            ref={ref}
            className={cn(
                "md:h-96 w-full h-60 bg-transparent rounded-lg overflow-hidden group/card relative",
                className
            )}
        >
            <div
                className="relative h-full w-full"
                style={{
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <motion.div
                    className="group-hover/card:block hidden absolute inset-0 w-full h-full bg-black/40 z-10 transition duration-500"
                    initial="initial"
                    whileHover={direction}
                    exit="exit"
                >
                    <motion.div className="relative h-full w-full">
                        <motion.div
                            variants={{
                                initial: {
                                    x: 0,
                                },
                                exit: {
                                    x: 0,
                                    y: 0,
                                },
                                top: {
                                    y: 20,
                                },
                                bottom: {
                                    y: -20,
                                },
                                left: {
                                    x: 20,
                                },
                                right: {
                                    x: -20,
                                },
                            }}
                            transition={{
                                duration: 0.2,
                                ease: "easeOut",
                            }}
                            className={cn(
                                "text-white absolute bottom-4 left-4 z-20",
                                childrenClassName
                            )}
                        >
                            {children}
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>
        </motion.div>
    );
};
