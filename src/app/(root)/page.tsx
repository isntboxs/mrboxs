import { HeroSection } from "@/components/page/home/hero-section";
import { SpotifyNowPlayingSection } from "@/components/page/home/spotify-now-playing-section";

export default function Home() {
  return (
    <div className="container w-full max-w-lg border p-4">
      <HeroSection />
      <SpotifyNowPlayingSection />
    </div>
  );
}
