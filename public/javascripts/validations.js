let nameErrorEl = document.getElementById('nameError')
let addressErrorEl = document.getElementById('addressError')
let mobileErrorEl = document.getElementById('mobileError')
let cityErrorEl = document.getElementById('cityError')
let pincodeErrorEl = document.getElementById('pincodeError')
let emailErrorEl = document.getElementById('emailError')

function validateName(){
    let name = document.getElementById("name").value;
    
    console.log(name);
    if(name.length == 0){
        nameErrorEl.innerHTML = "enter name";
        return false;
    }
    if(!name.match(/^[A-Za-z]*\s{1}[A-Za-z]*$/)){
        nameErrorEl.innerHTML = "enter valid name";
        return false;
    }
    else{
        nameErrorEl.innerHTML = "";
        return true;
    }
        
} 
function validateAddress(){
    let address = document.getElementById("address").value;
    if(address.length==0){
        addressErrorEl.innerHTML = 'Enter address';
        return false;
    }
    if(!address.match(/^([a-zA-z0-9/\\''(),-\s]{2,255})$/)){
        addressErrorEl.innerHTML ='enter valid address';
        return false;
    }else{
        addressErrorEl.innerHTML ='';
        return true;
    }
}

function validateEmail(){
                                
    let email = document.getElementById("email").value;
    console.log(email)
    if(email.length==0){
        emailErrorEl.innerHTML="please enter email"
        return false;
    }
    if(!email.match(/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/)){
        emailErrorEl.innerHTML = "Enter valid email";
        return false;
    }
    else{
         emailErrorEl.innerHTML = "";
         return true;
    }

}

function validateCity(){
          
    let city = document.getElementById("city").value;
    console.log(city)
    if(city.length==0){
        cityErrorEl.innerHTML="enter valid input"
        return false;
    }
    if(!city.match(/^[A-Za-z]*$/)){
        cityErrorEl.innerHTML = "enter valid input";
        return false;
    }
    else{
          cityErrorEl.innerHTML = "";
          return true;
    }

}
function validateMobile(){
    let mobile = document.getElementById("mobile").value;

    if(mobile.length==0){
        mobileErrorEl.innerHTML="enter mobile";
        return false
    }
    if(!mobile.match(/^[0-9]{10}$/)){
        mobileErrorEl.innerHTML = "enter valid mobile";
        return false;
    }else{
        mobileErrorEl.innerHTML = "";
        return true;
    }
}

function validatePincode(){
    let pincode = document.getElementById('pincode').value;
    if(pincode.length==0){
        pincodeErrorEl.innerHTML ='"enter pincode';
        return false
    }
    if(!pincode.match(/^[0-9]{6}$/)){
        pincodeErrorEl.innerHTML= 'enter valid pincode'
        return false;
    }else{
        pincodeErrorEl.innerHTML = ''
        return true
    }
}

function addAddress() {
    if (!validateName() || !validatePincode() ||!validateMobile() || !validateCity()  || !validateAddress() || !validateEmail()) {
        document.getElementById('errorMsg').innerHTML ="enter proper details"
        return false;
    }else{

        $('#addressAddForm').submit((e)=>{
            e.preventDefault()
            $.ajax({
                url:'/add-new-address',
                method:'post',
                data:$("#addressAddForm").serialize(),
                success:(response)=>{
                    if(response.status){
                        window.location.reload()
                    }
                }
            })
        })
    }
}

