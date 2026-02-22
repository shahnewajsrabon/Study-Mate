import { createContext } from 'react';
import type { ScheduledSession, MajorExam } from '../types/study';

export interface PlannerContextType {
    addScheduledSession: (session: Omit<ScheduledSession, 'id' | 'isCompleted'>) => void;
    toggleScheduledSession: (sessionId: string) => void;
    deleteScheduledSession: (sessionId: string) => void;
    generateAIPath: () => void;
    majorExams: MajorExam[];
    addMajorExam: (exam: Omit<MajorExam, 'id'>) => void;
    editMajorExam: (id: string, updates: Partial<MajorExam>) => void;
    deleteMajorExam: (id: string) => void;
}

export const PlannerContext = createContext<PlannerContextType | undefined>(undefined);
