const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const menuController = {
  // Mendapatkan semua menu dengan fitur pencarian
  getAllMenu: async (req, res) => {
    try {
      const { search } = req.query;
      const menus = await prisma.menu.findMany({
        where: {
          nama: {
            contains: search || '',
            mode: 'insensitive' // Case-insensitive search
          }
        },
        orderBy: {
          id: 'asc',
        },
      });
      res.json(menus);
    } catch (error) {
      res.status(500).json({ error: 'Gagal mengambil data menu' });
    }
  },

  // Mendapatkan menu by ID
  getMenuById: async (req, res) => {
    try {
      const menu = await prisma.menu.findUnique({
        where: { id: parseInt(req.params.id) },
      });
      if (!menu) {
        return res.status(404).json({ error: 'Menu tidak ditemukan' });
      }
      res.json(menu);
    } catch (error) {
      res.status(500).json({ error: 'Gagal mengambil data menu' });
    }
  },

  // Membuat menu baru
  createMenu: async (req, res) => {
    const { nama, harga } = req.body;
    try {
      const menu = await prisma.menu.create({
        data: {
          nama,
          harga,
        },
      });
      res.status(201).json(menu);
    } catch (error) {
      res.status(400).json({ error: 'Gagal menambahkan menu' });
    }
  },

  // Mengupdate menu
  updateMenu: async (req, res) => {
    const { nama, harga } = req.body;
    try {
      const menu = await prisma.menu.update({
        where: { id: parseInt(req.params.id) },
        data: {
          nama,
          harga,
        },
      });
      res.json(menu);
    } catch (error) {
      res.status(400).json({ error: 'Gagal mengupdate menu' });
    }
  },

  // Menghapus menu
  deleteMenu: async (req, res) => {
    try {
      await prisma.menu.delete({
        where: { id: parseInt(req.params.id) },
      });
      res.json({ message: 'Menu berhasil dihapus' });
    } catch (error) {
      res.status(400).json({ error: 'Gagal menghapus menu' });
    }
  },
};

module.exports = menuController;
