
$("#checkout-form").submit((e)=>{
    e.preventDefault()
    $.ajax({
        url:'/checkout',
        method:'post',
        data:$('#checkout-form').serialize(),
        success:(response)=>{
            if(response.codStatus){
                window.location.href='/order-succesfull'
            }else if(response.walletStatus){
                window.location.href = '/order-succesfull'
            }
            else if(response.razorpayStatus){
                    rayzorpayPayment(response)

                }else if(response){
                        window.location.href=response

                }else if(response.addressFalse){
                    Swal.fire(
                        'please Add your Address',
                        'Then try checkout',
                        'question'
                      )
                }
            }
        })
    })


function rayzorpayPayment(order){
    var options = {
        "key": "rzp_test_wBILsF6sI8t8aF", // Enter the Key ID generated from the Dashboard
        "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "IND WEAR",
        "description": "Test Transaction",
        "image": "https://example.com/your_logo",
        "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "callback_url": "https://eneqd3r9zrjok.x.pipedream.net/",
        "handler": function (response){

            verifyPayment(response,order)
            },

        "prefill": {
            "name": "jon doe",
            "email": "jondoer@example.com",
            "contact": "9567088516"
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#3399cc"
        }
}
var rzp1 = new Razorpay(options);

rzp1.on('payment.failed',function(response){
    deleteOrder(order)
})

rzp1.open();

    
}


function verifyPayment(payment,order){
    $.ajax({
        url:"verify-payment",
        data:{
            payment,
            order
        },
        method:'post',
        success:(response)=>{
            if(response.status){
                alert('payment successful order placed')
                window.location.href='/order-succesfull'
            }else{
                alert('payment failed')
            }
        }
    })
}

function deleteOrder(orderId){
    fetch('remove-payfail',{
   method:'delete',
   headers:{'Content-Type':'application/json'},
   body:JSON.stringify({orderId:orderId})
}).then(res =>
{
   if (res.ok){
       console.log('success')
       }
   else{
       console.log('failed')
       }
   return res;

}
).then(res=>{
   console.log(res)
   window.location.reload();
   })

   }

// function paypalPayment(total,orderId){

//     var create_payment_json = {
//         "intent": "sale",
//         "payer": {
//             "payment_method": "paypal"
//         },
//         "redirect_urls": {
//             "return_url": "http://return.url",
//             "cancel_url": "http://cancel.url"
//         },
//         "transactions": [{
//             // "item_list": {
//             //     "items": [{
//             //         "name": "item",
//             //         "sku": "item",
//             //         "price": "1.00",
//             //         "currency": "USD",
//             //         "quantity": 1
//             //     }]
//             // },
//             "amount": {
//                 "currency": "USD",
//                 "total": total
//             },
//             "description": "This is the payment description."
//         }]
//       }
    
//        paypal.payment.create(create_payment_json, function (error, payment) {
//         if (error) {
//           console.log(error)
//           throw error;
//         } else {
//             for(let i = 0;i < payment.links.length;i++){
//               if(payment.links[i].rel === 'approval_url'){
//                 let approval_link = payment.links[i]
//                 res.redirect(payment.links[i].href);
//               }
//             }
//         }
//       })
// }