import {Request, Response} from "express";
import encryptedCookieSession from 'encrypted-cookie-session'
import crypto from 'crypto'
import express from "express";

const port = (Number(process.env.PORT)) || 8080

const app = express()

app.use(encryptedCookieSession({
    keys: [crypto.randomBytes(32)]
}))

app.get("/", (req: Request, res: Response) => {
    req.session.visited = (req.session.visited || 0) + 1

    res.status(200).send(`You visited this site ${req.session.visited} times!`)
})

app.listen(port, () => console.log(`app is listening on ${port}`))