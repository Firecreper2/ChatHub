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
app.use(cookieParser())

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/src/index.html');
})

io.on('connection', (socket) => {
    if(socket.request.headers.cookie){
        console.log(socket.request.headers.cookie.split("=")[1].split(";")[0]+" Connected")
    }else{
        console.log("An anonymous user joined");
    }
    socket.on('chat message', (msg) => {
        io.emit("chat message", msg)
    })
    socket.on('disconnect', (socket)=>{
        console.log("Someone disconnected");
    })
})

app.get("/getmessage", (req, res) => {
    let message = req.query.messagebox
    let msgList = JSON.parse(fs.readFileSync(__dirname + "/messages.json"));
    let timestamp = new Date()
    let hour = timestamp.getHours()
    let minutes = timestamp.getMinutes()
    let username = req.cookies['username']
    let password = req.cookies['password']
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
    if(minutes < 10){
        minutes = "0"+minutes
    }
    timestamp = `[${hour}:${minutes} ${timeofday}] `
    if (req.query.adminMode) {
        if(message == "/reload"){
            io.emit("reload")
            return
        }
        if(message == "/clear"){
            msgList = ["Chat has been cleared by console"];
            io.emit("chat message")
            fs.writeFileSync(__dirname + "/messages.json", JSON.stringify(msgList, null, 4))
            return
        }
        msgList.push(timestamp + "Console: " + message);
        console.log(timestamp + "Console: " + message)
        fs.writeFileSync(__dirname + "/messages.json", JSON.stringify(msgList, null, 4))
        io.emit("chat message")
        return
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
        if (users[req.cookies["username"]] != req.cookies['password']) {
            res.sendFile(__dirname + "/src/login/login.html")
            return;
        }
    }
    while (msgList.length > 100) {
        msgList.shift();
    }

    msgList.push(timestamp + username + ": " + message);
    fs.writeFileSync(__dirname + "/messages.json", JSON.stringify(msgList, null, 4))

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