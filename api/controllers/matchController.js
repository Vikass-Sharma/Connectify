import User from "../models/User.js";
import { getConnectedUsers, getIO } from "../socket/socket.server.js";

export const swipeRight = async (req, res) => {
    try {
        const { likedUserId } = req.params;
        const currentUser = await User.findById(req.user.id);
        const likedUser = await User.findById(likedUserId);

        if (!likedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (!currentUser.likes.includes(likedUserId)) {
            currentUser.likes.push(likedUserId);
            
            // Add current user to likedUser's likedBy array
            if (!likedUser.likedBy.some(id => id.toString() === currentUser.id.toString())) {
                likedUser.likedBy.push(currentUser.id);
            }

            // if the other user already liked us, it's a match
            if (likedUser.likes.includes(currentUser.id)) {
                currentUser.matches.push(likedUserId);
                likedUser.matches.push(currentUser.id);

                // Remove from likedBy since they're now matched
                likedUser.likedBy = likedUser.likedBy.filter(id => !id.equals(currentUser._id));
                currentUser.likedBy = currentUser.likedBy.filter(id => !id.equals(likedUserId));

                await Promise.all([currentUser.save(), likedUser.save()]);

                // send notification in real-time with socket.io
                const connectedUsers = getConnectedUsers();
                const io = getIO();

                const likedUserSocketId = connectedUsers.get(likedUserId);

                if (likedUserSocketId) {
                    io.to(likedUserSocketId).emit("newMatch", {
                        _id: currentUser._id,
                        name: currentUser.name,
                        image: currentUser.image,
                    });
                }

                const currentSocketId = connectedUsers.get(currentUser._id.toString());
                if (currentSocketId) {
                    io.to(currentSocketId).emit("newMatch", {
                        _id: likedUser._id,
                        name: likedUser.name,
                        image: likedUser.image,
                    });
                }
            } else {
                // Just save the users if no match
                await Promise.all([currentUser.save(), likedUser.save()]);

                // Send real-time notification to the liked user
                const connectedUsers = getConnectedUsers();
                const io = getIO();
                const likedUserSocketId = connectedUsers.get(likedUserId);

                if (likedUserSocketId) {
                    io.to(likedUserSocketId).emit("newLike", {
                        _id: currentUser._id,
                        name: currentUser.name,
                        image: currentUser.image,
                    });
                }
            }
        }

        res.status(200).json({
            success: true,
            user: currentUser,
        });
    } catch (error) {
        console.log("Error in swipeRight: ", error);

        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const swipeLeft = async (req, res) => {
    try {
        const { dislikedUserId } = req.params;
        const currentUser = await User.findById(req.user.id);
        const dislikedUser = await User.findById(dislikedUserId);

        if (!dislikedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (!currentUser.dislikes.includes(dislikedUserId)) {
            currentUser.dislikes.push(dislikedUserId);
            
            // Remove current user from dislikedUser's likedBy array if they were there
            dislikedUser.likedBy = dislikedUser.likedBy.filter(id => id.toString() !== currentUser.id.toString());
            
            await Promise.all([currentUser.save(), dislikedUser.save()]);
        }

        res.status(200).json({
            success: true,
            user: currentUser,
        });
    } catch (error) {
        console.log("Error in swipeLeft: ", error);

        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const getMatches = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate("matches", "name image");

        res.status(200).json({
            success: true,
            matches: user.matches,
        });
    } catch (error) {
        console.log("Error in getMatches: ", error);

        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const getUserProfiles = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);

        // Get all potential users (excluding already interacted users)
        const users = await User.find({
            $and: [
                { _id: { $ne: currentUser.id } },
                { _id: { $nin: currentUser.dislikes } },
                { _id: { $nin: currentUser.matches } },
                {
                    gender:
                        currentUser.genderPreference === "both"
                            ? { $in: ["male", "female"] }
                            : currentUser.genderPreference,
                },
                { genderPreference: { $in: [currentUser.gender, "both"] } },
            ],
        });

        // Add likedYou flag and sort by priority
        const usersWithLikeStatus = users.map(user => ({
            ...user.toObject(),
            likedYou: user.likedBy.some(id => id.toString() === currentUser._id.toString())
        }));

        // Sort users: those who liked you first, then others
        const sortedUsers = usersWithLikeStatus.sort((a, b) => {
            if (a.likedYou && !b.likedYou) return -1;
            if (!a.likedYou && b.likedYou) return 1;
            return 0;
        });

        res.status(200).json({
            success: true,
            users: sortedUsers,
        });
    } catch (error) {
        console.log("Error in getUserProfiles: ", error);

        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const unfriendUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUser = await User.findById(req.user.id);
        const userToUnfriend = await User.findById(userId);

        if (!userToUnfriend) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Remove from matches
        currentUser.matches = currentUser.matches.filter(id => id.toString() !== userId);
        userToUnfriend.matches = userToUnfriend.matches.filter(id => id.toString() !== currentUser.id);

        // Remove from likes
        currentUser.likes = currentUser.likes.filter(id => id.toString() !== userId);
        userToUnfriend.likes = userToUnfriend.likes.filter(id => id.toString() !== currentUser.id);

        // Remove from likedBy
        currentUser.likedBy = currentUser.likedBy.filter(id => id.toString() !== userId);
        userToUnfriend.likedBy = userToUnfriend.likedBy.filter(id => id.toString() !== currentUser.id);

        // Add to dislikes to prevent showing again
        if (!currentUser.dislikes.includes(userId)) {
            currentUser.dislikes.push(userId);
        }

        await Promise.all([currentUser.save(), userToUnfriend.save()]);

        res.status(200).json({
            success: true,
            message: "User unfriended successfully",
            user: currentUser,
        });
    } catch (error) {
        console.log("Error in unfriendUser: ", error);

        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};