let loginHelpers = require('../helpers/login-helpers');
const session = require('express-session');
const productHelpers = require('../helpers/product-helpers');
let cartHelpers = require('../helpers/cart-helpers')
let orderHelpers = require('../helpers/order-helpers')
let userHelpers = require('../helpers/user-helper');
const userHelper = require('../helpers/user-helper');
const chartHelpers = require('../helpers/chart-helpers')
const paymentHelpers = require('../helpers/payment-helper')
const { displayOrderDetials } = require('../helpers/order-helpers');
require('dotenv').config()
const Accounts = require('twilio/lib/rest/Accounts');
const paypal = require('paypal-rest-sdk');
const { response } = require('../app');
const { Db } = require('mongodb');
const { query } = require('express');

let YOUR_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
let YOUR_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
let YOUR_SERVICE_ID = process.env.TWILIO_SERVICE_ID
const client = require("twilio")(YOUR_ACCOUNT_SID, YOUR_AUTH_TOKEN);

let productIdState = {
  productId: null
}

let cartData = {
  cartLength: null
}

var orderDoc = {}

let orderTotal

const home = async function (req, res, next) {
  try {
    let banners = await productHelpers.getAllBanners()
    let topSellingProducts = await chartHelpers.topSellingProducts()
    let categoryDetails = await productHelpers.getCategoryDetails()
    let offerProducts = await productHelpers.mostOfferProducts()
    let couponCount = await productHelpers.getCouponCounts()
    let coupons = await productHelpers.viewCoupons()



    if (req.session.user) {
      let userId = req.session.user._id
      let walletMoney = await loginHelpers.getWalletTotal(userId)
      let cartCount = await cartHelpers.getCartCount(userId)
      req.session.walletMoney = walletMoney
      req.session.couponCount = couponCount
      req.session.coupons = coupons
      res.render('user/home', { title: 'Ind Wear', user: req.session.user, loggedIn: req.session.loggedIn, cartCount, userheader: true, walletMoney, topSellingProducts, categoryDetails, banners, offerProducts, couponCount, coupons });

    } else {
      res.render('user/home', { userheader: true, topSellingProducts, categoryDetails, banners, offerProducts, couponCount, coupons })
    }

  } catch (err) {
    next(err)
  }

}


const singinGET = (req, res) => {
  try {
    if (req.session.logInErr) {
      res.render('user/sign-in', { logInErr: req.session.logInErr })
      return req.session.logInErr = ''
    }
    res.render('user/sign-in')
  } catch (err) {
    next(err)
  }
}


const signinPOST = (req, res) => {

  loginHelpers.doLogin(req.body).then(async (response) => {

    if (response.booleanCheck) {
      if (response.user.status) {
        let walletTotal = await loginHelpers.getReferalTotal(response.user._id)
        req.session.user = response.user
        req.session.walletTotal = walletTotal
        req.session.loggedIn = true
        console.log("you can log in")
        res.redirect('/')
      } else {
        // res.send('account blocked')
        req.session.logInErr = "Account Blocked"
        res.redirect('/sign-in')
      }
    } else {
      req.session.logInErr = "invalid username or password"
      res.redirect('/sign-in')
    }
  }).catch((err) => {
    next(err)
  })
}

const signinOtpGET = (req, res) => {
  try {

    let noUserErr = req.session.mobileErr
    if (noUserErr) {
      res.render('user/otp-login', { noUserErr })
      req.session.mobileErr = ""
    }
    res.render('user/otp-login')
  } catch (err) {
    next(err)
  }
}

const signinOtpPOST = async (req, res) => {
  const mobileNum = req.body.mobile
  req.session.mobile = mobileNum
  let details = await loginHelpers.getUserMobile(mobileNum)
  if (details) {
    req.session.userExits = true;
    req.session.user = details

    client.verify
      .services(YOUR_SERVICE_ID) // Change service ID
      .verifications.create({
        to: `+91${mobileNum}`,
        channel: "sms",
      })
      .then((data) => {

        res.redirect('/otp/enter')
      }).catch((err) => {
        next(err)
      })

  } else {
    req.session.userExits = false;
    req.session.mobileErr = "Mobile number not found please sign up"
    res.redirect('/signin/otp')
  }
}

