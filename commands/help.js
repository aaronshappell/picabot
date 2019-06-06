module.exports = {
    name: "help",
    description: "Gives you a list of commands or how to use a specific command",
    usage: "<command>",
    run: (message, args) => {
        /*
        If no args, print list of available commands
        else print out description/usage for the given command
        
        probably gonna remove multi command help like before (so just have to call help several times)
        */
    }
};