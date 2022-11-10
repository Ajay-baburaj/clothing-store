// function applyCoupon(total,userId){
        
//     $('#applyCopounForm').submit((e)=>{
        
//         console.log('HJFHRJHJRH')
//         alert('heyyy')

//         $.ajax({
//             url:'/apply/coupon',
//             method:'post',
            
//         })

//     })
//    }

//    function applyCoupon(total,userId){
        
//     $('#applyCopounForm').submit((e)=>{
//         e.preventDefault()
//         console.log('HJFHRJHJRH')
//         alert('heyyy')
//         let body ={
//             tota:total,
//             userId:userId,
//             couponCode:$('#applyCopounForm').serialize().code
//         }

//         $.ajax({
//             url:'/apply/coupon',
//             method:'post',
//             data:body,
//             success:(response)=>{
//                 alert(response)
//             }
            
//         })

//     })
//    }

//    function applyCoupon(total,userId){
        
//     $('#applyCopounForm').submit((e)=>{
//         e.preventDefault()
//         console.log('HJFHRJHJRH')

//          var $formData = {
//          code: $("#code").val()
         
//          }
//          let body ={
//                 total:total,
//                 userId:userId,
//                 couponCode:$formData.code 
//         }

//         $.ajax({
//             url:'/apply/coupon',
//             method:'post',
//             data:body,
//             success:(response)=>{
//                 alert(response)
//             }
            
//         })

//     })
//    }
//    Swal.fire({
//     position: 'center',
//     icon: 'success',
//     title: 'Wohoo!! 🎉 you have saved '+ response.discount + ' Rupees 🎉',
//     showConfirmButton: false,
//     timer: 4000
//     })
//     document.getElementById('subTotal').innerHTML= response.totalPriceAfterOffer
//     document.getElementById('totalValue').innerHTML= response.totalPriceAfterOffer


//     function applyCoupon(total,userId,cartId){
        
//         $('#applyCopounForm').submit((e)=>{
//             e.preventDefault()
//             var code = $("#code").val();
//              let body ={
//                     total:total,
//                     userId:userId,
//                     cartId:cartId,
//                     couponCode:code
//             }
    
//             console.log(body)
    
//             $.ajax({
//                 url:'/apply/coupon',
//                 method:'post',
//                 data:body,
//                 success:(response)=>{
//                     console.log(response)
//                     if(response.couponStatus){
//                         if(response.validity){
//                             let alertBox = document.getElementById('appliedAlert')
//                             alertBox.classList.toggle("d-inline")
//                             alertBox.textContent='you applied' + response.totalDetails.couponCode
                           
//                         }else{
//                             Swal.fire({
//                             icon: 'error',
//                             title: 'Oops...',
//                             text: response.message,
//                             })
//                         }
                        
//                     }
//                 }
                
//             })
    
//         })
//        }
//        let alertBox = document.getElementById('appliedAlert')
//                         alertBox.classList.toggle("d-inline")
//                         alertBox.textContent='you applied  ' + response.totalDetails[0].couponCode
//                         document.getElementById('subTotal').textContent =response.totalDetails[0].couponDiscountedPrice
//                         document.getElementById('subTotal').classList.toggle('text-success')
//                         document.getElementById('couponDiscount').textContent = response.totalDetails[0].{
//                             $lookup:{
//                                 from:collection.CATEGORY_COLLECTION,
//                                 localField:'product.category',
//                                 foreignField:'_id',
//                                 as:'categoryDetails',
//                             }
//                          },
//                          {
//                             $unwind:"$categoryDetails"
//                          },
//                          {
//                             $addFields:{
//                                 categoryDiscount:{$toInt:"$categoryDetails.discount"}
//                             }
//                          },
//                          {
//                             $addFields:{
//                                 convertedPrice:{$toInt:'$product.price'},
//                                 comparedDiscount:{
//                                     $cond:{if:{$gt:['$product.discount','$categoryDiscount']},then:'$product.discount',else:'$categoryDiscount'}
//                                 }
//                             }
//                          },
//                          {
//                             $addFields:{
//                                 discountedPrice:{$round:[{$subtract:['$convertedPrice',{$divide:[{$multiply:['$convertedPrice','$comparedDiscount']},100]}]}]}
//                             }
//                          },
//                          {
//                              $project:{
//                                  item:1,
//                                  quantity:1,
//                                  product:1,
//                                  categoryDetails:1,
//                                  comparedDiscount:1,convertedPrice:1,
//                                  discountedPrice:1,
//                                 productTotal:{$multiply:['$discountedPrice','$quantity']}
//                              }
//                          },


//         // ==============================================================


//         let totalAmount = await db.get().collection(collection.CART_COLLECTION).aggregate([
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
//                     quantity:'$products.quantity'   
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
            
//         ]).toArray()
//            resolve(totalAmount)

//    }catch{
//        reject(err)
//    }


<script>
      function applyCoupon(total,userId,cartId){
        
        console.log('call is coming inside ')
    $('#applyCopounForm').submit((e)=>{
        e.preventDefault()
        var code = $("#code").val();
         let body ={
                total:total,
                userId:userId,
                cartId:cartId,
                couponCode:code
        }

        console.log(body)

        $.ajax({
            url:'/apply/coupon',
            method:'post',
            data:body,
            success:(response)=>{
                console.log(response)
                if(response.couponStatus){
                    if(response.validity){
                        window.location.href='/checkout'
                       
                    }else{
                        Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: response.message,
                        })
                    }
                    
                }
            }
            
        })

    })
   }
</script>


function removeProduct(productId){
    $.ajax({
        url:'/remove/cart/product/?productId='+productId,
        method:'delete',
        success:(response)=>{
            if(response.deleteStatus){
                window.location.reload()
            }else{
                window.location.href='/cart'
            }
        }

    })
   }

function applyCoupon(total,userId,cartId){
    
$('#applyCopounForm').submit((e)=>{
    e.preventDefault()
    var code = $("#code").val();
     let body ={
            total:total,
            userId:userId,
            cartId:cartId,
            couponCode:code
    }

    console.log(body)

    $.ajax({
        url:'/apply/coupon',
        method:'post',
        data:body,
        success:(response)=>{
            console.log(response)
            if(response.couponStatus){
                if(response.validity){
                    window.location.href='/cart'
                   
                }else{
                    Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: response.message,
                    })
                }
                
            }
        }
        
    })

})
}
