const express = require("express")
const prisma = require("../db")
const authGuard = require("../middleware/authGuard")
const router = express.Router()
router.use(authGuard)
const isAdmin = (req) => req.user.role === "admin"
const canAccess = (req, transaksi) => {
  return isAdmin(req) || transaksi.userId === req.user.id
}

router.post("/", async (req, res, next) => {
  try {
    const { judul, jumlah, jenis, kategori, tanggal } = req.body

    if (!judul || jumlah === undefined || !jenis || !kategori) {
      return res.status(400).json({
        message: "Judul, jumlah, jenis, dan kategori wajib diisi"
      })
    }

    if (!["pemasukan", "pengeluaran"].includes(jenis)) {
      return res.status(400).json({
        message: "Jenis harus pemasukan atau pengeluaran"
      })
    }

    if (isNaN(jumlah) || Number(jumlah) <= 0) {
      return res.status(400).json({
        message: "Jumlah harus berupa angka positif"
      })
    }

    const transaksi = await prisma.transaksi.create({
      data: {
        judul,
        jumlah: Number(jumlah),
        jenis,
        kategori,
        tanggal: tanggal ? new Date(tanggal) : new Date(),
        userId: req.user.id
      }
    })

    res.status(201).json({
      message: "Transaksi berhasil ditambahkan",
      transaksi
    })
  } catch (err) {
    next(err)
  }
})

router.get("/", async (req, res, next) => {
  try {
    const transaksi = await prisma.transaksi.findMany({
      where: isAdmin(req) ? {} : { userId: req.user.id },
      include: {
        user: {
          select: {
            id: true,
            nama: true,
            email: true
          }
        }
      },
      orderBy: {
        tanggal: "desc"
      }
    })

    res.json(transaksi)
  } catch (err) {
    next(err)
  }
})

router.get("/ringkasan", async (req, res, next) => {
  try {
    const transaksi = await prisma.transaksi.findMany({
      where: isAdmin(req) ? {} : { userId: req.user.id }
    })

    const totalPemasukan = transaksi
      .filter(t => t.jenis === "pemasukan")
      .reduce((sum, t) => sum + t.jumlah, 0)

    const totalPengeluaran = transaksi
      .filter(t => t.jenis === "pengeluaran")
      .reduce((sum, t) => sum + t.jumlah, 0)

    res.json({
      totalPemasukan,
      totalPengeluaran,
      saldo: totalPemasukan - totalPengeluaran
    })
  } catch (err) {
    next(err)
  }
})

router.get("/:id", async (req, res, next) => {
  try {
    const transaksi = await prisma.transaksi.findUnique({
      where: {
        id: Number(req.params.id)
      },
      include: {
        user: {
          select: {
            id: true,
            nama: true,
            email: true
          }
        }
      }
    })

    if (!transaksi) {
      return res.status(404).json({
        message: "Transaksi tidak ditemukan"
      })
    }

    if (!canAccess(req, transaksi)) {
      return res.status(403).json({
        message: "Akses ditolak"
      })
    }

    res.json(transaksi)

  } catch (err) {
    next(err)
  }
})

router.put("/:id", async (req, res, next) => {
  try {

    const transaksi = await prisma.transaksi.findUnique({
      where: {
        id: Number(req.params.id)
      }
    })

    if (!transaksi) {
      return res.status(404).json({
        message: "Transaksi tidak ditemukan"
      })
    }

    if (!canAccess(req, transaksi)) {
      return res.status(403).json({
        message: "Akses ditolak"
      })
    }

    const data = {}

    if (req.body.judul !== undefined)
      data.judul = req.body.judul

    if (req.body.kategori !== undefined)
      data.kategori = req.body.kategori

    if (req.body.tanggal !== undefined)
      data.tanggal = new Date(req.body.tanggal)

    if (req.body.jenis !== undefined) {
      if (!["pemasukan", "pengeluaran"].includes(req.body.jenis)) {
        return res.status(400).json({
          message: "Jenis harus pemasukan atau pengeluaran"
        })
      }
      data.jenis = req.body.jenis
    }

    if (req.body.jumlah !== undefined) {
      if (isNaN(req.body.jumlah) || Number(req.body.jumlah) <= 0) {
        return res.status(400).json({
          message: "Jumlah harus berupa angka positif"
        })
      }

      data.jumlah = Number(req.body.jumlah)
    }

    const updated = await prisma.transaksi.update({
      where: {
        id: transaksi.id
      },
      data
    })

    res.json({
      message: "Transaksi berhasil diupdate",
      transaksi: updated
    })

  } catch (err) {
    next(err)
  }
})

router.delete("/:id", async (req, res, next) => {
  try {

    const transaksi = await prisma.transaksi.findUnique({
      where: {
        id: Number(req.params.id)
      }
    })

    if (!transaksi) {
      return res.status(404).json({
        message: "Transaksi tidak ditemukan"
      })
    }

    if (!canAccess(req, transaksi)) {
      return res.status(403).json({
        message: "Akses ditolak"
      })
    }

    await prisma.transaksi.delete({
      where: {
        id: transaksi.id
      }
    })

    res.json({
      message: "Transaksi berhasil dihapus"
    })

  } catch (err) {
    next(err)
  }
})

module.exports = router