const otpEnterPageGET = (req, res) => {
  try {
    let mobileNumber = req.session.mobile
    let otpError = req.session.otpCodeError
    if (req.session.userExits) {

      res.render('user/otp-enter-page', { mobileNumber, otpError })
    } else {
      res.render('user/otp-enter-page', { otpError })
      console.log(otpError)
      req.session.otpCodeError = ""
    }
  } catch(err) {
    next (err)
  }
}

const otpEnterPagePOST = (req, res) => {
  let otp = req.body.otp
  let mobNum = req.session.mobile
  client.verify
    .services(YOUR_SERVICE_ID) // Change service ID
    .verificationChecks.create({
      to: `+91${(mobNum)}`,
      code: otp,
    })
    .then((data) => {

      console.log(data)
      if (data.status === "approved") {
        loginHelpers.loginOtp(mobNum).then((response) => {
          if (response.status) {
            req.session.user = response.user;
            req.session.loggedIn = true;
            req.session.mobNum = null;
            res.redirect('/')
          }
        })
      } else {
        req.session.otpCodeError = "invalid otp";
        res.redirect('/otp-enter-page')
      }
    }).catch((err) => {
      next(err)
      console.log(err)
    })

}

const signUpGET = (req, res) => {

  let referalId = req.query.ref

  try {
    if (req.session.signupErr) {
      res.render('user/sign-up', { signupErr: "email already exist please log in", referalId })
      return req.session.signupErr = ""
    } else {
      res.render('user/sign-up', { referalId })
    }
  } catch (err){
    next(err)
  }
}

const signUpPOST = (req, res) => {

  let user = req.body

  if (req.body.referalId) {
    let referalBonus = 100
    console.log('its a referal sign-up')
    loginHelpers.validateRefferalCode(req.body, referalBonus).then((response) => {
      if (response.user) {
        res.redirect('/sign-in')
      }
      else if (response.refferalError) {
        req.session.refferalErr = 'refferal unsuccessfull'
        res.redirect('/sign-up/?ref=' + req.body.referalId)
      } else {
        req.session.signupErr = "email already exists Please log in"
        res.redirect('/sign-up/?ref=' + req.body.referalId)
      }

    })
  } else {

    loginHelpers.doSignup(req.body).then((response) => {
      if (response.user) {
        console.log("user added")
        res.redirect('/sign-in')
      } else {
        req.session.signupErr = "email already exists Please log in"
        res.redirect('/sign-up')
      }

    }).catch((err) => {
      next(err)
    })

  }


}

const logOUT = (req, res) => {
  req.session.destroy()
  res.redirect('/')
}

const shopNow = async (req, res) => {
  try {

    let productDetails = res.getPaginatedResult.products
    let pages = res.getPaginatedResult.pages
    let categoryDetails = await productHelpers.viewCategories()
    let wishlistProducts = await cartHelpers.getWishlistProductDetails()


    if (req.session.user) {
      let userId = req.session.user._id
      let cartCount = await cartHelpers.getCartCount(userId)
      res.render('user/shop-now', { user: req.session.user, productDetails, categoryDetails, cartCount, userheader: true, pages, wishlistProducts, couponCount: req.session.couponCount, coupons: req.session.coupons, walletMoney: req.session.walletMoney })
    } else {
      res.render('user/shop-now', { productDetails, categoryDetails, userheader: true, pages })
    }
  } catch (err) {
    next(err)
  }
}

const productDetailsID = (req, res) => {
  try {
    let fetchedId = req.params.id
    productIdState.productId = fetchedId;
    res.redirect('/product-details')
  } catch (err){
    next (err)
  }
}

