function displayAlert(addressId) {

    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {

            $.ajax({
                url: '/address/delete/' + addressId,
                method: 'delete',

                success: (response) => {
                    if (response.deletedStatus) {
                        Swal.fire(
                            'Deleted!',
                            'Your file has been deleted.',
                            'success'
                        )
                        window.location.reload()
                    }
                }
            })

        }
    })
}

let nameErrorEle = document.getElementById('nameErrorEdit')
let addressErrorEle = document.getElementById('addressErrorEdit')
let mobileErrorEle = document.getElementById('mobileErrorEdit')
let cityErrorEle = document.getElementById('cityErrorEdit')
let pincodeErrorEle = document.getElementById('pincodeErrorEdit')
let emailErrorEle = document.getElementById('emailErrorEdit')

function validateName1(){
    let name = document.getElementById("input-Firstname").value;
    
    console.log(name);
    if(name.length == 0){
        nameErrorEle.innerHTML = "enter name";
        return false;
    }
    if(!name.match(/^[A-Za-z]*\s{1}[A-Za-z]*$/)){
        nameErrorEle.innerHTML = "enter valid name";
        return false;
    }
    else{
        nameErrorEle.innerHTML = "";
        return true;
    }
        
} 
function validateAddress1(){
    let address = document.getElementById("input-Address").value;
    if(address.length==0){
        addressErrorEle.innerHTML = 'Enter address';
        return false
    }
    if(!address.match(/^([a-zA-z0-9/\\''(),-\s]{2,255})$/)){
        addressErrorEle.innerHTML ='enter valid address';
        return false;
    }else{
        addressErrorEle.innerHTML ='';
        return true;
    }
}



function validateCity1(){
          
    let city = document.getElementById("input-City").value;
    console.log(city)
    if(city.length==0){
        cityErrorEle.innerHTML="enter valid input"
        return false;
    }
    if(!city.match(/^[A-Za-z]*$/)){
        cityErrorEle.innerHTML = "enter valid input";
        return false;
    }
    else{
          cityErrorEle.innerHTML = "";
          return true;
    }

}
function validateMobile1(){
    let mobile = document.getElementById("input-Telephone").value;

    if(mobile.length==0){
        mobileErrorEle.innerHTML="enter mobile";
        return false
    }
    if(!mobile.match(/^[0-9]{10}$/)){
        mobileErrorEle.innerHTML = "enter valid mobile";
        return false;
    }else{
        mobileErrorEle.innerHTML = "";
        return true;
    }
}

function validatePincode1(){
    let pincode = document.getElementById('input-Postcode').value;
    if(pincode.length==0){
        pincodeErrorEle.innerHTML ='enter pincode';
        return false
    }
    if(!pincode.match(/^[0-9]{6}$/)){
        pincodeErrorEle.innerHTML= 'enter valid pincode'
        return false;
    }else{
        pincodeErrorEle.innerHTML = ''
        return true
    }
}

function EditAddress() {
    if (!validateName1() || !validatePincode1() ||!validateMobile1() || !validateCity1()  || !validateAddress1() ) {
        document.getElementById('errorMsg1').innerHTML ="enter proper details"
        return false;
    }else{

        $("#editAddressForm").submit((e)=>{
            e.preventDefault()
            $.ajax({
                url:'/address/edit',
                method:'patch',
                data:$("#editAddressForm").serialize(),
                success:(response)=>{
                    if(response.udpatedStatus){
                        window.location.reload()
                    }
                }
            })
        })
    }
}


function editAddress(addressId){
    console.log(addressId)
    $.ajax({
        url:'/address/edit/?addressId='+addressId,
        method:'GET',
        success:(response)=>{
            console.log(response)
            console.log(response.response.editAddress.email)
            if(response.response.status){
                console.log('call is coming heere')
                document.getElementById('input-Firstname').value=response.response.editAddress.name
                document.getElementById('input-Telephone').value=response.response.editAddress.mobile
                document.getElementById('input-Address').value=response.response.editAddress.address
                document.getElementById('input-City').value=response.response.editAddress.city
                document.getElementById('addressId').value = response.response.editAddress._id
                document.getElementById('input-Postcode').value=response.response.editAddress.pincode
            }
        }
    })
}


