"use client"
import useIsDark from '@/components/useIsDark'
import LiquidEther from './LiquidEther'

// LiquidEther's published types don't declare colors/color2 – cast to any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LiquidEtherAny = LiquidEther as any

export default function DarkBackground() {
  const isDark = useIsDark()

  // Use LiquidEther for both light and dark modes. In light mode we place
  // a white background behind the transparent canvas so the page remains
  // visually light while preserving the animation colors.
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div
        className="absolute inset-0"
        style={{ background: isDark ? '#000000' : '#ffffff' }}
      />

      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <LiquidEtherAny
          colors={[ '#5227FF', '#FF9FFC', '#B19EEF' ]}
          mouseForce={20}
          cursorSize={100}
          isViscous={false}
          viscous={30}
          iterationsViscous={16}
          iterationsPoisson={16}
          resolution={0.35}
          isBounce={false}
          autoDemo={false}
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={800}
          autoRampDuration={0.6}
          color0="#5227FF"
          color1="#FF9FFC"
          color2="#B19EEF"
        />
      </div>
    </div>
  )
}

