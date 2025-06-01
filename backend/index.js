const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Add auth routes import and usage
const authRoutes = require('./Routes/authRoutes'); // Make sure this file exists
const userRoutes = require('./Routes/userRoutes');
const transactionRoutes = require('./Routes/transactionRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/', (req, res) => {
  res.send('Personal Budget Tracker is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
