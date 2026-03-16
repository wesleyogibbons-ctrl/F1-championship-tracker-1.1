const ASSETS = {
    'mercedes': 'https://media.formula1.com/image/upload/f_auto,q_auto/v1740000000/common/f1/2026/mercedes/2026mercedescarright.png',
    'ferrari': 'https://media.formula1.com/image/upload/f_auto,q_auto/v1740000000/common/f1/2026/ferrari/2026ferraricarright.png',
    'mclaren': 'https://media.formula1.com/image/upload/f_auto,q_auto/v1740000000/common/f1/2026/mclaren/2026mclarencarright.png',
    'audi': 'https://media.formula1.com/image/upload/f_auto,q_auto/v1740000000/common/f1/2026/audi/2026audicarright.png',
    'cadillac': 'https://media.formula1.com/image/upload/f_auto,q_auto/v1740000000/common/f1/2026/cadillac/2026cadillaccarright.png',
    'red_bull': 'https://media.formula1.com/image/upload/f_auto,q_auto/v1740000000/common/f1/2026/redbullracing/2026redbullracingcarright.png',
    'racing_bulls': 'https://media.formula1.com/image/upload/f_auto,q_auto/v1740000000/common/f1/2026/racingbulls/2026racingbullscarright.png',
    'haas': 'https://media.formula1.com/image/upload/f_auto,q_auto/v1740000000/common/f1/2026/haasf1team/2026haasf1teamcarright.png',
    'alpine': 'https://media.formula1.com/image/upload/f_auto,q_auto/v1740000000/common/f1/2026/alpine/2026alpinecarright.png',
    'aston_martin': 'https://media.formula1.com/image/upload/f_auto,q_auto/v1740000000/common/f1/2026/astonmartin/2026astonmartincarright.png',
    'williams': 'https://media.formula1.com/image/upload/f_auto,q_auto/v1740000000/common/f1/2026/williams/2026williamscarright.png'
};

const teamColors = {
    'mercedes': '#27F4D2', 'ferrari': '#E80020', 'mclaren': '#FF8000',
    'audi': '#F50537', 'cadillac': '#FFD700', 'red_bull': '#3671C6',
    'racing_bulls': '#6692FF', 'haas': '#B6BABD', 'alpine': '#0093CC',
    'aston_martin': '#229971', 'williams': '#64C4FF'
};

async function updateAll() {
    const statusEl = document.getElementById('status');
    try {
        const year = 2026;
        // The Jolpica-F1 API is the official source for 2026
        const [dRes, cRes] = await Promise.all([
            fetch(`https://api.jolpi.ca/ergast/f1/${year}/driverStandings.json`),
            fetch(`https://api.jolpi.ca/ergast/f1/${year}/constructorStandings.json`)
        ]);

        if (!dRes.ok || !cRes.ok) throw new Error("API Offline");

        const dData = await dRes.json();
        const cData = await cRes.json();

        const drivers = dData.MRData.StandingsTable.StandingsLists[0].DriverStandings;
        const teams = cData.MRData.StandingsTable.StandingsLists[0].ConstructorStandings;

        renderTrack('drivers-layer', drivers, 'Driver');
        renderTrack('constructors-layer', teams, 'Constructor');
        statusEl.innerText = `LIVE: 2026 Standings Updated`;
        
    } catch (e) {
        console.warn("Sync failed, using 2026 Chinese GP Fallback data.");
        // FALLBACK DATA (Current March 16, 2026 Standings)
        const fallbackDrivers = [
            { points: "51", Driver: { familyName: "Russell", driverId: "russell" }, Constructors: [{ constructorId: "mercedes" }] },
            { points: "47", Driver: { familyName: "Antonelli", driverId: "antonelli" }, Constructors: [{ constructorId: "mercedes" }] },
            { points: "34", Driver: { familyName: "Leclerc", driverId: "leclerc" }, Constructors: [{ constructorId: "ferrari" }] },
            { points: "33", Driver: { familyName: "Hamilton", driverId: "hamilton" }, Constructors: [{ constructorId: "ferrari" }] },
            { points: "17", Driver: { familyName: "Bearman", driverId: "bearman" }, Constructors: [{ constructorId: "haas" }] }
        ];
        renderTrack('drivers-layer', fallbackDrivers, 'Driver');
        statusEl.innerText = "Offline Mode: Showing Chinese GP Standings";
    }
}

function renderTrack(containerId, data, type) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // The '60px' safety buffer prevents car labels from touching
    const trackHeight = container.parentElement.offsetHeight - 120;
    const maxPoints = Math.max(...data.map(item => parseFloat(item.points)));

    // Clear old markers to prevent "ghosting"
    container.innerHTML = '';

    data.forEach((item, index) => {
        const pts = parseFloat(item.points);
        const teamId = type === 'Driver' ? item.Constructors[0].constructorId : item.Constructor.constructorId;
        const name = type === 'Driver' ? item.Driver.familyName : item.Constructor.name;

        // Proportional Math: 0 points = Bottom, Max points = Top
        const yPos = maxPoints > 0 ? ((maxPoints - pts) / maxPoints) * trackHeight : trackHeight;
        
        // Multi-lane spread (4 lanes)
        const lane = index % 4;
        const xPos = 5 + (lane * 22);

        const node = document.createElement('div');
        node.className = 'car-node';
        node.style.transform = `translate(${xPos}%, ${yPos}px)`;
        
        // Safety check for colors: use grey if team is unknown
        const teamColor = teamColors[teamId] || '#555';

        node.innerHTML = `
            <img src="${ASSETS[teamId] || 'fallback.png'}" style="width: 80px;">
            <div class="label" style="border-left: 4px solid ${teamColor}">
                ${name.toUpperCase()} (${pts})
            </div>
        `;
        container.appendChild(node);
    });
}

