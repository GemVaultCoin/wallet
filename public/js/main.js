function getLocalBuyMessageText(lang, amount, totalCost, currentEtherBalance) {
		if (lang == 'zh_CN') {
			var stmpl = `<p class="text-center buy_mes_1">你已经要求购买<br><span class="text-danger font-bold">${amount} 个GVC</span>&nbsp;代币<br><br>
			总共的代币花费 = <span class="text-danger font-bold">${totalCost}以太币</span><br>
			您的以太币余额 = <span class="text-danger font-bold">${currentEtherBalance}</span><br>
			因为您的以太币的余额不足, <span class="text-danger font-bold">${totalCost} Ether</span> 您将被转向付款平台进行付款.<br>
			<br>
			请按确认继续.</p>`;
			alert(stmpl)
			return stmpl
		} else {
			return
			`<p class="text-center buy_mes_1">You have requested a purchase of<br><span class="text-danger font-bold">${amount} GVC</span>&nbsp;Tokens<br><br>
			Total Cost of Tokens in Ether = <span class="text-danger font-bold">${totalCost}</span><br>
			Your Ether Balance = <span class="text-danger font-bold">${currentEtherBalance}</span><br>
			As you have sufficient Ether Balance, <span class="text-danger font-bold">${totalCost} Ether</span> will be deducted from your current Ether Balance.<br>
			<br>
			Press Confirm To Proceed.</p>`
		}

}


