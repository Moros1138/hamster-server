import express from 'express';
import { v4 as uuid4 } from 'uuid';
import { Filter } from 'bad-words';

const filter = new Filter();

export default function defineApi(app, races)
{
    if(app === undefined)
    {
        throw new Error("express app is required!");
    }

    if(races === undefined)
    {
        throw new Error("races database is required!")
    }
    
    
    app.get("/session", (request, response) =>
    {
        if(request.session.userId)
        {
            response
                .set("Content-Type", "application/json")
                .status(200)
                .send({
                    result: "ok",
                    message: "session exists"
                })        
    
            return;
        }
        
        response
            .set("Content-Type", "application/json")
            .status(404)
            .send({
                result: "fail",
                message: "session not found"
            });
    });

    app.post("/session", (request, response) =>
    {
        if(request.session.userId)
        {
            response
                .set("Content-Type", "application/json")
                .status(200)
                .send({
                    result: "ok",
                    message: "session exists"
                })        
    
            return;
        }
        
        request.session.userId = uuid4();
        request.session.userName = `Guest_${Math.random().toString(36).substring(7)}`;

        response
            .set("Content-Type", "application/json")
            .status(200)
            .send({
                result: 'ok',
                message: 'session created'
            });
    });
        
    app.delete('/session', (request, response) =>
    {
        console.log('Destroying session');
        request.session.destroy(() =>
        {
            response
                .set("Content-Type", "application/json")
                .status(200)
                .send({
                    result: 'ok',
                    message: 'session destroyed'
                });
        });
    });
    app.post('/race', (request, response) =>
    {
        if(!request.session.userId)
        {
            response
                .set("Content-Type", "application/json")
                .status(401)
                .send({
                    result: 'fail',
                    message: 'unauthorized'
                });
    
            return;
        }
        
        request.session.raceId = uuid4();
        request.session.raceStartTime = new Date().getUTCMilliseconds();
        request.session.raceEndTime = 0;

        response
            .set("Content-Type", "application/json")
            .status(200)
            .send({
                result: "ok",
                message: "race started",
                raceId: request.session.raceId,
            });
    });

    app.patch("/race", (request, response) =>
    {
        if(!request.session.userId)
        {
            response.status(401)
                .set("Content-Type", "application/json")
                .send({
                    result: 'fail',
                    message: 'unauthorized'
                });
    
            return;
        }
        
        const requiredParams = [
            "raceId", "raceTime", "raceMap", "raceColor",
        ];
        
        let missing = [];

        requiredParams.forEach((required) =>
        {
            if(!request.body[required])
            {
                missing.push(required);
            }
        });

        if(missing.length > 0)
        {
            response.status(400)
                .set("Content-Type", "application/json")
                .send({
                    result: "fail",
                    message: `required parameter (${missing.join()}) missing`,
                });
            
            return;
        }
    
        // race time reported by the client
        const clientTime = parseInt(request.body.raceTime);
        
        // end time
        request.session.raceEndTime = new Date().getUTCMilliseconds();
        
        // race time calculated by the server 
        const serverTime = request.session.raceEndTime - request.session.raceStartTime;
        
        // difference between client and server race time reporting
        const difference = Math.abs(serverTime - clientTime);
        
        // if the absolute difference is greater than 1s, fail
        if(difference > 1000)
        {
            response.status(400)
                .set("Content-Type", "application/json")
                .send({
                    result: "fail",
                    message: "raceTime mismatch",
                });
            
            return;
        }

        // TODO: update race table
        console.log("ACTUALLY FINISHED A RACE!");

        response.status(200)
            .set("Content-Type", "application/json")
            .send({
                result: "ok",
                message: "race updated"
            });
    });
}



