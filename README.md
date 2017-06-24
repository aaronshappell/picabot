# picabot
A discord bot for didney worl who has an appetite for non-nutritive substances

## Installation and Setup
You can install the bot by first cloning the git repo. Make sure you have both node and npm installed on your computer. Then you must install the necessary dependencies with `npm install` in the project directory. In order to run the bot you must at provide the bot token in an `auth.json` file. It is also highly reccomended to add a google api key there as well for the `search` command to work. See [example.auth.json](https://github.com/aaronshappell/picabot/blob/master/example.auth.json) for details. At this point you can either make edits or run the bot!

## Running
You can run the bot with `node ./` from within the project directory.  
It will print `Bot ready!` when the bot is ready to recieve commands.

## Commands
The current commands are as follows:  
`help <command>` Gives you a list of commands you can use or details on specific command(s)  
`bot` Tells you information about the bot  
`ping` Pings the bot, useful for seeing if it's alive  
`roll <amount>d<sides>` Rolls a die  
`8ball` Asks a magic 8ball for a fortune  
`save <key> <message>` Saves a personalized message with a given key  
`recall <key>` Lists your saved messages or recalls a saved message with a given key  
`delete <key>` Deletes a saved message with a given key  
`insult` (Not implemented) Calls the bot to your voice channel to deliver a special insult  
`addsong <link>` Adds a song to the song queue via a youtube link  
`search <query>` Searches for a youtube video to add to the song queue  
`play` Resumes the current song  
`pause` Pauses the current song  
`next` Skips to the next song in the queue  
`clear` Clears the song queue  
`song` Gives you information about the currently playing song  
`music` Gives you a list of the songs currently in the queue

A command in the commands object consists of three parts: usage, description, and its process.
```
"command": {
    "usage": "<argument>",
    "description": "Describes what the command does",
    "process": function(message, args){
        //Do stuff here
    }
}
```