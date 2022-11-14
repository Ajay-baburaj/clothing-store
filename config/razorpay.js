const Razorpay = require('razorpay');
var instance = new Razorpay({ key_id: 'rzp_test_wBILsF6sI8t8aF', key_secret: '8C84FoP90AqSyOjByzG9WHTR' })

module.exports={
  
  createOrderRazorpay: (orderId, total) => {
    return new Promise((resolve,reject)=>{

      total = parseInt(total)
      instance.orders.create({
  
        amount: total,
        currency: "INR",
        receipt: "" + orderId,
  
      }, (err, order) => {
        if (err) {
          console.log(err)
        } else {
          console.log("=============here comes the order")
          console.log(order)
        }
      })
    })
  }

}






