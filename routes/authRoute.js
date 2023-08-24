const express = require("express");
const router = express.Router() 
const { createUser, loginUserCtrl, getallUser, getaUser, deleteaUser, updateaUser, unblockUser, blockUser, handleRefreshToken, logout, updatePassword, forgotPasswordToken, resetPassword, AdminLogin, getWishlist, saveUserAdress, userCart, getUserCart, emptyCart, applyCoupon, createOrder, getOrder, updateOrderStatus } = require("../controller/userCrtl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
router.post("/register", createUser);
router.post("/forgot-password-token", forgotPasswordToken)
router.put("/reset-password/:token", resetPassword)
router.put("/password",authMiddleware, updatePassword)
router.post("/login", loginUserCtrl); 
router.post("/admin-login", AdminLogin);
router.get("/all-users", getallUser)
router.get("/get-order", authMiddleware, getOrder)
router.get("/refresh", handleRefreshToken )
router.get("/wishlist", authMiddleware, getWishlist)
router.post("/cart",authMiddleware, userCart)
router.get("/cart", authMiddleware, getUserCart)
router.post("/cart/applycoupon", authMiddleware, applyCoupon)
router.post("/cart/cash-order", authMiddleware, createOrder)
router.delete("/cart", authMiddleware, emptyCart)
router.put("/order/update-order/:id", authMiddleware, isAdmin, updateOrderStatus)
router.get("/logout", logout)
router.get("/:id",authMiddleware,isAdmin, getaUser)
router.delete("/:id", deleteaUser)
router.put("/edit-user",authMiddleware, updateaUser)
router.put("/save-address",authMiddleware, saveUserAdress)
router.put("/block-user/:id",authMiddleware,isAdmin, blockUser)
router.put("/unblock-user/:id",authMiddleware, isAdmin, unblockUser)

module.exports = router;