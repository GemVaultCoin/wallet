function signUp() {
	$('form#userSignuptForm').on('submit', function (e) {
		var LANG = localStorage.getItem("userLanguage") == "zh_CN" ? lang.ch :lang.en;
		e.preventDefault();
		var name = document.getElementById("reg_name").value;
		var email = document.getElementById("reg_email").value;
		var password = document.getElementById("reg_password").value;
		var confpassword = document.getElementById("reg_password_confirm").value;
		var code = $('.country-list .active').data('dial-code');;
		var phoneno = document.getElementById("mobileNumberSignup").value;
		var terms = document.getElementById("reg_tnc").checked;

		var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

	    if (!filter.test(email)) {
            toastr.warning(LANG.EmailError,{
                timeOut: 2000,
                extendedTimeOut: 3000,
                closeButton: true,
                progressBar: true,
                tapToDismiss: true,
            });
            return false;
	    }
	    Uphoneno_regex = new RegExp(/^\d{4,16}$/)
        if (!Uphoneno_regex.test(phoneno)) {
            toastr.warning(LANG.PassError, {
                timeOut: 2000,
                extendedTimeOut: 3000,
                closeButton: true,
                progressBar: true,
                tapToDismiss: true,
            });
        	return false
        }
		if (name && email && password && confpassword && code && phoneno && terms) {
			if (password == confpassword) {
				toastr.info(LANG.SignPW);
				var salt = GenerateSalt(32);
				var hashedPass = generateHash(password, salt);
				var hashedConfPass = generateHash(confpassword, salt);
				$('.subm').html('<i class="fa fa-spinner fa-spin"></i>')
				$('.lod-btn').attr("disabled", true);
				axios.post('/api/usersignup', { name: name, email: email, pass: hashedPass, confPass: hashedConfPass, code: code, phoneNo: phoneno, psalt: salt, active: false,localStorage:localStorage.getItem("userLanguage")})
					.then((response) => {
						if (response.data.status) {
							toastr.clear();
							toastr.success(`${response.data.message}`);
							$('#signUpModal').modal('toggle');
						}else{
							toastr.clear();
							toastr.error(`${response.data.message}`);
						}
					}).catch((err) => {
						toastr.clear();
						toastr.error(LANG.ServerEnErr);
					});
			}
			else {
				toastr.error(LANG.Signpnm);
			}
		}else{
			toastr.error(LANG.Allfr);

		}
	});
}

function loginUser()
{
	$('form#userLoginForm').on('submit', function (e) {
		e.preventDefault();
		var email = document.getElementById("login_email").value;
		var pass = document.getElementById("login_password").value;

		var LANG = localStorage.getItem("userLanguage") == "zh_CN" ? lang.ch :lang.en;
		if(email && pass){
			axios.post('/api/getclientsalt', { email: email,localStorage:localStorage.getItem("userLanguage")})
			.then((response) => {
				if (response.data.status) {
					var hashp = generateHash(pass, response.data.salt);
					axios.post('/api/userlogin', {
						username: email,
						password: hashp,
						localStorage:localStorage.getItem("userLanguage"),
					}).then((respon) => {
						if (respon.data.status) {
							sessionStorage.setItem('isLogged',respon.data.isLogged);
							location.replace('/dashboard');
						}else {
							toastr.error(`${respon.data.message}`);
						}
					});
				}else if(!response.data.userStatus){
					toastr.error(`${response.data.message}`,LANG.PleWai,{
			            timeOut             : 1000,
			            extendedTimeOut     : 100,
			            closeButton         : true,
			            progressBar         : true,
			            tapToDismiss        : true,
			            onHidden: function() {
			            	$('#resendVefiModal').modal('toggle');
			            }
			        });
				}else {
					toastr.error(`${response.data.message}`);
				}
			}).catch((err) => {
				toastr.error(LANG.ServerEnErr);
			});
		}else{
			toastr.error(LANG.Allfr);
		}
	});
}

//These two functions are used to generate a salt of given length.
function DecToHex(Dec) {
	return ('0' + Dec.toString(16)).substr(-2)
}

function GenerateSalt(wordCount) {
	var Arr = new Uint8Array(wordCount);
	window.crypto.getRandomValues(Arr);
	return Array.from(Arr, DecToHex).join('');
}

//The function is generating SHA256 hash of the password + salt.
function generateHash(password, salt) {
	var hashp = sha256.update(password);
	var hash = sha256.update(hashp + salt).hex();
	return hash;
}

function resednActivation(){
	var LANG = localStorage.getItem("userLanguage") == "zh_CN" ? lang.ch :lang.en;
    var userEmail = document.getElementById("rs_email").value;
    if (userEmail) {
        document.getElementById("rs_email").value = "";
        toastr.options = { timeOut: 0, extendedTimeOut: 0 };
        toastr.info(LANG.PleWai);
        axios.post('/api/getEmailActivationLink', { email: userEmail ,localStorage:localStorage.getItem("userLanguage")})
            .then((response) => {
                if (response.data.status) {
                    $('#resendVefiModal').modal('toggle');
                    toastr.clear();
                    toastr.options = {};
                    toastr.success(`${response.data.message}`);
                }
                else {
                    toastr.clear();
                    toastr.options = {};
                    toastr.error(`${response.data.message}`);
                }
            })
            .catch((err) => {
                toastr.error(LANG.weArUnP)
            });
    }else {
        toastr.error(LANG.FieCanBl);
    }
}
