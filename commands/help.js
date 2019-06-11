const {prefix} = require("../config.json");

module.exports = {
    name: "help",
    description: "Gives you a list of commands or how to use a specific command",
    usage: "<command>",
    run: (message, args) => {
        const data = [];
        const commands = message.client.commands;

        if(!args.length){ // List avaiable commands
            data.push(`My current commands are: ${commands.map(command => command.name).join(", ")}`);
            data.push(`You can use \`${prefix}help <command>\` to learn more about a command!`);
            message.reply(data);
        } else { // Give usage/description of specific commands
            for(let arg of args){
                const commandName = arg.toLowerCase();
                let command = message.client.commands.get(commandName) || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
                if(command){
                    data.push(`\`${prefix}${command.name}${command.usage ? " " + command.usage : ""}\`: ${command.description}`);
                } else{
                    data.push(`\`${prefix}${commandName}\`: Not a command`);
                }
            }
            message.reply(data);
        }
    }
};