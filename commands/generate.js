const Discord = require('discord.js');
const client = new Discord.Client();
const countrycityjson = require('../countrycity.json')
const cryptoRandomString = require('crypto-random-string');
const { apiUrl } = require('../config.json')
const fs = require('fs')
const auth = require('../grabTokenUserID')
const request = require('request-promise')

const states = [
    "alabama",
    "alaska",
    "arizona",
    "arkansas",
    "california",
    "colorado",
    "connecticut",
    "delaware",
    "florida",
    "georgia",
    "hawaii",
    "idaho",
    "illinois",
    "indiana",
    "iowa",
    "kansas",
    "kentucky",
    "louisiana",
    "maine",
    "maryland",
    "massachusetts",
    "michigan",
    "minnesota",
    "mississippi",
    "missouri",
    "montana",
    "nebraska",
    "nevada",
    "new_hampshire",
    "new_jersey",
    "new_mexico",
    "new_york",
    "north_carolina",
    "north_dakota",
    "ohio",
    "oklahoma",
    "oregon",
    "pennsylvania",
    "rhode_island",
    "south_carolina",
    "south_dakota",
    "tennessee",
    "texas",
    "utah",
    "vermont",
    "virginia",
    "washington",
    "west_virginia",
    "wisconsin",
    "wyoming"
]

module.exports = {
  name: "generate",
  description: '',
  async execute(message, args) {

    const res = await request({
        method: "GET",
        uri: `${apiUrl}/users/${(await auth()).user_id}/sub-users`,
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${(await auth()).token}`,
        },
    })

    const users = JSON.parse(res)

    for (let user of users){
        if (user.username === message.author.id) usr = message.author.id
        if (user.username === message.author.discriminator + message.author.id) usr = message.author.discriminator + message.author.id
    }



    let entry = `customer-${usr}`
    //!generate <password you signed up with using !signup> <type: static | rotating> <quantity> <country/city> <optional: state> 

    if (args.length < 4  || args.length > 5) return message.channel.send("Invalid syntax! Here is the following usage for the command: ```!generate <password you signed up with using !signup> <type: static | rotating> <quantity> <country | city> <optional: state>```")
    
    const password = args[0]
    const type = args[1]
    const quantity = args[2]
    const countryOrCity = args[3]
    let state = args[4]
    //args[4] is state

    if (password == undefined) return message.channel.send("password is undefined.")
    if (type != "static") return message.channel.send("At this time, we are not providing the proxy type that you have specified.")
    if (quantity < 1 || quantity > 2000) return message.channel.send("Number of proxies must be greater than 0 and less than 2000!")

    function grabState(userInput){
        userInput = userInput.toString()
        if (userInput.startsWith("us_")) userInput = userInput.substring(userInput.indexOf("_") +1)
        for (let st of states) if (st == userInput) return `-st-us_${st}`
        
    }

    function grabCityCountry(userInput){
        for (let city of countrycityjson){
            if (city.city == userInput) return `-cc-${city.country}-city-${city.city}`

        }
    }

    function grabCountry(userInput){
        userInput = userInput.toUpperCase()
        if (userInput == "UK") return `-cc-UK`
        for (let country of countrycityjson){
            if (country.country == userInput) return `-cc-${country.country}`
        }
    }

    function generateSessionID(){
        return `-sessid-${cryptoRandomString({length:15})}`
    }


    function constructParameters(password, type, countryOrCity, state){

        if (state != undefined && grabState(state) != undefined) return `${entry}${grabState(state)}${generateSessionID()}:${password}`
        if (state != undefined && grabState(state) == undefined) {
            message.channel.send("Invalid State!")
            return undefined
        } 
        if (state == undefined && countryOrCity.length == 2 && grabCountry(countryOrCity) != undefined) return `${entry}${grabCountry(countryOrCity)}${generateSessionID()}:${password}`
        if (state == undefined && countryOrCity.length != 2 && grabCityCountry(countryOrCity) != undefined) return `${entry}${grabCityCountry(countryOrCity)}${generateSessionID()}:${password}`
        message.channel.send("An error occurred. Please make sure you are pulling from the correct pools. Please refer to #pool-codes in the NeonProxies Discord server.")
        return;
    }

    async function createPoolProxy(parameters){
        if (parameters == undefined ) return "err"
        if (countryOrCity == "us" || countryOrCity == "US") return `us-pr.neonproxies.io:${Math.floor(Math.random() * (19999 - 10001) + 10001)}:${parameters}` 
        return `pr.neonproxies.io:${Math.floor(Math.random() * (49999 - 10000) + 10000)}:${parameters}`
    }

    counter = 0
    fs.writeFileSync(`${message.author.discriminator + message.author.id}.txt`, "")
    if (await createPoolProxy(await constructParameters(password, type, countryOrCity, state)) == "err") return counter = quantity + 1
    while (counter < quantity){
        fs.appendFileSync(`${message.author.discriminator + message.author.id}.txt`, `${await createPoolProxy(await constructParameters(password, type, countryOrCity, state))}\n`)
        counter++
    }

    const buffer = fs.readFileSync(`${usr}.txt`);
    const attachment = new Discord.MessageAttachment(buffer, `${usr}.txt`);
    message.channel.send(`${message.author}, here are your proxies!`, attachment)
    fs.unlinkSync(`${usr}.txt`)

  }
}
