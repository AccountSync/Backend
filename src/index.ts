import express, {Express, Request, Response} from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import config from '../config.json'
import jwt from 'jsonwebtoken'
import { request } from 'undici'
import { URLSearchParams } from 'url'
import { verifyToken } from './util'
import { createUser, updateFriends, prisma } from './database'
import dotenv from 'dotenv'

dotenv.config()

export const maxDuration = 60;

const app: Express = express()
const jsonParser = bodyParser.json()

app.use(cors())

app.get('/', (req, res) => {
    return res.redirect('/home');
});

app.post('/verify', jsonParser, async (req, res) => {
	const code = req.body.code;

	if (code) {
		try {
			const body = new URLSearchParams({
				client_id: process.env.CLIENT_ID as string,
				client_secret: process.env.CLIENT_SECRET as string,
				code: code as string,
				grant_type: 'authorization_code',
				redirect_uri: config.homeURL,
				scope: 'identify+email',
			}).toString();
			const tokenResponseData = await request('https://discord.com/api/oauth2/token', {
				method: 'POST',
				body,
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			});

			const oauthData: any = await tokenResponseData.body.json();
			const userResult = await request('https://discord.com/api/users/@me', {
                headers: {
                    authorization: `${oauthData.token_type} ${oauthData.access_token}`,
                },
            });

            const user: any = await userResult.body.json();
			if(!user.id) {
				res.end('error');
			}
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string);

			try {
				const dbUser = await createUser(user.id, user.email)
			} catch(error) {
				console.error('user already exists!')
			}

			return res.end(token);
		} catch (error) {
			console.error(error);
			return res.end('error');
		}
	}
	res.end('error');
})

app.post('/sync', jsonParser, (req, res) => {
	const token = req.headers.authorization;

	verifyToken(token, async (err: any, decoded: any) => {
		if(err) {
			return res.end('Invalid token!');
		} else {
			const id = decoded.id;
			const friends = req.body.friends;

			console.log(friends)
			const user = await updateFriends(id, friends)
			return res.end(`Success! ${user.email}`);
		}
	})
})

app.listen(3210); // idk if this is even necessary

module.exports = app