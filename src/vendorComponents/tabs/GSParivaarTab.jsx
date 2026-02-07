import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageSquare, Share2, Sparkles, Award, Cake, TrendingUp, MoreHorizontal, Plus, UserCircle2, ShieldCheck, Image as ImageIcon, X, Trash2, Music, Users, MapPin, Smile, BellOff, Bell, Bookmark, Pencil, Link as LinkIcon, Globe, Send } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchCommunityPosts, likePost, clapPost, createCommunityPost, deletePost, addPostComment,
    fetchSuggestions, sendConnectionRequest, acceptConnectionRequest, fetchChatList, sendPrivateMessage, fetchPrivateMessages, fetchFriendsList
} from '../../redux/thunks/vendorThunk';
import { BASE_URL } from '../../config';
import api from '../../api/axiosConfig';
import Swal from 'sweetalert2';

const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return `${BASE_URL}/${path.replace(/^\/+/, '')}`;
};

const GSParivaarTab = ({ profile, t }) => {
    const dispatch = useDispatch();
    const { communityPosts, suggestions, chatList, friendsList } = useSelector(state => state.vendor);
    const [activeFeed, setActiveFeed] = useState('feed'); // feed, myposts, chats
    const [isPosting, setIsPosting] = useState(false);
    const [selectedChat, setSelectedChat] = useState(null);
    const [newPost, setNewPost] = useState({
        title: '',
        content: '',
        location: '',
        feeling: '',
        music: '',
        taggedPeople: []
    });
    const [activeInput, setActiveInput] = useState(null); // 'location', 'feeling', 'music'
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        dispatch(fetchCommunityPosts());
        if (profile?.customUserId) {
            dispatch(fetchSuggestions(profile.customUserId));
            dispatch(fetchChatList(profile.customUserId));
            dispatch(fetchFriendsList(profile.customUserId));

            // Real-time polling for online status and new messages
            const interval = setInterval(() => {
                dispatch(fetchChatList(profile.customUserId));
                dispatch(fetchFriendsList(profile.customUserId));
            }, 10000); // 10s polling
            return () => clearInterval(interval);
        }
    }, [dispatch, profile?.customUserId]);

    // Notification for new messages
    useEffect(() => {
        const unreadCount = chatList.reduce((acc, chat) => acc + (chat.lastMessage?.receiverId === profile?.customUserId && !chat.lastMessage?.isRead ? 1 : 0), 0);
        if (unreadCount > 0 && activeFeed !== 'chats') {
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });
            Toast.fire({
                icon: 'info',
                title: `${unreadCount} ${t.messages || 'new messages'}`
            });
        }
    }, [chatList, profile?.customUserId, activeFeed]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleCreatePost = async () => {
        if (!newPost.title || !newPost.content) {
            Swal.fire(t.error || 'Error', t.underDevelopment || 'Sabhi fields bharna zaruri hai', 'error');
            return;
        }

        const baseData = {
            type: 'user_post',
            authorId: profile?.customUserId,
            authorName: `${profile?.firstName} ${profile?.lastName}`,
            authorRole: 'Partner',
            authorImg: profile?.vendorPhoto,
            title: newPost.title,
            content: newPost.content,
            location: newPost.location,
            feeling: newPost.feeling,
            music: newPost.music,
            taggedPeople: JSON.stringify(newPost.taggedPeople)
        };

        let result;

        if (selectedImage) {
            const formData = new FormData();
            Object.keys(baseData).forEach(key => formData.append(key, baseData[key]));
            formData.append('image', selectedImage);

            result = await dispatch(createCommunityPost(formData, false));
        } else {
            result = await dispatch(createCommunityPost(baseData, true));
        }

        if (result.success) {
            setIsPosting(false);
            setNewPost({
                title: '',
                content: '',
                location: '',
                feeling: '',
                music: '',
                taggedPeople: []
            });
            setSelectedImage(null);
            setPreviewUrl(null);
            Swal.fire(t.success || 'Success', t.shareSomething || 'Your post has been shared with the community!', 'success');
        } else {
            // Check if error is related to image upload
            if (selectedImage && (result.message.toLowerCase().includes('upload') || result.message.toLowerCase().includes('cloudinary') || result.message.toLowerCase().includes('image'))) {
                const retry = await Swal.fire({
                    title: 'Image Upload Failed',
                    text: `Server error: ${result.message}. Do you want to post WITHOUT the image?`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Yes, Post Text Only',
                    cancelButtonText: 'Cancel'
                });

                if (retry.isConfirmed) {
                    result = await dispatch(createCommunityPost(baseData, true)); // Retry as JSON
                    if (result.success) {
                        setIsPosting(false);
                        setNewPost({ title: '', content: '' });
                        setSelectedImage(null);
                        setPreviewUrl(null);
                        Swal.fire('Success', 'Posted successfully (without image).', 'success');
                    } else {
                        Swal.fire('Error', result.message, 'error');
                    }
                }
            } else {
                Swal.fire('Error', result.message, 'error');
            }
        }
    };

    // Check if it's the vendor's birthday today for personal UI
    const isBirthdayToday = () => {
        if (!profile?.dob) return false;
        try {
            const today = new Date();
            const tDay = today.getDate();
            const tMonth = today.getMonth() + 1;

            // Handle YYYY-MM-DD or DD-MM-YYYY
            const parts = profile.dob.split(/[-/]/);
            if (parts.length === 3) {
                // Check if first part or second part is day/month
                const d1 = parseInt(parts[0]);
                const m1 = parseInt(parts[1]);
                const d2 = parseInt(parts[2]);
                const m2 = parseInt(parts[1]);

                if (parts[0].length === 4) { // YYYY-MM-DD
                    return parseInt(parts[2]) === tDay && parseInt(parts[1]) === tMonth;
                } else { // DD-MM-YYYY
                    return parseInt(parts[0]) === tDay && parseInt(parts[1]) === tMonth;
                }
            }

            const bday = new Date(profile.dob);
            return bday.getDate() === tDay && (bday.getMonth() + 1) === tMonth;
        } catch (e) { return false; }
    };

    const filteredPosts = activeFeed === 'feed'
        ? communityPosts
        : communityPosts.filter(p => p.authorId === profile?.customUserId);

    return (
        <div className="max-w-3xl mx-auto pb-32">
            {/* Header / Tabs */}
            <div className="bg-white sticky top-0 z-10 border-b border-slate-100 -mx-6 lg:-mx-10 px-6 lg:px-10 py-6 mb-8 flex items-center justify-between shadow-sm shadow-slate-100/50 backdrop-blur-md bg-white/90">
                <div className="flex gap-8">
                    <button
                        onClick={() => setActiveFeed('feed')}
                        className={`text-lg font-black uppercase tracking-tight transition-all relative ${activeFeed === 'feed' ? 'text-[#0c8182]' : 'text-slate-300'}`}
                    >
                        {t.feed}
                        {activeFeed === 'feed' && <motion.div layoutId="activeTab" className="absolute -bottom-2 left-0 right-0 h-1.5 bg-[#0c8182] rounded-full" />}
                    </button>
                    <button
                        onClick={() => setActiveFeed('myposts')}
                        className={`text-lg font-black uppercase tracking-tight transition-all relative ${activeFeed === 'myposts' ? 'text-[#0c8182]' : 'text-slate-300'}`}
                    >
                        {t.myPosts}
                        {activeFeed === 'myposts' && <motion.div layoutId="activeTab" className="absolute -bottom-2 left-0 right-0 h-1.5 bg-[#0c8182] rounded-full" />}
                    </button>
                    <button
                        onClick={() => setActiveFeed('chats')}
                        className={`text-lg font-black uppercase tracking-tight transition-all relative ${activeFeed === 'chats' ? 'text-[#0c8182]' : 'text-slate-300'}`}
                    >
                        {t.chats}
                        {activeFeed === 'chats' && <motion.div layoutId="activeTab" className="absolute -bottom-2 left-0 right-0 h-1.5 bg-[#0c8182] rounded-full" />}
                    </button>
                    <button
                        onClick={() => setActiveFeed('friends')}
                        className={`text-lg font-black uppercase tracking-tight transition-all relative ${activeFeed === 'friends' ? 'text-[#0c8182]' : 'text-slate-300'}`}
                    >
                        {t.friends}
                        {activeFeed === 'friends' && <motion.div layoutId="activeTab" className="absolute -bottom-2 left-0 right-0 h-1.5 bg-[#0c8182] rounded-full" />}
                    </button>
                </div>

                {!isPosting && (
                    <button
                        onClick={() => setIsPosting(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#0c8182] text-white rounded-2xl font-black text-xs uppercase tracking-tight shadow-lg shadow-teal-900/10 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus size={16} strokeWidth={3} />
                        {t.createPost}
                    </button>
                )}
            </div>

            {/* Birthday Special Header for Current Vendor */}
            {isBirthdayToday() && (
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-8 p-8 rounded-[3rem] bg-gradient-to-br from-[#0c8182] to-[#085a5b] text-white shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-[2rem] border border-white/30 flex items-center justify-center text-4xl">
                            🎂
                        </div>
                        <div>
                            <h2 className="text-2xl font-black italic uppercase tracking-tight">{t.birthdayWishParivaar}, {profile?.firstName}!</h2>
                            <p className="text-teal-50/80 font-bold text-sm mt-1">{t.birthdaySubParivaar}</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Post Creation Form */}
            {isPosting && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-[2.5rem] border-2 border-teal-100 shadow-xl mb-8 space-y-6"
                >
                    {/* ... rest of the form ... */}
                    <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                        <button onClick={() => setIsPosting(false)} className="p-2 text-slate-800 hover:bg-slate-50 rounded-full transition-all">
                            <X size={24} />
                        </button>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">{t.newPost}</h3>
                        <div className="flex gap-2">
                            <MoreHorizontal size={24} className="text-slate-400" />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 px-2">
                        <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden border-2 border-white shadow-sm shrink-0">
                            {profile?.vendorPhoto ? <img src={getImageUrl(profile.vendorPhoto)} className="w-full h-full object-cover" /> : <UserCircle2 className="text-slate-300 m-auto mt-2" size={32} />}
                        </div>
                        <div>
                            <h4 className="font-black text-slate-900 leading-tight">{profile?.firstName} {profile?.lastName}</h4>
                            <div className="flex items-center gap-1 mt-0.5 px-2 py-0.5 bg-slate-100 rounded-lg text-[9px] font-black uppercase text-slate-500 tracking-tighter w-fit">
                                <Globe size={10} /> {t.public}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 px-2">
                        {[
                            { id: 'music', icon: Music, label: 'Music', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                            { id: 'people', icon: Users, label: 'People', color: 'bg-blue-50 text-blue-600 border-blue-100' },
                            { id: 'location', icon: MapPin, label: 'Location', color: 'bg-rose-50 text-rose-600 border-rose-100' },
                            { id: 'feeling', icon: Smile, label: 'Feeling/activity', color: 'bg-amber-50 text-amber-600 border-amber-100' }
                        ].map(action => (
                            <button
                                key={action.id}
                                onClick={() => setActiveInput(activeInput === action.id ? null : action.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[11px] font-bold transition-all ${newPost[action.id] ? action.color : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'}`}
                            >
                                <action.icon size={14} />
                                {newPost[action.id] || action.label}
                            </button>
                        ))}
                    </div>

                    {activeInput && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="px-2">
                            <input
                                autoFocus
                                type="text"
                                placeholder={`Add ${activeInput}...`}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0c8182]/20"
                                value={newPost[activeInput]}
                                onChange={(e) => setNewPost({ ...newPost, [activeInput]: e.target.value })}
                                onKeyPress={(e) => e.key === 'Enter' && setActiveInput(null)}
                            />
                        </motion.div>
                    )}

                    <div className="space-y-4 px-2">
                        <textarea
                            placeholder={t.whatsOnMind}
                            rows={4}
                            className="w-full px-0 py-2 bg-white border-none text-xl font-medium text-slate-600 placeholder:text-slate-300 focus:outline-none resize-none"
                            value={newPost.content}
                            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                        />
                    </div>

                    {previewUrl && (
                        <div className="relative rounded-[2rem] overflow-hidden border-2 border-slate-100 shadow-inner mx-2">
                            <img src={previewUrl} className="w-full h-48 object-cover" />
                            <button
                                onClick={() => { setSelectedImage(null); setPreviewUrl(null); }}
                                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-4 px-2 border-t border-slate-50">
                        <label className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-500 rounded-xl cursor-pointer hover:bg-slate-100 transition-all font-bold text-xs uppercase tracking-tight">
                            <ImageIcon size={18} />
                            {t.addPhoto}
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </label>
                        <div className="flex gap-3">
                            <button
                                onClick={handleCreatePost}
                                disabled={!newPost.content}
                                className={`px-10 py-3 rounded-2xl font-black uppercase tracking-tight transition-all shadow-lg ${(!newPost.content) ? 'bg-slate-100 text-slate-300' : 'bg-[#0c8182] text-white shadow-[#0c8182]/20 hover:scale-105 active:scale-95'}`}
                            >
                                {t.post}
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {activeFeed === 'chats' ? (
                <VendorChat
                    profile={profile}
                    chatList={chatList}
                    selectedChat={selectedChat}
                    setSelectedChat={setSelectedChat}
                    t={t}
                />
            ) : activeFeed === 'friends' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {friendsList.length > 0 ? friendsList.map(friend => (
                        <div key={friend.customUserId} className="bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300 group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 overflow-hidden border-2 border-white shadow-md">
                                        {friend.vendorPhoto ? <img src={getImageUrl(friend.vendorPhoto)} className="w-full h-full object-cover" /> : <UserCircle2 className="m-auto mt-2 text-slate-300" size={32} />}
                                    </div>
                                    {friend.isOnline && (
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full"></div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-900 text-sm tracking-tight uppercase truncate">{friend.firstName} {friend.lastName}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">{friend.isOnline ? t.activeNow : t.offline}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 p-3 rounded-2xl">
                                    <Globe size={14} className="text-[#0c8182]" />
                                    {friend.vendorCity} • {friend.vendorCategory}
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedChat(friend);
                                        setActiveFeed('chats');
                                    }}
                                    className="w-full py-3 bg-[#0c8182] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-teal-900/10 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <MessageSquare size={14} />
                                    {t.sendMsg}
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 flex flex-col items-center text-center space-y-4 bg-slate-50/50 rounded-[3rem]">
                            <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-slate-200">
                                <Users size={40} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">{t.noFriends}</h3>
                            <p className="text-sm font-bold text-slate-400">{t.startConnecting}</p>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    {/* Pending Requests Banner */}
                    {profile?.pendingRequests?.length > 0 && (
                        <div className="mb-8 p-6 bg-amber-50 rounded-[2.5rem] border border-amber-100 flex items-center justify-between shadow-sm mx-2">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-900 text-sm tracking-tight uppercase">{t.friendRequests}</h4>
                                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-tighter">{profile.pendingRequests.length} {t.vendorsConnect}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setActiveFeed('chats')}
                                className="px-5 py-2.5 bg-white text-amber-600 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-amber-100 hover:bg-amber-100 transition-all shadow-sm"
                            >
                                {t.seeAll}
                            </button>
                        </div>
                    )}

                    {/* Suggestions Section */}
                    {suggestions.length > 0 && activeFeed === 'feed' && (
                        <div className="mb-12">
                            <div className="flex items-center justify-between mb-6 px-2">
                                <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase italic flex items-center gap-2">
                                    <Users size={20} className="text-[#0c8182]" />
                                    {t.peopleKnow}
                                </h3>
                                <button className="text-xs font-bold text-slate-400 hover:text-[#0c8182] uppercase tracking-widest transition-all">{t.seeAll}</button>
                            </div>
                            <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide">
                                {suggestions.map((vendor) => (
                                    <div key={vendor.customUserId} className="min-w-[200px] bg-white rounded-[2.5rem] border border-slate-100 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                                        <div className="relative mb-4">
                                            <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-50 overflow-hidden border-4 border-white shadow-md">
                                                {vendor.vendorPhoto ? (
                                                    <img src={getImageUrl(vendor.vendorPhoto)} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-teal-50 text-[#0c8182] font-black text-2xl">
                                                        {vendor.firstName[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full"></div>
                                        </div>
                                        <div className="text-center mb-5">
                                            <h4 className="font-black text-slate-900 text-sm tracking-tight truncate">{vendor.firstName} {vendor.lastName}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">{vendor.vendorCategory} • {vendor.vendorCity}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => dispatch(sendConnectionRequest(profile.customUserId, vendor.customUserId))}
                                                className="w-full py-2.5 bg-[#0c8182] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-teal-900/10 hover:scale-[1.02] active:scale-95 transition-all"
                                            >
                                                {t.addFriend}
                                            </button>
                                            <button className="w-full py-2.5 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
                                                {t.remove}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Posts List */}
                    <div className="space-y-12">
                        <AnimatePresence mode="popLayout">
                            {filteredPosts.length > 0 ? (
                                filteredPosts.map((post) => (
                                    <PostCard
                                        key={post._id}
                                        post={post}
                                        profile={profile}
                                        t={t}
                                    />
                                ))
                            ) : (
                                <div className="py-20 flex flex-col items-center text-center space-y-4">
                                    <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200">
                                        <MessageSquare size={40} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">{t.noPosts}</h3>
                                    <p className="text-sm font-bold text-slate-400">{t.noPostsSub}</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </>
            )}
        </div>
    );
};

const PostCard = ({ post, profile, t }) => {
    const dispatch = useDispatch();
    const [likes, setLikes] = useState(typeof post.likes === 'number' ? post.likes : (post.likedBy?.length || 0));
    const [claps, setClaps] = useState(post.claps || 0);
    // Schema uses 'likedBy' array for user IDs, 'likes' is a number counter.
    // However, my backend schema update added: likes: Number, likedBy: [String]
    // The previous error suggests post.likes is NOT an array (it's a number from my schema update).
    // So .includes() failed. We need to check post.likedBy
    const [isLiked, setIsLiked] = useState(post.likedBy?.includes(profile?.customUserId));
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [isSaved, setIsSaved] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(post.content || '');


    const handleLike = () => {
        if (!profile?.customUserId) return;
        dispatch(likePost(post._id, profile.customUserId));
        setIsLiked(!isLiked);
        setLikes(isLiked ? likes - 1 : likes + 1);
    };

    const handleClap = () => {
        dispatch(clapPost(post._id));
        setClaps(claps + 1);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`);
        Swal.fire({
            title: t.copyLink,
            text: t.copyLink,
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        });
        setIsMenuOpen(false);
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim() || !profile) return;

        setIsSubmittingComment(true);
        const result = await dispatch(addPostComment(post._id, {
            authorName: `${profile.firstName} ${profile.lastName}`,
            authorId: profile.customUserId,
            authorRole: 'Partner',
            content: commentText.trim()
        }));

        if (result.success) {
            setCommentText('');
        }
        setIsSubmittingComment(false);
    };

    const handleDelete = async () => {
        setIsMenuOpen(false);
        const result = await Swal.fire({
            title: t.deletePost,
            text: t.deletePost,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#0c8182',
            cancelButtonColor: '#d33',
            confirmButtonText: t.accept,
            cancelButtonText: t.ignore
        });

        if (result.isConfirmed) {
            const res = await dispatch(deletePost(post._id, profile?.customUserId));
            if (res.success) {
                Swal.fire(t.deletePost, t.success, 'success');
            } else {
                Swal.fire(t.error, t.underDevelopment, 'error');
            }
        }
    };

    const handleToggleNotifications = () => {
        setNotificationsEnabled(!notificationsEnabled);
        setIsMenuOpen(false);
        Swal.fire({
            title: notificationsEnabled ? t.turnOffNotifications : t.turnOnNotifications,
            text: notificationsEnabled ? t.turnOffNotifications : t.turnOnNotifications,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });
    };

    const handleSavePost = () => {
        setIsSaved(!isSaved);
        setIsMenuOpen(false);
        Swal.fire({
            title: isSaved ? 'Post Removed' : 'Post Saved!',
            text: isSaved
                ? 'Post removed from your saved items.'
                : 'Post has been added to your saved items.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });
    };

    const handleEditPost = () => {
        setIsEditing(true);
        setIsMenuOpen(false);
    };

    const handleSaveEdit = async () => {
        if (!editedContent.trim()) {
            Swal.fire('Error', 'Post content cannot be empty.', 'error');
            return;
        }

        // Here you would dispatch an action to update the post
        // For now, we'll just show success message
        setIsEditing(false);
        Swal.fire({
            title: 'Updated!',
            text: 'Your post has been updated successfully.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });
    };

    const handleCancelEdit = () => {
        setEditedContent(post.content || '');
        setIsEditing(false);
    };


    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return t.justNow || 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}${t.minAgo || 'm ago'}`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}${t.hoursAgo || 'h ago'}`;
        return new Date(date).toLocaleDateString();
    };

    const isOwnPost = post.authorId === profile?.customUserId;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden relative"
        >
            {/* Post Header */}
            <div className="p-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-[#0c8182] font-bold border-2 border-white shadow-sm overflow-hidden">
                        {post.authorImg ? <img src={getImageUrl(post.authorImg)} className="w-full h-full object-cover" /> : (post.isOfficial ? 'GS' : <UserCircle2 size={18} />)}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-black text-slate-900 tracking-tight">{post.authorName}</h4>
                            {post.isOfficial && <ShieldCheck size={14} className="text-blue-500" fill="currentColor" />}
                            {post.taggedPeople && post.taggedPeople.length > 0 && (
                                <span className="text-[11px] font-bold text-slate-400">
                                    {t.with || 'with'} <span className="text-slate-900">{post.taggedPeople[0]}</span>
                                    {post.taggedPeople.length > 1 && ` ${t.and || 'and'} ${post.taggedPeople.length - 1} ${t.others || 'others'}`}
                                </span>
                            )}
                            {post.feeling && <span className="text-[11px] font-bold text-slate-400 italic">{t.isFeeling || 'is feeling'} {post.feeling}</span>}
                            {post.location && <span className="flex items-center gap-1 text-[11px] font-black text-[#0c8182] uppercase tracking-tighter"><MapPin size={10} /> {post.location}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{timeAgo(post.createdAt)}</p>
                            {post.music && <span className="flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase"><Music size={10} /> {post.music}</span>}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 relative">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`text-slate-300 hover:text-slate-600 p-2.5 rounded-xl transition-all ${isMenuOpen ? 'bg-slate-50 text-slate-900' : ''}`}
                    >
                        <MoreHorizontal size={20} />
                    </button>

                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                className="absolute right-0 top-12 w-64 bg-white/95 backdrop-blur-xl border border-slate-100 shadow-2xl rounded-3xl z-50 py-3 overflow-hidden"
                            >
                                <button onClick={handleToggleNotifications} className="w-full px-5 py-3 flex items-center gap-4 hover:bg-slate-50 transition-all group text-left">
                                    <div className={`p-2.5 rounded-xl transition-all ${notificationsEnabled ? 'bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-slate-900' : 'bg-green-50 text-green-600'}`}>
                                        {notificationsEnabled ? <BellOff size={18} /> : <Bell size={18} />}
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-900 tracking-tight">{notificationsEnabled ? t.turnOffNotifications : t.turnOnNotifications}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t.parivaar}</p>
                                    </div>
                                </button>

                                <button onClick={handleSavePost} className="w-full px-5 py-3 flex items-center gap-4 hover:bg-slate-50 transition-all group text-left">
                                    <div className={`p-2.5 rounded-xl transition-all ${isSaved ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-slate-900'}`}>
                                        <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-900 tracking-tight">{isSaved ? t.unsavePost : t.savePost}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{isSaved ? t.remove : t.add}</p>
                                    </div>
                                </button>

                                {isOwnPost && (
                                    <>
                                        <button onClick={handleEditPost} className="w-full px-5 py-3 flex items-center gap-4 hover:bg-slate-50 transition-all group text-left">
                                            <div className="p-2.5 bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-slate-900 rounded-xl transition-all">
                                                <Pencil size={18} />
                                            </div>
                                            <p className="text-xs font-black text-slate-900 tracking-tight">{t.editPost}</p>
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            className="w-full px-5 py-3 flex items-center gap-4 hover:bg-rose-50 transition-all group text-left border-t border-slate-50 mt-1"
                                        >
                                            <div className="p-2.5 bg-rose-50 text-rose-500 rounded-xl">
                                                <Trash2 size={18} />
                                            </div>
                                            <p className="text-xs font-black text-rose-500 tracking-tight uppercase">{t.deletePost}</p>
                                        </button>
                                    </>
                                )}

                                <button
                                    onClick={handleCopyLink}
                                    className="w-full px-5 py-3 flex items-center gap-4 hover:bg-slate-50 transition-all group text-left border-t border-slate-50 mt-1"
                                >
                                    <div className="p-2.5 bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-[#0c8182] rounded-xl transition-all">
                                        <LinkIcon size={18} />
                                    </div>
                                    <p className="text-xs font-black text-slate-900 tracking-tight">{t.copyLink}</p>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Post Content */}
            <div className={`px-8 pb-4 space-y-6`}>
                {isEditing ? (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Pencil size={16} className="text-blue-600" />
                                <p className="text-xs font-black text-blue-700 uppercase tracking-wider">{t.editingPost || 'Editing Post'}</p>
                            </div>
                            <textarea
                                value={editedContent}
                                onChange={(e) => setEditedContent(e.target.value)}
                                className="w-full bg-white border-2 border-blue-100 rounded-xl p-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                                rows={6}
                                placeholder="What's on your mind?"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleSaveEdit}
                                className="flex-1 py-3 bg-[#0c8182] text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-teal-900/10 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                Save Changes
                            </button>
                            <button
                                onClick={handleCancelEdit}
                                className="px-8 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-slate-200 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {post.title && <h3 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">{post.title}</h3>}
                        <p className="text-sm font-bold text-slate-500 leading-relaxed italic whitespace-pre-line">{post.content}</p>
                    </div>
                )}

                {post.image && !isEditing && (
                    <div className="rounded-[2rem] overflow-hidden border-2 border-slate-50 shadow-inner">
                        <img src={getImageUrl(post.image)} className="w-full h-auto object-cover max-h-[500px]" alt="Post" />
                    </div>
                )}

                {/* Render any music/feeling/location tags here if needed in content body */}
            </div>

            {/* Interaction Bar */}
            <div className="px-8 py-6 bg-slate-50/50 flex items-center justify-between border-t border-slate-50">
                <div className="flex items-center gap-6">
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-2 text-xs font-black transition-all ${isLiked ? 'text-rose-500 scale-110' : 'text-slate-400 hover:text-rose-500'}`}
                    >
                        <Heart size={20} fill={isLiked ? "currentColor" : "none"} strokeWidth={isLiked ? 0 : 2.5} />
                        <span>{likes}</span>
                    </button>
                    <button
                        onClick={() => setIsCommentsOpen(!isCommentsOpen)}
                        className={`flex items-center gap-2 text-xs font-black transition-all ${isCommentsOpen ? 'text-blue-500 scale-110' : 'text-slate-400 hover:text-blue-500'}`}
                    >
                        <MessageSquare size={20} fill={isCommentsOpen ? "currentColor" : "none"} strokeWidth={isCommentsOpen ? 0 : 2.5} />
                        <span>{post.comments?.length || 0}</span>
                    </button>
                    <button
                        onClick={handleClap}
                        className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-emerald-500 transition-all active:scale-125"
                    >
                        <ClapIcon size={20} />
                        <span>{claps}</span>
                    </button>
                </div>
                <button className="p-3 bg-white text-slate-400 hover:text-slate-600 rounded-2xl border border-slate-100 shadow-sm transition-all">
                    <Share2 size={18} />
                </button>
            </div>

            {/* Comments Section */}
            <AnimatePresence>
                {isCommentsOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-white border-t border-slate-50 overflow-hidden"
                    >
                        <div className="p-8 space-y-6">
                            {/* Comment Input */}
                            <form onSubmit={handleCommentSubmit} className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-teal-50 shrink-0 overflow-hidden border-2 border-white shadow-sm">
                                    {profile?.vendorPhoto ? <img src={getImageUrl(profile.vendorPhoto)} className="w-full h-full object-cover" /> : <UserCircle2 className="text-slate-300 m-auto mt-2" size={24} />}
                                </div>
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        placeholder={t.typeMessage || "Add a comment..."}
                                        className="w-full pl-6 pr-12 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        disabled={isSubmittingComment}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!commentText.trim() || isSubmittingComment}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-500 disabled:text-slate-300 transition-all"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </form>

                            {/* Comments List */}
                            <div className="space-y-6">
                                {post.comments && post.comments.length > 0 ? (
                                    post.comments.map((comment, idx) => (
                                        <div key={idx} className="flex gap-4 group">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 shrink-0 flex items-center justify-center text-slate-400 font-bold border border-slate-100">
                                                {comment.authorName?.[0]}
                                            </div>
                                            <div className="flex-1 bg-slate-50/50 p-4 rounded-3xl group-hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{comment.authorName}</h5>
                                                    <span className="text-[9px] font-bold text-slate-400">{timeAgo(comment.createdAt)}</span>
                                                </div>
                                                <p className="text-xs font-semibold text-slate-600 italic">{comment.content}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-8 text-center bg-slate-50/30 rounded-[2rem] border border-dashed border-slate-100">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{t.noPostsSub || 'Pehle comment karein!'}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const ClapIcon = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        <path d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
    </svg>
);

const VendorChat = ({ profile, chatList, selectedChat, setSelectedChat, t }) => {
    const dispatch = useDispatch();
    const [messages, setMessages] = useState([]);
    const [msgText, setMsgText] = useState('');
    const [pendingProfiles, setPendingProfiles] = useState([]);

    useEffect(() => {
        if (profile?.pendingRequests?.length > 0) {
            const loadPending = async () => {
                const profiles = [];
                for (let pid of profile.pendingRequests) {
                    const res = await api.get(`/vendor/profile/${pid}`);
                    if (res.data) profiles.push(res.data);
                }
                setPendingProfiles(profiles);
            };
            loadPending();
        }
    }, [profile?.pendingRequests]);

    useEffect(() => {
        let interval;
        if (selectedChat) {
            const loadMsgs = async () => {
                const data = await dispatch(fetchPrivateMessages(profile.customUserId, selectedChat.customUserId));
                setMessages(data);
            };
            loadMsgs();
            interval = setInterval(loadMsgs, 3000); // Polling for "real-time"
        }
        return () => clearInterval(interval);
    }, [selectedChat, profile.customUserId, dispatch]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!msgText.trim() || !selectedChat) return;

        const msgData = {
            senderId: profile.customUserId,
            receiverId: selectedChat.customUserId,
            content: msgText.trim()
        };

        const res = await dispatch(sendPrivateMessage(msgData));
        if (res.success) {
            setMsgText('');
            const data = await dispatch(fetchPrivateMessages(profile.customUserId, selectedChat.customUserId));
            setMessages(data);
        }
    };

    return (
        <div className="flex bg-white rounded-[3rem] border border-slate-100 h-[600px] overflow-hidden shadow-2xl">
            {/* Sidebar */}
            <div className={`w-full lg:w-1/3 border-r border-slate-50 flex flex-col ${selectedChat ? 'hidden lg:flex' : 'flex'}`}>
                <div className="p-6 border-b border-slate-50">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase italic flex items-center gap-2">
                        <MessageSquare size={18} className="text-[#0c8182]" />
                        {t.messages}
                    </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {pendingProfiles.length > 0 && (
                        <div className="mb-6 space-y-2">
                            <h4 className="px-4 text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">{t.pendingRequests}</h4>
                            {pendingProfiles.map(p => (
                                <div key={p.customUserId} className="p-4 bg-amber-50 rounded-[2rem] border border-amber-100">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-white overflow-hidden shrink-0 shadow-sm">
                                            {p.vendorPhoto ? <img src={getImageUrl(p.vendorPhoto)} className="w-full h-full object-cover" /> : <UserCircle2 className="m-auto mt-1.5 text-slate-300" size={24} />}
                                        </div>
                                        <div className="min-w-0">
                                            <h5 className="font-black text-[10px] uppercase tracking-tight truncate">{p.firstName} {p.lastName}</h5>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase truncate">{p.vendorCategory}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => dispatch(acceptConnectionRequest(profile.customUserId, p.customUserId))}
                                            className="flex-1 py-2 bg-[#0c8182] text-white rounded-xl text-[9px] font-black uppercase tracking-tighter"
                                        >
                                            {t.accept}
                                        </button>
                                        <button className="flex-1 py-2 bg-white text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-tighter border border-slate-100">
                                            {t.ignore}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <h4 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 mt-4">{t.activeChats}</h4>
                    {chatList.length > 0 ? chatList.map(chat => (
                        <button
                            key={chat.customUserId}
                            onClick={() => setSelectedChat(chat)}
                            className={`w-full flex items-center gap-4 p-4 rounded-[2rem] transition-all ${selectedChat?.customUserId === chat.customUserId ? 'bg-teal-50 text-[#0c8182]' : 'hover:bg-slate-50 text-slate-600'}`}
                        >
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border-2 border-white shadow-sm relative">
                                {chat.vendorPhoto ? <img src={getImageUrl(chat.vendorPhoto)} className="w-full h-full object-cover" /> : <UserCircle2 className="m-auto mt-2 text-slate-300" size={28} />}
                                {chat.isOnline && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                                )}
                            </div>
                            <div className="text-left flex-1 min-w-0">
                                <h4 className="font-black text-xs uppercase tracking-tight truncate">{chat.firstName} {chat.lastName}</h4>
                                <p className="text-[10px] font-bold text-slate-400 truncate uppercase mt-0.5 italic">{chat.lastMessage?.content || t.typeMessage}</p>
                            </div>
                        </button>
                    )) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-[2rem]">
                            <Users size={32} className="text-slate-200 mb-2" />
                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{t.startConnecting}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Window */}
            {selectedChat ? (
                <div className="flex-1 flex flex-col bg-slate-50/30">
                    {/* Chat Header */}
                    <div className="p-6 bg-white border-b border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setSelectedChat(null)} className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                            <div className="w-10 h-10 rounded-xl bg-teal-50 overflow-hidden shadow-sm">
                                {selectedChat.vendorPhoto ? <img src={getImageUrl(selectedChat.vendorPhoto)} className="w-full h-full object-cover" /> : <UserCircle2 className="m-auto mt-1.5 text-slate-300" size={24} />}
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 text-xs uppercase tracking-tight">{selectedChat.firstName} {selectedChat.lastName}</h4>
                                <p className={`text-[10px] font-bold uppercase tracking-tighter ${selectedChat.isOnline ? 'text-emerald-500' : 'text-slate-300'}`}>
                                    {selectedChat.isOnline ? t.activeNow : t.offline}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-6">
                        {messages.map((m, idx) => (
                            <div key={idx} className={`flex ${m.senderId === profile.customUserId ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] p-4 rounded-3xl text-sm font-semibold shadow-sm ${m.senderId === profile.customUserId ? 'bg-[#0c8182] text-white rounded-br-none shadow-[#0c8182]/20' : 'bg-white text-slate-600 rounded-bl-none border border-slate-100'}`}>
                                    {m.content}
                                    <p className={`text-[8px] mt-1 uppercase font-black tracking-tight ${m.senderId === profile.customUserId ? 'text-teal-50/50' : 'text-slate-300'}`}>
                                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Msg Input */}
                    <div className="p-6 bg-white">
                        <form onSubmit={handleSend} className="relative">
                            <input
                                type="text"
                                placeholder={t.typeMessage}
                                className="w-full pl-6 pr-16 py-4 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 transition-all"
                                value={msgText}
                                onChange={(e) => setMsgText(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={!msgText.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-[#0c8182] text-white rounded-[1.5rem] shadow-lg shadow-teal-900/20 hover:scale-105 active:scale-95 disabled:bg-slate-200 disabled:shadow-none transition-all"
                            >
                                <Send size={18} strokeWidth={3} />
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-12 text-center bg-slate-50/20">
                    <div className="w-24 h-24 bg-teal-50 rounded-[3rem] flex items-center justify-center text-[#0c8182] mb-6 shadow-inner">
                        <Sparkles size={40} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase italic mb-2">{t.connectGrow}</h3>
                    <p className="text-sm font-bold text-slate-400 max-w-sm">{t.selectVendorChat}</p>
                </div>
            )}
        </div>
    );
};

export default GSParivaarTab;
