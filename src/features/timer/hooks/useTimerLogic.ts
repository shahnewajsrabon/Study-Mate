import { useState, useEffect, useRef, useCallback } from 'react';
import { useSound } from '../../../shared/context/SoundContext.tsx';

export type TimerMode = 'stopwatch' | 'pomodoro' | 'countdown';

export function useTimerLogic(isStrictFocus: boolean = false) {
    const { playSound } = useSound();
    
    const [mode, setMode] = useState<TimerMode>('stopwatch');
    const [isActive, setIsActive] = useState(false);
    const [seconds, setSeconds] = useState(0); 
    const [initialTime, setInitialTime] = useState(0); 
    const [customMinutes, setCustomMinutes] = useState(30);
    const [sessionGoal, setSessionGoal] = useState('');
    const [continuousRunTime, setContinuousRunTime] = useState(0);

    const intervalRef = useRef<number | null>(null);
    const hasSuggestedBreak = useRef(false);

    // Request Notification permission
    useEffect(() => {
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const sendNotification = useCallback((title: string, body: string) => {
        if (Notification.permission === 'granted') {
            new Notification(title, { body, icon: '/vite.svg' });
        }
    }, []);

    // Strict Focus Mode - Visibility Change
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && isActive && isStrictFocus) {
                sendNotification("Focus Mode Alert! 🚨", "You switched tabs! Get back to your study session!");
                // Optionally play a sound
                playSound('click');
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isActive, isStrictFocus, sendNotification, playSound]);

    // Core Timer Loop
    useEffect(() => {
        if (isActive) {
            intervalRef.current = window.setInterval(() => {
                setSeconds((prev) => {
                    if (mode === 'stopwatch') {
                        return prev + 1;
                    } else {
                        // Countdown Logic
                        if (prev <= 1) {
                            setIsActive(false);
                            playSound('complete');
                            sendNotification("Time's Up! ⏰", "Your study session is complete. Take a break!");
                            return 0;
                        }
                        return prev - 1;
                    }
                });
                
                // Track continuous runtime for smart breaks
                setContinuousRunTime((prev) => {
                    const newTime = prev + 1;
                    // Suggest break after 50 mins (3000 seconds)
                    if (newTime >= 3000 && !hasSuggestedBreak.current) {
                        hasSuggestedBreak.current = true;
                        sendNotification("Break Time? ☕", "You've been studying for 50 minutes straight. Consider taking a 10-minute break!");
                        playSound('complete');
                    }
                    return newTime;
                });
                
            }, 1000);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive, mode, playSound, sendNotification]);

    // Handle Mode Changes directly (fixes React cascading render lint warnings)
    const handleModeChange = (newMode: TimerMode, newMinutes?: number) => {
        setIsActive(false);
        setContinuousRunTime(0);
        hasSuggestedBreak.current = false;
        setMode(newMode);
        if (newMode === 'stopwatch') {
            setSeconds(0);
            setInitialTime(0);
        } else {
            const mins = newMinutes !== undefined ? newMinutes : customMinutes;
            const sec = mins * 60;
            if (newMinutes !== undefined) setCustomMinutes(newMinutes);
            setSeconds(sec);
            setInitialTime(sec);
        }
    };

    const handleCustomMinutesChange = (mins: number) => {
        setCustomMinutes(mins);
        if (!isActive && mode !== 'stopwatch') {
            const sec = mins * 60;
            setSeconds(sec);
            setInitialTime(sec);
        }
    };

    // Document Title Updates
    useEffect(() => {
        if (isActive) {
            document.title = `${formatTime(seconds)} - ${sessionGoal ? sessionGoal : (mode === 'pomodoro' ? 'Focus' : 'Timer')}`;
        } else {
            document.title = 'Study Tracker';
        }
        return () => {
            document.title = 'Study Tracker';
        };
    }, [isActive, seconds, mode, sessionGoal]);

    const toggleTimer = () => {
        if (!isActive && mode !== 'stopwatch' && seconds === 0) {
            // Restart if finished
            setSeconds(initialTime);
            setContinuousRunTime(0);
            hasSuggestedBreak.current = false;
        }
        setIsActive(!isActive);
        playSound('click');
    };

    const resetTimer = () => {
        setIsActive(false);
        setContinuousRunTime(0);
        hasSuggestedBreak.current = false;
        if (mode === 'stopwatch') {
            setSeconds(0);
        } else {
            setSeconds(initialTime);
        }
        playSound('click');
    };

    // Calculate Progress Percent for circular rings
    const progressPercent = mode === 'stopwatch'
        ? 100
        : Math.max(0, (seconds / initialTime) * 100);

    return {
        mode,
        setMode,
        isActive,
        setIsActive,
        seconds,
        setSeconds,
        initialTime,
        setInitialTime,
        customMinutes,
        setCustomMinutes,
        sessionGoal,
        setSessionGoal,
        toggleTimer,
        resetTimer,
        handleModeChange,
        handleCustomMinutesChange,
        progressPercent,
        continuousRunTime
    };
}

export const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};
