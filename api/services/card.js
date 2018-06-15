var mongoose		=	require('mongoose');
var cardModel		=	require('../../models/Cards');
var statuses    = require('../../models/Statuses')
var userModel   = require('../../models/User');
var loc         = require('./../getLanguageMessage');

function removeCard(userid) {
  cardModel.update({userid: userid}, {$set:{deleted:true}}).exec();
}

function updateUserCurrentCard(uid, card) {
  userModel.update({_id: uid}, {$set:{currentCard: card}}).exec();
}

async function cardExists(cardNumber) {

    //client request to use one card under multiple accounts
    return false

    /*
    let d = await cardModel.count({number:cardNumber, deleted: false});
    console.log("card exists: " + d)
    return d && d > 0
    */
}

async function hasApprovedCard(uid) {
    let d = await cardModel.count({deleted: false, status: statuses[1],
                                   userid: uid});
    console.log("has approved cards: " + d)
    return d && d > 0
}

function getbstatus(status) {
  return (status == statuses[0] || status == statuses[1])
}

function isAdmin(uid, res) {
    userModel.findOne({_id: uid}, function(e, usr) {
      if (usr.admin) {
        return true
      }
      return res.status(403).send({ status: false });
    })
}

module.exports  = {

  savecardMethod: async function(req, res,  next) {

        var lang = req.body.localStorage == "zh_CN" ? loc.ch : loc.en
        var cardNumber = req.body.cardnumber;
        var expiryDate = req.body.expirydate;
        var cvc = '';//req.body.cvc;
        var name = req.body.name;
        var userid = req.currentUser._id;

        const ce = await cardExists(req.body.cardnumber)
        const ha = await hasApprovedCard(userid)

        if (ce || ha) {
          return res.status(400).send({status: false, message: lang.cardExists});
        }

        removeCard(userid);

        card = new cardModel({
          mask: cardNumber.substr(cardNumber.length - 4),
          number: cardNumber,
          name: name,
          expire: expiryDate,
          userid: userid,
          status: statuses[1],
          deleted : false
        });

        updateUserCurrentCard(userid, card.mask)

        card.save().then(function(saved){
          console.log('saved', saved)
          return res.status(200).send({status: true, message:lang.CardSaved});
        }).catch(function(e){
          console.log('e', e)
          return res.status(400).send({status: false, message: lang.CardErrSaved});
        });
  },

  updateCardStatusMethod: function(req, res, next) {

      var s = ''

      console.log(req.body.status)

      if (req.body.status == "false") {
        s = statuses[2]
      }
      else {
        s = statuses[1]
      }

      console.log(s)

      cardModel.update({deleted: false, _id: req.body.id},
           {$set:{status: s}},
           function (e, card) {
             if (e) {
               return res.status(400).send({status: false, message: err})
             }
            return res.status(200).send({status: true, data: rdata})
         });
  },

  getcardMethod: function(req, res,  next) {

      var uid = req.currentUser._id

      //TODO: check if admin
      if (req.query.id) {
          uid = req.query.id;
      }

      cardModel.findOne({userid:uid, deleted: false}, function (err, card) {

            if (err) {
              return res.status(400).send({status: false, message: err})
            }

            if (card) {
              rdata = {
                id: card._id,
                mask: '**** **** **** ' + card.mask,
                name: card.name,
                status: card.status,
                bstatus: getbstatus(card.status),
                statuses: cardModel.statuses
              }
            }
            else {
              rdata = {
                statuses: cardModel.statuses
              }
            }
            return res.status(200).send({status: true, data: rdata})
      });
  },

  hasApprovedCard

}
