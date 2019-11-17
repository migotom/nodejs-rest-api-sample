import bcrypt from "bcrypt-nodejs";
import mongoose from "mongoose";

export interface UserInterface {
    email: string;
    password: string;
}

export type UserDocument = mongoose.Document & {
    email: string;
    password: string;

    comparePassword: comparePasswordFunction;
};

type comparePasswordFunction = (
    candidatePassword: string,
    cb: (err: any, isMatch: any) => {}
) => void;

const userSchema = new mongoose.Schema(
    {
        email: { type: String, unique: true },
        password: String
    },
    { timestamps: true }
);

const comparePassword: comparePasswordFunction = function(
    candidatePassword,
    cb
) {
    bcrypt.compare(
        candidatePassword,
        this.password,
        (err: mongoose.Error, isMatch: boolean) => {
            cb(err, isMatch);
        }
    );
};

userSchema.methods.comparePassword = comparePassword;

export const User = mongoose.model<UserDocument>("User", userSchema);
