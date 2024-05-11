import jwt from 'jsonwebtoken'

export const verifyToken = (token: any, callback: any) => {
    jwt.verify(token, process.env.JWT_SECRET as string, (err: any, decoded: any) => {
        if (err) {
            return callback(err, null);
        } else {
            return callback(null, decoded);
        }
    });
};