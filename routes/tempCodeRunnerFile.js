var express = require('express');
const session = require('express-session');
const app = require('../app');
const { response, route } = require('../app');
var router = express.Router();
const paypal = require('paypal-rest-sdk');



let loginHelpers = require('../helpers/login-helpers');
const productHelpers = require('../helpers/product-helpers');
let cartHelpers = require('../helpers/cart-helpers')
let orderHelpers = require('../helpers/order-helpers')
let userHelpers = require('../helpers/user-helper');
const userHelper = require('../helpers/user-helper');
const paymentHelpers = require('../helpers/payment-helper')
const { displayOrderDetials } = require('../helpers/order-helpers');

let YOUR_ACCOUNT_SID = "ACf62a42fdb24f98f80e507dc88a6df48f"
let YOUR_AUTH_TOKEN = "90079130367a777c89107192c80828c4";
let YOUR_SERVICE_ID = "VA67a91769fc202fc338216a16c5a214fa";


let productIdState = {
  productId : null
}

let cartData={
  cartLength:null
}

var orderDoc={}

let orderTotal



const client = require("twilio")(YOUR_ACCOUNT_SID, YOUR_AUTH_TOKEN);

function userTrue(req,res,next){
  if(req.session.loggedIn===true){
    res.redirect('/')
  }
  next()

}

function userFalse(req,res,next){
  if(req.session.loggedIn ===false){
    res.redirect('/sign-in')
  }
  next()}


/* GET home page. */
router.get('/',userFalse,async function(req, res, next) {

  if(req.session.user){
      let userId = req.session.user._id
      let cartCount = await cartHelpers.getCartCount(userId)
      res.render('user/home', { title: 'Clothing  store',user:req.session.user,loggedIn:req.session.loggedIn,cartCount,userheader:true});

    }else{
      res.render('user/home',{userheader:true})
    }


  })



// -----------------sign-in-page----------------------

router.get('/sign-in',userTrue,(req, res) => {
  if(req.session.logInErr){
    res.render('user/sign-in',{logInErr:req.session.logInErr})
    return req.session.logInErr =''
  }
  res.render('user/sign-in')
})

router.post('/sign-in', (req, res) => {
  loginHelpers.doLogin(req.body).then((response) => {

    if (response.booleanCheck) {
      if (response.user.status) {
        req.session.user = response.user
        req.session.loggedIn = true
        console.log("you can log in")
        res.redirect('/')
      } else {
        // res.send('account blocked')
        req.session.logInErr="Account Blocked"
        res.redirect('/sign-in')
      }
    } else {
      req.session.logInErr = "invalid username or password"
      res.redirect('/sign-in')
    }
  })
  })

  router.get('/sign-in-otp',userTrue,(req,res)=>{
   
        let noUserErr = req.session.mobileErr 
        if(noUserErr){
          res.render('user/otp-login',{noUserErr})
          req.session.mobileErr= ""

        }

        res.render('user/otp-login')
        
    
  })






 


  router.get('/otp-enter-page',userTrue,(req,res)=>{

    let mobileNumber = req.session.mobile

    let name = req.session.user.name
    let otpError = req.session.otpCodeError
    if(req.session.userExits){

      res.render('user/otp-enter-page',{mobileNumber,otpError})
      console.log('otp erooooooorrr')
    }else{

      res.render('user/otp-enter-page',{otpError})
      console.log(otpError)
      req.session.otpCodeError=""
    }
    

  })

  

  router.post('/sign-in-otp',async(req,res)=>{
    const mobileNum = req.body.mobile
    req.session.mobile = mobileNum
    let details = await loginHelpers.getUserMobile(mobileNum)
    if(details){
      req.session.userExits = true;
      req.session.user = details

      console.log('___________________________________its working')

      //Adding otp sending verification

      client.verify
      .services(YOUR_SERVICE_ID) // Change service ID
      .verifications.create({
        to: `+91${mobileNum}`,
        channel:"sms",
      })
      .then((data) => {
  
        res.redirect('/otp-enter-page/')
      });
    }else{
      req.session.userExits= false;
      req.session.mobileErr = "Mobile number not found please sign up"
      res.redirect('/sign-in-otp/')
    }
  })

