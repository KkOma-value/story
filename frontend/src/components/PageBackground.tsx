import React from 'react';
import { AuroraBackground } from './ui/aurora-background';
import { GridAndDotBackgrounds } from './ui/grid-dot-backgrounds';
import { SparklesCore } from './ui/sparkles';

interface PageBackgroundProps {
    children: React.ReactNode;
    variant?: 'aurora' | 'grid' | 'sparkles' | 'none';
    className?: string;
}

export const PageBackground: React.FC<PageBackgroundProps> = ({
    children,
    variant = 'grid',
    className = ''
}) => {
    switch (variant) {
        case 'aurora':
            return (
                <AuroraBackground className={className}>
                    <div className="relative z-10 w-full">
                        {children}
                    </div>
                </AuroraBackground>
            );

        case 'sparkles':
            return (
                <div className={`relative min-h-screen bg-dark ${className}`}>
                    <div className="absolute inset-0 w-full h-full">
                        <SparklesCore
                            background="transparent"
                            minSize={0.4}
                            maxSize={1.4}
                            particleDensity={50}
                            className="w-full h-full"
                            particleColor="#D4AF37"
                        />
                    </div>
                    <div className="relative z-10">
                        {children}
                    </div>
                </div>
            );

        case 'grid':
            return (
                <GridAndDotBackgrounds className={className}>
                    <div className="relative z-10 w-full">
                        {children}
                    </div>
                </GridAndDotBackgrounds>
            );

        case 'none':
        default:
            return <>{children}</>;
    }
};
