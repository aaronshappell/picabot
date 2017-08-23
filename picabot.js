require("dotenv").config();
const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const fs = require("fs");
const google = require("googleapis");
const youtube = google.youtube("v3");

const bot = new Discord.Client();
const prefix = "!";
var fortunes = ["It is certain", "It is decidedly so", "Without a doubt", "Yes definitely", "You may rely of it", "As I see it, yes", "Most likely", "Outlook good", "Yes", "Signs point to yes", "Reply hazy try again", "Ask again later", "Better not tell you now", "Cannot predict now", "Concentrate and ask again", "Dont count on it", "My reply is no", "My sources say no", "Outlook not so good", "Very doubtful"];
var dispatcher;
var songQueue = [];
var currentSongIndex = 0;
var previousSongIndex = 0;
var shuffle = false;

var commands = {
	"help": {
		"usage": "<command> | --all",
		"description": "Gives you a list of commands you can use or details on specific command(s)",
		"process": function(message, args){
			var commandKeys = Object.keys(commands);
			if(args.length === 0){
				var commandList = "";
				for(var i = 0; i < commandKeys.length - 1; i++){
					commandList += `\`${commandKeys[i]}\`, `;
				}
				commandList += `and \`${commandKeys[commandKeys.length - 1]}\``;
				message.reply("My current commands are: " + commandList);
				message.channel.send(`You can use \`${prefix}help <command>\` to learn more about a command!`);
			} else{
				var helpList = "";
				if(args[0] === "--all"){
					for(var i = 0; i < commandKeys.length; i++){
						helpList += `\`!${commandKeys[i]} ${commands[commandKeys[i]].usage}\`: ${commands[commandKeys[i]].description}\n`;
					}
				} else{
					for(var i = 0; i < args.length; i++){
						try{
							helpList += `\`!${args[i]} ${commands[args[i]].usage}\`: ${commands[args[i]].description}\n`;
						} catch(e){
							helpList += `\`!${args[i]}\`: Not a command\n`;
						}
					}
				}
				message.channel.send(helpList);
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
			if(Math.floor(Math.random() * 100 + 1) === 1){
				message.channel.send("You tried to roll a `die` :game_die: and got: `rick`");
				message.channel.send("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
				return;
			}
			if(args.length === 0){
				message.reply(`You rolled \`1d6\` :game_die: and got: \`${Math.floor(Math.random() * 6 + 1)}\``);
			} else{
				for(var i = 0; i < args.length; i++){
					var regex = args[i].match(/^(\d*)d(\d+)\+?(\d*)$/);
					if(regex === null){
						message.channel.send(`\`${args[i]}\` is not a valid die`);
					} else{
						if(regex[1] === "") regex[1] = 1;
						if(regex[3] === "") regex[3] = 0;
						var rolls = "(";
						var roll;
						var sum = 0;
						for(var j = 0; j < regex[1] - 1; j++){
							roll = Math.floor(Math.random() * Number.parseInt(regex[2]) + 1);
							sum += roll;
							rolls += roll + ", ";
						}
						roll = Math.floor(Math.random() * Number.parseInt(regex[2]) + 1);
						sum += roll;
						rolls += roll + ") + " + regex[3] + " = " + (sum + Number.parseInt(regex[3]));
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
		"description": "(NOT DONE) Call the bot to your voice channel to deliver a special insult",
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
						query += args[i] + " ";
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
					message.reply(`You can search for a youtube song with \`${prefix}yt <query>\``);
				}
			} else{
				message.reply("You can't hear my music if you're not in a voice channel :cry:");
			}
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
	"prev": {
		"usage": "<amount>",
		"description": "Skips back in the queue by a certain amount of songs",
		"process": function(message, args){
			if(message.member.voiceChannel !== undefined){
				if(songQueue.length > 0){
					previousSongIndex = currentSongIndex;
					var amount = Number.parseInt(args[0]);
					if(Number.isInteger(amount)){
						currentSongIndex -= amount;
					} else{
						currentSongIndex--;
					}
					if(currentSongIndex < 0){
						currentSongIndex = 0;
					}
					dispatcher.end("prev");
				} else{
					message.reply("There are no more songs :sob:");
				}
			} else{
				message.reply("You can't hear my music if you're not in a voice channel :cry:");
			}
		}
	},
	"next": {
		"usage": "<amount>",
		"description": "Skips ahead in the queue by a certain amount of songs",
		"process": function(message, args){
			if(message.member.voiceChannel !== undefined){
				if(songQueue.length > 0){
					previousSongIndex = currentSongIndex;
					var amount = Number.parseInt(args[0]);
					if(Number.isInteger(amount)){
						currentSongIndex += amount;
					} else{
						currentSongIndex++;
					}
					if(currentSongIndex > songQueue.length - 1){
						currentSongIndex = songQueue.length - 1;
					}
					dispatcher.end("next");
				} else{
					message.reply("There are no more songs :sob:");
				}
			} else{
				message.reply("You can't hear my music if you're not in a voice channel :cry:");
			}
		}
	},
	"goto": {
		"usage": "<index>",
		"description": "Skips to a certain song in the queue by its index",
		"process": function(message, args){
			if(message.member.voiceChannel !== undefined){
				if(songQueue.length > 0){
					var index = Number.parseInt(args[0]);
					if(Number.isInteger(index)){
						previousSongIndex = currentSongIndex;
						currentSongIndex = index - 1;
						if(currentSongIndex < 0){
							currentSongIndex = 0;
						} else if(currentSongIndex > songQueue.length - 1){
							currentSongIndex = songQueue.length - 1;
						}
						dispatcher.end("goto");
					} else{
						message.reply(`\`${args[0]}\` is an invalid index`);
					}
				} else{
					message.reply("There are no more songs :sob:");
				}
			} else{
				message.reply("You can't hear my music if you're not in a voice channel :cry:");
			}
		}
	},
	"clear": {
		"usage": "<index>",
		"description": "Clears the song queue or a specific song in the queue",
		"process": function(message, args){
			if(message.member.voiceChannel !== undefined){
				if(songQueue.length === 0){
					message.reply("There are no songs to clear");
				} else if(args.length > 0){
					var index = Number.parseInt(args[0]);
					if(Number.isInteger(index)){
						message.reply(`\`${songQueue[index - 1].title}\` has been removed from the song queue`);
						songQueue.splice(index - 1, 1);
						if(index - 1 <= currentSongIndex){
							currentSongIndex--;
						}
					} else{
						message.reply(`\`${args[0]}\` is an invalid index`);
					}
				} else{
					dispatcher.end("clear");
					currentSongIndex = 0;
					songQueue = [];
					//bot.user.setGame(currentSong.title);
					//Workaround since above wouldn't work
					bot.user.setPresence({ game: { name: "", type: 0 } });
					message.member.voiceChannel.leave();
					message.reply("The song queue has been cleared");
				}
			} else{
				message.reply("You can't hear my music if you're not in a voice channel :cry:");
			}
		}
	},
	"shuffle": {
		"usage": "",
		"description": "Toggles shuffling of the song queue",
		"process": function(message, args){
			if(message.member.voiceChannel !== undefined){
				if(shuffle){
					shuffle = false;
					message.reply("Shuffle is now disabled");
				} else{
					shuffle = true;
					message.reply("Shuffle is now enabled");
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
				message.reply(`The current song is \`${songQueue[currentSongIndex].title}\` :musical_note:, added by ${songQueue[currentSongIndex].user}`);
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
				for(var i = 0; i < songQueue.length; i++){
					if(i === currentSongIndex){
						songList += `__**\`${i + 1}. ${songQueue[i].title}\`**__\n`;
					} else{
						songList += `\`${i + 1}. ${songQueue[i].title}\`\n`;
					}
				}
				message.reply("The song queue currently has:\n" + songList);
			} else{
				message.reply("No song is in the queue");
			}
		}
	}
};

var addSong = function(message, url){
	ytdl.getInfo(url).then(function(info){
		var song = {};
		song.title = info.title;
		song.url = url;
		song.user = message.author.username;
		songQueue.push(song);
		message.reply(`I have added \`${info.title}\` to the song queue! :headphones:`);
		if(!bot.voiceConnections.exists("channel", message.member.voiceChannel)){
			message.member.voiceChannel.join().then(function(connection){
				playSong(message, connection);
			}).catch(console.log);
		}
	}).catch(function(err){
		message.reply("Sorry I couldn't get info for that song :cry:");
	});
}

var playSong = function(message, connection){
	if(shuffle){
		do {
			currentSongIndex = Math.floor(Math.random() * songQueue.length);
		} while(currentSongIndex === previousSongIndex);
	}
	var currentSong = songQueue[currentSongIndex];
	var stream = ytdl(currentSong.url, {"filter": "audioonly"});
	dispatcher = connection.playStream(stream);
	message.channel.send(`Now ${(shuffle) ? "randomly " : ""}playing \`${currentSong.title}\` :musical_note:, added by ${currentSong.user}`);
	//bot.user.setGame(currentSong.title);
	//Workaround since above wouldn't work
	bot.user.setPresence({ game: { name: currentSong.title, type: 0 } });
	dispatcher.player.on("warn", console.warn);
	dispatcher.on("warn", console.warn);
	dispatcher.on("error", console.error);
	dispatcher.once("end", function(reason){
		console.log("Song ended because: " + reason);
		if(reason === "user" || reason === "Stream is not generating quickly enough."){
			currentSongIndex++;
			if(currentSongIndex >= songQueue.length && !shuffle){
				//bot.user.setGame(currentSong.title);
				//Workaround since above wouldn't work
				bot.user.setPresence({ game: { name: "", type: 0 } });
				message.member.voiceChannel.leave();
			} else{
				setTimeout(function(){
					playSong(message, connection);
				}, 500);
			}
		} else if(reason === "prev" || reason === "next" || reason === "goto"){
			setTimeout(function(){
				playSong(message, connection);
			}, 500);
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

bot.on("ready", function(){
	console.log("Bot ready");
});
bot.on("disconnect", function(){
	console.log("Bot disconnected");
	process.exit(1);
});
bot.on("guildMemberAdd", function(member){
	member.guild.defaultChannel.send(`Welcome to the server, ${member}! :smile:`);
	member.guild.defaultChannel.send(`You can type \`${prefix}help\` at anytime to see my commands`);
});
bot.on("message", function(message){
	checkForCommand(message);
});
bot.on("messageUpdate", function(oldMessage, newMessage){
	checkForCommand(newMessage);
});

bot.login(process.env.BOTTOKEN).then(function(){
	console.log("Bot logged in");
}).catch(console.log);

fs.readFile("save.json", function(err, data){
	if(err){
		if(err.code === "ENOENT"){
			console.log("save.json does not exist");
			fs.writeFile("save.json", "{}", "utf8", function(err){
				if(err) throw err;
				console.log("save.json created");
			});
		} else{
			throw err;
		}
	}
});