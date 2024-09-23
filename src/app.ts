 import express from 'express'
import encryptedCookieSession from "./index";
const port = Number(process.env.PORT) || 8080
const app = express()
app.use(encryptedCookieSession({
    keys: [
        Buffer.from('a3c7a2aa31e6abf736d537dbc99d769119cba30454f5ee05f4af2252e97d27be', 'hex'),
        Buffer.from('a327a2aa31e6abf736d537dbc99d769119cba30454f5ee05f4af2252e97d27be', 'hex'),
    ],
    cookieOptions: {
        maxAge: 1000
    }
}))


app.use("*", (req,res) => {
    req.session.hello = (Number(req.session.hello) || 0) + 1
    // req.session.a = 22
    req.session.x = 22
    // req.session.b = 22
    console.log(req.session)
    res.json(req.session)
})

app.listen(port, () => console.log(`app is listening on ${port}`))