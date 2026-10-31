/* ===== CLUBES ===== */
const clubes = [
    { id: "andrade", nombre: "Andrade" },
    { id: "argentino", nombre: "Argentino de Los Campamentos" },
    { id: "arenas-raffo", nombre: "Arenas Raffo" },
    { id: "barrancas", nombre: "Barrancas" },
    { id: "escuela-junin", nombre: "Escuela Deportiva Junín" },
    { id: "juventud-paz", nombre: "Juventud Unida de La Paz" },
    { id: "juventud-san-martin", nombre: "Juventud Unida de San Martín" },
    { id: "la-amistad", nombre: "La Amistad" },
    { id: "la-dormida", nombre: "La Dormida" },
    { id: "la-florida", nombre: "La Florida" },
    { id: "la-libertad", nombre: "La Libertad" },
    { id: "montecaseros", nombre: "Montecaseros" },
    { id: "san-pio-x", nombre: "San Pío X" },
    { id: "25-mayo", nombre: "25 de Mayo de Philipps" },
    { id: "tres-acequias", nombre: "Tres Acequias" },
    { id: "vina-fundacion", nombre: "Viña Fundación" }
];

/* ===== GRAFO ===== */
const grafo = {};
for (let club of clubes) {
    grafo[club.id] = {};
}

function conectar(club1, club2, distancia) {
    grafo[club1][club2] = distancia;
    grafo[club2][club1] = distancia;
}

/* ===== CONEXIONES (grafo de proximidad) ===== */
conectar("montecaseros", "vina-fundacion", 10);
conectar("montecaseros", "san-pio-x", 12);

conectar("vina-fundacion", "san-pio-x", 8);
conectar("vina-fundacion", "la-amistad", 9);

conectar("san-pio-x", "juventud-san-martin", 4);
conectar("san-pio-x", "andrade", 7);

conectar("juventud-san-martin", "escuela-junin", 6);

conectar("andrade", "escuela-junin", 5);
conectar("andrade", "tres-acequias", 7);

conectar("escuela-junin", "la-libertad", 8);
conectar("escuela-junin", "la-florida", 7);

conectar("la-libertad", "tres-acequias", 6);
conectar("la-libertad", "25-mayo", 12);

conectar("tres-acequias", "barrancas", 12);

conectar("la-florida", "la-amistad", 6);

conectar("la-amistad", "25-mayo", 8);
conectar("la-amistad", "argentino", 16);

conectar("25-mayo", "argentino", 10);
conectar("25-mayo", "arenas-raffo", 25);

conectar("argentino", "arenas-raffo", 28);

conectar("arenas-raffo", "la-dormida", 15);
conectar("la-dormida", "juventud-paz", 45);

/* ===== ALGORITMO DE DIJKSTRA ===== */
function dijkstra(grafo, origen, destino) {
    if (!grafo[origen] || !grafo[destino]) {
        console.error("Club no encontrado en el grafo:", { origen, destino });
        return null;
    }

    const distancias = {};
    const anteriores = {};
    const visitados = new Set();

    for (let club in grafo) {
        distancias[club] = Infinity;
        anteriores[club] = null;
    }
    distancias[origen] = 0;

    while (true) {
        let actual = null;
        let menorDistancia = Infinity;

        for (let club in grafo) {
            if (!visitados.has(club) && distancias[club] < menorDistancia) {
                menorDistancia = distancias[club];
                actual = club;
            }
        }

        if (actual === null || actual === destino) break;

        visitados.add(actual);

        for (let vecino in grafo[actual]) {
            const nuevaDistancia = distancias[actual] + grafo[actual][vecino];
            if (nuevaDistancia < distancias[vecino]) {
                distancias[vecino] = nuevaDistancia;
                anteriores[vecino] = actual;
            }
        }
    }

    if (distancias[destino] === Infinity) return null;

    // Reconstruir el camino
    const ruta = [];
    let actual = destino;
    while (actual !== null) {
        ruta.unshift(actual);
        actual = anteriores[actual];
    }

    return {
        ruta: ruta,
        distancia: distancias[destino]
    };
}

