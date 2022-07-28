const productModel = require("../model/productModel");
const aws = require("aws-sdk");
const mongoose = require("mongoose");

const {
  regexName,
  regexEmail,
  regexPassword,
  regexNumber,
  regexPinCode,
  titleRegex,
  priceRegex,
} = require("../validations/validations");
aws.config.update({
  accessKeyId: "AKIAY3L35MCRVFM24Q7U",
  secretAccessKey: "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",
  region: "ap-south-1",
});

const uploadFile = async function (file) {
  return new Promise(function (resolve, reject) {
    // this function will upload file to aws and return the link
    const s3 = new aws.S3({ apiVersion: "2006-03-01" }); // we will be using the s3 service of aws

    const uploadParams = {
      ACL: "public-read",
      Bucket: "classroom-training-bucket", //HERE
      Key: `productManagement5grp38/${file.originalname}`, //HERE
      Body: file.buffer,
    };

    s3.upload(uploadParams, function (err, data) {
      if (err) {
        return reject({ error: err });
      }
      return resolve(data.Location);
    });

    // let data= await s3.upload( uploadParams)
    // if( data) return data.Location
    // else return "there is an error"
  });
};

const isValid = (value) => {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  if (value.length == 0) return false;
  return true;
};
exports.createProduct = async function (req, res) {
  try {
    let {
      title,
      description,
      price,
      currencyId,
      currencyFormat,
      isFreeShipping,
      productImage,
      style,
      availableSizes,
      installments,
    } = req.body;
    // installments = installments - 0;
    price = price * 1;
    console.log(price, "price");
    console.log(typeof price, "price");
    console.log(
      title,
      description,
      price,
      currencyId,
      currencyFormat,
      isFreeShipping,
      productImage,
      style,
      availableSizes,
      installments
    );
    if (!Object.keys(req.body).length)
      return res
        .status(400)
        .send({ status: false, message: "Body cannot be empty" });
    if (!isValid(title))
      return res
        .status(400)
        .send({ status: false, msg: "title cannot be empty" });
    if (!titleRegex.test(title))
      return res
        .status(400)
        .send({ status: false, msg: "title must be valid character" });
    const alreadytitle = await productModel.findOne({ title });
    if (alreadytitle)
      return res
        .status(400)
        .send({ status: false, msg: "Thhiss title is already being used" });
    if (!isValid(description))
      return res
        .status(400)
        .send({ status: false, msg: "description cannot be empty" });
    if (!isValid(price))
      return res
        .status(400)
        .send({ status: false, msg: "price cannot be empty" });
    console.log(price, "price 2");
    if (!priceRegex.test(price))
      return res
        .status(400)
        .send({ status: false, msg: "price must be a number" });
    console.log(price.toFixed(2), "float");
    if (!isValid(currencyId))
      return res
        .status(400)
        .send({ status: false, msg: "currencyId cannot be empty" });
    if (currencyId !== "INR")
      return res
        .status(400)
        .send({ status: false, msg: "currencyId must be INR" });
    if (!isValid(currencyFormat))
      return res
        .status(400)
        .send({ status: false, msg: "currencyFormat cannot be empty" });
    if (currencyFormat !== "₹")
      return res
        .status(400)
        .send({ status: false, msg: "currencyFormat must be ₹" });
    console.log(typeof isFreeShipping);
    if (isFreeShipping) {
      if (!isValid(isFreeShipping))
        return res
          .status(400)
          .send({ status: false, msg: "isFreeShipping cannot be empty" });
      if (!(isFreeShipping == "true" || isFreeShipping == "false"))
        return res
          .status(400)
          .send({ status: false, msg: "isFreeShipping must be true or false" });
    }
    let { files } = req;
    if (!files?.length) {
      return res
        .status(400)
        .send({ status: false, msg: "productImage  is missing" });
    }
    if (files[0].fieldname != "productImage")
      // upload only png and jpg format
      return res
        .status(400)
        .send({ status: false, msg: "Only images allowed as profileImage" });
    if (!files[0].originalname.match(/\.(png|jpg)$/))
      // upload only png and jpg format
      return res
        .status(400)
        .send({ status: false, msg: "Only images allowed" });

    //upload to s3 and get the uploaded link
    // res.send the link back to frontend/postman
    const uploadedFileURL = await uploadFile(files[0]);
    if (style) {
      if (!isValid(style))
        return res
          .status(400)
          .send({ status: false, msg: "style cannot be empty" });
      if (!titleRegex.test(style))
        return res
          .status(400)
          .send({ status: false, msg: "style must be a valid character" });
    }
    if (availableSizes) {
      const allowedSize = ["S", "XS", "M", "X", "L", "XXL", "XL"];
      const allSize = { S: 1, XS: 1, M: 1, X: 1, L: 2, XXL: 1, XL: 1 };

      availableSizes = availableSizes.split(",");
      if (!isValid(availableSizes))
        return res
          .status(400)
          .send({ status: false, msg: "availableSizes cannot be empty" });

      let sizes = ["S", "XS", "M", "X", "L", "XXL", "XL"];
      let newArr = [];
      for (let j = 0; j < availableSizes.length; j++) {
        newArr.push(availableSizes[j].trim());
      }
      for (let i = 0; i < newArr.length; i++) {
        if (sizes.includes(newArr[i]) == false) {
          return res
            .status(400)
            .send({ status: false, message: "Please put valid size" });
        }
      }
      availableSizes = newArr;
    }
    if (installments) {
      if (!isValid(installments))
        return res
          .status(400)
          .send({ status: false, msg: "installments cannot be empty" });
      if (!priceRegex.test(installments))
        return res
          .status(400)
          .send({ status: false, msg: "installments must be number" });
    }
    const productCreated = await productModel.create({
      title,
      description,
      price,
      currencyId,
      currencyFormat,
      isFreeShipping,
      productImage: uploadedFileURL,
      style,
      availableSizes,
      installments,
    });
    res
      .status(201)
      .send({ status: true, message: "Product Created", data: productCreated });
  } catch (error) {
    res.status(500).send({
      status: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

//get product
exports.getProduct = async (req, res) => {
  try {
    let filterQuery = req.query;
    let { size, name, priceGreaterThen, priceLessThen, priceSort } =
      filterQuery;

    if (size || name || priceGreaterThen || priceLessThen || priceSort) {
      let query = { isDeleted: false };

      if (size) {
        query["availableSizes"] = size;
      }

      if (name) {
        query["title"] = { $regex: name };
      }

      if (priceGreaterThen) {
        query["price"] = { $gt: priceGreaterThen };
      }

      if (priceLessThen) {
        query["price"] = { $lt: priceLessThen };
      }

      if (priceGreaterThen && priceLessThen) {
        query["price"] = { $gt: priceGreaterThen, $lt: priceLessThen };
      }

      if (priceSort) {
        if (!(priceSort == -1 || priceSort == 1)) {
          return res.status(400).send({
            status: false,
            message:
              "You can only use 1 for Ascending and -1 for Descending Sorting",
          });
        }
      }

      let getAllProduct = await productModel
        .find(query)
        .sort({ price: priceSort });

      if (!(getAllProduct.length > 0)) {
        return res
          .status(404)
          .send({ status: false, message: "Products Not Found" });
      }
      return res.status(200).send({
        status: true,
        count: getAllProduct.length,
        message: "Success",
        data: getAllProduct,
      });
    } else {
      return res
        .status(400)
        .send({ status: false, message: "Invalid Request Query Params" });
    }
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};
//get by id
const getProductById = async function (req, res) {
  try {
    let productId = req.params.productId;
    if (!validator.isValid(productId.trim())) {
      return res
        .status(400)
        .send({ status: false, msg: "productId is required" });
    }
    if (!validator.isValidObjectId(productId)) {
      return res
        .status(400)
        .send({ status: false, msg: "productId is Invalid" });
    }
    let productList = await productModel.findOne({ _id: productId });
    if (!productList) {
      return res
        .status(404)
        .send({ status: false, msg: "productId is not found" });
    }
    return res.status(200).send({
      status: true,
      msg: "succesfully get product profile detail",
      data: productList,
    });
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};
//newUpdate
exports.newUpdate = async function (req, res) {
  let {productId} = req.params;
  let {
    title,
    description,
    price,
    currencyId,
    currencyFormat,
    isFreeShipping,
    productImage,
    style,
    availableSizes,
    installments,
  } = req.body;
  if(title||title.length==0){
    if(!isValid(title)) return res.status(400).send({status:false,message:"titlle cannot be empty"})
    if(!titleRegex.test(title))return res.status(400).send({status:false,message:"titlle contains invalid chaarc"})
    const alreadytitle = await productModel.findOne({ title })
    if(alreadytitle) return res.status(400).send({status:false,message:"This tile is already being used"})
  }
  if(description ||description.length==0){
    if(!isValid(description)) return res.status(400).send({status:false,message:"description cannot be empty"})
  }
  if(price ||price.length==0){
    if(!isValid(price)) return res.status(400).send({status:false,message:"price cannot be empty"})
    if(!priceRegex.test(price)) return res.status(400).send({status:false,message:"price must be a number"})
  }
  if(currencyId ||currencyId.length==0){
    if(!isValid(currencyId))return res.status(400).send({status:false,message:"currencyId cannot be empty"})
    if(currencyId !="INR")return res.status(400).send({status:false,message:"currencyId must be INR"})
  }
  if(currencyFormat ||currencyFormat.length==0){
    if(!isValid(currencyFormat))return res.status(400).send({status:false,message:"currencyFormat cannot be empty"})
    if(currencyFormat !="₹")return res.status(400).send({status:false,message:"currencyFormat must be ₹"})
  }
  console.log(isFreeShipping)
  if(isFreeShipping ||isFreeShipping.length==0){
    if(!isValid(isFreeShipping)) return res.status(400).send({status:false,message:"isFreeShipping cannot be empty"})
    if(isFreeShipping !=="true" || isFreeShipping !=="false" || isFreeShipping !==true || isFreeShipping !==false) return res.status(400).send({status:false,message:"isFreeShipping must be boolean"})
  }
  if(style ||style.length==0 ){
    if(!isValid(style))return res.status(400).send({status:false,message:"style cannot be empty"})
  }
  if(availableSizes ||availableSizes.length==0 ){
    if(!isValid(availableSizes))return res.status(400).send({status:false,message:"availableSizes cannot be empty"})
    let sizes = ["S", "XS", "M", "X", "L", "XXL", "XL"];
      let newArr = [];
      for (let j = 0; j < availableSizes.length; j++) {
        newArr.push(availableSizes[j].trim());
      }
      for (let i = 0; i < newArr.length; i++) {
        if (sizes.includes(newArr[i]) == false) {
          return res
            .status(400)
            .send({ status: false, message: "Please put valid size" });
        }
      }
      availableSizes = newArr;
  }
  if(installments ||installments.length==0 ){
    if(!isValid(installments)) return res.status(400).send({status:false,message:"installments cannot be empty"})
  }

  let { files } = req;
  let uploadedFileURL
    if (files?.length) {
      if (files[0].fieldname != "productImage")
      // upload only png and jpg format
      return res
        .status(400)
        .send({ status: false, msg: "Only images allowed as profileImage" });
      if (!files[0].originalname.match(/\.(png|jpg)$/))
      // upload only png and jpg format
      return res
        .status(400)
        .send({ status: false, msg: "Only images allowed" });
        uploadedFileURL = await uploadFile(files[0]);
    }
    //upload to s3 and get the uploaded link
    // res.send the link back to frontend/postman
    const savedObj = {};
    if (title) savedObj.title = title;
    if (description) savedObj.description = description;
    if (price) savedObj.price = price;
    if (uploadedFileURL) savedObj.productImage = uploadedFileURL;
    if (isFreeShipping) savedObj.isFreeShipping = isFreeShipping;
    if (currencyId) savedObj.currencyId = currencyId;
    if (currencyFormat) savedObj.currencyFormat = currencyFormat;
    if (style) savedObj.style = style;
    if (availableSizes) savedObj.availableSizes = availableSizes;
    if (installments) savedObj.installments = installments;
    const updateProduct= await productModel.findOneAndUpdate({_id:productId,isDeleted:false},savedObj,{new:true})
    if(updateProduct==null) return res.status(404).send({status:false,message:"Not found"})
    res.status(200).send({status:true,message:"product is successfully updated",data:updateProduct})
};

exports.updateDetails = async function (req, res) {
  try {
    let updateData = req.params.productId;
    let {
      title,
      description,
      price,
      productImage,
      isFreeShipping,
      currencyId,
      currencyFormat,
      style,
      availableSizes,
      installments,
    } = req.body;
    console.log(typeof title, "ggg");
    if (!!title) {
      console.log(title, "title");
      if (!isValid(title) || title.length == 0)
        return res
          .status(400)
          .send({ status: false, msg: "title cannot be empty" });
      if (!titleRegex.test(title))
        return res
          .status(400)
          .send({ status: false, msg: "title must be valid character" });
      const alreadytitle = await productModel.findOne({ title });
      if (alreadytitle)
        return res
          .status(400)
          .send({ status: false, msg: "Thhiss title is already being used" });
    }
    let { files } = req;
    let uploadedFileURL;
    if (files?.length) {
      if (files[0].fieldname != "productImage")
        // upload only png and jpg format
        return res
          .status(400)
          .send({ status: false, msg: "Only images allowed as profileImage" });
      if (!files[0].originalname.match(/\.(png|jpg)$/))
        // upload only png and jpg format
        return res
          .status(400)
          .send({ status: false, msg: "Only images allowed" });

      //upload to s3 and get the uploaded link
      // res.send the link back to frontend/postman
      uploadedFileURL = await uploadFile(files[0]);
    }

    if (description) {
      if (!isValid(description))
        return res
          .status(400)
          .send({ status: false, msg: "description cannot be empty" });
    }

    if (price) {
      if (!isValid(price))
        return res
          .status(400)
          .send({ status: false, msg: "price cannot be empty" });
      if (!priceRegex.test(price))
        return res
          .status(400)
          .send({ status: false, msg: "price must be a number" });
    }
    if (currencyId) {
      if (!isValid(currencyId))
        return res
          .status(400)
          .send({ status: false, msg: "currencyId cannot be empty" });
      if (currencyId !== "INR")
        return res
          .status(400)
          .send({ status: false, msg: "currencyId must be INR" });
    }
    if (currencyFormat) {
      if (!isValid(currencyFormat))
        return res
          .status(400)
          .send({ status: false, msg: "currencyFormat cannot be empty" });
      if (currencyFormat !== "₹")
        return res
          .status(400)
          .send({ status: false, msg: "currencyFormat must be ₹" });
    }

    if (isFreeShipping) {
      if (!isValid(isFreeShipping))
        return res
          .status(400)
          .send({ status: false, msg: "isFreeShipping cannot be empty" });
      if (!(isFreeShipping == "true" || isFreeShipping == "false"))
        return res
          .status(400)
          .send({ status: false, msg: "isFreeShipping must be true or false" });
    }
    if (style) {
      if (!isValid(style))
        return res
          .status(400)
          .send({ status: false, msg: "style cannot be empty" });
      if (!titleRegex.test(style))
        return res
          .status(400)
          .send({ status: false, msg: "style must be a valid character" });
    }
    if (availableSizes) {
      const allowedSize = ["S", "XS", "M", "X", "L", "XXL", "XL"];
      const allSize = { S: 1, XS: 1, M: 1, X: 1, L: 2, XXL: 1, XL: 1 };

      availableSizes = availableSizes.split(",");
      if (!isValid(availableSizes))
        return res
          .status(400)
          .send({ status: false, msg: "availableSizes cannot be empty" });

      let sizes = ["S", "XS", "M", "X", "L", "XXL", "XL"];
      let newArr = [];
      for (let j = 0; j < availableSizes.length; j++) {
        newArr.push(availableSizes[j].trim());
      }
      for (let i = 0; i < newArr.length; i++) {
        if (sizes.includes(newArr[i]) == false) {
          return res
            .status(400)
            .send({ status: false, message: "Please put valid size" });
        }
      }
      availableSizes = newArr;
    }
    if (installments) {
      if (!isValid(installments))
        return res
          .status(400)
          .send({ status: false, msg: "installments cannot be empty" });
      if (!priceRegex.test(installments))
        return res
          .status(400)
          .send({ status: false, msg: "installments must be number" });
    }
    const product = await productModel.findOne({
      _id: updateData,
      isDeleted: false,
    });
    if (!product) {
      return res.status(404).send({ status: false, msg: " data not found" });
    }
    const savedObj = {};
    console.log(title);
    if (title) savedObj.title = title;
    if (description) savedObj.description = description;
    if (price) savedObj.price = price;
    if (uploadedFileURL) savedObj.productImage = uploadedFileURL;
    if (isFreeShipping) savedObj.isFreeShipping = isFreeShipping;
    if (currencyId) savedObj.currencyId = currencyId;
    if (currencyFormat) savedObj.currencyFormat = currencyFormat;
    if (style) savedObj.style = style;
    if (availableSizes) savedObj.availableSizes = availableSizes;
    if (installments) savedObj.installments = installments;
    let updateone = {
      title,
      description,
      price,
      productImage: uploadedFileURL,
      isFreeShipping,
      currencyId,
      currencyFormat,
      style,
      availableSizes,
      installments,
    };
    console.log(updateone, savedObj);
    let updateProduct = await productModel.findOneAndUpdate(
      { _id: updateData },
      savedObj,
      { new: true }
    );
    return res.status(200).send({
      status: true,
      msg: "product profile details updated succesfullly",
      data: updateProduct,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ status: false, msg: err.message });
  }
};

//delete
const deleteProduct = async function (req, res) {
  try {
    let productId = req.params.productId;
    let obj = {};
    if (req.params.productId) {
      if (!productId)
        return res
          .status(404)
          .send({ status: false, msg: "Please provide valid productId" });
      else obj.productId = req.params.productId;
    }
    const dataObj = { isDeleted: true };

    let checkProduct = await productModel.findOneAndUpdate(
      { _id: obj.productId, isDeleted: false },
      { $set: dataObj, deletedAt: Date.now() },
      { new: true }
    );
    if (!checkProduct)
      return res.status(404).send({ status: false, msg: "No Product Found" });

    res.status(200).send({
      status: true,
      msg: "Product has been deleted successfully",
      data: checkBook,
    });
  } catch (error) {
    return res.status(500).send({ status: false, msg: error.message });
  }
};
