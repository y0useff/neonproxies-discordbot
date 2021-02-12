const grabTokenUserID = require('./grabTokenUserID.js')()

async function print() {
    console.log(await grabTokenUserID)
}
print()