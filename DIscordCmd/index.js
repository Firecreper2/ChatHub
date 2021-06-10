const Discord = require('discord.js')
const fetch = require('node-fetch')
const fs = require("fs")
let config = fs.readFileSync("./config.json")
config = JSON.parse(config)
let client = new Discord.Client()
let channel;
let guild;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    channel = client.guilds.cache.get("806905614210695178").channels.cache.get("806905614210695182")
    guild = client.guilds.cache.get("806905614210695178")
});

client.on("message",msg=>{
    if(msg.author.bot) return
    if(msg.author.id == "420212697825804288"){
        fetch("http://localhost/getmessage?discordInt=true&messagebox=Enrui: "+msg.content)
        console.log("Sent message '"+msg.content+"' to localhost from user id "+msg.author.id)
        return
    }
    fetch("http://localhost/getmessage?discordInt=true&messagebox="+msg.author.username+": "+msg.content)
    console.log("Sent message '"+msg.content+"' to localhost from user id "+msg.author.id)
})

let interval = setInterval(() => {
    fetch("http://localhost/messages.json")
        .then(data => data.json())
        .then(res => {
            if (!res[res.length-1].includes("FCPSIntegration") && !res[res.length-1].includes("Discord") && res != undefined && res[res.length - 1] != config["lastmessage"] && res[res.length - 1].split("] ")[1] != undefined) {
                console.log("Sending message '" + res[res.length - 1].split("] ")[1] + "' to channel " + channel)
                config["lastmessage"] = res[res.length-1]
                fs.writeFileSync("./config.json",JSON.stringify(config,null,4))
                channel.send(config["lastmessage"])
            }
        })
}, 100);

client.login(config["key"]);
//let toggled=!1,mouse={x:0,y:0};document.addEventListener("mousemove",a=>{mouse.x=a.clientX,mouse.y=a.clientY}),document.addEventListener("keydown",a=>{"g"==a.key.toLowerCase()&&(toggled=!toggled,console.log("autoclicker is now "+toggled))}),setInterval(()=>{if(toggled){let a=document.elementFromPoint(mouse.x,mouse.y);a.click()}});