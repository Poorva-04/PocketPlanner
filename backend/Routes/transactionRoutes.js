const express = require('express');
const router = express.Router();
const db = require('../models/db');

//Get all transaction of a user 
router.get('/:userId', async (req, res)=>{
    const { userId } = req.params;
    try{
        const transactions = await db('transactions').where({user_id: userId });
        res.json(transactions);
    }catch (err){
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

//Add a new transaction 
router.post('/add', async (req, res)=>{
    const{ user_id,title, amount, type, category, description, date }= req.body;
    try{
        const [id] = await db('transactions').insert({user_id, title, amount, type, category, description, date});
        res.json({message: 'Transaction added', id});
    }catch (err) {
        console.error('Transaction insert error:', err);
        res.status(500).json({error: 'Failed to add transaction'});
    }
});

// Delete a transaction 
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db('transactions').where({ id }).del();
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

// Update a transaction by ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, amount, type, category, description, date } = req.body;

  try {
    const updated = await db('transactions').where({ id }).update({
      title,
      amount,
      type,
      category,
      description,
      date,
      updated_at: new Date() // optional, if you're using timestamps
    });

    if (updated) {
      res.json({ message: 'Transaction updated successfully' });
    } else {
      res.status(404).json({ error: 'Transaction not found' });
    }
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});



// Filter transactions with optional query params: userId, startDate, endDate, type, category, minAmount, maxAmount
router.get('/filter', async (req, res) => {
  const { userId, startDate, endDate, type, category, minAmount, maxAmount } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'userId query parameter is required' });
  }

  try {
    let query = db('transactions').where({ user_id: userId });

    if (startDate) {
      query = query.andWhere('date', '>=', startDate);
    }
    if (endDate) {
      query = query.andWhere('date', '<=', endDate);
    }
    if (type) {
      query = query.andWhere('type', type);
    }
    if (category) {
      query = query.andWhere('category', category);
    }
    if (minAmount) {
      query = query.andWhere('amount', '>=', minAmount);
    }
    if (maxAmount) {
      query = query.andWhere('amount', '<=', maxAmount);
    }

    const transactions = await query;
    res.json(transactions);
  } catch (err) {
    console.error('Filter transactions error:', err);
    res.status(500).json({ error: 'Failed to filter transactions' });
  }
});

// Get summary of transactions for a user
router.get('/summary/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const incomeResult = await db('transactions')
      .where({ user_id: userId, type: 'income' })
      .sum('amount as totalIncome')
      .first();

    const expenseResult = await db('transactions')
      .where({ user_id: userId, type: 'expense' })
      .sum('amount as totalExpense')
      .first();

    const totalIncome = incomeResult.totalIncome || 0;
    const totalExpense = expenseResult.totalExpense || 0;
    const balance = totalIncome - totalExpense;

    res.json({ totalIncome, totalExpense, balance });
  } catch (err) {
    console.error('Summary fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});


module.exports = router;
