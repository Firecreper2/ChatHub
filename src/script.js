let messages = []
let socket = io();
let messageSent = false
let playsound = false;
let sound = new Audio("/audio.mp3")
let rateLimit = 5
let dmode = false;
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
    "spacecat": "🐱‍🚀",
    "flushed": "😳"
}
function logEmotes() {
    for (let i in emotes) {
        console.log(i + ": " + emotes[i])
    }
}
logEmotes()
function darkmode(){
    dmode = !dmode
    if(darkmode){
        document.getElementById("chat-box").style.backgroundColor = "black"
        document.getElementById("chat-box").style.color = "lightgray"
        document.getElementsByTagName("body")[0].style.backgroundColor = "#2A2D32"
        document.getElementsByTagName("body")[0].style.color = "white"
        document.getElementById("users").style.backgroundColor = "black"
    }else{

    }
}
function load() {
    document.getElementById('msgbox').focus()
    getMessages()
}
function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}
let loop = setInterval(() => {
    if (messageSent) {
        messageSent = false;
        if (playsound && !vis()) {
            sound.play()
        }
        getMessages()
    }
}, 10)
let rateLimiter = setInterval(() => {
    if (rateLimit < 5) {
        rateLimit += 1
    }

}, 5000);
function getMessages() {
    fetch(window.location.href + "messages.json")
        .catch(err => {
            console.log(err)
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
                let message;
                let username;
                let user;
                if (messages[i].split(":")[3] != undefined && messages[i].split(":")[3].startsWith("image/")) {
                    message = document.createElement("img")
                    username = document.createElement("span")
                    user = messages[i].split(":")[0] + ":" + messages[i].split(":")[1] + ": "
                    username.textContent = user
                    let formatted = messages[i].split(":")[2].slice(1) + ":" + messages[i].split(":")[3]
                    formatted = formatted.split(" ")
                    formatted = formatted.join("+")
                    message.src = formatted
                } else {
                   
                    message = document.createElement("span")
                    message.textContent = messages[i]
                     if(messages[i].split("]")[1].split(":")[0] == " Discord"){
                        message.style.color = "#4e5d94"
                    }
                }
                let br = document.createElement("br")
                let br2 = document.createElement("br")
                if (user != undefined) {
                    document.getElementById("chat-box").appendChild(username)
                    document.getElementById("chat-box").appendChild(br2)
                }
                document.getElementById("chat-box").appendChild(message)
                document.getElementById("chat-box").appendChild(br)
            }
            document.getElementById("chat-box").scrollTo(0, 99999)
        })
}
function getBaseUrl() {
    var file = document.getElementById('uploadImage')['files'][0];
    var reader = new FileReader();
    var baseString;
    reader.onloadend = function () {
        baseString = reader.result;
        console.log("Sent b64 request!")
        resetText(baseString)
    };
    reader.readAsDataURL(file);
}
async function resetText(img) {
    let msg = document.getElementById('msgbox').value
    let image = document.getElementById('uploadImage')
    if (image['files'][0] != undefined && img == undefined) {
        getBaseUrl()
        console.log("Pending Image b64 request...")
        return
    }
    if (msg.startsWith("/lenny")) {
        document.getElementById('msgbox').value = "( ͡° ͜ʖ ͡°) " + document.getElementById('msgbox').value.slice(6)
    }
    if (msg.startsWith("/shrug")) {
        document.getElementById('msgbox').value = "¯\\_(ツ)_/¯ " + document.getElementById('msgbox').value.slice(6)
    }
    if (msg == "" && img == undefined) {
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
    if (rateLimit > 0) {
        rateLimit--;
        if (img == undefined) {
            xhr.open("GET", "http://" + window.location.hostname + "/getmessage?messagebox=" + document.getElementById('msgbox').value)
            xhr.send()
            socket.emit("chat message", document.getElementById('msgbox').value)
        } else {
            xhr.open("GET", "http://" + window.location.hostname + "/getmessage?messagebox=" + img)
            xhr.send()
            socket.emit("chat message")
            window.location.reload()
        }

        setTimeout((e) => {
            document.getElementById('msgbox').value = ''
        }, 1)
    }

}
function resetUserList(users) {
    let userlist = document.getElementById("users")
    removeAllChildNodes(userlist)
    let title = document.createElement('span')
    title.setAttribute("id", "users-title")
    let text = document.createElement("h3")
    text.textContent = "Active Users"
    title.appendChild(text)
    userlist.appendChild(title)
    for (let i in users) {
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
socket.on("log", function (log) {
    console.log(log)
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

var vis = (function () {
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
    return function (c) {
        if (c) document.addEventListener(eventKey, c);
        return !document[stateKey];
    }
})();
function toggleAudio() {
    let icon = document.getElementById("togglesound")
    if (playsound) {
        icon.style.opacity = 0.5
        playsound = false
    } else {
        icon.style.opacity = 1
        playsound = true
    }
}