import type { UserProfile, Chapter, Flashcard } from '../../features/study/types/study.ts';
import type { GroupMember } from '../../features/social/types/social.ts';

export interface DatabaseProfile {
    id: string;
    user_profile: UserProfile;
    role: string;
    created_at: string;
    updated_at?: string;
}

export interface DatabaseSubject {
    id: string;
    user_id: string;
    name: string;
    color: string;
    icon: string | null;
    chapters: Chapter[];
    stats: Record<string, number>;
    created_at: string;
}

export interface DatabaseFlashcardSet {
    id: string;
    user_id: string;
    subject_id: string | null;
    title: string;
    description: string | null;
    cards: Flashcard[];
    created_at: string;
}

export interface DatabaseNote {
    id: string;
    user_id: string;
    subject_id: string;
    topic_id: string | null;
    title: string;
    content: string | null;
    is_markdown: boolean;
    created_at: string;
    updated_at: string;
}

export interface DatabaseGroup {
    id: string;
    name: string;
    description: string | null;
    created_by: string | null;
    created_at: string;
    members: GroupMember[];
    member_ids: string[];
    invite_code: string;
}

export interface DatabaseChallenge {
    id: string;
    group_id: string | null;
    title: string;
    goal_xp: number;
    start_date: string;
    end_date: string;
    participants: string[];
    is_completed: boolean;
    created_at: string;
}

export interface DatabaseReview {
    id: string;
    user_id: string;
    user_name: string | null;
    rating: number;
    comment: string | null;
    created_at: string;
}

export interface DatabaseMessage {
    id: string;
    group_id: string;
    sender_id: string;
    sender_name: string;
    text: string;
    timestamp: string;
}
