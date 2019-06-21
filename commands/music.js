const music_manager = require("../util/music_manager");

module.exports = {
    name: "music",
    description: "Gives you a list of the songs currently in the queue",
    aliases: ["queue", "songs"],
    run: (message, args) => {
        if(music_manager.songQueue.length){
            const data = [];
            music_manager.songQueue.forEach(song => {
                data.push(`\`${song.index + 1}. ${song.title}\``);
                if(song.index == music_manager.currentSong.index){
                    data[song.index] = `__**${data[song.index]}**__`;
                }
            });
            message.reply(`The song queue currently has:\n${data}`);
        } else {
            message.reply("No music is in the queue");
        }
    }
};