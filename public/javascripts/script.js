
    function addToCart(prodId){
        $.ajax({
            url:'/add-to-cart/'+prodId,
            method:'get',
            success:(response)=>{
                // console.log(response)
                if(response.status){
                    // let count = document.getElementById('cart-count').innerHTML
                    // count = parseInt(count)+1
                    document.getElementById('cart-count').innerHTML = response.cartCount
                    Swal.fire({
                        position: 'center',
                        icon: 'success',
                        background:'transparent',
                        // title: 'product added to cart',
                        showConfirmButton: false,
                        timer: 1500,
                      })
                    
                }else{
                    window.location.href='/sign-in'
                }
    
            }
        })
    }