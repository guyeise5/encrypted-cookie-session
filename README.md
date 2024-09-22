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

## Key Rotation

For added security, you can rotate your encryption keys periodically. Add the new key to your configuration and keep the old key temporarily to avoid invalidating active sessions:

```javascript
app.use(cookieSession({
  name: 'session',
  keys: [
      Buffer.from('a3c7a2aa31e6abf736d537dbc99d769119cba30454f5ee05f4af2252e97d27be', 'hex'), // current key
      Buffer.from('8ca500040ec4bbd8aedaafc83393547761946cb20dc49bb01c86b389187a387e', 'hex') // old key
  ],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
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