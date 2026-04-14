export default function MapLoading() {
  return (
    <div className="fixed inset-0 bg-[#080a0f] flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        {/* Pulse rings */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-[#00d4ff]/60 animate-ping" />
          <div className="absolute inset-1 rounded-full border-2 border-[#00d4ff]/30 animate-ping [animation-delay:0.3s]" />
          <div className="absolute inset-2 rounded-full bg-[#00d4ff]/20 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-[#00d4ff]" />
          </div>
        </div>
        <p className="font-mono text-[10px] tracking-[0.3em] text-[#00d4ff]/60 uppercase">
          Loading map...
        </p>
      </div>
    </div>
  );
}
