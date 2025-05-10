const express = require('express');
const cors = require('cors');
const menuRoutes = require('./routes/menuRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/menu', menuRoutes);
app.use('/api/transactions', transactionRoutes);

app.listen(port, () => {
  console.log(`Server berjalan di port ${port}`);
});
