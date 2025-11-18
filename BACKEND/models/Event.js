const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String }, 
    audience: { type: String }, 
    location: { type: String }, 
    event_mode: { type: String, enum: ['in_person', 'virtual', 'hybrid'], required: true },
    start_time: { type: Date, required: true },
    end_time: { type: Date, required: true },
    capacity: { type: Number, default: 0 },
    status: { type: String, enum: ['scheduled', 'cancelled', 'postponed', 'rescheduled'], default: 'scheduled' },
    
    // ----------------------------------------------------
    // 🚨 1. CREATOR LINKING (Who created the event - Admin only)
    // ----------------------------------------------------
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'creator_model_type' // Links to the creator_model_type field
    },
    // Field to store the model type of the creator (must be AdminProfile)
    creator_model_type: {
        type: String,
        required: true,
        enum: ['AdminProfile', 'AlumniProfile', 'StudentProfile'] // Assuming only Admins can create official events
    },

    // ----------------------------------------------------
    // 🚨 2. USER REGISTRATION TRACKING
    // ----------------------------------------------------
    // Array to hold the IDs of registered users (Student, Alumni, Admin)
    registered_users: [{ 
        user_id: { // The actual ID of the registered profile
            type: mongoose.Schema.Types.ObjectId, 
            required: true,
            refPath: 'registered_user_model_type' // Links to the model type below
        },
        registered_at: { type: Date, default: Date.now }, // Timestamp of registration
        _id: false // Prevents Mongoose from creating subdocument IDs
    }],
    
    // Field that stores the model type of the registered users (for dynamic population)
    registered_user_model_type: { 
        type: String,
        enum: ['StudentProfile', 'AlumniProfile', 'AdminProfile'], 
    },

    //for adding ai one one attributes
    type: {
      type: String,
      enum: ["manual", "ai"],
      default: "manual", // 🟢 Manual by default
    },
    
    // Simple counter for quick display/capacity check
    registered_count: { type: Number, default: 0 },

}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Event', EventSchema);