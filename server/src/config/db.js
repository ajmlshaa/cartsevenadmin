import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cartseven';
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(` MongoDB Connected: ${conn.connection.host} [Database: ${conn.connection.name}]`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.warn(`⚠️ Running with mock/local state fallback if database is not reachable.`);
    return false;
  }
};
