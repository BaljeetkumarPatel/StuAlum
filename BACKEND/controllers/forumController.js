// BACKEND/controllers/forumController.js (FINALIZED)

const Post = require('../models/Post');
const PostComment = require('../models/PostComment');
const PostLike = require('../models/PostLike');
const PostReport = require('../models/PostReport');
const ForumCategory = require('../models/ForumCategory');

// --- Helper function to determine the Mongoose model name based on role ---
const getProfileType = (role) => (role === 'student' ? 'StudentProfile' : 'AlumniProfile');

// --- Helper function to verify post ownership ---
const verifyPostOwnership = async (postId, userId, res) => {
    const post = await Post.findById(postId).select('created_by');
    if (!post) {
        res.status(404).json({ message: 'Post not found.' });
        return false;
    }
    if (post.created_by.toString() !== userId) {
        res.status(403).json({ message: 'Unauthorized. You do not own this post.' });
        return false;
    }
    return post;
};

// --- Helper function to verify comment ownership ---
const verifyCommentOwnership = async (commentId, userId, res) => {
    const comment = await PostComment.findById(commentId).select('created_by post_id');
    if (!comment) {
        res.status(404).json({ message: 'Comment not found.' });
        return false;
    }
    if (comment.created_by.toString() !== userId) {
        res.status(403).json({ message: 'Unauthorized. You do not own this comment.' });
        return false;
    }
    return comment;
};

// 1. CONTENT RETRIEVAL (GET) HANDLERS


// GET /api/forums/categories
exports.getCategories = async (req, res) => {
    try {
        console.log('Mongoose Model Check:', ForumCategory.modelName); 
        const categories = await ForumCategory.find().lean();
        console.log('Categories Fetched:', categories.length); 
        res.json(categories);
    } catch (error) {
        console.error('CRITICAL ERROR fetching categories:', error.message);
        res.status(500).json({ message: 'Error fetching categories.' });
    }
};

// GET /api/forums/posts
exports.getPosts = async (req, res) => {
    try {
        const { category, sort = 'latest', limit = 10, skip = 0 } = req.query;
        let query = {};
        let sortOptions = { created_at: -1 };

        if (category) query.forum_id = category;
        if (sort === 'popular') sortOptions = { likes_count: -1, created_at: -1 };

        const posts = await Post.find(query)
            .sort(sortOptions)
            .limit(parseInt(limit))
            .skip(parseInt(skip))
            .populate({ path: 'created_by', select: 'full_name' }) 
            .populate({ path: 'forum_id', select: 'title' })
            .select('-content')
            .lean();

        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Error fetching posts.' });
    }
};

// GET /api/forums/posts/:postId
exports.getPostDetail = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user ? req.user.id : null; 
        
        const post = await Post.findById(postId)
            .populate('created_by', 'full_name') 
            .populate('forum_id', 'title')
            .lean();

        if (!post) return res.status(404).json({ message: 'Post not found.' });

        const comments = await PostComment.find({ post_id: postId })
            .populate('created_by', 'full_name') 
            .sort({ created_at: 1 })
            .lean();
        
        Post.updateOne({ _id: postId }, { $inc: { views_count: 1 } }).exec();
        
        let userLikedPost = false;
        let likedComments = {}; 

        if (userId) {
            const likedPost = await PostLike.findOne({ 
                target_id: postId, 
                target_model_type: 'Post',
                liker_profile_id: userId 
            });
            userLikedPost = !!likedPost;

            const commentIds = comments.map(c => c._id); 
            const userLikedComments = await PostLike.find({
                target_id: { $in: commentIds },
                target_model_type: 'PostComment',
                liker_profile_id: userId
            }).select('target_id');

            userLikedComments.forEach(like => {
                likedComments[like.target_id.toString()] = true;
            });
        }
        
        res.json({ 
            post: { ...post, userLiked: userLikedPost }, 
            comments: comments.map(c => ({ 
                ...c, 
                userLiked: !!likedComments[c._id.toString()] 
            })) 
        });
    } catch (error) {
        console.error('CRITICAL ERROR fetching post detail:', error);
        res.status(500).json({ message: 'Error fetching post detail.' });
    }
};

