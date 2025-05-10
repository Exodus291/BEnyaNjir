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

  updateTransaction: async (req, res) => {
    try {
      const { id } = req.params;
      const { customerName, foodItems, total, date } = req.body;

      const updatedTransaction = await prisma.transaction.update({
        where: { id: id },
        data: {
          customerName: customerName ? sanitizeString(customerName) : undefined,
          date: date ? new Date(date) : undefined,
          total: total !== undefined
            ? (typeof total === 'string' ? convertRupiahToNumber(total) : Number(total))
            : undefined,
          foodItems: foodItems ? {
            deleteMany: {},
            create: foodItems.map(item => ({
              menuId: Number(item.id),
              name: item.name,
              price: Number(item.price),
              quantity: item.quantity || 1
            }))
          } : undefined
        },
        include: {
          foodItems: { include: { menu: true } }
        }
      });

      res.json(updatedTransaction);
    } catch (error) {
      res.status(400).json({ error: 'Gagal update transaksi', details: error.message });
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
