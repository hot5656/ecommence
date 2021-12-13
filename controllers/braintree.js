// ./controllers/braintree.js
const User = require("../models/user");
const braintree = require("braintree");
require("dotenv").config();

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

exports.generateToken = (req, res) => {
  // transaction 設定 merchantAccountId 就好,clientToken 可以不用設
  // 但若要顯示 payment 的方式,就要設定
  // gateway.clientToken.generate({}, function (err, response) {
  gateway.clientToken.generate(
    { merchantAccountId: process.env.BRAINTREE_MERCHANT_ACCOUNT_ID },
    function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        // console.log(response);
        res.send(response);
      }
    }
  );
};

exports.processPayment = (req, res) => {
  let nonceFromTheClient = req.body.paymentMethodNonce;
  let amountFromTheClient = req.body.amount;
  // charge
  let newTransaction = gateway.transaction.sale(
    {
      amount: amountFromTheClient,
      paymentMethodNonce: nonceFromTheClient,
      // 可設定不同的 merchantAccountId( for 不同的貨幣)
      merchantAccountId: process.env.BRAINTREE_MERCHANT_ACCOUNT_ID,
      options: {
        submitForSettlement: true,
      },
    },
    (error, result) => {
      if (error) {
        res.status(500).json(error);
      } else {
        res.json(result);
      }
    }
  );
};
