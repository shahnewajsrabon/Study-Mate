import { useEffect, useState } from 'react';
import { supabase } from '../../../shared/lib/supabase.ts';
import { Trophy, Medal } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext.tsx';
import { motion } from 'framer-motion';

import type { DatabaseProfile } from '../../../shared/types/database.ts';
import type { UserProfile } from '../../study/types/study.ts';

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
                // Fetch profiles. user_profile is JSONB. We fetch limit(100) and sort client-side
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, user_profile')
                    .limit(100);

                if (error) throw error;

                const fetchedLeaders: LeaderboardUser[] = [];

                (data as DatabaseProfile[] | null)?.forEach((doc) => {
                    if (doc.user_profile) {
                        const profile = doc.user_profile as UserProfile;
                        fetchedLeaders.push({
                            uid: doc.id,
                            name: profile.name || 'Anonymous',
                            percentage: profile.syllabusCompletionPercentage || 0,
                            grade: profile.grade || 'Student'
                        });
                    }
                });

                // Sort descending
                fetchedLeaders.sort((a, b) => b.percentage - a.percentage);

                setLeaders(fetchedLeaders.slice(0, 10));
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
                    <div className="flex flex-col items-center justify-center text-center text-slate-500 dark:text-slate-400 py-8 h-full">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mb-3">
                            <Trophy className="w-8 h-8 text-slate-300 dark:text-slate-500 opacity-50" />
                        </div>
                        <p className="font-medium text-slate-600 dark:text-slate-300">No champions yet!</p>
                        <p className="text-xs max-w-[150px] mt-1">Complete chapters to climb the ranks.</p>
                    </div>
                ) : (
                    leaders.map((leader, index) => {
                        const isMe = user?.id === leader.uid;

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