const productDetails = async (req, res) => {
  try {
    let singleProductDetail = await productHelpers.getProductDetails(productIdState.productId)
    let subcat = singleProductDetail.subCategory
    let category = singleProductDetail.category
    console.log('category is hereeeeeee')
    console.log(category);
    let subcatWiseProducts = await productHelpers.getProductsBySubCat(subcat, productIdState.productId, category)
    // console.log(subcatWiseProducts)
    if (req.session.user) {
      let userId = req.session.user._id
      let cartCount = await cartHelpers.getCartCount(userId)
      res.render('user/product-details', { singleProductDetail, user: req.session.user, cartCount, userheader: true, subcatWiseProducts, couponCount: req.session.couponCount, coupons: req.session.coupons, walletMoney: req.session.walletMoney })
    } else {
      res.render('user/product-details', { singleProductDetail, userheader: true, subcatWiseProducts })
    }
  } catch (err){
        next(err)
  }
}

const cart = async (req, res) => {
  try {
    if (req.session.loggedIn) {
      let userId = req.session.user._id

      let cartCount = await cartHelpers.getCartCount(userId)

      if (cartCount == 0) {

        res.render('user/cart', { userheader: true, user: req.session.user, cartCount, couponCount: req.session.couponCount, coupons: req.session.coupons, walletMoney: req.session.walletMoney })
      } else {
        await cartHelpers.pendingCartCheck(userId).then(async () => {

          let cartDetails = await cartHelpers.getCartDetails(userId)
          console.log(cartDetails)
          let total = await cartHelpers.getCartTotal(userId)
          total = total[0].total
          res.render('user/cart', { user: req.session.user, cartDetails, cartCount, userheader: true, total, couponDiscountDetails: req.session.response, couponCount: req.session.couponCount, coupons: req.session.coupons })
        })

      }
    } else {

      res.render('user/cart', { userheader: true })
    }
  } catch(err) {
    next(err)
  }

}

const addToCart = async (req, res) => {
  if (req.session.loggedIn) {
    console.log('call is coming here also')
    productId = req.params.id
    userId = req.session.user._id
    let cartCount = await cartHelpers.getCartCount(userId)
    cartHelpers.addToCart(productId, userId).then((response) => {
      res.json({ status: true, cartCount })
    }).catch((err) => {
      next(err)
    })
  } else {
    res.json({ status: false })

  }
}

const addToCartProduct = async (req, res) => {
  console.log('calll is coming here in add to cart product')
  if (req.session.loggedIn) {
    productId = req.params.id
    userId = req.session.user._id
    let cartCount = await cartHelpers.getCartCount(userId)
    cartHelpers.addToCart(productId, userId).then((response) => {
      res.redirect('/cart')
    }).catch((err) => {
      next(err)
    })
  } else {
    res.redirect('/sign-in')
  }
}

const changeProductQuantity = (req, res, next) => {
  console.log(req.body)
  cartHelpers.changeProductQuantity(req.body).then(async (response) => {
    response.total = await cartHelpers.getCartTotal(req.body.user)
    res.json(response)
  }).catch((err) => {
    next(err)
  })

}

const removeCartProduct = async (req, res) => {
  try {
    if (req.session.loggedIn) {
      let userId = req.session.user._id;
      let productId = req.query.productId
      await cartHelpers.deleteProduct(userId, productId)
      res.json({ deleteStatus: true })
    } else {
      res.redirect('/sign-in')
    }
  } catch {
    next(err)
  }
}

