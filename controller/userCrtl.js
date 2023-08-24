const { generateToken } = require("../config/jwtToken");
const User = require("../models/userModel")
const Product = require("../models/productModel")
const Cart = require("../models/cartModel")
const Coupon = require("../models/couponModel")
const Order = require("../models/orderModel")
const uniqid = require("uniqid")
const  asyncHandler = require("express-async-handler");
const validateMongodbId = require("../utils/validateMongodbId");
const { generateRefreshToken } = require("../config/refreshToken");
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt");
const crypto = require("crypto")
const sendEmail = require("./emailCrtl");
// create user
const createUser = asyncHandler(
    async (req, res) => {
        const email = req.body.email;
        const findUser = await User.findOne({email: email})
        if(!findUser) {
            const newUser = await User.create(req.body)
            res.json(newUser)
        } else {
            throw new Error("User Already Exists")
        }
    }
);

// login user
const loginUserCtrl = asyncHandler(async (req, res) => {
    const { email, password} = req.body;
    // check if user exist
    const findUser = await User.findOne({ email});
    if(findUser && (await findUser.isPasswordMatched(password))) {
        const refreshToken = await generateRefreshToken(findUser?._id)
        const updateUser = await User.findByIdAndUpdate(
            findUser.id, 
            {
              refreshToken: refreshToken
            }, {
                new: true
            }
        )
        res.cookie("refreshToken", refreshToken, {
            httpOnly:true,
            maxAge: 72*60*60*1000
        })
        res.json({
            _id: findUser?._id,
            firstname: findUser?.firstname,
            lastname:findUser?.lastname,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: generateToken(findUser?._id)
        });
    } else {
        throw new Error("Invalid Credential")
    }
})

// Admin login
const AdminLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    console.log(email, password)
    // check if user exist
    const findAdmin = await User.findOne({ email});
    if(findAdmin.role !== "admin") throw new Error("Not Authorised")
    if(findAdmin && (await findAdmin.isPasswordMatched(password))) {
        const refreshToken = await generateRefreshToken(findAdmin?._id)
        const updateUser = await User.findByIdAndUpdate(
            findAdmin.id, 
            {
              refreshToken: refreshToken
            }, {
                new: true
            }
        )
        res.cookie("refreshToken", refreshToken, {
            httpOnly:true,
            maxAge: 72*60*60*1000
        })
        res.json({
            _id: findAdmin?._id,
            firstname: findAdmin?.firstname,
            lastname:findAdmin?.lastname,
            email: findAdmin?.email,
            mobile: findAdmin?.mobile,
            token: generateToken(findAdmin?._id)
        });
    } else {
        throw new Error("Invalid Credential")
    }
})

// handle refresh token
const handleRefreshToken = asyncHandler(async (req, res) => {
   const cookie = req.cookies;;
   if(!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies")
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({refreshToken})
    if(!user) throw new Error("No Refresh token present in db or not matched")
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
     if(err || user.id !== decoded.id) {
        throw new Error("There is something wrong with refresh token")
     }
     const accessToken = generateToken(user?._id);
     res.json({ accessToken })
    })
})

// logout user 

const logout = asyncHandler(async (req, res) => {
   const cookie = req.cookies;
   if(!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies")
   const refreshToken = cookie.refreshToken;
   const user = await User.findOne({ refreshToken })
   if(!user) {
     res.clearCookie("refreshToken", {
        httpOnly: true,
        secure:true
     })
     return res.sendStatus(204) //forbidden
   }
   await User.findOneAndUpdate({
     refreshToken: "",
   });
   res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true
   })
   return res.sendStatus(204) //forbidden
});

//  save user address
const saveUserAdress = asyncHandler(async (req, res)=> {
    const { _id } = req.user
    validateMongodbId(_id)
    try{
       const saveUserAdress = await User.findByIdAndUpdate(_id, {
           address: req?.body?.address,
       },
       {
           new: true
       }  
       );
       res.json(saveUserAdress)
    } catch(error) {
       throw new Error(error)
    }
})

// get all users
const getallUser = asyncHandler(async (req, res) => {
    try{
        const getUsers = await User.find()
        res.json(getUsers)
    } catch (error) {
        throw new Error(error)
    }
})

//  get a single user
const getaUser = asyncHandler(async (req, res) => {
    const {id} = req.params;
    validateMongodbId(id)
     try{
        const getaUser = await User.findById(id)
        res.json({
            getaUser,
        })
     } catch (error) {
        throw new Error(error)
     }
})

