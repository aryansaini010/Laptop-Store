// db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://ajsainii0001_db_user:s9PneYak6QZy1zDK@laptopstorecluster.ml8ed15.mongodb.net/new_laptop_store?retryWrites=true&w=majority&appName=LaptopStoreCluster", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