router.post('/otp-enter-page',(req,res)=>{
  let otp = req.body.otp
  let mobNum = req.session.mobile
  console.log('OOOOOOOOOOOOOOOOO')
  console.log(mobNum)
  console.log(otp)
  client.verify
    .services(YOUR_SERVICE_ID) // Change service ID
    .verificationChecks.create({
      to: `+91${(mobNum)}`,
      code: otp,
    })
    .then((data) => {

      console.log(data)
      if (data.status === "approved") {
        loginHelpers.loginOtp(mobNum).then((response)=>{
            if(response.status){
              req.session.user = response.user;
              req.session.loggedIn = true;
              req.session.mobNum = null;
              res.redirect('/')
            }
          })
        }else{
          req.session.otpCodeError = "invalid otp";
          res.redirect('/otp-enter-page')
        }
    })
    
})





// --------------sign-up-page--------------

router.get('/sign-up', userTrue,(req, res) => {
  if(req.session.signupErr){
    res.render('user/sign-up',{signupErr:"email already exist please log in"})
    return req.session.signupErr = ""
  }else{
    res.render('user/sign-up')
  }

})

router.post('/sign-up', (req, res) => {

  let user = req.body

  loginHelpers.doSignup(req.body).then((response) => {
    if (response.user) {
      console.log("user added")
      res.redirect('/sign-in')
    } else {
      req.session.signupErr = "email already exists Please log in"
      res.redirect('/sign-up')
    }

  })

})

// ----------logout--------------
router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})


// --------------shop-now----------------


router.get('/shop-now',async(req,res)=>{

  let productDetails = await productHelpers.viewAllProducts()  
  let categoryDetails = await productHelpers.viewCategories()
  if(req.session.user){
    let userId = req.session.user._id
    let cartCount = await cartHelpers.getCartCount(userId)
    res.render('user/shop-now',{user:req.session.user,productDetails,categoryDetails,cartCount,userheader:true})
  }else{
    res.render('user/shop-now',{productDetails,categoryDetails,userheader:true})
  }

})


router.get('/product-details/:id',(req,res)=>{
 
  let fetchedId = req.params.id
 productIdState.productId = fetchedId;

//  console.log('---------')

//  console.log(productIdState.productId)

 
 res.redirect('/product-details')
})

router.get('/product-details',async(req,res)=>{
  let singleProductDetail = await productHelpers.getProductDetails(productIdState.productId)
  if(req.session.user){
    let userId = req.session.user._id
    let cartCount = await cartHelpers.getCartCount(userId)
    res.render('user/product-details',{singleProductDetail,user:req.session.user,cartCount,userheader:true})
  }else{
    res.render('user/product-details',{singleProductDetail,userheader:true})
  }
})

router.get('/cart',async(req,res)=>{
  if(req.session.loggedIn){
    let userId = req.session.user._id

    let cartCount = await cartHelpers.getCartCount(userId)
    
    if(cartCount==0){

      res.render('user/cart',{userheader:true,user:req.session.user,cartCount})
    }else{
      
      let cartDetails = await cartHelpers.getCartDetails(userId)
      // console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@22');  
      // console.log(cartDetails)
        let total = await cartHelpers.getCartTotal(userId) 
        console.log(total)
          total = total[0].total
        console.log('[[[[[[[[ cartTotal price is here ]]]]]]]]]]]')
        // console.log(cartTotal)
      
        res.render('user/cart',{user:req.session.user,cartDetails,cartCount,userheader:true,total})
    }
 }else{

   res.render('user/cart',{userheader:true})
 }
})


router.get('/add-to-cart/:id',async(req,res)=>{

  // console.log('call is coming')
  if(req.session.loggedIn){

    productId = req.params.id
    userId = req.session.user._id
    let cartCount = await cartHelpers.getCartCount(userId)
  
  
      cartHelpers.addToCart(productId,userId).then((response)=>{
        
          res.json({status:true,cartCount})
        // res.redirect('/cart')
      })
  }
    // res.redirect('/sign-in')


  })

  router.get('/add-to-cart-product/:id',async(req,res)=>{

    // console.log('call is coming')
    if(req.session.loggedIn){
  
      productId = req.params.id
      userId = req.session.user._id
      let cartCount = await cartHelpers.getCartCount(userId)
    
    
        cartHelpers.addToCart(productId,userId).then((response)=>{
          
            // res.json({status:true,cartCount})
           res.redirect('/cart')
        })
    }
  
  
    })
  
  router.post('/change-product-quantity',(req,res,next)=>{
      console.log('call is coming')
      cartHelpers.changeProductQuantity(req.body).then(async(response)=>{

      response.total = await cartHelpers.getCartTotal(req.body.user)

        res.json(response)

        // console.log('data is here------------------------')
        // console.log(response)
        // console.log('------------------------------------ ')
      })
    
  })

  




