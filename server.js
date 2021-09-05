'use strict';
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const mongoose = require('mongoose');
const server = express();
server.use(cors());
server.use(express.json());


const PORT = process.env.PORT;
const uniSchema = new mongoose.Schema({
    country: String,
    name: String,
    web_pages: String,
    email: String
})
const unimodel = mongoose.model('uniDatabase', uniSchema);
mongoose.connect(process.env.MONG_LINK, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

server.get('/', Home);
server.get('/getApi', getApi);
server.post('/addFav', addFav);
server.get('/getFav', getFav);
server.delete('/deleteFav/:uniID', deleteFav);
server.put('/updateFav/:uniID', updateFav);

// Home function
function Home(req, res) {
    res.send('all is very very very good');
}
class university {
    constructor(item) {
        this.country = item.country;
        this.name = item.name;
        this.web_pages = item.web_pages[0];
    }
}
//server.get('/getApi',getApi); http://universities.hipolabs.com/search?country=Jordan
async function getApi(req, res) {
    let cityName = req.query.country;
    // console.log('cityName', cityName);
    let uniURL = `http://universities.hipolabs.com/search?country=${cityName}`;
    let uniData = await axios.get(uniURL);
    // console.log(uniData.data);
    let Data = uniData.data.map(item => {
        return new university(item);
    })
    res.send(Data);
}

// server.post('/addFav',addFav);
//  ------------- addFav -----------------
async function addFav(req, res) {
    let { country, name, web_pages, email } = req.body;
    let Obj = new unimodel({
        country: country,
        name: name,
        web_pages: web_pages,
        email: email
    })
    await Obj.save();
    unimodel.find({ email: email }, (err, Data) => {
        if (err) {
            console.log(err);
        } else {
            // console.log('Data:',Data);
            res.send(Data);
        }
    })
}

// server.get('/getFav',getFav);
//  -------------- getFav -----------
function getFav(req, res) {
    let email = req.query.email;

    unimodel.find({ email: email }, (err, Data) => {
        if (err) {
            console.log(err);
        } else {

            // console.log('Data::::::::',Data);
            res.send(Data);
        }
    })

}
// server.delete('/deleteFav:uniID',deleteFav);
// deleteFav
function deleteFav(req, res) {
    let { email } = req.body;
    let uniID = req.params.uniID;
    unimodel.remove({ _id: uniID }, (err, Data) => {
        if (err) {
            console.log(err);
        } else {
            unimodel.find({ email: email }, (err, Data) => {
                if (err) {
                    console.log(err);
                } else {

                    // console.log('Data2:::',Data);
                    res.send(Data);
                }

            })
        }
    })
}
// server.put('updateFav:uniID',updateFav)
function updateFav(req, res) {
    let uniID = req.params.uniID;
    let { country, name, web_pages, email } = req.body;

    unimodel.findByIdAndUpdate(uniID, { country, name, web_pages, email }, (err, Data) => {
        if (err) {
            console.log(err);
        } else {
            unimodel.find({ email: email }, (err, Data) => {
                if (err) {
                    console.log(err);
                } else {

                    console.log('Data2:::', Data);
                    res.send(Data);
                }

            })
        }
    })
}
server.listen(PORT, () => {
    console.log("all is goooooood", PORT);
})