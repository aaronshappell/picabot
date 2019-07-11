const music_manager = require('../util/music_manager');

module.exports = {
    name: 'music',
    description: 'Gives you a list of the songs currently in the queue',
    aliases: ['queue', 'songs'],
    run: (message, args) => {
        if(music_manager.songQueue.length){
            const data = [];
            console.log(music_manager.songQueue);
            music_manager.songQueue.forEach((song, index) => {
                data.push(`\`${index + 1}. ${song.title}\``);
                if(index === music_manager.currentSongIndex){
                    data[index] = `__**${data[index]}**__`;
                }
            });
            data.unshift('The song queue currently has:');
            message.reply(data);
        } else {
            message.reply('No music is in the queue');
        }
    }
};