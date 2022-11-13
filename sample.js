// applyCoupon:({code},total,userId)=>{

//     let response={}

//     let d = new Date()
//             let  month = '' + (d.getMonth() + 1)
//             let day = '' + d.getDate()
//             let year = d.getFullYear()



//             if (month.length < 2) 
//                 month = '0' + month;
//             if (day.length < 2) 
//                 day = '0' + day;
                
//             let time = [year, month, day].join('-')

//     console.log(code,total,userId)
//     return new Promise(async(resolve,reject)=>{
//         let couponFind = await db.get().collection(collection.COUPON_COLLECTION).findOne({couponCode:code})
//         if(couponFind){
//             response.couponFind=true
//             let currentDate= time
//             console.log(currentDate)
//             console.log(couponFind.Expirydate)
//             if(currentDate>couponFind.Expirydate){
//                 response.expiredCoupon=true
//                 response.couponExpired="Sorry, Coupon is expired"
//                 console.log(response.couponExpired)
//                 resolve(response)
//             }else{
//                 response.expiredCoupon=false
//                let couponAlreadyApplied = await db.get().collection(collection.APPLIEDCOUPONS_COLLECTION).findOne({userId:objectId(userId), couponId:couponFind._id})
//                 if(couponAlreadyApplied){

//                     response.appliedCoupon=true
//                     response.couponApplied="Coupon already Applied"
//                     resolve(response)
                    
//                 }else{
//                     response.appliedCoupon=false
//                     response.couponAppliedSuccess="Coupon Successfully applied"
//                   let  couponDiscountpercentage = couponFind.discount
//                   let  discountPrice=(couponDiscountpercentage/100)*total
//                   let totalPriceAfterOffer=total-discountPrice
//                   response.totalPriceAfterOffer=totalPriceAfterOffer
//                   response.discountPrice=discountPrice

//                     appliedCouponObj={
//                         userId:objectId(userId),
//                         couponId:couponFind._id
//                     }
//                     db.get().collection(collection.APPLIEDCOUPONS_COLLECTION).insertOne(appliedCouponObj)
//                         resolve(response)
//                     db.get().collection(collection.USERS_COLLECTION).updateOne({_id:userId},
//                         {
//                             $set:{couponId:couponFind._id}
//                     },{upsert:true}
//                     )
                    
//                 }
//             }
//         }else{
//             response.couponFind=false
//             response.couponNotFound="Coupon not found"
//             resolve(response)
//         }
    
//     })
//  },



//  getCouponPrice:(userId,total)=>{
//     let totalPrice=total.totalAmount

  
    
//     return new Promise((resolve,reject)=>{
//         db.get().collection(collection.CART_COLLECTION).aggregate([
//             {
//                 $match:{user:userId}
//             },
//             {
//                 $lookup:{
//                     from:collection.USERS_COLLECTION,
//                     localField:'user',
//                   foreignField:'_id',
//                    as:'user'
//             }
//         },
//         {
//             $project:{
//                 user:{$arrayElemAt:['$user',0]}
//             }
              
//         },
//         {
//             $lookup:{
//                 from:collection.COUPON_COLLECTION,
//                 localField:'user.couponId',
//               foreignField:'_id',
//                as:'coupon'
//             }
//         },
//         {
//             $project:{
//                 user:1,coupon:{$arrayElemAt:['$coupon',0]}
//             }
//         },
//         {
//             $project:{
//                 discountedPrice: { $multiply: [ {$divide: [  "$coupon.discount", 100 ]},totalPrice] },coupon:1
                
//             }
//         },
//         {
//             $project:{
//                 discountedPrice:1,
//                 TotalAfterDiscount: { $subtract: [totalPrice,'$discountedPrice' ] },
//                 couponId:"$coupon._id",

//             }
//         }
        
//         ]).toArray().then((response)=>{
//             resolve(response)
           
            
//         })
//     })
//  },


//  deleteCoupon:(couponId,userId)=>{
  
//     return new Promise((resolve,reject)=>{
//         db.get().collection(collection.USERS_COLLECTION).updateOne({_id:userId},
//             {$unset:{
//                 couponId:objectId(couponId)
//             }
//         }).then(()=>{
//             db.get().collection(collection.APPLIEDCOUPONS_COLLECTION).deleteOne({userId:userId}).then(()=>{
//                 resolve()
//             })
           
//         })
       
//     })
//  }

//  function returnProduct(orderId){
//     console.log(orderId)
//     $.ajax({
//       url:'/return/approval',
//       method:'post',
//       data:{orderId:orderId},
//       success:(response)=>{
//        console.log(response)
//       }
//     })
//   }

    // function approveReturn(orderId){
    //   console.log(orderId)
    //     $.ajax({
    //         url:'/admin/approve/return',
    //         method:'post',
    //         body:{orderId:orderId},
    //         success:(response)=>{
    //             if(response.approvedStatus){
    //                 window.location.reload()
    //             }
    //         }
    //     })
    // }

                
    function approveReturn(orderid,total,userId){
        alert(userId)
         $.ajax({
             url:'/admin/approve/return/?orderId='+orderid+'&total='+total+'&userId='+userId,
             method:'post',
             success:(response)=>{
                 console.log(response)
                 if(response.approvedStatus){
                     window.location.reload()
                 }
             }
         })
     }
    


