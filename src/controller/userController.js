const userModel = require("../model/userModel");
const aws = require("aws-sdk");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const upload = multer();
const isValid = (value) => {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};

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

const regexName = /^[a-z ,.'-]+$/i;
const regexPassword =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const regexNumber = /^([9876]{1})(\d{1})(\d{8})$/;
const regexPinCode = /^[1-9][0-9]{5}$}*$/;

exports.register = async function (req, res) {
  const { fname, lname, password, email, phone, profileImage, address } =
    req.body;

  let { files } = req;
  if (!files.length) {
    return res
      .status(400)
      .send({ status: false, msg: "profileimage  is missing" });
  }
  console.log(files);
  if (files[0].fieldname !="profileImage")
    // upload only png and jpg format
    return res.status(400).send({ status: false, msg: "Only images allowed as profileImage" });
  if (!files[0].originalname.match(/\.(png|jpg)$/))
    // upload only png and jpg format
    return res.status(400).send({ status: false, msg: "Only images allowed" });

  console.log(files);
  //upload to s3 and get the uploaded link
  // res.send the link back to frontend/postman
  const uploadedFileURL = await uploadFile(files[0]);
  //   console.log(uploadedFileURL)
  if (!isValid(fname))
    return res
      .status(400)
      .send({ status: false, message: "fname cannot be empty" });
  if (!regexName.test(fname))
    return res
      .status(400)
      .send({ status: false, message: "please enter valid characters" });
  if (!isValid(lname))
    return res
      .status(400)
      .send({ status: false, message: "lname cannot be empty" });
  if (!regexName.test(lname))
    return res
      .status(400)
      .send({ status: false, message: "please enter valid lname characters" });
  if (!isValid(password))
    return res
      .status(400)
      .send({ status: false, message: "password cannot be empty" });
  if (!regexPassword.test(password))
    return res.status(400).send({
      status: false,
      message:
        "passord must be between 8 to 15 digits one numbbe and one alphabet",
    });
  //hashing password
  const maskedPassword = await bcrypt.hash(password, 12);
  console.log(maskedPassword);
  if (!isValid(email))
    return res
      .status(400)
      .send({ status: false, message: "email cannot be empty" });
  if (!regexEmail.test(email))
    return res
      .status(400)
      .send({ status: false, message: "please enter valid email characters" });
  const foundEmail = await userModel.findOne({ email });
  if (foundEmail)
    return res
      .status(400)
      .send({ status: false, message: "This email is already being used" });
  if (!isValid(phone))
    return res
      .status(400)
      .send({ status: false, message: "phone cannot be empty" });
  if (!regexNumber.test(phone))
    return res
      .status(400)
      .send({ status: false, message: "please enter valid phone characters" });
  const foundPhone = await userModel.findOne({ phone });
  if (foundPhone)
    return res
      .status(400)
      .send({ status: false, message: "This phone is already being used" });
  if (!isValid(address.shipping.street))
    return res
      .status(400)
      .send({ status: false, message: "street cannot be empty" });
  if (!isValid(address.shipping.city))
    return res
      .status(400)
      .send({ status: false, message: "city cannot be empty" });
  if (!isValid(address.shipping.pincode))
    return res
      .status(400)
      .send({ status: false, message: "pincode cannot be empty" });
  if (!regexPinCode.test(address.shipping.pincode))
    return res
      .status(400)
      .send({ status: false, message: "please use valid pincode" });
  if (!isValid(address.billing.street))
    return res
      .status(400)
      .send({ status: false, message: "street cannot be empty" });
  if (!isValid(address.billing.city))
    return res
      .status(400)
      .send({ status: false, message: "city cannot be empty" });
  if (!isValid(address.billing.pincode))
    return res
      .status(400)
      .send({ status: false, message: "pincode cannot be empty" });
  if (!regexPinCode.test(address.billing.pincode))
    return res
      .status(400)
      .send({ status: false, message: "please use valid pincode" });
  const userCreated = await userModel.create({
    fname,
    lname,
    password: maskedPassword,
    email,
    profileImage: uploadedFileURL,
    phone,
    address,
  });
  res.status(201).send({
    status: true,
    message: "User created successfully",
    data: userCreated,
  });
};
