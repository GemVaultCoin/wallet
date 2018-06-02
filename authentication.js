var web3 = require('./web3');
var ABI = require('./contracts/CrowdSaleABI.json');
var Record =  web3.eth.contract(ABI).at(process.env.COINCROWDSALE);

module.exports = function authenticate(req, res, next){
    if(req.session.isLogged && req.session){
        req.session.etherBal = web3.fromWei(web3.eth.getBalance(req.session.currentUserKey),"ether");
        Record.balanceOf(req.session.currentUserKey, (err,result) => {
            req.session.tokenBal = result;
        });
        req.icoEndDate = Date.UTC(2017, 8, 27, 12, 0, 0, 0);
        return next();
    }else{
        req.session.isLogged = false;
        req.session.destroy();
        res.render('./pages/common', { title: 'Session Expired!', heading:'<span class="sessEx">Session Expired!</span>',message: '<span class="seSLoginMess">Your session is expired. Please Re-Login to continue.</span>', linkHref: '/', linkText: '<span class="HeLogin">Click Here To Login</span>'});
    }
}
