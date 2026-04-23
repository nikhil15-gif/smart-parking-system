const mongoose = require('mongoose');
require('dotenv').config();

async function restrictAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const userSchema = new mongoose.Schema({ name: String, role: String }, { strict: false });
    const User = mongoose.model('User', userSchema);
    
    // Set everyone to user first
    await User.updateMany({}, { role: 'user' });
    
    // Set only ronaldo to admin (case insensitive search)
    const res = await User.updateOne(
      { name: { $regex: new RegExp('^ronaldo$', 'i') } }, 
      { role: 'admin' }
    );
    
    if (res.modifiedCount > 0 || res.matchedCount > 0) {
      console.log('Ronaldo is now the only Admin.');
    } else {
      console.log('Could not find a user named Ronaldo. Make sure you have registered an account with the name Ronaldo.');
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

restrictAdmin();