function buyToken(choice)
{
	var currency = document.getElementById('buy-currency').value;
	var amount = parseFloat(document.getElementById('buy-amount').value);
	var amount_to_send = 0
	var terms = document.getElementById('buy-tnc').checked;
	if(choice == 'Confirm')
	{
		if(currency && amount && terms && amount > 0)
		{
			if(currency == 'ETH')
			{
				var localS = localStorage.getItem("userLanguage");
				axios.all([
				axios.get('/api/gettokenrate'),
				axios.get('/api/getuserdetails?localStorage='+localS)])
				.then(axios.spread(function (etherPrice, userDetails) {
					precision = Math.pow(10, 18-etherPrice.data.decimals)
					totalCost = ((etherPrice.data.eth2token/precision)*amount).toFixed(4)
					amount_to_send = totalCost
					if((totalCost + 0.0009) < userDetails.data.currentEtherBalance)
					{
						$('#confirmationModal').modal('toggle');
						document.getElementById("payment-terms").innerHTML = getLocalBuyMessageText(localS, amount, totalCost, userDetails.data.currentEtherBalance);
						document.getElementById("proceedButton").disabled = false;
						document.getElementById("canButton").disabled = false;
					}
					else
					{
						$('#confirmationModal').modal('toggle');
						document.getElementById("payment-terms").innerHTML =
						`<p class="text-center">You have requested a purchase of<br><span class="text-danger font-bold">${amount} GVC</span>&nbsp;Tokens<br><br>
						Total Cost of Tokens in Ether = <span class="text-danger font-bold">${totalCost}</span><br>
						Your Ether Balance = <span class="text-danger font-bold">${userDetails.data.currentEtherBalance}</span><br>
						As you have in-sufficient Ether Balance, <span class="text-danger font-bold">You will be directed towards the payment gateway for payment.</span><br>
						<br>
						Press Confirm To Proceed.</p>`;
						document.getElementById("proceedButton").disabled = false;
						document.getElementById("canButton").disabled = false;
					}
				}))
				.catch((err) => {
					toastr.error('We are unable to process your request at this time. Please try again later!');
				});
			}
			else
			{
				$('#confirmationModal').modal('toggle');
				document.getElementById("payment-terms").innerHTML =
				`<p class="text-center">You have requested a purchase of<br><span class="text-danger font-bold">${amount} GVC</span>&nbsp;Tokens<br><br>
				Total Cost of Tokens in USD = <span class="text-danger font-bold">$${amount}</span><br>
				Your Payment Mode = <span class="text-danger font-bold">${currency}</span><br>
				As you have selected BTC as the payment mode,&nbsp;<span class="text-danger font-bold">You will be directed towards the payment gateway for payment.</span><br>
				<br>
				Press Confirm To Proceed.</p>`;
				document.getElementById("proceedButton").disabled = false;
				document.getElementById("canButton").disabled = false;
			}
		}
		else
		{
			toastr.error('Either a field is Blank or Amount of Token is Zero. Please correct and retry.');
		}
	}
	else if(choice == 'Proceed')
	{
				axios.get('/api/gettokenrate').then( function(rate) {
								precision = Math.pow(10, 18-rate.data.decimals)
								totalCost = ((rate.data.eth2token/precision)*amount).toFixed(4)
								amount_to_send = totalCost
								// document.getElementById("buy-package").disabled = true;
								$("#paymentCheckbox").children(".checked").removeClass("checked");
								document.getElementById('buyTokenForm').reset();
								toastr.options = { timeOut: 0, extendedTimeOut: 0}
								toastr.info('Transaction Under Process. Please Wait! You will get a popup confirming the status of the Transaction');
								document.getElementById("proceedButton").disabled = true;
								document.getElementById("canButton").disabled = true;
								setTimeout(function(){
									if(currency == 'ETH')
									{
										$('#confirmationModal').modal('toggle');
									}
								},4000);
								axios.post('/api/buytoken',{currency: currency, amount: amount_to_send, terms:terms})
								.then((response) => {
									console.log('response',response)
									if(response.data.status)
									{
										// document.getElementById("buy-package").disabled = false;
										toastr.clear();
										toastr.options = {};
										toastr.info('Your transaction is processing by the network, you can check transaction status using hash value above');
										if(currency == 'BTC')
										{
											$('#confirmationModal').modal('toggle');
										}
										//var result = response.data.result;
										//document.getElementById("imageQrCode").src = result.qrcode_url;
										//document.getElementById("amount-to-be-paid").innerHTML = `${result.amount}&nbsp;${response.data.currency}`;
										document.getElementById("payment-address").innerHTML = response.data.addr;
										document.getElementById("transaction-id").innerHTML = response.data.tHash;
										//document.getElementById("confirm").innerHTML = response.data.addr;
										document.getElementById("checkTx").href = "https://rinkeby.etherscan.io/tx/" + response.data.tHash;
										$('#paymentModal').modal('toggle');
									}
									else
									{
										console.log('response.data',response.data)
										// document.getElementById("buy-package").disabled = false;
										toastr.clear();
										$('#confirmationModal').modal('toggle');
										toastr.options = {};
										toastr.error(`${response.data.message}`);
									}
								})
								.catch((err) => {
									console.log('err',err)
									// document.getElementById("buy-package").disabled = false;
									toastr.error('We are unable to process your request at this time. Please try again later!');
								});
				})
				.catch((err) => {
					toastr.error('We are unable to process your request at this time. Please try again later!');
				});
	} else
	{
		$("#paymentCheckbox").children(".checked").removeClass("checked");
		$('#confirmationModal').modal('toggle');
		document.getElementById('buyTokenForm').reset();
		toastr.info('Transaction Cancelled!');
	}
}