//removing product from cart

  router.get('/remove-cart-product/:id',async(req,res)=>{
    let userId = req.session.user._id;
    let productId = req.params.id
    await cartHelpers.deleteProduct(userId,productId)
      res.redirect('/cart')
  
  })

  router.get('/checkout',async(req,res)=>{

    
    if(req.session.loggedIn){
    let  userId = req.session.user._id
      let cartCount = await cartHelpers.getCartCount(userId)
      // let addressError =null;
      // if(req.session.addressErr){
      //     // addressError= req.session.addressErr
      // }
        userId = req.session.user._id
        let addressArray = await orderHelpers.getAddressByUser(userId)
        let total = await cartHelpers.getCartTotal(userId)
        total = total[0].total
        let cartDetails = await cartHelpers.getCartDetails(userId)
        console.log("cartDetails is hereeeeeeeee")
        console.log(cartDetails)

      
      res.render('user/checkout',{userheader:true,user:req.session.user,total,cartDetails,addressArray})
      addressError= null
    }
      


  })

  router.post('/checkout',async(req,res)=>{
    if(req.session.loggedIn){
      let billingDetails = req.body

      let cartCount = await cartHelpers.getCartCount(req.body.userId)
      let products = await cartHelpers.getCartProducts(req.body.userId)
      let totalPrice = await cartHelpers.getCartTotal(req.body.userId)
      console.log(totalPrice)
      
       
      orderHelpers.getAddressCount(req.body.userId).then((response)=>{
      if(response.status){
        if(req.body.paymentMethod ==="COD"){
          orderHelpers.placeOders(billingDetails,products,totalPrice).then((response)=>{
          res.json({codStatus:true})
        })
          }
            else if(req.body.paymentMethod==="razorpay"){
              //here response equals orderId
              paymentHelpers.generateRazorpay(response,totalPrice[0].total).then((response)=>{
                console.log("here comes the response as we wanted")
                console.log(response)
                response.razorpayStatus=true
                res.json(response)

              })
            } 
            else if(req.body.paymentMethod==="paypal"){
              let total =totalPrice[0].total
              orderTotal=total

              var create_payment_json = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                  "return_url": "http://localhost:3003/success/?orderId="+response,
                  "cancel_url": "http://localhost:3003/cancel"
                },
                "transactions": [{
                    // "item_list": {
                    //     "items": [{
                    //         "name": "item",
                    //         "sku": "item",
                    //         "price": "1.00",
                    //         "currency": "USD",
                    //         "quantity": 1
                    //     }]
                    // },
                    "amount": {
                        "currency": "USD",
                        "total": total
                    },
                    "description": "This is the payment description."
                }]
              }
            
               paypal.payment.create(create_payment_json, function (error, payment) {
                console.table('call is coming here')
                if (error) {
                  console.log(error)
                  throw error;
                } else {
                    for(let i = 0;i < payment.links.length;i++){
                      if(payment.links[i].rel === 'approval_url'){
                        res.json(payment.links[i].href);
                      }
                    }
                }
              })

              
              
            }          
              
            

          }else{
            req.session.addressErr = "please enter address"
            res.redirect('/checkout')
          }
      })
    }else{
      res.redirect('/sign-in')
    }  
  })


router.get('/success', (req, res) => {
  const orderId = req.query.orderId
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    console.log(orderId)
   
    const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
          "amount": {
              "currency": "USD",
              "total": orderTotal
          }
      }]
    };
   
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      if (error) {
          console.log(error.response);
          throw error;
      } else {
        paymentHelpers.changePaymentMethod(orderId).then((response)=>{
          
          res.redirect('/order-succesfull')
        })
          // console.log(JSON.stringify(payment));
      }
  });
  });




