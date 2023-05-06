async function signup(e) {
    e.preventDefault();

    try {
        const signupDetails = {
            username: e.target.username.value,
            email: e.target.email.value,
            mobile: e.target.mobile.value,
            password: e.target.password.value,
            confirmPassword: e.target.confirm - password.value
        }

        const response = await axios
            .post('http://localhost:3000/user/signup', signupDetails);
            alert(response.data.message);
            window.location.href = "./login.html";
    } catch (err) {
        console.log(JSON.stringify(err));
        document.getElementById('errmsg').innerHTML = err.response.data.message;
        document.body.innerHTML += `<div style="color:red;">${err.message} <div>`;
    }
}