// GET /api/forums/posts/:postId/comments 
exports.getPostComments = async (req, res) => {
    res.status(501).json({ message: 'Function to get paginated comments not yet fully implemented.' });
};



// 2. USER INTERACTION (POST/PUT/DELETE) HANDLERS

// POST /api/forums/posts
exports.createPost = async (req, res) => {
    try {
        const { id: created_by, role } = req.user; 
        const author_model_type = getProfileType(role);

        const newPost = new Post({
            ...req.body,
            created_by,
            author_model_type,
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Error creating post.' });
    }
};


// POST /api/forums/comments
exports.createComment = async (req, res) => {
    try {
        const { id: created_by, role } = req.user; 
        const author_model_type = getProfileType(role);
        const { post_id, content } = req.body; 

        if (!post_id || !content) {
            return res.status(400).json({ message: 'Post ID and content are required.' });
        }

        const newComment = new PostComment({
            post_id,
            content,
            created_by,
            author_model_type,
        });

        await newComment.save();
        
        await Post.updateOne(
            { _id: post_id },
            { $inc: { comments_count: 1 } }
        ).exec();
        
        const populatedComment = await PostComment.findById(newComment._id)
            .populate('created_by', 'full_name')
            .lean();

        res.status(201).json(populatedComment);
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ message: 'Error creating comment.' });
    }
};

// DELETE /api/forums/comments/:commentId
exports.deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { id: userId } = req.user; 

        const comment = await verifyCommentOwnership(commentId, userId, res);
        if (!comment) return; 

        const postId = comment.post_id;

        await PostComment.deleteOne({ _id: commentId });
        await PostLike.deleteMany({ target_id: commentId, target_model_type: 'PostComment' });
        await PostReport.deleteMany({ target_id: commentId, target_model_type: 'PostComment' });

        await Post.updateOne(
            { _id: postId },
            { $inc: { comments_count: -1 } }
        ).exec();

        res.json({ message: 'Comment deleted successfully.' });

    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Error deleting comment.' });
    }
};


// POST /api/forums/likes
exports.toggleLike = async (req, res) => {
    try {
        const { id: liker_profile_id, role: likerRole } = req.user; 
        const liker_model_type = getProfileType(likerRole); 
        
        const { target_id, target_model_type } = req.body; 

        if (!target_id || !target_model_type) {
            return res.status(400).json({ message: 'Target ID and type are required.' });
        }
        
        const query = { liker_profile_id, target_id, target_model_type };

        const existingLike = await PostLike.findOne(query);
        let action; 

        if (existingLike) {
            await PostLike.deleteOne(query);
            action = 'unliked';
        } else {
            const newLike = new PostLike({
                ...query, 
                liker_model_type 
            });
            await newLike.save();
            action = 'liked';
        }

        let TargetModel;
        if (target_model_type === 'Post') {
            TargetModel = Post;
        } else if (target_model_type === 'PostComment') {
            TargetModel = PostComment;
        } else {
            return res.status(400).json({ message: 'Invalid target_model_type provided.' });
        }
        
        const increment = action === 'liked' ? 1 : -1;

        await TargetModel.updateOne(
            { _id: target_id },
            { $inc: { likes_count: increment } }
        ).exec();

        res.json({ action, message: `Content ${action}.`, increment });

    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({ message: 'Error toggling like.' });
    }
};

// POST /api/forums/report
exports.reportContent = async (req, res) => {
    try {
        const { id: reporter_profile_id, role: reporterRole } = req.user; 
        const reporter_model_type = getProfileType(reporterRole);

        const { reported_item_id, reported_item_type, reason, details } = req.body; 

        if (!reported_item_id || !reported_item_type || !reason) {
            return res.status(400).json({ message: 'Report ID, type, and reason are required.' });
        }

        const existingReport = await PostReport.findOne({
            reported_item_id,
            reported_item_type,
            reporter_profile_id,
        });

        if (existingReport) {
            return res.status(409).json({ message: 'You have already reported this content.' });
        }

        const newReport = new PostReport({
            reported_item_id,
            reported_item_type,
            reporter_profile_id,
            reporter_model_type,
            reason,
            details: details || '',
            status: 'Pending',
        });

        await newReport.save();

        res.status(201).json({ message: 'Content reported successfully. A moderator will review it shortly.' });

    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({ message: 'Error filing report.' });
    }
};

