import { useState } from 'react';
import { Star, Send, X, Loader2, MessageSquareHeart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSocial } from '../hooks/useSocial';

interface ReviewBoxProps {
    onClose: () => void;
}

export default function ReviewBox({ onClose }: ReviewBoxProps) {
    const { addReview } = useSocial();
    const [rating, setRating] = useState(5);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return;

        setIsSubmitting(true);
        try {
            await addReview(rating, comment.trim());
            onClose();
        } catch (error) {
            console.error("Failed to submit review:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-700 relative overflow-hidden"
            >
                {/* Background Decoration */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between mb-6 relative">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400">
                            <MessageSquareHeart className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Write a Review</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-400"
                        title="Close Review"
                        aria-label="Close Review"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 relative">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 text-center">
                            Rate your experience
                        </label>
                        <div className="flex items-center justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(0)}
                                    className="p-1 focus:outline-none transition-transform active:scale-90"
                                    title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                >
                                    <Star
                                        className={`w-10 h-10 transition-all ${(hover || rating) >= star
                                            ? 'text-amber-400 fill-amber-400 scale-110'
                                            : 'text-slate-200 dark:text-slate-700'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            Your Feedback
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            required
                            rows={4}
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none placeholder:text-slate-400"
                            placeholder="How has TrackEd helped you? What features do you love?"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !comment.trim()}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                Share My Review
                            </>
                        )}
                    </button>
                </form>
            </motion.div>
        </motion.div>
    );
}
