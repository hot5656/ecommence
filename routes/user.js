// ./routes/user.js
const express = require("express");
const router = express.Router();
// add controller
const {
  userById,
  read,
  update,
  purchaseHistory,
} = require("../controllers/user");
// add controller
const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");

router.get("/secret/:userId", requireSignin, isAuth, (req, res) => {
  res.json({
    user: req.profile,
  });
});

router.get("/user/:userId", requireSignin, isAuth, read);
router.put("/user/:userId", requireSignin, isAuth, update);
router.get("/orders/by/user/:userId", requireSignin, isAuth, purchaseHistory);

// userId 參數驗證
router.param("userId", userById);

module.exports = router;
