// ./routes/category.js
const express = require("express");
const router = express.Router();
// add controller
const {
  create,
  categoryById,
  read,
  remove,
  update,
  list,
} = require("../controllers/category");
const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");

const { userById } = require("../controllers/user");

router.get("/category/:categoryId", read);
router.post("/category/create/:userId", requireSignin, isAuth, isAdmin, create);
router.delete(
  "/category/:categoryId/:userId",
  requireSignin,
  isAuth,
  isAdmin,
  remove
);
router.put(
  "/category/:categoryId/:userId",
  requireSignin,
  isAuth,
  isAdmin,
  update
);
router.get("/categories", list);

// category/create
// userId 參數驗證
router.param("userId", userById);
router.param("categoryId", categoryById);

module.exports = router;