const checkoutGET = async (req, res) => {

  if (req.session.loggedIn) {
    let userId = req.session.user._id
    let cartCount = await cartHelpers.getCartCount(userId)

    if (cartCount != 0) {
      let addressArray = await orderHelpers.getAddressByUser(userId)
      // if (req.session.response) {

      //   var total = req.session.response.totalDetails[0].couponDiscountedPrice
      // } else {
      //   total = await cartHelpers.getCartTotal(userId)
      //   total = total[0].total
      // }
      let walletMoney = await loginHelpers.getWalletTotal(userId)
      total = await cartHelpers.getCartTotal(userId)
      total = total[0].total
      let walletPayment 
      if(total< walletMoney){
         walletPayment = true
      }else{
         walletPayment = false
      }
      let coupons = await productHelpers.viewCoupons()
      let cartDetails = await cartHelpers.getCartDetails(userId)
      let couponDiscount = await cartHelpers.getCouponDiscount(userId)
      res.render('user/checkout', { userheader: true, user: req.session.user, total, cartDetails, addressArray, couponDiscount, couponCount: req.session.couponCount, coupons: req.session.coupons, walletMoney,walletPayment })
    } else {
      res.redirect('/cart')
    }
  } else {
    res.redirect('/sign-in')
  }


}

const checkoutPOST = async (req, res) => {
  if (req.session.loggedIn) {
    let billingDetails = req.body
    if (req.body.couponApplied) {
      var totalPrice = await cartHelpers.getCouponDiscount(req.body.userId)
      totalPrice = totalPrice[0].couponDiscountedPrice
    } else {
      var totalPrice = await cartHelpers.getCartTotal(req.body.userId)
      totalPrice = totalPrice[0].total
    }

    let cartCount = await cartHelpers.getCartCount(req.body.userId)
    let products = await cartHelpers.getCartProducts(req.body.userId)



    orderHelpers.getAddressCount(req.body.userId).then((response) => {
      if (response.status) {
        if (req.body.paymentMethod === "COD") {
          orderHelpers.placeOders(billingDetails, products, totalPrice).then((response) => {

            res.json({ codStatus: true })
            productHelpers.orderSuccessCouponRemove(req.body.userId)

            orderHelpers.getOrderProductQuantity(response).then((data) => {
              data.forEach((element) => {
                orderHelpers.updateStockDecrease(element);
              });
            });

          })
        }
        else if (req.body.paymentMethod === "razorpay") {


          orderHelpers.placeOrderOnline(billingDetails, products, totalPrice).then((response) => {
            //here response equals orderId
            paymentHelpers.generateRazorpay(response, totalPrice).then((response) => {

              console.log("here comes the response as we wanted")
              console.log(response)
              response.razorpayStatus = true
              res.json(response)
              productHelpers.orderSuccessCouponRemove(req.body.userId)

            })

            orderHelpers.getOrderProductQuantity(response).then((data) => {
              data.forEach((element) => {
                orderHelpers.updateStockDecrease(element);
              });
            });

          })

        }
        else if (req.body.paymentMethod === "paypal") {
          // let total = totalPrice[0].total
          orderTotal = parseInt(totalPrice * 0.0125)

          orderHelpers.placeOrderOnline(billingDetails, products, totalPrice).then((response) => {
            var create_payment_json = {
              "intent": "sale",
              "payer": {
                "payment_method": "paypal"
              },
              "redirect_urls": {
                "return_url": "http://www.indwear.store/success/?orderId=" + response,
                "cancel_url": "https://www.indwear.store/cancel"
              },
              "transactions": [{
                "amount": {
                  "currency": "USD",
                  "total": orderTotal
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
                for (let i = 0; i < payment.links.length; i++) {
                  if (payment.links[i].rel === 'approval_url') {
                    res.json(payment.links[i].href);
                  }
                }
              }
            })

          }).catch((err) => {
            next (err)
          })
        }
        else if(req.body.paymentMethod ==="wallet"){

          orderHelpers.placeOders(billingDetails, products, totalPrice).then(async(response) => {
            await productHelpers.walletPayment(req.body.userId,totalPrice)
            res.json({ walletStatus: true })
            productHelpers.orderSuccessCouponRemove(req.body.userId)

            orderHelpers.getOrderProductQuantity(response).then((data) => {
              data.forEach((element) => {
                orderHelpers.updateStockDecrease(element);
              });
            });

          })

        }
      } else {
        req.session.addressErr = true;
        res.redirect('/checkout')
      }
    })
  } else {
    res.redirect('/sign-in')
  }
}

const payUsingWallet = async(req,res)=>{
 await productHelpers.walletCheck(req.body.userId,total).then((response)=>{
  res.json({response})
 })
    


}

const success = (req, res) => {

  if (req.session.loggedIn) {
    const userId = req.session.user._id
    const orderId = req.query.orderId
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;


    orderHelpers.getOrderProductQuantity(orderId).then((data) => {
      data.forEach((element) => {
        orderHelpers.updateStockDecrease(element);
      });
    });

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
        paymentHelpers.changePaymentMethod(orderId, userId).then((response) => {
          productHelpers.orderSuccessCouponRemove(userId)

          res.redirect('/order-succesfull')
        }).catch((err) => {
          throw (err)
        })
        // console.log(JSON.stringify(payment));
      }
    });

  }
}

