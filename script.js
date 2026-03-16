const ASSETS = {
    'mercedes': 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/d_common:f1:2026:fallback:car:2026fallbackcarright.webp/v1740000000/common/f1/2026/mercedes/2026mercedescarright.webp',
    'ferrari': 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/d_common:f1:2026:fallback:car:2026fallbackcarright.webp/v1740000000/common/f1/2026/ferrari/2026ferraricarright.webp',
    'audi': 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/d_common:f1:2026:fallback:car:2026fallbackcarright.webp/v1740000000/common/f1/2026/audi/2026audicarright.webp',
    'cadillac': 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/d_common:f1:2026:fallback:car:2026fallbackcarright.webp/v1740000000/common/f1/2026/cadillac/2026cadillaccarright.webp',
    'mclaren': 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/d_common:f1:2026:fallback:car:2026fallbackcarright.webp/v1740000000/common/f1/2026/mclaren/2026mclarencarright.webp',
    'alpine' : 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/d_common:f1:2026:fallback:car:2026fallbackcarright.webp/v1740000000/common/f1/2026/alpine/2026alpinecarright.webp',
    'aston_martin' : 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/d_common:f1:2026:fallback:car:2026fallbackcarright.webp/v1740000000/common/f1/2026/astonmartin/2026astonmartincarright.webp',
    'haas' : 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/d_common:f1:2026:fallback:car:2026fallbackcarright.webp/v1740000000/common/f1/2026/haasf1team/2026haasf1teamcarright.webp',
    'rb' : 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/d_common:f1:2026:fallback:car:2026fallbackcarright.webp/v1740000000/common/f1/2026/racingbulls/2026racingbullscarright.webp',
    'red_bull' : 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/d_common:f1:2026:fallback:car:2026fallbackcarright.webp/v1740000000/common/f1/2026/redbullracing/2026redbullracingcarright.webp',
    'williams' : 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/d_common:f1:2026:fallback:car:2026fallbackcarright.webp/v1740000000/common/f1/2026/williams/2026williamscarright.webp'
    // Map remaining team IDs...
};

async function updateAll() {
    const year = 2026;
    const [dRes, cRes] = await Promise.all([
        fetch(`https://api.jolpi.ca/ergast/f1/${year}/driverStandings.json`).then(r => r.json()),
        fetch(`https://api.jolpi.ca/ergast/f1/${year}/constructorStandings.json`).then(r => r.json())
    ]);

    renderTrack('drivers-layer', dRes.MRData.StandingsTable.StandingsLists[0].DriverStandings, 'Driver');
    renderTrack('constructors-layer', cRes.MRData.StandingsTable.StandingsLists[0].ConstructorStandings, 'Constructor');
    document.getElementById('status').innerText = `Last Update: ${new Date().toLocaleTimeString()}`;
}

function renderTrack(containerId, data, type) {
    const container = document.getElementById(containerId);
    const trackHeight = container.parentElement.offsetHeight - 100;
    const maxPoints = Math.max(...data.map(item => parseFloat(item.points)));

    // 1. Sort by points (High to Low) to process them in order
    const sortedData = [...data].sort((a, b) => b.points - a.points);
    
    // 2. We will track the "last occupied position" for each lane
    // This allows us to put cars side-by-side if they are too close vertically
    let lanes = [0, 0, 0, 0]; // 4 lanes to give even more room

    sortedData.forEach((item, index) => {
        const pts = parseFloat(item.points);
        const teamId = type === 'Driver' ? item.Constructors[0].constructorId : item.Constructor.constructorId;
        const name = type === 'Driver' ? item.Driver.familyName : item.Constructor.name;

        // Proportional Y calculation
        const yPos = maxPoints > 0 ? ((maxPoints - pts) / maxPoints) * trackHeight : trackHeight;

        // 3. COLLISION LOGIC: Find the first lane that isn't "blocked" at this Y height
        let bestLane = 0;
        const buffer = 70; // Height of the car + label in pixels

        for (let i = 0; i < lanes.length; i++) {
            if (yPos > lanes[i] + buffer || yPos < lanes[i] - buffer) {
                bestLane = i;
                break;
            } else {
                // If this lane is full, try the next one
                bestLane = (i + 1) % lanes.length;
            }
        }
        lanes[bestLane] = yPos; // Mark this height as "taken" in this lane

        // 4. Update or Create the element
        let node = document.getElementById(`${type}-${item.Driver?.driverId || item.Constructor?.constructorId}`);
        if (!node) {
            node = document.createElement('div');
            node.id = `${type}-${item.Driver?.driverId || item.Constructor?.constructorId}`;
            node.className = 'car-node';
            container.appendChild(node);
        }

        // Calculate X based on the best lane found (spaced out across the width)
        const xPos = 5 + (bestLane * 22); 

        node.style.transform = `translate(${xPos}%, ${yPos}px)`;
        node.innerHTML = `
            <img src="${ASSETS[teamId] || ASSETS['mclaren']}" style="width: 80px;">
            <div class="label" style="background: ${teamColors[teamId] || '#333'}">
                ${name.toUpperCase()} (${pts})
            </div>
        `;
    });
}

updateAll();
setInterval(updateAll, 60000); // Auto-update every minute
