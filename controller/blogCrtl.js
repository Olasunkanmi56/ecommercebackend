const Blog = require("../models/blogModel")
 const user = require("../models/userModel")
 const fs = require("fs")
 const asyncHandler = require("express-async-handler")
 const validateMongodbId = require("../utils/validateMongodbId")
 const cloudinaryUploadImg = require("../utils/cloudinary")

//  create blog
 const createBlog = asyncHandler(async (req, res) => {
    try {
        const newBlog = await Blog.create(req.body);
        res.status(201).json(newBlog);
    } catch (error) {
        console.error('Error creating blog:', error);
        res.status(500).json({ error: 'An error occurred while creating the blog' });
    }
});

//  update blog
const updateBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id)
    try {
        const updatedBlog = await Blog.findByIdAndUpdate(id, req.body, {
            new: true
        });
        if (!updatedBlog) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        res.status(200).json(updatedBlog);
    } catch (error) {
        console.error('Error updating blog:', error);
        res.status(500).json({ error: 'An error occurred while updating the blog' });
    }
});

// get a blog
const getBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id)
    try {
        // Fetch the blog and update its view count in one operation
        const getBlog = await Blog.findById(id).populate("likes").populate("dislikes")
        const updatedBlog = await Blog.findByIdAndUpdate(
            id,
            { $inc: { numViews: 1 } },
            { new: true }
        );
        res.status(200).json(getBlog);
    } catch (error) {
        console.error('Error fetching and updating blog:', error);
        res.status(500).json({ error: 'An error occurred while fetching and updating the blog' });
    }
});

// get all blogs

const getBlogs = asyncHandler(async (req, res) => {
    try {
        const blogs = await Blog.find();

        if (blogs.length === 0) {
            return res.status(404).json({ message: 'No blogs found' });
        }

        res.status(200).json(blogs);
    } catch (error) {
        console.error('Error getting blogs:', error);
        res.status(500).json({ error: 'An error occurred while getting blogs' });
    }
});

//  delete blog
const deleteBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id)
    try {
        const deletedBlog = await Blog.findByIdAndDelete(id);

        if (!deletedBlog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        res.status(200).json({ message: 'Blog deleted successfully', deletedBlog });
    } catch (error) {
        console.error('Error deleting blog:', error);
        res.status(500).json({ error: 'An error occurred while deleting the blog' });
    }
});

// like a blog
const liketheBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.body;
    validateMongodbId(blogId)
    //  find the blog which you want to be liked
    const blog = await Blog.findById(blogId);
    // find the login user
    const loginUserId = req?.user?._id;
    //  find if the user has liked the blog
    const isLiked = blog?.isLiked;
    // find if the user has disliked the blog
    const alreadyDisliked = blog?.dislikes?.find((userId) => userId?.toString() === loginUserId?.toString());
    if(alreadyDisliked) {
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull: { dislikes: loginUserId},
                isDisliked: false,
            }, {
                new: true
            }
        )
        res.json(blog)
    }
    if(isLiked) {
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull: { likes: loginUserId},
                isLiked: false,
            }, {
                new: true
            }
        )
        res.json(blog)
    } else {
        const blog = await Blog.findByIdAndUpdate(
            blogId,
             {
                $push: { likes: loginUserId },
                isLiked: true,
            },
            {
                new: true
            }
        )
        res.json(blog)
    }
})



// dislike a blog
const disliketheBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.body;
    console.log(blogId);
    validateMongodbId(blogId)
    //  find the blog which you want to be liked
    const blog = await Blog.findById(blogId);
    // find the login user
    const loginUserId = req?.user?._id;
    //  find if the user has liked the blog
    const isDisLiked = blog?.isDisliked;
    // find if the user has disliked the blog
    const alreadyLiked = blog?.likes?.find((userId) => userId?.toString() === loginUserId?.toString());
    if(alreadyLiked) {
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull: { likes: loginUserId},
                isLiked: false,
            }, {
                new: true
            }
        )
        res.json(blog)
    }
    if(isDisLiked) {
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull: { dislikes: loginUserId},
                isDisliked: false,
            }, {
                new: true
            }
        )
        res.json(blog)
    } else {
        const blog = await Blog.findByIdAndUpdate(
            blogId,
             {
                $push: { dislikes: loginUserId },
                isDisliked: true,
            },
            {
                new: true
            }
        )
        res.json(blog)
    }
})


//  upload product image
const uploadImages = asyncHandler ( async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id)
    try{
       const uploader = (path) => cloudinaryUploadImg(path, "images")
       const urls = []
       const files = req.files;
       for(const file of files) {
        const { path } = file;
        const newpath = await uploader(path)
        urls.push(newpath)
        fs.unlinkSync(path)
       }
       const findBlog = await Blog.findByIdAndUpdate(id, 
        {
            images: urls.map(file => {
                return file
            })
        }, {new: true}
        )
        res.json(findBlog)
    } catch(error) {
        throw new Error(error)
    }
})


module.exports = { createBlog, updateBlog, getBlog, getBlogs, deleteBlog, liketheBlog, disliketheBlog, uploadImages}