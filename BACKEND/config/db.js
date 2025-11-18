// const mongoose = require('mongoose');
// const dotenv = require("dotenv");
// dotenv.config(); 

// const connectDB = async () => {
//   try {
//     const mongoURI = process.env.MONGO_URI;  // || 'mongodb://127.0.0.1:27017/StudAlum'
//     await mongoose.connect(mongoURI);
//     console.log('MongoDB connected');
//   } catch (err) {
//     console.error('MongoDB connection error:', err);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// ✅ Explicitly specify .env path to be safe
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error(" MONGO_URI is missing from .env file");
    }

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(" MongoDB connected successfully!");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
