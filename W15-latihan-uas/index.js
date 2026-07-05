const express = require("express")
const dotenv = require("dotenv")

dotenv.config()

const authRoutes = require("./routes/auth")
const transaksiRoutes = require("./routes/transaksi")

const app = express()

app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/transaksi", transaksiRoutes)

app.use((err, req, res, next) => {
  console.error(err)

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error"
  })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`)
})
