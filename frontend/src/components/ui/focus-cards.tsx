"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const FocusCards = ({ cards }: { cards: Card[] }) => {
    const [hovered, setHovered] = useState<number | null>(null);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto w-full">
            {cards.map((card, index) => (
                <Card
                    key={card.title}
                    card={card}
                    index={index}
                    hovered={hovered}
                    setHovered={setHovered}
                />
            ))}
        </div>
    );
};

interface Card {
    title: string;
    src: string;
    content?: React.ReactNode;
}

function Card({
    card,
    index,
    hovered,
    setHovered,
}: {
    card: Card;
    index: number;
    hovered: number | null;
    setHovered: React.Dispatch<React.SetStateAction<number | null>>;
}) {
    return (
        <div
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
            className={cn(
                "rounded-lg relative bg-dark-paper overflow-hidden h-60 md:h-96 w-full transition-all duration-300 ease-out border border-dark-border",
                hovered !== null && hovered !== index && "blur-sm scale-[0.98]"
            )}
        >
            <img
                src={card.src}
                alt={card.title}
                className="object-cover absolute inset-0 w-full h-full"
            />
            <div
                className={cn(
                    "absolute inset-0 bg-black/50 flex items-end py-8 px-4 transition-opacity duration-300",
                    hovered === index ? "opacity-100" : "opacity-0"
                )}
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                        opacity: hovered === index ? 1 : 0,
                        y: hovered === index ? 0 : 20,
                    }}
                    className="text-xl md:text-2xl font-bold text-white"
                >
                    {card.title}
                    {card.content && (
                        <div className="text-sm font-normal text-white/80 mt-2">
                            {card.content}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
