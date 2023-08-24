const prodCategory = require("../models/prodCategoryModel")
const asyncHandler = require("express-async-handler")
const validateMongodbId = require("../utils/validateMongodbId")

// add category

const createCategory = asyncHandler (async (req, res) => {
    try {
         const newCategory = await prodCategory.create(req.body)
         res.json(newCategory)
    } catch (error) {
        throw new Error(error)
    }
})

// update category

const updateCategory = asyncHandler (async (req, res) => {
    const {id} = req.params
    validateMongodbId(id)
    try {
         const updateCategory = await prodCategory.findByIdAndUpdate(id, req.body, {
            new: true
         })
         res.json(updateCategory)
    } catch (error) {
        throw new Error(error)
    }
})

// delete category
const daleteCategory = asyncHandler (async (req, res) => {
    const {id} = req.params
    validateMongodbId(id)
    try {
         const daleteCategory = await prodCategory.findByIdAndDelete(id)
         res.json(daleteCategory)
    } catch (error) {
        throw new Error(error)
    }
})

//  get category
const getCategory = asyncHandler (async (req, res) => {
    const {id} = req.params
    validateMongodbId(id)
    try {
         const getCategory = await prodCategory.findById(id)
         res.json(getCategory)
    } catch (error) {
        throw new Error(error)
    }
})

//  get all category
const getAllCategory = asyncHandler (async (req, res) => {
    try {
         const getAllCategory = await prodCategory.find()
         res.json(getAllCategory)
    } catch (error) {
        throw new Error(error)
    }
})
module.exports = {createCategory, updateCategory, daleteCategory, getCategory, getAllCategory}