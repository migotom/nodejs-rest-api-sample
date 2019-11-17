import request from "supertest";
import axios from "axios";
import app from "../src/app";
import { UserInterface } from "../src/models/User";
import { Geolocation } from "../src/models/Geolocation";

import * as passportConfig from "../src/config/passport";

let token: string;
jest.setTimeout(30000);
jest.mock("axios");

beforeAll(async () => {
    const user: UserInterface = { email: "test@test.com", password: "test" };
    token = passportConfig.jwtToken(user);
    await Geolocation.deleteMany({});
});

describe("POST /api/geo", () => {
    it("should return 200 OK", async (done: any) => {
        const resp = { data: { ip: "2.1.1.1" } };
        (<jest.Mock>axios.get).mockResolvedValue(resp);

        return request(app)
            .post("/api/geo")
            .set("Authorization", `Bearer ${token}`)
            .send({ host: "2.1.1.1" })
            .expect((res: any) => {
                expect(res.status).toBe(200);
                expect(res.body).toMatchObject({ status: "pending" });
                done();
            });
    });
});

describe("GET /api/geo/2.1.1.1", () => {
    it("should return 200 OK", async (done: any) => {
        return request(app)
            .get("/api/geo/2.1.1.1")
            .set("Authorization", `Bearer ${token}`)
            .expect((res: any) => {
                expect(res.status).toBe(200);
                expect(res.body).toMatchObject({ status: "ok" });
                done();
            });
    });
});

describe("PATCH /api/geo/2.1.1.1", () => {
    it("should return 200 OK", async (done: any) => {
        const resp = { data: { city: "warsaw" } };
        (<jest.Mock>axios.get).mockResolvedValue(resp);

        return request(app)
            .patch("/api/geo/2.1.1.1")
            .set("Authorization", `Bearer ${token}`)
            .expect((res: any) => {
                expect(res.status).toBe(200);
                expect(res.body).toMatchObject({ status: "ok" });
                done();
            });
    });
});

describe("GET /api/geo/2.1.1.1 (updated)", () => {
    it("should return 200 OK", async (done: any) => {
        return request(app)
            .get("/api/geo/2.1.1.1")
            .set("Authorization", `Bearer ${token}`)
            .expect((res: any) => {
                expect(res.status).toBe(200);
                expect(res.body).toMatchObject({ city: "warsaw" });
                done();
            });
    });
});

describe("DELETE /api/geo/2.1.1.1", () => {
    it("should return 200 OK", async (done: any) => {
        return request(app)
            .delete("/api/geo/2.1.1.1")
            .set("Authorization", `Bearer ${token}`)
            .expect((res: any) => {
                expect(res.status).toBe(200);
                expect(res.body).toMatchObject({ status: "ok" });
                done();
            });
    });
});

describe("GET /api/geo/2.1.1.1 (deleted)", () => {
    it("should return 200 OK", async (done: any) => {
        return request(app)
            .get("/api/geo/2.1.1.1")
            .set("Authorization", `Bearer ${token}`)
            .expect((res: any) => {
                expect(res.status).toBe(400);
                expect(res.body).toMatchObject({
                    error: "geolocation data not found"
                });
                done();
            });
    });
});

describe("GET /api/geo", () => {
    it("should return 200 OK", (done: any) => {
        return request(app)
            .get("/api/geo")
            .set("Authorization", `Bearer ${token}`)
            .expect(200, done);
    });
});
