import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Trophy, Medal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

interface LeaderboardUser {
    uid: string;
    name: string;
    percentage: number;
    grade: string;
}

export default function Leaderboard() {
    const { user } = useAuth();
    const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const q = query(
                    collection(db, 'users'),
                    orderBy('userProfile.syllabusCompletionPercentage', 'desc'),
                    limit(10)
                );

                const querySnapshot = await getDocs(q);
                const fetchedLeaders: LeaderboardUser[] = [];

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.userProfile) {
                        fetchedLeaders.push({
                            uid: doc.id,
                            name: data.userProfile.name || 'Anonymous',
                            percentage: data.userProfile.syllabusCompletionPercentage || 0,
                            grade: data.userProfile.grade || 'Student'
                        });
                    }
                });

                setLeaders(fetchedLeaders);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm h-full flex items-center justify-center min-h-[300px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm h-full flex flex-col">
            <h3 className="text-slate-800 dark:text-white font-bold text-lg mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Leaderboard
            </h3>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                {leaders.length === 0 ? (
                    <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                        No rankings yet. Start studying to appear here!
                    </div>
                ) : (
                    leaders.map((leader, index) => {
                        const isMe = user?.uid === leader.uid;

                        let rankIcon = null;
                        if (index === 0) rankIcon = <Medal className="w-5 h-5 text-yellow-500" />;
                        else if (index === 1) rankIcon = <Medal className="w-5 h-5 text-slate-400" />;
                        else if (index === 2) rankIcon = <Medal className="w-5 h-5 text-amber-700" />;
                        else rankIcon = <span className="text-sm font-bold text-slate-400 w-5 text-center">{index + 1}</span>;

                        return (
                            <motion.div
                                key={leader.uid}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isMe
                                    ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800'
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                    }`}
                            >
                                <div className="flex-shrink-0 flex items-center justify-center w-8">
                                    {rankIcon}
                                </div>

                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                                    {leader.name[0].toUpperCase()}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${isMe ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-200'}`}>
                                        {leader.name} {isMe && '(You)'}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                        {leader.grade}
                                    </p>
                                </div>

                                <div className="font-bold text-slate-800 dark:text-white text-sm">
                                    {leader.percentage}%
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
