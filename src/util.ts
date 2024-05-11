import jwt from 'jsonwebtoken'
import config from '../config.json'

export const verifyToken = (token: any, callback: any) => {
    jwt.verify(token, config.jwtSecret, (err: any, decoded: any) => {
        if (err) {
            return callback(err, null);
        } else {
            return callback(null, decoded);
        }
    });
};