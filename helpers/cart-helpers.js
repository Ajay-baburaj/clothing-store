const db = require('../config/connection')
const objectId = require('mongodb').ObjectId
const collection = require('../config/collection')
const { ObjectID } = require('bson')
const { TrustProductsInstance } = require('twilio/lib/rest/trusthub/v1/trustProducts')
const { Collection } = require('mongodb')
const { routes } = require('../app')

module.exports = {
    addToCart: (productId, userId) => {

        let productObject = {
            item: objectId(productId),
            quantity: 1
        }

        return new Promise(async (resolve, reject) => {
    
            let cartCheck = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            console.log(cartCheck)

            if (cartCheck) {
                let productCheck = cartCheck.products.findIndex(products => products.item == productId)


                if (productCheck != -1) {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ 'products.item': objectId(productId),'user':objectId(userId) },
                        {
                            $inc: { 'products.$.quantity': 1 }
                        }).then((response) => {
                            // console.log(response)
                            resolve()
                        })
                        
                } else {

                    db.get().collection(collection.CART_COLLECTION).updateOne(
                        { user: objectId(userId) },

                        {
                            $push: { products: productObject }
                        }
                    ).then((response) => {
                        resolve()
                        // console.log(response)
                    }).catch((err)=>{
                        reject(err)
                    })
                    
                }

            } else {
                console.log('user not found we have to add ')
                let cartObject = {
                    user: objectId(userId),
                    products: [productObject]
                }

                db.get().collection(collection.CART_COLLECTION).insertOne(cartObject).then(() => {
                    resolve()
                })
            }
        })

    },
    getCartDetails: (userId) => {
        return new Promise(async (resolve, reject) => {
            try{
                let cartItems= await db.get().collection(collection.CART_COLLECTION).aggregate([
                     {
                         $match: { user: objectId(userId) }
                         // matching the user with userId in cart collection
                     },
                     {
                         $unwind:'$products'
                     },
                     {
                         $project:{
                            _id:1,
                             item:'$products.item',
                             quantity:'$products.quantity'   
                         }
                     },
                     {
                         $lookup:{
                             from: collection.PRODUCT_COLLECTION,
                             localField:'item',
                             foreignField:'_id',
                             as:'product'
                         }
                     },
                     {
                         $project:{
                            _id:1,
                             item:1,
                             quantity:1,
                             product:{$arrayElemAt:['$product',0]}
                         }
                     },
                     {
                        $lookup:{
                            from:collection.CATEGORY_COLLECTION,
                            localField:'product.category',
                            foreignField:'_id',
                            as:'categoryDetails',
                        }
                     },
                     {
                        $unwind:"$categoryDetails"
                     },
                     {
                        $addFields:{
                            categoryDiscount:{$toInt:"$categoryDetails.discount"}
                        }
                     },
                     {
                        $addFields:{
                            convertedPrice:{$toInt:'$product.price'},
                            comparedDiscount:{
                                $cond:{if:{$gt:['$product.discount','$categoryDiscount']},then:'$product.discount',else:'$categoryDiscount'}
                            }
                        }
                     },
                     {
                        $addFields:{
                            discountedPrice:{$round:[{$subtract:['$convertedPrice',{$divide:[{$multiply:['$convertedPrice','$comparedDiscount']},100]}]}]}
                        }
                     },
                     {
                         $project:{
                            _id:1,
                             item:1,
                             quantity:1,
                             product:1,
                             categoryDetails:1,
                             comparedDiscount:1,convertedPrice:1,
                             discountedPrice:1,
                            productTotal:{$multiply:['$discountedPrice','$quantity']}
                         }
                     },
     
                 ]).toArray()
                 console.log("===============")
                 console.log(cartItems)
                 console.log("===============")
                
                 resolve(cartItems)

            }catch{
                reject(err)
            }


        })


    
    },
    getCartCount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            try{
                let count = 0
                let cart = await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
    
                if(cart){
                    count = cart.products.length
                }
                resolve(count)
        }catch{
            reject(err)
        }
        })
    },
    changeProductQuantity:(details)=>{
        count = parseInt(details.count)
        // console.log(count)
        // quantity = parseInt(details.quantity)
        console.log(details.quantity)
        return new Promise(async(resolve,reject)=>{
            if(count ==-1 && details.quantity == 1){
                // console.log("api  call coming inside")
                await db.get().collection(collection.CART_COLLECTION).updateOne({_id:objectId(details.cart)},
                {
                    $pull:{products:{item:objectId(details.product)}}
                }
                ).then((response)=>{

                    resolve({removeProduct:true})
                })
            }else{

                db.get().collection(collection.CART_COLLECTION).updateOne({ 'products.item': objectId(details.product),'_id':objectId(details.cart) },
                {
                    $inc: { 'products.$.quantity': count }
                }).then((response) => {
                    
                    resolve({status:true})
                }).catch((err)=>{
                    reject(err)
                })
            } 
        
        })
    },

    getCartTotal:(userId)=>{

        // console.log('call coming')
        
        return new Promise(async (resolve, reject) => {
            try{
                let totalAmount = await db.get().collection(collection.CART_COLLECTION).aggregate([
                     {
                         $match: { user: objectId(userId) }
                         // matching the user with userId in cart collection
                     },
                     {
                         $unwind:'$products'
                     },
                     {
                         $project:{
                             item:'$products.item',
                             quantity:'$products.quantity'   
                         }
                     },
                     {
                         $lookup:{
                             from: collection.PRODUCT_COLLECTION,
                             localField:'item',
                             foreignField:'_id',
                             as:'product'
                         }
                     },
                     {
                         $project:{
                             item:1,
                             quantity:1,
                             product:{$arrayElemAt:['$product',0]}
                         }
                     },
                     {
                        $lookup:{
                            from:collection.CATEGORY_COLLECTION,
                            localField:'product.category',
                            foreignField:'_id',
                            as:'categoryDetails',
                        }
                     },
                     {
                        $unwind:"$categoryDetails"
                     },
                     {
                        $addFields:{
                            categoryDiscount:{$toInt:"$categoryDetails.discount"}
                        }
                     },
                     {
                        $addFields:{
                            convertedPrice:{$toInt:'$product.price'},
                            comparedDiscount:{
                                $cond:{if:{$gt:['$product.discount','$categoryDiscount']},then:'$product.discount',else:'$categoryDiscount'}
                            }
                        }
                     },
                     {
                        $addFields:{
                            discountedPrice:{$round:[{$subtract:['$convertedPrice',{$divide:[{$multiply:['$convertedPrice','$comparedDiscount']},100]}]}]}
                        }
                     },
                     {
                         $project:{
                             item:1,
                             quantity:1,
                             product:1,
                             categoryDetails:1,
                             comparedDiscount:1,convertedPrice:1,
                             discountedPrice:1,
                            productTotal:{$multiply:['$discountedPrice','$quantity']}
                         }
                     }
                    //  {
                    //     $addFields:{
                    //         convertedPrice:{$toInt:"$product.price"}
                    //     }
                    //  }
                    ,
                     {
                        $group:{
                            _id:null,
                            total:{$sum:'$productTotal'}
                        }
                     },
                     
                 ]).toArray()
                 console.log('==================')
                 console.log(totalAmount)
                 console.log('==================')
                    resolve(totalAmount)

            }catch{
                reject(err)
            }

 
         })
    },

    deleteProduct:(userId,productId)=>{
        
        return new Promise(async(resolve,reject)=>{
            try{

                await db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId)},
                {
                    $pull:{products:{item:objectId(productId)}}
                })
                resolve()
            }catch{
                reject(err)
            }
        })
    },
    getCartProducts:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            try{
                let cart = await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
                resolve(cart.products)
                
            }catch{
                reject(err)
            }
        })
    },
    getCouponDiscount:(userId)=>{
        console.log('call is coming inside get coupon discount')
        return new Promise(async(resolve,reject)=>{
            let totalAfterCoupon =  await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                    // matching the user with userId in cart collection
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity' ,
                        user:1  
                    }
                },
                {
                    $lookup:{
                        from: collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        item:1,
                        quantity:1,
                        product:{$arrayElemAt:['$product',0]},
                        user:1
                    }
                },
                {
                   $lookup:{
                       from:collection.CATEGORY_COLLECTION,
                       localField:'product.category',
                       foreignField:'_id',
                       as:'categoryDetails',
                   }
                },
                {
                   $unwind:"$categoryDetails"
                },
                {
                   $addFields:{
                       categoryDiscount:{$toInt:"$categoryDetails.discount"}
                   }
                },
                {
                   $addFields:{
                       convertedPrice:{$toInt:'$product.price'},
                       comparedDiscount:{
                           $cond:{if:{$gt:['$product.discount','$categoryDiscount']},then:'$product.discount',else:'$categoryDiscount'}
                       }
                   }
                },
                {
                   $addFields:{
                       discountedPrice:{$round:[{$subtract:['$convertedPrice',{$divide:[{$multiply:['$convertedPrice','$comparedDiscount']},100]}]}]}
                   }
                },
                {
                    $project:{
                        item:1,
                        quantity:1,
                        product:1,
                        categoryDetails:1,
                        comparedDiscount:1,convertedPrice:1,
                        discountedPrice:1,
                        user:1,
                       productTotal:{$multiply:['$discountedPrice','$quantity']}
                    }
                },
                {
                    $lookup:{
                        from:collection.USER_COLLECTION,
                        localField:'user',
                        foreignField:'_id',
                        as:'userDetails',
                    }
                },
                {
                    $unwind:'$userDetails'
                }
               ,
               {
                $lookup:{
                    from:collection.COUPON_COLLECTION,
                    localField:'userDetails.couponId',
                    foreignField:'_id',
                    as:'couponDetails',
                }
            },
            {
                $unwind:'$couponDetails'
            },
                {
                   $group:{
                       _id:null,
                       total:{$sum:'$productTotal'},coupon:{$push:'$couponDetails'}
                   }
                },
                {
                    $project:{
                        total:1,
                        coupon:{$arrayElemAt:['$coupon',0]}
                    }
                },
                {
                                    $addFields:{
                                        couponDiscount:{$round:{$multiply:[{$divide:[{$toInt:'$coupon.Percentage'},100]},'$total']}}
                                    }
                                },
                                {
                                    $addFields:{
                                        comparedCouponDiscount:{$cond:{if:{$gt:['$couponDiscount',2000]},then:2000,else:'$couponDiscount'}}
                                    }
                                }
                                ,
                                {
                                    $addFields:{
                                        couponDiscountedPrice:{$subtract:['$total','$comparedCouponDiscount']}
                                    }
                                },
                                    {
                                        $project:{
                                            total:1,
                                            couponDiscount:1,
                                            couponId:'$coupon._id',  
                                            couponCode:"$coupon.Code",
                                            couponDiscountedPrice:1,
                                            comparedCouponDiscount:1
                                        }
                                    }
    
                
            ]).toArray()
            console.log('------------------')
            resolve(totalAfterCoupon)
            console.log(totalAfterCoupon)
            console.log('------------------')
        })
    },
    addToWishlist:(productId,userId)=>{
       let response ={}
        
        let productObject ={item:objectId(productId)}

        return new Promise(async(resolve,reject)=>{
            let wishlistCheck = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({user:objectId(userId)})
            console.log(wishlistCheck)
            if(wishlistCheck){
                let productCheck = wishlistCheck.products.findIndex(products=>products.item ==productId)
                console.log(productCheck)
                if(productCheck != -1){
                    response.message ="Item already in wishlist"
                    await db.get().collection(collection.WISHLIST_COLLECTION).updateOne({user:objectId(userId)},
                    {
                        $pull:{products:{item:objectId(productId)}}
                    }).then(()=>{
                        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(productId)},{
                            $set:{
                                wishlist:false
                            }
                        })

                        resolve(response)
                    })
                    console.log(response)
                }else{
                    console.log('product have inserted into array')
                    db.get().collection(collection.WISHLIST_COLLECTION).updateOne({user:objectId(userId)},
                    {
                        $push:{products:productObject}
                    }).then((response)=>{
                        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(productId)},{
                            $set:{
                                wishlist:true
                            }
                        })
                        resolve()
                    })
                }

            }else{
                console.log('person not having wishlist created one')
                let wishlistObject ={
                    user:objectId(userId),
                    products:[productObject]
                }

                db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishlistObject).then(()=>{
                    resolve()
                })
            }
        })
    },
    getWishlistProductDetails:(userId)=>{
        return new Promise(async(resolve,reject)=>{
           let productDetails = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
            {
                $match:{user:objectId(userId)}
            },
            {
                $unwind:'$products'
            },
            {
                $lookup:{
                    from:collection.PRODUCT_COLLECTION,
                    localField:'products.item',
                    foreignField:'_id',
                    as:'productDetails'
                }
            },
            {
                $project:{
                    productDetails:{$arrayElemAt:['$productDetails',0]}
                }
            },
            {
                $lookup:{
                    from:collection.CATEGORY_COLLECTION,
                    localField:'productDetails.category',
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
                    convertedPrice :{$toInt:"$productDetails.price"},
                    comparedDiscount:{
                        $cond:{if:{$gt:['$productDetails.discount','$categoryDiscount']},then:'$productDetails.discount',else:'$categoryDiscount'}
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
        resolve(productDetails)
        console.log(productDetails)
        })
    },
    
    removeFromWishlist:(userId,productId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.WISHLIST_COLLECTION).updateOne({user:objectId(userId)},
            {
                $pull:{products:{item:objectId(productId)}}
            })
            resolve()
        })
    
    },

    wishlistCount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
        let wishList =    await db.get().collection(collection.WISHLIST_COLLECTION).findOne({user:objectId(userId)})
        let wishlistCount = wishList
        console.log('==========wishlst count is here========')
        console.log(wishList.products.length)
        console.log('==========wishlst count is here========')
        resolve(wishList)
        })
    },
    pendingCartCheck:(userId)=>{
        console.log('call is coming in cart Checkz')
        return new Promise(async(resolve,reject)=>{
            let cartCheck = await db.get().collection(collection.ORDER_COLLECTION).findOne({$and:[{user:objectId(userId)},{status:'pending'}]})
            console.log('call is coming here')
            console.log(cartCheck)
            console.log('call is coming here')

            if(cartCheck){
                await db.get().collection(collection.ORDER_COLLECTION).deleteOne({user:objectId(userId),status:'pending'}).then((response)=>{
                    console.log(response)
                })
                resolve()
           
            }else{
                resolve()
                
            }
        })
    }

    
    
}




