import TinderCard from "react-tinder-card";
import { useMatchStore } from "../store/useMatchStore";
import { Heart } from "lucide-react";

const SwipeArea = () => {
    const { userProfiles, swipeRight, swipeLeft } = useMatchStore();

    const handleSwipe = (dir, user) => {
        if (dir === "right") swipeRight(user);
        else if (dir === "left") swipeLeft(user);
    };

    return (
        <div className='relative w-full max-w-sm h-[28rem]'>
            {userProfiles.map((user) => (
                <TinderCard
                    className='absolute shadow-none'
                    key={user._id}
                    onSwipe={(dir) => handleSwipe(dir, user)}
                    swipeRequirementType='position'
                    swipeThreshold={100}
                    preventSwipe={["up", "down"]}
                >
                    <div
                        className={`card w-96 h-[28rem] select-none rounded-lg overflow-hidden border relative transition-all duration-300 ${
                            user.likedYou 
                                ? 'bg-gradient-to-br from-pink-50 to-red-50 border-pink-400 shadow-2xl shadow-pink-200 ring-2 ring-pink-300 transform scale-105' 
                                : 'bg-white border-gray-200 hover:shadow-lg'
                        }`}
                    >
                        {/* Likes You Indicator */}
                        {user.likedYou && (
                            <div className='absolute top-4 right-4 z-10 bg-gradient-to-r from-pink-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-xl animate-pulse'>
                                <Heart size={16} fill="currentColor" className="animate-bounce" />
                                Likes You! 💕
                            </div>
                        )}

                        {/* Special background pattern for liked profiles */}
                        {user.likedYou && (
                            <div className='absolute inset-0 bg-gradient-to-br from-pink-100/20 to-red-100/20 pointer-events-none'></div>
                        )}

                        <figure className='px-4 pt-4 h-3/4 relative'>
                            <img
                                src={user.image || "/avatar.png"}
                                alt={user.name}
                                className={`rounded-lg object-cover h-full pointer-events-none transition-all duration-300 ${
                                    user.likedYou ? 'ring-4 ring-pink-300 shadow-lg' : ''
                                }`}
                            />
                            {/* Heart overlay on image for liked profiles */}
                            {user.likedYou && (
                                <div className='absolute top-2 left-2 bg-white/90 rounded-full p-2 shadow-lg'>
                                    <Heart size={20} className="text-pink-500" fill="currentColor" />
                                </div>
                            )}
                        </figure>
                        <div className={`card-body transition-all duration-300 ${
                            user.likedYou 
                                ? 'bg-gradient-to-b from-pink-50 to-red-50' 
                                : 'bg-gradient-to-b from-white to-pink-50'
                        }`}>
                            <h2 className={`card-title text-2xl transition-colors duration-300 ${
                                user.likedYou ? 'text-pink-800' : 'text-gray-800'
                            }`}>
                                {user.name}, {user.age}
                                {user.likedYou && <span className="ml-2 text-pink-500">💖</span>}
                            </h2>
                            <p className={`transition-colors duration-300 ${
                                user.likedYou ? 'text-pink-700' : 'text-gray-600'
                            }`}>{user.bio}</p>
                        </div>
                    </div>
                </TinderCard>
            ))}
        </div>
    );
};
export default SwipeArea;