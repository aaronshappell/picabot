const music_manager = require("../music_manager");

module.exports = {
    name: "song",
    description: "Gives you information about the currently playing song",
    run: (message, args) => {
        if(music_manager.songQueue.length){
            message.reply(`The current song is \`${music_manager.currentSong.title}\` :musical_note:, added by ${music_manager.currentSong.user}`);
        } else {
            message.reply("No song is in the queue");
        }
    }
};