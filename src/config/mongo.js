const mongoose = require('mongoose');

const connectMongo = async () => {
  if (!process.env.MONGO_URI) {
    console.log('MongoDB opcional: MONGO_URI no configurado.');
    return;
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB conectado.');
};

module.exports = connectMongo;
