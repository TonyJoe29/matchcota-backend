const dotenv = require('dotenv');
const app = require('./app');
const connectMongo = require('./config/mongo');

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectMongo();
    app.listen(PORT, () => {
      console.log(`Servidor Matchcota escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error.message);
    process.exit(1);
  }
};

startServer();
