import React from 'react';

interface ChartStylesProps {
    lines: Array<{ color: string }>;
}

/**
 * Injects a light, per-line highlight filter scoped to `.glowing-chart` so
 * chart strokes read as subtly lit rather than neon-glowing. Kept minimal on
 * purpose — no background/shadow layering here, that lives on the wrapping
 * element in ForexCryptoChart.tsx.
 */
export const ChartStyles: React.FC<ChartStylesProps> = ({ lines }) => {
    const lineStyles = lines
        .map(
            (line) => `
      .glowing-chart .recharts-line-curve[stroke="${line.color}"] {
        filter: drop-shadow(0 0 2px ${line.color}33);
      }
    `
        )
        .join("");

    return (
        <style>{`
      .glowing-chart .recharts-line-curve {
        stroke-width: 2.5;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      ${lineStyles}
      .glowing-chart .recharts-area-curve {
        stroke-width: 2.5;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
    `}</style>
    );
};
