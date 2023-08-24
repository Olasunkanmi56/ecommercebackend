const express = require("express")
const { createBrand, updateBrand, daleteBrand, getBrand, getAllBrand } = require("../controller/brandCrtl")
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware")
const router = express.Router()


router.post("/", authMiddleware, isAdmin, createBrand)
router.put("/:id", authMiddleware, isAdmin, updateBrand)
router.delete("/:id", authMiddleware, isAdmin, daleteBrand)
router.get("/:id", getBrand)
router.get("/", getAllBrand)
module.exports = router