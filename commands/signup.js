const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('../grabTokenUserID')
const request = require('request-promise')
const { apiUrl } = require('../config.json')

module.exports = {
  name: "signup",
  description: '',
  async execute(message, args) {
    
    //!verify (ordernumber)
    // if (admins.includes(message.author.id) == false) return message.channel.send("not an authorized user.");
    if (args.length != 1) return message.channel.send("Invalid Arguments. Syntax should be ```!signup <password>``` Make sure you save your password!")

    const res = request({
        method: "POST",
        resolveWithFullResponse: true,
        url: `${apiUrl}/users/${(await auth()).user_id}/sub-users`,
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${(await auth()).token}`,
        },
        body: JSON.stringify({
            username: message.author.id,
            password: args[0],
            traffic_limit: 0,
            lifetime: true,
            auto_disable: true
        })      
    }).catch(err => console.log(err))
    console.log(res);

    message.channel.send("Account Created!")

    
  }
}
