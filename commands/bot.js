module.exports = {
    name: 'bot',
    description: 'Tells you information about the bot',
    aliases: ['about'],
    run: (message, args) => {
        const data = [];
        data.push('I am a discord bot for didney worl who has an appetite for non-nutritive substances');
        data.push('If you have any suggestions or command ideas for me tell @Crumster or your local amin');
        message.reply(data);
    },
};