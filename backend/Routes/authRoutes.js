const express = require('express');
const router = express.Router();
const db = require('../models/db'); 
const bcrypt = require('bcrypt');

// Register route
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await db('users').where({ email }).first();
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [newUser] = await db('users')
      .insert({ username, email, password: hashedPassword })
      .returning(['id', 'username', 'email']);

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser,
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Something went wrong during registration' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await db('users').where({ email }).first();
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Successful login response (you can add JWT here later)
    res.status(200).json({
      message: 'Login successful',
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Something went wrong during login' });
  }
});

module.exports = router;
