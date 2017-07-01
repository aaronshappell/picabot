require("dotenv").config();
const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const fs = require("fs");
const google = require("googleapis");
const youtube = google.youtube("v3");
/*
const soundcloud = require("soundcloud");

soundcloud.initialize({
    "client_id": process.env.SOUNDCLOUDID
});
*/

const bot = new Discord.Client();
const prefix = "!";
var fortunes = ["It is certain", "It is decidedly so", "Without a doubt", "Yes definitely", "You may rely of it", "As I see it, yes", "Most likely", "Outlook good", "Yes", "Signs point to yes", "Reply hazy try again", "Ask again later", "Better not tell you now", "Cannot predict now", "Concentrate and ask again", "Dont count on it", "My reply is no", "My sources say no", "Outlook not so good", "Very doubtful"];
var dispatcher;
var songQueue = [];

var commands = {
    "help": {
        "usage": "<command>",
        "description": "Gives you a list of commands you can use or details on specific command(s)",
        "process": function(message, args){
            if(args.length === 0){
                var commandKeys = Object.keys(commands);
                var commandList = "";
                for(var i = 0; i < commandKeys.length - 1; i++){
                    commandList += `\`${commandKeys[i]}\`, `;
                }
                commandList += `and \`${commandKeys[commandKeys.length - 1]}\``;
                message.reply("My current commands are: " + commandList);
                message.channel.send(`You can use \`${prefix}help <command>\` to learn more about a command!`);
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
        "usage": "",
        "description": "Tells you information about the bot",
        "process": function(message, args){
            message.reply("I am a discord bot for didney worl who has an appetite for non-nutritive substances");
            message.channel.send("If you have any suggestions or command ideas for me tell @Crumster or your local amin");
        }
    },
    "ping": {
        "usage": "",
        "description": "Pings the bot, useful for seeing if it's alive",
        "process": function(message, args){
            message.reply("Pong :ping_pong:");
        }
    },
    "roll": {
        "usage": "<amount>d<sides>+<modifier>",
        "description": "Rolls DnD style dice",
        "process": function(message, args){
            if(args.length === 0){
                message.reply(`You rolled 1d6 :game_die: and got: ${Math.floor(Math.random() * 6 + 1)}`);
            } else{
                for(var i = 0; i < args.length; i++){
                    var regex = args[i].match(/^(\d*)d(\d+)\+?(\d*)$/);
                    if(regex === null){
                        message.channel.send(`\`${args[i]}\` is not a valid die`);
                    } else{
                        if(regex[1] === "") regex[1] = 1;
                        if(regex[3] === "") regex[3] = 0;
                        var rolls = "";
                        for(var j = 0; j < regex[1] - 1; j++){
                            rolls += (Math.floor(Math.random() * Number.parseInt(regex[2]) + 1) + Number.parseInt(regex[3])) + ", ";
                        }
                        rolls += (Math.floor(Math.random() * Number.parseInt(regex[2]) + 1) + Number.parseInt(regex[3]));
                        message.channel.send(`You rolled \`${args[i]}\` :game_die: and got: \`${rolls}\``);
                    }
                }
            }
        }
    },
    "8ball": {
        "usage": "",
        "description": "Asks a magic 8ball for a fortune",
        "process": function(message, args){
            message.reply(fortunes[Math.floor(Math.random() * fortunes.length)]);
        }
    },
    "save": {
        "usage": "<key> <message>",
        "description": "Saves a personalized message with a given key",
        "process": function(message, args){
            message.reply("**Disclaimer:** your message will not be permanantly saved and will delete upon bot restart (for now)");
            if(args.length < 2){
                message.reply(`Save a message with \`${prefix}save <key> <message>\``);
                return;
            }
            var key = args[0];
            var messageToSave = "";
            for(var i = 0; i < args.length - 2; i++){
                messageToSave += args[i + 1] + " ";
            }
            messageToSave += args[args.length - 1];
            fs.readFile("save.json", "utf8", function(err, data){
                if(err) throw err;
                var save = JSON.parse(data);
                if(save[message.author.username] === undefined){
                    save[message.author.username] = {};
                }
                save[message.author.username][key] = messageToSave;
                fs.writeFile("save.json", JSON.stringify(save), "utf8", function(err){
                    if(err) throw err;
                    message.reply(`Your message has been saved as \`${key}\`! :tada:`);
                });
            });
        }
    },
    "recall": {
        "usage": "<key>",
        "description": "Lists your saved messages or recalls a saved message with a given key",
        "process": function(message, args){
            fs.readFile("save.json", "utf8", function(err, data){
                if(err) throw err;
                var save = JSON.parse(data);
                if(args.length === 0){
                    var messageKeys;
                    var savedMessages = "";
                    try{
                        messageKeys = Object.keys(save[message.author.username]);
                    } catch(e){
                        message.reply("You have no saved messages, try saving one!");
                        return;
                    }
                    if(messageKeys.length === 0){
                        message.reply("You have no saved messages, try saving one!");
                        return;
                    }
                    for(var i = 0; i < messageKeys.length - 1; i++){
                        savedMessages += messageKeys[i] + ", ";
                    }
                    savedMessages += messageKeys[messageKeys.length - 1];
                    message.reply("Your saved messages are: " + savedMessages);
                } else{
                    var key = args[0];
                    var recalledMessage;
                    try{
                        recalledMessage = save[message.author.username][key];
                    } catch(e){
                        message.reply(`You don't have a saved message with the key \`${key}\``);
                        return;
                    }
                    message.reply(recalledMessage);
                }
            });
        }
    },
    "delete": {
        "usage": "<key>",
        "description": "Deletes a saved message with a given key",
        "process": function(message, args){
            fs.readFile("save.json", "utf8", function(err, data){
                if(err) throw err;
                var save = JSON.parse(data);
                if(args.length === 0){
                    message.reply(`Delete a saved message with \`${prefix}delete <key>\``);
                    return;
                } else{
                    var key = args[0];
                    try{
                        delete save[message.author.username][key];
                    } catch(e){
                        message.reply(`You don't have a saved message with the key \`${key}\``);
                        return;
                    }
                    fs.writeFile("save.json", JSON.stringify(save), "utf8", function(err){
                        if(err) throw err;
                        message.reply(`Your message \`${key}\` has been deleted! :tada:`);
                    });
                }
            });
        }
    },
    "insult": {
        "usage": "",
        "description": "Call the bot to your voice channel to deliver a special insult",
        "process": function(message, args){
            message.reply("There are currently no insults :sob:");
        }
    },
    "addsong": {
        "usage": "<link>",
        "description": "Adds a song to the song queue via a youtube link",
        "process": function(message, args){
            if(message.member.voiceChannel !== undefined){
                addSong(message, args[0]);
            } else{
                message.reply("You can't hear my music if you're not in a voice channel :cry:");
            }
        }
    },
    "yt": {
        "usage": "<query>",
        "description": "Searches for a youtube video to add to the song queue",
        "process": function(message, args){
            if(message.member.voiceChannel !== undefined){
                if(args.length > 0){
                    var query = "";
                    for(var i = 0; i < args.length - 1; i++){
                        query += args[i] + " "
                    }
                    query += " " + args[args.length - 1];
                    var results = youtube.search.list({
                        "key": process.env.GOOGLEAPIKEY,
                        "q": query,
                        "type": "video",
                        "maxResults": "1",
                        "part": "snippet"
                    }, function(err, data){
                        if(err){
                            message.reply("There was an error searching for your song :cry:");
                            console.log("Error: " + err);
                        }
                        if(data){
                            addSong(message, "https://www.youtube.com/watch?v=" + data.items[0].id.videoId);
                        }
                    });
                } else{
                    message.reply(`You can search for a song with \`${prefix}search <query>\``);
                }
            } else{
                message.reply("You can't hear my music if you're not in a voice channel :cry:");
            }
        }
    },
    "sc": {
        "usage": "<query>",
        "description": "Searches for a soundcloud track to add to the song queue",
        "process": function(message, args){
            message.reply("No soundcloud support yet :cry:");
        }
    },
    "play": {
        "usage": "",
        "description": "Resumes the current song",
        "process": function(message, args){
            if(message.member.voiceChannel !== undefined){
                if(songQueue.length > 0){
                    if(dispatcher.paused){
                        dispatcher.resume();
                        message.reply("Song resumed! :play_pause:");
                    } else{
                        message.reply("Song is already playing");
                    }
                } else{
                    message.reply("No song is in the queue");
                }
            } else{
                message.reply("You can't hear my music if you're not in a voice channel :cry:");
            }
        }
    },
    "pause": {
        "usage": "",
        "description": "Pauses the current song",
        "process": function(message, args){
            if(message.member.voiceChannel !== undefined){
                if(songQueue.length > 0){
                    if(!dispatcher.paused){
                        dispatcher.pause();
                        message.reply("Song paused! :pause_button:");
                    } else{
                        message.reply("Song is already paused");
                    }
                } else{
                    message.reply("No song is in the queue");
                }
            } else{
                message.reply("You can't hear my music if you're not in a voice channel :cry:");
            }
        }
    },
    "next": {
        "usage": "",
        "description": "Skips to the next song in the queue",
        "process": function(message, args){
            if(message.member.voiceChannel !== undefined){
                if(songQueue.length > 0){
                    dispatcher.end();
                } else{
                    message.reply("There are no more songs :sob:");
                }
            } else{
                message.reply("You can't hear my music if you're not in a voice channel :cry:");
            }
        }
    },
    "clear": {
        "usage": "",
        "description": "Clears the song queue",
        "process": function(message, args){
            if(message.member.voiceChannel !== undefined){
                if(songQueue.length === 0){
                    message.reply("There are no songs to clear");
                } else{
                    songQueue = [];
                    dispatcher.end();
                    message.reply("The song queue has been cleared");
                }
            } else{
                message.reply("You can't hear my music if you're not in a voice channel :cry:");
            }
        }
    },
    "song": {
        "usage": "",
        "description": "Gives you information about the currently playing song",
        "process": function(message, args){
            if(songQueue.length > 0){
                message.reply(`The current song is \`${songQueue[0].title}\` :musical_note:, added by ${songQueue[0].user}`);
            } else{
                message.reply("No song is in the queue");
            }
        }
    },
    "music": {
        "usage": "",
        "description": "Gives you a list of the songs currently in the queue",
        "process": function(message, args){
            if(songQueue.length > 0){
                var songList = "";
                for(var i = 0; i < songQueue.length - 1; i++){
                    songList += `\`${songQueue[i].title}\`\n`;
                }
                songList += `\`${songQueue[songQueue.length - 1].title}\``;
                message.reply("The song queue currently has:\n" + songList);
            } else{
                message.reply("No song is in the queue");
            }
        }
    },
    "printsave": {
        "usage": "",
        "description": "Prints the save.json to the console for temporary saving",
        "process": function(message, args){
            fs.readFile("save.json", "utf8", function(err, data){
                if(err) throw err;
                console.log(JSON.parse(data));
                message.reply("The save file has been printed to the log");
            });
        }
    }
};

var addSong = function(message, url){
    ytdl.getInfo(url, function(err, info){
        if(err){
            message.reply("Sorry I couldn't get info for that song :cry:");
            return;
        }
        var song = {};
        song.title = info.title;
        song.url = url;
        song.user = message.author.username;
        songQueue.push(song);
        message.reply(`I have added \`${info.title}\` to the song queue! :headphones:`);
        if(songQueue.length === 1){
            message.member.voiceChannel.join().then(function(connection){playSong(message, connection)});
        }
    });
}

var playSong = function(message, connection){
    var stream = ytdl(songQueue[0].url, {"filter": "audioonly"});
    dispatcher = connection.playStream(stream);
    message.channel.send(`Now playing \`${songQueue[0].title}\` :musical_note:, added by ${songQueue[0].user}`);
    dispatcher.on("end", function(){
        songQueue.shift();
        if(songQueue.length === 0){
            message.channel.send("There are no more songs :sob:");
            message.member.voiceChannel.leave();
        } else{
            playSong(message, connection);
        }
    });
}

var checkForCommand = function(message){
    if(!message.author.bot && message.content.startsWith(prefix)){
        var args = message.content.substring(1).split(" ");
        var command = args.splice(0, 1);
        try{
            commands[command].process(message, args);
        } catch(e){
            message.reply("Sorry, that isn't a command yet :sob:");
            message.channel.send(`You can type \`${prefix}help\` to see a list of my commands`);
        }
    }
}

bot.on("ready", function(){console.log("Bot ready!")});
bot.on("disconnect", function(){
    console.log("Bot disconnected!");
    process.exit(1);
});
bot.on("guildMemberAdd", function(member){
    member.guild.defaultChannel.send(`Welcome to the server, ${member}! :smile:`);
    member.guild.defaultChannel.send(`You can type \`${prefix}help\` at anytime to see my commands`);
});
bot.on("message", function(message){checkForCommand(message)});
bot.on("messageUpdate", function(oldMessage, newMessage){checkForCommand(newMessage)});

bot.login(process.env.BOTTOKEN);

fs.readFile("save.json", function(err, data){
    if(err){
        if(err.code === "ENOENT"){
            console.log("save.json does not exist");
            fs.writeFile("save.json", "{}", "utf8", function(err){
                if(err) throw err
                console.log("save.json created");
            });
        } else{
            throw err;
        }
    }
});