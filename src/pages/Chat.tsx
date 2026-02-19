import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocial, type Group, type ChatMessage } from '../context/SocialContext';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Send, MessageCircle, Plus, Users, Hash, Menu, ChevronLeft, Loader2, Copy, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedPage from '../components/AnimatedPage';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

// Helper for date formatting
const formatTime = (timestamp: any) => {
    if (!timestamp) return '...';
    // Firestore timestamp to Date
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function Chat() {
    const { user } = useAuth();
    const { groups, createGroup, joinGroup, sendMessage, leaveGroup } = useSocial();

    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [sending, setSending] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Initial Selection
    useEffect(() => {
        if (!selectedGroup && groups.length > 0) {
            setSelectedGroup(groups[0]);
        }
    }, [groups, selectedGroup]);

    // Load Messages for Selected Group
    useEffect(() => {
        if (!selectedGroup) {
            setMessages([]);
            return;
        }

        const q = query(
            collection(db, 'groups', selectedGroup.id, 'messages'),
            orderBy('timestamp', 'asc'),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs: ChatMessage[] = [];
            snapshot.forEach(doc => {
                msgs.push({ id: doc.id, ...doc.data() } as ChatMessage);
            });
            setMessages(msgs);
        }, (err) => console.error("Msg Load Err", err));

        return () => unsubscribe();
    }, [selectedGroup]);

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedGroup || sending) return;

        setSending(true);
        await sendMessage(selectedGroup.id, newMessage.trim());
        setNewMessage('');
        setSending(false);
    };

    const handleCreateGroup = () => {
        const name = prompt("Enter Group Name:");
        if (!name) return;
        const desc = prompt("Enter Description (optional):") || "";
        createGroup(name, desc);
    };

    const handleJoinGroup = () => {
        const code = prompt("Enter Invitation Code:");
        if (code) joinGroup(code);
    };

    const handleLeave = () => {
        if (!selectedGroup) return;
        if (confirm(`Leave group "${selectedGroup.name}"?`)) {
            leaveGroup(selectedGroup.id);
            setSelectedGroup(null);
        }
    };

    const copyInviteCode = () => {
        if (selectedGroup) {
            navigator.clipboard.writeText(selectedGroup.inviteCode);
            alert("Invite code copied: " + selectedGroup.inviteCode);
        }
    };

    return (
        <AnimatedPage className="h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] flex flex-col md:flex-row overflow-hidden">

            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                    <Users className="w-6 h-6 text-indigo-500" />
                    <span className="font-bold text-slate-800 dark:text-white truncate max-w-[200px]">
                        {selectedGroup ? selectedGroup.name : 'Study Groups'}
                    </span>
                </div>
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 -mr-2 text-slate-600 dark:text-slate-300">
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Sidebar (Group List) */}
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
                            className="fixed md:static inset-y-0 left-0 z-50 w-72 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col"
                        >
                            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                <h2 className="font-bold text-xl text-slate-800 dark:text-white flex items-center gap-2">
                                    <Users className="w-6 h-6 text-indigo-500" />
                                    My Groups
                                </h2>
                                <button onClick={() => setIsSidebarOpen(false)} className="md:hidden">
                                    <ChevronLeft />
                                </button>
                            </div>

                            <div className="p-4 space-y-2">
                                <button
                                    onClick={handleCreateGroup}
                                    className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    <Plus className="w-4 h-4" /> Create Group
                                </button>
                                <button
                                    onClick={handleJoinGroup}
                                    className="w-full flex items-center justify-center gap-2 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-medium transition-colors"
                                >
                                    <Hash className="w-4 h-4" /> Join via Code
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-1">
                                {groups.length === 0 && (
                                    <div className="text-center text-slate-500 text-sm py-4">
                                        You haven't joined any groups yet.
                                    </div>
                                )}
                                {groups.map(group => (
                                    <button
                                        key={group.id}
                                        onClick={() => {
                                            setSelectedGroup(group);
                                            setIsSidebarOpen(false);
                                        }}
                                        className={cn(
                                            "w-full text-left px-3 py-3 rounded-xl flex items-center gap-3 transition-all",
                                            selectedGroup?.id === group.id
                                                ? "bg-white dark:bg-slate-800 shadow-sm ring-1 ring-indigo-500/20"
                                                : "hover:bg-slate-100 dark:hover:bg-slate-800"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm",
                                            selectedGroup?.id === group.id ? "bg-indigo-500" : "bg-slate-400"
                                        )}>
                                            {group.name[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div className={cn("font-medium text-sm", selectedGroup?.id === group.id ? "text-indigo-900 dark:text-indigo-100" : "text-slate-700 dark:text-slate-300")}>
                                                {group.name}
                                            </div>
                                            <div className="text-xs text-slate-500 truncate max-w-[140px]">
                                                {group.members.length} members
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 relative">
                {selectedGroup ? (
                    <>
                        {/* Header */}
                        <div className="hidden md:flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700 shadow-sm z-10">
                            <div>
                                <h2 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                                    {selectedGroup.name}
                                    <span className="text-xs font-normal px-2 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 rounded-full">
                                        {selectedGroup.members.length} Members
                                    </span>
                                </h2>
                                <p className="text-xs text-slate-500">{selectedGroup.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={copyInviteCode} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500" title="Copy Invite Code">
                                    <Copy className="w-5 h-5" />
                                </button>
                                <button onClick={handleLeave} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500" title="Leave Group">
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                    <MessageCircle className="w-12 h-12 mb-2 opacity-50" />
                                    <p>No messages yet. Start the conversation!</p>
                                    <p className="text-xs mt-2">Invite Code: <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded select-all">{selectedGroup.inviteCode}</span></p>
                                </div>
                            )}

                            {messages.map((msg) => {
                                const isMe = msg.senderId === user?.uid;
                                return (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={cn("flex gap-3", isMe ? "flex-row-reverse" : "")}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300 flex-shrink-0">
                                            {msg.senderName[0]}
                                        </div>
                                        <div className={cn("max-w-[75%]", isMe ? "items-end" : "items-start")}>
                                            <div className="flex items-baseline gap-2 mb-1">
                                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{msg.senderName}</span>
                                                <span className="text-[10px] text-slate-400">{formatTime(msg.timestamp)}</span>
                                            </div>
                                            <div className={cn(
                                                "px-4 py-2 rounded-2xl text-sm shadow-sm",
                                                isMe
                                                    ? "bg-indigo-600 text-white rounded-tr-sm"
                                                    : "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-sm"
                                            )}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                            <div ref={bottomRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    placeholder={`Message #${selectedGroup.name}`}
                                    className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-xl border-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <button disabled={sending || !newMessage.trim()} className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50">
                                    {sending ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
                                </button>
                            </form>
                        </div>

                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <Users className="w-16 h-16 mb-4 opacity-50" />
                        <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300">Select a Group</h3>
                        <p className="max-w-xs text-center mt-2">Join a study group or create your own to collaborate with friends.</p>
                    </div>
                )}
            </div>

        </AnimatedPage>
    );
}
