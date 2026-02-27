"use client";

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function ScareZonesError({ error, reset }: ErrorProps) {
  // This component is rendered when a child component throws during rendering
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-950 p-6">
      <div className="text-center border border-red-500/50 p-10 rounded-lg bg-red-950/10 backdrop-blur-md shadow-[0_0_20px_rgba(239,68,68,0.2)]">
        <h2 className="text-4xl font-bold text-red-500 mb-2">CURSED API</h2>
        <p className="text-gray-400 font-mono mb-6">{error.message}</p>
        <button
          onClick={() => reset()}
          className="px-6 py-2 mt-4 bg-orange-700 hover:bg-orange-500 text-white rounded-full font-bold transition"
        >
          
          Try again
        </button>
      </div>
    </div>
  );
}
