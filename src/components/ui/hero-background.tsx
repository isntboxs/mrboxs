import { cn } from '@/lib/utils'

export const HeroBackground = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        'relative min-h-screen w-full overflow-hidden bg-slate-950',
        className,
      )}
    >
      {/* Radial Gradient for the fade effect */}
      <div className="absolute inset-0 bg-slate-950 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://tailwindcss.com/_next/static/media/hero-dark.9a2e557b.jpg')] bg-cover bg-center opacity-20" />

      {/* We can try to recreate the grid purely with CSS if an image isn't desired, but the authentic Tailwind feel often uses their specific assets or very complex SVG. 
          Let's try a CSS-only approximation first as requested by the "create this effect" prompt. 
      */}

      {/* Diagonal Grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(
                315deg,
                #fff 0px,
                #fff 1px,
                transparent 1px,
                transparent 10px
              )`,
        }}
      />

      {/* Spotlights / Beams */}
      <div className="absolute top-[-10%] -left-[10%] h-[500px] w-[500px] rounded-full bg-cyan-500/20 mix-blend-screen blur-[120px]" />
      <div className="absolute top-[20%] -right-[10%] h-[500px] w-[500px] rounded-full bg-purple-500/20 mix-blend-screen blur-[120px]" />
      <div className="absolute bottom-0 left-[20%] h-[400px] w-[400px] rounded-full bg-indigo-500/20 mix-blend-screen blur-[100px]" />

      {/* Content Slot */}
      <div className="relative z-10 h-full">
        {/* Children would go here if this was a wrapper, but for now it's just a background component */}
      </div>
    </div>
  )
}
