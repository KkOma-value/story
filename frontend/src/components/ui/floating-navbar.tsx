"use client";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimation, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

export const FloatingNav = ({
    navItems,
    className,
}: {
    navItems: {
        name: string;
        link: string;
        icon?: JSX.Element;
    }[];
    className?: string;
}) => {
    const [visible, setVisible] = useState(true);
    const [prevScrollPos, setPrevScrollPos] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollPos = window.scrollY;

            // Show navbar when scrolling up or at top
            if (currentScrollPos < prevScrollPos || currentScrollPos < 10) {
                setVisible(true);
            } else if (currentScrollPos > 100) {
                // Hide when scrolling down past 100px
                setVisible(false);
            }

            setPrevScrollPos(currentScrollPos);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [prevScrollPos]);

    return (
        <AnimatePresence mode="wait">
            <motion.div
                initial={{
                    opacity: 1,
                    y: 0,
                }}
                animate={{
                    y: visible ? 0 : -100,
                    opacity: visible ? 1 : 0,
                }}
                transition={{
                    duration: 0.2,
                }}
                className={cn(
                    "flex max-w-fit fixed top-10 inset-x-0 mx-auto border border-dark-border rounded-lg bg-dark-paper/80 backdrop-blur-md shadow-elevation-2 z-[5000] px-8 py-2 items-center justify-center space-x-4",
                    className
                )}
            >
                {navItems.map((navItem, idx) => (
                    <a
                        key={`link=${idx}`}
                        href={navItem.link}
                        className={cn(
                            "relative text-text-secondary hover:text-accent flex space-x-1 items-center transition duration-200"
                        )}
                    >
                        <span className="block sm:hidden">{navItem.icon}</span>
                        <span className="hidden sm:block text-sm font-body">{navItem.name}</span>
                    </a>
                ))}
                <button className="border text-sm font-medium relative border-dark-border text-text-primary px-4 py-1 rounded-lg hover:border-accent hover:text-accent transition duration-200">
                    <span>登录</span>
                    <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-accent to-transparent h-px" />
                </button>
            </motion.div>
        </AnimatePresence>
    );
};
