const db = require('../config/connection')
const objectId = require('mongodb').ObjectId
const collection = require('../config/collection')

module.exports={
    placeOders:(billingDetails,products,cartTotal)=>{
        console.log('-------------------')
        console.log(cartTotal)
        console.log('-------------------')

        return new Promise(async(resolve,reject)=>{

        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();

            let status = billingDetails.paymentMethod ==="COD" ? "placed" :"pending"
            let orderObject = {

                addressId:objectId(billingDetails.addressId),
                user:objectId(billingDetails.userId),
                paymentMethod:billingDetails.paymentMethod,
                products:products,
                total:cartTotal,
                status:status,
                date:date
            }

            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObject).then((response)=>{
                db.get().collection(collection.CART_COLLECTION).deleteOne({user:objectId(billingDetails.userId)})
                // console.log('===============get order id from response=========')
                // console.log(response)
                resolve(response.insertedId)
            }).catch((err)=>{
                reject(err)
            })
            // console.log(billingDetails,products,cartTotal)
            
        })

    },
    placeOrderOnline:(billingDetails,products,cartTotal)=>{

        return new Promise(async(resolve,reject)=>{

        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();

            let status = billingDetails.paymentMethod ==="COD" ? "placed" :"pending"
            let orderObject = {

                addressId:objectId(billingDetails.addressId),
                user:objectId(billingDetails.userId),
                paymentMethod:billingDetails.paymentMethod,
                products:products,
                total:cartTotal,
                status:status,
                date:date
            }

            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObject).then((response)=>{
                resolve(response.insertedId)
            }).catch((err)=>{
                reject(err)
            })
            
        })

    },


    getOrderDetails:(userId)=>{
        try{
            return new Promise(async(resolve,reject)=>{
                let oderDetials = await db.get().collection(collection.ORDER_COLLECTION).findOne({user:objectId(userId)})
                resolve(oderDetials)
            })
        }catch{
            reject(err)
        }
    },

    getAllOrderDetails:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            try{

                let allOderDetials = await db.get().collection(collection.ORDER_COLLECTION).find({user:objectId(userId)}).sort({_id:-1}).toArray()
                console.log(allOderDetials)
                resolve(allOderDetials)
            }catch{
                reject(err)
            }

        })
    },

    displayOrderDetials:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
            try{

                let orders = await db.get().collection(collection.ORDER_COLLECTION).
                aggregate([
                    {
                        $match:{_id:objectId(orderId)}
                     },
                    {
                        $unwind:'$products'
                    },
                    {
                        $lookup:{
                            from:collection.PRODUCT_COLLECTION,
                            localField:'products.item',
                            foreignField:'_id',
                            as:'completeDetails'
                        }
                    },
                    {
                     $project:{
                        productDetails:{$arrayElemAt:['$completeDetails',0]},
                        'products.quantity':1,
                        addressId:1,
                        status:1
                        }
        
                    },
                    {
                        $lookup:{
                            from:collection.ADDRESS_COLLECTION,
                            localField:'addressId',
                            foreignField:'_id',
                            as:'addressDetails'
                        }
                    },
                    {
                        $unwind:'$addressDetails'
                    },
                    {
                        $lookup:{
                            from:collection.CATEGORY_COLLECTION,
                            localField:'productDetails.category',
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
                            convertedPrice:{$toInt:'$productDetails.price'},
                            comparedDiscount:{
                                $cond:{if:{$gt:['$productDetails.discount','$categoryDiscount']},then:'$productDetails.discount',else:'$categoryDiscount'}
                            }
                        }
                     },
                     {
                        $addFields:{
                            discountedPrice:{$round:[{$subtract:['$convertedPrice',{$divide:[{$multiply:['$convertedPrice','$comparedDiscount']},100]}]}]}
                        }
                     },
                     {
                        $addFields:{
                            productTotal:{$multiply:['$discountedPrice','$products.quantity']}
                        }
                     }
                    //  {
                    //      $project:{
                    //          item:1,
                    //          quantity:1,
                    //          products:1,
                    //          productDetails:1,
                    //          categoryDetails:1,
                    //          addressDetails:1,
                    //          comparedDiscount:1,convertedPrice:1,
                    //          discountedPrice:1,
                    //         productTotal:{$multiply:['$discountedPrice','$products.quantity']}
                    //      }
                    //  },
                    // {
                    //     $project:{
                    //         total:{$multiply:[{$toInt:'$productDetails.price'},'$products.quantity']},
                    //         productDetails:1,
                    //         products:1,
                    //         addressDetails:1,
                    //         status:1
                    
                    //         //quantity coming in product
                    //     }
                    // }   
                    
                ]).toArray()
                console.log('-------order-here------')
                console.log(orders)
                console.log('-------order-here------')

                    resolve(orders)
            }catch{
                reject(err)
            }
        })
    },
    displayOrderTotal:(orderId)=>{
        return new Promise (async(resolve,reject)=>{
            try{
                let grandTotal = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $match:{_id:objectId(orderId)}
                    },
                    {
                        $unwind:'$products'
                    },
                    {
                        $lookup:{
                            from:collection.PRODUCT_COLLECTION,
                            localField:'products.item',
                            foreignField:'_id',
                            as:'completeDetails'
                        }
                    },
                    {
                     $project:{
                        productDetails:{$arrayElemAt:['$completeDetails',0]},
                        'products.quantity':1
                        }
        
                    },
                    {
                        $group:{
                            _id:null,
                            total:{$sum:{$multiply:[{$toInt:'$productDetails.price'},'$products.quantity']}}
     
                        }
                    }   
                    
                ]).toArray()
                let total = grandTotal[0].total
                // console.log(total)
                resolve(total)

            }catch{
                reject(err)
            }
        })
    },
    getAddress:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
            try{

                let address = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $match:{_id:objectId(orderId)}
                    },
                    {
                        $lookup:{
                            from:collection.ADDRESS_COLLECTION,
                            localField:'addressId',
                            foreignField:'_id',
                            as:'addressDetails',
                        }
                    },
                    {
                        $unwind:'$addressDetails'
                    },
                    {
                        $project:{
                        addressDetails:1,
                         paymentMethod:1,
                         status:1,   
                        }
                    }
                ]).toArray()
                
                resolve(address[0])
            }catch{
                reject(err)
            }
        })
    },
    cancelOrders:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
            try{

                await db.get().collection(collection.ORDER_COLLECTION).updateOne
                (
                    {
                        _id: objectId(orderId)
                    },
                    {
                        $set:{status:'cancelled',orderCancel:true}
                    },
                    {
                        upsert:true
                    }
                )
                resolve()
            }catch{
                reject(err)
            }
        })
    },

    createAddress:(addressBody)=>{
        return new Promise(async(resolve,reject)=>{
            try{

                let addressObj = {
                    userId:objectId(addressBody.userId),
                    name:addressBody.name,
                    address:addressBody.address,
                    city:addressBody.city,
                    pincode:addressBody.pincode,
                    mobile:addressBody.mobile
                 }
            await db.get().collection(collection.ADDRESS_COLLECTION).insertOne(addressObj)
            resolve()
            }catch{
                reject(err)
            }
        })

    },

    getAddressByUser:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            try{

                let addressArray = await db.get().collection(collection.ADDRESS_COLLECTION).find({userId:objectId(userId)}).toArray()
                resolve(addressArray)
            }catch{
                reject(err)
            }
            
        })
    },

    getEditAddress:(addressId)=>{
        return new Promise(async(resolve,reject)=>{
            try{

                let address = await db.get().collection(collection.ADDRESS_COLLECTION).findOne({_id:objectId(addressId)})
                resolve(address)
            }catch{
                reject(err)
            }
            
        })
    },

    editAddress:(editedAddress) =>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.ADDRESS_COLLECTION).updateOne({_id:objectId(editedAddress.addressId)},{
                $set:{
                    name:editedAddress.name,
                    address:editedAddress.address,
                    city:editedAddress.city,
                    pincode:editedAddress.pincode,
                    mobile:editedAddress.mobile,
                }
            }).then((response)=>{
                resolve()
            }).catch((err)=>{
                reject(err)
            })
        })
    },

    deleteAddress:(addressId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ADDRESS_COLLECTION).deleteOne({_id:objectId(addressId)}).then(()=>{
                resolve()
            }).catch((err)=>{
                reject(err)
            })
        })
    },

    getAddressCount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            try{

                let address = await db.get().collection(collection.ADDRESS_COLLECTION).findOne({userId:objectId(userId)})
                if(address){
                    resolve({status:true})
                }else{
                    resolve({status:false})
                }
            }catch{
                reject(err)
            }
        })
    },

    adminOrderdisplay:()=>{
        return new Promise(async(resolve,reject)=>{
            try{

                let orderArrray = await db.get().collection(collection.ORDER_COLLECTION).
                
                aggregate([
                     {
                         $lookup:{
                             from:collection.ADDRESS_COLLECTION,
                             localField:'addressId',
                             foreignField:'_id',
                             as:'addressDetails'
                         }
                     },
                     {
                         $unwind:'$addressDetails'
                     },
                     {
                         $unwind:'$products'
                     }
                 ]).toArray()
                 resolve(orderArrray)
            }catch{
                reject(err)
            }
       
    })

    },

    adminOrderArray:()=>{
        return new Promise(async(resolve,reject)=>{
          let orderArrray = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
                $lookup:{
                    from:collection.USER_COLLECTION,
                    localField:'user',
                    foreignField:'_id',
                    as:"userDetails"
                }
            },
            {
                $unwind:'$userDetails'
            }
        ]).toArray()
          resolve(orderArrray)
        })
    },
    statusChange:(reqBody)=>{
        console.log(reqBody)
        
        return new Promise(async(resolve,reject)=>{
            let userId = reqBody.userId
            let orderId = reqBody.orderId
            let value = reqBody.value
            try{

                let statusChange= await db.get().collection(collection.ORDER_COLLECTION).updateOne(
                        {
                            _id:objectId(reqBody.orderId),user:objectId(reqBody.userId)
                        },
                        {
                            $set:{
                                status:reqBody.value
                            }
                        },
                        {
                            upsert:true
                        }
                        )
                        console.log(statusChange)
                        resolve()
            }catch{
                reject(err)
            }
        })
    },

    getProImages:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
            try{

                let proImgArray =    await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                        {$match:{_id : objectId(orderId)}},
                        {
                            $lookup:{
                                from:"products",
                                localField:'products.item',
                                foreignField:'_id',
                                as:"productDetails"
                            }
                        }    
                           ,
                           {
                               $project:{
                                   'productDetails.img':1,
                               }
                           },
                           {
                               $unwind:'$productDetails'
                           },
                            {
                                $project:{
                                   productImages:{$arrayElemAt:['$productDetails.img',0]}
                               }
                          },
                           {
                               $group:{
                               _id:null,
                               productImages:{$push:'$productImages'}
                               
                           }
                               }
                    ]).toArray()
                    resolve(proImgArray)
            }catch{
                reject(err)
            }

        })
    },

    getOrderTotal:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
            total =await db.get().collection(collection.ORDER_COLLECTION).find({_id:objectId(orderId)}).toArray()
            console.log(total)
          resolve(total[0].total)

        })
    },

    returnProduct:(orderId,reason)=>{
        console.log(reason)
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},
            {
                $set:{
                    status:'return applied',
                    reason:reason
                }
            },{upsert:true}).then((response)=>{
                resolve(response)
                console.log(response)
            })
            
        })
    },

    returnProductApproval:()=>{
        return new Promise(async(resolve,reject)=>{
            let orderForApproval = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{
                        'status':{$in:['return applied']}
                    }
                },
                {
                    $lookup:{
                        from:collection.USER_COLLECTION,
                        localField:'user',
                        foreignField:'_id',
                        as:'userDetails'
                    }
                },
                {
                    $unwind:"$userDetails"
                }
                
            ]).toArray()
            resolve(orderForApproval)
            console.log(orderForApproval)
        })
    },
    returnApproved:(orderId,total,userId)=>{
        console.log(orderId)
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},{

                $set:{
                    status:'return approved'
                }
            }).then((response)=>{
                db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},
                {
                    $push:{}
                })
                console.log(response)
            })
    
        })
    },
    returnApprovedProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let returnedOrder = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{
                        'status':{$in:['return approved']}
                    }
                },
                {
                    $lookup:{
                        from:collection.USER_COLLECTION,
                        localField:'user',
                        foreignField:'_id',
                        as:'userDetails'
                    }
                },
                {
                    $unwind:"$userDetails"
                }
                
            ]).toArray()
            resolve(returnedOrder)
        })


},

getOrderProductQuantity:(orderId)=>{
    return new Promise(async(resolve,reject)=>{
        await db.get().collection(collection.ORDER_COLLECTION).aggregate([{$match:{_id:objectId(orderId)}},{
            $unwind:'$products'
          },
          {
            $project:{
              productId:"$products.item",
                quantity:"$products.quantity"
            }
          },
          ]).toArray().then((response)=>{
       
      
            console.log(response);
            resolve(response)
            
        })
    })
},

updateStockDecrease:({productId,quantity})=>{
    console.log(productId);
    


    return new Promise(async(resolve, reject)=>{
        console.log('into int');
        console.log(quantity);
        quantity=parseInt(quantity)

        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(productId)},{
            $inc:{quantity: -quantity}
        })
    })

},


updateStockIncrease:({productId,quantity})=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(productId)}, {
          $inc: {quantity: quantity},
      })

    })
  },

  updateWallet:(userId,total)=>{
     total = parseInt(total)
    return new Promise(async(resolve,reject)=>{

        await db.get().collection(collection.USER_COLLECTION).updateOne({ _id:objectId(userId)},
        
        {
            
            $push:{
                referalBonus: total
            }
        
        })
        resolve()

    })

  }

 

}
