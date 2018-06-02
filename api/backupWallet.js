var fs = require('file-system');
var DB = require('../db');
var crypto = require('crypto');
var keythereum = require("keythereum");
var getLanguageMessage = require('./getLanguageMessage');

function backupPrivateKey(req,res,next)
{
    var lang = req.body.localStorage == "zh_CN" ? getLanguageMessage.ch : getLanguageMessage.en

    DB.FinalUserDB.findOne({ email: req.body.email, publickey: req.session.currentUserKey })
    .then((response) => {
        if(response)
        {
            var hashedpass = req.body.hashedPass;
            var servsalt = response.serversalt;
            var finalpass = crypto.createHash('sha256').update(hashedpass+servsalt).digest("hex");
            if(finalpass == response.password)
            {
                var addr = (req.session.currentUserKey).substr(2);
                var path = '/root/.ethereum/keystore/';
                var passphrase = decrypt(req.session.passphrase);
                fs.readdir(path, function(err, list)
                {
                    if(err) throw err;
                    var regex = new RegExp(`${addr}$`);
                    list.forEach(function(item)
                    {
                        if(regex.test(item))
                        {
                            fs.readFile(path+item,'utf-8',
                                function(err, contents){
                                    var data = JSON.parse(contents);
                                    var privateKey = keythereum.recover(passphrase,data);
                                    var hexPrivkey = privateKey.toString('hex');
                                    res.send({success:true, status: hexPrivkey});
                            });
                        }
                    });
                });
            }
            else
            {
                res.send({success:false, status:lang.wronpe});
            }
        }
    })
    .catch((err)=>{
        res.send({success: false, status:lang.terro});
    });
}

function decrypt(text)
{
  var decipher = crypto.createDecipher(process.env.ALGORITHM, process.env.ENCRYPTPASS);
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

module.exports = {
    backupPrivateKey
}
