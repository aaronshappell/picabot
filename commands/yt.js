const {google} = require("googleapis");
const youtube = google.youtube({
	version: "v3",
	auth: process.env.GOOGLEAPIKEY
});
const music_manager = require("../util/music_manager");

module.exports = {
    name: "yt",
    description: "Searches for a youtube video or via a youtube link to add to the song queue",
    usage: "<query>",
    aliases: ["youtube"],
    args: true,
    voice: true,
    run: (message, args) => {
        // Check for link
        if(args[0].startsWith("https://")){
            music_manager.addSong(message, args[0]);
        }
        // Search youtube for query
        const query = args.join(" ");
        youtube.search.list({
            q: query,
            type: "video",
            maxResults: "1",
            part: "snippet"
        }).then(res => {
            if(res.data.items.length){
                music_manager.addSong(message, res.data.items[0].id.videoId);
            } else {
                message.reply(`There were no results for \`${query}\``);
            }
        }).catch(error => {
            console.error(error);
            message.reply("There was an error searching for your song :cry:");
        });
    }
};