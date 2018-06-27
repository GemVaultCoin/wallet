document.onload = getTokenSale();

setInterval(getTokenSale, 60000);
setInterval(rates, 1000);

function checkTime(i) {
    return (i < 10) ? "0" + i : i;
}

function rates()
{
    axios.get('https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=BTC,ETH')
    .then((response) => {
        document.getElementById('price_btc').innerHTML = response.data.BTC;
        document.getElementById('price_eth').innerHTML = response.data.ETH;
    })
    .catch((err) => {
        console.log('Internet Disconnected. Please check your Internet Connection');
    });
}

function getTokenSale()
{
    axios.get('/api/gettokensale')
    .then((response) => {
        if(response.data.status)
        {
            document.getElementById("smnx-sold").innerHTML = parseFloat(response.data.tokenBal).toFixed(4);
            document.getElementById("usd-raised").innerHTML = parseFloat(response.data.tokenBal*0.25).toFixed(4);
            document.getElementById("smnx-holders").innerHTML = response.data.tokenHolders;
            document.getElementById("smnx-wallet-users").innerHTML = response.data.walletUsers;
        }
        else
        {
            document.getElementById("smnx-sold").innerHTML = 0;
            document.getElementById("usd-raised").innerHTML = 0;
            document.getElementById("smnx-holders").innerHTML = 0;
            document.getElementById("smnx-wallet-users").innerHTML = 0;
        }
    })
    .catch((err) => {
        document.getElementById("smnx-sold").innerHTML = 0;
        document.getElementById("usd-raised").innerHTML = 0;
        document.getElementById("smnx-holders").innerHTML = 0;
        document.getElementById("smnx-wallet-users").innerHTML = 0;
    });
}

function timer(){
    var LANG = localStorage.getItem("userLanguage") == "zh_CN" ? lang.ch :lang.en;
    var countDownDate = new Date("2018-07-08");
    var x = setInterval(function() {
        var now = new Date().getTime();
        var distance = countDownDate - now;
        // Time calculations for days, hours, minutes and seconds
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        // var d=(days.toString().length>=2) ? days:'0'+days;
        // console.log('dd',d)
        document.getElementById('ico_days').innerHTML=(days.toString().length>=2) ? days:'0'+days;
        document.getElementById('ico_hours').innerHTML=(hours.toString().length>=2) ? hours:'0'+hours;
        document.getElementById('ico_minutes').innerHTML=(minutes.toString().length>=2) ? minutes:'0'+minutes;
        document.getElementById('ico_seconds').innerHTML=(seconds.toString().length>=2) ? seconds:'0'+seconds;
        // Output the result in an element with id="icoDayleft"
        //----------------------------------------------------------------------------------------------------------chanage here
        document.getElementById("icoDayleft").innerHTML = LANG.STAGEOneCOUNTINGDOWN;
        // document.getElementById("icoDayleft").innerHTML = LANG.lang.PreSalecounting;
        // document.getElementById("icoDayleft").innerHTML = LANG.lang.PreSaleStart;
        // document.getElementById("icoDayleft").innerHTML = LANG.lang.Days_Left;
        // If the count down is over, write some text
        if (distance < 0) {
            clearInterval(x);
            //----------------------------------------------------------------------------------------------------------chanage here
            // document.getElementById("icoDayleft").innerHTML = `<h5 class="text-danger">${LANG.lang.PreSaleStart}</h5>`;
            document.getElementById("icoDayleft").innerHTML = `<h5 class="text-danger">${LANG.lang.STAGEOneCOUNTINGDOWN}</h5>`;
            // document.getElementById("icoDayleft").innerHTML = `<h5 class="text-danger">${LANG.lang.EXPIRED}</h5>`;
            document.getElementById('ico_days').innerHTML="00";
            document.getElementById('ico_hours').innerHTML="00";
            document.getElementById('ico_minutes').innerHTML="00";
            document.getElementById('ico_seconds').innerHTML="00";
        }
    }, 1000);
}
