import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSocial } from '../hooks/useSocial';
import ReviewCard from '../components/ReviewCard';

export default function Login() {
    const { signInWithGoogle, user } = useAuth();
    const { reviews } = useSocial();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen overflow-y-auto bg-slate-50 dark:bg-slate-900 transition-colors flex flex-col">
            <div className="flex-1 flex items-center justify-center relative py-12">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="relative z-10 w-full max-w-md px-6"
                >
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 dark:border-slate-700/50 p-8 md:p-12 text-center transition-colors">

                        {/* Logo / Icon */}
                        <div className="flex justify-center mb-8">
                            <div className="p-4 bg-indigo-600 rounded-2xl shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300">
                                <GraduationCap className="w-10 h-10 text-white" />
                            </div>
                        </div>

                        {/* Headings */}
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight transition-colors">
                            Welcome to <span className="text-indigo-600 dark:text-indigo-400">TrackEd</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mb-10 text-lg leading-relaxed transition-colors">
                            Master your study habits and achieve your goals.
                        </p>

                        {/* Sign In Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={signInWithGoogle}
                            className="group w-full relative flex items-center justify-center gap-3 py-3.5 px-6 border border-transparent rounded-xl shadow-md text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                        >
                            <div className="bg-white p-1 rounded-full">
                                <img src="https://www.google.com/favicon.ico" alt="G" className="w-4 h-4" />
                            </div>
                            <span>Sign in with Google</span>
                            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </motion.button>

                        {/* Footer / Terms */}
                        <p className="mt-8 text-xs text-slate-400 dark:text-slate-500 transition-colors">
                            By signing in, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </div>

                    {/* Decorative Bottom Text */}
                    <div className="mt-8 text-center">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors">
                            Focus. Track. Succeed.
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Wall of Love Section */}
            {reviews.length > 0 && (
                <div className="w-full max-w-6xl mx-auto px-6 pb-20 relative z-10">
                    <div className="flex flex-col items-center mb-12">
                        <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-2xl text-red-500 shadow-sm mb-4">
                            <Heart className="w-8 h-8 fill-current animate-pulse" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight mb-2">Wall of Love</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-center">Join thousands of students achieving their goals with TrackEd</p>
                    </div>

                    <div className="masonry-grid columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                        {reviews.map((review) => (
                            <motion.div
                                key={review.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ type: "spring", stiffness: 100 }}
                                className="break-inside-avoid"
                            >
                                <ReviewCard review={review} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
