import React, { useCallback, useMemo } from 'react';
import { useToast } from './ToastContext';
import { useProfile } from '../hooks/useProfile';
import { useStudy } from '../hooks/useStudy';
import { generateSmartPath } from '../lib/aiEngine';
import type { ScheduledSession, MajorExam } from '../types/study';
import { PlannerContext, type PlannerContextType } from './PlannerContextObject';

export function PlannerProvider({ children }: { children: React.ReactNode }) {
    const toast = useToast();
    const { userProfile, updateProfile } = useProfile();
    const { subjects } = useStudy();

    const addScheduledSession = useCallback((session: Omit<ScheduledSession, 'id' | 'isCompleted'>) => {
        const newSession: ScheduledSession = { ...session, id: crypto.randomUUID(), isCompleted: false };
        const updated = [...(userProfile.scheduledSessions || []), newSession];
        updateProfile({ scheduledSessions: updated });
        toast.success("Study session scheduled!");
    }, [userProfile.scheduledSessions, updateProfile, toast]);

    const toggleScheduledSession = useCallback((sessionId: string) => {
        const updated = (userProfile.scheduledSessions || []).map((s: ScheduledSession) =>
            s.id === sessionId ? { ...s, isCompleted: !s.isCompleted } : s
        );
        updateProfile({ scheduledSessions: updated });
    }, [userProfile.scheduledSessions, updateProfile]);

    const deleteScheduledSession = useCallback((sessionId: string) => {
        const updated = (userProfile.scheduledSessions || []).filter((s: ScheduledSession) => s.id !== sessionId);
        updateProfile({ scheduledSessions: updated });
        toast.info("Session removed");
    }, [userProfile.scheduledSessions, updateProfile, toast]);

    const generateAIPath = useCallback(() => {
        const newSessions: ScheduledSession[] = generateSmartPath(subjects, 7);
        if (newSessions.length > 0) {
            const existing: ScheduledSession[] = userProfile.scheduledSessions || [];
            updateProfile({ scheduledSessions: [...existing, ...newSessions] });
            toast.success(`AI Path Generated: ${newSessions.length} sessions added!`);
        } else {
            toast.info("No new topics could be scheduled. Ensure you have subjects with chapters.");
        }
    }, [subjects, userProfile.scheduledSessions, updateProfile, toast]);

    const majorExams = useMemo(() => userProfile.majorExams || [], [userProfile.majorExams]);

    const addMajorExam = useCallback((exam: Omit<MajorExam, 'id'>) => {
        const newExam: MajorExam = { ...exam, id: crypto.randomUUID() };
        updateProfile({ majorExams: [...majorExams, newExam] });
        toast.success("Major exam added!");
    }, [majorExams, updateProfile, toast]);

    const editMajorExam = useCallback((id: string, updates: Partial<MajorExam>) => {
        const updated = majorExams.map((e: MajorExam) => e.id === id ? { ...e, ...updates } : e);
        updateProfile({ majorExams: updated });
    }, [majorExams, updateProfile]);

    const deleteMajorExam = useCallback((id: string) => {
        const updated = majorExams.filter((e: MajorExam) => e.id !== id);
        updateProfile({ majorExams: updated });
        toast.info("Exam removed");
    }, [majorExams, updateProfile, toast]);

    const contextValue: PlannerContextType = {
        addScheduledSession,
        toggleScheduledSession,
        deleteScheduledSession,
        generateAIPath,
        majorExams,
        addMajorExam,
        editMajorExam,
        deleteMajorExam
    };

    return (
        <PlannerContext.Provider value={contextValue}>
            {children}
        </PlannerContext.Provider>
    );
}
