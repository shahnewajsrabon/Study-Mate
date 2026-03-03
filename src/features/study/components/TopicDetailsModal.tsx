import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Plus, Trash2, ExternalLink, Youtube, FileText, Globe, Pencil, Eye, Star, Info } from 'lucide-react';
import { useStudy } from '../hooks/useStudy.ts';
import type { Topic, ExternalLink as ExternalLinkType } from '../types/study.ts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TopicDetailsModalProps {
    subjectId: string;
    chapterId: string;
    topic: Topic;
    onClose: () => void;
}

export default function TopicDetailsModal({
    subjectId,
    chapterId,
    topic,
    onClose
}: TopicDetailsModalProps) {
    const { updateTopicNotes, addTopicLink, deleteTopicLink, updateTopicConfidence } = useStudy();

    const [notes, setNotes] = useState(topic.notes || '');
    const [isEditingNotes, setIsEditingNotes] = useState(!topic.notes);
    const [confidence, setConfidence] = useState(topic.confidence || 3);

    const [linkTitle, setLinkTitle] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [linkType, setLinkType] = useState<ExternalLinkType['type']>('article');
    const [showLinkAdd, setShowLinkAdd] = useState(false);

    const handleSaveNotes = async () => {
        await updateTopicNotes(subjectId, chapterId, topic.id, notes);
        setIsEditingNotes(false);
    };

    const handleAddLink = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!linkTitle || !linkUrl) return;
        await addTopicLink(subjectId, chapterId, topic.id, {
            title: linkTitle,
            url: linkUrl,
            type: linkType
        });
        setLinkTitle('');
        setLinkUrl('');
        setShowLinkAdd(false);
    };

    const handleConfidenceChange = async (level: number) => {
        setConfidence(level as 1 | 2 | 3 | 4 | 5);
        await updateTopicConfidence(subjectId, chapterId, topic.id, level);
    };

    const getLinkIcon = (type: string) => {
        switch (type) {
            case 'youtube': return <Youtube className="w-4 h-4 text-red-500" />;
            case 'wikipedia': return <Globe className="w-4 h-4 text-slate-600" />;
            case 'article': return <FileText className="w-4 h-4 text-blue-500" />;
            default: return <ExternalLink className="w-4 h-4 text-slate-400" />;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-slate-100 dark:border-slate-800"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">Topic Overview</span>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((lvl) => (
                                    <span
                                        key={lvl}
                                        title={`Confidence Level ${lvl}`}
                                        className="cursor-pointer"
                                        onClick={() => handleConfidenceChange(lvl)}
                                    >
                                        <Star
                                            className={`w-3 h-3 transition-colors ${lvl <= confidence ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300 dark:text-slate-600'}`}
                                        />
                                    </span>
                                ))}
                            </div>
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white">{topic.name}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        title="Close Modal"
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left & Middle: Notes */}
                    <div className="md:col-span-2 flex flex-col h-full min-h-[400px]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-500" />
                                Study Notes
                            </h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsEditingNotes(!isEditingNotes)}
                                    title={isEditingNotes ? "Switch to Preview" : "Switch to Edit"}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${isEditingNotes ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                                >
                                    {isEditingNotes ? <Eye className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                                    {isEditingNotes ? 'Preview' : 'Edit Notes'}
                                </button>
                                {isEditingNotes && (
                                    <button
                                        onClick={handleSaveNotes}
                                        title="Save Notes"
                                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
                                    >
                                        <Save className="w-3.5 h-3.5" />
                                        Save
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 min-h-0 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 relative transition-colors shadow-inner">
                            {isEditingNotes ? (
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    autoFocus
                                    title="Edit Study Notes"
                                    placeholder="Add your study notes here... (Markdown supported)"
                                    className="w-full h-full bg-transparent border-none outline-none resize-none text-slate-700 dark:text-slate-300 font-medium placeholder:text-slate-400 leading-relaxed"
                                />
                            ) : (
                                <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
                                    {notes ? (
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {notes}
                                        </ReactMarkdown>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 text-slate-400 italic">
                                            <Info className="w-12 h-12 mb-4 opacity-10" />
                                            <p>No notes for this topic yet. Click edit to start writing!</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Side: Links & Resources */}
                    <div className="flex flex-col gap-6">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                    <ExternalLink className="w-5 h-5 text-emerald-500" />
                                    Resources
                                </h3>
                                <button
                                    onClick={() => setShowLinkAdd(true)}
                                    title="Add New Resource"
                                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-emerald-500"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-2">
                                <AnimatePresence mode="popLayout">
                                    {(topic.links || []).map((link) => (
                                        <motion.div
                                            key={link.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:border-blue-200 dark:hover:border-blue-800 transition-all group"
                                        >
                                            <div className="p-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
                                                {getLinkIcon(link.type)}
                                            </div>
                                            <a
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 min-w-0"
                                            >
                                                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{link.title}</div>
                                                <div className="text-[10px] text-slate-400 truncate opacity-60 uppercase font-black">{link.type}</div>
                                            </a>
                                            <button
                                                onClick={() => deleteTopicLink(subjectId, chapterId, topic.id, link.id)}
                                                title="Delete Link"
                                                className="p-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-500"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {topic.links?.length === 0 && !showLinkAdd && (
                                    <div className="text-center py-8 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                                        <p className="text-xs text-slate-400 font-medium">No links added</p>
                                    </div>
                                )}

                                {showLinkAdd && (
                                    <motion.form
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onSubmit={handleAddLink}
                                        className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-blue-100 dark:border-blue-900 shadow-sm"
                                    >
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                placeholder="Title (e.g. YouTube Tutorial)"
                                                autoFocus
                                                value={linkTitle}
                                                onChange={(e) => setLinkTitle(e.target.value)}
                                                className="w-full bg-white dark:bg-slate-700 px-3 py-2 rounded-xl text-xs border-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <input
                                                type="url"
                                                placeholder="URL (https://...)"
                                                value={linkUrl}
                                                onChange={(e) => setLinkUrl(e.target.value)}
                                                className="w-full bg-white dark:bg-slate-700 px-3 py-2 rounded-xl text-xs border-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <div className="flex gap-1 overflow-x-auto pb-1">
                                                {(['youtube', 'article', 'wikipedia', 'other'] as const).map((t) => (
                                                    <button
                                                        key={t}
                                                        type="button"
                                                        onClick={() => setLinkType(t)}
                                                        className={`px-2 py-1 rounded-md text-[10px] font-black uppercase transition-all whitespace-nowrap ${linkType === t ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-700 text-slate-400'}`}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    type="submit"
                                                    className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-indigo-700 transition-all"
                                                >
                                                    Add Link
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowLinkAdd(false)}
                                                    className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </motion.form>
                                )}
                            </div>
                        </div>

                        {/* Quick Confidence Section */}
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                            <h4 className="text-xs font-black uppercase text-amber-700 dark:text-amber-500 mb-2">Self Assessment</h4>
                            <p className="text-[10px] text-amber-600 dark:text-amber-400 leading-tight mb-3 font-medium">How confident are you with this topic? This affects your overall syllabus score.</p>
                            <div className="flex justify-between items-center gap-1">
                                {[1, 2, 3, 4, 5].map((lvl) => (
                                    <button
                                        key={lvl}
                                        title={`Set Confidence Level ${lvl}`}
                                        onClick={() => handleConfidenceChange(lvl)}
                                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${lvl <= confidence ? 'bg-amber-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-300'}`}
                                    >
                                        <Star className={`w-4 h-4 ${lvl <= confidence ? 'fill-current' : ''}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
