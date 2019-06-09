module.exports = {
    name: "bot",
    description: "Tells you information about the bot",
    aliases: ["about"],
    run: (message, args) => {
        message.reply("I am a discord bot for didney worl who has an appetite for non-nutritive substances");
        message.channel.send("If you have any suggestions or command ideas for me tell @Crumster or your local amin");
    }
};