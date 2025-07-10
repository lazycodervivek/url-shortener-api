// src/app.js
const express = require('express');
const mongoose = require('mongoose');
const rateLimiter = require('./middlewares/rateLimiter');


require('dotenv').config();

const app = express();
app.use(express.json());

app.use(rateLimiter); 

const urlRoutes = require('./routes/urlRoutes');
app.use('/', urlRoutes);

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.DB_URL)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error(err));
