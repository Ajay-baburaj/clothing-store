const db = require('../config/connection')
const objectId = require('mongodb').ObjectId
const bcrypt = require('bcrypt')
const collection = require('../config/collection')
const { use, response } = require('../app')

module.exports={

    doSignup:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            const response = {}
        
            let usercheck = await db.get().collection("userInfo").findOne({email:userData.email})
            if(usercheck){
                response.user = false;
                console.log("email already exits")
                response.errorMessage = "email already Exists"
                resolve(response)
            }else{
                userData.password = await bcrypt.hash(userData.password,10)
                db.get().collection("userInfo").insertOne(userData).then((data)=>{
                    response.user=true;
                    resolve(response)
                }).catch((err)=>{
                    reject(err)
                })
            }
        })
    },





    doLogin:(userData)=>{
        return new Promise (async(resolve,reject)=>{
            const response ={}

            let usercheck = await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
            if(usercheck){
                
                bcrypt.compare(userData.password,usercheck.password).then((status)=>{
                    if(status){
                        response.booleanCheck= true
                        response.user =  usercheck
                        resolve(response)
                        console.log('success ')
                    }else{
                        console.log("unsuccesfull")
                        response.passwordErr = "Incorrect Password"
                        resolve(response)
                    }
                }).catch((err)=>{
                    reject(err)
                })
                
            }else{
                response.booleanCheck= false
                resolve(response)
            }
        })
    },
    getUserDetails:()=>{
        return new Promise ((resolve,reject)=>{
            try{
                const infos = db.get().collection('userInfo').findOne()
                resolve(infos)

            }catch{
                reject(err)
            }
        })
    },

    getUserMobile:(mobileNum)=>{
        return new Promise((resolve,reject)=>{
            try{
                const infos =db.get().collection('userInfo').findOne({mobile:mobileNum})
                resolve(infos)

            }catch{
                reject(err)
            }
        })
    },

    loginOtp:(mobileNum)=>{
        return new Promise(async(resolve,reject)=>{
            try{

                let response = {}
                const details = await db.get().collection('userInfo').findOne({mobile:mobileNum})
                if(details){
                    response.user = details
                    response.status = true
                    resolve(response)
                    console.log(response);
                }else{
                    response.status = false
                    resolve(response)
                }
            }catch{
                reject(err)
            }
        })
    },

    validateRefferalCode:(userData,referalBonus)=>{
        console.log('==============')
        console.log(userData)
        console.log('==============')
        return new Promise(async(resolve,reject)=>{
        let referalCheck =  await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userData.referalId)})
        if(referalCheck){
            console.log('==============')
            console.log(referalCheck)
            const response = {}
            console.log('==============')

            let usercheck = await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
            if(usercheck){
                response.user = false;
                console.log("email already exits")
                response.errorMessage = "email already Exists"
                resolve(response)
            }else{
                // userData.password = 
                let userDetails= {
                    name:userData.name,
                    referalId:objectId(userData.referalId),
                    referalBonus:[referalBonus],
                    email:userData.email,
                    mobile:userData.mobile,
                    status:userData.status,
                    password: await bcrypt.hash(userData.password,10)
                }
                db.get().collection("userInfo").insertOne(userDetails).then(async(data)=>{
                    response.user=true;
                  let referedUpdate = await db.get().collection(collection.USER_COLLECTION).updateOne({ _id:objectId(userData.referalId)},
        
                    {
                        
                        $push:{
                            referalBonus: 50
                        }
                    
                    })

                    console.log(referedUpdate)
                 
                
                    
                    resolve(response)
                }).catch((err)=>{
                    reject(err)
                })
            }



        }else{
            response.refferalError = true;
            resolve(response)
        }
        })
    },

    getReferalTotal:(userId)=>{
        return new Promise((resolve,reject)=>{
        walletTotal=    db.get().collection(collection.USER_COLLECTION).aggregate([
                {
                    $match:{_id:objectId(userId)}
                },
                {
                    $project:{
                        walletTotal:{$sum:'$referalBonus'}
                    }
                }
            ]).toArray()
            resolve(walletTotal)
        })
    }

}
