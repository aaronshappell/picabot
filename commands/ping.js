module.exports = {
    name: "ping",
    description: "Pings the bot, useful for seeing if it's alive",
    run: (message, args) => {
        message.reply("Pong :ping_pong:");
    }
};