async function signup(e) {
    e.preventDefault();

    try {
        const signupDetails = {
            name: e.target.name.value,
            email: e.target.email.value,
            mobile: e.target.mobile.value,
            password: e.target.password.value,
            confirmPassword: e.target.confirmPassword.value
        }

        const response = await axios
            .post('http://3.92.199.165:3000/user/signup', signupDetails);
            alert(response.data.message);
            window.location.href = "./login.html";
    } catch (err) {
        console.log(JSON.stringify(err));
        document.getElementById('errmsg').innerHTML = err.response.data.err;
    }
}