router.get('/order-succesfull',async(req,res)=>{
    if(req.session.loggedIn){
      let orderDetials = await orderHelpers.getOrderDetails(req.session.user._id)
      
      
      res.render('user/order-succesfull',{userheader:true,user:req.session.user,orderDetials})
    }
  })


  router.get('/my-account',(req,res)=>{
    if(req.session.loggedIn){

      res.render('user/myAccount',{userheader:true,user:req.session.user})
    }else{
      res.redirect('/sign-in')
    }
  })

router.get('/edit-personal', async (req, res) => {
  if (req.session.loggedIn) {

    if (req.session.passwordErr) {

      let userId = req.session.user._id
      let userDetails = await userHelpers.getUserDetails(userId)

      res.render('user/edit-personal', { userheader:true , userDetails, passwordErr: req.session.passwordErr })
      req.session.passwordErr = ''
    }
    else if (req.session.passwordSuc) {
      let userId = req.session.user._id
      let userDetails = await userHelpers.getUserDetails(userId)

      res.render('user/edit-personal', { userheader:true , userDetails, passwordSuc: req.session.passwordSuc })
      req.session.passwordSuc= ''
    }
    else if(req.session.response){
      let emailError = "This email already exists! please try another email."
      let userId = req.session.user._id
      let userDetails = await userHelpers.getUserDetails(userId)

      res.render('user/edit-personal', { userheader:true , userDetails, passwordSuc: req.session.passwordSuc,emailError,userExist:req.session.response.userExits }) 
      req.session.response =null;
    }

    let userId = req.session.user._id
    let userDetails = await userHelpers.getUserDetails(userId)

    res.render('user/edit-personal', {userheader:true, userDetails,user:req.session.user})

  } else {
    res.redirect('/sign-in')
  }
})

router.post('/edit-personal',async(req,res)=>{
      if(req.session.loggedIn){
        let userId = req.session.user._id
        let passwordObj = req.body
        console.log(passwordObj)
        await userHelpers.passwordUpdate(userId,passwordObj).then((response)=>{
          console.log('password updated successfully')
          if(response.status){
            req.session.passwordSuc = 'password updated successfully!'
            res.redirect('/sign-in')
            req.session.destroy()

          }else{
            req.session.passwordErr = 'incorrect password'
            res.redirect('/edit-personal')
          }
        })
      }
  })

router.get('/order-history',async(req,res)=>{
  if(req.session.loggedIn){
    let orderDetials = await orderHelpers.getAllOrderDetails(req.session.user._id)
    let productImages = await orderHelpers.getProImages(orderDoc.orderId)
    console.log("order details is here...............................")
    console.log(productImages)
    res.render('user/order-history',{userheader:true,orderDetials,user:req.session.user,productImages})
  }else{

    res.redirect('/sign-in')
  }
})


router.post('/edit-personal-details',async(req,res)=>{
  if(req.session.loggedIn){
    let userId = req.session.user._id
    userHelper.personalEdit(req.body,userId).then((response)=>{
      console.log('response is here')
      console.log(response)
      req.session.response = response
      res.redirect('/edit-personal')
    })
  }else{
    res.redirect("/sign-in")
  }
    // console.log(req.body)
})

router.get('/order-display/:id',(req,res)=>{
  orderDoc.orderId = req.params.id
  res.redirect('/order-display')

})

router.get('/order-display',async(req,res)=>{
    if(req.session.loggedIn){
      let orderDetials = await orderHelpers.displayOrderDetials(orderDoc.orderId)

      if(displayOrderDetials.status == 'placed'){
       var orderStatus = true;
      }
      else if(displayOrderDetials.status == "delivered"){
       var deliveryStatus = true;
      }

      console.log('order details for now -----------------')
      console.log(orderDetials)
      console.log(orderDoc.orderId)
      console.log('order details for now -----------------')
     
    let orderTotal = await orderHelpers.displayOrderTotal(orderDoc.orderId)
    let address = await orderHelpers.getAddress(orderDoc.orderId)
      res.render('user/order-display',{userheader:true,user:req.session.user,orderDetials,orderTotal,address,orderStatus,deliveryStatus})
    }else{
     res.redirect('/sign-in')
    }
})

router.get('/cancel-order/:id',async(req,res)=>{
    
  console.log(req.params.id)
    await orderHelpers.cancelOrders(req.params.id).then(()=>{
      res.redirect('/order-history')
    })
})


router.post('/address-submmit',async(req,res)=>{
  
  let newAddress = req.params.body
  orderHelpers.createAddress(newAddress).then((response)=>{
    res.redirect('/checkout')
  })
  
})

