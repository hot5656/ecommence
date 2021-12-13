// ./controller/product.js
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");
const Product = require("../models/product");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.productById = (req, res, next, id) => {
  Product.findById(id)
    .populate("category")
    .exec((err, product) => {
      if (err || !product) {
        return res.status(400).json({
          error: "Product does not exist",
        });
      }
      req.product = product;
      next();
    });
};

exports.read = (req, res) => {
  req.product.photo = undefined;
  return res.json(req.product);
};

exports.create = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Image could not be uploaded",
      });
    }

    // check for all fieldd
    const { name, description, price, category, quantity, shipping } = fields;
    if (
      !name ||
      !description ||
      !price ||
      !category ||
      !quantity ||
      !shipping
    ) {
      return res.status(400).json({
        error: "All field are required",
      });
    }

    let product = new Product(fields);
    if (files.photo) {
      if (files.photo.size > 200000) {
        return res.status(400).json({
          error: "Image should be less 200k in size",
        });
      }

      // change files.photo.file to files.photo.filepath
      product.photo.data = fs.readFileSync(files.photo.filepath);
      product.photo.contentType = files.photo.mimetype;
    }

    product.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }

      result.photo = undefined;
      // console.log("product:", result);
      res.json(result);
    });
  });
};

exports.remove = (req, res) => {
  let product = req.product;
  product.remove((err, deletedProduct) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    res.json({
      message: "Product deleted successly",
    });
  });
};

exports.update = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Image could not be uploaded",
      });
    }

    let product = req.product;
    // fields 蓋過 product
    product = _.extend(product, fields);

    if (files.photo) {
      if (files.photo.size > 200000) {
        return res.status(400).json({
          error: "Image should be less 200k in size",
        });
      }

      // change files.photo.file to files.photo.filepath
      product.photo.data = fs.readFileSync(files.photo.filepath);
      product.photo.contentType = files.photo.mimetype;
    }

    product.save((err, result) => {
      result.photo = undefined;
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }

      result.photo = undefined;
      res.json(result);
    });
  });
};

/**
 * sel/arrival
 * bye sell = /products?sortBy=sold&order=desc&limit=4
 * bye arrival = /products?sortBy=createdAt&order=desc&limit=4
 * if no parameter are sent, then all products are returned
 */
exports.list = (req, res) => {
  let order = req.query.order ? req.query.order : "asc";
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
  let limit = req.query.limit ? parseInt(req.query.limit) : 6;

  if (isNaN(limit)) limit = "";

  Product.find()
    .select("-photo")
    .populate("category") // mapt to Category
    .sort([[sortBy, order]])
    .limit(limit)
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({
          error: "Products not found",
        });
      }
      res.json(products);
    });
};

/**
 * it will find the products based on the req product category
 * other products that has the same category, will be return
 */

exports.listRelated = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 6;

  // $ne: not include
  Product.find({ _id: { $ne: req.product }, category: req.product.category })
    .select("-photo")
    .limit(limit)
    .populate("category", "_id name")
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({
          error: "Products not found",
        });
      }
      res.json(products);
    });
};

exports.listCategories = (req, res) => {
  // distinct : 取出不同的 category
  // {} : 2nd parameter doesn't need do no send value
  Product.distinct("category", {}, (err, categories) => {
    if (err) {
      return res.status(400).json({
        error: "Categories not found",
      });
    }
    res.json(categories);
  });
};

/**
 * list products by search
 * we will implement product search in react frontend
 * we will show categories in checkbox and price range in radio buttons
 * as the user clicks on those checkbox and radio buttons
 * we will make api request and show the products to users based on what he wants
 */
// {
//  "skip" : "1",
//  "limit" : "2",
// 	"filters": {
// 		"name": "Note"
// 	}
// }
//
// >=2 and <=19
//  {
// "filters": {
//   "price": ["2", "19"]
// }
exports.listBySearch = (req, res) => {
  let order = req.body.order ? req.body.order : "desc";
  let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
  let limit = req.body.limit ? parseInt(req.body.limit) : 100;
  let skip = req.body.skip ? parseInt(req.body.skip) : 0;
  let findArgs = {};

  // console.log(order, sortBy, limit, skip, req.body.filters);
  // console.log(req.body);
  for (let key in req.body.filters) {
    if (req.body.filters[key].length > 0) {
      if (key === "price") {
        // gte - great than price
        // lte - less than
        findArgs[key] = {
          $gte: req.body.filters[key][0],
          $lte: req.body.filters[key][1],
        };
      } else {
        // findArgs[key] = new RegExp(req.body.filters[key]);
        findArgs[key] = req.body.filters[key];
      }
    }
  }
  // console.log("findArgs", findArgs);

  Product.find(findArgs)
    .select("-photo")
    .populate("category")
    .sort([[sortBy, order]])
    .skip(skip)
    .limit(limit)
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: "products not found",
        });
      }
      res.json({
        size: data.length,
        data,
      });
    });
};

exports.photo = (req, res, next) => {
  if (req.product.photo.data) {
    res.set("Content-Type", req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }
  next();
};

exports.listSearch = (req, res) => {
  // create query object to hole search value and category value
  const query = {};
  // assign search value to query name
  if (req.query.search) {
    // mongodb regular expression
    query.name = { $regex: req.query.search, $options: "i" };
    console.log(query.name);
    // assign category value to query.category
    if (req.query.category && req.query.category != "All") {
      query.category = req.query.category;
    }
    // find the product base on query object with 2 properties
    // search and category
    Product.find(query, (err, products) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      res.json(products);
    }).select("-photo");
  }
};

exports.descreaseQuantity = (req, res, next) => {
  let bulkOps = req.body.order.products.map((item) => {
    return {
      updateOne: {
        filter: { _id: item._id },
        update: { $inc: { quantity: -item.count, sold: +item.count } },
      },
    };
  });

  Product.bulkWrite(bulkOps, {}, (error, products) => {
    if (error) {
      return res.status(400).json({
        error: "Could not update product",
      });
    }
    next();
  });
};
