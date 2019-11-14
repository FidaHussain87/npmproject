var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var url = "mongodb://localhost:27017";
const accountSid = 'ACcd685f832989d513ea67f921bcdc28df';
const authToken = 'de528e979985db334ac3997ab287c028';
const client = require('twilio')(accountSid, authToken);

router.post("/api/consumers/register", (req, res) => {
  MongoClient.connect(url, (err, db) => {
    if (err) {
      return res.send({ code: 500, error: err, message: "API connect failed." });
    }
    let { customerRegisterationInfo } = req.body
    customerRegisterationInfo.couponCategories = []
    customerRegisterationInfo.couponCampaigns = []
    customerRegisterationInfo.userVerificationCode = ""
    var dbo = db.db("testdb");

    dbo.collection("Consumers").insertOne(customerRegisterationInfo, (error, result) => {
      if (error) {
        return res.send({ code: 500, error: error, message: "API failed." });
      }
      db.close();

      res.send({
        code: 200,
        data: result,
        message: "Record inserted."
      })
    });
  })

})

router.get("/api/consumers/:id", (req, res) => {
  MongoClient.connect(url, (err, db) => {
    if (err) res.send({ code: 500, message: "API failed." });
    let { id } = req.params
    var dbo = db.db("testdb");

    dbo.collection("Consumers").findOne({ "_id": ObjectId(id) }, (err, result) => {
      db.close()
      res.send({
        code: 200,
        data: result,
        message: "Result."
      })
    })
  });

})


router.post("/api/consumers/:consumerId/categories", (req, res) => {
  MongoClient.connect(url, (err, db) => {
    if (err) {
      return res.send({ code: 500, error: err, message: "API connect failed." });
    }
    let { couponCategories } = req.body
    let { consumerId } = req.params
    var dbo = db.db("testdb");

    dbo.collection("Consumers").findOne({ "_id": ObjectId(consumerId) }, (error, result) => {
      if (error) {
        return res.send({ code: 500, error: error, message: "API failed." });
      }
      let couponCategoriesArray = result.couponCategories
      couponCategoriesArray.push(...couponCategories)
      dbo.collection("Consumers").update({ "_id": ObjectId(consumerId) }, { $set: { couponCategories: couponCategoriesArray } }, (error2, result2) => {
        if (error) {
          return res.send({ code: 500, error: error2, message: "API failed." });
        }
        db.close();

        res.send({
          code: 200,
          data: result2,
          message: "Record inserted."
        })
      });
    })
  })

})

router.delete("/api/consumers/:consumerId/categories", (req, res) => {
  MongoClient.connect(url, (err, db) => {
    if (err) {
      return res.send({ code: 500, error: err, message: "API connect failed." });
    }
    let { categoryIds } = req.body
    let { consumerId } = req.params
    var dbo = db.db("testdb");

    dbo.collection("Consumers").findOne({ "_id": ObjectId(consumerId) }, (error, result) => {
      if (error) {
        return res.send({ code: 500, error: error, message: "API failed." });
      }
      let couponCategoriesArray = result.couponCategories

      for (var i = 0; i < categoryIds.length; i++) {
        for (let index = 0; index < couponCategoriesArray.length; index++) {
          if (couponCategoriesArray[index].categoryId == categoryIds[i].categoryId) {
            couponCategoriesArray.splice(index, 1)
          }
        }
      }
      dbo.collection("Consumers").update({ "_id": ObjectId(consumerId) }, { $set: { couponCategories: couponCategoriesArray } }, (error2, result2) => {
        if (error) {
          return res.send({ code: 500, error: error2, message: "API failed." });
        }
        db.close();

        res.send({
          code: 200,
          data: result2,
          message: "Record inserted."
        })
      });
    })

  })

})


router.get("/api/consumers/:consumerId/categories", (req, res) => {
  MongoClient.connect(url, (err, db) => {
    if (err) res.send({ code: 500, message: "API failed." });
    let { consumerId } = req.params
    var dbo = db.db("testdb");

    dbo.collection("Consumers").findOne({ "_id": ObjectId(consumerId) }, (err, result) => {
      console.log(result)
      db.close()
      res.send({
        code: 200,
        data: result.couponCategories,
        message: "Result."
      })
    })
  });

})

