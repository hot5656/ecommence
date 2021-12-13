// ./controller/category.js
const Category = require("../models/category");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.categoryById = (req, res, next, id) => {
  Category.findById(id).exec((err, category) => {
    if (err || !category) {
      return res.status(400).json({
        error: "Category does not exist",
      });
    }
    req.category = category;
    next();
  });
};

exports.read = (req, res) => {
  return res.json(req.category);
};

exports.create = (req, res) => {
  const category = new Category(req.body);

  category.save((err, data) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    // console.log("category:", data);
    // fix 含 data 欄位
    res.json(data);
  });
};

exports.remove = (req, res) => {
  let category = req.category;
  category.remove((err, deletedCategory) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    res.json({
      message: "Category deleted successly",
    });
  });
};

exports.update = (req, res) => {
  const category = req.category;

  category.name = req.body.name;

  category.save((err, data) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    // fix 含 data 欄位
    res.json(data);
  });
};

exports.list = (req, res) => {
  Category.find().exec((err, data) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    // console.log("category-list:", data);
    // fix 含 data 欄位
    res.json(data);
  });
};