router.get('/add-new-address',(req,res)=>{
  console.log('its coming here')
  if(req.session.loggedIn){
    res.render('user/add-address',{userheader:true,user:req.session.user})
  }else{
    res.redirect('/sign-in')
  }
})

router.post('/add-new-address',(req,res)=>{
  console.log(req.body)
  orderHelpers.createAddress(req.body).then((response)=>{
    res.redirect('/checkout')
  })
})

router.get('/edit-address/:id',async(req,res)=>{
  console.log(req.params.id)
  
  let editAddress= await orderHelpers.getEditAddress(req.params.id)
 
  console.log(editAddress)
  if(req.session.loggedIn){
    res.render('user/edit-address',{userheader:true,user:req.session.user,editAddress})
  }else{
    res.redirect('/sign-in')
  }
})

router.post('/edit-address',async(req,res)=>{
  console.log('req.body is here   .......')
  let editedAddress = req.body
  console.log(editedAddress)
  console.log('req.body is here .......')

  if(req.session.loggedIn){
    await orderHelpers.editAddress(editedAddress).then(()=>{
      res.redirect('/checkout')
    })
  }
})

router.get('/delete-address/:id',(req,res)=>{
  if(req.session.loggedIn){
    console.log(req.params.id)
    orderHelpers.deleteAddress(req.params.id).then((response)=>{
      res.redirect('/checkout')
    })

  }else{
    res.redirect('/sign-in')
  }

})

router.get('/address-update',async(req,res)=>{
  // console.log('===========hey req is here============')
  // console.log(req.url)
  if(req.session.loggedIn){
 let    userId = req.session.user._id
    let addressArray = await orderHelpers.getAddressByUser(userId)
    res.render('user/address-update',{userheader:true,user:req.session.user,addressArray})
  }
})

router.get('/address-update-add-new',(req,res)=>{
  if(req.session.loggedIn){
    res.render('user/address-update-add-new',{userheader:true,user:req.session.user})
  }else{
    res.redirect('/sign-in')
  }
})

router.post('/address-update-add-new',(req,res)=>{
  // console.log(req.body)
  orderHelpers.createAddress(req.body).then((response)=>{
    res.redirect('/address-update')
  })

})


router.get('/address-update-edit/:id',async(req,res)=>{

  console.log(req.params.id)
  
  let editAddress= await orderHelpers.getEditAddress(req.params.id)
 
  console.log(editAddress)
  if(req.session.loggedIn){
    res.render('user/address-update-edit',{userheader:true,user:req.session.user,editAddress})
  }else{
    res.redirect('/sign-in')
  }
  
})

router.post('/address-update-edit/',async(req,res)=>{

  console.log('req.body is here   .......')
  let editedAddress = req.body
  console.log(editedAddress)
  console.log('req.body is here .......')

  if(req.session.loggedIn){
    await orderHelpers.editAddress(editedAddress).then(()=>{
      res.redirect('/address-update')
    })
  }

})

router.get('/address-update-delete/:id',(req,res)=>{
  console.log('call is coming here')
  if(req.session.loggedIn){
    console.log(req.params.id)
    orderHelpers.deleteAddress(req.params.id).then((response)=>{
      res.redirect('/address-update')
    })

  }else{
    res.redirect('/sign-in')
  }


})

router.get('/category-wise-shop-now/:id',async(req,res)=>{
  console.log('call coming in category')
  let catId = req.params.id
  let categoryDetails = await productHelpers.viewCategories()
  let productByCat = await productHelpers.getProductByCatgories(catId)
  if(req.session.user){
    let userId = req.session.user._id
    let cartCount = await cartHelpers.getCartCount(userId)
    res.render('user/categorywise',{user:req.session.user,productByCat,categoryDetails,cartCount,userheader:true})
  }else{
    res.render('user/categorywise',{productByCat,categoryDetails,userheader:true})
  }

}),
router.post('/verify-payment',(req,res)=>{
    console.log(req.body)
  paymentHelpers.verifyPayment(req.body).then((response)=>{
    console.log(response)
    paymentHelpers.changePaymentMethod(req.body['order[receipt]']).then(()=>{
      console.log('payment success')
      res.json({status:true})
    }).catch((err)=>{
      console.log(err)
      res.json({status:false})
    })
  })
})








module.exports = router;

