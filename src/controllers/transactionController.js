const { PrismaClient } = require('@prisma/client');
const { convertRupiahToNumber, formatToRupiah, sanitizeString } = require('../utils/formatter');
const prisma = new PrismaClient();

const transactionController = {
  createTransaction: async (req, res) => {
    try {
      const { customerName, foodItems, total, date } = req.body;

      if (!Array.isArray(foodItems) || foodItems.length === 0) {
        return res.status(400).json({ error: 'foodItems kosong atau tidak valid' });
      }

      const transaction = await prisma.transaction.create({
        data: {
          customerName: customerName || 'Guest',
          date: date ? new Date(date) : new Date(),
          total: Number(total),
          foodItems: {
            create: foodItems.map(item => ({
              menuId: item.id,
              name: item.name,
              price: Number(item.price),
              quantity: item.quantity || 1,
            })),
          },
        },
        include: {
          foodItems: {
            include: {
              menu: true,
            },
          },
        },
      });

      res.status(201).json(transaction);
    } catch (error) {
      console.error('Server error details:', error);
      res.status(400).json({
        error: 'Gagal membuat transaksi',
        details: error.message,
      });
    }
  },

  getTransactionById: async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        foodItems: {
          include: {
            menu: true
          }
        }
      }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Get transaction by ID error:', error);
    res.status(500).json({ error: 'Gagal mengambil transaksi', details: error.message });
  }
},


  getAllTransactions: async (req, res) => {
    try {
      const transactions = await prisma.transaction.findMany({
        include: {
          foodItems: {
            include: {
              menu: true
            }
          }
        }
      });

      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: 'Gagal mengambil data transaksi' });
    }
  },

// Mengupdate transaksi berdasarkan ID
updateTransaction: async (req, res) => {
  try {
    const { id } = req.params;
    const { customerName, foodItems, total, date } = req.body;

    // Validate if transaction exists
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id }
    });

    if (!existingTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Validate if foodItems is provided and not empty
    if (!foodItems || foodItems.length === 0) {
      return res.status(400).json({ error: 'Food items are required' });
    }

    // Hapus TransactionItem yang lama
    await prisma.transactionItem.deleteMany({
      where: { transactionId: id }
    });

    // Update transaksi dengan foodItems baru
    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: {
        customerName,
        date: new Date(date),
        total: Number(total),
        foodItems: {
          create: foodItems.map(item => ({
            menuId: item.menuId,
            name: item.name,
            price: Number(item.price),
            quantity: Number(item.quantity)
          }))
        }
      },
      include: {
        foodItems: true // Mengembalikan foodItems yang baru setelah update
      }
    });

    res.json(updatedTransaction);
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(400).json({
      error: 'Gagal mengupdate transaksi',
      details: error.message
    });
  }
},



  deleteTransaction: async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.transaction.delete({
        where: { id: id }
      });
      res.json({ message: 'Transaksi berhasil dihapus' });
    } catch (error) {
      res.status(400).json({ error: 'Gagal hapus transaksi', details: error.message });
    }
  }
};

module.exports = transactionController;
