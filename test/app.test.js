import 'dotenv/config';

import defineApi from "../app.js";
import express from "express";
import session from 'express-session';
import request from "supertest";

const sessionName     = process.env.SESSION_NAME   || "test_sessionid";
const sessionSecret   = process.env.SESSION_SECRET || "$eCuRiTy";

const app = express();

app.use(express.json());

app.use(session({
    name: sessionName,
    saveUninitialized: false,
    secret: sessionSecret,
    resave: false,
}));

defineApi(app);

let sessionCookie = null;