//  delete a user
const deleteaUser = asyncHandler(async (req, res) => {
    const {id} = req.params;
    validateMongodbId(id)
     try{
        const deleteaUser = await User.findByIdAndDelete( id )
        res.json({
            deleteaUser,
        })
     } catch (error) {
        throw new Error(error)
     }
})

//  update a user
const updateaUser = asyncHandler(async (req, res)=> {
     const { _id } = req.user
     validateMongodbId(_id)
     try{
        const updatedUser = await User.findByIdAndUpdate(_id, {
            firstname: req?.body?.firstname,
            lastname: req?.body?.lastname,
            email:req?.body?.email,
            mobile:req?.body?.mobile
        },
        {
            new: true
        }  
        );
        res.json(updatedUser)
     } catch(error) {
        throw new Error(error)
     }
})

//  blockuser

const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params
  validateMongodbId(id)
  try {
     const blockuser = await User.findByIdAndUpdate(id, {
        isBlocked: true
     }, {
        new: true
     });
     res.json(blockuser)
  } catch (error) {
    throw new Error(error)
  }
}
)

const unblockUser = asyncHandler(async (req, res) => {
    const { id } = req.params
    validateMongodbId(id) 
  try {
     const unblockuser = await User.findByIdAndUpdate(id, {
        isBlocked: false
     }, {
        new: true
     });
     res.json(unblockuser)
  } catch (error) {
    throw new Error(error)
  }
})

// Change password
const updatePassword = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { password } = req.body;
    validateMongodbId(_id); 
    try {
        const user = await User.findById(_id);
        if (password) {
            user.password = password;
            // Save the updated user object
            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.json(user); // Respond with the user object if no password provided
        }
    } catch (error) {
        throw new Error(error);
    }
});

//  Forgot password

const forgotPasswordToken = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error("User not found with this email");
        }
        const token = await user.createPasswordResetToken();
        await user.save();
        const resetURL = `Hi, Please follow this link to reset Your Password. This link is valid for the next 10 minutes: <a href="http://localhost:5000/api/user/reset-password/${token}">Click here</a>`;
        const data = {
            to: email,
            text: "Hi User",
            subject: "Forgot Password Link",
            htm: resetURL,
        };
        sendEmail(data); 
        res.json({ message: "Password reset link sent successfully" });
    } catch (error) {
        next(error);
    }
});

// reset password

const resetPassword = asyncHandler(async (req, res) => {
    try {
        const { password } = req.body;
        const { token } = req.params;

        // Hash the token for comparison with stored hashed token
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find user with a valid token
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            throw new Error('Token Expired, Please try again later');
        }

        // Update user's password and reset token fields
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.json(user);
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ error: 'An error occurred while resetting the password' });
    }
});

// wishlist

const getWishlist = asyncHandler (async (req, res) => {
    const { _id } = req.user
    console.log(_id)
    try{
        const findUser = await User.findById(_id).populate('wishlist')
        res.json(findUser)
    } catch (error) {
        throw new Error(error)
    }

})


//  userCart

const userCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { cart } = req.body;
    validateMongodbId(_id);

    try {
        const user = await User.findById(_id);

        // Check if user already has a cart
        const existingCart = await Cart.findOne({ orderby: user._id });

        if (existingCart) {
            await existingCart.deleteOne(); // Remove the existing cart
        }

        let products = [];

        for (let i = 0; i < cart.length; i++) {
            const cartItem = {
                product: cart[i]._id,
                count: cart[i].count,
                color: cart[i].color,
            };

            const getPrice = await Product.findById(cart[i]._id).select("price").exec();
            cartItem.price = getPrice.price;
            products.push(cartItem);
        }

        let cartTotal = products.reduce((total, product) => {
            return total + product.price * product.count;
        }, 0);

        // Create a new cart with the provided cart items and total
        const newCart = await new Cart({
            products,
            cartTotal,
            orderby: user._id,
        }).save();

        res.json(newCart);
    } catch (error) {
        throw new Error(error);
    }
});




//  get user cart

const getUserCart = asyncHandler (async (req, res) => {
    const { _id } = req.user
    validateMongodbId(_id)
    try{
      const cart = await Cart.findOne({ orderby: _id}).populate("products.product")
      res.json(cart)
    } catch (error) {
        throw new Error(error)
    }
})


