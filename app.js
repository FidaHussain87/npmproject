var createError = require('http-errors');
var express = require('express');
var path = require('path');
var router = express.Router();
var ObjectId = require('mongodb').ObjectId;

var cookieParser = require('cookie-parser');
var logger = require('morgan');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/testdb";

var indexRouter = require('./routes/index');

var app = express();
MongoClient.connect(url, function (err, db) {
  if (err) throw err;
  console.log("Database created!");
  db.close();
});


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// register
app.post("/api/manufacturer/register", (req, res) => {
  MongoClient.connect(url, (err, db) => {
    if (err) {
      return res.send({ code: 500, error: err, message: "API connect failed." });
    }


    let { Name, UPCPrefix, AdminFirstName, ManufacturerEmail, AdminLastName, AdminEmailAddress, AdminGenderId, Password, ConfirmPassword } = req.query

    var dbo = db.db("testdb")

    if (Password != ConfirmPassword) {
      res.send({
        code: 500,
        message: 'password not match'
      })
    } else {
      let obj = {
        Name,
        brands: [],
        addresses: [],
        campaigns: {},
        UPCPrefix, AdminEmailAddress, AdminFirstName, ManufacturerEmail, AdminLastName, AdminGenderId
      }
      dbo.collection("Manufacturer").insertOne(obj, (error, result) => {
        if (error) {
          return res.send({ code: 500, error: error, message: "API failed." });
        }
        db.close();
        res.send({
          code: 200,
          message: "Record inserted",
        })
      })
    }


  })
})
// adds Brands
app.post("/api/manufacturers/:manufacturerId/brands", (req, res) => {
  MongoClient.connect(url, (err, db) => {
    if (err) {
      return res.send({ code: 500, error: err, message: "API connect failed." });
    }
    let { model } = req.body;
    let { manufacturerId } = req.params
    var dbo = db.db("testdb");
    dbo.collection("Manufacturer").findOne({ "_id": ObjectId(manufacturerId) }, (error, result) => {
      if (error) {
        return res.send({ code: 500, error: error, message: "API failed." });
      }
      console.log(result);

      let brandDataArray = result.brands;

      brandDataArray.push(...model);
      dbo.collection("Manufacturer").update({ "_id": ObjectId(manufacturerId) }, { $set: { brands: brandDataArray } }, (error2, result2) => {
        if (error) {
          return res.send({ code: 500, error: error2, message: "API failed." });

        }
        res.send({
          code: 200,
          message: "Record Inserted",
          data: result2
        })
      })
    })
  })
})


// 

app.get("/api/manufacturers/:manufacturerId/brands/:id", (req, res) => {
  MongoClient.connect(url, (err, db) => {
    if (err) {
      return res.send({ code: 500, error: err, message: "API connect failed." });
    }
    let { manufacturerId, id } = req.params
    var dbo = db.db("testdb");

    dbo.collection("Manufacturer").findOne({ "_id": ObjectId(manufacturerId) }, (error, result) => {
      if (error) {
        return res.send({ code: 500, error: error, message: "API failed." });
      }
      let manufacturerArray = result.brands;
      let resArray = manufacturerArray.filter(x => x.id == id)
      res.send({
        code: 200,
        message: "Success",
        data: resArray
      })
    })

  })


  //  incomplete
  app.get("/api/manufacturers/:manufacturerId/campaigns", (req, res) => {
    MongoClient.connect(url, (err, db) => {
      if (err) {
        return res.send({ code: 500, error: err, message: "API connect failed." });
      }
      let { manufacturerId } = req.params;
      let {searchTerms} = req.query
      var dbo = db.db("testdb");
      dbo.collection("Manufacturer").findOne({"_id":ObjectId(manufacturerId)},(error,result)=>{
           let reultArray = result.campaigns;
           let compaignData= reultArray.filter(x=> x.name== searchTerms)
          


      res.send({
        code : 200,
        message:"Success",
        data:compaignData
      })       
      })
      

    })
  })

  // 
  app.post("/api/manufacturers/:manufacturerId/campaigns", (req, res) => {
    MongoClient.connect(url, (err, db) => {
      if (err) {
        return res.send({ code: 500, error: err, message: "API connect failed." });
      }
      let { newCampaignModel } = req.body;
      let { manufacturerId } = req.params;
      let { imageFile } = req.query;
      dbo.collection("Manufacturer").findOne({ "_id": ObjectId(manufacturerId) }, (error, result) => {
        if (error) {
          return res.send({ code: 500, error: error, message: "API failed." });
        }
        console.log(result);

        dbo.collection("Manufacturer").update({ "_id": ObjectId(manufacturerId) }, { $set: { campaigns: newCampaignModel } }, (error2, result2) => {
          if (error) {
            return res.send({ code: 500, error: error2, message: "API failed." });
  
          }
          res.send({
            code: 200,
            message: "Record Inserted",
            data: result2
          })
        })

      })



    })
  })

})


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});





module.exports = app;
