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
        // console.log(`Creating session for user ${request.session.userId}`);
    
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
}