// empty cart

const emptyCart = asyncHandler (async (req, res) => {
    const { _id } = req.user
    validateMongodbId(_id)
    try{
      const user = await User.findOne({_id})
      const cart = await Cart.findOneAndRemove({ orderby: user._id})
      res.json(cart)
    } catch (error) {
        throw new Error(error)
    }
})

//  apply coupon
const applyCoupon = asyncHandler (async (req, res) => {
    const { coupon } = req.body;
    const { _id } = req.user;
    try {
        // Fetch the user by _id
        const user = await User.findById(_id);
        if (!user) {
            throw new Error("User not found");
        }
        // Check if the coupon exists
        const validCoupon = await Coupon.findOne({ name: coupon });
        if (!validCoupon) {
            return res.status(400).json({ error: "Invalid Coupon" });
        }
        // Fetch cart and cartTotal
        const cart = await Cart.findOne({ orderby: user._id }).populate("products.product");
        if (!cart) {
            throw new Error("Cart not found");
        }
        // Calculate totalAfterDiscount
        const cartTotal = cart.products.reduce((total, item) => {
            const productPrice = item.product.price;
            return total + productPrice * item.count;
        }, 0);
        const totalAfterDiscount = (cartTotal - (cartTotal * validCoupon.discount) / 100).toFixed(2);
        // Update cart with new totalAfterDiscount
        await Cart.findByIdAndUpdate(cart._id, { totalAfterDiscount }, { new: true });
        res.json({ totalAfterDiscount });
    } catch (error) {
        res.status(500).json({ error: "An error occurred while applying the coupon" });
    }
});


//  create  order
const createOrder = asyncHandler (async (req, res, next) => {
    const { COD, couponApplied } = req.body;
    const { _id } = req.user;
    validateMongodbId(_id);

    try {
        if (!COD) {
            return res.status(400).json({ error: "Create cash order failed" });
        }

        const user = await User.findById(_id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const userCart = await Cart.findOne({ orderby: user._id });
        if (!userCart) {
            return res.status(404).json({ error: "User's cart not found" });
        }

        let finalAmount = 0;
        if (couponApplied && userCart.totalAfterDiscount) {
            finalAmount = userCart.totalAfterDiscount;
        } else {
            finalAmount = userCart.cartTotal;
        }

        const newOrder = await new Order({
            products: userCart.products,
            paymentIntent: {
                id: uniqid(),
                method: "COD",
                amount: finalAmount,
                status: "Cash on Delivery",
                created: Date.now(),
                currency: "usd",
            },
            orderby: user._id,
            orderStatus: "Cash on Delivery",
        }).save();

        const update = userCart.products.map((item) => ({
            updateOne: {
                filter: { _id: item.product._id },
                update: { $inc: { quantity: -item.count, sold: +item.count } },
            },
        }));
        const updated = await Product.bulkWrite(update, {});

        res.json({ message: "Order created successfully" });
    } catch (error) {
        next(error); // Pass the error to the error-handling middleware
    }
});


//  get orders

const getOrder = asyncHandler (async (req, res, next) => {
  try {
    const { _id } = req.user;

    // Ensure the user's ID is a valid MongoDB ID
    validateMongodbId(_id);

    // Find orders associated with the user's ID in the Order collection
    const orders = await Order.find({ orderby: _id }).populate("products.product").exec();

    // If no orders are found, send a custom message
    if (orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this user.' });
    }

    // Send the retrieved orders as a JSON response
    res.json(orders);
  } catch (error) {
    // Handle errors using the next function to pass them to the error handling middleware
    next(error);
  }
});


// order status

const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status} = req.body; 
    const { id  } = req.params
    validateMongodbId(id); // Validate the provided order ID format
    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            {
                orderStatus: status,
                'paymentIntent.status': status, // Update the nested field
            },
            { new: true }
        );
        if (!updatedOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(updatedOrder);
    } catch (error) {
        throw new Error(error);
    }
});





module.exports = { createUser,getOrder, updateOrderStatus, updatePassword,createOrder, applyCoupon, emptyCart, userCart, getUserCart, saveUserAdress, getWishlist, resetPassword, forgotPasswordToken, loginUserCtrl, logout, getallUser, getaUser, deleteaUser, updateaUser, blockUser, unblockUser, handleRefreshToken, AdminLogin}