function buyPackage()
{
	var currency = document.getElementById('payment-mode').value;
	var amount = parseFloat(document.getElementById('select-package').value);
	var terms = document.getElementById('buytnc').checked;
	if(currency && amount && terms)
	{
		$("#payment-Checkbox").children(".checked").removeClass("checked");
		document.getElementById('buyMinerForm').reset();
		toastr.options = { timeOut: 0, extendedTimeOut: 0}
		toastr.info('Transaction Under Process. Please Wait! You will get a popup confirming the status of the Transaction');
		document.getElementById("purchase-token").disabled = true;
		axios.post('/api/buytoken',{currency: currency, amount: amount, terms:terms})
		.then((response) => {
			if(response.data.status && response.data.isCoinPayment == false)
			{
				document.getElementById("purchase-token").disabled = false;
				toastr.clear();
				toastr.options = {};
				toastr.success(`${response.data.message}`);
			}
			else if(response.data.status && response.data.isCoinPayment)
			{
				document.getElementById("purchase-token").disabled = false;
				toastr.clear();
				toastr.options = {};
				toastr.info('After the payment is confirmed, you will get a notification confirming token credit to your wallet. This might take a few minutes');
				var result = response.data.result;
				document.getElementById("imageQrCode").src = result.qrcode_url;
				document.getElementById("amount-to-be-paid").innerHTML = `${result.amount}&nbsp;${response.data.currency}`;
				document.getElementById("payment-address").innerHTML = result.address;
				document.getElementById("transaction-id").innerHTML = result.txn_id;
				document.getElementById("confirm").innerHTML = result.confirms_needed;
				document.getElementById("checkTx").href = result.status_url;
				$('#paymentModal').modal('toggle');
			}
			else
			{
				document.getElementById("purchase-token").disabled = false;
				toastr.clear();
				toastr.options = {};
				toastr.error(`${response.data.message}`);
			}
		})
		.catch((err) => {
			document.getElementById("purchase-token").disabled = false;
			toastr.error('We are unable to process your request at this time. Please try again later!');
		});
	}
	else
	{
		toastr.error('Please check the checkbox to proceed');
	}
}

//Send Currency Function
function sendCurrency(choice) {
	var currencyType =  $('input[name=radioInline]:checked').val();
	var recvAddr = document.getElementById('address').value;
	var AMOUNT = numeral(document.getElementById('amount').value);
	var amount = parseFloat(document.getElementById('amount').value);
	if((AMOUNT._input).length > 20 || (AMOUNT._value) < 0){
		toastr.warning("Amount should be greater then 0 and max 18 digit")
		return false;
	}
	var LANG = localStorage.getItem("userLanguage") == "zh_CN" ? lang.ch :lang.en;
	if(choice == 'confirm' && amount > 0 && recvAddr.length == 42){
		$('#confirmModal').modal('toggle');
		document.getElementById('currency').innerHTML = `${AMOUNT._value} ${currencyType}`;
		document.getElementById('recvAddress').innerHTML = `${recvAddr}`;
		document.getElementById("confirmButton").disabled = false;
		document.getElementById("cancelButton").disabled = false;
	}else if(choice == 'confirm' && amount <= 0 && recvAddr.length == 42){
		toastr.error(LANG.AmouCanZe);
		return false;
	}else if(choice == 'confirm' && amount > 0 && recvAddr.length != 42){
		toastr.error(LANG.InvaAdd);
		return false;
	}else if(choice == 'cancel'){
		document.getElementById('sendCurrencyForm').reset();
		$('#confirmModal').modal('toggle');
		toastr.info(LANG.TranCa)
	}else if(choice == 'proceed'){
		document.getElementById("confirmButton").disabled = true;
		document.getElementById("cancelButton").disabled = true;
		toastr.info(LANG.TraUnPr);
		setTimeout(function() {
			$('#confirmModal').modal('toggle');
			document.getElementById('sendCurrencyForm').reset();
			toastr.options = { timeOut: 0, extendedTimeOut: 0}
			toastr.info(LANG.TraWai);
		}, 6000);
		axios.post('api/sendcurrency',{currencyType: currencyType, receiverAddress: recvAddr, amount:AMOUNT._value,localStorage:localStorage.getItem("userLanguage")})
		.then((response) => {
			if(response.data.status){
				toastr.clear();
				toastr.options = {};
				toastr.success(`${response.data.message}`);
				location.reload();
			}else{
				toastr.clear();
				toastr.error(`${response.data.message}`);
			}
		}).catch((err) => {
			toastr.error(LANG.weArUnP)
		});
	}else{
		toastr.error(LANG.EiFNoVa);
	}
}

//Function Logout
function logout()
{
	var LANG = localStorage.getItem("userLanguage") == "zh_CN" ? lang.ch :lang.en;
	var localS = localStorage.getItem("userLanguage");
	axios.get('/api/logout?localStorage='+localS)
	.then((response) => {
		if(response.data.status)
			{
				sessionStorage.clear();
				location.replace('/logout');
		}
	})
	.catch((err) => {
		toastr.error(LANG.weArUnP);
	});
}

