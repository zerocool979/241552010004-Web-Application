require("dotenv").config();
const express = require("express");

const authGuard = require("./middleware/authGuard");
const authRoutes = require("./routes/auth");
const filmRoutes = require("./routes/film");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/film", authGuard, filmRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Koleksi Film API berjalan dengan baik 🎬" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Endpoint tidak ditemukan" });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
