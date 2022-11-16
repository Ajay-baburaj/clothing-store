const { format } = require("morgan")
const productHelpers = require('../helpers/product-helpers')
const collection = require('../config/collection')
const db =require('../config/connection')

const adminTrue = function(req,res,next){
    if(req.session.adminloggedIn){
      res.redirect('/admin')
    }
    next()
  }

const adminFalse =  function (req,res,next){
  if(!req.session.adminloggedIn){
    res.redirect('/admin/login')
  }
  next()
}

const productListPageNation = async(req,res,next)=>{
  console.log('query is coming --------------')
    console.log(req.query.page)

    const page = parseInt(req.query.page)
    const limit = 11

    const startIndex = (page-1)*limit
    const endIndex = page*limit

    const results = {}
    let productsCount = await productHelpers.getProductsCount()

    if(endIndex <productsCount){
      results.next = {
        page:page+1,
        limit:limit
      }
    }

    if(startIndex > 0){
      results.previous = {
        page:page-1,
        limit:limit
      }
    }

    results.products=await productHelpers.getPagenatedResult(limit,startIndex)
    results.pageCount = Math.ceil(parseInt(productsCount)/parseInt(limit)).toString()
    results.pages =Array.from({length:results.pageCount},(_,i)=> i+1)
    results.currentPage= page.toString()
    results.limit = limit
    results.startIndex = startIndex
    res.getPaginatedResult = results
    next()

}

module.exports={
    adminTrue,adminFalse,productListPageNation
} 


  