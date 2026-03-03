import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, Volume2, Music, Wind, Coffee, CloudRain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TRACKS = [
    { id: 'lofi', name: 'Lofi Beats', icon: Music, url: 'https://stream.zeno.fm/0r0xa792kwzuv' },
    { id: 'piano', name: 'Deep Focus', icon: Coffee, url: 'https://stream.zeno.fm/46781h6nc98uv' },
    { id: 'nature', name: 'Nature', icon: Wind, url: 'https://stream.zeno.fm/7n9sc32vuzduv' },
    { id: 'rain', name: 'Rainy Night', icon: CloudRain, url: 'https://stream.zeno.fm/0t9sc32vuzduv' },
];

export default function LofiPlayer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [volume, setVolume] = useState(0.5);
    const [showTracks, setShowTracks] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const currentTrack = TRACKS[currentTrackIndex];

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    useEffect(() => {
        if (isPlaying && audioRef.current) {
            audioRef.current.play().catch(e => console.error("Playback failed", e));
        } else if (audioRef.current) {
            audioRef.current.pause();
        }
    }, [isPlaying, currentTrackIndex]);

    const togglePlay = () => setIsPlaying(!isPlaying);

    const nextTrack = () => {
        setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
        setIsPlaying(true);
    };

    return (
        <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl p-4 shadow-xl transition-all hover:bg-white/50 dark:hover:bg-slate-800/50">
            <audio
                ref={audioRef}
                src={currentTrack.url}
                loop
                crossOrigin="anonymous"
            />

            <div className="flex items-center gap-4">
                {/* Track Icon & Info */}
                <div className="relative group cursor-pointer" onClick={() => setShowTracks(!showTracks)}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isPlaying ? 'bg-indigo-500 text-white animate-pulse' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 font-bold'}`}>
                        <currentTrack.icon className="w-6 h-6" />
                    </div>
                    {isPlaying && (
                        <div className="absolute -bottom-1 -right-1 flex gap-0.5 items-end h-4">
                            {[0.4, 0.7, 0.5, 0.9].map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{ height: isPlaying ? [4, 12, 6, 14, 4][(i % 5)] : 4 }}
                                    transition={{ repeat: Infinity, duration: 0.8 + i * 0.1 }}
                                    className="w-1 bg-white rounded-full"
                                    style={{ height: '4px' }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">{currentTrack.name}</h4>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Focus Mode</p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={togglePlay}
                        title={isPlaying ? "Pause Music" : "Play Music"}
                        className="p-2.5 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:scale-110 active:scale-95 transition-all shadow-lg"
                    >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>
                    <button
                        onClick={nextTrack}
                        title="Next Track"
                        className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
                    >
                        <SkipForward className="w-4 h-4" />
                    </button>

                    <div className="group relative ml-2">
                        <Volume2 className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 cursor-pointer" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                title="Volume"
                                aria-label="Volume"
                                value={volume}
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                className="w-24 h-1 bg-slate-100 dark:bg-slate-700 rounded-full appearance-none accent-indigo-500 cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Track Selector Panel */}
            <AnimatePresence>
                {showTracks && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-4 grid grid-cols-2 gap-2">
                            {TRACKS.map((track, index) => (
                                <button
                                    key={track.id}
                                    onClick={() => {
                                        setCurrentTrackIndex(index);
                                        setShowTracks(false);
                                        setIsPlaying(true);
                                    }}
                                    className={`flex items-center gap-2 p-2 rounded-xl text-xs font-bold transition-all ${currentTrackIndex === index ? 'bg-indigo-600 text-white' : 'bg-slate-50 dark:bg-slate-700/50 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                                >
                                    <track.icon className="w-3.5 h-3.5" />
                                    {track.name}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
