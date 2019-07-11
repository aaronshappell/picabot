const music_manager = require("../util/music_manager");

module.exports = {
    name: "clear",
    description: "Clears the entire song queue or a specific song in the queue",
    usage: "<index>",
    voice: true,
    run: (message, args) => {
        if(!music_manager.songQueue.length){
            message.reply("There are no songs to clear");
        } else if(args.length){ // Clear specific song
            let index = Number.parseInt(args[0]) - 1;
            if(isNaN(index) || index < 0 || index >= music_manager.songQueue.length){
                message.reply(`\`${args[0]}\` is an invalid index`);
            } else {
                music_manager.clear(message, index);
            }
        } else { // Clear the entire song queue
            music_manager.clear(message);
        }
    }
};