let messages = []
function load() {
    document.getElementById('msgbox').focus()
    console.log(document.cookie.split(";"))
    tick()
}
function tick() {
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
let fastLoop = setInterval(() => {
    tick()
}, 100);
let loop = setInterval(()=>{
    scroll()
}, 10)
async function resetText() {
    if (document.getElementById('msgbox').value.startsWith("/lenny")) {
        document.getElementById('msgbox').value = "( ͡° ͜ʖ ͡°) " + document.getElementById('msgbox').value.slice(6)
    }
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "http://" + window.location.hostname + "/getmessage?messagebox=" + document.getElementById('msgbox').value)
    xhr.send()
    setTimeout((e) => {
        document.getElementById('msgbox').value = ''
    }, 1)
}
addEventListener("keypress", (e) => {
    if (e.key == "Enter") {
        resetText()
    }
})