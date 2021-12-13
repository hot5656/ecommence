// ./app.js
const express = require("express");
// connect mangoDB altas
// using 2.2.12 or later's uri
const mongoose = require("mongoose");
// import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
// add Category and Product
const categoryRoutes = require("./routes/category");
const productRoutes = require("./routes/product");
const braintreeRoutes = require("./routes/braintree");
const orderRoutes = require("./routes/order");
// import morgan
const morgan = require("morgan");
// cookie-parser
const cookieParser = require("cookie-parser");
// express-validator
const expressValidator = require("express-validator");
// cors
const cors = require("cors");
// env
require("dotenv").config();

// app
const app = express();

// connect mangoDB altas
// using 2.2.12 or later's uri
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB Connected…");
  })
  .catch((err) => {
    console.log(err);
    return { error: "Server not response" };
  });

// middlewares
app.use(morgan("dev")); // morgan - http request log
app.use(express.json()); // body parser
app.use(cookieParser()); // cookie-parser
app.use(expressValidator()); // express-validator
app.use(cors()); // cors

// routes middleware
app.use("/api", authRoutes);
app.use("/api", userRoutes);
// add Category and Product
app.use("/api", categoryRoutes);
app.use("/api", productRoutes);
app.use("/api", braintreeRoutes);
app.use("/api", orderRoutes);

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
