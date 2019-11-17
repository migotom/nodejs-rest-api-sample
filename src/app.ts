import express from "express";
import compression from "compression"; // compresses requests
import session from "express-session";
import bodyParser from "body-parser";
import mongo from "connect-mongo";
import mongoose from "mongoose";
import passport from "passport";
import bluebird from "bluebird";
import { MONGODB_URI } from "./util/secrets";

const MongoStore = mongo(session);

// Controllers (route handlers)
import * as userController from "./controllers/user";
import * as geolocationController from "./controllers/geolocation";

// API keys and Passport configuration
import * as passportConfig from "./config/passport";

// Create Express server
const app = express();

// Connect to MongoDB
const mongoUrl = MONGODB_URI;
mongoose.Promise = bluebird;

mongoose
    .connect(mongoUrl, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
    })
    .then(() => {
        /** ready to use. The `mongoose.connect()` promise resolves to undefined. */
    })
    .catch(err => {
        console.log(
            "MongoDB connection error. Please make sure MongoDB is running. " +
                err
        );
        // process.exit();
    });

// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(express.json());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());

app.post("/api/auth", userController.postAuthenticate);

app.get(
    "/api/geo/:host",
    passportConfig.isAuthenticated,
    geolocationController.getGeolocation
);
app.post(
    "/api/geo",
    passportConfig.isAuthenticated,
    geolocationController.postGeolocation
);
app.patch(
    "/api/geo/:host",
    passportConfig.isAuthenticated,
    geolocationController.patchGeolocation
);
app.delete(
    "/api/geo/:host",
    passportConfig.isAuthenticated,
    geolocationController.deleteGeolocation
);
app.get(
    "/api/geo",
    passportConfig.isAuthenticated,
    geolocationController.listGeolocation
);

export default app;
