// ./controller/auth.js
const User = require("../models/user");
const { errorHandler } = require("../helpers/dbErrorHandler");
// jwt
const jwt = require("jsonwebtoken"); // to generate signed token
const expressJWT = require("express-jwt"); // for authorization check
require("dotenv").config();

exports.signup = (req, res) => {
  const user = new User(req.body);
  user.save((err, user) => {
    if (err) {
      // console.log(`\n\r=${err}=`);
      // 不知為何, 原來的內容如此(object),轉成 json 會如下
      // MongoServerError: E11000 duplicate key error collection: myFirstDatabase.users index: email_1 dup key: { email: "tony@gmail.com" }

      return res.status(400).json({
        error: errorHandler(err),
      });
      //   {
      //     "err": "11000 duplicate key error collection: myFirstDatabase.users index: email already exists"
      // }

      // return res.status(400).json({
      //   err,
      // });
      //   {
      //     "err": {
      //         "index": 0,
      //         "code": 11000,
      //         "keyPattern": {
      //             "email": 1
      //         },
      //         "keyValue": {
      //             "email": "tony@gmail.com"
      //         }
      //     }
      // }
    }

    res.json({
      user,
    });
    // {
    //   "user": {
    //       "name": "Key",
    //       "email": "key@gmail.com",
    //       "hashed_password": "33eb13a7cccc9f1ff03cb27b5fb3cd000ec43182",
    //       "salt": "44a9f290-3f98-11ec-85b0-415c7f4f64c5",
    //       "role": 0,
    //       "history": {
    //           "tyep": [],
    //           "default": []
    //       },
    //       "_id": "61877958c6041456c64f3f72",
    //       "createdAt": "2021-11-07T06:59:36.123Z",
    //       "updatedAt": "2021-11-07T06:59:36.123Z",
    //       "__v": 0
    //   }
    // }
  });
};

exports.signin = (req, res) => {
  // find the user based on email
  const { email, password } = req.body;
  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User with that email does not exist. Please siginup",
      });
    }

    // if user is found make sure the email and password match
    // create authenticate method in user model
    if (!user.authenticate(password)) {
      return res.status(401).json({
        error: "Email and password don't match",
      });
    }

    // generate a signed token with user id and secret
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    // persist the thken as 't' in cookie with expiry date
    res.cookie("t", token, { expire: new Date() + 9999 });
    // return response with user and token to frontend client
    const { _id, name, email, role } = user;
    return res.json({ token, user: { _id, email, name, role } });
  });
};

exports.signout = (req, res) => {
  res.clearCookie("t");
  res.json({ message: "Signout success" });
};

// need have cookie-parser
// for authorization check
exports.requireSignin = expressJWT({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"], // added later
  userProperty: "auth",
});

exports.isAuth = (req, res, next) => {
  // auth._id 為由 Authorization 計算出使屬於哪個 id
  let user = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!user) {
    return res.status(403).json({ error: "Access denied" });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.profile.role == 0) {
    return res.status(403).json({ error: "Admin resource! Access denied" });
  }
  next();
};
