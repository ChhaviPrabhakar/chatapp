async function forgot(e) {
    e.preventDefault();

    const email = {
        email: e.target.email.value
    }

    try {
        const response = await axios
            .post('http://localhost:3000/user/forgotpassword', email);
        alert(response.data.message);
    } catch (err) {
        console.log(JSON.stringify(err));
        document.body.innerHTML += `<div style="color:red;">${err.message} <div>`;
    }
}