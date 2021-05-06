let messages = []
let socket = io();
let messageSent = false;
function load() {
    document.getElementById('msgbox').focus()
    console.log(document.cookie.split(";"))
    getMessages()
}
function scroll() {
    let chatbox = document.getElementById("chat-box");
    if (lowestScroll < chatbox.scrollTop) {
        lowestScroll = chatbox.scrollTop
    }
    if (lowestScroll == chatbox.scrollTop) {
        chatbox.scrollTop = chatbox.scrollHeight
    }
};
function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}
let lowestScroll = 0
let loop = setInterval(() => {
    scroll()
    if (messageSent) {
        messageSent = false;
        getMessages()
    }
}, 10)
function getMessages() {
    fetch(window.location.href + "messages.json")
        .catch(err => {
            document.getElementById('msgbox').disabled = true
            document.getElementById('msgbox').placeholder = "server down brb nerd"
        })
        .then(data => data.json())
        .then(dataa => {
            document.getElementById('msgbox').disabled = false
            document.getElementById('msgbox').placeholder = "message"
            if (messages == dataa) {
                return;
            }
            removeAllChildNodes(document.getElementById("chat-box"));
            messages = dataa
            for (i in messages) {
                let message = document.createElement("span")
                let br = document.createElement("br")
                message.textContent = messages[i]
                document.getElementById("chat-box").appendChild(message)
                document.getElementById("chat-box").appendChild(br)
            }
        })
}
async function resetText() {
    if (document.getElementById('msgbox').value.startsWith("/lenny")) {
        document.getElementById('msgbox').value = "( ͡° ͜ʖ ͡°) " + document.getElementById('msgbox').value.slice(6)
    }
    if (document.getElementById('msgbox').value == "") {
        return;
    }
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "http://" + window.location.hostname + "/getmessage?messagebox=" + document.getElementById('msgbox').value)
    xhr.send()
    socket.emit("chat message", document.getElementById('msgbox').value)
    setTimeout((e) => {
        document.getElementById('msgbox').value = ''
    }, 1)
}
socket.on("chat message", function (msg) {
    messageSent = true;
})
socket.on("reload", function (e) {
    window.location.reload();
})
addEventListener("keypress", (e) => {
    if (e.key == "Enter") {
        resetText()
    }
})