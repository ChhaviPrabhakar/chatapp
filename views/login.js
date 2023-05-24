async function login(e) {
    e.preventDefault();
    try {
        const loginDetails = {
            email: e.target.email.value,
            password: e.target.password.value
        }

        const response = await axios
            .post('http://localhost:3000/user/login', loginDetails);
            localStorage.setItem('token', response.data.token);
            window.location.href = "./chat.html";
    } catch (err) {
        console.log(JSON.stringify(err));
        document.getElementById('errmsg').innerHTML = err.response.data.err;
        document.body.innerHTML += `<div style="color:red;">${err.message} <div>`;
    }
}