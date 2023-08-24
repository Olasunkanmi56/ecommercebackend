const express = require("express");
const dbConnect = require("./config/dbConnect");
const bodyParser = require("body-parser");
const app = express();
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 4000;
const authRouter = require("./routes/authRoute");
const productRouter = require("./routes/productRoute");
const blogRouter = require("./routes/blogroute")
const categoryRouter = require("./routes/prodCategoryRoute")
const blogCategoryRouter = require("./routes/blogCategoryRoute")
const brandRouter = require("./routes/brandRoute")
const couponRouter = require("./routes/couponRoute")
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const cookieParser = require("cookie-parser")
const morgan = require("morgan")
dbConnect();

app.use(morgan("dev"))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(cookieParser())
app.use("/api/user", authRouter)
app.use("/api/product", productRouter)
app.use("/api/blog", blogRouter)
app.use("/api/category", categoryRouter)
app.use("/api/blogcategory", blogCategoryRouter)
app.use("/api/brand", brandRouter)
app.use("/api/coupon", couponRouter)



app.use(notFound)
app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`seerver is running at Port ${PORT}`)
})