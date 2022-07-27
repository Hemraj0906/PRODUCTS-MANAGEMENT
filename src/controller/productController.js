const productModel = require("../model/productModel");
const aws = require("aws-sdk");

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
  return true;
};
const titleRegex = /^\w+$/;
const priceRegex = /^\d*$/;
// const regexSize = /(?i)\d+(?:\.5)?x-(?:S|XS|M|X|L|XXL|XL)/;
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
    console.log(typeof price,"price");
    // {
    //     "title": 'Nit Grit',
    //     "description": 'Dummy description',
    //     "price": 23.0,
    //     "currencyId": 'INR',
    //     "currencyFormat": '₹',
    //     "isFreeShipping": false,
    //     "style": 'Colloar',
    //     "availableSizes": ["S", "XS","M","X", "L","XXL", "XL"],
    //     "installments": 5,

    //   }
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
    console.log(typeof availableSizes);
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
    if (!isValid(description))
      return res
        .status(400)
        .send({ status: false, msg: "description cannot be empty" });
    if (!isValid(price))
      return res
        .status(400)
        .send({ status: false, msg: "price cannot be empty" });
    console.log(price,"price 2");
    console.log(!priceRegex.test(price),"rex price");
    if (!priceRegex.test(price))
      return res
        .status(400)
        .send({ status: false, msg: "price must be a number" });
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
      if (!isValid(availableSizes))
        return res
          .status(400)
          .send({ status: false, msg: "availableSizes cannot be empty" });
      //   if (regexSize.test(availableSizes))
      //     return res.status(400).send({
      //       status: false,
      //       msg: 'availableSizes must be "S", "XS","M","X", "L","XXL", "XL"',
      //     });
    }
    if (installments) {
      if (!isValid(installments))
        return res
          .status(400)
          .send({ status: false, msg: "installments cannot be empty" });
    //   if (priceRegex.test(installments))
    //     return res
    //       .status(400)
    //       .send({ status: false, msg: "installments must be number" });
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
const getProduct = async (req, res) => {
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
//update
const updateDetails = async function (req, res) {
  try {
    let updateData = req.params.productId;
    let updatingData = req.body;
    let files = req.files;
    let productImg = await aws.uploadFile(files[0]);
    if (!productImg) {
      return res
        .status(400)
        .send({ status: false, msg: " plz upload the files" });
    }
    let {
      title,
      description,
      price,
      productImage,
      currencyId,
      currencyFormat,
      style,
      availableSizes,
      installments,
    } = updatingData;
    const product = await productModel.findOne({
      _id: updateData,
      isDeleted: false,
    });
    if (!product) {
      return res.status(404).send({ status: false, msg: " data not found" });
    }
    let updateone = {
      title,
      description,
      price,
      productImage,
      currencyId,
      currencyFormat,
      style,
      availableSizes,
      installments,
    };
    let updateProduct = await productModel.findOneAndUpdate(
      { _id: updateData },
      { ...updateone },
      { new: true }
    );
    if (!updateProduct) {
    }
    return res
      .status(200)
      .send({
        status: true,
        msg: "product profile details updated succesfullly",
        data: updateproduct,
      });
  } catch (err) {
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
