// Contexte audio global
let audioContext;
let audioBuffers = {};
let playingLoops = {};
let activeTouches = new Set(); // Pour suivre les touches actives

// Fonction pour démarrer l'AudioContext après un clic
function initAudioContext() {
    if (!audioContext) {
        console.log("Initialisation de l'AudioContext...");
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Charger les fichiers audio
async function loadAudio(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return audioContext.decodeAudioData(arrayBuffer);
}

// Jouer un sample
function playSample(id) {
    initAudioContext();
    const buffer = audioBuffers[id];
    const source = audioContext.createBufferSource();
    source.buffer = buffer;

    // Connecter directement à la destination
    source.connect(audioContext.destination);

    source.start();
    playingLoops[id] = source;
}

// Arrêter un sample
function stopSample(id) {
    if (playingLoops[id]) {
        playingLoops[id].stop();
        delete playingLoops[id];
    }
}

// Gestion des événements tactiles
function handleTouchStart(event, id) {
    event.preventDefault();
    activeTouches.add(id);

    if (!playingLoops[id]) {
        playSample(id);
    }
}

function handleTouchEnd(event, id) {
    event.preventDefault();
    activeTouches.delete(id);

    if (playingLoops[id]) {
        stopSample(id);
    }
}

// Charger les sons et configurer les événements
window.onload = async () => {
    document.body.addEventListener('click', async () => {
        initAudioContext();

        for (let i = 1; i <= 12; i++) {
            const audioBuffer = await loadAudio(`loops/loop${i}.mp3`);
            audioBuffers[`loop${i}`] = audioBuffer;

            const box = document.getElementById(`loop${i}`);

            // Événements pour les interactions de souris
            box.addEventListener('mousedown', () => playSample(`loop${i}`));
            box.addEventListener('mouseup', () => stopSample(`loop${i}`));
            box.addEventListener('mouseleave', () => stopSample(`loop${i}`)); // Sortie de la zone

            // Événements pour les interactions tactiles
            box.addEventListener('touchstart', (e) => handleTouchStart(e, `loop${i}`), { passive: false });
            box.addEventListener('touchend', (e) => handleTouchEnd(e, `loop${i}`), { passive: false });
            box.addEventListener('touchcancel', (e) => handleTouchEnd(e, `loop${i}`), { passive: false }); // Cas spécial : interruption du toucher
        }

        console.log("Événements configurés pour mobile et desktop.");
    }, { once: true });
};
