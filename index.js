
const express = require('express');
const fs = require('fs');
const http = require('http')
const cookieParser = require('cookie-parser');
const { networkInterfaces } = require('os');
const Cookies = require('cookies');
const app = express()
const { Server } = require('socket.io')
const server = http.createServer(app);
const io = new Server(server)
const term = require('terminal-kit').terminal;
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const port = 80
const net = networkInterfaces()
const colors = require("colors");
const { Console } = require('console');
const spawn = require("child_process").spawn;
let admins = {
    "firecreper": "",
    "kman": ""
}
let activeUsers = []
app.use(cookieParser())
app.use(express.static(__dirname+'/static/'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/src/index.html');
})

io.on('connection', (socket) => {
    let username;
    if (socket.request.headers.cookie) {
        console.log(socket.request.headers.cookie.split("=")[1].split(";")[0] + " Connected".green)
        if (admins[socket.request.headers.cookie.split("=")[1].split(";")[0]] != undefined) {
            io.emit("log", socket.request.headers.cookie.split("=")[1].split(";")[0] + " Connected")
        }

        username = socket.request.headers.cookie.split("=")[1].split(";")[0];

        activeUsers.push(username)
        activeUsers.sort()
        io.emit("user join", activeUsers)
    } else {
        random = "Anonymous " + Math.floor(Math.random() * 9).toString() + Math.floor(Math.random() * 9).toString() + Math.floor(Math.random() * 9).toString()
        socket.request.headers.cookie = random
        username = random
        activeUsers.push(random)
        activeUsers.sort()
        io.emit("user join", activeUsers)
        console.log("An anonymous user joined".blue);
    }
    activeUsers.sort()
    console.log("Join: ", activeUsers)
    socket.on('chat message', (msg) => {
        io.emit("chat message")
    })
    socket.on('disconnect', (socket) => {
        console.log(username + " disconnected".red);
        if (username != undefined) {
            io.emit("log", username + " disconnected")
        }
        if (activeUsers.indexOf(username) == -1) {
            return
        }
        activeUsers.splice(activeUsers.indexOf(username), 1)
        console.log(activeUsers)

        if (username == undefined) {
            io.emit("user leave", activeUsers)
            return
        }
        activeUsers.sort()
        io.emit("user leave", activeUsers)
    })
})

app.get("/getmessage", (req, res) => {
    let message = req.query.messagebox
    if (!message || message.includes("⣿") || message.includes('⣆') || message.includes('⣦')) {
        return
    }
    let msgList = JSON.parse(fs.readFileSync(__dirname + "/messages.json"));
    let timestamp = new Date()
    let hour = timestamp.getHours()
    let minutes = timestamp.getMinutes()
    let username = req.cookies['username']
    let password = req.cookies['password']
    if(req.query.discordInt){
        username = "Discord"
        password = "e"
    }
    let cookies = new Cookies(req, res)
    let users = fs.readFileSync("./users.json")
    let timeofday = "AM"
    users = JSON.parse(users)
    if (hour > 12) {
        timeofday = "PM"
        hour = hour - 12
        if (hour < 9) {
            hour = "0" + hour
        }
    }
    if (minutes < 10) {
        minutes = "0" + minutes
    }
    timestamp = `[${hour}:${minutes} ${timeofday}] `
    if (admins[username] != undefined || req.query.adminMode) {
        if (message == "/reload") {
            io.emit("reload")
            return
        }
        if (message == "/clear") {
            msgList = [timestamp+" Chat has been cleared by console"];
            fs.writeFileSync(__dirname + "/messages.json", JSON.stringify(msgList, null, 4))
            io.emit("chat message")
            return
        }
        if (message == "/clearcache") {
            activeUsers = []
            io.emit("reload")
            return
        }
        if (message == "/restart" && req.query.adminMode) {
            console.log("Restarting...")
            child = spawn("powershell.exe",["C:\\Users\\1590891\\Documents\\GitHub\\Hack-Me\\start.bat"]);
            return;
        }
        if (req.query.adminMode) {
            msgList.push(timestamp + "Console: " + message);
            console.log(timestamp + "Console: " + message)
            fs.writeFileSync(__dirname + "/messages.json", JSON.stringify(msgList, null, 4))
            io.emit("chat message")
            return
        }
    }
    if (!username) {
        random = "Anonymous " + Math.floor(Math.random() * 9).toString() + Math.floor(Math.random() * 9).toString() + Math.floor(Math.random() * 9).toString()
        cookies.set("username", random)
        username = random
    }
    if (password == undefined) {
        if (
            !username.split(" ")[0] == "Anonymous" ||
            isNaN(parseInt(username.split(" ")[1])) ||
            parseInt(username.split(" ")[1]) > 999
        ) {
            random = "Anonymous " + Math.floor(Math.random() * 9).toString() + Math.floor(Math.random() * 9).toString() + Math.floor(Math.random() * 9).toString()
            cookies.set("username", random)
            username = random
        }
    }
    for (i in users) {
        if (users[req.cookies["username"]] != req.cookies['password'] && req.query.discordInt == undefined) {
            res.sendFile(__dirname + "/src/login/login.html")
            return;
        }
    }
    while (msgList.length > 100) {
        msgList.shift();
    }
    msgList.push(timestamp + username + ": " + message);
    fs.writeFileSync(__dirname + "/messages.json", JSON.stringify(msgList, null, 4))
    if (msgList[msgList.length - 1].includes("%")) {
        let percentMsg = msgList[msgList.length - 1].split("")
        for (let i = 0; i < percentMsg.length; i++) {
            if (percentMsg[i] == "%" && percentMsg[i + 1] == "2" && percentMsg[i + 2] == "0") {
                percentMsg[i] = " "
                percentMsg[i + 1] = ""
                percentMsg[i + 2] = ""

            }
        }
        msgList[msgList.length - 1] = percentMsg.join("")
        fs.writeFileSync(__dirname + "/messages.json", JSON.stringify(msgList, null, 4))
    }
    io.emit("chat message")

    console.log(msgList[msgList.length - 1])

    res.sendFile(__dirname + "/redirect.html")
});

