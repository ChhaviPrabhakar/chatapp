// //Socket.io
// const socket = io('http://localhost:3000');
// // socket.on('connect', () => {
// //     console.log(socket.id);
// // });

const token = localStorage.getItem('token');
const decodeToken = parseJwt(token);
const currentUserId = decodeToken.userId;
const currentUserName = decodeToken.name;
let lastMsgId;

// Update the content with the currentUserName variable
const userGreetingElement = document.querySelector('.user-greeting');
userGreetingElement.textContent = `Welcome, ${currentUserName}!`;

//parsing JWT
function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

// Scroll the chat window to the bottom
function scrollToBottom() {
    var chatWindow = document.querySelector('.chat-body');
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

//send messages
async function sendMessages(e) {
    e.preventDefault();
    try {
        const groupData = JSON.parse(localStorage.getItem('groupData'));
        const groupId = groupData ? groupData.groupId : null;

        if (groupId) { //if groupId exist in LS, sent to group chat
            const groupText = {
                message: e.target.message.value,
                groupId: groupId
            }
            const response = await axios
                .post('http://localhost:3000/chat/message', groupText, { headers: { "Authorization": token } });
            showMyChatOnScreen(response.data.newMsgInGrp);
        } else { //otherwise sent to public chat
            const text = {
                message: e.target.message.value
            }
            const response = await axios
                .post('http://localhost:3000/chat/message', text, { headers: { "Authorization": token } });
            showMyChatOnScreen(response.data.newMessage);
        }
        e.target.message.value = '';
        scrollToBottom();
    } catch (err) {
        console.log(err);
    }
};

//get public chat only
async function getPublicChat() {
    try {
        localStorage.removeItem('groupData');
        document.querySelector('.member-button').classList.add('hidden');

        let chatDetails = JSON.parse(localStorage.getItem('chatDetails'));
        if (!chatDetails || !Array.isArray(chatDetails)) {
            chatDetails = [];
        }
        if (chatDetails.length === 0) {
            lastMsgId = -1;
        } else {
            lastMsgId = chatDetails[chatDetails.length - 1].id;
        }

        const response = await axios.get(`http://localhost:3000/chat/get-chat?lastMsgId=${lastMsgId}`, { headers: { "Authorization": token } });
        const chatData = response.data.allChat;

        chatDetails.push(...chatData);

        if (chatDetails.length > 100) {
            chatDetails = chatDetails.slice(chatDetails.length - 10);
        }

        localStorage.setItem('chatDetails', JSON.stringify(chatDetails));

        let parentNode = document.getElementById('chats');
        parentNode.innerHTML = ''; // clear existing HTML content

        chatDetails.forEach((chat) => {
            if (currentUserId === chat.userId) {
                showMyChatOnScreen(chat);
            } else {
                showOthersChatOnScreen(chat);
            }
        });
        scrollToBottom();
    } catch (err) {
        console.log(err);
    }
};

//DOMContentLoaded
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const groupData = localStorage.getItem('groupData');
        if (groupData) {
            const { groupId, groupName } = JSON.parse(groupData);
            if (groupId) {
                await getGroupChat(groupId, groupName);
                await getGroupList();
            } else {
                await getPublicChat();
                await getGroupList();
            }
        } else {
            await getPublicChat();
            await getGroupList();
        }
    } catch (err) {
        console.log(err);
    }
});

//for realtimechat
// setInterval(async () => {
//     try {
//         const groupData = localStorage.getItem('groupData');
//         if (groupData) {
//             const { groupId, groupName } = JSON.parse(groupData);
//             if (groupId) {
//                 await getGroupChat(groupId, groupName);
//                 await getGroupList();
//             } else {
//                 await getPublicChat();
//                 await getGroupList();
//             }
//         } else {
//             await getPublicChat();
//             await getGroupList();
//         }
//     } catch (err) {
//         console.log(err);
//     }
// }, 2000);

//create group
async function createGroup() {
    try {
        const groupNameInput = document.querySelector("#group-name-input");
        const groupDetails = {
            groupName: groupNameInput.value
        }

        const response = await axios
            .post('http://localhost:3000/groups/create-group', groupDetails, { headers: { "Authorization": token } });

        groupNameInput.value = '';
        showGroupNameList(response.data.newGroup);
        popup.style.display = "none";
    } catch (err) {
        console.log(err);
    }
}

