function resetPassword() {
    var LANG = localStorage.getItem("userLanguage") == "zh_CN" ? lang.ch :lang.en;
    if (window.location.pathname == '/') {
        var userEmail = document.getElementById("fp_email").value;
        if (userEmail) {
            document.getElementById("fp_email").value = "";
            toastr.options = { timeOut: 0, extendedTimeOut: 0 };
            toastr.info(LANG.PleWai);
            axios.post('/api/forgotpassword', { email: userEmail ,localStorage:localStorage.getItem("userLanguage")})
                .then((response) => {
                    if (response.data.status) {
                        $('#passwordRecoveryModal').modal('toggle');
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
        }
        else {
            toastr.error(LANG.FieCanBl);
        }
    }
    else {
        toastr.options = { timeOut: 0, extendedTimeOut: 0 };
        toastr.info(LANG.PleWai);
        var email = document.getElementById("reset_email").value;
        var password = document.getElementById("new_password").value;
        var confPass = document.getElementById("new_password_confirm").value;
        if (password && confPass && password == confPass) {
            document.getElementById("new_password").value = "";
            document.getElementById("new_password_confirm").value = "";
            axios.post('/api/getclientsalt', { email: email,localStorage:localStorage.getItem("userLanguage")})
                .then((response) => {
                    if (response.data.status) {
                        var hashp = generateHash(password, response.data.salt);
                        axios.post('/api/resetpassword', { email: email, password: hashp,localStorage:localStorage.getItem("userLanguage")})
                            .then((response) => {
                                if (response.data.status) {
                                    toastr.clear();
                                    toastr.options = {}
                                    toastr.success(`${response.data.message}`);
                                    location.replace('/');
                                }
                                else {
                                    toastr.clear();
                                    toastr.options = {}
                                    toastr.error(`${response.data.message}`);
                                }
                            })
                            .catch((err) => {
                                toastr.error(LANG.weArUnP)
                            });
                    }
                });
        }
        else {
            toastr.options = {};
            toastr.error(LANG.Signpnm);
        }
    }
}

//The function is generating SHA256 hash of the password + salt.
function generateHash(password, salt) {
    var hashp = sha256.update(password);
    var hash = sha256.update(hashp + salt).hex();
    return hash;
}
