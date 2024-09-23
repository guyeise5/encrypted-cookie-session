import {CookieOptions, Router} from 'express'
import crypto, {BinaryLike} from 'crypto'

// @ts-ignore
import onHeaders from "on-headers";
import cookieParser from "cookie-parser";

const separator = ":";

export type RouterOptions = {
    name?: string
    cookieOptions?: CookieOptions
    keys: [crypto.CipherKey, ...crypto.CipherKey[]],

}

export type EncryptedCookieSession = {
    [key: string]: any
}

export type SessionOptions = {
    /**
     * Additional options to add to the cookie
     */
    cookieOptions: CookieOptions
    /**
     * true if the session is new, false otherwise
     */
    isNew: boolean
}

declare global {
    namespace Express {
        // noinspection JSUnusedGlobalSymbols
        export interface Request {
            session: EncryptedCookieSession
            sessionOptions: SessionOptions
        }
    }
}

function encrypt(plain: BinaryLike, key: crypto.CipherKey, iv: Buffer): Buffer {
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
    return Buffer.concat([cipher.update(plain), cipher.final()])
}

function sign(data: BinaryLike, key: crypto.CipherKey): Buffer {
    const hmac = crypto.createHmac('sha256', key);
    return hmac.update(data).digest()
}

function decrypt(cipherData: Buffer, key: crypto.CipherKey, iv: Buffer): Buffer {
    const cipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
    return Buffer.concat([cipher.update(cipherData), cipher.final()])
}

function readSession(keys: crypto.CipherKey[], cookie?: string): EncryptedCookieSession {
    if(!cookie) {
        return {}
    }
    const [sig, iv, cipherData] = cookie.split(separator).map(d => Buffer.from(d, 'base64'))

    if(!sig || !iv || !cipherData) {
        return {}
    }

    const signData = Buffer.concat([iv, cipherData])
    const key = keys.find(k => sig.equals(sign(signData,k)))
    if(!key) {
        return {}
    }

    try {
        const plain = decrypt(cipherData, key, iv)
        return JSON.parse(plain.toString("utf-8"))
    } catch (e) {
        return {}
    }
}

function isEmpty(obj: object) {
    return Object.keys(obj).length === 0;
}

const router =  function(options: RouterOptions) {
    const name = options.name || "session"
    const keys = options.keys
    const encKey = options.keys[0]
    const router = Router()
    router.use(cookieParser())
    router.use((req,res,next) => {
        req.session = readSession(keys, req.cookies[name])
        req.sessionOptions = {
            cookieOptions: {},
            isNew: isEmpty(req.session)
        }
        const originalSession = JSON.stringify(req.session)
        onHeaders(res, () => {
            const serializedSession = JSON.stringify(req.session)

            if(serializedSession == originalSession) {
                return;
            }

            const cookieOptions = {...options.cookieOptions, ...req.sessionOptions.cookieOptions}

            if(isEmpty(req.session)) {
                res.clearCookie(name, cookieOptions)
                return;
            }

            const plain = Buffer.from(serializedSession)
            const iv = crypto.randomBytes(16);
            const cipherData = encrypt(plain, encKey, iv)
            const signData = Buffer.concat([iv, cipherData])
            const sig = sign(signData, encKey)
            const s = [sig.toString('base64'), iv.toString('base64'), cipherData.toString('base64')].join(separator)
            res.cookie(name, s, cookieOptions)
        })
        next()
    })

    return router;
}
module.exports = router
module.exports.default = router
