import { addDays } from 'date-fns';

export type SRSRating = 1 | 2 | 3 | 4; // 1: Again, 2: Hard, 3: Good, 4: Easy

export interface SRSResult {
    interval: number;
    easeFactor: number;
    reps: number;
    nextReview: string;
}

/**
 * SM-2 Algorithm Implementation
 * Based on SuperMemo-2
 */
export function computeSM2(
    rating: SRSRating,
    prevInterval: number,
    prevReps: number,
    prevEaseFactor: number
): SRSResult {
    let nextInterval: number;
    let nextEaseFactor: number;
    let nextReps: number;

    // Convert rating to 0-5 scale for SM-2 math if needed, 
    // but here we use 1-4 directly for simpler UX.
    // Map 1-4 to roughly the "quality" parameter (q) 0-5
    const q = rating === 1 ? 0 : rating === 2 ? 3 : rating === 3 ? 4 : 5;

    if (q >= 3) {
        // Success
        if (prevReps === 0) {
            nextInterval = 1;
        } else if (prevReps === 1) {
            nextInterval = 6;
        } else {
            nextInterval = Math.round(prevInterval * prevEaseFactor);
        }
        nextReps = prevReps + 1;
    } else {
        // Failure
        nextInterval = 1;
        nextReps = 0;
    }

    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    nextEaseFactor = prevEaseFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (nextEaseFactor < 1.3) nextEaseFactor = 1.3;

    return {
        interval: nextInterval,
        easeFactor: nextEaseFactor,
        reps: nextReps,
        nextReview: addDays(new Date(), nextInterval).toISOString()
    };
}
