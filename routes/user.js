var express = require('express');
var router = express.Router();
const app = require('../app');

var {home,singinGET,signinPOST,signinOtpGET,signinOtpPOST,otpEnterPageGET,otpEnterPagePOST,
    signUpGET,signUpPOST,logOUT,shopNow,productDetailsID,productDetails,cart,addToCart,addToCartProduct,
    changeProductQuantity,removeCartProduct,checkoutGET,checkoutPOST,success,cancel,orderSuccessFull,verifyPayment
    ,myAccount,editPersonal,editPersonalPatch,changePassword,orderHistory,orderDisplayId,orderDisplay,cancelOrder
    ,updateAddress,addNewAddress,addressEditGET,addressEditPATCH,deleteAddress,categoryWiseShopping,applyCoupon,removeCoupon,wishList,addtoWishlist
  ,removeProductWishlist,getSearchResults,returnApproval} = require('../controller/userController')

var{productListPageNation} =require('../middlewares/middleware')
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
router.get('/',userFalse,home)

// sign-in-page-
router.route('/sign-in')
    .get(userTrue,singinGET)
    .post(signinPOST)

router.route('/signin/otp')
    .get(userTrue,signinOtpGET)
    .post(signinOtpPOST)

router.route('/otp/enter')
    .get(userTrue,otpEnterPageGET)
    .post(otpEnterPagePOST)

//sign-up-page
router.route('/sign-up')
    .get(userTrue,signUpGET)
    .post(signUpPOST)

// logout
router.get('/logout',logOUT)
  
// shop-now
router.get('/shop/now',productListPageNation,shopNow)

// product_details_page
router.get('/product-details/:id',productDetailsID)
router.get('/product-details',productDetails)

// cart
router.get('/cart',cart)
router.get('/add-to-cart/:id',addToCart)
router.get('/add-to-cart/product/:id',addToCartProduct)
router.put('/change-product-quantity',changeProductQuantity)
router.delete('/remove/cart/product',removeCartProduct)
router.post('/apply/coupon/',applyCoupon)
router.get('/remove/coupon/:id',removeCoupon)

// =========checkout=========
router.get('/checkout',checkoutGET)
router.post('/checkout',checkoutPOST)
router.get('/success', success);
router.get('/cancel', cancel);
router.get('/order-succesfull',orderSuccessFull)
router.post('/verify-payment', verifyPayment)

//============ profile===========
router.get('/my-account',myAccount)
router.route('/edit/personal')
    .get(editPersonal)
    .patch(editPersonalPatch)
router.put('/change/password',changePassword)

//=========wishList=========
router.get('/wishlist',wishList)
router.get('/addto/wishlist/:id',addtoWishlist)
router.patch('/remove/product/wishlist',removeProductWishlist)

//==========order history==========
router.get('/order-history',orderHistory)
router.get('/order-display/:id',orderDisplayId)
router.get('/order-display',orderDisplay)
router.patch('/cancel-order',cancelOrder)
router.post('/return/approval',returnApproval)

// ==========address section===========
router.get('/address-update',updateAddress)
router.post('/add-new-address',addNewAddress)
router.get('/address/edit',addressEditGET)
router.patch('/address/edit',addressEditPATCH)
router.delete('/address/delete/:id',deleteAddress)

//==========categorywise=============
router.get('/category-wise-shop-now/:id',categoryWiseShopping),

//=================search===================
router.post('/product/search',getSearchResults)






















// --------------------------------------------














module.exports = router;

