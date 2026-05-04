import React, { useCallback } from 'react';
import { useAuth } from '../../../shared/context/AuthContext.tsx';
import { useToast } from '../../../shared/context/ToastContext.tsx';
import { useProfile } from '../../../features/profile/hooks/useProfile.ts';
import { type TemplateSubject } from '../data/syllabusTemplates.ts';
import { db } from '../../../shared/lib/firebase.ts';
import { doc, collection, addDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { StudyContext, type StudyContextType } from './StudyContextObject.tsx';
import { useSubjectsManager } from '../hooks/useSubjectsManager.ts';
import { useFlashcardsManager } from '../hooks/useFlashcardsManager.ts';

const STORAGE_KEY_SUBJECTS = 'study-tracker-subjects';

export function StudyProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const toast = useToast();
    const { userProfile, updateProfile, addXP } = useProfile();

    const subjectManager = useSubjectsManager();
    const flashcardManager = useFlashcardsManager();

    const resetData = useCallback(async () => {
        if (!user) return;
        try {
            const q = query(collection(db, 'subjects'), where('userId', '==', user.uid));
            const snapshot = await getDocs(q);
            const deletePromises = snapshot.docs.map(d => deleteDoc(d.ref));
            await Promise.all(deletePromises);
            subjectManager.setSubjects([]);
            localStorage.removeItem(STORAGE_KEY_SUBJECTS);
            toast.success("Progress reset successfully!");
        } catch (error) {
            console.error("Error resetting data:", error);
            toast.error("Failed to reset progress");
        }
    }, [user, toast, subjectManager]);

    const exportData = useCallback(() => {
        const data = {
            userProfile,
            subjects: subjectManager.subjects,
            exportedAt: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tracked-v3-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [userProfile, subjectManager.subjects]);

    const importData = useCallback(async (jsonData: string) => {
        try {
            const data = JSON.parse(jsonData);
            if (data.userProfile) updateProfile(data.userProfile);
            if (data.subjects && user) {
                for (const sub of data.subjects) {
                    await addDoc(collection(db, 'subjects'), {
                        ...sub,
                        userId: user.uid,
                        id: undefined // Let Firebase create a new id
                    });
                }
            }
            return true;
        } catch (error) {
            console.error("Error importing data:", error);
            return false;
        }
    }, [user, updateProfile]);

    const importSyllabusData = useCallback(async (templateSubjects: TemplateSubject[]) => {
        if (!user) return;
        try {
            for (const sub of templateSubjects) {
                await addDoc(collection(db, 'subjects'), {
                    ...sub,
                    userId: user.uid,
                    createdAt: new Date().toISOString()
                });
            }
            toast.success("Syllabus imported!");
        } catch (error) {
            console.error("Error importing syllabus:", error);
            toast.error("Syllabus import failed");
        }
    }, [user, toast]);

    const saveStudySession = useCallback(async (durationInSeconds: number, subjectId?: string, sessionGoal?: string, mood?: import('../types/study.ts').MoodType, topicId?: string) => {
        if (!user) return;
        try {
            const durationMinutes = Math.floor(durationInSeconds / 60);
            const xpGained = durationMinutes * 10;

            const sessionEntry = {
                date: new Date().toISOString(),
                duration: durationInSeconds,
                subjectId,
                topicId,
                goal: sessionGoal,
                mood
            };

            const updatedHistory = [...(userProfile?.sessionHistory || []), sessionEntry];

            // Badge Logic
            const currentBadges = userProfile?.earnedBadges || [];
            const newBadges: import('../types/study.ts').BadgeEntry[] = [];
            const hasBadge = (type: string) => currentBadges.some(b => b.type === type);
            
            if (updatedHistory.length === 1 && !hasBadge('start_strong')) {
                newBadges.push({ type: 'start_strong', earnedAt: new Date().toISOString() });
            }
            if (userProfile?.currentStreak && userProfile.currentStreak >= 7 && !hasBadge('streak_master')) {
                newBadges.push({ type: 'streak_master', earnedAt: new Date().toISOString() });
            }
            const currentHour = new Date().getHours();
            if ((currentHour >= 22 || currentHour < 4) && !hasBadge('night_owl')) {
                newBadges.push({ type: 'night_owl', earnedAt: new Date().toISOString() });
            }

            if (newBadges.length > 0) {
                newBadges.forEach(b => toast.success(`Unlocked Badge: ${b.type.replace('_', ' ').toUpperCase()}! 🏆`));
            }

            await updateProfile({
                totalStudyTime: (userProfile?.totalStudyTime || 0) + durationInSeconds,
                todayStudyTime: (userProfile?.todayStudyTime || 0) + durationInSeconds,
                weeklyStudyTime: (userProfile?.weeklyStudyTime || 0) + durationInSeconds,
                monthlyStudyTime: (userProfile?.monthlyStudyTime || 0) + durationInSeconds,
                xp: (userProfile?.xp || 0) + xpGained,
                sessionHistory: updatedHistory,
                lastStudyDate: new Date().toISOString(),
                earnedBadges: [...currentBadges, ...newBadges]
            });

            addXP(xpGained);
            toast.success(`Session saved! Gained ${xpGained} XP!`);
        } catch (error) {
            console.error("Error saving session:", error);
            toast.error("Failed to save session");
        }
    }, [user, userProfile, updateProfile, addXP, toast]);

    const permanentlyDeleteAllUserData = useCallback(async () => {
        if (!user) return;
        try {
            const q = query(collection(db, 'subjects'), where('userId', '==', user.uid));
            const snapshot = await getDocs(q);
            const deletePromises = snapshot.docs.map(d => deleteDoc(d.ref));
            await Promise.all(deletePromises);

            const flashcardQ = query(collection(db, 'flashcardSets'), where('userId', '==', user.uid));
            const flashcardSnapshot = await getDocs(flashcardQ);
            const flashcardDeletePromises = flashcardSnapshot.docs.map(d => deleteDoc(d.ref));
            await Promise.all(flashcardDeletePromises);

            await deleteDoc(doc(db, 'users', user.uid));
            subjectManager.setSubjects([]);
            flashcardManager.setFlashcardSets([]);
            localStorage.removeItem(STORAGE_KEY_SUBJECTS);
        } catch (error) {
            console.error("Error deleting user data:", error);
            throw error;
        }
    }, [user, subjectManager, flashcardManager]);

    const value: StudyContextType = {
        ...subjectManager,
        ...flashcardManager,
        resetData, exportData, importData, importSyllabusData, saveStudySession,
        permanentlyDeleteAllUserData,
    };

    return (
        <StudyContext.Provider value={value}>
            {children}
        </StudyContext.Provider>
    );
}
