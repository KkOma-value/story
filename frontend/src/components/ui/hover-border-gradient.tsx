"use client";
import React from "react";
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
    } & React.HTMLAttributes<HTMLElement> & React.ButtonHTMLAttributes<HTMLButtonElement>
>) {
    const content = (
        <>
            <div
                className="absolute inset-0 z-[1] rounded-md"
                style={{
                    background: `conic-gradient(from ${clockwise ? "0deg" : "360deg"} at 50% 50%, transparent 0%, #D4AF37 50%, transparent 100%)`,
                    animation: `hbg-spin ${duration}s linear infinite ${clockwise ? "" : "reverse"}`,
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
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes hbg-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
        </>
    );

    return React.createElement(
        Tag,
        {
            className: cn(
                "relative flex rounded-md p-[1px] overflow-hidden bg-dark-paper",
                containerClassName
            ),
            ...props,
        },
        content
    );
}
