"use client";

export default function TopMenu() {
  const menuItems = [
    { icon: '👻', label: 'Home' },
    { icon: '🗺️', label: 'Map' },
    { icon: '📋', label: 'Events' },
    { icon: '⚙️', label: 'Settings' },
  ];

  return (
    <header className=" top-0 w-full z-[1000] bg-purple-900 p-3 flex justify-between items-center text-white shadow-lg border-b border-orange-600/30">
      {/* Left actions: email & admin */}
      <div className="flex items-center gap-4">
        <button className="px-3 py-1 rounded-lg hover:bg-white/10 transition-colors text-sm">
          📧
        </button>
        <button className="px-3 py-1 rounded-lg hover:bg-white/10 transition-colors text-sm">
          🛠️ Admin
        </button>
      </div>

      {/* Center logo/text */}
      <div className="flex items-center gap-2">
        <span className="text-3xl">🎃</span>
        <h1 className="text-2xl font-serif italic font-halloween">Scare zones</h1>
      </div>

      {/* Right actions: refresh & language */}
      <div className="flex items-center gap-4">
        <button className="px-3 py-1 rounded-lg hover:bg-white/10 transition-colors text-sm">
          🔄
        </button>
        <button className="px-3 py-1 rounded-lg hover:bg-white/10 transition-colors text-sm">
          🌐
        </button>
      </div>
    </header>
  );
}
