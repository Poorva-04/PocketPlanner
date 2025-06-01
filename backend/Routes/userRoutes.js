const express = require('express');
const router = express.Router();
const db = require('../models/db');
const bcrypt = require('bcrypt');

//Register route
router.post('/register', async(req, res)=>{
    try{
        const{username, email, password } = req.body;

        //Check if user already exists
        const extinguisher = await db('users').where({email}).first();
        if(extinguisher){
            return res.status(400).json({error: 'User already exists' });
        }

        //Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        //Insert User
        const [newUser] = await db('users')
        .insert({username, email, password: hashedPassword })
        .returning(['id', 'username', 'email']);

        res.status(201).json({message: 'User registered successfully', user: newUser });
    }catch(error){
        console.error('Registration Error:', error);
        res.status(500).json({error: 'Something went wrong during registration' });
    }
});

//Login Route
router.post('/login', async (req, res)=>{
    try {
        const { email, password } = req.body;

        //Find user
        const user = await db('users').where({email}).first();
        if(!user){
            return res.status(400).json({error: 'Invalid credentials' });
        }

        //Compare passwords
        const match = await bcrypt.compare(password, user.password);
        if(!match){
            return res.status(400).json({error: 'Invalid credentials' });
        }

        //Success
        res.status(200).json({message: 'Login successful', user: {id: user.id, username: user.username, email: user.email} });
    }catch(error){
        console.error('Login Error:',error);
        res.status(500).json({error: 'Something went wrong during login'});
    }
});

// Dashboard data route
router.get('/:id/dashboard', async (req, res) => {
  try {
    const userId = req.params.id;

    // Fetch user info
    const user = await db('users').where({ id: userId }).first();
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Fetch all transactions for user
    const transactions = await db('transactions')
      .where({ user_id: userId })
      .orderBy('date', 'desc')
      .limit(5);

    // Calculate totals
    const totals = await db('transactions')
      .where({ user_id: userId })
      .select(db.raw(`
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as totalIncome,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as totalExpense
      `))
      .first();

    const totalIncome = totals.totalIncome || 0;
    const totalExpense = totals.totalExpense || 0;
    const balance = totalIncome - totalExpense;

    res.json({
      user: { id: user.id, username: user.username },
      totals: { totalIncome, totalExpense, balance },
      recentTransactions: transactions
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ error: 'Server error fetching dashboard data' });
  }
});


module.exports = router;