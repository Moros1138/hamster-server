(function () {
    const messages = document.querySelector('#messages');
    const wsButton = document.querySelector('#wsButton');
    const wsSendButton = document.querySelector('#wsSendButton');
    const logout = document.querySelector('#logout');
    const login = document.querySelector('#login');

    function showMessage(message) {
        messages.textContent += `\n${message}`;
        messages.scrollTop = messages.scrollHeight;
    }

    function handleResponse(response) {
        return response.ok
            ? response.json().then((data) => JSON.stringify(data, null, 2))
            : Promise.reject(new Error('Unexpected response'));
    }

    login.onclick = function () {
        fetch('/login', { method: 'POST', credentials: 'same-origin' })
            .then(handleResponse)
            .then(showMessage)
            .catch(function (err) {
                showMessage(err.message);
            });
    };

    logout.onclick = function () {
        fetch('/logout', { method: 'DELETE', credentials: 'same-origin' })
            .then(handleResponse)
            .then(showMessage)
            .catch(function (err) {
                showMessage(err.message);
            });
    };

    let ws;

    wsButton.onclick = function () {
        if (ws) {
            ws.onerror = ws.onopen = ws.onclose = null;
            ws.close();
        }

        ws = new WebSocket(`//${location.host}/websockets`);
        
        ws.onerror = function () {
            showMessage('WebSocket error');
        };
        
        ws.onopen = function () {
            showMessage('WebSocket connection established');
        };
        
        ws.onmessage = function(message) {
            
            if(message && message.data)
            {
                showMessage(message.data);
            }
        };
        
        ws.onclose = function () {
            showMessage('WebSocket connection closed');
            ws = null;
        };
    };



    function sendMessage()
    {
        if (!ws) {
            showMessage('No WebSocket connection');
            return;
        }
        const txtMessage = document.querySelector('#txtMessage');
        
        ws.send(
            JSON.stringify({
                type: "chat",
                data: txtMessage.value,
            })
        );
        
        txtMessage.value = "";
    }

    document.querySelector('#txtMessage').addEventListener("keyup", (event) =>
    {
        if(event.keyCode == 13)
        {
            sendMessage();
        }
    });

    wsSendButton.onclick = function () {
        sendMessage();
    };
})();