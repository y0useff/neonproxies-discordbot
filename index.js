const Discord = require('discord.js');
const fs = require('fs')
const { prefix, token } = require('./config.json');
const client = new Discord.Client();
const grabTokenUserID = require('./grabTokenUserID.js')

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`)

  //set a new item in the Collection
  //with the key as the command name and the value as the exported module
  client.commands.set(command.name, command);
}



// async function stuff(){
//     await grabTokenUserID()
// }
// stuff()

client.on('ready', () => {
    console.log("NeonProxies Bot Ready.")
})


client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;
	const args = message.content.slice(prefix.length).split(/ +/);
	const command = args.shift().toLowerCase();
    if (message.guild != null) return;

    if (command === 'verify') {
        client.commands.get('verify').execute(message, args)
    }

    if (command === 'signup') {
        client.commands.get('signup').execute(message, args)
    }

    if (command === 'info') {
        client.commands.get('info').execute(message, args)
    }
    
    if (command === 'generate') {
        client.commands.get('generate').execute(message, args)
    }

})


client.login(token)