const cancel = (req, res) => res.send('Cancelled')
const orderSuccessFull = async (req, res) => {
  try {
    if (req.session.loggedIn) {
      let orderDetials = await orderHelpers.getOrderDetails(req.session.user._id)
      res.render('user/order-succesfull', { userheader: true, user: req.session.user, orderDetials })
    }
  } catch (err) {
    next(err)
  }
}

const verifyPayment = (req, res) => {
  if (req.session.loggedIn) {
    let userId = req.session.user._id
    console.log(req.body)
    paymentHelpers.verifyPayment(req.body).then((response) => {
      console.log(response)
      paymentHelpers.changePaymentMethod(req.body['order[receipt]'], userId).then(() => {
        console.log('payment success')
        res.json({ status: true })
      }).catch((err) => {
        console.log(err)
        res.json({ status: false })
      })
    })
  } else {
    res.redirect('/sign-in')
  }
}

const myAccount = (req, res) => {
  try {
    if (req.session.loggedIn) {

      res.render('user/myAccount', { userheader: true, user: req.session.user })
    } else {
      res.redirect('/sign-in')
    }
  } catch(err) {
    next (err)
  }
}

const editPersonal = async (req, res) => {
  if (req.session.loggedIn) {

    if (req.session.passwordErr) {

      let userId = req.session.user._id
      let userDetails = await userHelpers.getUserDetails(userId)

      res.render('user/edit-personal', { userheader: true, userDetails, passwordErr: req.session.passwordErr })
      req.session.passwordErr = ''
    }
    else if (req.session.passwordSuc) {
      let userId = req.session.user._id
      let userDetails = await userHelpers.getUserDetails(userId)

      res.render('user/edit-personal', { userheader: true, userDetails, passwordSuc: req.session.passwordSuc })
      req.session.passwordSuc = ''
    }
    else if (req.session.response) {
      let emailError = "This email already exists! please try another email."
      let userId = req.session.user._id
      let userDetails = await userHelpers.getUserDetails(userId)

      res.render('user/edit-personal', { userheader: true, userDetails, passwordSuc: req.session.passwordSuc, emailError, userExist: req.session.response.userExits })
      req.session.response = null;
    }

    let userId = req.session.user._id
    let userDetails = await userHelpers.getUserDetails(userId)

    res.render('user/edit-personal', { userheader: true, userDetails, user: req.session.user })

  } else {
    res.redirect('/sign-in')
  }
}

const editPersonalPatch = async (req, res) => {
  if (req.session.loggedIn) {
    let userId = req.session.user._id
    userHelper.personalEdit(req.body, userId).then((response) => {
      req.session.response = response
      res.json({ status: true })
    }).catch((err) => {
      throw (err)
    })
  } else {
    res.redirect("/sign-in")
  }

}


const changePassword = async (req, res) => {

  if (req.session.loggedIn) {
    let userId = req.session.user._id
    let passwordObj = req.body
    console.log(passwordObj)
    await userHelpers.passwordUpdate(userId, passwordObj).then((response) => {
      if (response.status) {
        req.session.passwordSuc = 'password updated successfully!'
        res.json({ passwordChange: true })
        req.session.destroy()
      } else {
        req.session.passwordErr = 'incorrect password'
        res.json({ passwordChange: false })
      }
    }).catch((err) => {
      throw (err)
    })
  }
}

