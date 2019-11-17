import axios, { AxiosError } from "axios";

import { Geolocation } from "../models/Geolocation";
import { IPSTACK_ACCESS_KEY } from "../util/secrets";

const fetchGeolocationIPstack = async (host: string): Promise<any> => {
    try {
        const response = await axios.get(
            `/${host}?access_key=${IPSTACK_ACCESS_KEY}`,
            {
                baseURL: "http://api.ipstack.com/",
                responseType: "json",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
        if (response.data.error) {
            throw response.data.error;
        }
        return response.data;
    } catch (err) {
        if (err && err.response) {
            const axiosError = err as AxiosError<any>;
            throw { error: axiosError.response.data };
        }
        throw { error: err };
    }
};

export const obtainGeolocation = async (host: string) => {
    try {
        const response = await fetchGeolocationIPstack(host);
        await Geolocation.updateOne(
            { host },
            {
                ip: response.ip,
                status: "ok",
                type: response.type,
                // eslint-disable-next-line @typescript-eslint/camelcase
                continent_name: response.continent_name,
                // eslint-disable-next-line @typescript-eslint/camelcase
                country_name: response.country_name,
                // eslint-disable-next-line @typescript-eslint/camelcase
                region_name: response.region_name,
                city: response.city,
                zip: response.zip,
                latitude: response.latitude,
                longitude: response.longitude
            }
        );
    } catch (err) {
        try {
            await Geolocation.updateOne(
                { host },
                { ...{ status: "error" }, ...err }
            );
        } catch (err) {
            console.log(err);
        }
    }
};
