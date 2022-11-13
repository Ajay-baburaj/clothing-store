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
    <!-- Breadcrumb Section Begin -->
    <section class="breadcrumb-option">
        <div class="container">
            <div class="row">
                <div class="col-lg-12">
                    <div class="breadcrumb__text">
                        <h4>Check Out</h4>
                        <div class="breadcrumb__links">
                            <a href="./index.html">Home</a>
                            <a href="/shop/now">Shop</a>
                            <span>Check Out</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <!-- Breadcrumb Section End -->
    
    
    <section class="checkout spad">
        <div class="cart__discount" style="margin-left: 8rem;">
            <div class="row">
                {{!-- {{#if couponDiscount}} --}}
                    <p></p>
                    {{!-- {{else}} --}}
                 <div class="col-lg-4">
                    <h6>Discount codes</h6>
                    <!-- Button trigger modal -->
                    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
                    Coupon Discounts
                    </button>
    
                    <!-- Modal -->
                    <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                        <div class="modal-header">
                            <h1 class="modal-title fs-5 fw-bold text-danger" id="exampleModalLabel">Wohoo !! Apply Discount coupons</h1>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                    <form id="applyCopounForm">
                        <div class="modal-body">
    
                            {{#each coupons}}
                            <div class="d-flex flex-row align-items-center mb-2">
                                            <span class="circle mr-3" style="">
                                                <input type="radio" value="{{thi.Code}}" name="code" id="code{{this._id}}" checked required>
                                            </span>
                                            <div class="d-flex flex-column mb-2">
                                                <h6 class="fw-bold p-0 m-0">{{this.Name}}</h6>
                                               <strong> <span class="text-success">{{this.Description}}<br>
                                                </span></strong>
                                            </div>
                            </div>
                            {{/each}}            
                            
                        
                        </div>
                        <div class="modal-footer">
                            {{!-- <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button> --}}
                            <button onclick="applyCoupon('{{total}}','{{user._id}}')">Apply</button>
                        </div>
                        </form>
                        </div>
                    </div>
                    </div>
                            {{!-- <form id="applyCopounForm">
                                <input type="text" name="code" id="code" placeholder="Coupon code">
                                <button onclick="applyCoupon('{{total}}','{{user._id}}')">Apply</button>
                            </form>
                        </div> --}}
                  {{!-- {{/if}}       --}}
                        </div>
            </div>
        <div class="container">
            <div class="checkout__form">
                <form id="checkout-form">
                    <div class="row">
                        {{!-- <h6 class="coupon__code"><span class="icon_tag_alt"></span> Have a coupon? <a href="#">Click
                                here</a> to enter your code</h6> --}}
                        
                        <h6 class="checkout__title">Billing Details</h6>
                        
    
                       
                        <div class="col-lg-6 col-md-6 mr-md-5 ml-md-5">
    
                            <div class="card p-1 py-2 card-1 text-left" style="display:flex;flex-wrap:wrap">
                                {{!-- <div class=""> --}}
                                    {{#each addressArray}}
                                    <div class="p-3 card-child mb-3 col-md-">
                                        <div class="d-flex flex-row align-items-center ">
                                            <span class="circle mr-3" style="">
                                                <input type="radio" value="{{this._id}}" name="addressId" checked required>
                                            </span>
                                            <div class="d-flex flex-column ms-3">
                                                <h6 class="fw-bold">{{this.name}}</h6>
                                                <span>{{this.address}}, <br>{{this.city}} ,{{this.pincode}}<br>
                                                    {{this.mobile}}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <button type="button" class="border-0 btn-sm text-primary ml-5 mb-5"
                                                onclick="editAddress('{{this._id}}')" data-bs-toggle="modal"
                                                data-bs-target="#editaddressModal">
                                                edit</button>
                                            {{!-- <button class="border-0 btn-sm text-primary" id="deleteBtn"
                                                onclick="displayAlert('{{this._id}}')">delete</button> --}}
                                        </div>
                                    </div>
                                    {{/each}}
                                {{!-- </div> --}}
                            </div>
                            <button type="button" class="site-btn ml-3 mt-5" data-bs-toggle="modal"
                                data-bs-target="#staticBackdrop">Add
                                Address</button>
                        </div>
    
                        <input type="text" value="{{user._id}}" name="userId" hidden>
                        
    
                        <div class="col-lg-4 col-md-6">
                             {{!-- <div class="col-lg-4"> --}}
                        
                            <div class="checkout__order">
                                <h4 class="order__title">Your order</h4>
                                <div class="checkout__order__products">Product <span>Total</span></div>
                                <ul class="checkout__total__products">
                                    {{#each cartDetails}}
                                    <li>{{inc @index}}. {{this.product.name}}<span>₹ {{this.productTotal}}</span></li>
                                    {{/each}}
                                </ul>
                                <ul class="checkout__total__all">
                                    <li>Subtotal <span>₹ {{total}}</span></li>
                                    {{#if couponDiscount.[0]}}
                                    <li>Coupon code <span>{{couponDiscount.[0].couponCode}}</span></li><a href="/remove/coupon/{{couponDiscount.[0].couponId}}" class="">remove coupon  X</a>
                                    <li>discount<span> {{couponDiscount.[0].comparedCouponDiscount}}</span></li>
                                    <input type="text" name="couponApplied" value="true" hidden>
                                    <li>Total <span>₹ {{couponDiscount.[0].couponDiscountedPrice}}</span></li>
                                    {{else}}
                                    <li>Total <span>₹ {{total}}</span></li>
                                    {{/if}}
                                </ul>
    
                                <div class="inline">
                                    <input type="radio" id="cod" name="paymentMethod" value="COD" checked>
                                    <label for="cod">Cash on delivery</label>
                                </div>
                                <div class="inline">
                                    <input type="radio" id="razorpay" name="paymentMethod" value="razorpay">
                                    <label for="razorpay">Razorpay</label>
                                </div>
                                <div class="inline">
                                    <input type="radio" id="paypal" name="paymentMethod" value="paypal">
                                    <label for="paypal">Paypal</label>
                                </div>
    
                                <button type="submit" class="site-btn">PLACE ORDER</button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    
    </section>
    
    <!-- Modal  for add address-->
    <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
        aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="staticBackdropLabel">Add Your Address
                    </h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <form id="addressAddForm">
                    <div class="modal-body">
    
                        <div class="row">
                            <div class="form-group col-md-6 col-lg-6 col-xl-6 required">
                                <label for="input-firstname">Name <span class="required-f text-danger">
                                        *</span></label>
                                <input name="name" value="" id="input-firstname" type="text" class="form-control">
                            </div>
                            <div class="form-group col-md-6 col-lg-6 col-xl-6 required">
                                <label for="input-email">E-Mail <span class="required-f text-danger">*</span></label>
                                <input name="email" value="" id="input-email" type="email" class="form-control">
                            </div>
                        </div>
                        <div class="row">
                            <div class="form-group col-md-6 col-lg-6 col-xl-6 required">
                                <label for="input-telephone">Telephone <span class="required-f text-danger">*</span></label>
                                <input name="mobile" value="" id="input-telephone" type="tel" class="form-control">
                            </div>
                            <div class="form-group col-md-6 col-lg-6 col-xl-6 required">
                                <label for="input-address-1">Address <span class="required-f text-danger">*</span></label>
                                <input name="address" value="" id="input-address" type="text" class="form-control">
                            </div>
                        </div>
    
                        <input type="text" name="userId" value="{{user._id}}" hidden>
                        <div class="row">
    
                            <div class="form-group col-md-6 col-lg-6 col-xl-6 required">
                                <label for="input-city">City <span class="required-f text-danger">*</span></label>
                                <input name="city" value="" id="input-city" type="text" class="form-control">
                            </div>
                            <div class="form-group col-md-6 col-lg-6 col-xl-6 required">
                                <label for="input-postcode">Post Code <span class="required-f text-danger">*</span></label>
                                <input name="pincode" value="" id="input-postcode" type="text" class="form-control">
                            </div>
                        </div>
                        <div class="row">
    
                            <div class="form-group col-md-6 col-lg-6 col-xl-6 required">
                                <label for="input-landmark">State<span class="required-f text-danger">*</span></label>
                                <input name="landmark" value="Kerala" id="input-landmark" type="text" readonly
                                    class="form-control">
                            </div>
    
                        </div>
    
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="submit" class="btn btn-primary">Add</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    
    <!-- Modal for edit address-->
    <div class="modal fade" id="editaddressModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
        aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="staticBackdropLabel">Add Your Address
                    </h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <form id="editAddressForm">
                    <div class="modal-body">
    
                        <div class="row">
                            <div class="form-group col-md-6 col-lg-6 col-xl-6 required">
                                <label for="input-firstname">Name <span class="required-f text-danger">
                                        *</span></label>
                                <input name="name" value="" id="input-Firstname" type="text" class="form-control">
                            </div>
                            {{!-- <div class="form-group col-md-6 col-lg-6 col-xl-6 required">
                                <label for="input-email">E-Mail <span class="required-f text-danger">*</span></label>
                                <input name="email" value="" id="input-Email" type="email" class="form-control">
                            </div> --}}
                        </div>
                        <div class="row">
                            <div class="form-group col-md-6 col-lg-6 col-xl-6 required">
                                <label for="input-telephone">Telephone <span class="required-f text-danger">*</span></label>
                                <input name="mobile" value="" id="input-Telephone" type="tel" class="form-control">
                            </div>
                            <div class="form-group col-md-6 col-lg-6 col-xl-6 required">
                                <label for="input-address-1">Address <span class="required-f text-danger">*</span></label>
                                <input name="address" value="" id="input-Address" type="text" class="form-control">
                            </div>
                        </div>
    
                        <input type="text" name="addressId" value="" id="addressId" hidden>
                        <div class="row">
    
                            <div class="form-group col-md-6 col-lg-6 col-xl-6 required">
                                <label for="input-city">City <span class="required-f text-danger">*</span></label>
                                <input name="city" value="" id="input-City" type="text" class="form-control">
                            </div>
                            <div class="form-group col-md-6 col-lg-6 col-xl-6 required">
                                <label for="input-postcode">Post Code <span class="required-f text-danger">*</span></label>
                                <input name="pincode" value="" id="input-Postcode" type="text" class="form-control">
                            </div>
                        </div>
                        <div class="row">
    
                            <div class="form-group col-md-6 col-lg-6 col-xl-6 required">
                                <label for="input-landmark">State<span class="required-f text-danger">*</span></label>
                                <input name="landmark" value="Kerala" id="input-State" type="text" readonly
                                    class="form-control">
                            </div>
    
                        </div>
    
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="submit" class="btn btn-primary">Add</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    
    <script>
        function applyCoupon(total,userId,cartId){
        
        $('#applyCopounForm').submit((e)=>{
        e.preventDefault()
        var code = $('#applyCopounForm').serialize()
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
    
    
    <script src="/javascripts/addAddress.js"></script>
    <script src="/javascripts/checkout.js"></script>