const orderHistory = async (req, res) => {
  try {
    if (req.session.loggedIn) {
      let orderDetials = await orderHelpers.getAllOrderDetails(req.session.user._id)
      let productImages = await orderHelpers.getProImages(orderDoc.orderId)
      res.render('user/order-history', { userheader: true, orderDetials, user: req.session.user, productImages, walletMoney: req.session.walletMoney })
    } else {

      res.redirect('/sign-in')
    }
  } catch (err) {
    throw (err)
  }
}

const orderDisplayId = async (req, res) => {
  let orderId = req.params.id
  console.log(orderId)
  try {
    if (req.session.loggedIn) {
      let orderDetials = await orderHelpers.displayOrderDetials(orderId)
      let orderTotal = await orderHelpers.getOrderTotal(orderId)
      let address = await orderHelpers.getAddress(orderId)
      res.render('user/order-display', { userheader: true, user: req.session.user, orderDetials, orderTotal, address, orderId, walletMoney: req.session.walletMoney })
    } else {
      res.redirect('/sign-in')
    }
  } catch (err) {
    next(err)
  }

}


const cancelOrder = async (req, res) => {
  await orderHelpers.cancelOrders(req.query.orderId).then(() => {
    res.json({ status: true })
    orderHelpers.getOrderProductQuantity(req.query.orderId).then((data) => {
      data.forEach((element) => {
        orderHelpers.updateStockIncrease(element)
      })
    })
  }).catch((err) => {
    throw (err)
  })
}

const updateAddress = async (req, res) => {
  try {
    if (req.session.loggedIn) {
      let userId = req.session.user._id
      let addressArray = await orderHelpers.getAddressByUser(userId)
      res.render('user/address-update', { userheader: true, user: req.session.user, addressArray })
    } else {
      res.redirect('/sign-in')
    }
  } catch {
    throw (err)
  }
}

const addNewAddress = (req, res) => {
  orderHelpers.createAddress(req.body).then((response) => {
    res.json({ status: true })
  }).catch((err) => {
    throw (err)
  })
}

const addressEditGET = async (req, res) => {
  try {
    let editAddress = await orderHelpers.getEditAddress(req.query.addressId)
    let response = {
      editAddress: editAddress,
      status: true,
    }
    res.json({ response })

    console.log(response)
  } catch {
    throw (err)
  }
}

const addressEditPATCH = async (req, res) => {

  if (req.session.loggedIn) {
    let editedAddress = req.body
    await orderHelpers.editAddress(editedAddress).then(() => {
      res.json({ udpatedStatus: true })
    }).catch((err) => {
      throw (err)
    })
  } else {
    res.redirect('/sign-in')
  }
}

const deleteAddress = (req, res) => {

  if (req.session.loggedIn) {
    orderHelpers.deleteAddress(req.params.id).then((response) => {
      res.json({ deletedStatus: true })
    }).catch((err) => {
      throw (err)
    })

  } else {
    res.redirect('/sign-in')
  }

}

const categoryWiseShopping = async (req, res) => {

  let catId = req.params.id
  let categoryDetails = await productHelpers.viewCategories()
  let wishlistProducts = await cartHelpers.getWishlistProductDetails()
  let productByCat = await productHelpers.getProductByCatgories(catId)
  if (req.session.user) {
    let userId = req.session.user._id
    let cartCount = await cartHelpers.getCartCount(userId)

    res.render('user/categorywise', { user: req.session.user, productByCat, categoryDetails, cartCount, userheader: true, wishlistProducts, walletMoney: req.session.walletMoney })
  } else {
    res.render('user/categorywise', { productByCat, categoryDetails, userheader: true })
  }

}


