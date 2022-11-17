var express = require('express');
var router = express.Router();
const {upload }  = require('../public/javascripts/fileUpload');

var { verifyLogin, adminTrue } = require('../middlewares/middleware')
var { dashboard, loginGET, loginPost, userListing, blockUser, 
    unblockUser, productListing, addProductsGET,addProductPOST, 
    editProductGET, editProductPOST,deleteProduct, categoryListing, 
    subcategoryListing, addSubCategory, editSubCatGET, editSubCatPOST, 
    deletesubCat, logout, orderDetials, orderViewMore, orderStatusChange,salesReport ,
    offerManagementGET,addOffer,categoryOffer,couponManageGET,addCoupon,editCoupon,deleteCoupon,removeProductOffer,categoryOfferRemoval,returnOrder,approveReturn
    ,bannerManagement,addBanner,editBanner,deleteBanner} = require('../controller/adminController');





//admin dashboard
router.get('/', verifyLogin, dashboard)

//login page
router.route('/login')
  .get(adminTrue, loginGET)
  .post(loginPost)

//user management
router.get('/user', verifyLogin, userListing)
router.put('/block/user', verifyLogin, blockUser)
router.put('/unblock/user', verifyLogin, unblockUser)

//product management
router.get('/products', verifyLogin, productListing)

router.route('/add/products')
  .get(verifyLogin, addProductsGET)
  .post(verifyLogin, upload.array('image'), addProductPOST)

router.route('/edit/product/')
  .get(verifyLogin, editProductGET)
  .post(verifyLogin, upload.array('image'),editProductPOST)

router.delete('/delete/product', deleteProduct)

//category management 
router.get('/category', verifyLogin, categoryListing)
router.get('/subcategories/:id', verifyLogin, subcategoryListing)
router.post('/add/subcategory', verifyLogin, addSubCategory)

router.route('/edit/subcat/')
  .get(verifyLogin, editSubCatGET)
  .put(verifyLogin, editSubCatPOST)
router.delete('/delete/subcat', verifyLogin, deletesubCat)

// order management
router.get('/order/management', verifyLogin, orderDetials)
router.get('/view/more/:id', verifyLogin, orderViewMore)
router.patch('/status/change', verifyLogin, orderStatusChange)

//sales report
router.get('/sales/report',verifyLogin,salesReport)

//offer management
router.get('/offer/management',verifyLogin,offerManagementGET)
router.post('/add/offer',addOffer)
router.post('/add/offer/category',categoryOffer)
router.delete('/remove/offer/',removeProductOffer)
router.patch('/remove/category/offer/',categoryOfferRemoval)


// coupon management

router.get('/coupon/management',verifyLogin,couponManageGET)
router.post('/add/coupon',addCoupon)
router.patch('/edit/coupon',editCoupon)
router.delete('/delete/coupon',deleteCoupon)

//return order

router.get('/return/order',verifyLogin,returnOrder)
router.post('/approve/return',approveReturn)

//banner management
router.get('/banner/management',verifyLogin,bannerManagement)
router.post('/add/banner/',upload.array('image'),addBanner)
router.post('/edit/banner/:id',upload.array('image'),editBanner)
router.get('/delete/banner/',deleteBanner)



//logout
router.get('/logout', logout)


module.exports = router;













