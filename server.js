const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

// using dotenv for specifying config.env file path
dotenv.config({ path: '.env' })

// google auth
const { OAuth2Client } = require('google-auth-library');
const req = require('express/lib/request');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// getting port value from config.env file or default port value is 5000
const port = process.env.PORT || 5000;

// set view engine
app.set('view engine', 'ejs');

// use json and cookie parser
app.use(express.json());
app.use(cookieParser());

// routes
app.get('/', (req, res) => {
    res.render('index');
})
app.get('/login', (req, res) => {
    res.render('login');
})
app.get('/logout', (req, res) => {
    res.clearCookie('google-auth');
    res.redirect('/login');
})
app.get('/dashboard', auth, (req, res) => {
    res.render('dashboard', {
        user: req.user,
    });
})
app.post('/login', (req, res) => {
    let token = req.body.token;
    // console.log(token);
    async function verify() {
        try {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            if (ticket) {
                const payload = ticket.getPayload();
                const userid = payload['sub'];
                console.log(payload);
                // create cookie for browser
                res.cookie('google-auth', token);
                res.send('success');
            }
        } catch (error) {
            res.send(error);
        }
    }
    verify();
})


// middleware
function auth(req, res, next) {
    let token = req.cookies['google-auth'];
    // console.log(token);
    async function verify() {
        try {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            if (ticket) {
                const payload = ticket.getPayload();
                req.user = payload;
                next();
            }
        } catch (error) {
            // res.send(error);
            res.redirect('/login')
        }
    }
    verify();
}

// app listen on
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
});