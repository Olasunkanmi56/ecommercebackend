const Coupon = require("../models/couponModel")
const asyncHandler = require("express-async-handler")
const validateMongodbId = require("../utils/validateMongodbId")

//  create coupon
const createCoupon = asyncHandler(async (req, res) => {
    try {
        const newCoupon = await Coupon.create(req.body);
        res.json(newCoupon);
    } catch (error) {
        console.error('Error creating coupon:', error);
        res.status(500).json({ error: 'An error occurred while creating the coupon' });
    }
});

//  get all coupon
const getallCoupons = asyncHandler(async (req, res) => {
    try {
        // Fetch all coupons from the Coupon collection
        const getallCoupons = await Coupon.find();
        
        // Send the fetched coupons as a JSON response
        res.json(getallCoupons);
    } catch (error) {
        // Handle any errors that might occur
        console.error('Error fetching coupons:', error);
        res.status(500).json({ error: 'An error occurred while fetching coupons' });
    }
});

//  update coupon
const updateCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id); // Validate the provided ID format
    
    try {
        // Update the coupon by finding its ID and using the data in req.body
        const updateCoupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true });
        
        // Send the updated coupon as a JSON response
        res.json(updateCoupon);
    } catch (error) {
        // Handle any errors that might occur
        console.error('Error updating coupon:', error);
        res.status(500).json({ error: 'An error occurred while updating the coupon' });
    }
});


//  delete coupon
const deleteCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id); // Validate the provided ID format
    
    try {
        // Delete the coupon by finding its ID
        const deletedCoupon = await Coupon.findByIdAndDelete(id);
        
        if (!deletedCoupon) {
            return res.status(404).json({ error: 'Coupon not found' });
        }

        // Send a success message as a JSON response
        res.json({ message: 'Coupon deleted successfully' });
    } catch (error) {
        // Handle any errors that might occur
        console.error('Error deleting coupon:', error);
        res.status(500).json({ error: 'An error occurred while deleting the coupon' });
    }
});




module.exports = {createCoupon, getallCoupons, updateCoupon, deleteCoupon}