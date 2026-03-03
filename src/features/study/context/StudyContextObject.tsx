import { createContext } from 'react';
import type { Subject } from '../types/study.ts';
import { type TemplateSubject } from '../data/syllabusTemplates.ts';

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
    saveStudySession: (durationInSeconds: number, subjectId?: string, sessionGoal?: string, mood?: import('../types/study.ts').MoodType) => Promise<void>;
    permanentlyDeleteAllUserData: () => Promise<void>;
    updateTopicNotes: (subjectId: string, chapterId: string, topicId: string, notes: string) => Promise<void>;
    addTopicLink: (subjectId: string, chapterId: string, topicId: string, link: Omit<import('../types/study.ts').ExternalLink, 'id'>) => Promise<void>;
    deleteTopicLink: (subjectId: string, chapterId: string, topicId: string, linkId: string) => Promise<void>;
    updateTopicConfidence: (subjectId: string, chapterId: string, topicId: string, confidence: number) => Promise<void>;
    flashcardSets: import('../types/study.ts').FlashcardSet[];
    addFlashcardSet: (set: Omit<import('../types/study.ts').FlashcardSet, 'id' | 'createdAt'>) => Promise<void>;
    deleteFlashcardSet: (id: string) => Promise<void>;
    toggleFlashcardMastered: (setId: string, cardId: string) => Promise<void>;
    updateFlashcardSet: (id: string, updates: Partial<import('../types/study.ts').FlashcardSet>) => Promise<void>;
}

export const StudyContext = createContext<StudyContextType | undefined>(undefined);
