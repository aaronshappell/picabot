const fortunes = ["It is certain", "It is decidedly so", "Without a doubt", "Yes definitely", "You may rely of it", "As I see it, yes", "Most likely", "Outlook good", "Yes", "Signs point to yes", "Reply hazy try again", "Ask again later", "Better not tell you now", "Cannot predict now", "Concentrate and ask again", "Dont count on it", "My reply is no", "My sources say no", "Outlook not so good", "Very doubtful"];

module.exports = {
    name: "8ball",
    description: "Asks a magic 8ball for a fortune",
    aliases: ["fortune"],
    run: (message, args) => {
        message.reply(fortunes[Math.floor(Math.random() * fortunes.length)]);
    }
};