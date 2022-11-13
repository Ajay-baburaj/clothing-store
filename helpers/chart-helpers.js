const db = require('../config/connection')
const objectId = require('mongodb').ObjectId
const collection = require('../config/collection')



module.exports={

    getTotalSalesGraph:()=>{
        return new Promise (async(resolve,reject)=>{
            let dailySales=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{
                        'status':{$nin:['cancelled','pending','return approved','return applied']}
                    }
                },
                {
                    $unwind:'$total'
                },
                {
                    $group:{
                        _id:'$date',
                        totalAmount:{$sum:'$total.total'} ,
                        count:{$sum:1}
                    }
                },
                {
                    $sort:{
                        _id:-1
                    }
                },
                {
                    $limit:10
                },

            ]).toArray()


            let monthlySales=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
               
                {
                    $match:{
                        'status':{$nin:['cancelled','pending']}
                    }
                },
                {
                    $unwind:'$total'
                },
                {
                    $project:{
                        isoDate:{$dateFromString:{dateString:"$date"}},
                        total:1
                    }
                },
                {
                    $group: {
                        _id:{ $dateToString: { format: "%Y-%m", date: "$isoDate"} },
                        totalAmount: { $sum: "$total.total" },
                        count:{$sum:1}
                    }
                },
                {
                    $sort:{_id:1}
                }
               
            ]).toArray()

            let yearlySales =await db.get().collection(collection.ORDER_COLLECTION).aggregate([
               
                {
                    $match:{
                        'status':{$nin:['cancelled','pending']}
                    }
                },
                {
                    $unwind:'$total'
                },
                {
                    $project:{
                        isoDate:{$dateFromString:{dateString:"$date"}},
                        total:1
                    }
                },
                {
                    $group: {
                        _id:{ $dateToString: { format: "%Y", date: "$isoDate"} },
                        totalAmount: { $sum: "$total.total" },
                        count:{$sum:1}
                    }
                },
                {
                    $sort:{_id:1}
                }
               
            ]).toArray()
            resolve({dailySales,monthlySales,yearlySales})


            
            })
    },
    
    getPaymentWiseGraph:()=>{
        try{
            return new Promise(async(resolve,reject)=>{
                let totalPayments = await db.get().collection(collection.ORDER_COLLECTION).countDocuments({
                    status : {$nin: ['cancelled']}
                })
    
                let totalCOD = await db.get().collection(collection.ORDER_COLLECTION).countDocuments({
                    paymentMethod: 'COD', status: {$nin: ['cancelled','pending']}
                })
    
                let totalRazorpay = await db.get().collection(collection.ORDER_COLLECTION).countDocuments({
                    paymentMethod: 'razorpay', status: {$nin: ['cancelled','pending']}
                })
    
                let totalPaypal = await db.get().collection(collection.ORDER_COLLECTION).countDocuments({
                    paymentMethod: 'paypal', status: {$nin: ['cancelled','pending']}
                })
    
                let percentageCOD = Math.round(totalCOD/totalPayments*100);
                let percentageRazorpay = Math.round(totalRazorpay/totalPayments*100);
                let percentagePaypal = Math.round(totalPaypal/totalPayments*100);
    
                // console.log(totalPayments, totalCOD, totalUPI, totalPaypal)
                resolve({percentageCOD, percentageRazorpay, percentagePaypal})
            })
        }
        catch{
            throw(err)
        }
},

categoryWiseSales:()=>{
    return new Promise(async(resolve,reject)=>{
       let categoryWiseSales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
                $match:{
                    'status':{$nin:['cancelled,pending']}
                }
            },
            {
                $project:{
                    products:1
                }
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
                    productDetails:1
                }
            },
            {
                $unwind:'$productDetails'
            },
            {
                $group:{
                    _id:'$productDetails.category',count:{$sum:1}
                }
            }


        ]).toArray()
        let categoryWiseSalesData ={}
        categoryWiseSalesData.men = categoryWiseSales[0].count
        categoryWiseSalesData.women = categoryWiseSales[1].count
        categoryWiseSalesData.total = categoryWiseSalesData.men+categoryWiseSalesData.women;
        resolve(categoryWiseSalesData)
    })
},

topSellingProducts:()=>{
    return new Promise(async(resolve,reject)=>{
    let topSelling = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
                $match:{
                    'status':{$nin:['cancelled','pending']}
                }
            },
            {
                $project:{
                    products:1
                }
            },
            {
                $unwind:'$products'
            },
            {
                $group:{
                    _id:"$products.item",count:{$sum:1}
                }
            },
            {
                $sort:{count:-1}
            },
            {
                $limit:4
            },
            {
                $lookup:{
                    from:collection.PRODUCT_COLLECTION,
                    localField:'_id',
                    foreignField:'_id',
                    as:'productInfo'
                }
            },
            {
                $unwind:'$productInfo'
            },
            {
                $lookup:{
                    from:collection.CATEGORY_COLLECTION,
                    localField:'productInfo.category',
                    foreignField:'_id',
                    as:'categoryDetails'
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
                    convertedPrice:{$toInt:'$productInfo.price'},
                    comparedDiscount:{
                        $cond:{if:{$gt:['$productInfo.discount','$categoryDiscount']},then:'$productInfo.discount',else:'$categoryDiscount'}
                    }
                }
             },
             {
                $addFields:{
                    discountedPrice:{$round:[{$subtract:['$convertedPrice',{$divide:[{$multiply:['$convertedPrice','$comparedDiscount']},100]}]}]}
                }
             }
        
        ]).toArray()
        resolve(topSelling)
    })
},
getDailySalesTotal:()=>{
    return new Promise (async(resolve,reject)=>{
        let dailySalesTotal=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
                $match:{
                    'status':{$nin:['cancelled','pending']}
                }
            },
            {
                $unwind:'$total'
            },
            {
                $group:{
                    _id:'$date',
                    totalAmount:{$sum:'$total.total'} ,
                    count:{$sum:1} 
                    
                }
            },
            {
                $sort:{
                    _id:1
                }
            },
            {
                $limit:7
            },
            {
                $project:{
                    totalAmount:1,
                }
            },{
                $group:{
                    _id:null,
                    total:{$sum:'$totalAmount'}
                }
            }
           

        ]).toArray()
        console.log(dailySalesTotal[0].total)
        resolve(dailySalesTotal[0].total)

    })
}

}
