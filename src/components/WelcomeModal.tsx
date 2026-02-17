import { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { UserCircle, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WelcomeModal() {
    const { updateProfile } = useStudy();
    const [name, setName] = useState('');
    const [grade, setGrade] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            alert('Please enter your name');
            return;
        }

        updateProfile({ name: name.trim(), grade: grade.trim() || 'Not specified' });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 text-white">
                    <h2 className="text-2xl font-bold mb-2">Welcome to TrackEd! 🎓</h2>
                    <p className="text-blue-100 text-sm">Let's get started by setting up your profile</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            <UserCircle className="w-4 h-4" />
                            Your Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            placeholder="Enter your name"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            <GraduationCap className="w-4 h-4" />
                            Class / Grade
                        </label>
                        <input
                            type="text"
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            placeholder="e.g., HSC 2026, SSC 2024"
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98]"
                        >
                            Get Started
                        </button>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                        You can update these details anytime in Settings
                    </p>
                </form>
            </motion.div>
        </div>
    );
}
