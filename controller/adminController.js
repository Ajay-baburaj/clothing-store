var adminUserHelpers = require('../helpers/admin-user-helper')
var producthelpers = require('../helpers/product-helpers');
const { upload }=require('../public/javascripts/fileUpload');
const productHelpers = require('../helpers/product-helpers');
const orderHelpers = require('../helpers/order-helpers');
const charthelpers = require('../helpers/chart-helpers')
require('dotenv').config()

console.log(process.env.ADMIN_EMAIL)



const credentials = {
  email:process.env.ADMIN_EMAIL,
  password:process.env.ADMIN_PASSWORD
}



// sign in

const dashboard =async(req,res,next)=>{
  try{
    let weeklyTotal = await charthelpers.getDailySalesTotal()
    let topSelling = await charthelpers.topSellingProducts()
    let categoryWiseSales = await charthelpers.categoryWiseSales()
    let chartDetails =   await charthelpers.getTotalSalesGraph()
    let paymentDetails = await charthelpers.getPaymentWiseGraph()
    let dailysale = await charthelpers.getDailySalesNumber()
    
    res.render('admin/dashboard',{adminheader:true,chartDetails,paymentDetails,categoryWiseSales,topSelling,weeklyTotal,dailysale})
  }catch (err){
    next(err)
  }
  
  }

  const loginGET = (req,res)=>{
    try{
      if(req.session.loggedinErr){
    
        res.render('admin/login',{loggedinErr:req.session.loggedinErr})
        req.session.loggedinErr =''
      }
      res.render('admin/login')
    }catch (err){
      throw(err)
    }
  }

  const loginPost = (req,res)=>{
    try{
      if(req.body.email == credentials.email && req.body.password==credentials.password){
        console.log("heyy its form dkhkdkcj")
        
        req.session.adminloggedIn = true;
        req.session.admin = req.body;
        res.redirect('/admin')
      }else{
        req.session.loggedinErr = "invalid username or password";
        res.redirect('/admin/login')
        console.log(credentials)
      }
    }catch (err){
      throw(err)
    }

}


const userListing = (req,res)=>{
  adminUserHelpers.signupUserInfo().then((response)=>{
    res.render('admin/admin-user',{response,adminheader:true})
  }).catch((err)=>{
    throw(err)
  })
}

const blockUser = async(req,res)=>{
  adminUserHelpers.blockUser(req.query.userId).then(()=>{
    res.json({status:true})
  }).catch((err)=>{
    throw(err)
  })
}


const unblockUser = async(req,res)=>{
  try{
    await adminUserHelpers.unblockUser(req.query.userId).then(()=>{
      console.log('call is coming here')
      res.json({status:true})
    })
  }
  catch{
    throw(err)
  }
}
const productListing = (req, res) => {
  try {
    producthelpers.viewAllProducts().then((products) => {
      console.log(products)
      res.render('admin/products', { products, adminheader: true })
    })
  }
  catch {
    throw(err)
  }
}

const addProductsGET = async(req,res)=>{
  try{
    
      let categories = await producthelpers.viewCategories()
    
      console.log("hey categories is here")
      console.log(categories)
      
        res.render('admin/add-products',{adminheader:true,categories})

  }catch{
    throw(err)
  }
  
}

const addProductPOST = (req,res)=>{
  try{

    // console.log(req.files.image)
    const files = req.files
      const file = files.map((file)=>{
          return file
      })
      const fileName = file.map((file)=>{
          return file.filename
      })
      const product = req.body
      product.img = fileName
  
    producthelpers.addProduct(product).then((data)=>{
      res.redirect('/admin/products')
    })
  }
  catch{
    throw(err)
    
  }
 
 

}

const editProductGET = async(req,res)=>{
  try{
    const productId = req.query.productId
    // productHelpers.getProductDetailsNew(productId)
    const product = await producthelpers.getProductDetailsNew(productId)
    const productDetails = product[0]
    
    res.render('admin/edit-products',{productDetails,adminheader:true})
  }
  catch{
    throw(err)
    
  }
}

 const editProductPOST =(req,res)=>{
  try{
    console.log(req)
    console.log(req.files)
    console.log(req.body)
    const files = req.files
      const file = files.map((file)=>{
          return file
      })
      const fileName = file.map((file)=>{
          return file.filename
      })
      const product = req.body
      product.img = fileName
   
    producthelpers.updateProduct(req.body).then(()=>{
      
      res.redirect('/admin/products')
    })
  }
  catch{
    console.log(err)
    throw err
  }

}

