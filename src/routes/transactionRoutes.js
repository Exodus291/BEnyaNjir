const express = require('express');
const transactionController = require('../controllers/transactionController');

const router = express.Router();

router.get('/pending', transactionController.getPendingTransactions); // Mendapatkan semua transaksi
// ... existing code ...

// Correct the route path
router.patch('/:id/final', transactionController.finalizeTransaction);

// ... existing code ...
router.post('/transactions/final', transactionController.createFinalTransaction);
router.post('/pending', transactionController.createPendingTransaction); // Membuat transaksi
router.put('/:id', transactionController.updateTransaction); // Mengupdate transaksi berdasarkan ID
router.delete('/:id', transactionController.deleteTransaction); // Menghapus transaksi berdasarkan ID
router.get('/final', transactionController.getFinalTransactions); // mendapatkantransaksi final
router.get('/:id', transactionController.getTransactionById); // Mendapatkan transaksi berdasarkan ID

module.exports = router;
