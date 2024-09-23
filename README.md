# Encrypted Cookie Session

Encrypted Cookie Session is a middleware for managing encrypted cookie-based sessions in your Express.js applications.
This ensures that sensitive session data is securely stored on the cookie.

## Features

- **Encryption**: Encrypts session data to prevent users from reading the session data.
- **Ease of Use**: Simple integration with your existing Express.js framework.
- **Security**: Protects against session hijacking and data tampering.

## Installation

To install the package, use npm:

```bash
npm install encrypted-cookie-session
```

## Usage

### Basic Setup

1. **Import and configure the middleware** in your Express.js application:

```javascript
const express = require('express');
const cookieSession = require('encrypted-cookie-session');

const app = express();

app.use(cookieSession({
  keys: [Buffer.from('a3c7a2aa31e6abf736d537dbc99d769119cba30454f5ee05f4af2252e97d27be', 'hex')]
}));

app.get('/', (req, res) => {
  req.session.key = 'value';
  res.send('Session data saved!');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```

### Deleting the session
Deleting the session is as easy as setting the session to `{}`
```javascript
app.get("/logout", (req,res,next) => {
    req.session = {}
    next();
})
```

### Configuration Options

- **`keys`**(required):
    - **Description**: An array of secret keys used for encrypting and decrypting the session data. This allows for key rotation. Each key must be 32 bytes. The data is always encrypted using `keys[0]` but can be decrypted with each one of the keys 
    - **Type**: `crypto.CipherKey[]`
    - **Code Example**:
      ```javascript
      app.use(cookieSession({
        keys: [Buffer.from('a3c7a2aa31e6abf736d537dbc99d769119cba30454f5ee05f4af2252e97d27be', 'hex'), Buffer.from('8ca500040ec4bbd8aedaafc83393547761946cb20dc49bb01c86b389187a387e', 'hex')]       
      }));
      ```

- **`name`**:
    - **Description**: The name of the session cookie.
    - **Type**: `String`
    - **Default**: `'session'`
    - **Code Example**:
      ```javascript
      app.use(cookieSession({
        name: 'my_session_cookie',
      }));
      ```

- **`cookieOptions.maxAge`**:
    - **Description**: The maximum age of the session cookie in milliseconds. This determines how long the session will be valid.
    - **Type**: `Number`
    - **Code Example**:
      ```javascript
      app.use(cookieSession({
        cookieOptions: {
            maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
        }
      }));
      ```

- **`cookieOptions.secure`**:
    - **Description**: Ensures the cookie is only sent over HTTPS. This is highly recommended for production environments to enhance security.
    - **Type**: `Boolean`
    - **Code Example**:
      ```javascript
      app.use(cookieSession({
        cookieOptions: {
            secure: true
        }
      }));
      ```

- **`cookieOptions.httpOnly`**:
    - **Description**: Ensures the cookie is not accessible via JavaScript, which helps mitigate certain types of attacks such as cross-site scripting (XSS).
    - **Type**: `Boolean`
    - **Code Example**:
      ```javascript
      app.use(cookieSession({
        cookieOptions: {
            httpOnly: true
      }
      }));
      ```

- **`cookieOptions.sameSite`**:
    - **Description**: Controls whether the cookie is sent with cross-site requests, providing some protection against cross-site request forgery (CSRF) attacks.
    - **Type**: `String`
    - **Code Example**:
      ```javascript
      app.use(cookieSession({
        cookieOptions: {
            sameSite: 'Strict'
        }
      }));
      ```

### Dynamic cookie options
You can choose the cookie options based on the request
using `sessionOptions.cookieOptions`
```javascript
req.get("/", (req,res,next) => {
    req.sessionOptions.cookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000 // 1 week
    next()
})
```
### Checking for new session
New session can be checked using `sessionOptions.isNew`
```javascript
req.get("/login", (req,res,next) => {
    if(req.sessionOptions.isNew) {
        // do login
    } else {
        return res.redirect("/")
    }
})
```

These examples should help you configure the `encrypted-cookie-session` middleware to suit your application's needs. If you have any more questions or need further assistance, feel free to ask!

### Key Rotation

For added security, you can rotate your encryption keys periodically. Add the new key to your configuration and keep the old key temporarily to avoid invalidating active sessions:

```javascript
app.use(cookieSession({
  keys: [
      Buffer.from('a3c7a2aa31e6abf736d537dbc99d769119cba30454f5ee05f4af2252e97d27be', 'hex'), // current key
      Buffer.from('8ca500040ec4bbd8aedaafc83393547761946cb20dc49bb01c86b389187a387e', 'hex') // old key
  ],
}));
```

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

Special thanks to all contributors and the open-source community for their support.

---

Feel free to customize this README to better fit your project's specifics! If you have any other questions or need further assistance, just let me know.