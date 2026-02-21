import { useStudy } from '../context/StudyContext';
import { motion } from 'framer-motion';
import { Zap, BookOpen, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DailyPathWidget() {
    const { userProfile, subjects, toggleScheduledSession, saveStudySession } = useStudy();
    const navigate = useNavigate();

    const todayStr = new Date().toISOString().split('T')[0];

    // Find the next incomplete session (today or future)
    const nextSession = (userProfile.scheduledSessions || [])
        .filter(s => !s.isCompleted && s.date >= todayStr)
        .sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            return (a.time || '').localeCompare(b.time || '');
        })[0];

    if (!nextSession) {
        return (
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center text-center gap-3 h-full">
                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm">
                    <Zap className="w-6 h-6 text-slate-300" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm">No Active Path</h3>
                    <p className="text-[10px] text-slate-500 mt-1 max-w-[150px]">Generate an AI Path in the Planner to get daily targets.</p>
                </div>
                <button
                    onClick={() => navigate('/planner')}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                    Go to Planner <ChevronRight className="w-3 h-3" />
                </button>
            </div>
        );
    }

    const subject = subjects.find(s => s.id === nextSession.subjectId);
    const chapter = subject?.chapters.find(c => c.id === nextSession.chapterId);
    const topic = chapter?.topics.find(t => t.id === nextSession.topicId);

    const isToday = nextSession.date === todayStr;

    const handleComplete = async () => {
        if (confirm(`Mark "${topic?.name || subject?.name}" as completed?`)) {
            await saveStudySession(nextSession.durationMinutes * 60, nextSession.subjectId);
            toggleScheduledSession(nextSession.id);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-100 dark:border-slate-700 shadow-xl shadow-indigo-500/5 flex flex-col relative overflow-hidden h-full group"
        >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />

            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-500 rounded-lg shadow-lg shadow-indigo-500/20">
                        <Zap className="w-4 h-4 text-white fill-white" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                        {isToday ? 'Target for Today' : 'Next Up'}
                    </span>
                </div>
                {isToday && (
                    <div className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-lg animate-pulse">
                        Priority
                    </div>
                )}
            </div>

            <div className="space-y-4 relative z-10 flex-1 flex flex-col justify-center">
                <div>
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-tighter mb-1 line-clamp-1">
                        {subject?.name || 'Unknown'}
                    </h4>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white leading-tight line-clamp-2">
                        {topic?.name || chapter?.name || 'General Study'}
                    </h3>
                </div>

                <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="text-xs font-bold">{nextSession.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="text-xs font-bold">{nextSession.durationMinutes}m</span>
                    </div>
                </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-50 dark:border-slate-700 flex gap-2 relative z-10">
                <button
                    onClick={handleComplete}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Done
                </button>
                <button
                    onClick={() => navigate('/timer')}
                    className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all font-mono"
                >
                    Start
                </button>
            </div>
        </motion.div>
    );
}
