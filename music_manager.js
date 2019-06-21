require("dotenv").config();
const ytdl = require("ytdl-core");

let songQueue = [];
let currentSongIndex = 0;
let prevSongIndex = 0;
let shuffle = false;
let autoremove = false;

module.exports = {
    addSong: (message, id) => {
        ytdl.getBasicInfo(id).then(info => {
            console.log(info);
            songQueue.push(new Song(info, message.author.username, songQueue.length));
            message.reply(`I have added \`${info.title}\` to the song queue! :headphones:`);
            // TODO: check for voice channel, connect and start playing
        }).catch(error => {
            console.error(error);
            message.reply("Sorry I couldn't get info for that song :cry:");
        });
    },
    get songQueue(){
        return songQueue;
    },
    get currentSong(){
        if(!songQueue.length){
            return null;
        }
        return songQueue[currentSongIndex];
    }
};