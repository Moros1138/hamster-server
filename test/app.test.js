import 'dotenv/config';

import defineApi from "../app.js";
import express from "express";
import session from 'express-session';
import request from "supertest";

import Database from 'better-sqlite3';

const sessionName     = "test_sessionid";
const sessionSecret   = "totally-a-secret";

const races = new Database(":memory:");

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

function isSortedAscending(arr) {
    const sortedArray = [...arr].sort((a, b) => a - b);
    return arr.every((value, index) => value === sortedArray[index]);
}

function isSortedDescending(arr) {
    const sortedArray = [...arr].sort((a, b) => b - a);
    return arr.every((value, index) => value === sortedArray[index]);
}

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
    describe("POST /name", () =>
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
});

describe("ENDPOINT /name - with cookie set", () =>
{
    describe("POST /name", () =>
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
    });
}); // ENDPOINT /name - with cookie set

describe("GET /race", () =>
{
    before(function()
    {
        const racesToInsert = [];
        const colors = ["white", "black", "blue", "green", "red", "yellow", "orange"];

        for(let i = 0; i < 50; i++)
        {
            racesToInsert.push({
                color: colors[Math.floor(Math.random() * colors.length)],
                name: `Entry${i+1}`,
                map: "map1",
                time: (i + 1)
            });
        }
        
        racesToInsert.sort(() => Math.random() - 0.5);

        let stmt = races.prepare("INSERT INTO `races` (`color`, `name`, `map`, `time`) VALUES (@color, @name, @map, @time);");
        
        racesToInsert.forEach((race) =>
        {
            stmt.run(race);
        });
    });

    after(function()
    {
        races.exec("DELETE FROM races");
    });

    it("should respond with json", (done) =>
    {
        const test = request(app).post("/race");
        
        test.expect("Content-Type", /json/)
            .end((err, res) =>
            {
                done(err);
            });
    });

    it("should respond with 10 results on a default call", (done) =>
    {
        const test = request(app).get("/race?map=map1");
        
        test.expect(200)
            .end((err, res) =>
            {
                if(err)
                {
                    done(err);
                    return;
                }

                if(res.body.results.length != 10)
                {
                    done(new Error(`expected 10 results but got ${res.body.results.length}`));
                    return;
                }
                
                done();
            })
    });

    it("should respond with 0 results when a map does not exist", (done) =>
    {
        const test = request(app).get("/race?map=map-not-exist");
        
        test.expect(200)
            .end((err, res) =>
            {
                if(err)
                {
                    done(err);
                    return;
                }

                if(res.body.results.length != 0)
                {
                    done(new Error(`expected 0 results but got ${res.body.results.length}`));
                    return;
                }
                
                done();
                // console.log(res.body.params);
                // let out = [];
                // res.body.results.forEach((result) => out.push(result.time));
                // console.log(out);
                // done(err);
            })
    });
    
    it("should respond with 10 results sorted by `time` in ascending order", (done) =>
    {
        const test = request(app).get("/race?map=map1&sortBy=time&sort=ASC");
        
        test.expect(200)
            .end((err, res) =>
            {
                if(err)
                {
                    done(err);
                    return;
                }

                if(res.body.results.length != 10)
                {
                    done(new Error(`expected 10 results but got ${res.body.results.length}`));
                    return;
                }
                
                let out = [];
                res.body.results.forEach((result) => out.push(result.time));
                
                if(!isSortedAscending(out))
                {
                    done(new Error(`expected 10 results ordered by time, in ascending order but got ${out.toString()}`));
                    return;
                }

                done();
            })
    });
    
    it("should respond with 10 results sorted by `time` in descending order", (done) =>
    {
        const test = request(app).get("/race?map=map1&sortBy=time&sort=DESC");
        
        test.expect(200)
            .end((err, res) =>
            {
                if(err)
                {
                    done(err);
                    return;
                }

                if(res.body.results.length != 10)
                {
                    done(new Error(`expected 10 results but got ${res.body.results.length}`));
                    return;
                }
                
                let out = [];
                res.body.results.forEach((result) => out.push(result.time));
                
                if(!isSortedDescending(out))
                {
                    done(new Error(`expected 10 results ordered by time, in descending order but got ${out.toString()}`));
                    return;
                }

                done();
            })
    });
    
    it("should respond with 5 results when limit is set to 5", (done) =>
    {
        const test = request(app).get("/race?map=map1&limit=5");
        
        test.expect(200)
            .end((err, res) =>
            {
                if(err)
                {
                    done(err);
                    return;
                }

                if(res.body.results.length != 5)
                {
                    done(new Error(`expected 10 results but got ${res.body.results.length}`));
                    return;
                }
                
                done();
            })
    });

    it("should respond with 1 result offset by 0", (done) =>
    {
        request(app).get("/race?map=map1&limit=10&offset=0").end((err, res) =>
        {
            const baselineResults = res.body.results;

            const test = request(app).get("/race?map=map1&limit=1&offset=0");
        
            test.expect(200)
                .end((err, res) =>
                {
                    if(err)
                    {
                        done(err);
                        return;
                    }
    
                    if(res.body.results.length != 1)
                    {
                        done(new Error(`expected 1 result but got ${res.body.results.length}`));
                        return;
                    }

                    if(res.body.results[0].id != baselineResults[0].id)
                    {
                        done(new Error(`expected ${res.body.results[0].id} and ${baselineResults[4].id} to match.`));
                        return;
                    }

                    done();
                })
        });

    });
    
    it("should respond with 1 result offset by 5", (done) =>
    {
        request(app).get("/race?map=map1&limit=10&offset=0").end((err, res) =>
        {
            const baselineResults = res.body.results;

            const test = request(app).get("/race?map=map1&limit=1&offset=5");
        
            test.expect(200)
                .end((err, res) =>
                {
                    if(err)
                    {
                        done(err);
                        return;
                    }
    
                    if(res.body.results.length != 1)
                    {
                        done(new Error(`expected 1 result but got ${res.body.results.length}`));
                        return;
                    }

                    if(res.body.results[0].id != baselineResults[5].id)
                    {
                        done(new Error(`expected ${res.body.results[0].id} and ${baselineResults[5].id} to match.`));
                        return;
                    }

                    done();
                })
        });
    });
}); // GET /race
