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
    try {
        const year = 2026;
        // The Jolpica API requires 'ergast' in the path for backwards compatibility
        const [dRes, cRes] = await Promise.all([
            fetch(`https://api.jolpi.ca/ergast/f1/${year}/driverStandings.json`).then(r => r.json()),
            fetch(`https://api.jolpi.ca/ergast/f1/${year}/constructorStandings.json`).then(r => r.json())
        ]);

        const dData = dRes.MRData.StandingsTable.StandingsLists[0].DriverStandings;
        const cData = cRes.MRData.StandingsTable.StandingsLists[0].ConstructorStandings;

        renderTrack('drivers-layer', dData, 'Driver');
        renderTrack('constructors-layer', cData, 'Constructor');
        document.getElementById('status').innerText = `LIVE: China GP Finalized - ${new Date().toLocaleTimeString()}`;
    } catch (e) {
        document.getElementById('status').innerText = "Sync Error: API is currently under heavy load.";
        console.error(e);
    }
}

function renderTrack(containerId, data, type) {
    const container = document.getElementById(containerId);
    const trackHeight = container.parentElement.offsetHeight - 120;
    const maxPoints = Math.max(...data.map(item => parseFloat(item.points)));

    let lanes = [0, 0, 0, 0];
    const buffer = 85; // Increased buffer to account for larger 2026 car assets

    data.forEach((item, index) => {
        const pts = parseFloat(item.points);
        const teamId = type === 'Driver' ? item.Constructors[0].constructorId : item.Constructor.constructorId;
        const name = type === 'Driver' ? item.Driver.familyName : item.Constructor.name;
        const uniqueId = type === 'Driver' ? item.Driver.driverId : item.Constructor.constructorId;

        const yPos = maxPoints > 0 ? ((maxPoints - pts) / maxPoints) * trackHeight : trackHeight;

        let bestLane = 0;
        for (let i = 0; i < lanes.length; i++) {
            if (yPos > lanes[i] + buffer) {
                bestLane = i;
                break;
            } else {
                bestLane = (i + 1) % lanes.length;
            }
        }
        lanes[bestLane] = yPos;

        let node = document.getElementById(`${type}-${uniqueId}`);
        if (!node) {
            node = document.createElement('div');
            node.id = `${type}-${uniqueId}`;
            node.className = 'car-node';
            container.appendChild(node);
        }

        const xPos = 5 + (bestLane * 23); 
        node.style.transform = `translate(${xPos}%, ${yPos}px)`;
        node.innerHTML = `
            <img src="${ASSETS[teamId] || ASSETS['mclaren']}" onerror="this.src='https://media.formula1.com/d_team_car_fallback_image.png'">
            <div class="label" style="border-bottom: 3px solid ${teamColors[teamId]}">
                ${name.toUpperCase()} (${pts})
            </div>
        `;
    });
}
