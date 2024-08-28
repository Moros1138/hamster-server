let playerName = "";

const getPlayerName = () =>
{
    const DB_NAME = "hamster";
    const DB_VERSION = 22;
    const DB_STORE_NAME = "FILE_DATA";
    
    return new Promise((resolve, reject) =>
    {
        let request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onsuccess = function(event)
        {
            let db = event.target.result;
            db
                .transaction(DB_STORE_NAME)
                .objectStore(DB_STORE_NAME)
                .get("playerName").onsuccess = (event) =>
                {
                    let decoder = new TextDecoder('utf-8'); // Specify encoding if needed
                    resolve(decoder.decode(event.target.result));
                };
        };
        
        request.onerror = function(event)
        {
            reject(event.target.errorCode);
        };
    });
};

const route = (event) =>
{
    event = event || window.event;
    event.preventDefault();
    window.history.pushState({}, "", event.target.href);
    handleLocation();
};

const routes = {
    "#!/": undefined,
    "#!/map1":  { map: "StageI.tmx",    title: "I - Welcome to Hamster Planet!" },
    "#!/map2":  { map: "StageII.tmx",   title: "II - Splitting Hairs" },
    "#!/map3":  { map: "StageIII.tmx",  title: "III - The Stranger Lands" },
    "#!/map4":  { map: "StageIV.tmx",   title: "IV - Jet Jet Go!" },
    "#!/map5":  { map: "StageV.tmx",    title: "V - Run Run Run!" },
    "#!/map6":  { map: "StageVI.tmx",   title: "VI - A Twisty Maze" },
    "#!/map7":  { map: "StageVII.tmx",  title: "VII - Dunescape" },
    "#!/map8":  { map: "StageVIII.tmx", title: "VIII - Swamps of Travesty" },
    "#!/map9":  { map: "StageIX.tmx",   title: "IX - Wide Chasm" },
    "#!/map10": { map: "StageX.tmx",    title: "X - Hamster Island" },
};

const handleLocation = async() =>
{
    const path = window.location.hash;
    const route = routes[path] || routes["#!/"];
    
    if(route === undefined)
    {
        handleHome();
        return;
    }
    
    handleMap(route);

};

const handleHome = () =>
{
    const elem_container = document.querySelector("main");
    elem_container.innerHTML = "";

    let keys = Object.keys(routes);

    keys.forEach((route, index) =>
    {
        if(index == 0)
            return;

        elem_container.innerHTML += `<a href="${route}" class="map-title">${routes[route].title}</div>`;
    });

    elem_container.querySelectorAll(".map-title").forEach((item) =>
    {
        item.addEventListener("click", route);
    });
};

const handleMap = async(route) =>
{
    const json = await fetch(`/race?map=${route.map}&sortBy=time&offset=0&limit=100&sort=ASC`).then(response => response.json());

    if(json.results === undefined)
        return;
        
    const elem_container = document.querySelector("main");
    elem_container.innerHTML = `
<a class="back-link" href="/leaderboard.html" onclick="route()">Back to Map List</a>
<div class="map-title">${route.title}</div>
<table class="race-entries">
    <thead>
        <tr>
            <th class="placement">#</th>
            <th class="name">Name</th>
            <th class="time">Time</th>
        </tr>
    </thead>
    <tbody></tbody>
</table>
<a class="back-link" href="/leaderboard.html" onclick="route()">Back to Map List</a>`;
    const elem_raceEntries = elem_container.querySelector(".race-entries tbody");
        
    if(json.results.length > 0)
    {
        json.results.forEach((result, index) =>
        {
            let seconds = result.time / 1000;
            let isMyName = (result.name == this.playerName);
    
            elem_raceEntries.innerHTML += `<tr>
                                                <td class="placement ${(isMyName ? 'is-me' : '')}">${index + 1}.</td>
                                                <td class="name ${(isMyName ? 'is-me' : '')}">
                                                    <img src="leaderboard/Hamster-${result.color}.png" alt="${result.color} Hamster">
                                                    <span>${result.name}</span>
                                                </td>
                                                <td class="time ${(isMyName ? 'is-me' : '')}">
                                                    ${seconds.toFixed(3)}
                                                </td>
                                            </tr>`;
        });
    }
    else
    {
    elem_raceEntries.innerHTML = `
        <tr>
            <td class="no-entries" colspan="2">No Entries for this Map</td>
        </tr>`;
    }
};

window.onpopstate = handleLocation;
window.route = route;

getPlayerName()
    .then((result) =>
    {
        playerName = result;
        handleLocation();
    })
    .catch((err) => console.log(err));