const deleteProduct = (req,res)=>{
  try{
    var productId = req.query.productId
    producthelpers.deleteProducts(productId).then((response)=>{
     res.json({status:true})
    })
  }
  catch{
    throw(err)
  }

 }

 const categoryListing = async(req,res)=>{
  try{
    let categories = await producthelpers.viewCategories()
    console.log(categories)
    res.render('admin/category',{categories,adminheader:true})

  }catch{
    throw(err)
  }
}

const subcategoryListing = async(req,res)=>{
try{
  let categoryId = req.params.id
  let subCategories = await productHelpers.getSubcategories(categoryId)
  console.log(subCategories)
  res.render('admin/subcategory',{subCategories,categoryId,adminheader:true})

}catch{
  throw(err)
}

}

const addSubCategory = (req,res)=>{
  try{
    productHelpers.addSubCategory(req.body).then((response)=>{
      res.redirect('/admin/subcategories/'+req.body.catId)
    })
  }
  catch{
    throw(err)
  }
  
  }
 const editSubCatGET = (req,res)=>{
  try{

    let catId = req.query.id
    let subcat = req.query.subcat 
    res.render('admin/edit-sub-cat',{subcat,catId,adminheader:true})
  }catch{
    throw(err)
  }

} 

const editSubCatPOST = (req,res)=>{
  try{
    
    let catId = req.body.catId
    productHelpers.editSubCategory(req.body).then((response)=>{
      res.json({status:true,catId})
      
    })
  }catch{
    throw(err)
  }
}

const deletesubCat = (req,res)=>{
  let catId = req.body.catId
  let subcat = req.body.subcat
  producthelpers.deleteCategory(catId,subcat).then((response)=>{
    res.json({status:true})
  }).catch((err)=>{
    throw(err)
  })
}

const logout = (req,res)=>{
  req.session.adminloggedIn=false;
  req.session.admin=null
  res.redirect('/admin/login')
}

const orderDetials = async(req,res)=>{
  try{
    let orderArrray =  await orderHelpers.adminOrderArray()
    // console.log('===============order array is here=============')
    // console.log(orderArrray)
    // console.log('===============order array is here=============')

    res.render('admin/order-management',{orderArrray,adminheader:true})

  }catch{
    throw(err)
  }
 }

 const orderViewMore = async(req,res)=>{
  try{
    let orderId = req.params.id
    let address = await orderHelpers.getAddress(orderId)
    // let orderTotal = await orderHelpers.displayOrderTotal(orderId)
    let orderTotal = await orderHelpers.getOrderTotal(orderId)
    let orderDetials = await orderHelpers.displayOrderDetials(orderId)
    // console.log('=============order details============')
    // console.log(orderDetials)
    // console.log('=============order details============')

  
    res.render('admin/order-view-more',{address,orderTotal,adminheader:true,orderDetials})
  }catch{
    throw(err)
  }
}

const orderStatusChange = (req,res)=>{
  try{
    orderHelpers.statusChange(req.body).then(()=>{
      console.log('==========req body is here===========')
      console.log(req.body)
      res.json({status:true})
    })
  }catch(err){
    next(err)
  }
}

const salesReport = async(req,res)=>{
  let chartDetails =   await charthelpers.getTotalSalesGraph()
  console.log(chartDetails)
  let weeklyTotal = await charthelpers.getDailySalesTotal()
  res.render('admin/sales-report',{adminheader:true,weeklyTotal,chartDetails})
}



const offerManagementGET = async(req,res)=>{
  let category = await productHelpers.viewCategories()
  let products = await productHelpers.viewAllProducts()
  console.log(category)
  res.render('admin/offer-management',{adminheader:true,products,category})
}

const addOffer =(req,res)=>{
  console.log('call is coming here')
  console.log(req.body)
  let percentage = req.body.discountVal
  productHelpers.addProductOffers(req.body.productId,req.body.discountVal).then(()=>{
    res.json({status:true,percentage})  
  })
}

