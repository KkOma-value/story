"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const CardStack = ({
    items,
    offset,
    scaleFactor,
}: {
    items: Card[];
    offset?: number;
    scaleFactor?: number;
}) => {
    const CARD_OFFSET = offset || 10;
    const SCALE_FACTOR = scaleFactor || 0.06;
    const [cards, setCards] = useState<Card[]>(items);

    useEffect(() => {
        const interval = setInterval(() => {
            setCards((prevCards: Card[]) => {
                const newArray = [...prevCards];
                newArray.unshift(newArray.pop()!);
                return newArray;
            });
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative h-60 w-full">
            {cards.map((card, index) => {
                return (
                    <motion.div
                        key={card.id}
                        className="absolute bg-dark-paper h-60 w-full rounded-md p-4 shadow-elevation-2 border border-dark-border flex flex-col justify-between"
                        style={{
                            transformOrigin: "top center",
                        }}
                        animate={{
                            top: index * -CARD_OFFSET,
                            scale: 1 - index * SCALE_FACTOR,
                            zIndex: cards.length - index,
                        }}
                    >
                        <div className="font-body text-text-primary">{card.content}</div>
                        <div>
                            <p className="text-text-gold font-medium">{card.name}</p>
                            <p className="text-text-muted text-sm">{card.designation}</p>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export type Card = {
    id: number;
    name: string;
    designation: string;
    content: React.ReactNode;
};
