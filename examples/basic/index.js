const app = require('express')()
const encryptedCookieSession = require('encrypted-cookie-session')
const crypto = require('crypto')
const port = (Number(process.env.PORT)) || 8080

app.use(encryptedCookieSession({
    keys: [crypto.randomBytes(32)]
}))

app.get("/", (req,res) => {
    req.session.visited = (req.session.visited || 0) + 1

    res.status(200).send(`You visited this site ${req.session.visited} times!`)
})

app.listen(port, () => console.log(`app is listening on ${port}`))