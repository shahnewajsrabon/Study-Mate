import { useState } from 'react';
import { Star, Send, X, Loader2, MessageSquareHeart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSocial } from '../hooks/useSocial.ts';

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
            className="fixed inset-0 bg-charcoal/30 backdrop-blur-md z-[110] flex items-center justify-center p-6"
        >
            <motion.div
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                className="zen-card max-w-lg w-full p-12 relative overflow-hidden"
            >
                <div className="flex items-center justify-between mb-10 relative">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-sage-50 dark:bg-sage-900/20 rounded-2xl text-sage-500">
                            <MessageSquareHeart className="w-6 h-6" />
                        </div>
                        <h2 className="text-3xl font-serif font-bold text-charcoal dark:text-white">Wall of Love</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-300 hover:text-charcoal transition-colors"
                        title="Close Review"
                        aria-label="Close Review"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10 relative">
                    <div className="text-center space-y-6">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                            Overall Impression
                        </label>
                        <div className="flex items-center justify-center gap-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(0)}
                                    className="p-1 focus:outline-none transition-all active:scale-90"
                                    title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                >
                                    <Star
                                        className={`w-12 h-12 transition-all silky-transition ${(hover || rating) >= star
                                            ? 'text-sage-500 fill-sage-500 scale-110 shadow-lg shadow-sage-500/20'
                                            : 'text-slate-100 dark:text-slate-800'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                            Your Journey
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            required
                            rows={5}
                            className="w-full px-6 py-5 rounded-[2rem] bg-bone dark:bg-slate-900/50 border-2 border-transparent focus:border-sage-200 dark:focus:border-sage-900/30 text-charcoal dark:text-white focus:outline-none transition-all resize-none font-serif text-lg italic placeholder:text-slate-300"
                            placeholder="Share a piece of your story..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !comment.trim()}
                        className="w-full bg-sage-600 hover:bg-sage-700 text-white font-bold py-5 rounded-[2rem] shadow-xl shadow-sage-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="uppercase tracking-[0.2em] text-xs">Sending...</span>
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                <span className="uppercase tracking-[0.2em] text-xs">Share Review</span>
                            </>
                        )}
                    </button>
                </form>
            </motion.div>
        </motion.div>
    );
}
