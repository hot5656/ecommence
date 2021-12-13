// ./validator/index.js
exports.userSignupValidator = (req, res, next) => {
  req.check("name", "Name is required").notEmpty();
  req
    .check("email", "Email must be between 6 to 32 characters")
    .matches(/.+\@.+\..+/)
    .withMessage("Email must contain @ and .")
    .isLength({
      min: 6,
      max: 32,
    });
  req.check("password", "Password is required").notEmpty();
  req
    .check("password")
    .isLength({ min: 6 })
    .withMessage("password must conatin at least 6 characters")
    .matches(/\d/)
    .withMessage("Password must contain a number");
  const errors = req.validationErrors();
  if (errors) {
    const firstError = errors.map((error) => error.msg)[0];
    return res.status(400).json({ error: firstError });
  }
  next();
};