// PUT /api/forums/posts/:postId
exports.updatePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { id: userId } = req.user; 
        const { title, content, forum_id } = req.body;

        const post = await verifyPostOwnership(postId, userId, res);
        if (!post) return; 

        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            { title, content, forum_id, updated_at: Date.now() },
            { new: true } 
        ).lean();

        res.json({ message: 'Post updated successfully.', post: updatedPost });

    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: 'Error updating post.' });
    }
};

// DELETE /api/forums/posts/:postId
exports.deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { id: userId } = req.user; 

        const post = await verifyPostOwnership(postId, userId, res);
        if (!post) return;

        await Post.deleteOne({ _id: postId });
        await PostComment.deleteMany({ post_id: postId });
        await PostLike.deleteMany({ target_id: postId, target_model_type: 'Post' });
        await PostReport.deleteMany({ target_id: postId, target_model_type: 'Post' });

        res.json({ message: 'Post and all related data deleted successfully.' });

    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Error deleting post.' });
    }
};


// ===================================================
// 3. ADMIN/MODERATION HANDLERS
// ===================================================


// BACKEND/controllers/forumController.js (Inside exports.getPendingReports)


exports.getPendingReports = async (req, res) => {
    try {
        // Find reports that haven't been reviewed yet and perform all populations.
        // We rely on the model names being correctly registered globally in app.js.
        const pendingReports = await PostReport.find({ status: 'Pending' })
            .populate({
                path: 'reported_item_id',
                select: 'title content created_by',
                options: { strictPopulate: false } // Essential to prevent crashes on deleted content
            })
            .populate({
                path: 'reporter_profile_id',
                select: 'full_name',
                options: { strictPopulate: false } // Essential to prevent crashes on deleted profiles
            })
            .sort({ reported_at: 1 })
            .lean();

        // Final filter: Remove any reports where the reported item was deleted
        const validReports = pendingReports.filter(report => report.reported_item_id !== null);

        res.json(validReports);
        
    } catch (error) {
        // 🚨 Final Log: This is the error that caused the 500 status.
        console.error('FINAL ERROR: Mongoose Query Crash:', error.stack); 
        res.status(500).json({ message: 'Error fetching reports. Server crashed during query processing.' });
    }
};
         
// BACKEND/controllers/forumController.js (Inside exports.resolveReport)

exports.resolveReport = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { id: resolved_by_admin_id } = req.user; 
        
        const { status } = req.body; 

        if (!['Reviewed - Action Taken', 'Reviewed - No Action'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status provided.' });
        }
        
        // 🚨 DEBUG: Log the admin ID to ensure it's present
        console.log(`[DEBUG] Admin resolving report ${reportId} with ID: ${resolved_by_admin_id}`);

        const resolvedReport = await PostReport.findByIdAndUpdate(
            reportId,
            { 
                status,
                // CRITICAL CHECK: Ensure resolved_by_admin_id is not null
                resolved_by_admin_id,
                resolved_at: new Date()
            },
            { new: true }
        ).lean();

        if (!resolvedReport) {
            return res.status(404).json({ message: 'Report not found.' });
        }

        // 🚨 Success: The item was updated in the DB and then sent back.
        res.json({ message: 'Report resolved successfully.', report: resolvedReport });
        
    } catch (error) {
        // Log the error stack to diagnose unexpected database issues
        console.error('Error resolving report (DB Failure):', error.stack);
        res.status(500).json({ message: 'Error resolving report.' });
    }
};


// POST /api/admin/categories
exports.createCategory = async (req, res) => {
    res.status(501).json({ message: 'Admin function to create category not yet implemented.' });
};

// PUT /api/admin/posts/:postId/pin
exports.togglePin = async (req, res) => {
    res.status(501).json({ message: 'Admin function to toggle pin not yet implemented.' });
};

// DELETE /api/admin/posts/:postId
exports.adminDeletePost = async (req, res) => {
    res.status(501).json({ message: 'Admin function to delete post not yet implemented.' });
};