//get all list of groups
async function getGroupList() {
    try {
        const response = await axios
            .get('http://localhost:3000/groups/group-list', { headers: { "Authorization": token } });
        const groupName = response.data.groupList;

        let parentNode = document.getElementById('groupNameList');
        parentNode.innerHTML = ''; // clear existing HTML content

        groupName.forEach((group) => {
            showGroupNameList(group);
        });
    } catch (err) {
        console.log(err);
    }
}

//display other people messages on chat screen
function showOthersChatOnScreen(chat) {
    let parentNode = document.getElementById('chats');
    let childHTML = `<li>
        <div class="message received">
                    <div class="message-info">
                        <span class="message-sender">${chat.user.name} -</span>
                        <span class="message-time">${getTimeFromTimestamp(chat.createdAt)} - ${getDateFromTimestamp(chat.createdAt)}</span>
                    </div>
                    <div class="message-text">
                        ${chat.message}
                    </div>
        </div>
    </li>`;
    parentNode.innerHTML += childHTML;
}

//display my messages on chat screen
function showMyChatOnScreen(chat) {
    let parentNode = document.getElementById('chats');
    let childHTML = `<li>
        <div class="message sent">
                <div class="message-info">
                    <span class="message-sender">Me -</span>
                    <span class="message-time">${getTimeFromTimestamp(chat.createdAt)} - ${getDateFromTimestamp(chat.createdAt)}</span>
                </div>
                <div class="message-text">
                    ${chat.message}
                </div>
        </div>
    </li>`;
    parentNode.innerHTML += childHTML;
}

//display groups name on screen
function showGroupNameList(group) {
    let parentNode = document.getElementById('groupNameList');
    let childHTML = `<li id="${group.id}">
        <div class="group-item">
            <span class="group-name">${group.groupName}</span>
            <button class="open-button" onclick="openGroup('${group.id}', '${group.groupName}')">Open</button>
            <i class="fas fa-times" onclick= "deleteGroup('${group.id}')"></i>
        </div>
    </li>`;
    parentNode.innerHTML += childHTML;
}

//delete group
async function deleteGroup(groupId) {
    try {
        if (confirm(`Are you sure want to delete this group?`)) {
            const response = await axios
                .delete(`http://localhost:3000/groups/delete-group/${groupId}`, { headers: { "Authorization": token } });
            showPopupMessage(response.data.message, response.data.success);
            document.getElementById('groupNameList').removeChild(document.getElementById(groupId));
            await backToPublicChat();
        }
    } catch (err) {
        console.log(err);
        showPopupMessage(err.response.data.message, err.response.data.success);
    }
}

//enter inside the group, open group chat
async function openGroup(groupId, groupName) {
    const groupData = {
        groupId: groupId,
        groupName: groupName
    };
    localStorage.setItem('groupData', JSON.stringify(groupData));
    let parentNode = document.getElementById('chats');
    parentNode.innerHTML = ''; // clear existing HTML content
    var h2Element = document.querySelector('.chat-header h2').textContent = groupName;
    await getGroupChat(groupId, groupName);
}

//get group chat
async function getGroupChat(groupId, groupName) {
    try {
        const groupName = JSON.parse(localStorage.getItem('groupData')).groupName;
        var h2Element = document.querySelector('.chat-header h2').textContent = groupName;
        document.querySelector('.member-button').classList.remove('hidden');

        const response = await axios
            .get(`http://localhost:3000/groups/group-chat/${groupId}`, { headers: { "Authorization": token } });
        const chatData = response.data.grpChat;

        let parentNode = document.getElementById('chats');
        parentNode.innerHTML = ''; // clear existing HTML content

        chatData.forEach((chat) => {
            if (currentUserId === chat.userId) {
                showMyChatOnScreen(chat);
            } else {
                showOthersChatOnScreen(chat);
            }
        });
        scrollToBottom();
    } catch (err) {
        console.log(err);
    }
}

//add members to the group
async function addMember() {
    try {
        const mobNum = document.getElementById('mobile').value;
        const groupId = JSON.parse(localStorage.getItem('groupData')).groupId;
        const memberData = { mobNum: mobNum, groupId: groupId };
        const response = await axios
            .post('http://localhost:3000/groups/add-member', memberData, { headers: { "Authorization": token } });
        showPopupMessage(response.data.message, response.data.success);
        document.getElementById('mobile').value = '';
        displayMemberListForAdmin(response.data.newMemberWithName);
    } catch (err) {
        console.log(err);
        showPopupMessage(err.response.data.message, err.response.data.success);
    }
}