/* ===== DISTANCIA ENTRE COORDENADAS (Haversine) ===== */
function distanciaKm(coord1, coord2) {
    const R = 6371;
    const dLat = (coord2[0] - coord1[0]) * Math.PI / 180;
    const dLon = (coord2[1] - coord1[1]) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(coord1[0] * Math.PI / 180) * Math.cos(coord2[0] * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ===== SUAVIZAR CAMINO (evita desvíos forzados) ===== */
function suavizarCamino(ruta) {
    if (ruta.length <= 2) return ruta;

    const caminoSuave = [ruta[0]];

    for (let i = 1; i < ruta.length - 1; i++) {
        const anterior = ubicaciones[ruta[i - 1]];
        const actual   = ubicaciones[ruta[i]];
        const siguiente = ubicaciones[ruta[i + 1]];

        if (!anterior || !actual || !siguiente) {
            caminoSuave.push(ruta[i]);
            continue;
        }

        const distDirecta   = distanciaKm(anterior, siguiente);
        const distConParada = distanciaKm(anterior, actual) + distanciaKm(actual, siguiente);

        // Umbral más estricto: si aumenta más del 15%, se salta
        if (distConParada > distDirecta * 1.15) {
            continue;
        }

        caminoSuave.push(ruta[i]);
    }

    caminoSuave.push(ruta[ruta.length - 1]);
    return caminoSuave;
}

/* ===== ELEMENTOS DEL HTML ===== */
const selectorOrigen = document.getElementById("origen");
const selectorDestino = document.getElementById("destino");
const botonCalcular = document.getElementById("calcular");
const zonaResultado = document.getElementById("resultado");

// Cargar clubes en los selectores
for (let club of clubes) {
    const opcion1 = document.createElement("option");
    opcion1.value = club.id;
    opcion1.textContent = club.nombre;
    selectorOrigen.appendChild(opcion1);

    const opcion2 = document.createElement("option");
    opcion2.value = club.id;
    opcion2.textContent = club.nombre;
    selectorDestino.appendChild(opcion2);
}

// Valores por defecto
selectorOrigen.value = "montecaseros";
selectorDestino.value = "la-libertad";

/* ===== MAPA LEAFLET ===== */
const mapa = L.map("mapa").setView([-33.19, -68.47], 11);

L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
    maxZoom: 19,
    attribution: "Tiles &copy; Esri"
}).addTo(mapa);

// Coordenadas geográficas
const ubicaciones = {
    "montecaseros":        [-33.0146, -68.3926],
    "vina-fundacion":     [-33.0780, -68.4100],
    "san-pio-x":           [-33.0700, -68.4701],
    "juventud-san-martin": [-33.0657, -68.4480],
    "andrade":             [-33.1799, -68.5179],
    "escuela-junin":       [-33.1485, -68.4853],
    "la-florida":          [-33.1550, -68.4200],
    "la-amistad":          [-33.1270, -68.4056],
    "la-libertad":         [-33.1950, -68.4800],
    "tres-acequias":       [-33.1810, -68.5626],
    "25-mayo":             [-33.2033, -68.3750],
    "argentino":           [-33.2805, -68.3903],
    "barrancas":           [-33.1200, -68.6500],
    "arenas-raffo":        [-33.2650, -68.1200],
    "la-dormida":          [-33.3320, -68.0350],
    "juventud-paz":        [-33.4616, -67.5523]
};

// Crear marcadores
const marcadores = {};
for (const club of clubes) {
    const coords = ubicaciones[club.id];
    if (coords) {
        marcadores[club.id] = L.marker(coords).bindPopup(`<b>${club.nombre}</b>`);
    }
}

let lineaRuta = null;

