const express = require("express");
const prisma = require("../db");

const router = express.Router();

const STATUS_VALID = ["ingin-ditonton", "sedang-ditonton", "sudah-ditonton"];

function isStatusValid(status) {
  return STATUS_VALID.includes(status);
}

function isRatingValid(rating) {
  return typeof rating === "number" && !Number.isNaN(rating) && rating >= 1 && rating <= 10;
}

function isAllowed(film, user) {
  return film.userId === user.userId || user.role === "admin";
}

router.get("/ringkasan", async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";

    const whereClause = isAdmin ? {} : { userId: req.user.userId };

    const semuaFilm = await prisma.film.findMany({
      where: whereClause,
    });

    const ringkasan = {
      "ingin-ditonton": 0,
      "sedang-ditonton": 0,
      "sudah-ditonton": 0,
    };

    let totalRating = 0;
    let jumlahYangDiRating = 0;

    semuaFilm.forEach((film) => {
      if (ringkasan[film.statusTonton] !== undefined) {
        ringkasan[film.statusTonton] += 1;
      }

      if (film.rating !== null && film.rating !== undefined) {
        totalRating += film.rating;
        jumlahYangDiRating += 1;
      }
    });

    const rataRataRating =
      jumlahYangDiRating > 0
        ? Math.round((totalRating / jumlahYangDiRating) * 100) / 100
        : null;

    return res.status(200).json({
      ...ringkasan,
      rataRataRating,
    });
  } catch (error) {
    console.error("Error saat ambil ringkasan:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { judul, sutradara, genre, tahun, rating, statusTonton } = req.body;

    if (!judul || !genre || !statusTonton) {
      return res.status(400).json({
        message: "Judul, genre, dan statusTonton wajib diisi",
      });
    }

    if (!isStatusValid(statusTonton)) {
      return res.status(400).json({
        message:
          "statusTonton harus salah satu dari: ingin-ditonton, sedang-ditonton, sudah-ditonton",
      });
    }

    if (rating !== undefined && rating !== null && !isRatingValid(rating)) {
      return res.status(400).json({
        message: "Rating harus berupa angka antara 1 sampai 10",
      });
    }

    const filmBaru = await prisma.film.create({
      data: {
        judul,
        sutradara: sutradara ?? null,
        genre,
        tahun: tahun ?? null,
        rating: rating ?? null,
        statusTonton,
        userId: req.user.userId,
      },
    });

    return res.status(201).json({
      message: "Film berhasil ditambahkan",
      film: filmBaru,
    });
  } catch (error) {
    console.error("Error saat tambah film:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";
    const whereClause = isAdmin ? {} : { userId: req.user.userId };

    const daftarFilm = await prisma.film.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, nama: true, email: true },
        },
      },
    });

    daftarFilm.sort((a, b) => {
      if (a.rating === null && b.rating === null) return 0;
      if (a.rating === null) return 1;
      if (b.rating === null) return -1;
      return b.rating - a.rating;
    });

    return res.status(200).json(daftarFilm);
  } catch (error) {
    console.error("Error saat ambil daftar film:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const film = await prisma.film.findUnique({
      where: { id: Number(id) },
      include: {
        user: {
          select: { id: true, nama: true, email: true },
        },
      },
    });

    if (!film) {
      return res.status(404).json({
        message: "Film tidak ditemukan",
      });
    }

    if (!isAllowed(film, req.user)) {
      return res.status(403).json({
        message: "Anda tidak punya akses ke film ini",
      });
    }

    return res.status(200).json(film);
  } catch (error) {
    console.error("Error saat ambil detail film:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { judul, sutradara, genre, tahun, rating, statusTonton } = req.body;

    const film = await prisma.film.findUnique({
      where: { id: Number(id) },
    });

    if (!film) {
      return res.status(404).json({
        message: "Film tidak ditemukan",
      });
    }

    if (!isAllowed(film, req.user)) {
      return res.status(403).json({
        message: "Anda tidak punya akses ke film ini",
      });
    }

    if (statusTonton !== undefined && !isStatusValid(statusTonton)) {
      return res.status(400).json({
        message:
          "statusTonton harus salah satu dari: ingin-ditonton, sedang-ditonton, sudah-ditonton",
      });
    }

    if (rating !== undefined && rating !== null && !isRatingValid(rating)) {
      return res.status(400).json({
        message: "Rating harus berupa angka antara 1 sampai 10",
      });
    }

    const dataUpdate = {};
    if (judul !== undefined) dataUpdate.judul = judul;
    if (sutradara !== undefined) dataUpdate.sutradara = sutradara;
    if (genre !== undefined) dataUpdate.genre = genre;
    if (tahun !== undefined) dataUpdate.tahun = tahun;
    if (rating !== undefined) dataUpdate.rating = rating;
    if (statusTonton !== undefined) dataUpdate.statusTonton = statusTonton;

    const filmTerupdate = await prisma.film.update({
      where: { id: Number(id) },
      data: dataUpdate,
    });

    return res.status(200).json({
      message: "Film berhasil diupdate",
      film: filmTerupdate,
    });
  } catch (error) {
    console.error("Error saat update film:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const film = await prisma.film.findUnique({
      where: { id: Number(id) },
    });

    if (!film) {
      return res.status(404).json({
        message: "Film tidak ditemukan",
      });
    }

    if (!isAllowed(film, req.user)) {
      return res.status(403).json({
        message: "Anda tidak punya akses ke film ini",
      });
    }

    await prisma.film.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({
      message: "Film berhasil dihapus",
    });
  } catch (error) {
    console.error("Error saat hapus film:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
    });
  }
});

module.exports = router;
