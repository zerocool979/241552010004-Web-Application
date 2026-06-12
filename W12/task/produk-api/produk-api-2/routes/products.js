const router = require('express').Router();
const validate = require('../middleware/validateProduct');
let products = require('../data/seed');
let nextId = products.length + 1; router.get('/', (req, res) => { let result = [...products];
if (req.query.kategori) result = result.filter(p => p.kategori === req.query.kategori);
if (req.query.search) result = result.filter(p => p.nama.toLowerCase().includes(req.query.search.toLowerCase()));
if (req.query.minHarga) result = result.filter(p => p.harga >= +req.query.minHarga);
if (req.query.maxHarga) result = result.filter(p => p.harga <= +req.query.maxHarga);
if (req.query.sort === 'harga') result.sort((a, b) => a.harga - b.harga); else if (req.query.sort === 'nama') result.sort((a, b) => a.nama.localeCompare(b.nama)); res.json({ total: result.length, data: result }); }); router.get('/:id', (req, res) => {
const p = products.find(p => p.id == req.params.id); if (!p) return res.status(404).json({ error: 'Produk tidak ditemukan' }); res.json(p); }); router.post('/', validate, (req, res) => {
const p = { id: nextId++, ...req.body, createdAt: new Date().toISOString() }; products.push(p); res.status(201).json(p); }); router.put('/:id', validate, (req, res) => {
const idx = products.findIndex(p => p.id == req.params.id); if (idx === -1) return res.status(404).json({ error: 'Produk tidak ditemukan' }); products[idx] = { ...products[idx], ...req.body, id: +req.params.id }; res.json(products[idx]); });

router.patch('/:id', (req, res) => {
const idx = products.findIndex(p => p.id == req.params.id);
if (idx === -1) return res.status(404).json({ error: 'Produk tidak ditemukan' });
Object.assign(products[idx], req.body);
res.json(products[idx]);
});

router.delete('/:id', (req, res) => {
const before = products.length;
products = products.filter(p => p.id != req.params.id);
if (products.length === before)
return res.status(404).json({ error: 'Produk tidak ditemukan' });
res.status(204).send();
});
module.exports = router;
