const DB_NAME = "hamster";
const DB_VERSION = 22;
const DB_STORE_NAME = "FILE_DATA";

let playerName;

function GetPlayerName()
{
    return new Promise((resolve, reject) =>
    {
        console.log("OpenDatabase ...");
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
    
            console.log("OpenDatabase DONE");
        };
        
        request.onerror = function(event)
        {
            reject(event.target.errorCode);
        };
    });
}

function renderMap(title, results)
{
    const elem_leaderboard = document.querySelector("#leaderboard-container");
    const elem_container = document.createElement("div");
    elem_container.classList.toggle("leaderboard", true);

    elem_container.innerHTML = `
    <div class="map-title">${title}</div>
    <table class="race-entries">
        <thead>
            <tr>
                <th class="name">Name</th>
                <th class="time">Time</th>
            </tr>
        </thead>
        <tbody></tbody>
    </table>
    `;
    
    const elem_raceEntries = elem_container.querySelector(".race-entries tbody");
    
    if(results.length > 0)
    {
        results.forEach((result) =>
        {
            let seconds = result.time / 1000;
            let isMyName = (result.name == playerName);
    
            elem_raceEntries.innerHTML += `
                <tr>
                    <td class="name ${(isMyName ? 'is-me' : '')}"><img src="leaderboard/Hamster-${result.color}.png" alt="${result.color} Hamster"> <span>${result.name}</span></td>
                    <td class="time ${(isMyName ? 'is-me' : '')}">${seconds.toFixed(3)}</td>
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
    
    elem_leaderboard.append(elem_container);
}



const maps = new Map();

maps.set("StageI.tmx",   "I - Welcome to Hamster Planet!");
maps.set("StageII.tmx",  "II - Splitting Hairs");
maps.set("StageIII.tmx", "III - The Stranger Lands");
maps.set("StageIV.tmx",  "IV - Jet Jet Go!");
maps.set("StageV.tmx",   "V - Run Run Run!");
maps.set("StageVI.tmx",  "VI - A Twisty Maze");
maps.set("StageVII.tmx", "VII - Dunescape");
maps.set("StageVIII.tmx","VIII - Swamps of Travesty");
maps.set("StageIX.tmx",  "IX - Wide Chasm");
maps.set("StageX.tmx",   "X - Hamster Island");

async function fetchInOrder() {
    
    playerName = await GetPlayerName();
    
    // Use map to create an array of fetch promises
    const fetchPromises = Array.from(maps).map(([key, value]) => fetch(`/race?map=${key}&sortBy=time&offset=0&limit=10&sort=ASC`).then(response => response.json()).then((json) =>
    {
        return {
            title: value,
            results: json.results,
        }
    }));

    // Wait for all promises to resolve and return results in order
    const results = await Promise.all(fetchPromises);

    return results;
}

fetchInOrder().then((results) =>
{
    results.forEach((map) =>
    {
        renderMap(map.title, map.results);
    });
});
