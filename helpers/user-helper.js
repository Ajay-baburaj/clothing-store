const db = require('../config/connection')
const objectId = require('mongodb').ObjectId
const collection = require('../config/collection')
const bcrypt = require('bcrypt')
const { response } = require('../app')

module.exports={
    getUserDetails:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            try{

                let userDetails = db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId)})
                resolve(userDetails)
            }catch{
                reject(err)
            }
        })
    },
    passwordUpdate:(userId,passwordObj)=>{
        return new Promise(async(resolve,reject)=>{
            let userDetails =await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId)})
                console.log(userDetails)
             bcrypt.compare(passwordObj.currentPassword,userDetails.password).then(async(status)=>{
                if(status){
                    let newPassword = await bcrypt.hash(passwordObj.newPassword,10)
                    db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{
                        $set:{
                            password:newPassword
                        }
                    })
                    resolve({status:true})
                }else{
                    
                    resolve({status:false})
                }
            }).catch((err)=>{
                reject(err)
            })
        })

    },
    personalEdit:(reqBody,userId)=>{
        console.log(reqBody)
        return new Promise(async(resolve,reject)=>{

            let response ={}
            let userCheck = await db.get().collection(collection.USER_COLLECTION).findOne({email:reqBody.email,_id:{$ne:objectId(userId)}})
            
            if(userCheck){
                response.userExits = true;
                resolve(response)
            }else{
                await db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},
                {
                    $set:{
                        name:reqBody.name,
                        email:reqBody.email,
                        mobile:reqBody.mobile
                    }
                }).then(()=>{
                    response.userExits=false
                    resolve(response)
                }).catch((err)=>{
                    reject(err)
                })
            }

        }
        )
    },
 


}

