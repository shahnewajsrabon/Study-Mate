import { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { BookOpen, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedPage from '../components/AnimatedPage';
import ChapterItem from '../components/ChapterItem';

export default function AllChapters() {
    const { subjects } = useStudy();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubject, setSelectedSubject] = useState<string | 'all'>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');
    const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

    // Flatten chapters with subject info
    const allChapters = subjects.flatMap(subject =>
        subject.chapters.map(chapter => ({
            ...chapter,
            subjectName: subject.name,
            subjectColor: subject.color,
            subjectId: subject.id
        }))
    );

    // Filter Logic
    const filteredChapters = allChapters.filter(chapter => {
        const matchesSearch = chapter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            chapter.subjectName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSubject = selectedSubject === 'all' || chapter.subjectId === selectedSubject;
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'completed' ? chapter.isCompleted : !chapter.isCompleted);

        return matchesSearch && matchesSubject && matchesStatus;
    });

    const toggleExpand = (chapId: string) => {
        setExpandedChapters(prev => ({ ...prev, [chapId]: !prev[chapId] }));
    };

    return (
        <AnimatedPage className="max-w-4xl mx-auto pb-12">
            <h1 className="text-3xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-blue-600" />
                All Chapters Tracker
            </h1>

            {/* Overall Progress */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-8">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Overall Progress</h2>
                        <p className="text-slate-500 text-sm">
                            {allChapters.filter(c => c.isCompleted).length} of {allChapters.length} chapters completed
                        </p>
                    </div>
                    <span className="text-3xl font-bold text-blue-600">
                        {allChapters.length > 0 ? Math.round((allChapters.filter(c => c.isCompleted).length / allChapters.length) * 100) : 0}%
                    </span>
                </div>
                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${allChapters.length > 0 ? Math.round((allChapters.filter(c => c.isCompleted).length / allChapters.length) * 100) : 0}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-blue-600"
                    />
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search chapters or subjects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none"
                    >
                        <option value="all">All Subjects</option>
                        {subjects.map(sub => (
                            <option key={sub.id} value={sub.id}>{sub.name}</option>
                        ))}
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as 'all' | 'completed' | 'pending')}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none"
                    >
                        <option value="all">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>
            </div>

            {/* Chapters List */}
            <div className="space-y-4">
                {filteredChapters.length > 0 ? (
                    filteredChapters.map((chapter) => (
                        <div key={chapter.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="bg-slate-50/50 px-4 py-1 text-xs font-semibold text-slate-500 border-b border-slate-50 flex items-center justify-between">
                                <span className={chapter.subjectColor}>{chapter.subjectName}</span>
                            </div>
                            <ChapterItem
                                subjectId={chapter.subjectId}
                                chapter={chapter}
                                isExpanded={!!expandedChapters[chapter.id]}
                                onToggle={() => toggleExpand(chapter.id)}
                            />
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                        <p className="text-slate-500">No chapters found matching your filters.</p>
                    </div>
                )}
            </div>
        </AnimatedPage>
    );
}
