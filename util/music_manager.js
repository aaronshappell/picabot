require('dotenv').config();
const ytdl = require('ytdl-core');
const Song = require('./song');

let songQueue = [];
let currentSongIndex = 0;
// let shuffle = false;
// let autoremove = false;

module.exports = {
    get songQueue(){
        return songQueue;
    },
    get currentSong(){
        if(!songQueue.length){
            return null;
        }
        return songQueue[currentSongIndex];
    },
    get currentSongIndex(){
        return currentSongIndex;
    },
    addSong: (message, id) => {
        ytdl.getBasicInfo(id).then(info => {
            songQueue.push(new Song(info, message.author.username));
            message.reply(`I have added \`${info.title}\` to the song queue! :headphones:`);
            message.member.voice.channel.join().then(connection => {
                connection.play(ytdl(songQueue[currentSongIndex].id, { 'filter': 'audioonly' }));
            }).catch(error => {
                console.error(error);
                message.reply('Couldn\'t join your voice channel');
            });
            // TODO: check for voice channel, connect and start playing
            /*
            console.log(message.client.voice.connections);
            if(!message.client.voice.connections)
            message.member.voice.channel.join().then(connection => {

            }).catch(error => {
                console.error(error);
                message.reply('Couldn't join your voice channel');
            });
            //console.log(message.client.voice.connections.has(message.member.voice.connection));
            if(!message.client.voice.connections.has(message.member.voice.channel)){
                message.member.voice.channel.join().then(connection => {
                    //const dispatcher = connection.play();
                }).catch(error => {
                    console.error(error);
                    message.reply('Couldn't join your voice channel');
                });
            }
            */
        }).catch(error => {
            console.error(error);
            message.reply('Sorry I couldn\'t get info for that song :sob:');
        });
    },
    clear: (message, index = -1) => {
        if(index === -1){
            songQueue = [];
            currentSongIndex = 0;
            message.client.user.setActivity();
            message.member.voice.channel.leave();
            message.reply('The song queue has been cleared');
        } else {
            message.reply(`\`${songQueue[index].title}\` has been removed from the song queue`);
            songQueue.splice(index, 1);
            if(index <= currentSongIndex){
                currentSongIndex--;
            }
        }
    },
};