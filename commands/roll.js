module.exports = {
    name: "roll",
    description: "Rolls DnD style dice",
    usage: "<amount>d<sides>+<modifier>",
    args: true,
    run: (message, args) => {
        if(Math.floor(Math.random() * 100 + 1) === 1){
            message.reply("You tried to roll a `die` :game_die: and got: `rick`");
            message.channel.send("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
            return;
        }
        args.forEach(arg => {
            let regex = arg.match(/^(\d*)d(\d+)\+?(\d*)$/);
            if(regex === null){
                message.reply(`\`${arg}\` is not a valid die`);
            } else{
                if(regex[1] === "") regex[1] = 1;
                if(regex[3] === "") regex[3] = 0;
                let rolls = "(";
                let roll;
                let sum = 0;
                for(let i = 0; i < regex[1] - 1; i++){
                    roll = Math.floor(Math.random() * Number.parseInt(regex[2]) + 1);
                    sum += roll;
                    rolls += roll + ", ";
                }
                roll = Math.floor(Math.random() * Number.parseInt(regex[2]) + 1);
                sum += roll;
                rolls += roll + ") + " + regex[3] + " = " + (sum + Number.parseInt(regex[3]));
                message.reply(`You rolled \`${arg}\` :game_die: and got: \`${rolls}\``);
            }
        });
    }
};