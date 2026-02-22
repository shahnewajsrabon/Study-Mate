import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../hooks/useSocial';
import type { Group, ChatMessage, GroupMember, Challenge, Review } from '../types/social';
import ReviewCard from '../components/ReviewCard';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Send, MessageCircle, Plus, Users, Hash, ChevronLeft, Loader2, Copy, LogOut, Trophy, Target, Flame, Calendar, PlusCircle, CheckCircle2, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedPage from '../components/AnimatedPage';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

// Helper for date formatting
const formatTime = (timestamp: { toDate: () => Date } | number | Date | null | undefined) => {
    if (!timestamp) return '...';
    // Firestore timestamp to Date
    const date = typeof timestamp === 'object' && 'toDate' in timestamp && typeof timestamp.toDate === 'function' ? timestamp.toDate() : new Date(timestamp as string | number | Date);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function Chat() {
    const { user } = useAuth();
    const { groups, challenges, reviews, createGroup, joinGroup, sendMessage, leaveGroup, createChallenge, joinChallenge } = useSocial();

    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [chatTab, setChatTab] = useState<'chat' | 'challenges' | 'leaderboard' | 'reviews'>('chat');
    const bottomRef = useRef<HTMLDivElement>(null);

    // Initial Selection (Desktop Only)
    useEffect(() => {
        const isMobile = window.innerWidth < 768;
        if (!selectedGroup && groups.length > 0 && !isMobile) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedGroup(groups[0]);
        }
    }, [groups, selectedGroup]);

    // Load Messages for Selected Group
    useEffect(() => {
        if (!selectedGroup) return;

        // But doing it synchronously inside useEffect triggers the warning.
        // Better: depend on selectedGroup.id and let the new snapshot replace messages.
        // For now, let's just remove the explicit clear and trust the snapshot listener to fire quickly.
        // Or if we want to clear, use a ref or cleanup function?
        // Let's rely on snapshot.

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

        return () => {
            unsubscribe();
            setMessages([]); // Cleanup function runs when effect unmounts or before re-running. This is safe!
        };
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
            <div className={`md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 ${selectedGroup ? 'hidden' : 'flex'}`}>
                <div className="flex items-center gap-2">
                    <Users className="w-6 h-6 text-indigo-500" />
                    <span className="font-bold text-slate-800 dark:text-white truncate max-w-[200px]">
                        Study Groups
                    </span>
                </div>
            </div>

            {/* Mobile Chat Header (Only visible when group selected) */}
            {selectedGroup && (
                <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => setSelectedGroup(null)}
                        className="flex items-center gap-2 text-slate-600 dark:text-slate-300"
                        title="Back to group list"
                        aria-label="Back to group list"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        <span className="font-medium">Back</span>
                    </button>
                    <span className="font-bold text-slate-800 dark:text-white truncate max-w-[150px]">
                        {selectedGroup.name}
                    </span>
                    {(selectedGroup.id !== 'global-study-lounge' && selectedGroup.inviteCode !== 'GLOBAL') ? (
                        <button
                            onClick={handleLeave}
                            className="text-red-500"
                            title="Leave Group"
                            aria-label="Leave Group"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    ) : (
                        <div className="w-5" /> // Spacer
                    )}
                </div>
            )}

            {/* Sidebar (Group List) */}
            <div
                className={`flex-col bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 w-full md:w-72 md:flex ${selectedGroup ? 'hidden' : 'flex'}`}
            >
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 hidden md:flex justify-between items-center">
                    <h2 className="font-bold text-xl text-slate-800 dark:text-white flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-500" />
                        My Groups
                    </h2>
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
                    {groups.map((group: Group) => (
                        <button
                            key={group.id}
                            onClick={() => {
                                setSelectedGroup(group);
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
                                (group.id === 'global-study-lounge' || group.inviteCode === 'GLOBAL') ? "bg-amber-500" : (selectedGroup?.id === group.id ? "bg-indigo-500" : "bg-slate-400")
                            )}>
                                {(group.id === 'global-study-lounge' || group.inviteCode === 'GLOBAL') ? "🌍" : group.name[0].toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <div className={cn("font-medium text-sm flex items-center justify-between", selectedGroup?.id === group.id ? "text-indigo-900 dark:text-indigo-100" : "text-slate-700 dark:text-slate-300")}>
                                    {group.name}
                                    {(group.id === 'global-study-lounge' || group.inviteCode === 'GLOBAL') && (
                                        <span className="text-[8px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Public</span>
                                    )}
                                </div>
                                <div className="text-xs text-slate-500 truncate max-w-[140px]">
                                    {group.members.length} members
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`flex-1 flex-col bg-white dark:bg-slate-800 relative md:flex ${selectedGroup ? 'flex' : 'hidden'}`}>
                {selectedGroup ? (
                    <>
                        {/* Header */}
                        <div className="flex flex-col border-b border-slate-100 dark:border-slate-700 shadow-sm z-10 bg-white dark:bg-slate-800">
                            <div className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setSelectedGroup(null)}
                                        className="md:hidden p-1 text-slate-500"
                                        title="Back to group list"
                                        aria-label="Back to group list"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <div>
                                        <h2 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                                            {selectedGroup.name}
                                            <span className="text-xs font-normal px-2 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 rounded-full">
                                                {selectedGroup.members.length} Members
                                            </span>
                                        </h2>
                                        <p className="text-xs text-slate-500 hidden md:block">{selectedGroup.description || "No description set"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={copyInviteCode} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500" title="Copy Invite Code">
                                        <Copy className="w-5 h-5" />
                                    </button>
                                    {(selectedGroup.id !== 'global-study-lounge' && selectedGroup.inviteCode !== 'GLOBAL') && (
                                        <button onClick={handleLeave} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500" title="Leave Group">
                                            <LogOut className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex px-4 border-t border-slate-50 dark:border-slate-700/50">
                                <button
                                    onClick={() => setChatTab('chat')}
                                    className={cn(
                                        "py-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2",
                                        chatTab === 'chat' ? "border-indigo-500 text-indigo-600 dark:text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    Chat
                                </button>
                                <button
                                    onClick={() => setChatTab('challenges')}
                                    className={cn(
                                        "py-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2",
                                        chatTab === 'challenges' ? "border-indigo-500 text-indigo-600 dark:text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    <Trophy className="w-4 h-4" />
                                    Challenges
                                </button>
                                <button
                                    onClick={() => setChatTab('leaderboard')}
                                    className={cn(
                                        "py-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2",
                                        chatTab === 'leaderboard' ? "border-indigo-500 text-indigo-600 dark:text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    <Flame className="w-4 h-4" />
                                    Leaderboard
                                </button>
                                <button
                                    onClick={() => setChatTab('reviews')}
                                    className={cn(
                                        "py-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2",
                                        chatTab === 'reviews' ? "border-indigo-500 text-indigo-600 dark:text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    <Heart className="w-4 h-4 text-red-500 fill-current" />
                                    Wall of Love
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-hidden flex flex-col">
                            {chatTab === 'chat' && (
                                <>
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

                                    {/* Chat Input */}
                                    <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                                        <form onSubmit={handleSendMessage} className="flex gap-2">
                                            <input
                                                value={newMessage}
                                                onChange={e => setNewMessage(e.target.value)}
                                                placeholder={`Message #${selectedGroup.name}`}
                                                className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-xl border-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                            <button
                                                disabled={sending || !newMessage.trim()}
                                                className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50"
                                                title="Send Message"
                                                aria-label="Send Message"
                                            >
                                                {sending ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
                                            </button>
                                        </form>
                                    </div>
                                </>
                            )}

                            {chatTab === 'challenges' && (
                                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-900/50">
                                    <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                                        <div>
                                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                                <Trophy className="w-5 h-5 text-yellow-500" />
                                                Group Challenges
                                            </h3>
                                            <p className="text-xs text-slate-500">Achieve study goals together!</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const title = prompt("Challenge Title (e.g., Weekend Warrior):");
                                                if (!title) return;
                                                const xp = parseInt(prompt("Goal XP:") || "1000");
                                                const days = parseInt(prompt("Duration in days:") || "7");
                                                createChallenge(selectedGroup.id, title, xp, days);
                                            }}
                                            className="p-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 transition-colors"
                                            title="Create Challenge"
                                            aria-label="Create Challenge"
                                        >
                                            <PlusCircle className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="grid gap-4">
                                        {challenges.filter((c: Challenge) => c.groupId === selectedGroup.id).length === 0 && (
                                            <div className="text-center py-12 text-slate-400">
                                                <Target className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                                <p>No active challenges for this group.</p>
                                                <p className="text-xs">Create one to motivate your team!</p>
                                            </div>
                                        )}
                                        {challenges.filter((c: Challenge) => c.groupId === selectedGroup.id).map((challenge: Challenge) => {
                                            const isParticipating = challenge.participants.includes(user?.uid || '');
                                            const daysLeft = Math.ceil((new Date(challenge.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));

                                            return (
                                                <motion.div
                                                    key={challenge.id}
                                                    layout
                                                    className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 group hover:border-indigo-500/30 transition-all"
                                                >
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <h4 className="font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors">
                                                                {challenge.title}
                                                            </h4>
                                                            <div className="flex items-center gap-3 mt-1">
                                                                <span className="text-xs flex items-center gap-1 text-slate-500">
                                                                    <Flame className="w-3 h-3 text-orange-500" />
                                                                    {challenge.goalXP} XP Goal
                                                                </span>
                                                                <span className="text-xs flex items-center gap-1 text-slate-500">
                                                                    <Calendar className="w-3 h-3" />
                                                                    {daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {!isParticipating && daysLeft > 0 && (
                                                            <button
                                                                onClick={() => joinChallenge(challenge.id)}
                                                                className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-full hover:bg-indigo-700 shadow-lg shadow-indigo-500/20"
                                                            >
                                                                Join
                                                            </button>
                                                        )}
                                                        {isParticipating && (
                                                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-bold rounded-full flex items-center gap-1">
                                                                <CheckCircle2 className="w-3 h-3" /> Joined
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <div className="flex -space-x-2">
                                                            {challenge.participants.slice(0, 5).map((pId: string) => (
                                                                <div key={pId} className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-500">
                                                                    {pId[0].toUpperCase()}
                                                                </div>
                                                            ))}
                                                            {challenge.participants.length > 5 && (
                                                                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-500">
                                                                    +{challenge.participants.length - 5}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="text-[10px] text-slate-400">
                                                            {challenge.participants.length} students participating
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {chatTab === 'leaderboard' && (
                                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-900/50">
                                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                                        <div className="bg-indigo-600 p-6 text-white">
                                            <h3 className="text-xl font-bold flex items-center gap-2">
                                                <Flame className="w-6 h-6" />
                                                Group Standings
                                            </h3>
                                            <p className="text-indigo-100 text-sm mt-1">Real-time ranking of study partners</p>
                                        </div>

                                        <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                            {selectedGroup.members.map((member: GroupMember, index: number) => (
                                                <div key={member.userId} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                                                            index === 0 ? "bg-yellow-100 text-yellow-700" :
                                                                index === 1 ? "bg-slate-100 text-slate-500" :
                                                                    index === 2 ? "bg-orange-100 text-orange-700" : "text-slate-400"
                                                        )}>
                                                            {index + 1}
                                                        </div>
                                                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold">
                                                            {member.name[0]}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                                                {member.name}
                                                                {member.userId === user?.uid && <span className="text-[10px] bg-indigo-500 text-white px-1.5 rounded-full">Me</span>}
                                                            </div>
                                                            <div className="text-xs text-slate-500">Joined {new Date(member.joinedAt).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-indigo-600 dark:text-indigo-400">... XP</div>
                                                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{member.role}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {chatTab === 'reviews' && (
                                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-900/50">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="p-2.5 bg-red-50 dark:bg-red-900/30 rounded-2xl text-red-500 shadow-sm">
                                            <Heart className="w-6 h-6 fill-current" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Wall of Love</h2>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Real appreciation from our community members</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {reviews.map((review: Review) => (
                                            <motion.div
                                                key={review.id}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ type: "spring", stiffness: 100 }}
                                            >
                                                <ReviewCard review={review} />
                                            </motion.div>
                                        ))}
                                    </div>

                                    {reviews.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                            <Heart className="w-16 h-16 mb-4 opacity-20" />
                                            <p className="font-bold text-lg">No reviews yet</p>
                                            <p className="text-sm max-w-[250px] text-center mt-2 font-medium opacity-80">Be the first to share your experience from the settings page!</p>
                                        </div>
                                    )}
                                </div>
                            )}
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
        </AnimatedPage >
    );
}
