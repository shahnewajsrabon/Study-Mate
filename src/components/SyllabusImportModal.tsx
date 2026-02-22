import { useState } from 'react';
import { useStudy } from '../hooks/useStudy';
import { SYLLABUS_TEMPLATES, type SyllabusTemplate } from '../data/syllabusTemplates';
import { X, Check, BookOpen, Download } from 'lucide-react';

interface SyllabusImportModalProps {
    onClose: () => void;
}

export default function SyllabusImportModal({ onClose }: SyllabusImportModalProps) {
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>(SYLLABUS_TEMPLATES[0].id);
    const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set());

    const currentTemplate = SYLLABUS_TEMPLATES.find(t => t.id === selectedTemplateId);

    const toggleSubject = (subjectName: string) => {
        const newSelected = new Set(selectedSubjects);
        if (newSelected.has(subjectName)) {
            newSelected.delete(subjectName);
        } else {
            newSelected.add(subjectName);
        }
        setSelectedSubjects(newSelected);
    };

    const handleSelectAll = () => {
        if (!currentTemplate) return;
        if (selectedSubjects.size === currentTemplate.subjects.length) {
            setSelectedSubjects(new Set());
        } else {
            const allNames = new Set(currentTemplate.subjects.map(s => s.name));
            setSelectedSubjects(allNames);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <BookOpen className="w-6 h-6 text-blue-600" />
                            Import Syllabus
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Select a curriculum to quick-start your study plan.</p>
                    </div>
                    <button onClick={onClose} aria-label="Close" className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    {/* Sidebar / Template Selector */}
                    <div className="w-full md:w-48 bg-slate-50 dark:bg-slate-900/50 border-r border-slate-100 dark:border-slate-700 p-4">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Curriculums</h4>
                        <div className="space-y-2">
                            {SYLLABUS_TEMPLATES.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => {
                                        setSelectedTemplateId(t.id);
                                        setSelectedSubjects(new Set());
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedTemplateId === t.id
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    {t.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Subject List */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold text-slate-800 dark:text-white">
                                {currentTemplate?.name} Subjects
                            </h4>
                            <button
                                onClick={handleSelectAll}
                                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                {selectedSubjects.size === currentTemplate?.subjects.length ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>

                        <div className="space-y-3">
                            {currentTemplate?.subjects.map((subject) => (
                                <div
                                    key={subject.name}
                                    onClick={() => toggleSubject(subject.name)}
                                    className={`relative flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${selectedSubjects.has(subject.name)
                                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                        }`}
                                >
                                    <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedSubjects.has(subject.name)
                                        ? 'bg-blue-500 border-blue-500'
                                        : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                                        }`}>
                                        {selectedSubjects.has(subject.name) && <Check className="w-3.5 h-3.5 text-white" />}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`font-semibold ${selectedSubjects.has(subject.name) ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}`}>
                                                {subject.name}
                                            </span>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500">
                                                {subject.chapters.length} Chapters
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                                            {subject.chapters.slice(0, 3).map(c => c.name).join(', ')}...
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <ImportButton
                        count={selectedSubjects.size}
                        currentTemplate={currentTemplate}
                        selectedSubjects={selectedSubjects}
                        onClose={onClose}
                    />
                </div>
            </div>
        </div>
    );
}

interface ImportButtonProps {
    count: number;
    currentTemplate?: SyllabusTemplate;
    selectedSubjects: Set<string>;
    onClose: () => void;
}

function ImportButton({ count, currentTemplate, selectedSubjects, onClose }: ImportButtonProps) {
    const { importSyllabusData } = useStudy();

    const handleImportClick = () => {
        if (count === 0 || !currentTemplate) return;

        const subjectsToImport = currentTemplate.subjects.filter((s) => selectedSubjects.has(s.name));
        importSyllabusData(subjectsToImport);

        onClose();
    };

    return (
        <button
            onClick={handleImportClick}
            disabled={count === 0}
            className="px-6 py-2.5 rounded-xl font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2"
        >
            <Download className="w-4 h-4" />
            Import {count > 0 ? `${count} Subjects` : ''}
        </button>
    );
}
