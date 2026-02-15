import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface SoundContextType {
    isMuted: boolean;
    toggleMute: () => void;
    playSound: (type: 'pop' | 'success' | 'complete' | 'error' | 'click') => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: React.ReactNode }) {
    const [isMuted, setIsMuted] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('sound-muted') === 'true';
        }
        return false;
    });

    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        localStorage.setItem('sound-muted', String(isMuted));
    }, [isMuted]);

    // Initialize AudioContext on first user interaction to comply with browser policies
    const initAudio = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
    };

    const playSynthesizedSound = (type: string) => {
        if (isMuted) return;

        // Ensure context exists
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        const ctx = audioContextRef.current;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        const now = ctx.currentTime;

        switch (type) {
            case 'pop': // High pitched short pop
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(800, now);
                oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                oscillator.start(now);
                oscillator.stop(now + 0.1);
                break;

            case 'success': // Simple major chord arpeggio
                // We'll just do a single pleasant chime for simplicity, or a quick sequence
                playTone(ctx, 523.25, now, 0.1, 'sine'); // C5
                playTone(ctx, 659.25, now + 0.1, 0.1, 'sine'); // E5
                playTone(ctx, 783.99, now + 0.2, 0.2, 'sine'); // G5
                break;

            case 'complete': // Longer alert for timer
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(440, now);
                oscillator.frequency.linearRampToValueAtTime(880, now + 0.5);

                // Pulsing gain
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.linearRampToValueAtTime(0.3, now + 0.2);
                gainNode.gain.linearRampToValueAtTime(0, now + 1.5);

                oscillator.start(now);
                oscillator.stop(now + 1.5);
                break;

            case 'click':
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(200, now);
                gainNode.gain.setValueAtTime(0.05, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
                oscillator.start(now);
                oscillator.stop(now + 0.05);
                break;

            case 'error':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(150, now);
                oscillator.frequency.linearRampToValueAtTime(100, now + 0.2);
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
                oscillator.start(now);
                oscillator.stop(now + 0.3);
                break;
        }
    };

    // Helper for sequences
    const playTone = (ctx: AudioContext, freq: number, startTime: number, duration: number, type: OscillatorType = 'sine') => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.1, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        osc.start(startTime);
        osc.stop(startTime + duration);
    };

    const playSound = (type: 'pop' | 'success' | 'complete' | 'error' | 'click') => {
        // Try to resume context if suspended (common browser policy)
        if (audioContextRef.current?.state === 'suspended') {
            audioContextRef.current.resume().catch(() => { });
        }
        playSynthesizedSound(type);
    };

    const toggleMute = () => {
        setIsMuted(prev => !prev);
        // Init audio on user interaction (unmute) if not ready
        if (isMuted) initAudio();
    };

    return (
        <SoundContext.Provider value={{ isMuted, toggleMute, playSound }}>
            {children}
        </SoundContext.Provider>
    );
}

export function useSound() {
    const context = useContext(SoundContext);
    if (context === undefined) {
        throw new Error('useSound must be used within a SoundProvider');
    }
    return context;
}
