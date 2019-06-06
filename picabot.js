require("dotenv").config();
const fs = require("fs");
const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const google = require("googleapis");
const youtube = google.youtube("v3");

const client = new Discord.Client();
client.commands = new Discord.Collection(); // const commands instead?

fs.readdirSync("./commands").filter(file => file.endsWith(".js")).forEach(file => {
	let command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
});

const prefix = "!";
const botChannelName = "pica-commands";
var botChannel;
var dispatcher;
var songQueue = [];
var currentSongIndex = 0;
var previousSongIndex = 0;
var shuffle = false;
var autoremove = false;

var commands = {
	"help": {
		"usage": "<command> | -a or --all",
		"description": "Gives you a list of commands you can use or details on specific command(s)",
		"process": function(message, args){
			var commandKeys = Object.keys(commands);
			if(args.length === 0){
				var commandList = "";
				for(var i = 0; i < commandKeys.length - 1; i++){
					commandList += `\`${commandKeys[i]}\`, `;
				}
				commandList += `and \`${commandKeys[commandKeys.length - 1]}\``;
				botChannel.send("My current commands are: " + commandList, {reply: message});
				botChannel.send(`You can use \`${prefix}help <command>\` to learn more about a command!`);
			} else{
				var helpList = "";
				if(args[0] === "-a" || args[0] === "--all"){
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
				botChannel.send(helpList, {reply: message});
			}
		}
	},
	"roll": {
		"usage": "<amount>d<sides>+<modifier>",
		"description": "Rolls DnD style dice",
		"process": function(message, args){
			if(Math.floor(Math.random() * 100 + 1) === 1){
				botChannel.send("You tried to roll a `die` :game_die: and got: `rick`", {reply: message});
				botChannel.send("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
				return;
			}
			if(args.length === 0){
				botChannel.send(`You rolled \`1d6\` :game_die: and got: \`${Math.floor(Math.random() * 6 + 1)}\``, {reply: message});
			} else{
				for(var i = 0; i < args.length; i++){
					var regex = args[i].match(/^(\d*)d(\d+)\+?(\d*)$/);
					if(regex === null){
						botChannel.send(`\`${args[i]}\` is not a valid die`, {reply: message});
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
						message.channel.send(`You rolled \`${args[i]}\` :game_die: and got: \`${rolls}\``, {reply: message});
					}
				}
			}
		}
	},
	"save": {
		"usage": "<key> <message>",
		"description": "Saves a personalized message with a given key",
		"process": function(message, args){
			botChannel.send("**Disclaimer:** your message will not be permanantly saved and will delete upon bot restart (for now)", {reply: message});
			if(args.length < 2){
				botChannel.send(`Save a message with \`${prefix}save <key> <message>\``, {reply: message});
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
					botChannel.send(`Your message has been saved as \`${key}\`! :tada:`, {reply: message});
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
						botChannel.send("You have no saved messages, try saving one!", {reply: message});
						return;
					}
					if(messageKeys.length === 0){
						botChannel.send("You have no saved messages, try saving one!", {reply: message});
						return;
					}
					for(var i = 0; i < messageKeys.length - 1; i++){
						savedMessages += messageKeys[i] + ", ";
					}
					savedMessages += messageKeys[messageKeys.length - 1];
					botChannel.send("Your saved messages are: " + savedMessages, {reply: message});
				} else{
					var key = args[0];
					var recalledMessage;
					try{
						recalledMessage = save[message.author.username][key];
					} catch(e){
						botChannel.send(`You don't have a saved message with the key \`${key}\``, {reply: message});
						return;
					}
					botChannel.send(recalledMessage, {reply: message});
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
					botChannel.send(`Delete a saved message with \`${prefix}delete <key>\``, {reply: message});
					return;
				} else{
					var key = args[0];
					try{
						delete save[message.author.username][key];
					} catch(e){
						botChannel.send(`You don't have a saved message with the key \`${key}\``, {reply: message});
						return;
					}
					fs.writeFile("save.json", JSON.stringify(save), "utf8", function(err){
						if(err) throw err;
						botChannel.send(`Your message \`${key}\` has been deleted! :tada:`, {reply: message});
					});
				}
			});
		}
	},
	"insult": {
		"usage": "",
		"description": "(NOT DONE) Call the bot to your voice channel to deliver a special insult",
		"process": function(message, args){
			botChannel.send("There are currently no insults :sob:", {reply: message});
		}
	},
	"addsong": {
		"usage": "<link>",
		"description": "Adds a song to the song queue via a youtube link",
		"process": function(message, args){
			if(message.member.voiceChannel !== undefined){
				addSong(message, args[0]);
			} else{
				botChannel.send("You can't hear my music if you're not in a voice channel :cry:", {reply: message});
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
							botChannel.send("There was an error searching for your song :cry:", {reply: message});
							console.log("Error: " + err);
						}
						if(data){
							if(data.items.length === 0){
								botChannel.send(`There were no results for \`${query}\``);
							} else{
								addSong(message, "https://www.youtube.com/watch?v=" + data.items[0].id.videoId);
							}
						}
					});
				} else{
					botChannel.send(`You can search for a youtube song with \`${prefix}yt <query>\``, {reply: message});
				}
			} else{
				botChannel.send("You can't hear my music if you're not in a voice channel :cry:", {reply: message});
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
						botChannel.send("Song resumed! :play_pause:", {reply: message});
					} else{
						botChannel.send("Song is already playing", {reply: message});
					}
				} else{
					botChannel.send("No song is in the queue", {reply: message});
				}
			} else{
				botChannel.send("You can't hear my music if you're not in a voice channel :cry:", {reply: message});
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
						botChannel.send("Song paused! :pause_button:", {reply: message});
					} else{
						botChannel.send("Song is already paused", {reply: message});
					}
				} else{
					botChannel.send("No song is in the queue", {reply: message});
				}
			} else{
				botChannel.send("You can't hear my music if you're not in a voice channel :cry:", {reply: message});
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
					botChannel.send("There are no more songs :sob:", {reply: message});
				}
			} else{
				botChannel.send("You can't hear my music if you're not in a voice channel :cry:", {reply: message});
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
						//client.user.setGame(currentSong.title);
						//Workaround since above wouldn't work
						client.user.setPresence({ game: { name: "", type: 0 } });
						message.member.voiceChannel.leave();
						botChannel.send("Finished playing the song queue");
					}
					dispatcher.end("next");
				} else{
					botChannel.send("There are no more songs :sob:", {reply: message});
				}
			} else{
				botChannel.send("You can't hear my music if you're not in a voice channel :cry:", {reply: message});
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
						botChannel.send(`\`${args[0]}\` is an invalid index`, {reply: message});
					}
				} else{
					botChannel.send("There are no more songs :sob:", {reply: message});
				}
			} else{
				botChannel.send("You can't hear my music if you're not in a voice channel :cry:", {reply: message});
			}
		}
	},
	"random": {
		"usage": "",
		"description": "Chooses a random song from the queue to play.",
		"process": function(message, args){
			if(message.member.voiceChannel !== undefined){
				if(songQueue.length > 0){
					currentSongIndex = Math.floor(Math.random() * songQueue.length);
					dispatcher.end("random");
				} else{
					botChannel.send("There are no more songs :sob:", {reply: message});
				}
			} else{
				botChannel.send("You can't hear my music if you're not in a voice channel :cry:", {reply: message});
			}
		}
	},
	"clear": {
		"usage": "<index>",
		"description": "Clears the song queue or a specific song in the queue",
		"process": function(message, args){
			if(message.member.voiceChannel !== undefined){
				if(songQueue.length === 0){
					botChannel.send("There are no songs to clear", {reply: message});
				} else if(args.length > 0){
					var index = Number.parseInt(args[0]);
					if(Number.isInteger(index)){
						botChannel.send(`\`${songQueue[index - 1].title}\` has been removed from the song queue`, {reply: message});
						songQueue.splice(index - 1, 1);
						if(index - 1 <= currentSongIndex){
							currentSongIndex--;
						}
					} else{
						botChannel.send(`\`${args[0]}\` is an invalid index`, {reply: message});
					}
				} else{
					dispatcher.end("clear");
					currentSongIndex = 0;
					songQueue = [];
					//client.user.setGame(currentSong.title);
					//Workaround since above wouldn't work
					client.user.setPresence({ game: { name: "", type: 0 } });
					message.member.voiceChannel.leave();
					botChannel.send("The song queue has been cleared", {reply: message});
				}
			} else{
				botChannel.send("You can't hear my music if you're not in a voice channel :cry:", {reply: message});
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
					botChannel.send("Shuffle is now disabled", {reply: message});
				} else{
					shuffle = true;
					botChannel.send("Shuffle is now enabled", {reply: message});
				}
			} else{
				botChannel.send("You can't hear my music if you're not in a voice channel :cry:", {reply: message});
			}
		}
	},
	"autoremove": {
		"usage": "",
		"description": "Toggles autoremoving songs of the song queue",
		"process": function(message, args){
			if(message.member.voiceChannel !== undefined){
				if(autoremove){
					autoremove = false;
					botChannel.send("Song autoremoval is now disabled", {reply: message});
				} else{
					autoremove = true;
					botChannel.send("Song autoremoval is now enabled", {reply: message});
				}
			} else{
				botChannel.send("You can't hear my music if you're not in a voice channel :cry:", {reply: message});
			}
		}
	},
	"song": {
		"usage": "",
		"description": "Gives you information about the currently playing song",
		"process": function(message, args){
			if(songQueue.length > 0){
				botChannel.send(`The current song is \`${songQueue[currentSongIndex].title}\` :musical_note:, added by ${songQueue[currentSongIndex].user}`, {reply: message});
			} else{
				botChannel.send("No song is in the queue", {reply: message});
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
				botChannel.send("The song queue currently has:\n" + songList, {reply: message});
			} else{
				botChannel.send("No song is in the queue", {reply: message});
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
		botChannel.send(`I have added \`${info.title}\` to the song queue! :headphones:`, {reply: message});
		if(!client.voiceConnections.exists("channel", message.member.voiceChannel)){
			message.member.voiceChannel.join().then(function(connection){
				playSong(message, connection);
			}).catch(console.log);
		}
	}).catch(function(err){
		botChannel.send("Sorry I couldn't get info for that song :cry:", {reply: message});
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
	botChannel.send(`Now ${(shuffle) ? "randomly " : ""}playing \`${currentSong.title}\` :musical_note:, added by ${currentSong.user}`);
	//client.user.setGame(currentSong.title);
	//Workaround since above wouldn't work
	client.user.setPresence({ game: { name: currentSong.title, type: 0 } });
	dispatcher.player.on("warn", console.warn);
	dispatcher.on("warn", console.warn);
	dispatcher.on("error", console.error);
	dispatcher.once("end", reason => {
		console.log("Song ended because: " + reason);
		if(reason === "user" || reason === "Stream is not generating quickly enough."){
			if(autoremove){
				songQueue.splice(currentSongIndex, 1);
				if(songQueue.length === 0){
					//client.user.setGame(currentSong.title);
					//Workaround since above wouldn't work
					client.user.setPresence({ game: { name: "", type: 0 } });
					message.member.voiceChannel.leave();
				} else{
					setTimeout(() => {
						playSong(message, connection);
					}, 500);
				}
			} else{
				currentSongIndex++;
				if(currentSongIndex >= songQueue.length && !shuffle){
					//client.user.setGame(currentSong.title);
					//Workaround since above wouldn't work
					client.user.setPresence({ game: { name: "", type: 0 } });
					message.member.voiceChannel.leave();
					botChannel.send("Finished playing the song queue");
				} else{
					setTimeout(() => {
						playSong(message, connection);
					}, 500);
				}
			}
		} else if(reason === "prev" || reason === "next" || reason === "goto" || reason === "random"){
			setTimeout(() => {
				playSong(message, connection);
			}, 500);
		}
	});
}

var checkForCommand = message => {
	if(!botChannel){
		botChannel = message.guild.channels.find("name", botChannelName);
	}
	if(!message.author.client && message.content.startsWith(prefix)){
		if(botChannel){
			var args = message.content.substring(1).split(/ +/);
			var command = args.splice(0, 1);
			try{
				commands[command].process(message, args);
			} catch(e){
				botChannel.send("Sorry, that isn't a command yet :sob:", {reply: message});
				botChannel.send(`You can type \`${prefix}help\` to see a list of my commands`);
			}
		} else{
			message.channel.send(`Please create a \`${botChannelName}\` channel`);
		}
	}
	if(!message.author.client){
		var temp = "";
		if(message.content.substring(0, 3).toLowerCase() === "im "){
			temp = message.content.substring(3);
		} else if(message.content.substring(0, 4).toLowerCase() === "i'm "){
			temp = message.content.substring(4);
		}
		if(temp !== ""){
			message.channel.send("Hi " + temp + ", I'm dad.", {reply: message});
		}
	}
}

client.once("ready", () => {
	console.log("Bot ready");
});

client.on("disconnect", () => {
	console.log("Bot disconnected");
	process.exit(1);
});

client.on("guildMemberAdd", member => {
	member.guild.defaultChannel.send(`Welcome to the server, ${member}! :smile:`);
	member.guild.defaultChannel.send(`You can type \`${prefix}help\` to see my commands`);
});

client.on("message", message => {
	// Check if message is a command and not from bot
	if(!message.content.startsWith(prefix) || message.author.bot) return;

	// Parse command and args
	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();
	const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	// Check if command exists
	if(!command){
		message.reply("Sorry, that isn't a command yet :sob:");
		message.channel.send(`You can type \`${prefix}help\` to see my commands`);
		return;
	}

	// Check for required args
	if(command.args && !args.length){
		message.reply(`The usage for that command is \`${prefix}${command.name} ${command.usage}\``);
		return;
	}

	// Try to run command
	try {
		command.run(message, args);
	} catch(error) {
		console.error(error);
		message.reply("Sorry, there was an error trying to run that command :sob:");
	}
});

client.login(process.env.BOTTOKEN).then(() => {
	console.log("Bot logged in");
}).catch(console.log);

fs.readFile("save.json", (err, data) => {
	if(err){
		if(err.code === "ENOENT"){
			console.log("save.json does not exist");
			fs.writeFile("save.json", "{}", "utf8", err => {
				if(err) throw err;
				console.log("save.json created");
			});
		} else{
			throw err;
		}
	}
});
