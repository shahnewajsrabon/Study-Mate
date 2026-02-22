import { createContext } from 'react';
import type { Subject } from '../types/study';
import { type TemplateSubject } from '../data/syllabusTemplates';

export interface StudyContextType {
    subjects: Subject[];
    addSubject: (subject: Omit<Subject, 'id' | 'chapters'>) => void;
    editSubject: (id: string, updates: Partial<Subject>) => void;
    deleteSubject: (id: string) => void;
    addChapter: (subjectId: string, chapterName: string) => void;
    editChapter: (subjectId: string, chapterId: string, newName: string) => void;
    toggleChapter: (subjectId: string, chapterId: string) => void;
    deleteChapter: (subjectId: string, chapterId: string) => void;
    addTopic: (subjectId: string, chapterId: string, topicName: string) => void;
    editTopic: (subjectId: string, chapterId: string, topicId: string, newName: string) => void;
    toggleTopic: (subjectId: string, chapterId: string, topicId: string) => void;
    deleteTopic: (subjectId: string, chapterId: string, topicId: string) => void;
    resetData: () => void;
    exportData: () => void;
    importData: (jsonData: string) => Promise<boolean>;
    importSyllabusData: (subjects: TemplateSubject[]) => void;
    saveStudySession: (durationInSeconds: number, subjectId?: string, sessionGoal?: string) => Promise<void>;
    permanentlyDeleteAllUserData: () => Promise<void>;
}

export const StudyContext = createContext<StudyContextType | undefined>(undefined);
