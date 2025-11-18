// BACKEND/middleware/fileUpload.js

const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Node's File System module to check/create directories

// Define storage settings
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Define the target directory path
        const dest = path.join(__dirname, '../uploads/resumes');
        
        // Ensure the directory exists. If not, create it recursively.
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        
        cb(null, dest); 
    },
    filename: (req, file, cb) => {
        // Create a unique filename using the user's ID and a timestamp
        // Fallback to 'anon' if req.user is not available (though it should be for this route)
        const userId = req.user ? req.user.id : 'anon';
        const ext = path.extname(file.originalname);
        cb(null, `${userId}-${Date.now()}${ext}`);
    }
});

// Configure Multer options
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
    fileFilter: (req, file, cb) => {
        // Allow only PDF files
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            // Reject other file types with a user-friendly error message
            cb(new Error('Only PDF files (max 5MB) are allowed for resume upload.'), false);
        }
    }

// 'resume' must match the key used in the frontend's FormData.
}).single('resume'); 

// Export the final middleware function directly
module.exports = upload;