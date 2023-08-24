const express = require("express")
const { createCategory, updateCategory, daleteCategory, getCategory, getAllCategory } = require("../controller/prodCategoryCtrl")
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware")
const { getAllProduct } = require("../controller/productCrtl")
const router = express.Router()


router.post("/", authMiddleware, isAdmin, createCategory)
router.put("/:id", authMiddleware, isAdmin, updateCategory)
router.delete("/:id", authMiddleware, isAdmin, daleteCategory)
router.get("/:id", getCategory)
router.get("/", getAllCategory)
module.exports = router