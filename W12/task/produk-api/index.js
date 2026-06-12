const express = require('express');
const app =express();

app.use(express());
app.use(require('cors')());

let products = [
{id:1,nama:'Apel Fuji',kategori:'buah',harga:15000,stok:100},
{id:2,nama:'Jeruk Mandarin',kategori:'buah',harga:8000,stok:50},
{id:3,nama:'Wortel',kategori:'sayur',harga:5000,stok:200},
{id:4,nama:'Bayam',kategori:'sayur',harga:3000,stok:150},
{id:5,nama:'Susu Ultra',kategori:'minuman',harga:18000,stok:30}
]
let netxid=6;

app.get('/products', (req, res) => {res.json(products);});
app.get('/products/:id', (req, res) => {const p = products.find(p => p.id == res.params.id); if (!p) return res. status(404).json({ error: 'Produk tidak ditemukan' }); res.json(p); });
app.post('/products' , (req, res) => {
const { nama, kategori, harga, stok = 0 } = req.body;
    if (!nama) return res. status(400).json({ error: 'nama wajib diisi' });
    if (!harga) return res. status(400).json({ error: 'harga wajib diisi' });
    if (harga <= 0 ) return res. status(400).json({ error: 'harga harus positif'
});
const produkBaru = { id: nextId++, nama, kategori, harga, stok, createdAt: new Date().toISOString() }; products. push(produkBaru); res.status(201).json(produkBaru); });


app.put('/products/:id', (req, res) => { const idx = products.findIndex(p => p.id == req.params.id); if (idx === -1) return res.status(404).json({ error: 'Not found' }); products[idx] = { ...products[idx], ...req.body, id: +req.params.id }; res.json(products[idx]);});
app.patch('/products/:id', (req, res) => { const idx = products.findIndex(p => p.id == req.params.id); if (idx === -1) return res.status(404).json({ error: 'Not found' }); Object.assign(products[idx], req.body); res.json(products[idx]); });
app.delete('/products/:id', (req, res) => { const before = products.length; products = products.filter(p => p.id != req.params.id); if (products.length === before) return res.status(404).json({ error: 'Not found' }); res.status(204).send(); });
app.listen(3000, () => console.log('API jalan di http://localhost:3000'));



































