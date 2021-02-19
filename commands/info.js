const Discord = require('discord.js');
const client = new Discord.Client();
const { apiUrl } = require('../config.json')
const auth = require('../grabTokenUserID')
const request = require('request-promise')

module.exports = {
  name: "info",
  description: '',
  async execute(message, args) {
    //args[0] should be username
    //args[1] should be password
    if (args.length != 0) return message.channel.send("Invalid Arguments. Syntax should be ```!info```If you have not yet signed up, sign up using ```!signup <password>``` If you have forgotten your login information, please contact a staff member.")
    const res = await request({
      method: "GET",
      uri: `${apiUrl}/users/${(await auth()).user_id}/sub-users`,
      headers: {
          'accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${(await auth()).token}`,
      },
    })
    function grabTrafficUsed(users){
      for (let user of users) {
        if (user.username === username || user.username === oldUser) {
          return user.traffic 
        }
      }
    }

    function grabTrafficLimit(users){
      for (let user of users) {
        if (user.username === username || user.username === oldUser) {
          return user.traffic_limit
        }
      }
    }
    const oldUser = message.author.id
    const username = message.author.discriminator + message.author.id
    //grabs all users, parses to js object
    const users = JSON.parse(res)
    

    const trafficUsed = grabTrafficUsed(users)
    const trafficLimit = grabTrafficLimit(users)
    
    //  
// productEmbed = {
//   title: 'New Balance x Casablanca',
//   url: 'https://google.com',
//   color: '2df42d',
//   author: {
//     name: 'New DSML Raffle Detected!',
//   },
//   footer: {
//     text: 'made with love by yousef#9141 ❤️️'
//   },
//   timestamp: new Date()
// }

    const infoEmbed = {
      // content: null,
          title: "Data Usage",
          color: 13306623,
          fields: [{
              name: "Data Remaining",
              value: `${trafficLimit - trafficUsed}GB`,
              inline: true
          }, {
              name: "Data Used",
              value: `${trafficUsed}GB`,
              inline: true
          }, {
              name: "Total Data",
              value: `${trafficLimit}GB`
          }],
          author: {
              name: `${message.author.tag}`
          },
          thumbnail: {
              url: "https://cdn.discordapp.com/attachments/808129576101609512/809600695321100308/Alien_Logo.png"
          }
  }


    

    


    //self explantory
    // function grabSubUserID(users){
    //   for (let user of users) {
    //     if (user.username === username) {
    //       return user.id 
    //     }
    //   }
    // }


    // const subUserID = grabSubUserID(users)

    message.channel.send({embed: infoEmbed});

  }
}
