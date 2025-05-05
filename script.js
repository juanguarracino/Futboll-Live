const API_KEY = '8486b4635f333a4b90734b58d3e2d14a'; // ← Reemplaza con tu clave de API-Football
const API_HOST = 'api-football-v1.p.rapidapi.com';

const headers = {
    'X-RapidAPI-Key': API_KEY,
    'X-RapidAPI-Host': API_HOST
};

const ligaSelect = document.getElementById('ligaSelect');
const tablaBody = document.getElementById('tablaBody');
const partidosLista = document.getElementById('partidosLista');
const loading = document.getElementById('loading');

// Obtener todas las ligas
async function cargarLigas() {
    try {
        const res = await fetch('https://api-football-v1.p.rapidapi.com/v3/leagues', { headers });
        const data = await res.json();

        const ligasFiltradas = data.response.filter(l => l.seasons.some(s => s.year === 2024));
        ligasFiltradas.forEach(liga => {
            const option = document.createElement('option');
            option.value = JSON.stringify({ id: liga.league.id, season: 2024 });
            option.textContent = `${liga.league.name} - ${liga.country.name}`;
            ligaSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error cargando ligas:', error);
    }
}

// Mostrar tabla de posiciones
async function cargarTabla(id, season) {
    tablaBody.innerHTML = '';
    loading.style.display = 'block';

    try {
        const res = await fetch(`https://api-football-v1.p.rapidapi.com/v3/standings?league=${id}&season=${season}`, { headers });
        const data = await res.json();

        const standings = data.response[0].league.standings[0];
        standings.forEach((equipo, i) => {
            const fila = `
                <tr>
                    <td>${i + 1}</td>
                    <td>${equipo.team.name}</td>
                    <td>${equipo.points}</td>
                    <td>${equipo.all.played}</td>
                    <td>${equipo.all.win}</td>
                    <td>${equipo.all.draw}</td>
                    <td>${equipo.all.lose}</td>
                </tr>
            `;
            tablaBody.innerHTML += fila;
        });
    } catch (error) {
        console.error('Error cargando tabla:', error);
    } finally {
        loading.style.display = 'none';
    }
}

// Mostrar próximos partidos
async function cargarPartidos(id, season) {
    partidosLista.innerHTML = '';

    const hoy = new Date().toISOString().split('T')[0];

    try {
        const res = await fetch(`https://api-football-v1.p.rapidapi.com/v3/fixtures?league=${id}&season=${season}&from=${hoy}`, { headers });
        const data = await res.json();

        const partidos = data.response.slice(0, 10); // solo 10 partidos
        partidos.forEach(p => {
            const fecha = new Date(p.fixture.date).toLocaleString();
            const item = document.createElement('li');
            item.textContent = `${fecha} - ${p.teams.home.name} vs ${p.teams.away.name}`;
            partidosLista.appendChild(item);
        });
    } catch (error) {
        console.error('Error cargando partidos:', error);
    }
}

// Al cambiar la liga
ligaSelect.addEventListener('change', async (e) => {
    const liga = JSON.parse(e.target.value);
    await cargarTabla(liga.id, liga.season);
    await cargarPartidos(liga.id, liga.season);
});

// Inicializar
cargarLigas();
