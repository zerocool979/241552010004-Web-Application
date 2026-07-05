const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Autentikasi diperlukan"
    })
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Akses ditolak. Hanya admin yang diizinkan."
    })
  }

  next()
}

module.exports = adminOnly
