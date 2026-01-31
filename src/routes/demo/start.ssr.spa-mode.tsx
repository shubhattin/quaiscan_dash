import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { getPunkSongs } from "@/data/demo.punk-songs";

export const Route = createFileRoute("/demo/start/ssr/spa-mode")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  const [punkSongs, setPunkSongs] = useState<any>([]);

  useEffect(() => {
    getPunkSongs().then(setPunkSongs);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-linear-to-br from-purple-900 to-indigo-900 text-white transition-opacity duration-1000">
      <div className="w-full max-w-2xl p-8 rounded-xl backdrop-blur-md bg-black/50 shadow-xl border-8 border-black/10 transition-all hover:scale-105 duration-500">
        <h1 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-linear-to-r from-pink-400 to-purple-400">
          SSR + SPA Mode - Punk Songs
        </h1>
        <ul className="space-y-4">
          {punkSongs.map((song: any) => (
            <li
              key={song.id}
              className="bg-white/10 border border-white/20 rounded-lg p-4 backdrop-blur-sm shadow-md"
            >
              <span className="text-lg text-white font-medium">
                {song.name}
              </span>
              <span className="text-white/60"> - {song.artist}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
