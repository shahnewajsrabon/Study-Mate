
export const LEVELS = [
    { level: 1, minXP: 0, title: 'Novice' },
    { level: 2, minXP: 500, title: 'Apprentice' },
    { level: 3, minXP: 1200, title: 'Scholar' },
    { level: 4, minXP: 2500, title: 'Sage' },
    { level: 5, minXP: 5000, title: 'Master' },
    { level: 6, minXP: 10000, title: 'Grandmaster' },
    { level: 7, minXP: 20000, title: 'Legend' },
];

export const getLevelInfo = (xp: number) => {
    // Find the highest level where xp >= minXP
    const current = [...LEVELS].reverse().find(l => xp >= l.minXP) || LEVELS[0];
    const next = LEVELS.find(l => l.level === current.level + 1);

    return {
        currentLevel: current.level,
        currentTitle: current.title,
        nextLevelXP: next ? next.minXP : null,
        progress: next
            ? ((xp - current.minXP) / (next.minXP - current.minXP)) * 100
            : 100
    };
};
