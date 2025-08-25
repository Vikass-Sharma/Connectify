import { useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { Header } from "../components/Header";
import { useMatchStore } from "../store/useMatchStore";
import { Frown, Heart } from "lucide-react";
import { Link } from "react-router-dom";

import SwipeArea from "../components/SwipeArea";
import SwipeFeedback from "../components/SwipeFeedback";
import { useAuthStore } from "../store/useAuthStore";

const HomePage = () => {
	const { isLoadingUserProfiles, getUserProfiles, userProfiles, subscribeToNewMatches, unsubscribeFromNewMatches } =
		useMatchStore();

	const { authUser } = useAuthStore();

	// Count users who liked the current user
	const usersWhoLikedYou = userProfiles.filter(profile => profile.likedYou);

	useEffect(() => {
		getUserProfiles();
	}, [getUserProfiles]);

	useEffect(() => {
		authUser && subscribeToNewMatches();

		return () => {
			unsubscribeFromNewMatches();
		};
	}, [subscribeToNewMatches, unsubscribeFromNewMatches, authUser]);

	return (
		<div
			className='flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-pink-100 to-purple-100
		 overflow-hidden
		'
		>
			<Sidebar />
			<div className='flex-grow flex flex-col overflow-hidden'>
				<Header />
				<main className='flex-grow flex flex-col gap-10 justify-center items-center p-4 relative overflow-hidden'>
					{userProfiles.length > 0 && !isLoadingUserProfiles && (
						<>
							<SwipeArea />
							<SwipeFeedback />
						</>
					)}

					{userProfiles.length === 0 && !isLoadingUserProfiles && <NoMoreProfiles />}

					{isLoadingUserProfiles && <LoadingUI />}

					{/* Floating Action Button for Likes */}
					{usersWhoLikedYou.length > 0 && (
						<Link
							to="/likes"
							className="fixed bottom-6 right-6 bg-gradient-to-r from-pink-500 to-red-500 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 z-50 animate-pulse"
						>
							<div className="relative">
								<Heart size={24} fill="currentColor" />
								<span className="absolute -top-2 -right-2 bg-white text-pink-500 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
									{usersWhoLikedYou.length}
								</span>
							</div>
						</Link>
					)}
				</main>
			</div>
		</div>
	);
};
export default HomePage;

const NoMoreProfiles = () => (
	<div className='flex flex-col items-center justify-center h-full text-center p-8'>
		<Frown className='text-pink-400 mb-6' size={80} />
		<h2 className='text-3xl font-bold text-gray-800 mb-4'>Woah there, speedy fingers!</h2>
		<p className='text-xl text-gray-600 mb-6'>Bro are you OK? Maybe it&apos;s time to touch some grass.</p>
	</div>
);

const LoadingUI = () => {
	return (
		<div className='relative w-full max-w-sm h-[28rem]'>
			<div className='card bg-white w-96 h-[28rem] rounded-lg overflow-hidden border border-gray-200 shadow-sm'>
				<div className='px-4 pt-4 h-3/4'>
					<div className='w-full h-full bg-gray-200 rounded-lg' />
				</div>
				<div className='card-body bg-gradient-to-b from-white to-pink-50 p-4'>
					<div className='space-y-2'>
						<div className='h-6 bg-gray-200 rounded w-3/4' />
						<div className='h-4 bg-gray-200 rounded w-1/2' />
					</div>
				</div>
			</div>
		</div>
	);
};
