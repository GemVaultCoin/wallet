document.onload = showTransaction();

function showTransaction()
{
    var localS = localStorage.getItem("userLanguage");
    axios.get('/api/gettokentrans?localStorage='+localS)
    .then((response) => {
        toastr.clear();
        var data = response.data.status;
        var divide = 10000;
        if(response.data.success && data.length > 0)
        {
            data.sort(function(a,b){ return a.timestamp - b.timestamp;})
            var tableid = document.getElementById("displaydata");
            tableid.innerHTML = "";
            for (var i = 0; i < data.length; i++) {
                var type;
                if (data[i].args.from == response.data.currentUserKey) {
                    type = 'OUT';
                }
                else {
                    type = 'IN';
                }
                var date = new Date(data[i].timestamp * 1000);
                var day = date.getDate();
                var month = date.getMonth() + 1;
                var year = date.getFullYear();
                var hh = checkTime(date.getHours());
                var mm = checkTime(date.getMinutes());
                var ss = checkTime(date.getSeconds());
                var tableid = document.getElementById("displaydata");
                if(type == 'IN')
                {
                    tableid.innerHTML += 
                    `<tr>
                        <th class="col-md-1 text-center text-success">${i + 1}</th>
                        <th class="col-md-1 text-center text-success">${day}-${month}-${year} ${hh}:${mm}:${ss}</th>
                        <th class="col-md-1 text-center text-success">${type}</th>
                        <th class="col-md-2 text-center text-success">${data[i].args.from}</th>
                        <th class="col-md-2 text-center text-success">${data[i].args.to}</th>
                        <th class="col-md-3 text-center text-success">${data[i].transactionHash}</th>
                        <th class="col-md-2 text-center text-success">${((data[i].args.value) / divide).toFixed(4)}</th>
                    </tr>`;
                }
                else
                {
                    tableid.innerHTML += 
                    `<tr>
                        <th class="col-md-1 text-center text-danger">${i + 1}</th>
                        <th class="col-md-1 text-center text-danger">${day}-${month}-${year} ${hh}:${mm}:${ss}</th>
                        <th class="col-md-1 text-center text-danger">${type}</th>
                        <th class="col-md-2 text-center text-danger">${data[i].args.from}</th>
                        <th class="col-md-2 text-center text-danger">${data[i].args.to}</th>
                        <th class="col-md-3 text-center text-danger">${data[i].transactionHash}</th>
                        <th class="col-md-2 text-center text-danger">${((data[i].args.value) / divide).toFixed(4)}</th>
                    </tr>`;
                }
            }
        }
        else
        {
            toastr.options = {};
            toastr.error('You have not done any transactions!');
        }
    })
    .catch((err) => {
        toastr.options = {};
        toastr.error('Technical Error Occured!');
    })
}

function checkTime(i) {
    return (i < 10) ? "0" + i : i;
}