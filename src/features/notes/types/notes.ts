export interface Note {
    id: string;
    userId: string;
    subjectId: string;
    topicId?: string; 
    title: string;
    content: string; // Stored natively as raw markdown
    isMarkdown?: boolean;
    createdAt: string;
    updatedAt: string;
}
