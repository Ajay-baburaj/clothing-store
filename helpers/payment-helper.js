const Razorpay = require('razorpay');
const db = require('../config/connection')
const bcrypt = require('bcrypt')
require('dotenv').config()
const collection = require('../config/collection');
const objectId = require('mongodb').ObjectId
const paypal = require('paypal-rest-sdk');
const { resolve } = require('path');

let approval_link_saved 


paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': process.env.PAYPAL_CLIENT_ID,
  'client_secret': process.env.PAYPAL_SECRET_ID
})


let razorpayCredentials = {
    KEY_ID :process.env.RAZORPAY_KEY_ID,
    KEY_SECRET:process.env.RAZORPAY_KEY_SECRET
}

var instance = new Razorpay({ key_id: razorpayCredentials.KEY_ID, key_secret: razorpayCredentials.KEY_SECRET })

module.exports={
    generateRazorpay: (orderId, total) => {
        return new Promise((resolve, reject) => {
            total = parseInt(total)
            instance.orders.create({
        
              amount: total*100,
              currency: "INR",
              receipt: "" + orderId,
      
        
            }, (err, order) => {
              if (err) {
                console.log(err)
              } else {
                console.log("=============here comes the order")
                console.log(order)
                resolve(order)
              }
            })
        })
    },

    verifyPayment:(reqBody)=>{
      return new Promise(async(resolve,reject)=>{
        const crypto = require('crypto')
        let hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)


        hmac.update(reqBody['payment[razorpay_order_id]']+'|'+reqBody['payment[razorpay_payment_id]'],process.env.RAZORPAY_KEY_SECRET)
        hmac = hmac.digest('hex')
        if(hmac = reqBody['payment[razorpay_signature]']){
          resolve()
        }else{
          reject()
        }

      })
    },
    changePaymentMethod:(orderId,userId)=>{
      console.log('order-id is here'+ orderId)
      return new Promise(async(resolve,reject)=>{
        await db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},
        {
            $set:{
              'status':'placed'
            }
        })
        .then(()=>{
          db.get().collection(collection.CART_COLLECTION).deleteOne({user:objectId(userId)})
          resolve()
        }).catch((err)=>{
          reject(err)
        })
      })
    },

    removeorder:(orderId)=>{      
      return new Promise((resolve, reject) => {
          db.get().collection(collection.ORDER_COLLECTION).deleteOne({_id: objectId(orderId)}).then((data) => {
              resolve()
          })
      })
  },

    // generatePaypal:(orderId,total)=>{
    //   return new Promise((resolve,reject)=>{
        
    //     var create_payment_json = {
    //       "intent": "sale",
    //       "payer": {
    //           "payment_method": "paypal"
    //       },
    //       "redirect_urls": {
    //           "return_url": "http://return.url",
    //           "cancel_url": "http://cancel.url"
    //       },    
    //       "transactions": [{
    //           // "item_list": {
    //           //     "items": [{
    //           //         "name": "item",
    //           //         "sku": "item",
    //           //         "price": "1.00",
    //           //         "currency": "USD",
    //           //         "quantity": 1
    //           //     }]
    //           // },
    //           "amount": {
    //               "currency": "USD",
    //               "total": total
    //           },
    //           "description": "This is the payment description."
    //       }]
    //     }

    //      paypal.payment.create(create_payment_json, function (error, payment) {
    //       if (error) {
    //         console.log(error)
    //         throw error;
    //       } else {
    //           for(let i = 0;i < payment.links.length;i++){
    //             if(payment.links[i].rel === 'approval_url'){
    //               let approval_link = payment.links[i]
    //               approval_link_saved= approval_link
    //               // res.redirect(payment.links[i].href);
    //             }
    //           }
    //       }
    //     })

    //   })
    // },
     

}