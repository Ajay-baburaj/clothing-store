const Razorpay = require('razorpay');
var instance = new Razorpay({ key_id: 'rzp_test_wBILsF6sI8t8aF', key_secret: '8C84FoP90AqSyOjByzG9WHTR' })

module.exports={
  
  createOrderRazorpay: (orderId, total) => {
    return new Promise((resolve,reject)=>{

      total = parseInt(total)
      instance.orders.create({
  
        amount: total,
        currency: "INR",
        receipt: "" + orderId,
  
      }, (err, order) => {
        if (err) {
          console.log(err)
        } else {
          console.log("=============here comes the order")
          console.log(order)
        }
      })
    })
  }

}

fetch:('/get/search/results',{
  method:'post',
  headers:{'Content-Type':'Application/json'},
  body:JSON.stringify({payload:e.value})
});



<script>
function sendData(e){
  let searchResultsContainer = document.getElementById('searchResults')
  $.ajax({
    url:'/product/search',
    method:'post',
    data:{payload:e.value},
    success:(response)=>{
      // console.log(response.searchData)
      if(response.searchData.length < 1){
        searchResultsContainer.innerHTML = '<p>sorry no items found</p>';
        return;
      }else{

        response.searchData.forEach((item,index)=>{
           if(index > 0) searchResultsContainer.innerHTML += '<hr>';
            searchResultsContainer.innerHTML +=  `<a href=${url}>${item.name}</a>`
  
        })
      }

    }
  })
}
</script>