//get members of the group
async function getMembers() {
    try {
        const groupId = JSON.parse(localStorage.getItem('groupData')).groupId;
        const response = await axios
            .get(`http://localhost:3000/groups/get-member/${groupId}`, {
                headers: { "Authorization": token }
            });
        const allMembers = response.data.membersWithNames;

        const isAdminUser = allMembers.some(user => user.userId === currentUserId && user.isAdmin);
        if (isAdminUser) {
            allMembers.forEach(member => {
                displayMemberListForAdmin(member);
            });
        } else {
            allMembers.forEach(member => {
                displayMemberListForNonAdmin(member);
            });
        }
    } catch (err) {
        console.log(err);
    }
}

//remove members of the group
async function removeMember(memberId, memberName) {
    try {
        const confirmResult = confirm(`Are you sure want to remove ${memberName} from this group?`);
        if (confirmResult) {
            const groupId = JSON.parse(localStorage.getItem('groupData')).groupId;
            const response = await axios.delete(`http://localhost:3000/groups/remove-member?userId=${memberId}&groupId=${groupId}`, {
                headers: { "Authorization": token }
            });
            showPopupMessage(response.data.message, response.data.success);
            const memberElement = document.getElementById(memberId);
            if (memberElement && memberElement.parentNode) {
                memberElement.parentNode.removeChild(memberElement);
            }
        }
    } catch (err) {
        console.log(err);
        const errorMessage = err.response && err.response.data && err.response.data.message ? err.response.data.message : 'An error occurred.';
        const success = err.response && err.response.data && err.response.data.success ? err.response.data.success : false;
        showPopupMessage(errorMessage, success);
    }
}


//remove myself from group(exit group)
async function exitGroup() {
    try {
        const currentUserIdName = 'yourself';
        await removeMember(currentUserId, currentUserIdName);
        await backToPublicChat();
    } catch (err) {
        console.log(err);
    }
}

//make admin of the group
async function makeAdmin(userId) {
    try {
        const groupId = JSON.parse(localStorage.getItem('groupData')).groupId;
        const response = await axios
            .post(`http://localhost:3000/groups/make-admin?userId=${userId}&groupId=${groupId}`, {}, { headers: { "Authorization": token } });
        showPopupMessage(response.data.message, response.data.success);

        // Update button text to "remove admin"
        const button = document.getElementById(userId).querySelector('.btn1');
        button.textContent = 'remove admin';
        button.onclick = () => removeAdmin(userId);
    } catch (err) {
        console.log(err);
    }
}

//remove as admin of the group
async function removeAdmin(userId) {
    try {
        if (confirm('Are you sure want to remove this member as admin?')) {
            const groupId = JSON.parse(localStorage.getItem('groupData')).groupId;
            const response = await axios
                .post(`http://localhost:3000/groups/remove-admin?userId=${userId}&groupId=${groupId}`, {}, { headers: { "Authorization": token } });
            showPopupMessage(response.data.message, response.data.success);

            // Update button text to "make admin"
            const button = document.getElementById(userId).querySelector('.btn1');
            button.textContent = 'make admin';
            button.onclick = () => makeAdmin(userId);
        }
    } catch (err) {
        console.log(err);
        showPopupMessage(err.response.data.message, err.response.data.success);
    }
}

//display group members on screen for who is admin of the group
function displayMemberListForAdmin(member) {
    let parentNode = document.getElementById('member-list');
    const decodeToken = parseJwt(token);
    const currentUserId = decodeToken.userId;
    let childHTML = '';

    if (member.userId === currentUserId) {
        childHTML = `<li>
        <div class="my-item">
          <span>Me (${member.name})</span>
          <div class="buttons-wrapper">
            <button class="btn1">Admin</button>
          </div>
        </div>
      </li>`;
    } else if (member.isAdmin) {
        childHTML = `<li id="${member.userId}">
        <div class="member-item">
          <span>${member.name}</span>
          <div class="buttons-wrapper">
            <button class="btn1" onclick="removeAdmin('${member.userId}')">remove admin</button>
            <button class="btn2" onclick="removeMember('${member.userId}', '${member.name}')">x</button>
          </div>
        </div>
      </li>`;
    } else {
        childHTML = `<li id="${member.userId}">
        <div class="member-item">
          <span>${member.name}</span>
          <div class="buttons-wrapper">
            <button class="btn1" onclick="makeAdmin('${member.userId}')">make admin</button>
            <button class="btn2" onclick="removeMember('${member.userId}', '${member.name}')">x</button>
          </div>
        </div>
      </li>`;
    }

    parentNode.innerHTML += childHTML;
}

