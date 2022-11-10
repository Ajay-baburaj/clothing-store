const db =require('../config/connection')
var objectId = require('mongodb').ObjectId

module.exports={
    signupUserInfo:()=>{
        return new Promise((resolve,reject)=>{
            try{
                const infos = db.get().collection('userInfo').find().toArray()
                resolve(infos)

            }catch(err){
                reject(err)
            }
        })
    },
    blockUser:(userId)=>{
        return new Promise(async(resolve,reject)=>{
        await db.get().collection('userInfo').updateOne({_id:objectId(userId)},{$set:{
            status:false
          }}).then(()=>{
            resolve()
          }).catch((err)=>{
            reject(err)
          })
          
        })
    },
    unblockUser:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            try{

                console.log('call is coming into promise')
                let user = await db.get().collection('userInfo').updateOne({_id:objectId(userId)},{$set:{
                    status:true
                }})
                console.log('unblocked user is here')
                console.log(user)
                resolve(user)
            }catch(err){
                reject(err)
            }
        })
    },
    
}