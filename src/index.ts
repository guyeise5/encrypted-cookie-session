import {CookieOptions, Router} from 'express'
import crypto, {BinaryLike} from 'crypto'

// @ts-ignore
import onHeaders from "on-headers";
import cookieParser from "cookie-parser";

const separator = ":";

type SecretOrKeys = {
    secret: crypto.CipherKey
    keys?: never
} | {
    keys: [crypto.CipherKey, ...crypto.CipherKey[]],
    secret?: never
}
export type RouterOptions = {
    name?: string
    cookieOptions?: CookieOptions
} & SecretOrKeys

export type EncryptedCookieSession = {
    [key: string]: any
}

declare global {
    namespace Express {
        // noinspection JSUnusedGlobalSymbols
        export interface Request {
            session: EncryptedCookieSession
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

    const key = keys.find(k => sig.equals(sign(cipherData,k)))
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

export default function(options: RouterOptions) {
    const name = options.name || "session"
    const keys = options.keys ? options.keys : [options.secret]
    const encKey = options.keys ? options.keys[0] : options.secret
    const router = Router()
    router.use(cookieParser())
    router.use((req,res,next) => {
        req.session = readSession(keys, req.cookies[name])
        const originalSession = JSON.stringify(req.session)
        onHeaders(res, () => {
            const serializedSession = JSON.stringify(req.session)

            if(serializedSession == originalSession) {
                return;
            }
            const plain = Buffer.from(serializedSession)
            const iv = crypto.randomBytes(16);
            const cipherData = encrypt(plain, encKey, iv)
            const sig = sign(cipherData, encKey)
            const s = [sig.toString('base64'), iv.toString('base64'), cipherData.toString('base64')].join(separator)
            res.cookie(name, s, options.cookieOptions || {})
        })
        next()
    })

    return router;
}