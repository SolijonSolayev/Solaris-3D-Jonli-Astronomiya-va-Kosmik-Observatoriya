import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Sparkles, Music, Sliders, Bell } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

export const AudioControls: React.FC = () => {
  const [isMuted, setIsMuted] = useState<boolean>(soundEngine.isMuted);
  const [ambientVolume, setAmbientVolume] = useState<number>(soundEngine.ambientVolume);
  const [sfxVolume, setSfxVolume] = useState<number>(soundEngine.sfxVolume);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggleMute = async () => {
    // If unmuting for the first time, ensure context starts
    await soundEngine.ensureContext();
    const newMuted = soundEngine.toggleMute();
    setIsMuted(newMuted);
    if (!newMuted) {
      soundEngine.playClick();
    }
  };

  const handleAmbientVolumeChange = (val: number) => {
    setAmbientVolume(val);
    soundEngine.setAmbientVolume(val);
  };

  const handleSfxVolumeChange = (val: number) => {
    setSfxVolume(val);
    soundEngine.setSfxVolume(val);
    soundEngine.playClick();
  };

  const handleTestSound = () => {
    soundEngine.playStationSelect();
  };

  return (
    <div className="relative font-mono" ref={menuRef}>
      {/* Primary Mute/Audio Button */}
      <div className="flex items-center">
        <button
          onClick={handleToggleMute}
          className={`flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-l-sm transition-all text-[10px] sm:text-[11px] uppercase tracking-wider font-bold border ${
            !isMuted
              ? 'bg-purple-950/60 hover:bg-purple-900/70 text-purple-200 border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.35)]'
              : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border-white/15'
          }`}
          title={isMuted ? "Kosmik musiqani yoqish" : "Musiqa va tovushlarni o'chirish (Mute)"}
        >
          {!isMuted ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-purple-400 animate-pulse shrink-0" />
              <span className="hidden lg:inline text-purple-300">Kosmik Ovoz</span>
              <span className="lg:hidden">Ovoz</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="hidden lg:inline">Ovoz O'chiq</span>
              <span className="lg:hidden">Mute</span>
            </>
          )}
        </button>

        {/* Settings Dropdown Opener */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`px-1.5 py-1 sm:py-1.5 rounded-r-sm border-y border-r transition-all text-[10px] sm:text-[11px] ${
            isOpen || !isMuted
              ? 'bg-purple-950/40 hover:bg-purple-900/60 border-purple-500/50 text-purple-300'
              : 'bg-white/5 hover:bg-white/10 border-white/15 text-slate-400 hover:text-slate-200'
          }`}
          title="Ovoz sozlamalari (Balandlik va effektlar)"
        >
          <Sliders className="w-3 h-3" />
        </button>
      </div>

      {/* Floating Audio Settings Popover */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-[#070b14]/95 backdrop-blur-2xl border border-purple-500/40 rounded-lg shadow-2xl p-4 z-50 text-slate-200 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
            <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Music className="w-3.5 h-3.5 text-purple-400" />
              <span>Kosmik Ovoz Tizimi</span>
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
              !isMuted ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'bg-white/10 text-slate-400'
            }`}>
              {!isMuted ? 'Faol' : 'O\'chirilgan'}
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Quick Toggle Button */}
            <button
              onClick={handleToggleMute}
              className={`w-full py-2 px-3 rounded text-center font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border ${
                isMuted
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                  : 'bg-white/10 hover:bg-white/15 text-slate-300 border-white/20'
              }`}
            >
              {isMuted ? (
                <>
                  <Volume2 className="w-4 h-4 text-purple-200" />
                  <span>Musiqani yoqish</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-rose-400" />
                  <span>Tovushlarni o'chirish (Mute)</span>
                </>
              )}
            </button>

            {/* Ambient Background Drone Volume */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>Fon musiqasi (Kosmik garmoniya)</span>
                </span>
                <span className="text-purple-300 font-bold">{Math.round(ambientVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={ambientVolume}
                onChange={(e) => handleAmbientVolumeChange(Number(e.target.value))}
                className="w-full h-1.5 bg-white/15 rounded appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            {/* Sound Effects Volume */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300 flex items-center gap-1">
                  <Bell className="w-3 h-3 text-cyan-400" />
                  <span>Effektlar tovushi (SFX)</span>
                </span>
                <span className="text-cyan-300 font-bold">{Math.round(sfxVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={sfxVolume}
                onChange={(e) => handleSfxVolumeChange(Number(e.target.value))}
                className="w-full h-1.5 bg-white/15 rounded appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            {/* Sound Test Button & Info */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={handleTestSound}
                className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/15 text-[10px] font-medium transition-all"
              >
                🔔 Tovushni sinash
              </button>
              <span className="text-[10px] text-slate-400">Web Audio API</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
