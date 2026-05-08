import { motion } from 'framer-motion';

export default function Login() {
    return (
        <div className="min-h-screen bg-bone flex items-center justify-center p-6">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="zen-card max-w-md w-full p-12 text-center"
            >
                <h1 className="text-4xl font-serif font-bold text-charcoal mb-4">Auth Setup</h1>
                <p className="text-slate-400 font-medium mb-8 italic">
                    Ready to build something beautiful?
                </p>
                <div className="p-4 bg-sage-50 rounded-2xl text-sage-600 text-xs font-bold uppercase tracking-widest">
                    System Reset Complete
                </div>
            </motion.div>
        </div>
    );
}
