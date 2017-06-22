const Discord = require("discord.js");
const bot = new Discord.Client();
const token = "MzI3MTIyNTk3OTAyODExMTM3.DCwwQQ.BIxxQQEfezftpzywZLtawDeMoKU";

var commands = {
    "help": {
        usage: "<command>",
        description: "Gives you a list of commands you can use",
        process: function(message, args){
            if(args.length === 0){
                var commandKeys = Object.keys(commands);
                var commandList = "";
                for(var i = 0; i < commandKeys.length - 1; i++){
                    commandList += commandKeys[i] + ", ";
                }
                commandList += commandKeys[commandKeys.length - 1];
                message.reply("My current commands are: " + commandList);
                message.channel.send("You can use `!help <command>` to learn more about a command");
            } else{
                for(var i = 0; i < args.length; i++){
                    try{
                        message.channel.send(`\`!${args[i]} ${commands[args[i]].usage}\`: ${commands[args[i]].description}`);
                    } catch(e){
                        message.channel.send(`\`!${args[i]}\`: Not a command`);
                    }
                }
            }
        }
    },
    "bot": {
        usage: "",
        description: "Tells you information about the bot",
        process: function(message, args){
            message.reply("I am a discord bot for didney worl who has an appetite for non-nutritive substances");
        }
    },
    "ping": {
        usage: "",
        description: "Pings the bot",
        process: function(message, args){
            message.reply("Pong :ping_pong:");
        }
    },
    "roll": {
        usage: "<amount>d<sides>",
        description: "Rolls a die",
        process: function(message, args){
            var rolls = [];
            var die = "";
            if(args.length === 0){
                die = "1d6";
                rolls.push(Math.floor(Math.random() * 6 + 1));
            } else{
                var amount = parseInt(args[0].split("d")[0]);
                var sides = parseInt(args[0].split("d")[1]);
                if(!Number.isInteger(amount) || !Number.isInteger(sides)){
                    message.reply("That is not a valid die");
                    return;
                }
                if(amount > 10){
                    message.reply("You cannot roll more than 10 dice at a time");
                    return;
                }
                die = args[0];
                for(var i = 0; i < amount; i++){
                    rolls.push(Math.floor(Math.random() * sides + 1));
                }
            }
            var rollList = "";
            for(var i = 0; i < rolls.length - 1; i++){
                rollList += rolls[i] + ", ";
            }
            rollList += rolls[rolls.length - 1];
            message.reply(`You rolled ${die} and got: ${rollList}`);
        }
    },
    "8ball": {
        usage: "",
        description: "Asks a magic 8ball",
        process: function(message, args){
            message.reply("No magic 8bal at the moment");
        }
    }
};

var checkForCommand = function(message){
    if(!message.author.bot && message.content.startsWith("!")){
        var args = message.content.substring(1).split(" ");
        var command = args.splice(0, 1);
        try{
            commands[command].process(message, args);
        } catch(e){
            message.reply("Sorry that isn't a command yet :sob:");
            message.channel.send("You can type `!help` to see a list of my commands");
        }
    }
}

bot.on("ready", () => console.log("Bot ready!"));
bot.on("disconnect", () => {
    console.log("Disconnected!");
    process.exit(1);
});
bot.on("guildMemberAdd", member => {
    member.guild.defaultChannel.send(`Welcome to the server, ${member}!`);
    member.guild.defaultChannel.send("You can type `!help` at anytime to see my commands");
});
bot.on("message", message => checkForCommand(message));
bot.on("messageUpdate", (oldMessage, newMessage) => checkForCommand(newMessage));

bot.login(token);