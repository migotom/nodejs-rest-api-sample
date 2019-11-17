import jwt from "jsonwebtoken";
import passport from "passport";
import passportLocal from "passport-local";
import passportJWT from "passport-jwt";

import { User, UserDocument, UserInterface } from "../models/User";
import { Request, Response, NextFunction } from "express";

const LocalStrategy = passportLocal.Strategy;
const JWTStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;

passport.serializeUser<UserDocument, any>((user, done) => {
    done(undefined, user._id);
});

passport.use(
    new LocalStrategy(
        { usernameField: "email", passwordField: "password" },
        async (email, password, done) => {
            try {
                const user = await User.findOne({
                    email: email.toLowerCase(),
                    password
                });
                if (!user) {
                    return done(undefined, false, {
                        message: "incorrect email or password."
                    });
                }
                return done(undefined, user);
            } catch (err) {
                return done(err);
            }
        }
    )
);

passport.use(
    new JWTStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: "secret"
        },
        (payload, done) => {
            User.findOne({ email: payload.email })
                .then(user => {
                    return done(null, user);
                })
                .catch(err => {
                    return done(err, false);
                });
        }
    )
);

export const jwtToken = (user: UserInterface): string => {
    return jwt.sign(JSON.stringify({ email: user.email }), "secret");
};

export const isAuthenticated = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    passport.authenticate("jwt", { session: false })(req, res, next);
};
