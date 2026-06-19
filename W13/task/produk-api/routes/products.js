// routes/products.js
const express = require('express');
const prisma = require('../db');
const router = express.Router();
const adminOnly = require('../middleware/adminOnly');
// GET /api/products — ambil semua produk
router.get('/', async (req, res, next) => {
 try {
 const data = await prisma.product.findMany({
 orderBy: { createdAt: 'desc' }
 });
 res.json(data);
 } catch (e) { next(e); }
});
// POST /api/products — tambah produk baru
router.post('/', async (req, res, next) => {
 try {
 const { nama, harga, stok } = req.body;
 if (!nama || harga == null)
 return res.status(400).json({ error: 'nama & harga wajib' });
 const p = await prisma.product.create({
 data: { nama, harga: +harga, stok: +(stok||0) }
 });
 res.status(201).json(p);
 } catch (e) { next(e); }
});

// GET /api/products/:id — ambil satu produk
router.get('/:id', async (req, res, next) => {
 try {
 const p = await prisma.product.findUnique({
 where: { id: +req.params.id }
 });
 if (!p) return res.status(404).json({ error: 'Tidak ada' });
 res.json(p);
 } catch (e) { next(e); }
});
// PUT /api/products/:id — edit produk
router.put('/:id', async (req, res, next) => {
 try {
 const { nama, harga, stok } = req.body;
 const p = await prisma.product.update({
 where: { id: +req.params.id },
 data: { nama, harga: +harga, stok: +stok }
 });
 res.json(p);
 } catch (e) {
 if (e.code === 'P2025')
 return res.status(404).json({ error: 'Tidak ada' });
 next(e);
 }
});
// DELETE /api/products/:id — hapus produk
router.delete('/:id', adminOnly,  async (req, res, next) => {
 try {
 await prisma.product.delete({ where: { id: +req.params.id } });
 res.status(204).send();
 } catch (e) {
 if (e.code === 'P2025')
 return res.status(404).json({ error: 'Tidak ada' });
 next(e);
 }
});

module.exports = router;
