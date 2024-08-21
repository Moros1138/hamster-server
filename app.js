import express from 'express';
import { v4 as uuid4 } from 'uuid';
import { Filter } from 'bad-words';

const filter = new Filter();

export default function defineApi(app)
{
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
}