router.post("/api/consumers/:consumerId/pin-coupons", (req, res) => {
  MongoClient.connect(url, (err, db) => {
    if (err) {
      return res.send({ code: 500, error: err, message: "API connect failed." });
    }
    let { couponCampaigns } = req.body
    let { consumerId } = req.params
    var dbo = db.db("testdb");

    dbo.collection("Consumers").findOne({ "_id": ObjectId(consumerId) }, (error, result) => {
      if (error) {
        return res.send({ code: 500, error: error, message: "API failed." });
      }
      let couponCampaignsArray = result.couponCampaigns
      couponCampaignsArray.push(...couponCampaigns)
      dbo.collection("Consumers").update({ "_id": ObjectId(consumerId) }, { $set: { couponCampaigns: couponCampaignsArray } }, (error2, result2) => {
        if (error) {
          return res.send({ code: 500, error: error2, message: "API failed." });
        }
        db.close();

        res.send({
          code: 200,
          data: result2,
          message: "Record inserted."
        })
      });
    })
  })

})

router.delete("/api/consumers/:consumerId/pin-coupons", (req, res) => {
  MongoClient.connect(url, (err, db) => {
    if (err) {
      return res.send({ code: 500, error: err, message: "API connect failed." });
    }
    let { couponCampaigns } = req.body
    let { consumerId } = req.params
    var dbo = db.db("testdb");

    dbo.collection("Consumers").findOne({ "_id": ObjectId(consumerId) }, (error, result) => {
      if (error) {
        return res.send({ code: 500, error: error, message: "API failed." });
      }
      let couponCampaignsArray = result.couponCampaigns

      for (var i = 0; i < couponCampaigns.length; i++) {
        for (let index = 0; index < couponCampaignsArray.length; index++) {
          if (couponCampaignsArray[index].campaignId == couponCampaigns[i].campaignId) {
            couponCampaignsArray.splice(index, 1)
          }
        }
      }
      dbo.collection("Consumers").update({ "_id": ObjectId(consumerId) }, { $set: { couponCampaigns: couponCampaignsArray } }, (error2, result2) => {
        if (error) {
          return res.send({ code: 500, error: error2, message: "API failed." });
        }
        db.close();

        res.send({
          code: 200,
          data: result2,
          message: "Record inserted."
        })
      });
    })

  })

})


router.get("/api/Gender", (req, res) => {
  MongoClient.connect(url, (err, db) => {
    if (err) res.send({ code: 500, message: "API failed." });
    var dbo = db.db("testdb");

    dbo.collection("RefGenders").find().toArray((err, result) => {
      db.close()
      res.send({
        code: 200,
        data: result,
        message: "Result."
      })
    })
  });

})


router.post("/api/merchants/register", (req, res) => {
  MongoClient.connect(url, (err, db) => {
    if (err) {
      return res.send({ code: 500, error: err, message: "API connect failed." });
    }
    let { model } = req.body
    // model.couponCategories = []
    // model.couponCampaigns = []
    var dbo = db.db("testdb");

    dbo.collection("Merchants").insertOne(model, (error, result) => {
      if (error) {
        return res.send({ code: 500, error: error, message: "API failed." });
      }
      db.close();

      res.send({
        code: 200,
        data: result,
        message: "Record inserted."
      })
    });
  })

})

router.post("/api/consumers/:id/phone/send-verification-code", (req, res) => {
  MongoClient.connect(url, (err, db) => {
    if (err) {
      return res.send({ code: 500, error: err, message: "API connect failed." });
    }
    let { id } = req.params
    var dbo = db.db("testdb");

    dbo.collection("Consumers").findOne({ "_id": ObjectId(id) }, (error, result) => {
      if (error) {
        return res.send({ code: 500, error: error, message: "API failed." });
      }

      let date = Date.now().toString()

      let code = date.substr(date.length - 4)
      let phone = result.phoneNumber
      client.messages
        .create({ body: `You verification Code: ${code}`, from: "+12023014183", to: phone })
        .then(message => {

          dbo.collection("Consumers").update({ "_id": ObjectId(id) }, { $set: { userVerificationCode: code } }, (error, result) => {
            
            db.close();

            res.send({
              code: 200,
              data: result,
              message: "Record inserted."
            })
          })
        }).catch(err => {
          console.log(err)
        })


    });
  })

})

module.exports = router;
