import { useEffect, useState } from "react";
import { Heart, Loader, MessageCircle, X, UserMinus } from "lucide-react";
import { Link } from "react-router-dom";
import { useMatchStore } from "../store/useMatchStore";
import { useAuthStore } from "../store/useAuthStore";

const Sidebar = () => {
	const [isOpen, setIsOpen] = useState(false);

	const toggleSidebar = () => setIsOpen(!isOpen);

	const { getMyMatches, matches, isLoadingMyMatches, userProfiles, unfriendUser } = useMatchStore();
	const { authUser } = useAuthStore();

	// Count users who liked the current user
	const usersWhoLikedYou = userProfiles.filter(profile => profile.likedYou);

	useEffect(() => {
		getMyMatches();
	}, [getMyMatches]);

	return (
		<>
			<div
				className={`
		fixed inset-y-0 left-0 z-10 w-64 bg-white shadow-md overflow-hidden transition-transform duration-300
		 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:w-1/4
		`}
			>
				<div className='flex flex-col h-full'>
					{/* Header */}
					<div className='p-4 pb-[27px] border-b border-pink-200 flex justify-between items-center'>
						<div className="flex items-center space-x-2">
							<h2 className='text-xl font-bold text-pink-600'>Matches</h2>
							{usersWhoLikedYou.length > 0 && (
								<Link 
									to="/likes"
									className="relative bg-pink-100 hover:bg-pink-200 p-2 rounded-full transition-colors"
								>
									<Heart size={16} className="text-pink-600" fill="currentColor" />
									<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
										{usersWhoLikedYou.length}
									</span>
								</Link>
							)}
						</div>
						<button
							className='lg:hidden p-1 text-gray-500 hover:text-gray-700 focus:outline-none'
							onClick={toggleSidebar}
						>
							<X size={24} />
						</button>
					</div>

					<div className='flex-grow overflow-y-auto p-4 z-10 relative'>
						{isLoadingMyMatches ? (
							<LoadingState />
						) : matches.length === 0 ? (
							<NoMatchesFound />
						) : (
							matches.map((match) => (
								<div key={match._id} className='flex items-center justify-between mb-4 p-2 rounded-lg hover:bg-pink-50 transition-colors duration-300'>
									<Link to={`/chat/${match._id}`} className='flex items-center flex-1'>
										<img
											src={match.image || "/avatar.png"}
											alt='User avatar'
											className='size-12 object-cover rounded-full mr-3 border-2 border-pink-300'
										/>
										<h3 className='font-semibold text-gray-800'>{match.name}</h3>
									</Link>
									<button
										onClick={() => unfriendUser(match._id)}
										className='p-1 text-gray-500 hover:text-red-500 transition-colors'
										title="Unfriend"
									>
										<UserMinus size={16} />
									</button>
								</div>
							))
						)}
					</div>
				</div>
			</div>

			<button
				className='lg:hidden fixed top-4 left-4 p-2 bg-pink-500 text-white rounded-md z-0'
				onClick={toggleSidebar}
			>
				<MessageCircle size={24} />
			</button>
		</>
	);
};
export default Sidebar;

const NoMatchesFound = () => (
	<div className='flex flex-col items-center justify-center h-full text-center'>
		<Heart className='text-pink-400 mb-4' size={48} />
		<h3 className='text-xl font-semibold text-gray-700 mb-2'>No Matches Yet</h3>
		<p className='text-gray-500 max-w-xs'>
			Don&apos;t worry! Your perfect match is just around the corner. Keep swiping!
		</p>
	</div>
);

const LoadingState = () => (
	<div className='flex flex-col items-center justify-center h-full text-center'>
		<Loader className='text-pink-500 mb-4 animate-spin' size={48} />
		<h3 className='text-xl font-semibold text-gray-700 mb-2'>Loading Matches</h3>
		<p className='text-gray-500 max-w-xs'>We&apos;re finding your perfect matches. This might take a moment...</p>
	</div>
);
