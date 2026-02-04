"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function PlaceholdersAndVanishInput({
    placeholders,
    onChange,
    onSubmit,
    className,
}: {
    placeholders: string[];
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    className?: string;
}) {
    const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
    const [value, setValue] = useState("");
    const [animating, setAnimating] = useState(false);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const startAnimation = () => {
        intervalRef.current = setInterval(() => {
            setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
        }, 3000);
    };

    const handleVisibilityChange = () => {
        if (document.visibilityState !== "visible" && intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        } else if (document.visibilityState === "visible") {
            startAnimation();
        }
    };

    useEffect(() => {
        startAnimation();
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [placeholders]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setAnimating(true);
        onSubmit(e);
        setTimeout(() => {
            setAnimating(false);
            setValue("");
        }, 1500);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
        onChange(e);
    };

    return (
        <form
            className={cn(
                "w-full relative max-w-xl mx-auto bg-dark-paper h-12 rounded-md overflow-hidden shadow-elevation-1 border border-dark-border",
                className
            )}
            onSubmit={handleSubmit}
        >
            <input
                onChange={handleChange}
                value={value}
                type="text"
                className="w-full h-full pl-4 pr-20 text-sm sm:text-base bg-transparent text-text-primary focus:outline-none focus:ring-0 border-none"
                placeholder={placeholders[currentPlaceholder]}
            />
            <button
                disabled={!value}
                type="submit"
                className="absolute right-2 top-1/2 z-50 -translate-y-1/2 h-8 w-16 rounded-md disabled:bg-dark-hover bg-accent text-dark-paper font-medium text-sm disabled:cursor-not-allowed transition duration-200"
            >
                搜索
            </button>

            {animating && (
                <motion.div
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: 1, y: "-100%" }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="absolute inset-0 flex items-center justify-center text-xl text-text-gold font-bold bg-dark-paper z-40"
                >
                    {value}
                </motion.div>
            )}
        </form>
    );
}
