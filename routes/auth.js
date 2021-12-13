// ./routes/auth.js
const express = require("express");
const router = express.Router();
// add controller
const {
  signup,
  signin,
  signout,
  requireSignin,
} = require("../controllers/auth");
// valid
const { userSignupValidator } = require("../validator");

// 註冊加驗證測試
router.post("/signup", userSignupValidator, signup);
router.post("/signin", signin);
router.get("/signout", signout);

module.exports = router;

// http://localhost:8000/api/signup
// post
// {
// 	"name": "key2",
// 	"email": "key2@gmail.com",
// 	"password": "rrrrrr5"
// }
// resp
// {
// 	"user": {
// 			"name": "key2",
// 			"email": "key2@gmail.com",
// 			"hashed_password": "f36f604f6b3f085dea51bc1686d8ff18d915d038",
// 			"salt": "1740b470-405f-11ec-af6d-67dd2756041e",
// 			"role": 0,
// 			"history": {
// 					"tyep": [],
// 					"default": []
// 			},
// 			"_id": "6188c6e92a5c350c58aa6d98",
// 			"createdAt": "2021-11-08T06:42:49.790Z",
// 			"updatedAt": "2021-11-08T06:42:49.790Z",
// 			"__v": 0
// 	}
// }
// 2nd times
// {
// 	"err": "11000 duplicate key error collection: ecmm.users index: email already exists"
// }

// http://localhost:8000/api/signin
// post
// {
// 	"email": "key2@gmail.com",
// 	"password": "rrrrrr5"
// }
// {
// 	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYxODc5NTU2YWIyYWVlNzIyYjI2YzI0NSIsImlhdCI6MTYzNjI5Nzg2OX0.jXzr0AMfA7Rwc-tMcljQUc2FKbxcPMAxzqddCaDoqFk",
// 	"user": {
// 			"_id": "61879556ab2aee722b26c245",
// 			"email": "key2@gmail.com",
// 			"name": "key2",
// 			"role": 0
// 	}
// }

// signout
// get
// {
// 	"message": "Signout success"
// }
