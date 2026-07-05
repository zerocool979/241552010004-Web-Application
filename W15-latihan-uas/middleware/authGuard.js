const jwt = require("jsonwebtoken")
const prisma = require("../db")

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Token tidak ditemukan"
      })
    }

    const token = authHeader.split(" ")[1]

    let decoded

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      return res.status(401).json({
        message: "Token tidak valid"
      })
    }

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId
      },
      select: {
        id: true,
        email: true,
        nama: true,
        role: true
      }
    })

    if (!user) {
      return res.status(401).json({
        message: "User tidak ditemukan"
      })
    }

    req.user = user

    next()

  } catch (err) {
    next(err)
  }
}
