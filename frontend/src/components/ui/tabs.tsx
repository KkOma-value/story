"use client";
import { cn } from "@/lib/utils";

export const Tabs = ({
    tabs: propTabs,
    containerClassName,
    activeTabClassName,
    tabClassName,
    contentClassName,
}: {
    tabs: Tab[];
    containerClassName?: string;
    activeTabClassName?: string;
    tabClassName?: string;
    contentClassName?: string;
}) => {
    const [active, setActive] = useState<Tab>(propTabs[0]);

    return (
        <>
            <div
                className={cn(
                    "flex flex-row items-center justify-start [perspective:1000px] relative overflow-auto sm:overflow-visible no-visible-scrollbar max-w-full w-full border-b border-dark-border",
                    containerClassName
                )}
            >
                {propTabs.map((tab, idx) => (
                    <button
                        key={tab.title}
                        onClick={() => setActive(tab)}
                        className={cn(
                            "relative px-4 py-2 rounded-t-md font-body",
                            tabClassName
                        )}
                        style={{
                            transformStyle: "preserve-3d",
                        }}
                    >
                        {active.value === tab.value && (
                            <motion.div
                                layoutId="clickedbutton"
                                transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                                className={cn(
                                    "absolute inset-0 bg-dark-hover rounded-t-md border-t border-x border-dark-border",
                                    activeTabClassName
                                )}
                            />
                        )}

                        <span
                            className={cn(
                                "relative block text-text-secondary",
                                active.value === tab.value && "text-accent"
                            )}
                        >
                            {tab.title}
                        </span>
                    </button>
                ))}
            </div>
            <FadeInDiv
                tabs={propTabs}
                active={active}
                key={active.value}
                className={cn("mt-8", contentClassName)}
            />
        </>
    );
};

export const FadeInDiv = ({
    className,
    tabs,
    active,
}: {
    className?: string;
    key?: string;
    tabs: Tab[];
    active: Tab;
}) => {
    return (
        <div className="relative w-full h-full">
            {tabs.map((tab, idx) => (
                <motion.div
                    key={tab.value}
                    layoutId={tab.value}
                    style={{
                        scale: active.value === tab.value ? 1 : 0.9,
                        opacity: active.value === tab.value ? 1 : 0,
                        display: active.value === tab.value ? "block" : "none",
                    }}
                    animate={{
                        scale: active.value === tab.value ? 1 : 0.9,
                        opacity: active.value === tab.value ? 1 : 0,
                    }}
                    className={cn("w-full h-full", className)}
                >
                    {tab.content}
                </motion.div>
            ))}
        </div>
    );
};

export type Tab = {
    title: string;
    value: string;
    content?: string | React.ReactNode | unknown;
};

import { useState } from "react";
import { motion } from "framer-motion";
