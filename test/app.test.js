import 'dotenv/config';

import defineApi from "../app.js";
import express from "express";
import session from 'express-session';
import request from "supertest";
import Database from 'better-sqlite3';

const sessionName     = process.env.SESSION_NAME   || "test_sessionid";
const sessionSecret   = process.env.SESSION_SECRET || "$eCuRiTy";

// const races = new Database(":memory:", { verbose: console.log });
const races = new Database("tests.db", { verbose: console.log });

races.exec(`CREATE TABLE IF NOT EXISTS 'races' (
    'id' INTEGER PRIMARY KEY AUTOINCREMENT,
    'color' TEXT,
    'name' TEXT,
    'map' TEXT,
    'time' INTEGER,
    'created_at' TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
let raceId        = null;

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
    }); // GET /session
    
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
    }); // POST /session
    
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
    }); // GET /session - with cookie set

}); // ENDPOINT /session

describe("ENDPOINT /race - cookie not set", () =>
{
    describe("POST /race", () =>
    {
        it("should respond with json", (done) =>
        {
            const test = request(app).post("/race");
            
            test.expect("Content-Type", /json/)
                .end((err, res) =>
                {
                    done(err);
                });
        });
    
        it("should respond with code 401", (done) =>
        {
            const test = request(app).post("/race");
            
            test.expect(401)
                .end((err, res) =>
                {
                    done(err);
                });
        });

        it("should respond with `unauthorized` in body", (done) =>
        {
            const test = request(app).post("/race");
            
            test.expect(/unauthorized/)
                .end((err, res) =>
                {
                    done(err);
                });
        });
    }); // POST /race
    

    describe("PATCH /race", () =>
    {
        it("should respond with json", (done) =>
        {
            const test = request(app).patch("/race");
            
            test.expect("Content-Type", /json/)
                .end((err, res) =>
                {
                    done(err);
                });
        });
    
        it("should respond with code 401", (done) =>
        {
            const test = request(app).patch("/race");
            
            test.expect(401)
                .end((err, res) =>
                {
                    done(err);
                });
        });

        it("should respond with `unauthorized` in body", (done) =>
        {
            const test = request(app).patch("/race");
            
            test.expect(/unauthorized/)
                .end((err, res) =>
                {
                    done(err);
                });
        });
    }); // PATCH /race
    
    describe("DELETE /race", () =>
    {
        it("should respond with json", (done) =>
        {
            const test = request(app).delete("/race");
            
            test.expect("Content-Type", /json/)
                .end((err, res) =>
                {
                    done(err);
                });
        });

        it("should respond with code 401", (done) =>
        {
            const test = request(app).delete("/race");
            
            test.expect(401)
                .end((err, res) =>
                {
                    done(err);
                });
        });
    
        it("should respond with `unauthorized` in body", (done) =>
        {
            const test = request(app).delete("/race");
            
            test.expect(/unauthorized/)
                .end((err, res) =>
                {
                    done(err);
                });
        });
    }); // DELETE /race

}); // ENDPOINT /race - cookie not set

describe("ENDPOINT /race - with cookie set", () =>
{
    describe("POST /race", () =>
    {
        it("should respond with json", (done) =>
        {
            const test = request(app).post("/race");
            
            test.cookies = sessionCookie;

            test.expect("Content-Type", /json/)
                .end((err, res) =>
                {
                    done(err);
                });
        });
    
        it("should respond with code 200", (done) =>
        {
            const test = request(app).post("/race");
            
            test.cookies = sessionCookie;
            
            test.expect(200)
                .end((err, res) =>
                {
                    done(err);
                });
        });

        it("should respond with `race started` in body", (done) =>
        {
            const test = request(app).post("/race");
            
            test.cookies = sessionCookie;

            test.expect(/race started/)
                .end((err, res) =>
                {
                    raceId = res.body.raceId;
                    done(err);
                });
        });
    }); // POST /race

    describe("PATCH /race - missing parameters", () =>
    {
        it("should respond with json", (done) =>
        {
            const test = request(app).patch("/race");
            
            test.cookies = sessionCookie;

            test.expect("Content-Type", /json/)
                .end((err, res) =>
                {
                    done(err);
                });
        });
    
        it("should respond with code 400", (done) =>
        {
            const test = request(app).patch("/race");
            
            test.cookies = sessionCookie;

            test.expect(400)
                .end((err, res) =>
                {
                    done(err);
                });
        });
        
        it("should respond with `required parameter (.*) missing`", (done) =>
        {
            const test = request(app).patch("/race");
            
            test.cookies = sessionCookie;
            
            test.expect(/required parameter (.*) missing/)
                .end((err, res) =>
                {
                    done(err);
                });
        });

    }); // PATCH /race - missing parameters


    describe("PATCH /race - with parameters", () =>
    {
        it("should respond with json", (done) =>
        {
            const test = request(app).patch("/race");
            
            test.cookies = sessionCookie;

            test.expect("Content-Type", /json/)
                .end((err, res) =>
                {
                    done(err);
                });
        });
    

        it("should respond with code 200 - finish race", (done) =>
        {
            const getRaceTime = request(app).post("/race");
            getRaceTime.cookies = sessionCookie;
            getRaceTime.end((err, req) =>
            {
                raceId = req.body.raceId;

                const test = request(app).patch("/race");
            
                test.cookies = sessionCookie;
                
                test.send({ raceId: raceId, raceTime: 50, raceMap: "the-map", raceColor: "white" })
                    .expect(200)
                    .end((err, res) =>
                    {
                        done(err);
                    });
            });
        });
        
        it("should accept times 1000ms difference - finish race", (done) =>
        {
            const getRaceTime = request(app).post("/race");
            getRaceTime.cookies = sessionCookie;
            getRaceTime.end((err, req) =>
            {
                raceId = req.body.raceId;

                const test = request(app).patch("/race");
            
                test.cookies = sessionCookie;
                
                test.send({ raceId: raceId, raceTime: 1000, raceMap: "the-map", raceColor: "white" })
                    .expect(200)
                    .end((err, res) =>
                    {
                        done(err);
                    });
            });
            
        });
    
        it("should reject times 2000ms difference", (done) =>
        {
            const getRaceTime = request(app).post("/race");
            
            getRaceTime.cookies = sessionCookie;
            
            getRaceTime.end((err, req) =>
            {
                raceId = req.body.raceId;
                
                const test = request(app).patch("/race");
            
                test.cookies = sessionCookie;
                
                test.send({ raceId: raceId, raceTime: 2000, raceMap: "the-map", raceColor: "white" })
                    .expect(400)
                    .expect(/raceTime mismatch/)
                    .end((err, res) =>
                    {
                        done(err);
                    });
            });
        });
    
    }); // PATCH /race - with parameters

    describe("DELETE /race - missing parameters", () =>
    {
        it("should respond with json", (done) =>
        {
            const test = request(app).delete("/race");
            
            test.cookies = sessionCookie;

            test.expect("Content-Type", /json/)
                .end((err, res) =>
                {
                    done(err);
                });
        });

        it("should respond with `required parameter (.*) missing`", (done) =>
        {
            const test = request(app).delete("/race");
            
            test.cookies = sessionCookie;
            
            test.expect(/required parameter (.*) missing/)
                .end((err, res) =>
                {
                    done(err);
                });
        });

    }); // DELETE /race - missing parameters

    describe("DELETE /race - with parameters", () =>
    {
        it("should respond with json", (done) =>
        {
            const test = request(app).delete("/race");
            
            test.cookies = sessionCookie;

            test.expect("Content-Type", /json/)
                .end((err, res) =>
                {
                    done(err);
                });
        });

        it("should respond with code 404 when raceId mismatch", (done) =>
        {
            const test = request(app).delete("/race");
            
            test.cookies = sessionCookie;
            
            test.send({ raceId: "totally-does-not-exist" })
                .expect(404)
                .end((err, res) =>
                {
                    done(err);
                });
        });
        
        it("should respond with code 200", (done) =>
        {
            const getRaceTime = request(app).post("/race");
            getRaceTime.cookies = sessionCookie;
            getRaceTime.end((err, req) =>
            {
                raceId = req.body.raceId;

                const test = request(app).delete("/race");
            
                test.cookies = sessionCookie;
            
                test.send({ raceId: raceId })
                    .expect(200)
                    .end((err, res) =>
                    {
                        done(err);
                    });
            });
        });
    }); // DELETE /race - with parameters


}); // ENDPOINT /race - with cookie set

describe("ENDPOINT /name - cookie not set", () =>
{
    it("should respond with json", (done) =>
    {
        const test = request(app).post("/name");
        
        test.expect("Content-Type", /json/)
            .end((err, res) =>
            {
                done(err);
            });
    });

    it("should respond with code 401", (done) =>
    {
        const test = request(app).post("/name");
        
        test.expect(401)
            .end((err, res) =>
            {
                done(err);
            });
    });

    it("should respond with `unauthorized` in body", (done) =>
    {
        const test = request(app).post("/name");
        
        test.expect(/unauthorized/)
            .end((err, res) =>
            {
                done(err);
            });
    });
});

describe("ENDPOINT /name - with cookie set", () =>
{
    it("should respond with json", (done) =>
    {
        const test = request(app).post("/name");
        
        test.cookies = sessionCookie;

        test.expect("Content-Type", /json/)
            .end((err, res) =>
            {
                done(err);
            });
    });

    it("should respond with `required parameter (.*) missing`", (done) =>
    {
        const test = request(app).post("/name");
        
        test.cookies = sessionCookie;
        
        test.expect(/required parameter (.*) missing/)
            .end((err, res) =>
            {
                done(err);
            });
    });

    it("should set name to `Javidx9`", (done) =>
    {
        const test = request(app).post("/name");
        
        test.cookies = sessionCookie;
        
        test.send({ userName: "Javidx9" })
            .expect(200)
            .expect(/name is set/)
            .end((err, res) =>
            {
                done(err);
            });
    });
    
    it("should reject bad words for name", (done) =>
    {
        const test = request(app).post("/name");
        
        test.cookies = sessionCookie;
        
        test.send({ userName: "DirtySlut69" })
            .expect(406)
            .end((err, res) =>
            {
                done(err);
            });
    });
}); // ENDPOINT /name - with cookie set
