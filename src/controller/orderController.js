const orderModel = require('../model/orderModel')
const cartModel = require('../model/cartModel')
// //  ## Checkout/Order APIs (Authentication and authorization required)
// ### POST /users/:userId/orders
// - Create an order for the user
// - Make sure the userId in params and in JWT token match.
// - Make sure the user exist
// - Get cart details in the request body
// - _Response format_
//   - *On success* - Return HTTP status 200. Also return the order document. The response should be a JSON object like [this](#successful-response-structure)
//   - *On error* - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like [this](#error-response-structure)


const createOrder =  async function(req,res){
    try{
      let userIdFromParams= req.params.userId

      const requestBody=req.body
      const {userId, cancellable,status }=requestBody
// const user=await userModel.findOne({_id:userIdFromParams})
const cart=await cartModel.findOne({userId:userIdFromParams})
 let totalQuantity = 0;
  const cartItems = cart.items;
  cartItems.forEach((items) => (totalQuantity += items.quantity));
    const newOrder = {
      userId: userIdFromParams,
      items: cart.items,
      totalPrice: cart.totalPrice,
      totalItems: cart.totalItems,
      totalQuantity: totalQuantity,
      cancellable,status
    };
   const createOrder = await orderModel.create(newOrder)
   return res.status(201).send({status:true , data:createOrder})
   }catch(err){
      return res.status(500).send({ status: false, msg: err.message })
    }
}
module.exports.createOrder=createOrder



const updateOrder = async function (req, res) {
    try {
        const userId = req.params.userId
        const requestBody = req.body

        const { orderId } = requestBody

        //Validations
        if (!isValid(orderId)) {
            return res.status(400).send({ status: false, message: "Please enter orderId" })
        }

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "userId is invalid" })
        }
        if (!mongoose.isValidObjectId(orderId)) {
            return res.status(400).send({ status: false, message: "orderId is invalid" })
        }

        const isUserExists = await userModel.findById(userId)
        if (!isUserExists) {
            return res.status(404).send({ status: false, message: "userData not found" })
        }

        const isOrderExists = await orderModel.findOne({ _id: orderId, isDeleted: false })
        if (!isOrderExists) {
            return res.status(404).send({ status: false, message: "orderData not found" })
        }
        //If the cancellable is false then order can't be cancelled. 
        if (isOrderExists.cancellable == false) return res.status(400).send({ status: false, message: "This order can't be cancelled" });

        if (isOrderExists.userId != userId) {
            return res.status(400).send({ status: false, message: "order not belongs to the user" })
        }


        const updatedData = await orderModel.findOneAndUpdate({ _id: orderId, isDeleted: false }, { status: "cancled", isDeleted: true, deletedAt: Date.now() }, { new: true })

        if (!updatedData) {
            return res.status(404).send({ status: false, message: "data not found for update" })
        }


        return res.status(200).send({ status: true, message: "order Cancelled successfully", data: updatedData })
    }
    catch (error) {
        console.log(error);
        return res.status(500).send({ status: false, message: error.message })
    }
}


module.exports = { createOrder, updateOrder };