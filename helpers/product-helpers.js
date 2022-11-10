const { ObjectID } = require('bson')
const { NetworkContext } = require('twilio/lib/rest/supersim/v1/network')
const { response } = require('../app')
const collection = require('../config/collection')
const db =require('../config/connection')
var objectId = require('mongodb').ObjectId

module.exports={
    
    addProduct:(products)=>{
        console.log(products)
        return new Promise(async(resolve,reject)=>{
            try{
                products.category = objectId(products.category)
               const addedProduct = await db.get().collection('products').insertOne(products)
               resolve(addedProduct)
            }catch{
                reject(err)
            }
        })
    },

    viewAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
           
                const products =  await db.get().collection('products').aggregate([{
                    $lookup:{
                        from:collection.CATEGORY_COLLECTION,
                        localField:'category',
                        foreignField:'_id',
                        as:"categoryDetails"
    
                    },
                },
                {
                    $unwind:'$categoryDetails'
                },
                {
                    $addFields:{
                        categoryDiscount:{$toInt:'$categoryDetails.discount'}
                    }
                },
                {
                    $addFields :{
                        convertedPrice :{$toInt:"$price"},
                        comparedDiscount:{
                            $cond:{if:{$gt:['$discount','$categoryDiscount']},then:'$discount',else:'$categoryDiscount'}
                        },
                    }
                },
                {
                    $addFields:{
                        
                        discountedPrice:{$round:[{$subtract:['$convertedPrice',{$multiply:[{$divide:['$comparedDiscount',100]},'$convertedPrice']}]}
                    ]}
                    }
                }
                // {
                //     $project:{
                //         _id:1,
                //         name:1,
                //         category:1,
                //         price:  1,
                //         subCategory:1,
                //         categoryDetails:1,
                //         discount:1,
                //         img:1,
                //         comparedDiscount:1,
                //         discountedPrice:{$round:[{$subtract:['$convertedPrice',{$multiply:[{$divide:['$comparedDiscount',100]},'$convertedPrice']}]}
                //     ]}
                //     }
                // }
            ]).toArray()
            // console.log('====================================')
            // console.log(products)
            // console.log(products)
                resolve(products)

           
        })
    },
    deleteProducts:(productId)=>{
        return new Promise((resolve,reject)=>{
            try{
                console.log(objectId(productId))
                db.get().collection('products').deleteOne({_id:objectId(productId)}).then((response)=>{
                    // console.log(response)
                    resolve(response)
                })

            }catch{
                reject(err)
            }
        })
    },
    getProductDetails:(productId)=>{
        return new Promise (async(resolve,reject)=>{
            // try{
            let productDetails=    await db.get().collection('products').aggregate([
                    {
                       $match:{ _id:objectId(productId)}
                    },
                    {
                        $lookup:{
                            from:collection.CATEGORY_COLLECTION,
                            localField:'category',
                            foreignField:'_id',
                            as:"categoryDetails"
        
                        },
                    },
                    {
                        $unwind:'$categoryDetails'
                    },
                    {
                        $addFields:{
                            categoryDiscount:{$toInt:'$categoryDetails.discount'}
                        }
                    },
                    {
                        $addFields :{
                            convertedPrice :{$toInt:"$price"},
                            comparedDiscount:{
                                $cond:{if:{$gt:['$discount','$categoryDiscount']},then:'$discount',else:'$categoryDiscount'}
                            },
                        }
                    },
                    {
                        $addFields:{
                            discountedPrice:{$round:[{$subtract:['$convertedPrice',{$multiply:[{$divide:['$comparedDiscount',100]},'$convertedPrice']}]}
                        ]}
                        }
                    }
                ]).toArray()
                productDetails = productDetails[0]
                resolve(productDetails)
               
        })
    },

    getProductDetailsNew:(productId)=>{
        return new Promise(async(resolve,reject)=>{
            try{
                let productDetails = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                    {
                        $match:{_id:objectId(productId)}
                    },
                    {
                        $lookup:{
                            from:collection.CATEGORY_COLLECTION,
                            localField:'category',
                            foreignField:'_id',
                            as:"categoryName"
                        }
                    },{
                        $unwind:'$categoryName'
                    }
                ]).toArray()
               
                resolve(productDetails)
            }catch{
                reject(err)
            }
        })
    },

    updateProduct:(productDetails)=>{
        return new Promise (async(resolve,reject)=>{
            await db.get().collection('products').updateOne({_id:objectId(productDetails.productId)},{$set:{
                category:objectId(productDetails.category),
                name:productDetails.name,
                subCategory:productDetails.subCategory,
                description:productDetails.description,
                price:productDetails.price,
                img:productDetails.img,
                quantity:parseInt(productDetails.quantity)
            }
        }).then((response)=>{
            resolve()
        }).catch((err)=>{
            reject(err)
        })
        })
    },
    addSubCategory:(reqBody)=>{
        return new Promise(async(resolve,reject)=>{
            try{

                await db.get().collection('category').updateOne({_id:objectId(reqBody.catId)},
                {
                 $addToSet:{subcategory:reqBody.catVal}
                })
                 resolve()
            }catch{
                reject(err)
            }

        })
    },

    deleteCategory:(catId,subcat)=>{
        return new Promise(async(resolve,reject)=>{
            try{
                await db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:objectId(catId)},
                {
                    $pull:{'subcategory':subcat}
                })
                resolve()

            }catch{
                reject(err)
            }
        })
    },

    viewCategories:()=>{
        return new Promise(async(resolve,reject)=>{
            try{
                let categories = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
                resolve(categories)
            }catch{
                reject(err)
            }
        })
    },

    getSubcategories:(catId)=>{
        return new Promise(async(resolve,reject)=>{
            try{
                let subCategory = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:objectId(catId)})
                resolve(subCategory)
            }catch{
                reject(err)
            }
        })
    },

    editSubCategory:(reqBody)=>{
        return new Promise(async(resolve,reject)=>{
            try{

                await db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:objectId(reqBody.catId),'subcategory':reqBody.filter},
                {
                    $set:{'subcategory.$':reqBody.editedSubCat}
                }
                )
                resolve()
            }catch{
                reject(err)
            }
        })
    },

    getProductByCatgories:(catId)=>{
        return new Promise((resolve,reject)=>{
            try{

                let productsByCat = db.get().collection(collection.PRODUCT_COLLECTION).find({category:objectId(catId)}).toArray()
                resolve(productsByCat)
            }catch{
                reject(err)
            }
        })
    },
    getProductsBySubCat:(subcat,productId,category)=>{
        return new Promise(async(resolve,reject)=>{
            try{
                let getProductsBySubcat = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                    {
                        $match:{subCategory:subcat}
                    },
                    {
                        $match : {_id : {$nin : [objectId(productId)]}}
                    },
                    {
                        $match:{category:{$in:[(category)]}}
                    }
                ]).toArray()
                resolve(getProductsBySubcat)
            }catch{
                // reject(err)
            }
        })
    },

    addProductOffers:(productId,discountVal)=>{
        discountVal =parseInt(discountVal)
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
                {_id:objectId(productId)},
                {
                $set:{
                    'discount': discountVal,
                }
            }).then((response)=>{
                resolve(response)

            }).catch((err)=>{
                reject(err)
                console.log(err)
            })
        })
    },
    addCategoryOffers:(catId,value)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:objectId(catId)},
            {
                $set:{
                    discount:value
                }
            }).then(()=>{
                resolve()
            }).catch((error)=>{
                console.log(error)
            })
            
        })
    },
    createNewCoupon:(reqBody)=>{
        return new Promise(async(resolve,reject)=>{
            try{

                await db.get().collection(collection.COUPON_COLLECTION).insertOne(reqBody).then((response)=>{
                    resolve(response)
                })
            }catch(error){
                reject(err)
                throw(err)
            }
        })
    },
    viewCoupons:()=>{
        return new Promise(async(resolve,reject)=>{
            try{
            let coupons= await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
                resolve(coupons)
            }catch{
                throw(err)
            }
        })
    },
    editCoupon:(reqBody)=>{
        console.log(reqBody)
        return new Promise(async(resolve,reject)=>{
            let coupons = await db.get().collection(collection.COUPON_COLLECTION).updateOne({_id:objectId(reqBody.couponId)},
                {
                    $set:{
                        Name:reqBody.Name,
                        Code:reqBody.Code,
                        Percentage:reqBody.Percentage,
                        Description:reqBody.Description,
                        Date:reqBody.Date
                    }
                }).then((response)=>{
                    console.log(response)
                    resolve(response)
                }).catch((err)=>{
                    console.log(err)
                })
                

               
            
        })
    },
    deleteCoupon:(couponId)=>{
        return new Promise(async(resolve,reject)=>{
            console.log('Call is coming here inside promise')
           await db.get().collection(collection.COUPON_COLLECTION).deleteOne({_id:objectId(couponId)}).then((data)=>{
            console.log(data)
            resolve(data)
           })
        })
    },

    applyCoupon:(code,userId,total)=>{
        let response = {}

        let d = new Date()
            let month  =''+(d.getMonth()+1)
            let day = ''+d.getDate()
            let year = d.getFullYear()

            if(month.length < 2)
                month = '0'+ month;
            if(day.length < 2)
                day ='0'+day; 

        let time = [year,month,day].join('-')
        console.log(code,total,userId)  

        return new Promise(async(resolve,reject)=>{
            let couponFind = await db.get().collection(collection.COUPON_COLLECTION).findOne({Code:code})
            console.log(couponFind)
            if(couponFind){
                response.couponFind=true
                let currentDate= time
                console.log(currentDate)
                console.log(couponFind.Date)
                if(currentDate>couponFind.Date){
                    response.expiredCoupon=true
                    response.couponValid=false
                    response.message="Sorry, Coupon is expired"
                    console.log(response.couponExpired)
                    resolve(response)
                }else{
                    response.expiredCoupon=false
                   let couponAlreadyApplied = await db.get().collection(collection.APPLIED_COUPON_COLLECTION).findOne({userId:objectId(userId), couponId:couponFind._id})
                    if(couponAlreadyApplied){
    
                        response.appliedCoupon=true
                        response.couponValid=false
                        response.message="Coupon already Applied"
                        resolve(response)
                        
                    }else{
                        response.appliedCoupon=false
                        response.couponValid = true
                        response.message="Coupon Successfully applied"
                      let  couponDiscountpercentage = parseInt(couponFind.Percentage)
                      let  discountPrice=Math.round((couponDiscountpercentage/100)*parseInt(total))
                      let totalPriceAfterOffer=total-discountPrice
                      response.totalPriceAfterOffer=totalPriceAfterOffer
                      response.discountPrice=discountPrice
    
                        appliedCouponObj={
                            userId:objectId(userId),
                            couponId:couponFind._id
                        }

                //   let totalCheck = await db.get().collection(collection.CART_COLLECTION).aggregate([
                //             {
                //                 $match: { user: objectId(userId) }
                //                 // matching the user with userId in cart collection
                //             },
                //             {
                //                 $unwind:'$products'
                //             },
                //             {
                //                 $project:{
                //                     item:'$products.item',
                //                     quantity:'$products.quantity',
                //                     discount:1
                                       
                //                 }
                //             },
                //             {
                //                 $lookup:{
                //                     from: collection.PRODUCT_COLLECTION,
                //                     localField:'item',
                //                     foreignField:'_id',
                //                     as:'product'
                //                 }
                //             },
                //             {
                //                 $project:{
                //                     item:1,
                //                     quantity:1,
                //                     product:{$arrayElemAt:['$product',0]}
                //                 }
                //             },
                //             {
                //                $addFields:{
                //                    convertedPrice:{$toInt:"$product.price"}
                //                }
                //             },
                //             {
                //                $group:{
                //                    _id:null,
                //                    total:{$sum:{$multiply:['$quantity','$convertedPrice']}}
                //                }
                //             },
                //             {
                //                 $set:{
                //                     couponDiscount:code
                //                 }
                //             },
                //             {
                //                 $lookup:{
                //                     from:collection.COUPON_COLLECTION,
                //                     localField:'couponDiscount',
                //                     foreignField:'Code',
                //                     as:'couponDetails'
                //                 }
                //             },
                //             {
                //                 $unwind:'$couponDetails'
                //             },
                //             {
                //                 $addFields:{
                //                     couponDiscount:{$round:{$multiply:[{$divide:[{$toInt:'$couponDetails.Percentage'},100]},'$total']}}
                //                 }
                //             },
                //             {
                //                 $addFields:{
                //                     couponDiscountedPrice:{$subtract:['$total','$couponDiscount']}
                //                 }
                //             },
                //             {
                //                 $project:{
                //                     total:1,
                //                     couponDiscount:1,
                //                     couponCode:"$couponDetails.Code",
                //                     couponDiscountedPrice:1
                //                 }
                //             }
                //         ]).toArray()
                        // response.totalDetails = totalCheck
                    
                        // console.log('heyyaa total is here')
                        // console.log(totalCheck)
                        // console.log('heyyaa total is here')

                        db.get().collection(collection.APPLIED_COUPON_COLLECTION).insertOne(appliedCouponObj)
                            resolve(response)
                        db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},
                            {
                                $set:{couponId:couponFind._id}
                        },{upsert:true}
                        ).then((response)=>{
                            // console.log('===================')
                            // console.log(response)
                            // console.log('===================')
                        })
                        
                    }
                }
            }else{
                response.couponFind=false
                response.couponValid=false
                response.message="Invalid Coupon"
                resolve(response)
            }
        
        })
    },
    removeCoupon:(userId,couponId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.APPLIED_COUPON_COLLECTION).deleteOne({userId:objectId(userId),couponId:objectId(couponId)}).then(()=>{
                db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},
                {
                    $unset:{
                        couponId:''
                    }
                })
            })
            resolve()
            
        })
    },

    orderSuccessCouponRemove:(userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},
            {
                $unset:{
                    couponId:""
                }
            })
            resolve()
        })
    },
    removeProductOffer:(productId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(productId)},{
                $set:{
                    discount:0
                }
            })
            resolve()
        })
    },
    removeCategoryOffer:(catId) =>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:objectId(catId)},{
                $set:{
                    discount:0
                }
            })
            resolve()
        })
    },
    searchResults:(payload)=>{
        return new Promise(async(resolve,reject)=>{
        let searchResults = await db.get().collection(collection.PRODUCT_COLLECTION).find({name:{$regex: new RegExp(payload+'.*','i')}}).limit(5).toArray()
        // searchResults.slice(0,5);
        resolve(searchResults)
        console.log(searchResults)
        })
    },

    getPagenatedResult:(limit,startIndex)=>{
        console.log(limit)
        console.log(startIndex)
        limit = parseInt(limit)
        startIndex = parseInt(startIndex)
        return new Promise(async(resolve,reject)=>{
            let result = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                {
                    $skip:startIndex
                },
                {
                    $limit:limit
                },
                {
                    $lookup:{
                        from:collection.CATEGORY_COLLECTION,
                        localField:'category',
                        foreignField:'_id',
                        as:"categoryDetails"
    
                    },
                },
                {
                    $unwind:'$categoryDetails'
                },
                {
                    $addFields:{
                        categoryDiscount:{$toInt:'$categoryDetails.discount'}
                    }
                },
                {
                    $addFields :{
                        convertedPrice :{$toInt:"$price"},
                        comparedDiscount:{
                            $cond:{if:{$gt:['$discount','$categoryDiscount']},then:'$discount',else:'$categoryDiscount'}
                        },
                    }
                },
                {
                    $addFields:{
                        
                        discountedPrice:{$round:[{$subtract:['$convertedPrice',{$multiply:[{$divide:['$comparedDiscount',100]},'$convertedPrice']}]}
                    ]}
                    }
                }
                
            ]).toArray()
            resolve(result)
            console.log('-------------result is here----------')
            console.log(result)
            console.log('-------------result is here----------')
        })
    },

    getProductsCount:()=>{
        return new Promise(async(resolve,reject)=>{
        let productsCount = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            productsCount = parseInt(productsCount.length)
        resolve(productsCount)
        })
    }

}
    // addCategory:(category,value)=>{
    //     return new Promise(async(resolve,reject)=>{
    //         db.get().collection(collection.CATEGORY_COLLECTION).updateOne
    //         (
    //             {category:category},
                
    //             $addToSet:{ subcategory: value}

    //             }

    //             }
    //         })
    //     },
    