//Backup Wallet Code
function backupWallet(type)
{
	var LANG = localStorage.getItem("userLanguage") == "zh_CN" ? lang.ch :lang.en;

	if(type == 'Retrieve')
	{
		var userEmail = document.getElementById("login_email").value;
		var password = document.getElementById("login_password").value;
		if(userEmail && password)
		{
			document.getElementById("getPrivButton").disabled = true;
			toastr.options = { timeOut: 0, extendedTimeOut: 0}
			toastr.info("Please wait while we authenticate you and get your Private Keys. This might take a while!");
			axios.post('/api/getclientsalt', { email: userEmail,localStorage:localStorage.getItem("userLanguage")})
			.then((response) => {
				if (response.data.status) {
					var hashp = generateHash(password, response.data.salt);
					axios.post('/api/backupwallet',{hashedPass:hashp, email:userEmail,localStorage:localStorage.getItem("userLanguage")})
					.then((response) => {
						if(response.data.status)
						{
							toastr.clear();
							toastr.options = {};
							document.getElementById("above-input-text").innerHTML = 'Click The Eye To View';
							document.getElementById("privkey-input").innerHTML =
							`<div class="input-group">
								<input type="password" class="form-control" style="font-size:13.1px;" id="private-key-value" disabled>
								<span class="input-group-btn">
									 <button class="btn btn-primary" id="eye" onclick="backupWallet('Eye')" type="button"><i class="fa fa-eye-slash" aria-hidden="true"></i></button>
								</span>
							</div>`;
							document.getElementById("private-key-value").value = response.data.message;
						}
						else
						{
							toastr.clear();
							toastr.options = {};
							toastr.error(`${response.data.message}`);
						}
					})
					.catch((err) => {
						toastr.clear();
						toastr.options = {};
						toastr.error(`${response.data.message}`);
					});
				}
			});
		}
		else
		{
			toastr.error(LANG.EithOFfil)
		}
	}
	else if(type=='Eye')
	{
		var eye = document.getElementById("eye");
		var privateKeyValue = document.getElementById("private-key-value");
		if (privateKeyValue.getAttribute("type") === "password") {
			privateKeyValue.setAttribute("type",'text');
			eye.innerHTML = '<i class="fa fa-eye" aria-hidden="true"></i>';
		} else {
			privateKeyValue.setAttribute("type",'password');
			eye.innerHTML = '<i class="fa fa-eye-slash" aria-hidden="true"></i>';
		}
	}
	else
	{
		document.getElementById("above-input-text").innerHTML = 'Please Enter your login credentials to Continue';
		document.getElementById("privkey-input").innerHTML = `<form role="form" method="POST">
		<div class="form-group">
		  <div class="input-group date">
			<input type="email" class="form-control" id="login_email" placeholder="Enter Registered Mail ID" required>
			<span class="input-group-addon"><i class="fa fa-envelope"></i></span>
		  </div>
		</div>
		<div class="form-group">
		  <div class="input-group date">
			<input type="password" class="form-control" id="login_password" placeholder="Enter Password" required>
			<span class="input-group-addon"><i style="font-size:18px; padding-left:1px; padding-right:1px;" class="fa fa-lock"></i></span>
		  </div>
		</div>
		<div class="form-group text-center">
		  <a class="btn btn-sm btn-primary m-t-xs" href="javascript:backupWallet('Retrieve')" type="submit" id="getPrivButton"><strong>Get Private Key</strong></a>
		</div>
	  </form>`;
	}
}

