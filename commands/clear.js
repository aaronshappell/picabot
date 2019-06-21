const music_manager = require("../music_manager");

module.exports = {
    name: "clear",
    description: "Clears the song queue or a specific song in the queue",
    usage: "<index>",
    voice: true,
    run: (message, args) => {
        console.log(music_manager.addSong());
    }
};