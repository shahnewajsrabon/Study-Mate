import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

export interface TourStep {
    targetId?: string; // ID of the element to highlight. If undefined, shows in center.
    title: string;
    description: string;
    position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface TourOverlayProps {
    steps: TourStep[];
    onComplete: () => void;
    onSkip: () => void;
}

export default function TourOverlay({ steps, onComplete, onSkip }: TourOverlayProps) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    const currentStep = steps[currentStepIndex];

    useEffect(() => {
        if (currentStep.targetId) {
            const element = document.getElementById(currentStep.targetId);
            if (element) {
                // eslint-disable-next-line
                setTargetRect(element.getBoundingClientRect());
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                // If element not found, fallback to center or skip
                setTargetRect(null);
            }
        } else {
            setTargetRect(null);
        }
    }, [currentStepIndex, currentStep, steps]);

    const handleNext = () => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    const handleBack = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
            {/* Backdrop with hole */}
            <div className="absolute inset-0 bg-black/60 pointer-events-none" />

            {/* Highlight Hole (using box-shadow hack or just standard absolute highlight) */}
            {/* A simpler approach for custom tour: Just place the popover near the target, and maybe a glowing border on the target if possible. 
                For a true "hole" effect, we'd need a canvas or complex svg clipping. 
                Values simplicity: We'll just highlight the rect if it exists.
            */}

            {targetRect && (
                <motion.div
                    layoutId="highlight-box"
                    className="absolute border-4 border-blue-500 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] pointer-events-none transition-all duration-300"
                    style={{
                        top: targetRect.top - 4,
                        left: targetRect.left - 4,
                        width: targetRect.width + 8,
                        height: targetRect.height + 8,
                    }}
                />
            )}

            {/* Tooltip Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStepIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`pointer-events-auto absolute bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 max-w-sm w-full mx-4 ${!targetRect ? 'static' : ''
                        }`}
                    style={
                        targetRect && currentStep.position !== 'center' ? {
                            top: currentStep.position === 'bottom' ? targetRect.bottom + 20 :
                                currentStep.position === 'top' ? targetRect.top - 200 : undefined, // Simplify positioning logic for now
                            left: currentStep.position === 'right' ? targetRect.right + 20 :
                                currentStep.position === 'left' ? targetRect.left - 340 :
                                    Math.max(16, targetRect.left + targetRect.width / 2 - 160), // Center horizontally by default
                            marginTop: currentStep.position === 'bottom' ? 0 : 0
                        } : {}
                    }
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                            Step {currentStepIndex + 1} of {steps.length}
                        </span>
                        <button onClick={onSkip} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{currentStep.title}</h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                        {currentStep.description}
                    </p>

                    <div className="flex items-center justify-between">
                        <button
                            onClick={handleBack}
                            disabled={currentStepIndex === 0}
                            className={`flex items-center gap-1 text-sm font-medium ${currentStepIndex === 0 ? 'text-slate-300' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                                }`}
                        >
                            <ChevronLeft className="w-4 h-4" /> Back
                        </button>
                        <button
                            onClick={handleNext}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium text-sm flex items-center gap-2 shadow-sm transition-transform active:scale-95"
                        >
                            {currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'}
                            {currentStepIndex < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
