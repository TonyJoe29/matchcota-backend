const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/users.routes');
const petRoutes = require('./routes/pets.routes');
const adoptionRoutes = require('./routes/adoptions.routes');
const alertRoutes = require('./routes/alerts.routes');
const supportRoutes = require('./routes/support.routes');
const adminRoutes = require('./routes/admin.routes');
const catalogRoutes = require('./routes/catalogs.routes');
const chatRoutes = require('./routes/chat.routes');
const { notFound, errorHandler } = require('./middlewares/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/frontend', express.static(path.join(__dirname, '..', 'frontend')));

app.get('/', (_req, res) => {
  res.redirect('/frontend/login.html');
});

app.get('/health', (_req, res) => {
  res.json({
    app: 'Matchcota API',
    status: 'ok',
    version: '1.0.0'
  });
});

app.get('/frontend', (_req, res) => {
  res.redirect('/frontend/login.html');
});

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/pets', petRoutes);
app.use('/adoptions', adoptionRoutes);
app.use('/alerts', alertRoutes);
app.use('/support', supportRoutes);
app.use('/admin', adminRoutes);
app.use('/catalogs', catalogRoutes);
app.use('/chats', chatRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
