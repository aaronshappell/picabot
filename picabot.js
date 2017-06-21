const Discord = require("discord.js");
const bot = new Discord.Client();
const token = "MzI3MTIyNTk3OTAyODExMTM3.DCwwQQ.BIxxQQEfezftpzywZLtawDeMoKU";

var commands = {
    "ping": {
        description: "Pings the bot",
        process: function(message){
            message.reply("pong");
        }
    }
};

var checkForCommand = function(message){
    if(!message.author.bot){
        if(message.content === "!ping"){ //change this
            commands.ping.process(message);
        }
    }
}

bot.on("ready", () => console.log("Bot ready!"));
bot.on("guildMemberAdd", member => member.guild.defaultChannel.send(`Welcome to the server, ${member}!`));
bot.on("message", message => checkForCommand(message));
bot.on("messageUpdate", (oldMessage, newMessage) => checkForCommand(newMessage));

bot.login(token);