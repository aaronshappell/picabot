const {prefix} = require("../config.json");

module.exports = {
    name: "help",
    description: "Gives you a list of commands or how to use a specific command",
    usage: "<command>",
    run: (message, args) => {
        const data = [];
        const commands = message.client.commands;

        if(!args.length){ // List avaiable commands
            data.push("My current commands are: ");
            data.push(commands.map(command => command.name).join(", "));
            data.push(`\nYou can use \`${prefix}help <command>\` to learn more about a command!`);
            message.reply(data);
        } else { // Give usage of specific commands
            for(let arg in args){
                try{
                    let command = commands.get(arg);
                    data.push(`\`${prefix}${command.name} ${command.usage}\`: ${command.description}\n`);
                } catch(error){
                    data.push(`\`${prefix}${arg.toLowerCase()}\`: Not a command\n`);
                }
                message.reply(data);
            }
        }
    }
};