const express = require("express");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const {blogImgResize, uploadPhoto} = require("../middlewares/uploadImages")
const { createBlog, updateBlog, getBlog, getBlogs, deleteBlog, liketheBlog, disliketheBlog, uploadImages, } = require("../controller/blogCrtl");
const router = express.Router()


router.post("/", authMiddleware, isAdmin, createBlog)
router.put("/upload/:id", authMiddleware, isAdmin, uploadPhoto.array("images", 2), blogImgResize, uploadImages)
router.put("/likes", authMiddleware, liketheBlog)
router.put("/dislikes", authMiddleware, disliketheBlog)
router.put("/:id", authMiddleware, isAdmin, updateBlog)

router.get("/:id", getBlog)
router.get("/", getBlogs)
router.delete("/:id", authMiddleware, isAdmin, deleteBlog)




module.exports = router;