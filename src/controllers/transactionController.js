const { PrismaClient } = require('@prisma/client');
const { convertRupiahToNumber, formatToRupiah, sanitizeString } = require('../utils/formatter');
const prisma = new PrismaClient();

const transactionController = {
  createPendingTransaction: async (req, res) => {
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
          status: 'pending',
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
  

    createFinalTransaction: async (req, res) => {
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
          status: 'final',
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

finalizeTransaction: async (req, res) => {
  try {
    const { id } = req.params;
    
    // Cek apakah transaksi ada dengan include foodItems
    const existing = await prisma.transaction.findUnique({
      where: { id },
      include: {
        foodItems: {
          include: {
            menu: true
          }
        }
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
    }

    if (existing.status === 'final') {
      return res.status(400).json({ error: 'Transaksi sudah final' });
    }

    // Update status ke final dengan PATCH
    const finalized = await prisma.transaction.update({
      where: { id },
      data: {
        status: 'final',
        ...req.body
      },
      include: {
        foodItems: {
          include: {
            menu: true
          }
        }
      }
    });

    res.json({
      message: `Transaksi dengan ID ${id} berhasil difinalisasi`,
      data: finalized
    });
  } catch (error) {
    console.error('Finalize error:', error);
    res.status(500).json({ 
      error: 'Gagal memfinalisasi transaksi',
      details: error.message 
    });
  }
},



  getFinalTransactions: async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        status: 'final', // Ambil transaksi dengan status 'final'
      },
      include: {
        foodItems: true, // Include foodItems yang terkait
      },
    });

    res.json(transactions);
  } catch (error) {
    console.error('Get final transactions error:', error);
    res.status(500).json({ error: 'Gagal mengambil data transaksi final' });
  }
},


getTransactionById: async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        status: 'pending' // hanya ambil transaksi pending
      },
      include: {
        foodItems: {
          include: {
            menu: true
          }
        }
      }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaksi tidak ditemukan atau bukan pending' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Get transaction by ID error:', error);
    res.status(500).json({ error: 'Gagal mengambil transaksi', details: error.message });
  }
},



  getPendingTransactions: async (req, res) => {
    try {
      const transactions = await prisma.transaction.findMany({
        where: {
         status: 'pending', // hanya ambil transaksi pending 
        },
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
        status: 'pending',
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

    // Cek apakah transaksi ada dan statusnya pending
    const existing = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
    }

    if (existing.status !== 'pending') {
      return res.status(403).json({ error: 'Hanya transaksi pending yang bisa dihapus' });
    }

    // Hapus item-item transaksi terlebih dahulu
    await prisma.transactionItem.deleteMany({
      where: { transactionId: id },
    });

    // Hapus transaksi utama
    await prisma.transaction.delete({
      where: { id },
    });

    res.json({ message: 'Transaksi pending berhasil dihapus' });
  } catch (error) {
    res.status(400).json({
      error: 'Gagal hapus transaksi',
      details: error.message,
    });
  }
}
};

module.exports = transactionController;
