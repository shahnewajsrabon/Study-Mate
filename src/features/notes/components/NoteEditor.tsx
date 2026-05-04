import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Note } from '../types/notes.ts';
import { useNotes } from '../hooks/useNotes.ts';
import { Save, Eye, Edit3, Trash2, X, Clock } from 'lucide-react';
import { useToast } from '../../../shared/context/ToastContext.tsx';
import { motion } from 'framer-motion';

interface NoteEditorProps {
    note: Note;
    onClose: () => void;
    onDelete: (id: string) => void;
}

export default function NoteEditor({ note, onClose, onDelete }: NoteEditorProps) {
    const toast = useToast();
    const { updateNote } = useNotes();
    const [title, setTitle] = useState(note.title);
    const [content, setContent] = useState(note.content);
    const [viewMode, setViewMode] = useState<'write' | 'preview'>('write');
    const [isSaving, setIsSaving] = useState(false);
    
    // Keep track of changes to trigger save
    const initialContent = useRef(note.content);
    const initialTitle = useRef(note.title);

    // Sync state if a different note is selected
    useEffect(() => {
        setTimeout(() => {
            setTitle(note.title);
            setContent(note.content);
        }, 0);
        initialContent.current = note.content;
        initialTitle.current = note.title;
    }, [note]);

    const handleSave = async (silent = false) => {
        if (title === initialTitle.current && content === initialContent.current) return;
        
        setIsSaving(true);
        const success = await updateNote(note.id, { title, content });
        setIsSaving(false);

        if (success) {
            initialContent.current = content;
            initialTitle.current = title;
            if (!silent) toast.success("Note saved successfully!");
        } else if (!silent) {
            toast.error("Failed to save note");
        }
    };

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this note? This action cannot be undone.")) {
            onDelete(note.id);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
            {/* Header / Toolbar */}
            <header className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2 flex-1">
                    <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Untitled Note"
                        className="text-xl font-bold bg-transparent border-none focus:ring-0 text-slate-800 dark:text-white placeholder:text-slate-400 w-full"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <div className="bg-slate-200/50 dark:bg-slate-800 flex rounded-xl p-1 mr-2">
                        <button 
                            onClick={() => setViewMode('write')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'write' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            <Edit3 className="w-3.5 h-3.5" /> Write
                        </button>
                        <button 
                            onClick={() => { setViewMode('preview'); handleSave(true); }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'preview' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            <Eye className="w-3.5 h-3.5" /> Preview
                        </button>
                    </div>

                    <button 
                        onClick={() => handleSave(false)}
                        className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all"
                        title="Save"
                    >
                        {isSaving ? <Clock className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    </button>
                    <button 
                        onClick={handleDelete}
                        className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                        title="Delete Note"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all ml-1"
                        title="Close Editor"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Editor Workspace */}
            <div className="flex-1 overflow-y-auto w-full relative bg-slate-50/30 dark:bg-slate-900/50">
                {viewMode === 'write' ? (
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Start typing your notes in Markdown... 
# Heading 1
## Heading 2
- Bullet points
- **Bold text**"
                        className="w-full h-full p-6 bg-transparent border-none resize-none focus:ring-0 text-slate-700 dark:text-slate-300 font-mono text-sm leading-relaxed"
                    />
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full h-full p-8 max-w-4xl mx-auto overflow-y-auto"
                    >
                        <div className="prose prose-slate prose-blue dark:prose-invert max-w-none">
                            {content ? (
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {content}
                                </ReactMarkdown>
                            ) : (
                                <p className="text-slate-400 italic">No content to preview. Switch to Write mode to type notes.</p>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
