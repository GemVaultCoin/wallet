var web3 = require('./webrpc');
var Tx = require('./api/services/tx');

module.exports = async function authenticate(req, res, next) {
    if (req.session.isLogged && req.session)  {

        const t = new Tx({publickey: req.session.currentUserKey}, {})
        const balance = await t.getBalance()

        req.session.etherBal = balance.ethB
        req.session.tokenBal = balance.tokenB
        req.icoEndDate = Date.UTC(2017, 8, 27, 12, 0, 0, 0);

        console.log(req.session)

        return next();
    } else {
        req.session.isLogged = false;
        req.session.destroy();
        res.render('./pages/common', { title: 'Session Expired!', heading:'<span class="sessEx">Session Expired!</span>',message: '<span class="seSLoginMess">Your session is expired. Please Re-Login to continue.</span>', linkHref: '/', linkText: '<span class="HeLogin">Click Here To Login</span>'});
    }
}
