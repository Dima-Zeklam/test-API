'use strict';
const axios = require('axios');
const express = require('express');
const server = express();
const cors = require('cors');
server.use(cors());
server.use(express.json());
require('dotenv').config();
const mongoose = require('mongoose');
// const PORT = 3001;
let inMemory = {};
const uniSchema = new mongoose.Schema({
    country: String,
    name: String,
    web_pages: String,
    email: String
})
const uniModel = mongoose.model('test', uniSchema);
mongoose.connect(`${process.env.mongo_link}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

//----- routes ------
server.get('/', Home);
server.get('/getApi', getApi);
server.post('/addFav', addFav);
server.get('/getFav', getFav);
server.delete('/deleteFav/:uniID',deleteFav);
server.put('/updateFav/:uniID',updateFav);
class universities {
    constructor(item) {
        this.country = item.country;
        this.name = item.name;
        this.web_pages = item.web_pages[0]
    }

}
//----------- Home Page ----------
function Home(req, res) {
    res.send('All gooood');
}

//-------- getApi-----
async function getApi(req, res) {
    let cityName = req.query.country
  
        // console.log(cityName);
    try {

        let url = `http://universities.hipolabs.com/search?country=${cityName}`;

        if (inMemory[cityName] !== undefined) {
            res.send(inMemory[cityName]);
            // console.log("inMemory[cityName]: ",inMemory[cityName]);
        } else {
            let universityData = await axios.get(url);
            // console.log("universityData:",universityData.data);
            let universityArray = universityData.data.map(item => {
                return new universities(item);
            })
            inMemory[cityName] = universityArray;
            res.send(universityArray);
            // console.log("universityArray",universityArray);
        }
    } catch (error) {
        console.log("error to get data from api", error);
        res.send(error);
    }


}
//----- AddFav -----
async function addFav(req, res) {

    const { country, name, web_pages, email } = req.body;
    // console.log('email: ', email);
    let newData = new uniModel({
        country: country,
        name: name,
        web_pages: web_pages,
        email: email
    })
  
    // console.log('newData: ', newData);
    await newData.save();
    uniModel.find({ email }, (error, uniData) => {
        if (error) {
            console.log(error);

        } else {
            // console.log('uniData', uniData);
            res.send(uniData);
        }
    })

}

//---------- getFav ------------
async function getFav(req,res) {
  let email = req.query.email;
  console.log(req.body);
  uniModel.find({email:email},(error,Data)=>{
      if(error){
          console.log('no data');
      }else{
          console.log(Data);
          res.send(Data);
              }
  })


}
// ----------- deleteFav ----------- /deleteFav/:uniID
async function deleteFav(req,res){
// let email = req.body.email;

 let uniID = req.params.uniID;
 uniModel.remove({_id:uniID},(err,Data)=>{
if(err){
    console.log(err);
}else{
    uniModel.find({},(err,Data))
    if(err){
        console.log(err);
    }else{
    res.send(Data);
}
}
 })
}

//--------- updateFav  -------------- '/updateFav/:uniID',
function updateFav(req,res){

//  let uniID = req.params.uniID;
//  const { country, name, web_pages,email } = req.body;
// console.log(req.body);
//  uniModel.findOne({_id:uniID},(err,Info)=>{
//     Info.country=country;
//     Info.name=name;
//     Info.web_pages=web_pages;
//     Info.email=email
//     Info.save().then(()=>{
//         if(err){
//             console.log(err)
//                  }else{
                 
//                     uniModel.find({email: req.body.email},(err,UpdatData)=>{
//                         if(err){
//                             console.log(err)
//                         }else{
//                         res.send(UpdatData);
//                     }
//                     })
                    
//                  }
//     }).catch((error)=>{
//         console.log(error);
//     })

//  })
//--------------------------
    let uniID = req.params.uniID;
    let { country, name, web_pages,email }=req.body;
    console.log("body ??????",req.body);
    uniModel.findByIdAndUpdate(uniID, { country, name, web_pages,email },(error,updatedData)=>{
        if(error) {
            console.log('error in updating the data')
        } else {
            console.log("Data updated!$$$$$$$",updatedData);
            
            uniModel.find({email: email},function(err,data){
                if(err) {
                    console.log('error in getting the data')
                } else {
                  console.log("data ddddd: ",data);
                    res.send(data);
                }
            })
        }
    })
}
server.listen(process.env.PORT, () => {
    console.log('All good', process.env.PORT);
})
