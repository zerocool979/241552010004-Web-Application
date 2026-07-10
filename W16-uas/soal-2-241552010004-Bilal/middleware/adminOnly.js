function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Akses ditolak, hanya admin yang boleh mengakses endpoint ini",
    });
  }

  next();
}

module.exports = adminOnly;
