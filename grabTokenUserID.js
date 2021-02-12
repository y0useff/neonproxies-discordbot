const request = require('request-promise')
const { username, password, apiUrl } = require('./config.json');

module.exports = async function(){
    const b64 = Buffer.from(`${username}:${password}`).toString("base64")
    const res = await request({
        method: "POST",
        uri: `${apiUrl}/login`,
        headers: {
            "accept": "application/json",
            "Authorization": `Basic ${b64}`
        }
    })
    return JSON.parse(res)
} 