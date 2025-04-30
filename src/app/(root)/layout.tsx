import { cn } from "@/lib/utils";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden">
      <main className="flex min-h-screen w-screen flex-col items-center justify-center">
        <div
          className={cn(
            "absolute inset-0",
            "[background-size:50px_50px]",
            "[background-image:radial-gradient(#d4d4d4_1px,transparent_1px)]",
            "dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]",
            "pointer-events-none -z-10 opacity-60 dark:opacity-30",
          )}
        />
        <div
          className={cn(
            "absolute inset-0",
            "[background-size:25px_25px]",
            "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
            "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
            "pointer-events-none -z-10 opacity-30 dark:opacity-15",
          )}
        />
        <div className="dark:bg-background bg-background pointer-events-none absolute inset-0 flex items-center justify-center [mask-image:radial-gradient(ellipse_at_center,transparent_50%,black)]" />
        <div className="pointer-events-none absolute inset-0 z-50 h-full w-full bg-[url('/noise-grain.png')] bg-[length:128px] bg-repeat opacity-[0.08] dark:opacity-[0.06]" />
        {children}
      </main>
    </div>
  );
}
