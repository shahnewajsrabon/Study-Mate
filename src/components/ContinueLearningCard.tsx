import { Link } from 'react-router-dom';
import { useStudy } from '../hooks/useStudy';
import { Play, ArrowRight, BookOpen } from 'lucide-react';
import type { Chapter, Topic } from '../types/study';

export default function ContinueLearningCard() {
    const { subjects } = useStudy();

    // Logic to find the "next" thing to learn
    // 1. Find the first subject that isn't 100% complete
    // 2. Inside that, find the first chapter that isn't 100% complete
    // 3. Inside that, find the first topic that isn't complete

    // We can also prioritize "recently active" if we tracked that, but linear order is a good start.

    let nextSubject = null;
    let nextChapter = null;
    let nextTopic = null;

    for (const sub of subjects) {
        // Find subject with uncompleted chapters
        const hasUnfinishedStuff = sub.chapters.some((ch: Chapter) =>
            !ch.isCompleted && (!ch.topics.length || ch.topics.some((t: Topic) => !t.isCompleted))
        );

        if (hasUnfinishedStuff) {
            nextSubject = sub;
            // Find the chapter
            for (const ch of sub.chapters) {
                if (!ch.isCompleted) {
                    // Check if it has topics
                    if (ch.topics.length > 0) {
                        const unfinishedTopic = ch.topics.find((t: Topic) => !t.isCompleted);
                        if (unfinishedTopic) {
                            nextChapter = ch;
                            nextTopic = unfinishedTopic;
                            break;
                        }
                    } else {
                        // Chapter itself is the unit
                        nextChapter = ch;
                        break;
                    }
                }
            }
            break; // Found our starting point
        }
    }

    if (!nextSubject || !nextChapter) {
        // Everything complete!
        return (
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20 flex flex-col items-center justify-center text-center h-full min-h-[160px]">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3 text-2xl">🎉</div>
                <h3 className="font-bold text-xl mb-1">All Caught Up!</h3>
                <p className="text-emerald-100 text-sm">You've completed everything in your syllabus.</p>
                <div className="mt-4 px-4 py-2 bg-white/20 rounded-lg text-sm font-medium backdrop-blur-sm">
                    Time to review or rest!
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden h-full flex flex-col justify-between group">
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2 text-sm">
                        <Play className="w-4 h-4 text-blue-500 fill-current" />
                        Continue Learning
                    </h3>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full text-white ${nextSubject.color}`}>
                        {nextSubject.name}
                    </span>
                </div>

                <div className="mb-4">
                    <h4 className="text-xl font-bold text-slate-800 dark:text-white line-clamp-1 mb-1">
                        {nextTopic ? nextTopic.name : nextChapter.name}
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5" />
                        {nextChapter.name}
                    </p>
                </div>
            </div>

            <div className="relative z-10">
                <Link
                    to={`/subject/${nextSubject.id}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl font-medium transition-all group-hover:translate-x-1"
                >
                    Resume Study <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            {/* Decorative BG */}
            <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 ${nextSubject.color.replace('text-', 'bg-')}`} />
        </div>
    );
}
