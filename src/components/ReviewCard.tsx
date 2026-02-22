import { Star, User, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Review } from '../types/social';

function formatRelativeTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
}

interface ReviewCardProps {
    review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-shrink-0 w-[280px] md:w-[320px] bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-2xl p-5 border border-white/20 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all group"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate max-w-[120px]">
                            {review.userName}
                        </h4>
                        <div className="flex items-center gap-1 mt-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-3 h-3 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
                        <Calendar className="w-3 h-3" />
                        {review.createdAt ? formatRelativeTime(review.createdAt) : 'just now'}
                    </div>
                </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                "{review.comment}"
            </p>
        </motion.div>
    );
}
