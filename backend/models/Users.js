// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role:{
    type:String,
    required:true,
    enum:["admin","user"],
    default:"user"
  },
  wallet: { type: Number, default: 50 }, 
  
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;

