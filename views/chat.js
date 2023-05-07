async function sendText(e) {
    e.preventDefault();
    try {
        const text = {
            message: e.target.message.value
        }

        const token = localStorage.getItem('token');
        const response = await axios
            .post('http://localhost:3000/chat/message', text, { headers: { "Authorization": token } });
    } catch (err) {
        console.log(err);
    }
};