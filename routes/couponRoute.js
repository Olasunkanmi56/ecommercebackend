const express = require("express")
const router = express.Router()
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware")
const { createCoupon, getallCoupons, updateCoupon, deleteCoupon} = require("../controller/couponCrtl")

router.post("/", authMiddleware, isAdmin,  createCoupon)
router.get("/", authMiddleware, isAdmin, getallCoupons)
router.put("/:id", authMiddleware, isAdmin, updateCoupon)
router.delete("/:id", authMiddleware, isAdmin, deleteCoupon)
module.exports = router