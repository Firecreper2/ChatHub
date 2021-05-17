let messages = []
let socket = io();
let messageSent = false
let playsound = false;
let sound = new Audio("/audio.mp3")
let emotesName = [
    "sob",
    "silly",
    "smiley",
    "sweat",
    "lol",
    "quiet",
    "tougue",
    "thinking",
    "no_mouth",
    "pensive",
    "vomiting",
    "sleeping",
    "dizzy",
    "eggplant",
    "sweat_drops",
    "monkey",
    "sus",
    "eyes",
    "sunglasses",
    "spacecat"
]
let emotes = {
    "sob": "😭",
    "silly": "🤪",
    "smiley": "😀",
    "sweat": "😅",
    "lol": "🤣",
    "quiet": "🤫",
    "tougue": "😛",
    "thinking": "🤔",
    "no_mouth": "😶",
    "pensive": "😔",
    "vomiting": "🤮",
    "sleeping": "😴",
    "dizzy": "😵",
    "eggplant": "🍆",
    "sweat_drops": "💦",
    "monkey": "🐵",
    "sus": "😳",
    "eyes": "👀",
    "sunglasses": "😎",
    "spacecat": "🐱‍🚀"
}
function logEmotes() {
    let ea = 0
    for (let i in emotes) {
        console.log(emotesName[ea] + ": " + emotes[i])
        ea++
    }
}
logEmotes()
function load() {
    document.getElementById('msgbox').focus()
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
        if(playsound && !vis()){
            sound.play()
        }
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
            for (let i in messages) {
                let message = document.createElement("span")
                let br = document.createElement("br")
                message.textContent = messages[i]
                if(messages[i].startsWith("[link]")){
                    if(messages[i].includes("[/link]")){
                        messages[i]
                    }
                }
                document.getElementById("chat-box").appendChild(message)
                document.getElementById("chat-box").appendChild(br)
            }
        })
}
async function resetText() {
    let msg = document.getElementById('msgbox').value
    if (msg.startsWith("/lenny")) {
        document.getElementById('msgbox').value = "( ͡° ͜ʖ ͡°) " + document.getElementById('msgbox').value.slice(6)
    }
    if (msg == "") {
        return;
    }
    if (msg.split(":").length > 1) {
        let array = msg.split(":")
        for (e in emotes) {
            for (a in array) {
                if (emotes[array[a]] != undefined) {
                    array[a] = emotes[array[a]]
                    document.getElementById("msgbox").value = array.join("")
                }
            }
        }
    }
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "http://" + window.location.hostname + "/getmessage?messagebox=" + document.getElementById('msgbox').value)
    xhr.send()
    socket.emit("chat message", document.getElementById('msgbox').value)
    setTimeout((e) => {
        document.getElementById('msgbox').value = ''
    }, 1)
}
function resetUserList(users){
    let userlist = document.getElementById("users")
    removeAllChildNodes(userlist)
    let title = document.createElement('span')
    title.setAttribute("id","users-title")
    let text = document.createElement("h3")
    text.textContent = "Active Users"
    title.appendChild(text)
    userlist.appendChild(title)
    for(let i in users){
        let span = document.createElement('span')
        let br = document.createElement('br')
        span.textContent = users[i]
        userlist.appendChild(span)
        userlist.appendChild(br)
    }
}
socket.on("chat message", function (msg) {
    messageSent = true;
})
socket.on("reload", function (e) {
    window.location.reload();
})
socket.on("user join", (activeUsers) => {
    resetUserList(activeUsers)
})
socket.on("user leave", (activeUsers) => {
    resetUserList(activeUsers)
})
addEventListener("keypress", (e) => {
    if (e.key == "Enter") {
        resetText()
    }
})

var vis = (function(){
    var stateKey, eventKey, keys = {
        hidden: "visibilitychange",
        webkitHidden: "webkitvisibilitychange",
        mozHidden: "mozvisibilitychange",
        msHidden: "msvisibilitychange"
    };
    for (stateKey in keys) {
        if (stateKey in document) {
            eventKey = keys[stateKey];
            break;
        }
    }
    return function(c) {
        if (c) document.addEventListener(eventKey, c);
        return !document[stateKey];
    }
})();
function toggleAudio(){
    let icon = document.getElementById("togglesound")
    if(playsound){
        icon.style.opacity = 0.5
        playsound = false
    }else{
        icon.style.opacity = 1
        playsound = true
    }
}