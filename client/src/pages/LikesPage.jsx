import { useEffect, useState } from "react";
import { useMatchStore } from "../store/useMatchStore";
import { useAuthStore } from "../store/useAuthStore";
import { Header } from "../components/Header";
import { Heart, ArrowLeft, MessageCircle, X, Check, UserMinus } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const LikesPage = () => {
    const { userProfiles, getUserProfiles, swipeRight, swipeLeft, unfriendUser } = useMatchStore();
    const { authUser } = useAuthStore();
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Filter only users who liked the current user
    const usersWhoLikedYou = userProfiles.filter(profile => profile.likedYou);

    useEffect(() => {
        getUserProfiles();
    }, [getUserProfiles]);

    const handleSwipeRight = async (user) => {
        try {
            await swipeRight(user);
            toast.success(`You liked ${user.name}! 💕`);
            setShowModal(false);
            setSelectedUser(null);
        } catch (error) {
            toast.error("Failed to like user");
        }
    };

    const handleSwipeLeft = async (user) => {
        try {
            await swipeLeft(user);
            toast.success(`You passed on ${user.name}`);
            setShowModal(false);
            setSelectedUser(null);
        } catch (error) {
            toast.error("Failed to pass on user");
        }
    };

    const handleUnfriend = async (user) => {
        try {
            await unfriendUser(user._id);
            toast.success(`Unfriended ${user.name}`);
            setShowModal(false);
            setSelectedUser(null);
        } catch (error) {
            toast.error("Failed to unfriend user");
        }
    };

    const openUserModal = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100">
            <Header />
            
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <Link 
                            to="/" 
                            className="flex items-center space-x-2 text-pink-600 hover:text-pink-700 transition-colors"
                        >
                            <ArrowLeft size={20} />
                            <span className="font-semibold">Back to Swiping</span>
                        </Link>
                    </div>
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">People Who Liked You</h1>
                        <p className="text-gray-600">
                            {usersWhoLikedYou.length} {usersWhoLikedYou.length === 1 ? 'person' : 'people'} {usersWhoLikedYou.length === 1 ? 'has' : 'have'} liked your profile
                        </p>
                    </div>
                    <div className="w-32"></div> {/* Spacer for centering */}
                </div>

                {/* Users Grid */}
                {usersWhoLikedYou.length === 0 ? (
                    <div className="text-center py-16">
                        <Heart size={80} className="mx-auto text-pink-300 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-700 mb-2">No likes yet</h2>
                        <p className="text-gray-500 mb-6">Keep swiping and someone will like you soon!</p>
                        <Link 
                            to="/" 
                            className="bg-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-pink-600 transition-colors"
                        >
                            Start Swiping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {usersWhoLikedYou.map((user) => (
                            <div 
                                key={user._id}
                                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 border-pink-200"
                                onClick={() => openUserModal(user)}
                            >
                                <div className="relative">
                                    <img
                                        src={user.image || "/avatar.png"}
                                        alt={user.name}
                                        className="w-full h-64 object-cover rounded-t-xl"
                                    />
                                    <div className="absolute top-3 right-3 bg-gradient-to-r from-pink-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
                                        <Heart size={14} fill="currentColor" />
                                        Likes You
                                    </div>
                                    <div className="absolute top-3 left-3 bg-white/90 rounded-full p-2 shadow-lg">
                                        <Heart size={16} className="text-pink-500" fill="currentColor" />
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xl font-bold text-gray-800">
                                            {user.name}, {user.age} 💖
                                        </h3>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleUnfriend(user);
                                            }}
                                            className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                                            title="Unfriend"
                                        >
                                            <UserMinus size={16} />
                                        </button>
                                    </div>
                                    <p className="text-gray-600 text-sm line-clamp-2">{user.bio}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* User Detail Modal */}
            {showModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="relative">
                            <img
                                src={selectedUser.image || "/avatar.png"}
                                alt={selectedUser.name}
                                className="w-full h-80 object-cover rounded-t-2xl"
                            />
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 bg-white/90 rounded-full p-2 shadow-lg hover:bg-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                            <div className="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
                                <Heart size={14} fill="currentColor" />
                                Likes You! 💕
                            </div>
                        </div>
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                {selectedUser.name}, {selectedUser.age} 💖
                            </h2>
                            <p className="text-gray-600 mb-6">{selectedUser.bio}</p>
                            
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => handleSwipeLeft(selectedUser)}
                                    className="flex-1 bg-gray-500 text-white py-3 rounded-full font-semibold hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <X size={20} />
                                    Pass
                                </button>
                                <button
                                    onClick={() => handleSwipeRight(selectedUser)}
                                    className="flex-1 bg-pink-500 text-white py-3 rounded-full font-semibold hover:bg-pink-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Check size={20} />
                                    Like
                                </button>
                                <button
                                    onClick={() => handleUnfriend(selectedUser)}
                                    className="flex-1 bg-red-500 text-white py-3 rounded-full font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <UserMinus size={20} />
                                    Unfriend
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LikesPage;
