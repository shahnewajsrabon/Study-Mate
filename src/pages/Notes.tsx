import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudy } from '../features/study/hooks/useStudy.ts';
import { useNotes } from '../features/notes/hooks/useNotes.ts';
import NoteEditor from '../features/notes/components/NoteEditor.tsx';
import { Folder, FileText, Plus, Search, ChevronRight, ChevronDown, Hash, Edit } from 'lucide-react';
import { useToast } from '../shared/context/ToastContext.tsx';

export default function Notes() {
    const { subjects } = useStudy();
    const { notes, loading, createNote, deleteNote } = useNotes();
    const toast = useToast();

    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});

    const toggleSubject = (subjectId: string) => {
        setExpandedSubjects(prev => ({ ...prev, [subjectId]: !prev[subjectId] }));
    };

    const handleCreateNote = async (subjectId: string, topicId?: string) => {
        const id = await createNote({
            subjectId,
            topicId: topicId || '',
            title: 'Untitled Note',
            content: ''
        });
        if (id) {
            setSelectedNoteId(id);
            setExpandedSubjects(prev => ({ ...prev, [subjectId]: true }));
        } else {
            toast.error("Failed to create note. Please try again.");
        }
    };

    const handleDelete = async (id: string) => {
        const success = await deleteNote(id);
        if (success) {
            if (selectedNoteId === id) setSelectedNoteId(null);
            toast.success("Note deleted.");
        }
    };

    // Derived state
    const selectedNote = useMemo(() => notes.find(n => n.id === selectedNoteId) || null, [notes, selectedNoteId]);

    const filteredSubjects = useMemo(() => {
        if (!searchQuery) return subjects;
        return subjects.filter(sub => 
            sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            notes.some(n => n.subjectId === sub.id && n.title.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [subjects, notes, searchQuery]);

    return (
        <div className="flex h-[calc(100vh-6rem)] gap-4 overflow-hidden -m-4 md:-m-0 md:h-[calc(100vh-8rem)]">
            
            {/* Sidebar List */}
            <div className={`w-full md:w-80 flex-shrink-0 bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl flex flex-col overflow-hidden transition-all duration-300 ${selectedNoteId ? 'hidden md:flex' : 'flex'}`}>
                
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 z-10">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                        <Edit className="w-5 h-5 text-blue-500" /> Study Notes
                    </h2>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search notes or subjects..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-white placeholder:text-slate-400 text-sm font-medium transition-all"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-xs text-slate-400 font-medium">Loading Notes...</p>
                        </div>
                    ) : filteredSubjects.length === 0 ? (
                        <div className="text-center py-10 px-4">
                            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No subjects found</p>
                            <p className="text-xs text-slate-400 mt-1">Create subjects in Dashboard first.</p>
                        </div>
                    ) : (
                        filteredSubjects.map(subject => {
                            const isExpanded = expandedSubjects[subject.id];
                            const subjectNotes = notes.filter(n => n.subjectId === subject.id && (!searchQuery || n.title.toLowerCase().includes(searchQuery.toLowerCase())));

                            return (
                                <div key={subject.id} className="select-none">
                                    <div 
                                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer group transition-colors"
                                        onClick={() => toggleSubject(subject.id)}
                                    >
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                                            <Folder className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" fillOpacity={0.2} />
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{subject.name}</span>
                                        </div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleCreateNote(subject.id); }}
                                            className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-all pointer-events-auto"
                                            title="New Note in Subject"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden ml-6 space-y-0.5 border-l-2 border-slate-100 dark:border-slate-800"
                                            >
                                                {/* Subject Level Notes */}
                                                {subjectNotes.filter(n => !n.topicId).map(note => (
                                                    <div 
                                                        key={note.id}
                                                        onClick={() => setSelectedNoteId(note.id)}
                                                        className={`flex items-center gap-2 px-3 py-2 mx-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${selectedNoteId === note.id ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200'}`}
                                                    >
                                                        <FileText className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
                                                        <span className="truncate">{note.title || 'Untitled Note'}</span>
                                                    </div>
                                                ))}

                                                {/* Topics Folders */}
                                                {subject.chapters.flatMap(c => c.topics).map(topic => {
                                                    const topicNotes = subjectNotes.filter(n => n.topicId === topic.id);
                                                    
                                                    return (
                                                        <div key={topic.id} className="mt-1">
                                                            <div className="flex items-center justify-between px-2 py-1.5 mx-1 rounded-lg group text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                                                                <div className="flex items-center gap-1.5 overflow-hidden text-xs">
                                                                    <Hash className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
                                                                    <span className="font-semibold truncate">{topic.name}</span>
                                                                </div>
                                                                <button 
                                                                    onClick={(e) => { e.stopPropagation(); handleCreateNote(subject.id, topic.id); }}
                                                                    className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-all pointer-events-auto"
                                                                    title="New Note in Topic"
                                                                >
                                                                    <Plus className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                            <div className="ml-4 border-l border-slate-100 dark:border-slate-800 space-y-0.5 mt-0.5">
                                                                {topicNotes.map(note => (
                                                                    <div 
                                                                        key={note.id}
                                                                        onClick={() => setSelectedNoteId(note.id)}
                                                                        className={`flex items-center gap-2 px-3 py-1.5 mx-1 rounded-md text-[11px] font-medium cursor-pointer transition-colors ${selectedNoteId === note.id ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-800 dark:hover:text-slate-200'}`}
                                                                    >
                                                                        <FileText className="w-3 h-3 flex-shrink-0 opacity-70" />
                                                                        <span className="truncate">{note.title || 'Untitled Note'}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Main Editor View */}
            <div className={`flex-1 h-full min-w-0 ${!selectedNoteId ? 'hidden md:flex' : 'flex'}`}>
                {selectedNote ? (
                    <NoteEditor 
                        key={selectedNote.id}
                        note={selectedNote} 
                        onClose={() => setSelectedNoteId(null)}
                        onDelete={handleDelete}
                    />
                ) : (
                    <div className="w-full h-full bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-8 text-center">
                        <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl shadow-sm flex items-center justify-center mb-6">
                            <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">My Study Notes</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8 font-medium">Select a note from the sidebar or create a new one within a subject folder to start capturing insights using Markdown.</p>
                        
                        {/* Optional Quick Add if they have subjects */}
                        {subjects.length > 0 && (
                            <button 
                                onClick={() => handleCreateNote(subjects[0].id)}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" /> Quick Note
                            </button>
                        )}
                    </div>
                )}
            </div>
            
        </div>
    );
}
