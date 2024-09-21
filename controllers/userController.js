const User = require('../models/user'); // Mongoose user model
const redisClient = require('../config/redis'); // Redis configuration

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const newUser = new User({ name, email, password });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
};

// Read: Get user by ID (with Redis caching)
exports.getUserById = async (req, res) => {
  const userId = req.params.id;

  // Check Redis cache for user data
  redisClient.get(`user:${userId}`, async (err, cachedUser) => {
    if (cachedUser) {
      // If user data is found in cache, return it
      return res.json({ source: 'cache', user: JSON.parse(cachedUser) });
    }

    try {
      // If not in cache, retrieve from database
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Store user data in Redis cache for 1 hour (3600 seconds)
      redisClient.setex(`user:${userId}`, 3600, JSON.stringify(user));

      res.json({ source: 'database', user });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user', error });
    }
  });
};

// Update: Modify user data
exports.updateUser = async (req, res) => {
  const userId = req.params.id;
  const updatedData = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Invalidate the Redis cache for this user
    redisClient.del(`user:${userId}`);

    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error });
  }
};

// Delete: Remove user
exports.deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove the user data from Redis cache
    redisClient.del(`user:${userId}`);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
};
