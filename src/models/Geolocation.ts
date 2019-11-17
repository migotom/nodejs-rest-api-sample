import mongoose from "mongoose";

export type GeolocationDocument = mongoose.Document & {
    host: string;
    ip: string;
    status: string;
    type: string;
    continent_name: string;
    country_name: string;
    region_name: string;
    city: string;
    zip: string;
    latitude: number;
    longitude: number;
    error: Record<string, any>;
};

const geolocationSchema = new mongoose.Schema(
    {
        host: { type: String, unique: true },
        ip: String,
        status: String,
        type: String,
        // eslint-disable-next-line @typescript-eslint/camelcase
        continent_name: String,
        // eslint-disable-next-line @typescript-eslint/camelcase
        country_name: String,
        // eslint-disable-next-line @typescript-eslint/camelcase
        region_name: String,
        city: String,
        zip: String,
        latitude: Number,
        longitude: Number,
        error: Object
    },
    { timestamps: true }
);

export const Geolocation = mongoose.model<GeolocationDocument>(
    "Geolocation",
    geolocationSchema
);