const applyCoupon = (req, res) => {
  productHelpers.applyCoupon(req.body.couponCode, req.body.userId, req.body.total).then((response) => {
    let message = response.message
    let validity = response.couponValid
    console.log(response)
    res.json({ couponStatus: true, message, validity, discount: response.discountPrice, total: response.totalPriceAfterOffer, totalDetails: response.totalDetails })
  })

}
const removeCoupon = (req, res) => {
  if (req.session.loggedIn) {
    userId = req.session.user._id
    couponId = req.params.id
    console.log(couponId)

    productHelpers.removeCoupon(userId, couponId).then((response) => {
      res.redirect('/checkout')
    })
  }
}

const wishList = async (req, res) => {
  if (req.session.loggedIn) {
    let count = await cartHelpers.wishlistCount(req.session.user._id)
    console.log(count)
    let productDetails = await cartHelpers.getWishlistProductDetails(req.session.user._id)
    res.render('user/wishlist', { userheader: true, productDetails, user: req.session.user, couponCount: req.session.couponCount, coupons: req.session.coupons, walletMoney: req.session.walletMoney })
  } else {

    res.render('user/wishlist', { userheader: true })
  }
}

const addtoWishlist = (req, res) => {
  console.log('call is coming inside add to wishlist')
  if (req.session.loggedIn) {
    productId = req.params.id
    userId = req.session.user._id
    cartHelpers.addToWishlist(productId, userId).then((response) => {
      res.json({ addStatus: true, })
    })
  } else {
    res.json({ signUp: true })
  }

}

const removeProductWishlist = (req, res) => {

  cartHelpers.removeFromWishlist(req.body.userId, req.body.productId).then(() => {
    res.json({ removeStatus: true })
  })
}

const getSearchResults = async (req, res) => {

  let payload = req.body.payload.trim();
  let search = await productHelpers.searchResults(payload)
  res.json({ searchData: search })

}
const returnApproval = (req, res) => {
  console.log(req.body)
  console.log(req.body.orderId)
  console.log('call is coming here')
  orderHelpers.returnProduct(req.body.orderId, req.body.reason).then(() => {
    console.log('coming inside then')
    res.json({ returnApproval: true })
  })

}

const subcatWiseShopping = async (req, res) => {

  let categoryDetails = await productHelpers.viewCategories()
  let wishlistProducts = await cartHelpers.getWishlistProductDetails()
  let products = await productHelpers.subcatProducts(req.query.subcat, req.query.catId)
  if (req.session.loggedIn) {
    let userId = req.session.user._id
    let cartCount = await cartHelpers.getCartCount(userId)
    res.render('user/subcatshop', { userheader: true, products, categoryDetails, wishlistProducts, cartCount, couponCount: req.session.couponCount, coupons: req.session.coupons, walletMoney: req.session.walletMoney })

  } else {

    res.render('user/subcatshop', { userheader: true, products, categoryDetails, wishlistProducts })
  }

}

const paymentFail = (req, res) => {
  let { receipt } = req.body.orderId
  paymentHelpers.removeorder(receipt)
}





module.exports = {
  home,
  singinGET,
  signinPOST,
  signinOtpGET,
  signinOtpPOST,
  otpEnterPageGET,
  otpEnterPagePOST,
  signUpGET,
  signUpPOST, logOUT,
  shopNow,
  productDetailsID,
  productDetails,
  cart,
  addToCart,
  addToCartProduct,
  changeProductQuantity,
  removeCartProduct,
  checkoutGET,
  checkoutPOST,
  success,
  cancel,
  orderSuccessFull,
  verifyPayment,
  myAccount,
  editPersonal,
  editPersonalPatch,
  changePassword,
  orderHistory,
  orderDisplayId,
  cancelOrder,
  updateAddress,
  addNewAddress,
  addressEditGET,
  addressEditPATCH,
  deleteAddress,
  categoryWiseShopping,
  applyCoupon,
  removeCoupon, wishList,
  addtoWishlist,
  removeProductWishlist,
  getSearchResults,
  returnApproval,
  subcatWiseShopping,
  paymentFail,
  payUsingWallet
}