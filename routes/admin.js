var express = require('express');
var router = express.Router();
const { upload } = require('../public/javascripts/fileUpload');

var { adminFalse, adminTrue } = require('../middlewares/middleware')
var { dashboard, loginGET, loginPost, userListing, blockUser, 
    unblockUser, productListing, addProductsGET,addProductPOST, 
    editProductGET, editProductPOST,deleteProduct, categoryListing, 
    subcategoryListing, addSubCategory, editSubCatGET, editSubCatPOST, 
    deletesubCat, logout, orderDetials, orderViewMore, orderStatusChange,salesReport ,
    offerManagementGET,addOffer,categoryOffer,couponManageGET,addCoupon,editCoupon,deleteCoupon,removeProductOffer,categoryOfferRemoval,returnOrder,approveReturn
    ,bannerManagement,addBanner,editBanner,deleteBanner} = require('../controller/adminController');





//admin dashboard
router.get('/', adminFalse, dashboard)

//login page
router.route('/login')
  .get(adminTrue, loginGET)
  .post(loginPost)

//user management
router.get('/user', adminFalse, userListing)
router.put('/block/user', adminFalse, blockUser)
router.put('/unblock/user', adminFalse, unblockUser)

//product management
router.get('/products', adminFalse, productListing)

router.route('/add/products')
  .get(adminFalse, addProductsGET)
  .post(adminFalse, upload.array('image'), addProductPOST)

router.route('/edit/product/')
  .get(adminFalse, editProductGET)
  .post(adminFalse, upload.array('image'),editProductPOST)

router.delete('/delete/product', deleteProduct)

//category management 
router.get('/category', adminFalse, categoryListing)
router.get('/subcategories/:id', adminFalse, subcategoryListing)
router.post('/add/subcategory', adminFalse, addSubCategory)

router.route('/edit/subcat/')
  .get(adminFalse, editSubCatGET)
  .put(adminFalse, editSubCatPOST)
router.delete('/delete/subcat', adminFalse, deletesubCat)

// order management
router.get('/order/management', adminFalse, orderDetials)
router.get('/view/more/:id', adminFalse, orderViewMore)
router.patch('/status/change', adminFalse, orderStatusChange)

//sales report
router.get('/sales/report',adminFalse,salesReport)

//offer management
router.get('/offer/management',adminFalse,offerManagementGET)
router.post('/add/offer',adminFalse,addOffer)
router.post('/add/offer/category',categoryOffer)
router.delete('/remove/offer/',removeProductOffer)
router.patch('/remove/category/offer/',categoryOfferRemoval)


// coupon management

router.get('/coupon/management',adminFalse,couponManageGET)
router.post('/add/coupon',addCoupon)
router.patch('/edit/coupon',editCoupon)
router.delete('/delete/coupon',deleteCoupon)

//return order

router.get('/return/order',adminFalse,returnOrder)
router.post('/approve/return',approveReturn)

//banner management
router.get('/banner/management',adminFalse,bannerManagement)
router.post('/add/banner/',upload.array('image'),addBanner)
router.post('/edit/banner/:id',upload.array('image'),editBanner)
router.get('/delete/banner/',deleteBanner)



//logout
router.get('/logout', logout)


module.exports = router;










// router.post('/subcat-update-dropdown',async(req,res)=>{

//   let subcatArray = await producthelpers.getSubcategories(req.body.catId)
//   let subcat = subcatArray.subcategory
//   console.log(subcat)
//   res.json({subcat})
// })






