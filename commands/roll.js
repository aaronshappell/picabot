module.exports = {
    name: "roll",
    description: "Rolls DnD style dice",
    usage: "<amount>d<sides>+<modifier>",
    args: true,
    run: (message, args) => {
        args.forEach(arg => {
            let regex = arg.match(/^(\d*)d(\d+)\+?(\d*)$/);
            // Check if die is valid
            if(regex === null){
                message.reply(`\`${arg}\` is not a valid die`);
                return;
            }
            // Parse values
            let amount = Number.parseInt(regex[1]);
            let die = Number.parseInt(regex[2]);
            let modifier = Number.parseInt(regex[3]);
            if(!amount) amount = 1;
            if(!modifier) modifier = 0;
            // Roll dice
            const rolls = [];
            for(let i = 0; i < amount; i++){
                rolls.push(Math.floor(Math.random() * die) + 1);
            }
            const result = rolls.reduce((acc, cur) => acc + cur) + modifier;
            message.reply(`You rolled \`${amount}d${die}+${modifier}\` :game_die: and got: \`(${rolls.join(", ")}) + ${modifier} = ${result}\``);
        });
    }
};