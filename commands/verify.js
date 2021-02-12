const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('../grabTokenUserID')
const { apiUrl, shopifyUrl, XShopifyAccessToken, test } = require('../config.json')
const request = require('request-promise');
module.exports = {
  name: "verify",
  description: '',
  async execute(message, args) {
    //!verify (ordernumber)
    // if (admins.includes(message.author.id) == false) return message.channel.send("not an authorized user.");

    //un comment line below when not testing
    if (args.length != 2) return message.channel.send("Invalid Arguments. Syntax should be ```!verify <ordernumber> <emailofpurchase>```If you have not yet signed up, sign up using ```!signup <password>```")
    
    const username = message.author.id

    const res = await request({
      method: "GET",
      uri: `${apiUrl}/users/${(await auth()).user_id}/sub-users`,
      headers: {
          'accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${(await auth()).token}`,
      },
    })
    
    //grabs all users, parses to js object
    const users = JSON.parse(res)
    

    //self explantory
    function grabSubUserID(users){
      for (let user of users) if (user.username === username) return user.id 
    }

    function grabCurrentTrafficLimit(users){
      for (let user of users) if (user.username === username) return user.traffic_limit
    }

    const subUserId = grabSubUserID(users)
    const currentTrafficLimit = grabCurrentTrafficLimit(users)

    if (subUserId == undefined) return message.channel.send("User not found! If you have not yet signed up, sign up using ```!signup <username> <password>```")

    //use shopify api
    //check if order exists, and is for proper product
    //verify email with order
    //update subuser with oxylabs data
    //mark order on shopify as fulfilled 

    const order = JSON.parse(await request({
      method: "GET",
      uri: `${shopifyUrl}/orders.json?name=${args[0]}`,
      headers: {
          'accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Shopify-Access-Token': XShopifyAccessToken
      },
    }))

    
    if (order.orders.length != 1) return message.channel.send("Invalid Order Number!")

    if (order.orders[0].email != args[1]) return message.channel.send("Invalid email! Make sure you are using the email that you used to purchase the proxies.")


    request({
      method: "POST",
      uri: `${shopifyUrl}/orders/${order.orders[0].id}/close.json`,
      headers: {
          'accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Shopify-Access-Token': XShopifyAccessToken
      },
    }).then(res => {
      message.channel.send("Order has been successfully verified!")
    }).catch(err => {
      message.channel.send("An unknown error occurred attempting to verify your order. Contact staff if this issue persists.")
      console.log(err)
    })
    const productPurchased = order.orders[0].line_items

    if (productPurchased.length != 1) return message.channel.send("Error! Either zero or multiple items found in cart. Please contact staff.")
    
    //add future products to check 
    if (productPurchased[0].product_id != test) return message.channel.send("Invalid product. Contact a staff member.") 

    const quantityPurchased = productPurchased[0].quantity
    
    request({
      method: "PATCH",
      uri: `${apiUrl}/users/${(await auth()).user_id}/sub-users/${subUserId}`,
      headers: {
          'accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${(await auth()).token}`,
      },
      body: JSON.stringify({
        traffic_limit: currentTrafficLimit + quantityPurchased,
      }) 
    }).then(res => {
      console.log(res)
      message.channel.send("Data Successfully updated!")
    }).catch(err => {
      console.log(err)
      message.channel.send("An error occurred attempting to increase user data!!")
    })

  }
}
