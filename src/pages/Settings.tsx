import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStudy } from '../context/StudyContext';
import { Save, UserCircle, Trash2, Download, Upload, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedPage from '../components/AnimatedPage';

export default function Settings() {
    const { user, logout } = useAuth();
    const { userProfile, updateProfile, resetData, exportData, importData } = useStudy();
    const [name, setName] = useState(userProfile.name);
    const [grade, setGrade] = useState(userProfile.grade);

    const handleSave = () => {
        updateProfile({ name, grade });
        alert('Profile updated successfully!'); // Simple feedback
    };

    return (
        <AnimatedPage className="max-w-xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <UserCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors">My Profile Settings</h1>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 space-y-4 transition-colors"
            >
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Student Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        placeholder="Enter your name"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Class / Grade</label>
                    <input
                        type="text"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        placeholder="e.g. HSC 2026"
                    />
                </div>

                <div className="pt-4">
                    <button
                        onClick={handleSave}
                        className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    >
                        <Save className="w-5 h-5" />
                        Save Profile
                    </button>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 space-y-4 transition-colors"
            >
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 transition-colors">
                    <Download className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    Data Management
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={exportData}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-xl border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 hover:border-slate-300 dark:hover:border-slate-500 transition-all"
                    >
                        <Download className="w-4 h-4" />
                        Export Backup
                    </button>
                    <label className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-xl border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 hover:border-slate-300 dark:hover:border-slate-500 transition-all cursor-pointer">
                        <Upload className="w-4 h-4" />
                        Import Backup
                        <input
                            type="file"
                            accept=".json"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                        const result = event.target?.result as string;
                                        if (importData(result)) {
                                            alert('Data imported successfully!');
                                            // Ideally reload or force update, but context state update should trigger re-render
                                        }
                                    };
                                    reader.readAsText(file);
                                }
                            }}
                        />
                    </label>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 mt-8 space-y-4 transition-colors"
            >
                <h3 className="text-slate-800 dark:text-white font-semibold mb-2 flex items-center gap-2 transition-colors">
                    <UserCircle className="w-5 h-5" />
                    Account
                </h3>
                <div className="flex items-center gap-4 mb-4">
                    {user?.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName || 'User'} className="w-12 h-12 rounded-full" />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl">
                            {user?.displayName ? user.displayName[0] : (user?.email ? user.email[0].toUpperCase() : 'U')}
                        </div>
                    )}
                    <div>
                        <p className="font-medium text-slate-900 dark:text-white transition-colors">{user?.displayName || 'User'}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">{user?.email}</p>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 hover:text-slate-900 dark:hover:text-white transition-colors text-sm flex items-center justify-center gap-2"
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30 p-6 transition-colors"
            >
                <h3 className="text-red-700 dark:text-red-400 font-semibold mb-2 flex items-center gap-2 transition-colors">
                    <Trash2 className="w-5 h-5" />
                    Danger Zone
                </h3>
                <p className="text-red-600/80 dark:text-red-400/80 text-sm mb-4 transition-colors">
                    This will permanently delete all your subjects, chapters, and progress data. This action cannot be undone.
                </p>
                <button
                    onClick={() => {
                        if (confirm('Are you absolutely sure? This cannot be undone.')) {
                            resetData();
                        }
                    }}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 transition-colors text-sm"
                >
                    Reset All Data
                </button>
            </motion.div>
        </AnimatedPage>
    );
}