function crearIcono(color) {
    return L.divIcon({
        className: "",
        html: `<div style="
            background-color: ${color};
            width: 22px;
            height: 22px;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 1px 5px #555;
        "></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
    });
}

/* ===== DIBUJAR RUTA (OSRM dibuja el camino suavizado) ===== */
async function mostrarRutaEnMapa(resultado) {
    // Borrar ruta anterior
    if (lineaRuta) {
        mapa.removeLayer(lineaRuta);
        lineaRuta = null;
    }

    // Ocultar todos los marcadores
    Object.values(marcadores).forEach(m => mapa.removeLayer(m));

    // Mostrar los clubes del camino (ya suavizado)
    resultado.ruta.forEach((id, indice) => {
        const marcador = marcadores[id];
        if (!marcador) return;

        let color = "#1976d2"; // intermedio
        if (indice === 0) color = "#2e9d50";                              // origen
        else if (indice === resultado.ruta.length - 1) color = "#e53935"; // destino

        marcador.setIcon(crearIcono(color));
        marcador.addTo(mapa);
    });

    // Pedir geometría real tramo por tramo
    let todosLosPuntos = [];

    try {
        for (let i = 0; i < resultado.ruta.length - 1; i++) {
            const origenId = resultado.ruta[i];
            const destinoId = resultado.ruta[i + 1];

            const [lat1, lon1] = ubicaciones[origenId];
            const [lat2, lon2] = ubicaciones[destinoId];

            const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`;

            const respuesta = await fetch(url);
            const data = await respuesta.json();

            if (data.code === "Ok" && data.routes[0]) {
                const puntosTramo = data.routes[0].geometry.coordinates.map(
                    coord => [coord[1], coord[0]]
                );
                if (todosLosPuntos.length > 0) {
                    puntosTramo.shift(); // evitar punto duplicado
                }
                todosLosPuntos = todosLosPuntos.concat(puntosTramo);
            } else {
                // Fallback: línea recta de ese tramo
                todosLosPuntos.push([lat1, lon1], [lat2, lon2]);
            }
        }

        if (todosLosPuntos.length > 1) {
            lineaRuta = L.polyline(todosLosPuntos, {
                color: "#0066cc",
                weight: 6,
                opacity: 0.85
            }).addTo(mapa);

            mapa.fitBounds(lineaRuta.getBounds(), { padding: [40, 40] });
        }
    } catch (error) {
        console.error("Error al pedir la ruta a OSRM:", error);
        dibujarLineaRecta(resultado);
    }
}

// Fallback: línea recta entre los nodos
function dibujarLineaRecta(resultado) {
    const puntos = resultado.ruta
        .map(id => ubicaciones[id])
        .filter(p => p !== undefined);

    if (puntos.length < 2) return;

    lineaRuta = L.polyline(puntos, {
        color: "#0066cc",
        weight: 6,
        opacity: 0.85
    }).addTo(mapa);

    mapa.fitBounds(lineaRuta.getBounds(), { padding: [40, 40] });
}

/* ===== BOTÓN CALCULAR ===== */
botonCalcular.addEventListener("click", function () {
    const origen = selectorOrigen.value;
    const destino = selectorDestino.value;

    zonaResultado.innerHTML = "";

    if (origen === destino) {
        zonaResultado.innerHTML = "<p style='color: #c0392b;'>Elegí dos clubes diferentes.</p>";
        return;
    }

    // 1. Dijkstra calcula el camino óptimo (algoritmo principal)
    const resultado = dijkstra(grafo, origen, destino);

    if (resultado === null) {
        zonaResultado.innerHTML = "<p style='color: #c0392b;'>No existe una ruta entre estos clubes en el grafo.</p>";
        return;
    }

    // 2. Suavizamos el camino para evitar desvíos forzados en el mapa
    const rutaSuave = suavizarCamino(resultado.ruta);

    // Mostrar resultado textual (camino completo de Dijkstra)
    const nombres = resultado.ruta.map(id => {
        const club = clubes.find(c => c.id === id);
        return club ? club.nombre : id;
    });

    zonaResultado.innerHTML = `
        <h3>Ruta más corta (Algoritmo de Dijkstra)</h3>
        <p><strong>${nombres.join(" → ")}</strong></p>
        <p>Distancia total estimada: <strong>${resultado.distancia} km</strong></p>
        <p style="font-size: 0.9em; color: #555;">
            Camino calculado con el algoritmo de Dijkstra sobre el grafo de proximidad de los clubes.
        </p>
    `;

    // 3. Dibujar en el mapa la versión suavizada (sin quiebres forzados)
    mostrarRutaEnMapa({
        ruta: rutaSuave,
        distancia: resultado.distancia
    });
});