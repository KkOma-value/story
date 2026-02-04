"use client";
import { cn } from "@/lib/utils";
import React from "react";

export const AuroraBackground = ({
    className,
    children,
    showRadialGradient = true,
    ...props
}: {
    className?: string;
    children?: React.ReactNode;
    showRadialGradient?: boolean;
}) => {
    return (
        <main>
            <div
                className={cn(
                    "relative flex flex-col h-[100vh] items-center justify-center bg-dark text-white transition-bg",
                    className
                )}
                {...props}
            >
                <div className="absolute inset-0 overflow-hidden">
                    <div
                        className={cn(
                            `
              [--white-gradient:repeating-linear-gradient(100deg,#D4AF37_0%,#D4AF37_7%,transparent_10%,transparent_12%,#D4AF37_16%)]
              [--dark-gradient:repeating-linear-gradient(100deg,#0A0A0A_0%,#0A0A0A_7%,transparent_10%,transparent_12%,#0A0A0A_16%)]
              [--aurora:repeating-linear-gradient(100deg,#D4AF37_10%,#B7950B_15%,#F4D03F_20%,#D4AF37_25%,#B7950B_30%)]
              [background-image:var(--white-gradient),var(--aurora)]
              [background-size:300%,_200%]
              [background-position:50%_50%,50%_50%]
              filter blur-[10px] invert
              after:content-[""] after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora)] 
              after:[background-size:200%,_100%] 
              after:animate-aurora after:[background-attachment:fixed] after:mix-blend-difference
              pointer-events-none
              absolute -inset-[10px] opacity-30 will-change-transform`,

                            showRadialGradient &&
                            `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)]`
                        )}
                    ></div>
                </div>
                {children}
            </div>
        </main>
    );
};
