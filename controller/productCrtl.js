const Product = require("../models/productModel")
const asyncHandler = require("express-async-handler")
const slugify = require("slugify")
const fs = require("fs")
const cloudinaryUploadImg = require("../utils/cloudinary")
const User = require("../models/userModel")
const validateMongodbId = require("../utils/validateMongodbId")


//  create product
const createProduct = asyncHandler(async (req, res) => {
    try {
        if(req.body.title) {
        req.body.slug = slugify(req.body.title)
        }
       const newProduct = await Product.create(req.body)
       res.json(newProduct)
    } catch(error) {
        throw new Error(error)
    }
})

//  update product
const updateProduct = asyncHandler(async (req, res) => {
    const productId = req.params.id; // Extract the actual product ID from req.params
    try {
       if (req.body.title) {
          req.body.slug = slugify(req.body.title); // Assuming slugify is properly defined
       }
       const updatedProduct = await Product.findOneAndUpdate(
          { _id: productId }, // Using the correct field for the query
          req.body,
          { new: true }
       );
       res.json(updatedProduct);
    } catch (error) {
       throw new Error(error);
    }
 });

 //  delete product
const deleteProduct = asyncHandler(async (req, res) => {
    const productId = req.params.id; // Extract the actual product ID from req.params
    try {
       if (req.body.title) {
          req.body.slug = slugify(req.body.title); // Assuming slugify is properly defined
       }
       const deleteProduct = await Product.findOneAndDelete(
          { _id: productId }, // Using the correct field for the query
          req.body,
          { new: true }
       );
       res.json(deleteProduct);
    } catch (error) {
       throw new Error(error);
    }
 });
 

// get a product
const getaProduct = asyncHandler(async (req, res) => {
    const { id } = req.params
    try {
        const findProduct = await Product.findById(id)
        res.json(findProduct)
    }catch(error) {
        throw new Error(error)
    }
})

//  get all product
const getAllProduct = asyncHandler(async (req, res, next) => {
    try {
        // filtering
        const queryObj = { ...req.query };
        const excludeFields = ["page", "sort", "limit", "fields"];
        excludeFields.forEach((el) => delete queryObj[el]);
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        let query = Product.find(JSON.parse(queryStr));
        
        // sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(",").join(" ");
            query = query.sort(sortBy);
        } else {
            query = query.sort("-createdAt");
        }
        //  limiting fields
        if (req.query.fields) {
            const fields = req.query.fields.split(",").join(" ");
            query = query.select(fields);
        } else {
            query = query.select("-__v");
        }
        //  pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);

        if (page <= 0) {
            throw new Error("Invalid page number");
        }
        const productCount = await Product.countDocuments();
        if (skip >= productCount) {
            throw new Error("This Page does not exist");
        }
        const products = await query;
        res.json(products);
    } catch (error) {
        next(error);
    }
});

//  Add to wishlist
const addToWishlist = asyncHandler (async (req, res) => {
    const { _id } = req.user
    const { prodId } = req.body
    try {
        const user = await User.findById(_id)
        const alreadyAdded = user?.wishlist?.find((id) => id.toString() === prodId)
        if(alreadyAdded) {
            let user = await User.findByIdAndUpdate(_id, {$pull: {wishlist: prodId} }, {new: true});
            res.json(user)
        } else {
            let user = await User.findByIdAndUpdate(_id, {$push: {wishlist: prodId} }, {new: true});
            res.json(user)
        }
    } catch(error) {
        res.status(500).json({ error: 'An error occurred while adding to the wishlist' });
    }
})

//  rating 
const rating = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { star, prodId, comment } = req.body;

    try {
        const product = await Product.findById(prodId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const userAlreadyRated = product.ratings.find(
            (rating) => rating.postedby.toString() === _id.toString()
        );

        if (userAlreadyRated) {
            await Product.updateOne(
                { 'ratings.postedby': _id },
                { $set: { 'ratings.$.star': star, 'ratings.$.comment': comment } }
            );
        } else {
            await Product.findByIdAndUpdate(
                prodId,
                {
                    $push: {
                        ratings: {
                            star: star,
                            comment: comment,
                            postedby: _id,
                        },
                    },
                }
            );
        }

        const updatedProduct = await Product.findById(prodId);
        const totalRating = updatedProduct.ratings.length;
        const ratingsSum = updatedProduct.ratings.reduce((total, rating) => total + rating.star, 0);
        const actualRating = Math.round(ratingsSum / totalRating);

        const finalProduct = await Product.findByIdAndUpdate(
            prodId,
            { totalrating: actualRating },
            { new: true }
        );

        res.json(finalProduct);
    } catch (error) {
        console.error('Error rating product:', error);
        res.status(500).json({ error: 'An error occurred while rating the product' });
    }
});

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
       const findProduct = await Product.findByIdAndUpdate(id, 
        {
            images: urls.map(file => {
                return file
            })
        }, {new: true}
        )
        res.json(findProduct)
    } catch(error) {
        throw new Error(error)
    }
})



module.exports = {createProduct, getaProduct, getAllProduct, updateProduct, deleteProduct, addToWishlist, rating, uploadImages}