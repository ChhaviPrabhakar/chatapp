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

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const token = localStorage.getItem('token');

        const response = await axios
            .get(`http://localhost:3000/chat/get-chat`, { headers: { "Authorization": token } });
        for (var i = 0; i < response.data.allChat.length; i++) {
            addChatOnScreen(response.data.allChat[i]);
        }
    } catch (err) {
        console.log(err);
    }
});