app.get("/script.js", (req, res) => {
    res.sendFile(__dirname + "/src/script.js")
})
app.get("/style.css", (req, res) => {
    res.sendFile(__dirname + "/src/style.css")
})
app.get("/messages.json", (req, res) => {
    res.sendFile(__dirname + '/messages.json');
})
app.get("/login.html", (req, res) => {
    res.sendFile(__dirname + "/src/login/login.html")
})
app.get("/login.css", (req, res) => {
    res.sendFile(__dirname + "/src/login/login.css")
})
app.get("/signup.html", (req, res) => {
    res.sendFile(__dirname + "/src/signup/signup.html")
})
app.get("/signup.css", (req, res) => {
    res.sendFile(__dirname + "/src/signup/signup.css")
})
app.get("/favicon.ico", (req, res) => {
    res.sendFile(__dirname + "/src/favicon.ico")
})
app.get("/audio.mp3", (req, res) => {
    res.sendFile(__dirname + "/src/audio.mp3")
})
app.get("/signupuser", (req, res) => {
    let username = req.query.username
    let password = req.query.password
    let users = fs.readFileSync("./users.json")
    users = JSON.parse(users)
    if (!users[username.toString()]) {
        users[username.toString()] = password
        fs.writeFileSync(__dirname + "/users.json", JSON.stringify(users, null, 4))
        res.sendFile(__dirname + "/src/login/login.html")
    } else {
        res.sendFile(__dirname + "/src/signup/takenuser.html")
    }

})
app.get("/forgot.html", (req, res) => {
    res.send("lol sucks to be you")
})
app.get("/loginuser", (req, res) => {
    let cookies = new Cookies(req, res)
    let username = req.query.username
    let password = req.query.password
    let users = fs.readFileSync("./users.json")
    users = JSON.parse(users)
    for (i in users) {
        if (users[username.toString()] == password) {
            cookies.set("username", username)
            cookies.set("password", password)
            res.sendFile(__dirname + "/redirect.html")
            return;
        }
    }
    res.sendFile(__dirname + "/src/login/invalidLogin.html")
})
function termInputField() {
    term.inputField(
        function (error, input) {
            let xhttp = new XMLHttpRequest();
            xhttp.open("GET", "http://" + net['Wi-Fi'][net['Wi-Fi'].length - 1]['address'] + "/getmessage?adminMode=true&messagebox=" + input, true);
            xhttp.send();
            io.emit("chat message", input)
            term("\n")
            termInputField()
        }
    )
}
termInputField()

server.listen(port, () => {
    console.log(`Now listening at http://${net['Wi-Fi'][net['Wi-Fi'].length - 1]['address']}`)
})
//https://socket.io/get-started/chat