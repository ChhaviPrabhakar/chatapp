function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

const token = localStorage.getItem('token');

async function sendText(e) {
    e.preventDefault();
    try {
        const text = {
            message: e.target.message.value
        }

        const response = await axios
            .post('http://localhost:3000/chat/message', text, { headers: { "Authorization": token } });
        showMyChatOnScreen(response.data.newMessage);
        e.target.message.value = '';
    } catch (err) {
        console.log(err);
    }
};

async function getChat () {
    try {

        const response = await axios.get(`http://localhost:3000/chat/get-chat`, { headers: { "Authorization": token } });
        const chatData = response.data.allChat;

        let parentNode = document.getElementById('chats');
        parentNode.innerHTML = ''; // clear existing HTML content

        chatData.forEach((chat) => {
            const decodeToken = parseJwt(token);
            const currentUser = decodeToken.userId;
            if (currentUser === chat.userId) {
                showMyChatOnScreen(chat);
            } else {
                showOthersChatOnScreen(chat);
            }
        });
    } catch (err) {
        console.log(err);
    }
};

window.addEventListener('DOMContentLoaded', getChat());

setInterval(async () => {
    await getChat();
}, 1000);

function showOthersChatOnScreen(chat) {
    let parentNode = document.getElementById('chats');
    let childHTML = `<li>
        <div class="message received">
                    <div class="message-info">
                        <span class="message-sender">${chat.user.name}</span>
                        <span class="message-time">10:30 AM</span>
                    </div>
                    <div class="message-text">
                        ${chat.message}
                    </div>
        </div>
    </li>`;
    parentNode.innerHTML += childHTML;
}

function showMyChatOnScreen(chat) {
    let parentNode = document.getElementById('chats');
    let childHTML = `<li>
        <div class="message sent">
                <div class="message-info">
                    <span class="message-sender">Me</span>
                    <span class="message-time">10:32 AM</span>
                </div>
                <div class="message-text">
                    ${chat.message}
                </div>
        </div>
    </li>`;
    parentNode.innerHTML += childHTML;
}