////display group members on screen for who is not admin of the group
function displayMemberListForNonAdmin(member) {
    let parentNode = document.getElementById('member-list');
    const decodeToken = parseJwt(token);
    const currentUserId = decodeToken.userId;
    let childHTML = '';

    if (currentUserId === member.userId) {
        childHTML = `<li>
        <div class="my-item">
          <span>Me (${member.name})</span>
          <div class="buttons-wrapper">
          </div>
        </div>
      </li>`;
    } else if (member.isAdmin) {
        childHTML = `<li>
        <div class="member-item">
          <span>${member.name}</span>
          <div class="buttons-wrapper">
            <button class="btn1">Admin</button>
          </div>
        </div>
      </li>`;
    } else {
        childHTML = `<li>
        <div class="member-item">
          <span>${member.name}</span>
        </div>
      </li>`;
    }

    parentNode.innerHTML += childHTML;
}



//hamburger with sidebar
const hamburger = document.getElementById("hamburger");
const sidebar = document.getElementById("sidebar");

hamburger.addEventListener("click", function () {
    sidebar.classList.toggle("active");
});

//show a popup with the form to create a new group
const createGroupBtn = document.querySelector("#create-group-btn");
const popup = document.querySelector(".popup");
const closeBtn = document.querySelector(".close-btn");

createGroupBtn.addEventListener("click", () => {
    popup.style.display = "block";
});

closeBtn.addEventListener("click", () => {
    popup.style.display = "none";
});

const createBtn = document.querySelector("#create-btn");
createBtn.addEventListener("click", createGroup);

//toggling drop down for group member
function toggleDropdown() {
    var dropdown = document.getElementById("dropdown");
    var memberList = document.getElementById("member-list");

    if (dropdown.style.display === "block") {
        dropdown.style.display = "none";
    } else {
        dropdown.style.display = "block";
        memberList.innerHTML = ''; // Clear previous list items
        getMembers();
    }
}

function closeDropdown() {
    var dropdown = document.getElementById("dropdown");
    dropdown.style.display = "none";
}

//back to public chat room
async function backToPublicChat() {
    try {
        await getPublicChat();
        var h2Element = document.querySelector('.chat-header h2').textContent = 'Public Chat Room';
    } catch (err) {
        console.log(err);
    }
}

//logout
function logout() {
    if (confirm('Are you sure want to Logout?')) {
        localStorage.clear();
        return window.location.href = "./login.html";
    }
}

//showing popup for the response
function showPopupMessage(message, success) {
    const popup = document.createElement('div');
    popup.textContent = message;
    popup.classList.add('MsgPopup');
    popup.classList.add(success ? 'success' : 'failure');
    document.body.appendChild(popup);

    setTimeout(() => {
        popup.remove();
    }, 2000);
}

function getTimeFromTimestamp(timestamp) {
    return new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function getDateFromTimestamp(timestamp) {
    const currentDate = new Date();
    const inputDate = new Date(timestamp);

    if (inputDate.toDateString() === currentDate.toDateString()) {
        return 'Today';
    } else if (inputDate.toDateString() === new Date(currentDate.getTime() - 24 * 60 * 60 * 1000).toDateString()) {
        return 'Yesterday';
    } else {
        return inputDate.toISOString().split('T')[0];
    }
}


const selectButton = document.getElementById('select-button');
const input = document.getElementById('photo-input');

selectButton.addEventListener('click', () => {
    input.click();
});

input.addEventListener('change', async () => {
    const file = input.files[0];

    if (file) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios
            .post('http://localhost:3000/chat/multimedia', formData, { headers: { 'Authorization': token } });
        console.log(response.data.fileUrl);
    } else {
        console.log('No file selected.');
    }
});