//Edit User Profile
function editProfile(field)
{
	var LANG = localStorage.getItem("userLanguage") == "zh_CN" ? lang.ch :lang.en;

	if(field == 'Name')
	{
		document.getElementById("editEmail").disabled = true;
		document.getElementById("editPassword").disabled = true;
		document.getElementById("name-div").style.display = 'none';
		document.getElementById("new-name-input").style.display = 'block';
		document.getElementById("saveProfileChanges").disabled = false;
	}
	else if(field == 'Email')
	{
		toastr.info(LANG.ThisFuNo)
		// document.getElementById("editName").disabled = true;
		// document.getElementById("editPassword").disabled = true;
		// document.getElementById("email-div").style.display = 'none';
		// document.getElementById("new-email-input").style.display = 'block';
		// document.getElementById("saveProfileChanges").disabled = false;
	}
	else if(field == 'Password')
	{
		document.getElementById("editName").disabled = true;
		document.getElementById("editEmail").disabled = true;
		document.getElementById("password-div").style.display = 'none';
		document.getElementById("new-password-input").style.display = 'block';
		document.getElementById("new-conf-password-input").style.display = 'block';
		document.getElementById("saveProfileChanges").disabled = false;
	}
	else if(field == 'Close')
	{
		$('#profileModal').modal('toggle');
		document.getElementById("editName").disabled = false;
		document.getElementById("editEmail").disabled = false;
		document.getElementById("editPassword").disabled = false;
		document.getElementById("name-div").style.display = 'table';
		document.getElementById("email-div").style.display = 'table';
		document.getElementById("password-div").style.display = 'table';
		document.getElementById("new-name-input").style.display = 'none';
		document.getElementById("new-email-input").style.display = 'none';
		document.getElementById("new-password-input").style.display = 'none';
		document.getElementById("new-conf-password-input").style.display = 'none';
		document.getElementById("saveProfileChanges").disabled = true;
		location.reload();
	}
	else if(field == 'Save')
	{
		toastr.info(LANG.PleWai)
		if(document.getElementById("editEmail").disabled && document.getElementById("editPassword").disabled)
		{
			var newName = document.getElementById("new-name-input").value;
			var type = 'Name';
			axios.post('/api/editprofile',{newValue:newName, type:type,localStorage:localStorage.getItem("userLanguage")})
			.then((response) => {
				if(response.data.status)
				{
					toastr.clear();
					toastr.success(`${response.data.message}`);
					document.getElementById("editName").disabled = false;
					document.getElementById("editEmail").disabled = false;
					document.getElementById("editPassword").disabled = false;
					document.getElementById("name-div").style.display = 'table';
					document.getElementById("new-name-input").style.display = 'none';
					document.getElementById("current-name").innerHTML = response.data.newName;
					document.getElementById("saveProfileChanges").disabled = true;
				}
			})
			.catch((err) => {
				toastr.error(LANG.UnexErr)
			});
		}
		else if(document.getElementById("editName").disabled && document.getElementById("editEmail").disabled)
		{
			var userEmail = document.getElementById("current-email").innerHTML;
			var newPassword = document.getElementById("new-password-input").value;
			var newConfPassword = document.getElementById("new-conf-password-input").value;
			var type = 'Password';
			if(newPassword && newConfPassword && (newPassword == newConfPassword))
			{
				axios.post('/api/getclientsalt', { email: userEmail,localStorage:localStorage.getItem("userLanguage") })
				.then((response) => {
					if (response.data.status)
					{
						var hashp = generateHash(newPassword, response.data.salt);
						axios.post('/api/editprofile',{newValue:hashp, type:type,localStorage:localStorage.getItem("userLanguage")})
						.then((response) => {
							if(response.data.status)
							{
								toastr.clear();
								toastr.success(`${response.data.message}`);
								document.getElementById("editName").disabled = false;
								document.getElementById("editEmail").disabled = false;
								document.getElementById("editPassword").disabled = false;
								document.getElementById("password-div").style.display = 'table';
								document.getElementById("new-password-input").style.display = 'none';
								document.getElementById("new-conf-password-input").style.display = 'none';
								document.getElementById("saveProfileChanges").disabled = true;
							}
							else
							{
								toastr.clear();
								toastr.error(`${response.data.message}`);
							}
						})
						.catch((err) => {
							toastr.error(LANG.UnexErr)
						});
					}
				});
			}
			else
			{
			}
		}
	}
}

//The function is generating SHA256 hash of the password + salt.
function generateHash(password, salt) {
	var hashp = sha256.update(password);
	var hash = sha256.update(hashp + salt).hex();
	return hash;
}