const categoryOffer = (req,res)=>{
 
  productHelpers.addCategoryOffers(req.body.catId,req.body.discountVal).then(()=>{
    res.json({status:true})
  }).catch((err)=>{
    return res.status(400).json({
      status: false,
      message: "invalid order",
  
  });
  })
}

const couponManageGET =async(req,res)=>{
  console.log('call is comining inside the root')
  let coupons = await productHelpers.viewCoupons()
  res.render('admin/coupon-management',{adminheader:true,coupons})
}

const addCoupon = (req,res)=>{
  console.log(req.body)
  productHelpers.createNewCoupon(req.body).then((response)=>{
    res.redirect('/admin/coupon/management')
  })
}

const editCoupon = async(req,res)=>{
  console.log('call is coming')
  // console.log(req.body)
  await productHelpers.editCoupon(req.body).then((response)=>{
    res.json({status:true})
  })
}

const deleteCoupon = (req,res)=>{
  console.log('call is coming here')
  console.log(req.body)
  productHelpers.deleteCoupon(req.body.couponId).then((response)=>{
    res.json({deleteStatus:true})
  })
}

const removeProductOffer = (req,res)=>{
  productId = req.query.proId

  productHelpers.removeProductOffer(productId).then(()=>{
    res.json({deletedStatus:true})
  })
}

const categoryOfferRemoval =(req,res)=>{
  let catId = req.query.catId
  productHelpers.removeCategoryOffer(catId).then(()=>{
    res.json({categoryRemove:true})
  })
}

const returnOrder =async(req,res)=>{

  let returnOrders = await orderHelpers.returnProductApproval()

  let returnApprovedProducts = await orderHelpers.returnApprovedProducts()

  res.render('admin/return-product',{adminheader:true,returnOrders,returnApprovedProducts})
}


const approveReturn = (req,res)=>{

  let userId =req.query.userId
  let total = parseInt(req.query.total)

  orderHelpers.returnApproved(req.query.orderId,userId,total).then(async(response)=>{
  
    await orderHelpers.getOrderProductQuantity(req.query.orderId).then((data) => { 
      data.forEach((element) => {
        orderHelpers.updateStockIncrease(element);
      });
    });
    res.json({approvedStatus:true})

  })
}

const bannerManagement = async(req,res)=>{
  try{
    let banners = await productHelpers.getAllBanners()
    res.render('admin/banner',{adminheader:true,banners})

  }catch(err){
    next(err)
  }


}


const addBanner = (req,res)=>{
  console.log('call is coming here')
  const files = req.files
  const file = files.map((file) => {
    return file
  })
  const fileName = file.map((file) => {
    return file.filename
  })
  const banner = req.body
  banner.img = fileName
   console.log(req.body)
  productHelpers.addBanner(banner).then(() => {
      res.redirect('/admin/banner/management')
  })

}

const editBanner = (req,res)=>{
  console.log('call is coming here')

  const files = req.files
  const file = files.map((file) => {
    return file
  })
  const fileName = file.map((file) => {
    return file.filename
  })
  const banner = req.body
  const bannerId = req.params.id
  banner.img = fileName

  productHelpers.editBanner(bannerId,banner).then((response)=>{
      res.redirect('/admin/banner/management')
  }).catch((err)=>{
    next(err)
  })

}

const deleteBanner = (req,res)=>{
  try{
    console.log('call is coming insde delete')
    console.log(req.query.bannerId)
    productHelpers.deleteBanner(req.query.bannerId).then(()=>{
      res.json({deleteBannerStatus:true})
    })

  }catch(err){
    next(err)
  }
}


  module.exports={
    dashboard,
    loginGET,
    loginPost,
    userListing,
    blockUser,
    unblockUser,
    productListing,
    addProductsGET,
    addProductPOST,
    editProductGET,
    editProductPOST,
    deleteProduct,
    categoryListing,
    subcategoryListing,
    addSubCategory,
    editSubCatGET,
    editSubCatPOST,
    deletesubCat,
    logout,
    orderDetials,
    orderViewMore,
    orderStatusChange,
    salesReport,
    offerManagementGET,
    addOffer,
    categoryOffer,
    couponManageGET,
    addCoupon,
    editCoupon,
    deleteCoupon,
    removeProductOffer,
    categoryOfferRemoval,returnOrder,approveReturn,
    bannerManagement,
    addBanner,
    editBanner,
    deleteBanner
  }