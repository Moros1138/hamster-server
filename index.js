const session = require('express-session');
const express = require('express');
const http = require('http');
const uuid = require('uuid');


require('dotenv').config();

const { WebSocketServer } = require('ws');

const port = process.env.PORT || "8000";
const sessionSecret = process.env.SESSION_SECRET || "$eCuRiTy";
const publicDirectory = process.env.PUBLIC_DIRECTORY || "public";

const app = express();

const sessionSockets = new Map();

function onSocketError(err) {
    console.error(err);
}

//
// We need the same instance of the session parser in express and
// WebSocket server.
//
const sessionParser = session({
    saveUninitialized: false,
    secret: sessionSecret,
    resave: false
});

//
// Serve static files from the 'public' folder.
//
app.use(express.static(publicDirectory));
app.use(sessionParser);

app.post('/login', (request, response) =>
{
    //
    // "Log in" user and set userId to session.
    //
    const id = uuid.v4();

    console.log(`Updating session for user ${id}`);
    
    request.session.userId = id;
    
    response.send({
        result: 'OK',
        message: 'Session updated'
    });
});

app.delete('/logout', (request, response) =>
{
    const ws = sessionSockets.get(request.session.userId);

    console.log('Destroying session');
    
    request.session.destroy(() =>
    {
        if(ws)
            ws.close();

        response.send({
            result: 'OK',
            message: 'Session destroyed'
        });
    });
});

//
// Create an HTTP server.
//
const server = http.createServer(app);

//
// Create a WebSocket server completely detached from the HTTP server.
//
const wss = new WebSocketServer({
    clientTracking: false,
    noServer: true,
    path: "/websockets",
});

server.on('upgrade', (request, socket, head) =>
{
    socket.on('error', onSocketError);

    console.log('Parsing session from request...');

    sessionParser(request, {}, () =>
    {
        if(!request.session.userId)
        {
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
            socket.destroy();
            return;
        }

        console.log('Session is parsed!');

        socket.removeListener('error', onSocketError);

        wss.handleUpgrade(request, socket, head, (ws) =>
        {
            wss.emit('connection', ws, request);
        });
    });
});

wss.on('connection', (ws, request) =>
{
    const userId = request.session.userId;

    sessionSockets.set(userId, ws);

    ws.on('error', console.error);

    ws.on('message', (message) =>
    {
        try
        {
            message = JSON.parse(message);
        }
        catch(e)
        {
            // the message wasn't valid JSON, ignore it.
            return;
        }        

        //
        // Here we can now use session parameters.
        //
        console.log(`Received message ${message} from user ${userId}`);

        sessionSockets.forEach((client, clientId) =>
        {
            console.log("From:", userId, "To:", clientId);
            console.log(message.toString());

            
            client.send(message.toString());
        });
    });

    ws.on('close', () =>
    {
        sessionSockets.delete(userId);
    });
});


setInterval(() =>
{
    sessionSockets.forEach((client, clientId) =>
    {
        client.send(JSON.stringify({
            type: "keep-alive",
        }));
    });
}, 30000);

//
// Start the server.
//
server.listen(port, () =>
{
    console.log(`Listening on http://localhost:${port}`);
});
