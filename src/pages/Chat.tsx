import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, Timestamp, updateDoc, doc, deleteDoc, where } from 'firebase/firestore';

import { Send, MessageCircle, Smile, Reply, X, Heart, ThumbsUp, Laugh, Frown, Trash2, Hash, Menu, ChevronLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedPage from '../components/AnimatedPage';
import UserProfileModal from '../components/UserProfileModal';
import { formatMessageText } from '../utils/textFormatting';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Types ---

interface ReplyInfo {
    id: string;
    displayName: string;
    text: string;
}

interface Message {
    id: string;
    text: string;
    uid: string;
    displayName: string;
    createdAt: Timestamp | null;
    replyTo?: ReplyInfo;
    reactions?: Record<string, string>; // uid -> emoji
    channelId?: string;
    imageUrl?: string;
}

type Channel = {
    id: string;
    name: string;
    description: string;
    icon: React.ElementType;
};

// --- Constants ---

const CHANNELS: Channel[] = [
    { id: 'general', name: 'General', description: 'General discussion', icon: Hash },
    { id: 'science', name: 'HSC Science', description: 'Physics, Chemistry, Biology', icon: Hash },
    { id: 'math', name: 'Math Problems', description: 'Higher Math & General Math', icon: Hash },
    { id: 'english', name: 'English & Bangla', description: 'Language and Literature', icon: Hash },
    { id: 'off-topic', name: 'Off Topic', description: 'Chill zone', icon: Hash },
];

const REACTIONS = [
    { emoji: '❤️', icon: Heart },
    { emoji: '👍', icon: ThumbsUp },
    { emoji: '😂', icon: Laugh },
    { emoji: '😢', icon: Frown },
    { emoji: '🔥', icon: Heart },
    { emoji: '🎉', icon: Heart },
];

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

// --- Components ---

export default function Chat() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [sending, setSending] = useState(false);
    const [openReactionMenuId, setOpenReactionMenuId] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [activeChannelId, setActiveChannelId] = useState('general');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Image Upload State


    // --- Real-time Listener ---
    useEffect(() => {
        setMessages([]); // Clear messages on channel switch

        const q = query(
            collection(db, 'messages'),
            where('channelId', '==', activeChannelId),
            orderBy('createdAt', 'asc'),
            limit(100)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs: Message[] = [];
            snapshot.forEach((doc) => {
                msgs.push({ id: doc.id, ...doc.data() } as Message);
            });
            setMessages(msgs);
        });

        return () => unsubscribe();
    }, [activeChannelId]);

    // --- Auto-scroll ---
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length, activeChannelId]);

    // --- Handlers ---



    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = newMessage.trim();

        // Allow send if there is text
        if (!text || !user || sending) return;

        setSending(true);
        try {
            const msgData = {
                text: text,
                uid: user.uid,
                displayName: user.displayName || 'Anonymous',
                createdAt: serverTimestamp(),
                channelId: activeChannelId,
                ...(replyingTo && {
                    replyTo: {
                        id: replyingTo.id,
                        displayName: replyingTo.displayName,
                        text: replyingTo.text
                    }
                })
            };

            await addDoc(collection(db, 'messages'), msgData);

            // Reset State
            setNewMessage('');
            setReplyingTo(null);

        } catch (error) {
            console.error("Error sending message:", error);
            alert("Failed to send message. Please try again.");
        } finally {
            setSending(false);
        }
    };

    const handleReaction = async (msgId: string, emoji: string) => {
        if (!user) return;
        setOpenReactionMenuId(null);

        const msgRef = doc(db, 'messages', msgId);
        const msg = messages.find(m => m.id === msgId);
        if (!msg) return;

        const currentReactions = msg.reactions || {};
        const hasReacted = currentReactions[user.uid] === emoji;

        const newReactions = { ...currentReactions };
        if (hasReacted) {
            delete newReactions[user.uid];
        } else {
            newReactions[user.uid] = emoji;
        }

        try {
            await updateDoc(msgRef, { reactions: newReactions });
        } catch (e) {
            console.error("Failed to update reaction", e);
        }
    };

    const deleteMessage = async (msgId: string) => {
        if (!confirm('Delete this message?')) return;
        try {
            await deleteDoc(doc(db, 'messages', msgId));
        } catch (e) {
            console.error("Error deleting message:", e);
            alert("Failed to delete message.");
        }
    };

    // Helper functions for dates
    const formatTime = (timestamp: Timestamp | null) => {
        if (!timestamp) return '...';
        return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDateHeader = (timestamp: Timestamp | null) => {
        if (!timestamp) return '';
        const date = timestamp.toDate();
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString();
    };

    const groupedMessages = messages.reduce((acc: { date: string; msgs: Message[] }[], msg) => {
        const dateHeader = formatDateHeader(msg.createdAt);
        const lastGroup = acc[acc.length - 1];
        if (lastGroup && lastGroup.date === dateHeader) {
            lastGroup.msgs.push(msg);
        } else {
            acc.push({ date: dateHeader, msgs: [msg] });
        }
        return acc;
    }, []);

    const activeChannel = CHANNELS.find(c => c.id === activeChannelId) || CHANNELS[0];

    return (
        <AnimatedPage className="h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] flex flex-col md:flex-row overflow-hidden">

            {/* --- Mobile Header (Hamburger) --- */}
            <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                    <MessageCircle className="w-6 h-6 text-indigo-500" />
                    <span className="font-bold text-slate-800 dark:text-white">{activeChannel.name}</span>
                </div>
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 -mr-2 text-slate-600 dark:text-slate-300">
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* --- Sidebar (Channels) --- */}
            <AnimatePresence>
                {(isSidebarOpen || window.innerWidth >= 768) && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="md:hidden fixed inset-0 bg-black/50 z-40"
                        />

                        <motion.div
                            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className={cn(
                                "fixed md:static inset-y-0 left-0 z-50 w-72 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col",
                                "md:transform-none"
                            )}
                        >
                            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                <h2 className="font-bold text-xl text-slate-800 dark:text-white flex items-center gap-2">
                                    <MessageCircle className="w-6 h-6 text-indigo-500" />
                                    Community
                                </h2>
                                <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-1">
                                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-2">Text Channels</h3>
                                {CHANNELS.map(channel => (
                                    <button
                                        key={channel.id}
                                        onClick={() => {
                                            setActiveChannelId(channel.id);
                                            setIsSidebarOpen(false);
                                        }}
                                        className={cn(
                                            "w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-colors",
                                            activeChannelId === channel.id
                                                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 font-medium"
                                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                        )}
                                    >
                                        <channel.icon className="w-4 h-4 opacity-70" />
                                        <span>{channel.name}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold">
                                        {user?.displayName?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                                            {user?.displayName || 'User'}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Online</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>


            {/* --- Main Chat Area --- */}
            <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 h-full relative">

                {/* Desktop Channel Header */}
                <div className="hidden md:flex items-center gap-2 p-4 border-b border-slate-100 dark:border-slate-700 shadow-sm z-10">
                    <Hash className="w-5 h-5 text-slate-400" />
                    <h2 className="font-bold text-slate-800 dark:text-white">{activeChannel.name}</h2>
                    <span className="text-slate-400 dark:text-slate-500 text-sm border-l pl-2 ml-2 border-slate-300 dark:border-slate-600">
                        {activeChannel.description}
                    </span>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full opacity-50">
                            <MessageCircle className="w-16 h-16 mb-4 text-slate-300" />
                            <p className="text-slate-500 text-center">No messages yet in #{activeChannel.name}.<br />Be the first to say hello!</p>
                        </div>
                    )}

                    {groupedMessages.map((group, groupIdx) => (
                        <div key={groupIdx} className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
                                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{group.date}</span>
                                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
                            </div>

                            {group.msgs.map((msg, index) => {
                                const isMe = msg.uid === user?.uid;
                                const isFirstInSequence = index === 0 || group.msgs[index - 1].uid !== msg.uid;
                                const hasReactions = msg.reactions && Object.keys(msg.reactions).length > 0;

                                const reactionCounts: Record<string, number> = {};
                                Object.values(msg.reactions || {}).forEach(emoji => {
                                    reactionCounts[emoji] = (reactionCounts[emoji] || 0) + 1;
                                });

                                return (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={cn("group flex gap-4", isMe ? "flex-row-reverse" : "flex-row")}
                                        onMouseLeave={() => setOpenReactionMenuId(null)}
                                    >
                                        {/* Avatar */}
                                        <div className="flex-shrink-0 w-10">
                                            {isFirstInSequence ? (
                                                <button onClick={() => setSelectedUser(msg.uid)} className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300 overflow-hidden shadow-sm transition-transform hover:scale-105">
                                                    {msg.displayName?.[0]?.toUpperCase() || '?'}
                                                </button>
                                            ) : <div className="w-10" />}
                                        </div>

                                        {/* Content */}
                                        <div className={cn("flex flex-col max-w-[80%] md:max-w-[70%]", isMe ? "items-end" : "items-start")}>

                                            {isFirstInSequence && (
                                                <div className="flex items-baseline gap-2 mb-1">
                                                    <span className={cn("text-sm font-bold cursor-pointer hover:underline", isMe ? "text-indigo-600 dark:text-indigo-400" : "text-slate-700 dark:text-slate-300")} onClick={() => setSelectedUser(msg.uid)}>
                                                        {msg.displayName}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">{formatTime(msg.createdAt)}</span>
                                                </div>
                                            )}

                                            {/* Reply Context */}
                                            {msg.replyTo && (
                                                <div className="mb-1 text-xs px-2 py-1 -ml-2 rounded-r bg-slate-100 dark:bg-slate-800 border-l-2 border-indigo-400 opacity-80 cursor-pointer" onClick={() => {/* Scroll to reply could go here */ }}>
                                                    <span className="font-bold mr-1">{msg.replyTo.displayName}</span>
                                                    <span className="italic truncate">{msg.replyTo.text}</span>
                                                </div>
                                            )}

                                            <div className="relative group/bubble">
                                                <div className={cn(
                                                    "px-4 py-2 text-sm shadow-sm relative whitespace-pre-wrap leading-relaxed break-words min-w-[60px]",
                                                    isMe
                                                        ? "bg-indigo-600 text-white rounded-2xl rounded-tr-md"
                                                        : "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl rounded-tl-md",
                                                    !isFirstInSequence && (isMe ? "rounded-tr-2xl" : "rounded-tl-2xl"),
                                                    msg.imageUrl ? "p-2" : "" // Reduce padding if image
                                                )}>

                                                    {/* Image Display */}
                                                    {msg.imageUrl && (
                                                        <div className="mb-2 rounded-lg overflow-hidden max-w-full">
                                                            <img
                                                                src={msg.imageUrl}
                                                                alt="Shared"
                                                                className="w-full h-auto max-h-64 object-cover cursor-pointer hover:scale-105 transition-transform"
                                                                onClick={() => window.open(msg.imageUrl, '_blank')}
                                                            />
                                                        </div>
                                                    )}

                                                    {msg.text && formatMessageText(msg.text)}

                                                    {/* Reactions */}
                                                    {hasReactions && (
                                                        <div className={cn(
                                                            "absolute -bottom-3 flex gap-1 bg-white dark:bg-slate-800 rounded-full px-1.5 py-0.5 shadow-sm border border-slate-100 dark:border-slate-600 text-[10px]",
                                                            isMe ? "right-0" : "left-0"
                                                        )}>
                                                            {Object.entries(reactionCounts).map(([emoji, count]) => (
                                                                <span key={emoji} className="flex items-center">
                                                                    {emoji} {count > 1 && <span className="ml-0.5 font-bold text-slate-500">{count}</span>}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Action Bar (Hover) */}
                                                <div className={cn(
                                                    "absolute -top-6 hidden group-hover/bubble:flex items-center bg-white dark:bg-slate-800 shadow-md rounded-lg p-0.5 border border-slate-100 dark:border-slate-700 z-20",
                                                    isMe ? "right-0" : "left-0"
                                                )}>
                                                    <button onClick={() => setOpenReactionMenuId(msg.id)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500">
                                                        <Smile className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setReplyingTo(msg)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500">
                                                        <Reply className="w-4 h-4" />
                                                    </button>
                                                    {isMe && (
                                                        <button onClick={() => deleteMessage(msg.id)} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Reaction Menu */}
                                                <AnimatePresence>
                                                    {openReactionMenuId === msg.id && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.9, y: 5 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.9 }}
                                                            className={cn(
                                                                "absolute -top-12 z-50 flex gap-1 bg-white dark:bg-slate-800 rounded-full shadow-xl border border-slate-200 dark:border-slate-600 p-1",
                                                                isMe ? "right-0" : "left-0"
                                                            )}
                                                        >
                                                            {REACTIONS.map(reaction => (
                                                                <button
                                                                    key={reaction.emoji}
                                                                    onClick={() => handleReaction(msg.id, reaction.emoji)}
                                                                    className={cn(
                                                                        "p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-lg transition-transform hover:scale-125",
                                                                        msg.reactions?.[user?.uid || ''] === reaction.emoji && "bg-indigo-100 dark:bg-indigo-900"
                                                                    )}
                                                                >
                                                                    {reaction.emoji}
                                                                </button>
                                                            ))}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ))}
                    <div ref={bottomRef} className="h-2" />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white dark:bg-slate-800/90 border-t border-slate-200 dark:border-slate-700 backdrop-blur-sm z-20">

                    {/* Image Preview */}
                    <AnimatePresence>


                        {/* Reply Preview */}
                        {replyingTo && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-2 rounded-lg mb-2 text-sm border-l-4 border-indigo-500"
                            >
                                <span className="truncate text-slate-500 dark:text-slate-400">
                                    Replying to <span className="font-bold text-slate-700 dark:text-slate-200">{replyingTo.displayName}</span>: {replyingTo.text}
                                </span>
                                <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full">
                                    <X className="w-4 h-4" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSendMessage} className="flex gap-2 items-center">


                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={`Message #${activeChannel.name}`}
                            className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-black transition-all"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || sending}
                            className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center min-w-[3rem]"
                        >
                            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                    </form>
                </div>
            </div>

            {/* Profile Modal */}
            <UserProfileModal
                uid={selectedUser || ''}
                isOpen={!!selectedUser}
                onClose={() => setSelectedUser(null)}
            />
        </AnimatedPage>
    );
}
