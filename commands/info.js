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
    
    const username = message.author.id
    //grabs all users, parses to js object
    const users = JSON.parse(res)
    

    //self explantory
    // function grabSubUserID(users){
    //   for (let user of users) {
    //     if (user.username === username) {
    //       return user.id 
    //     }
    //   }
    // }

    function grabTrafficUsed(users){
      for (let user of users) {
        if (user.username === username) {
          return user.traffic 
        }
      }
    }

    function grabTrafficLimit(users){
      for (let user of users) {
        if (user.username === username) {
          return user.traffic_limit
        }
      }
    }
    const trafficUsed = grabTrafficUsed(users)
    const trafficLimit = grabTrafficLimit(users)
    // const subUserID = grabSubUserID(users)

    message.channel.send(`You have ${trafficLimit - trafficUsed} gigabytes of data remaining!`)

  }
}
