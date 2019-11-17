"use strict";

import { param, body, validationResult } from "express-validator";
import { Response, Request } from "express";
import { Geolocation } from "../models/Geolocation";
import * as geolocator from "../worker/geolocator";

export const listGeolocation = async (req: Request, res: Response) => {
    try {
        const geolocations = await Geolocation.find({});
        if (!geolocations) {
            throw { error: "geolocations data not found" };
        }
        return res.send(geolocations);
    } catch (err) {
        return res.status(400).send(err);
    }
};

export const getGeolocation = async (req: Request, res: Response) => {
    try {
        await param("host", "host address must be provided")
            .not()
            .isEmpty()
            .run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errors.throw();
        }

        const geolocation = await Geolocation.findOne({
            host: req.params.host
        });
        if (!geolocation) {
            throw { error: "geolocation data not found" };
        }
        return res.send(geolocation);
    } catch (err) {
        return res.status(400).send(err);
    }
};

export const postGeolocation = async (req: Request, res: Response) => {
    try {
        await body("host", "host address must be provided")
            .not()
            .isEmpty()
            .run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errors.throw();
        }

        const existingGeolocation = await Geolocation.findOne({
            host: req.body.host
        });
        if (existingGeolocation) {
            throw {
                error: "geolocation data for given IP address already exist"
            };
        }

        const geoloation = new Geolocation({
            host: req.body.host,
            status: "pending"
        });

        await geoloation.save();

        setImmediate(() => geolocator.obtainGeolocation(req.body.host));
        return res.send(geoloation);
    } catch (err) {
        return res.status(400).send(err);
    }
};

export const patchGeolocation = async (req: Request, res: Response) => {
    try {
        await param("host", "host address must be provided")
            .not()
            .isEmpty()
            .run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errors.throw();
        }

        const existingGeolocation = await Geolocation.findOne({
            host: req.params.host
        });
        if (!existingGeolocation) {
            throw {
                error: "geolocation data for given IP address does not exist"
            };
        }

        setImmediate(() => geolocator.obtainGeolocation(req.params.host));

        return res.send({ status: "ok" });
    } catch (err) {
        return res.status(400).send(err);
    }
};

export const deleteGeolocation = async (req: Request, res: Response) => {
    try {
        await param("host", "host address must be provided")
            .not()
            .isEmpty()
            .run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errors.throw();
        }

        const existingGeolocation = await Geolocation.findOneAndRemove({
            host: req.params.host
        });
        if (!existingGeolocation) {
            throw {
                error: "geolocation data for given IP address does not exist"
            };
        }
        return res.send({ status: "ok" });
    } catch (err) {
        return res.status(400).send(err);
    }
};
