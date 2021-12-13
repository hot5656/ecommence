// ./helpers/dbErrorHandler.js
"use strict";

/**
 * Get unique error field name
 */
const uniqueMessage = (error) => {
  let output;

  try {
    let fieldName = error.message.substring(
      error.message.lastIndexOf(".$") + 2,
      error.message.lastIndexOf("_1")
    );
    output =
      fieldName.charAt(0).toUpperCase() +
      fieldName.slice(1) +
      " already exists";
  } catch (ex) {
    output = "Unique field already exists";
  }

  return output;
};

/**
 * Get the erroror message from error object
 */
exports.errorHandler = (error) => {
  let message = "";

  // 不知為何, 原來的內容如此(object),可提出 .message and .code
  // MongoServerError: E11000 duplicate key error collection: myFirstDatabase.users index: email_1 dup key: { email: "tony@gmail.com" }
  // console.log(`\n\rerror.message->${error.message}=`);
  // console.log(`\n\rerror.code->${error.code}=`);

  if (error.code) {
    switch (error.code) {
      case 11000:
      case 11001:
        message = uniqueMessage(error);
        break;
      default:
        message = "Something went wrong";
    }
  } else {
    for (let errorName in error.errorors) {
      if (error.errorors[errorName].message)
        message = error.errorors[errorName].message;
    }
  }

  return message;
};
