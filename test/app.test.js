import 'dotenv/config';

import defineApi from "../app.js";
import express from "express";
import session from 'express-session';
import request from "supertest";
import Database from 'better-sqlite3';

const sessionName     = process.env.SESSION_NAME   || "test_sessionid";
const sessionSecret   = process.env.SESSION_SECRET || "$eCuRiTy";

const races = new Database(":memory:", { verbose: console.log });

races.exec(`CREATE TABLE IF NOT EXISTS 'races' (
    'id' INTEGER PRIMARY KEY AUTOINCREMENT,
    'color' TEXT,
    'name' TEXT,
    'map' TEXT,
    'time' INTEGER
)`);

const app = express();

app.use(express.json());

app.use(session({
    name: sessionName,
    saveUninitialized: false,
    secret: sessionSecret,
    resave: false,
}));

defineApi(app, races);

let sessionCookie = null;

describe("ENDPOINT /session", () =>
{
    describe("GET /session - cookie not set", () =>
    {
        it("should respond with code 404", (done) =>
        {
            const test = request(app).get("/session");
            
            test.expect(404)
                .end((err, res) =>
                {
                    done(err);
                });
        });

        it("should respond with json", (done) =>
        {
            const test = request(app).get("/session");
            
            test.expect("Content-Type", /json/)
                .end((err, res) =>
                {
                    done(err);
                });
        });
    
        it("should respond with `session not found` in body", (done) =>
        {
            const test = request(app).get("/session");
            
            test.expect(/session not found/)
                .end((err, res) =>
                {
                    done(err);
                });
        });
    });
    
    describe("POST /session", () =>
    {
        it("should respond with code 200", (done) =>
        {
            const test = request(app).post("/session");

            test.expect(200)
                .end((err, res) =>
                {
                    done(err);
                });
        });
        
        it("should respond with json", (done) =>
        {
            const test = request(app).post("/session");

            test.expect('Content-Type', /json/)
                .end((err, res) =>
                {
                    done(err);
                });
        });
        
        it("should set cookie", (done) =>
        {
            const test = request(app).post("/session");

            test.expect("set-cookie", /sessionid/)
                .end((err, res) =>
                {
                    sessionCookie = res.headers['set-cookie'].pop().split(';')[0];
                    done(err);
                });
        });
    });
    
    describe("GET /session - with cookie set", () =>
    {
        it("should respond with code 200", (done) =>
        {
            const test = request(app).get("/session");
            
            test.cookies = sessionCookie;
            
            test.expect(200)
                .end((err, res) =>
                {
                    done(err);
                });
        });

        it("should respond with json", (done) =>
        {
            const test = request(app).get("/session");
            
            test.cookies = sessionCookie;

            test.expect("Content-Type", /json/)
                .end((err, res) =>
                {
                    done(err);
                });
        });
    
        it("should respond with `session exists` in body", (done) =>
        {
            const test = request(app).get("/session");
            
            test.cookies = sessionCookie;

            test.expect(/session exists/)
                .end((err, res) =>
                {
                    done(err);
                });
        });
    });
});
