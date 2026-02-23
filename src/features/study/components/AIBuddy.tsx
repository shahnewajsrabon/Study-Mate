import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Sparkles, Minimize2 } from 'lucide-react';
import { getJarvisResponse, type ChatMessage } from '../lib/jarvisService.ts';
import { clsx } from 'clsx';

export default function AIBuddy() {
    const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
        { role: 'model', text: 'Good day, sir/ma\'am. I am J.A.R.V.I.S., your personal study assistant. How can I assist you with your academic goals today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);

        const history: ChatMessage[] = messages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));

        const response = await getJarvisResponse(userMsg, history);
        setMessages(prev => [...prev, { role: 'model', text: response }]);
        setIsLoading(false);
    };

    if (isMinimized) {
        return (
            <motion.button
                layoutId="jarvis-container"
                onClick={() => setIsMinimized(false)}
                className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full shadow-2xl flex items-center justify-center text-white z-50 border-4 border-white/20 backdrop-blur-xl"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <Bot className="w-8 h-8" />
                <motion.div
                    className="absolute inset-0 rounded-full bg-blue-400 opacity-20"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            </motion.button>
        );
    }

    return (
        <motion.div
            layoutId="jarvis-container"
            className="fixed bottom-6 right-6 w-[90vw] md:w-[400px] h-[600px] bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-blue-500/30 flex flex-col overflow-hidden z-50"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
        >
            {/* Holographic Header */}
            <div className="p-4 border-b border-blue-500/20 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-400/50">
                            <Bot className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold tracking-tight">J.A.R.V.I.S.</h3>
                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Active • AI Buddy</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsMinimized(true)}
                        className="p-2 hover:bg-white/10 rounded-xl text-slate-400 transition-colors"
                        title="Minimize"
                    >
                        <Minimize2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-blue-500/20">
                <AnimatePresence>
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={clsx(
                                "flex gap-3",
                                msg.role === 'user' ? "flex-row-reverse" : ""
                            )}
                        >
                            <div className={clsx(
                                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border",
                                msg.role === 'user'
                                    ? "bg-indigo-500/20 border-indigo-400/30 text-indigo-400"
                                    : "bg-blue-500/20 border-blue-400/30 text-blue-400"
                            )}>
                                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                            </div>
                            <div className={clsx(
                                "max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed",
                                msg.role === 'user'
                                    ? "bg-indigo-600 text-white rounded-tr-none"
                                    : "bg-slate-800/80 text-blue-50 border border-blue-500/10 rounded-tl-none shadow-lg shadow-blue-500/5"
                            )}>
                                {msg.text}
                            </div>
                        </motion.div>
                    ))}
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex gap-3"
                        >
                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                                <Loader2 className="w-4 h-4 animate-spin" />
                            </div>
                            <div className="bg-slate-800/80 text-blue-300 p-3 rounded-2xl rounded-tl-none border border-blue-500/10 flex items-center gap-2">
                                <span className="text-xs font-medium italic">Analyzing data...</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-slate-800/50 border-t border-blue-500/20">
                <form onSubmit={handleSend} className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Inquire about your studies, sir..."
                        className="w-full bg-slate-900/50 border border-blue-500/30 rounded-2xl py-3 pl-4 pr-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded-xl transition-all shadow-lg shadow-blue-500/20"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                </form>
                <div className="mt-2 flex items-center justify-center gap-2">
                    <Sparkles className="w-3 h-3 text-blue-400 animate-pulse" />
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Quantum Encryption Enabled</span>
                    <Sparkles className="w-3 h-3 text-blue-400 animate-pulse" />
                </div>
            </div>
        </motion.div>
    );
}
