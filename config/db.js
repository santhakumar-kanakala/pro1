const mongoose = require('mongoose');
const config = require('config');
const gravatar = require('gravatar');
const db = config.get('mongoURI');

const connectDB = async () => {
    try {
      await mongoose.connect(db,{
        useNewUrlParser: true
      });
      console.log('MONGODB CONNECTED SUCCESSFULLY.........');
    }
    catch(err){
    console.error(err.message);
    process.exit(1); // EXISTS PROCESS WITH FAILURE
    }
}

module.exports = connectDB;