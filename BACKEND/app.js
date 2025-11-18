const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

// NOTE: connectDB function should be verified to handle its own connection errors
const connectDB = require('./config/db');

// 1. Load environment variables first
dotenv.config();

const app = express();

// HTTP Server Wrapper for SOCKET.IO
const server = http.createServer(app);

// Socket.IO instance
const io = new Server(server, {
    cors: {
        origin: "*", // change if needed
        methods: ["GET", "POST"]
    }
});


// Store io in express app for controllers
app.set("io", io);

const PORT = process.env.PORT || 5000;



// Function to initialize and start the server
const startServer = async () => {
    try {
        // 2. CRITICAL STEP: Await the database connection before proceeding
        await connectDB();

        // 3. Require Mongoose Models (Must be done after DB connection attempt)
        // Profile Models
        require('./models/StudentProfile');
        require('./models/AlumniProfile');
        require('./models/AdminProfile');
        require('./models/PlacementStats');

        // Resource Models (Ensure these exist)
        require('./models/PrepResource'); // <--- CHECK THIS FILE PATH
        require('./models/CareerArticleVideo');

        // Core Forum Models
        require('./models/PostReport');
        require('./models/PostComment');
        require('./models/Post');
        require('./models/PostLike');
        require('./models/ForumCategory');


        // Event Model
        require('./models/Event');

        // Add mentorship models
        require('./models/MentorshipRequest');
        require('./models/MentorshipPreference');
        require('./models/MentorshipSession');
        require('./models/MentorshipMatch');
        

        // const ForumCategory = require("./models/ForumCategory");
        // const forumCategories = require("./init/ForumCategory");

        // async function initializeForumCategories() {
        //     try {
        //         const count = await ForumCategory.countDocuments();

        //         if (count === 0) {
        //             console.log("⚠ No Forum Categories found. Inserting default categories...");
        //             await ForumCategory.insertMany(forumCategories);
        //             console.log("✅ Default Forum Categories inserted successfully.");
        //         } else {
        //             console.log(`✔ Forum Categories already exist (${count} entries).`);
        //         }
        //     } catch (err) {
        //         console.error("❌ Error initializing forum categories:", err.message);
        //     }
        // }

        // await initializeForumCategories();

        // Middleware (Setup the application context)
        app.use(cors());
        app.use(express.json());
        app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

        // Global logging
        app.use((req, res, next) => {
          console.log(`Incoming ${req.method} ${req.url}`);
          next();
        });
         //AI Routes Text generation and grammar checker
        app.use('/api/text', require('./routes/aitextgeneratorRoutes'));
        app.use('/api/grammar', require('./routes/grammarRoutes'));

        
        // Routes
        app.use('/api/alumni', require('./routes/alumniRoutes'));
        app.use('/api/student', require('./routes/studentRoutes'));
        app.use('/api/admin', require('./routes/adminRoutes'));
        app.use('/api/forums', require('./routes/forumRoutes'));
        app.use('/api/events', require('./routes/eventRoutes'));
        app.use('/api/career', require('./routes/careerRoutes'));
        // Auth/User route
        app.use("/api/auth", require("./routes/authRoutes"));

        // MESSAGES ROUTER
        app.use('/api/messages', require('./routes/messageRoutes'));

        // MENTORSHIP ROUTER
        app.use('/api/mentorship', require('./routes/mentorshipRoutes'));

        //contact route
        app.use("/api/contact",require("./routes/contactRoutes.js"));

        //ai recommendation route
        app.use("/api/recommendations",require("./routes/recommendationRoutes"));

        //Badge & point stystem routes
        app.use('/api/points', require('./routes/pointsRoutes'));

        //analytics
        app.use("/api/placement", require('./routes/placementRoutes.js'));
        
        //Chatbot
        app.use('/api/chatbot', require('./routes/chatbotRoutes'));
        // Root Route
        app.get('/', (req, res) => res.send('Hello World!'));


        // SOCKET.IO LOGIC
        // -----------------------------
        io.on("connection", (socket) => {
            console.log("🔌 User connected:", socket.id);

            // JOIN ROOM
            socket.on("joinConversation", ({ conversationId }) => {
                if (!conversationId) return;
                socket.join(`conversation:${conversationId}`);
                console.log(`👥 User ${socket.id} joined conversation:${conversationId}`);
            });

            // LEAVE ROOM
            socket.on("leaveConversation", ({ conversationId }) => {
                if (!conversationId) return;
                socket.leave(`conversation:${conversationId}`);
                console.log(`👋 User ${socket.id} left conversation:${conversationId}`);
            });

            // Optional direct send via socket
            socket.on("sendMessage", (data) => {
                if (!data.conversation_id) return;
                io.to(`conversation:${data.conversation_id}`).emit("newMessage", data);
            });

            socket.on("typing", ({ conversation_id, user }) => {
                io.to(`conversation:${conversation_id}`).emit("typing", { user });
            });

            socket.on("disconnect", () => {
                console.log("❌ User disconnected:", socket.id);
            });
        });
        // 4. Start the server only after all async operations are done
        // app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
        server.listen(PORT, () => console.log(`🚀 Server + Socket.IO running on port ${PORT}`));


    } catch (error) {
        // If DB connection fails, log it and potentially exit
        console.error("Failed to connect to the database or start server:", error.message);
        process.exit(1); // Exit with a failure code
    }
}

// Execute the starting function
startServer();
