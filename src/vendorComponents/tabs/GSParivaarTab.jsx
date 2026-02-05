import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageSquare, Share2, Sparkles, Award, Cake, TrendingUp, MoreHorizontal, Plus, UserCircle2, ShieldCheck, Image as ImageIcon, X, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCommunityPosts, likePost, clapPost, createCommunityPost, deletePost } from '../../redux/thunks/vendorThunk';
import { BASE_URL } from '../../config';
import Swal from 'sweetalert2';

const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return `${BASE_URL}/${path.replace(/^\/+/, '')}`;
};

const GSParivaarTab = ({ profile }) => {
    const dispatch = useDispatch();
    const { communityPosts } = useSelector(state => state.vendor);
    const [activeFeed, setActiveFeed] = useState('feed'); // feed, myposts
    const [isPosting, setIsPosting] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', content: '' });
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        dispatch(fetchCommunityPosts());
    }, [dispatch]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleCreatePost = async () => {
        if (!newPost.title || !newPost.content) {
            Swal.fire('Error', 'Sabhi fields bharna zaruri hai', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('type', 'user_post');
        formData.append('authorId', profile?.customUserId);
        formData.append('authorName', `${profile?.firstName} ${profile?.lastName}`);
        formData.append('authorRole', 'Partner');
        formData.append('authorImg', profile?.vendorPhoto);
        formData.append('title', newPost.title);
        formData.append('content', newPost.content);
        if (selectedImage) {
            formData.append('image', selectedImage);
        }

        const result = await dispatch(createCommunityPost(formData));
        if (result.success) {
            setIsPosting(false);
            setNewPost({ title: '', content: '' });
            setSelectedImage(null);
            setPreviewUrl(null);
            Swal.fire('Success', 'Your post has been shared with the community!', 'success');
        } else {
            Swal.fire('Error', 'Failed to create post', 'error');
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
                        Feed
                        {activeFeed === 'feed' && <motion.div layoutId="activeTab" className="absolute -bottom-2 left-0 right-0 h-1.5 bg-[#0c8182] rounded-full" />}
                    </button>
                    <button
                        onClick={() => setActiveFeed('myposts')}
                        className={`text-lg font-black uppercase tracking-tight transition-all relative ${activeFeed === 'myposts' ? 'text-[#0c8182]' : 'text-slate-300'}`}
                    >
                        My Posts
                        {activeFeed === 'myposts' && <motion.div layoutId="activeTab" className="absolute -bottom-2 left-0 right-0 h-1.5 bg-[#0c8182] rounded-full" />}
                    </button>
                </div>

                {!isPosting && (
                    <button
                        onClick={() => setIsPosting(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#0c8182] text-white rounded-2xl font-black text-xs uppercase tracking-tight shadow-lg shadow-teal-900/10 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus size={16} strokeWidth={3} />
                        Create Post
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
                            <h2 className="text-2xl font-black italic uppercase tracking-tight">Happy Birthday, {profile?.firstName}!</h2>
                            <p className="text-teal-50/80 font-bold text-sm mt-1">Best wishes from the entire GharKeSeva community.</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Post Creation Form */}
            {isPosting && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-[3rem] border-2 border-teal-100 shadow-xl mb-8 space-y-6"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-teal-50 text-[#0c8182] rounded-xl">
                                <Plus size={20} strokeWidth={3} />
                            </div>
                            <h3 className="text-lg font-black text-slate-800 italic uppercase">Write New Post</h3>
                        </div>
                        <button onClick={() => setIsPosting(false)} className="p-2 text-slate-300 hover:text-slate-600 transition-all">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Write Heading (e.g. My Great Day)"
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0c8182]/20"
                            value={newPost.title}
                            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                        />
                        <textarea
                            placeholder="Share your experience here..."
                            rows={4}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0c8182]/20 shadow-inner"
                            value={newPost.content}
                            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                        />
                    </div>

                    {previewUrl && (
                        <div className="relative rounded-[2rem] overflow-hidden border-2 border-slate-100 shadow-inner">
                            <img src={previewUrl} className="w-full h-48 object-cover" />
                            <button
                                onClick={() => { setSelectedImage(null); setPreviewUrl(null); }}
                                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-4">
                        <label className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-500 rounded-xl cursor-pointer hover:bg-slate-100 transition-all font-bold text-xs uppercase tracking-tight">
                            <ImageIcon size={18} />
                            Add Photo
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </label>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsPosting(false)}
                                className="px-6 py-3 rounded-2xl font-black uppercase tracking-tight text-slate-400 hover:bg-slate-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreatePost}
                                disabled={!newPost.title || !newPost.content}
                                className={`px-8 py-3 rounded-2xl font-black uppercase tracking-tight transition-all shadow-lg ${(!newPost.title || !newPost.content) ? 'bg-slate-100 text-slate-300' : 'bg-[#0c8182] text-white shadow-[#0c8182]/20 hover:scale-105 active:scale-95'}`}
                            >
                                Share Post
                            </button>
                        </div>
                    </div>
                </motion.div>
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
                            />
                        ))
                    ) : (
                        <div className="py-20 flex flex-col items-center text-center space-y-4">
                            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200">
                                <MessageSquare size={40} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">No posts found</h3>
                            <p className="text-sm font-bold text-slate-400">Share something to join the GharKeSeva community.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const PostCard = ({ post, profile }) => {
    const dispatch = useDispatch();
    const [likes, setLikes] = useState(post.likes?.length || 0);
    const [claps, setClaps] = useState(post.claps || 0);
    const [isLiked, setIsLiked] = useState(post.likes?.includes(profile?.customUserId));

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

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "This post will be deleted permanently!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#0c8182',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Delete',
            cancelButtonText: 'No'
        });

        if (result.isConfirmed) {
            const res = await dispatch(deletePost(post._id, profile?.customUserId));
            if (res.success) {
                Swal.fire('Deleted!', 'Post has been removed.', 'success');
            } else {
                Swal.fire('Error', 'Could not delete the post.', 'error');
            }
        }
    };

    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return new Date(date).toLocaleDateString();
    };

    const isOwnPost = post.authorId === profile?.customUserId;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden"
        >
            {/* Post Header */}
            <div className="p-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-[#0c8182] font-bold border-2 border-white shadow-sm overflow-hidden">
                        {post.authorImg ? <img src={getImageUrl(post.authorImg)} className="w-full h-full object-cover" /> : (post.isOfficial ? 'GS' : <UserCircle2 size={18} />)}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-slate-900 tracking-tight">{post.authorName}</h4>
                            {post.isOfficial && <ShieldCheck size={14} className="text-blue-500" fill="currentColor" />}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{timeAgo(post.createdAt)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isOwnPost && (
                        <button
                            onClick={handleDelete}
                            className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
                            title="Post Hatayein"
                        >
                            <Trash2 size={18} strokeWidth={2.5} />
                        </button>
                    )}
                    <button className="text-slate-300 hover:text-slate-600 p-2.5">
                        <MoreHorizontal size={20} />
                    </button>
                </div>
            </div>

            {/* Post Content */}
            <div className={`px-8 pb-4 space-y-6`}>
                <div className="space-y-3">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">{post.title}</h3>
                    <p className="text-sm font-bold text-slate-500 leading-relaxed italic whitespace-pre-line">{post.content}</p>
                </div>

                {post.image && (
                    <div className="rounded-[2rem] overflow-hidden border-2 border-slate-50 shadow-inner">
                        <img src={getImageUrl(post.image)} className="w-full h-auto object-cover max-h-[400px]" alt="Post" />
                    </div>
                )}

                {post.users && post.users.length > 0 && (
                    <div className={`p-8 rounded-[2.5rem] bg-gradient-to-br ${post.gradient || 'from-slate-50 to-slate-100'} border-2 border-white shadow-sm`}>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {post.users.map((u, i) => (
                                <div key={i} className="flex flex-col items-center text-center space-y-3">
                                    <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                                        {u.img ? <img src={getImageUrl(u.img)} className="w-full h-full object-cover" /> : <UserCircle2 size={40} className="text-slate-200 m-auto mt-4" />}
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-900 leading-tight">{u.name}</p>
                                        {u.detail && <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{u.detail}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 flex justify-center">
                            <div className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#0c8182] border border-white">
                                {post.type === 'celebration' && <Cake size={12} />}
                                {post.type === 'achievement' && <Award size={12} />}
                                {post.category || 'Special Event'}
                            </div>
                        </div>
                    </div>
                )}
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
                    <button className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-blue-500 transition-all">
                        <MessageSquare size={20} strokeWidth={2.5} />
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
        </motion.div>
    );
};

const ClapIcon = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        <path d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
    </svg>
);

export default GSParivaarTab;
