const express = require('express');
const transactionController = require('../controllers/transactionController');

const router = express.Router();

router.post('/create', transactionController.createTransaction); // Membuat transaksi
router.put('/:id', transactionController.updateTransaction); // Mengupdate transaksi berdasarkan ID
router.delete('/:id', transactionController.deleteTransaction); // Menghapus transaksi berdasarkan ID
router.get('/:id', transactionController.getTransactionById); // Mendapatkan transaksi berdasarkan ID
router.get('/', transactionController.getAllTransactions); // Mendapatkan semua transaksi

module.exports = router;
