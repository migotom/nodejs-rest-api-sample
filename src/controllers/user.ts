import passport from "passport";
import { UserDocument } from "../models/User";
import { Request, Response, NextFunction } from "express";
import { IVerifyOptions } from "passport-local";
import { check, sanitize, validationResult } from "express-validator";
import * as passportConfig from "../config/passport";

export const postAuthenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        await check("email", "Email is not valid")
            .isEmail()
            .run(req);
        await check("password", "Password cannot be blank")
            .isLength({ min: 1 })
            .run(req);
        await sanitize("email")
            // eslint-disable-next-line @typescript-eslint/camelcase
            .normalizeEmail({ gmail_remove_dots: false })
            .run(req);

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            errors.throw();
        }

        passport.authenticate(
            "local",
            (err: Error, user: UserDocument, info: IVerifyOptions) => {
                if (err || !user) {
                    return res
                        .status(401)
                        .send({ error: "couldn't authenticate" });
                }

                req.logIn(user, err => {
                    if (err) {
                        return next(err);
                    }
                    const token = passportConfig.jwtToken(user);
                    return res.json({ token });
                });
            }
        )(req, res, next);
    } catch (err) {
        return res.status(401).send(err);
    }
};
