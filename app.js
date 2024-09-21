const express = require('express');
const connectDB = require('./config/db')
const redisClient = require('./config/redis');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middlewares/errorHandler'); // Error handling middleware
require('dotenv').config();

const app = express();

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Set the views directory where EJS files will be located
app.set('views', './views');

// Middleware for parsing JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (CSS, JS, images) from the "public" folder
app.use(express.static('public'));

// Database connection
connectDB();

// Routes
app.use('/api', userRoutes);

// Example route to render an EJS page
app.get('/user/profile/:id', async (req, res) => {
  const userId = req.params.id;

  // Fetch user from Redis or database
  redisClient.get(`user:${userId}`, async (err, cachedUser) => {
    if (cachedUser) {
      return res.render('user', { user: JSON.parse(cachedUser) });
    }

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Cache user data in Redis and render the page
      redisClient.setex(`user:${userId}`, 3600, JSON.stringify(user));
      res.render('user', { user });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user', error });
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// Redis connection
redisClient.connect();

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
