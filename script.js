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
    const trackHeight = container.parentElement.offsetHeight - 80;
    const maxPoints = Math.max(...data.map(item => parseFloat(item.points)));

    data.forEach((item, index) => {
        const pts = parseFloat(item.points);
        const teamId = type === 'Driver' ? item.Constructors[0].constructorId : item.Constructor.constructorId;
        const name = type === 'Driver' ? item.Driver.familyName : item.Constructor.name;

        let node = document.getElementById(`${type}-${index}`);
        if (!node) {
            node = document.createElement('div');
            node.id = `${type}-${index}`;
            node.className = 'car-node';
            container.appendChild(node);
        }

        // Proportional Y Math
        const yPos = maxPoints > 0 ? ((maxPoints - pts) / maxPoints) * trackHeight : 0;
        
        // Anti-Bunching X Math (3 columns)
        const xPos = (index % 3) * 30 + 5; 

        node.style.transform = `translate(${xPos}%, ${yPos}px)`;
        node.innerHTML = `
            <img src="${ASSETS[teamId] || ASSETS['mclaren']}">
            <div class="label">${name.toUpperCase()}: ${pts}</div>
        `;
    });
}

updateAll();
setInterval(updateAll, 60000); // Auto-update every minute
