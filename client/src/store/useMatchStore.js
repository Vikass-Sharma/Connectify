import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { getSocket } from "../socket/socket.client";

export const useMatchStore = create((set, get) => ({
    matches: [],
    isLoadingMyMatches: false,
    isLoadingUserProfiles: false,
    userProfiles: [],
    swipeFeedback: null,

    getMyMatches: async () => {
        try {
            set({ isLoadingMyMatches: true });
            const res = await axiosInstance.get("/matches");
            set({ matches: res.data.matches });
        } catch (error) {
            set({ matches: [] });
            toast.error(error.response.data.message || "Something went wrong");
        } finally {
            set({ isLoadingMyMatches: false });
        }
    },

    getUserProfiles: async () => {
        try {
            set({ isLoadingUserProfiles: true });
            const res = await axiosInstance.get("/matches/user-profiles");
            set({ userProfiles: res.data.users });
        } catch (error) {
            set({ userProfiles: [] });
            toast.error(error.response.data.message || "Something went wrong");
        } finally {
            set({ isLoadingUserProfiles: false });
        }
    },

    swipeLeft: async (user) => {
        try {
            set({ swipeFeedback: "passed" });
            // Remove the user from userProfiles immediately
            set((state) => ({
                userProfiles: state.userProfiles.filter(profile => profile._id !== user._id)
            }));
            await axiosInstance.post("/matches/swipe-left/" + user._id);
        } catch (error) {
            console.log(error);
            toast.error("Failed to swipe left");
        } finally {
            setTimeout(() => set({ swipeFeedback: null }), 1500);
        }
    },

    swipeRight: async (user) => {
        try {
            set({ swipeFeedback: "liked" });
            // Remove the user from userProfiles immediately
            set((state) => ({
                userProfiles: state.userProfiles.filter(profile => profile._id !== user._id)
            }));
            await axiosInstance.post("/matches/swipe-right/" + user._id);
        } catch (error) {
            console.log(error);
            toast.error("Failed to swipe right");
        } finally {
            setTimeout(() => set({ swipeFeedback: null }), 1500);
        }
    },

    unfriendUser: async (userId) => {
        try {
            await axiosInstance.post("/matches/unfriend/" + userId);
            // Refresh matches and user profiles
            get().getMyMatches();
            get().getUserProfiles();
            toast.success("User unfriended successfully");
        } catch (error) {
            console.log(error);
            toast.error("Failed to unfriend user");
        }
    },

    subscribeToNewMatches: () => {
        try {
            const socket = getSocket();

            socket.on("newMatch", (newMatch) => {
                set((state) => ({
                    matches: [...state.matches, newMatch],
                }));
                toast.success("You got a new match!");
            });

            // Listen for new likes
            socket.on("newLike", (likerInfo) => {
                // Refresh user profiles to show updated priority
                get().getUserProfiles();
                toast.success(`${likerInfo.name} liked you! 💕`, {
                    icon: '💕',
                    duration: 4000,
                });
            });
        } catch (error) {
            console.log(error);
        }
    },

    unsubscribeFromNewMatches: () => {
        try {
            const socket = getSocket();
            socket.off("newMatch");
            socket.off("newLike");
        } catch (error) {
            console.error(error);
        }
    },
}));