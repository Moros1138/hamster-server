import express from 'express';
import { v4 as uuid4 } from 'uuid';

import {
	RegExpMatcher,
	TextCensor,
	englishDataset,
	englishRecommendedTransformers,
} from 'obscenity';

const matcher = new RegExpMatcher({
	...englishDataset.build(),
	...englishRecommendedTransformers,
});

function ExtractMissingParameters(requiredParams, request)
{
    let missing = [];

    requiredParams.forEach((required) =>
    {
        if(!request.body[required])
        {
            missing.push(required);
        }
    });

    return missing;
}

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
        
    app.post('/name', (request, response) =>
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

        let missingParameters = ExtractMissingParameters([
            "userName"
        ], request);

        if(missingParameters.length > 0)
        {
            response
                .set("Content-Type", "application/json")
                .status(400)
                .send({
                    result: 'fail',
                    message: `required parameter (${missingParameters.join()}) missing`,
                });
            return;
        }
    
        if(matcher.hasMatch(request.body.userName))
        {
            response
                .set("Content-Type", "application/json")
                .status(406)
                .send({
                    result: 'fail',
                    message: 'the provided name contains profanity',
                });
            
            return;
        }
        
        request.session.userName = request.body.userName;
        
        response
            .set("Content-Type", "application/json")
            .status(200)
            .send({
                result: 'ok',
                message: 'name is set',
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
        
        let missingParameters = ExtractMissingParameters([
            "raceId",
            "raceTime",
            "raceMap",
            "raceColor",
        ], request);

        if(missingParameters.length > 0)
        {
            response.status(400)
                    .set("Content-Type", "application/json")
                    .send({
                        result: "fail",
                        message: `required parameter (${missingParameters.join()}) missing`,
                    });

            return;
        }
        
        if(request.session.raceId != request.body.raceId)
        {
            response.status(404)
                    .set("Content-Type", "application/json")
                    .send({
                        result: "fail",
                        message: "raceId not found"
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

        const insertRace = races.prepare("INSERT INTO `races` (`color`, `name`, `map`, `time`) VALUES (@color, @name, @map, @time)");
        
        insertRace.run({
            color: request.body.raceColor,
            name: request.session.userName,
            map: request.body.raceMap,
            time: request.body.raceTime
        });
        
        response.status(200)
            .set("Content-Type", "application/json")
            .send({
                result: "ok",
                message: "race updated"
            });
    });

    app.delete('/race', (request, response) =>
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
        
        let missingParameters = ExtractMissingParameters([
            "raceId",
        ], request);

        if(missingParameters.length > 0)
        {
            response.status(400)
                    .set("Content-Type", "application/json")
                    .send({
                        result: "fail",
                        message: `required parameter (${missingParameters.join()}) missing`,
                    });

            return;
        }

        if(request.session.raceId != request.body.raceId)
        {
            response.status(404)
                    .set("Content-Type", "application/json")
                    .send({
                        result: "fail",
                        message: "raceId not found"
                    });
            
            return;
        }

        request.session.raceId = null;
        request.session.raceEndTime = 0;
        request.session.raceStartTime = 0;

        response.status(200)
            .set("Content-Type", "application/json")
            .send({
                result: "ok",
                message: "race interrupted"
            });
    });

}



