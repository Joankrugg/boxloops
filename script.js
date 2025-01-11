// Contexte audio global
let audioContext;
let audioBuffers = {};
let playingLoops = {};

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

// Gestion des interactions tactiles et souris
function handleStart(event, id) {
    event.preventDefault(); // Empêcher le comportement par défaut (sélection, défilement)
    if (!playingLoops[id]) {
        playSample(id);
    }
}

function handleEnd(event, id) {
    event.preventDefault(); // Empêcher le comportement par défaut
    if (playingLoops[id]) {
        stopSample(id);
    }
}

// Charger les sons et configurer les événements
window.onload = async () => {
    document.body.addEventListener('click', async () => {
        initAudioContext();

        for (let i = 1; i <= 48; i++) {
            const audioBuffer = await loadAudio(`loops/loop${i}.mp3`);
            audioBuffers[`loop${i}`] = audioBuffer;

            const box = document.getElementById(`loop${i}`);

            // Événements pour les interactions de souris
            box.addEventListener('mousedown', (e) => handleStart(e, `loop${i}`));
            box.addEventListener('mouseup', (e) => handleEnd(e, `loop${i}`));
            box.addEventListener('mouseleave', (e) => handleEnd(e, `loop${i}`)); // Sortie de la zone

            // Événements pour les interactions tactiles
            box.addEventListener('touchstart', (e) => handleStart(e, `loop${i}`), { passive: false });
            box.addEventListener('touchend', (e) => handleEnd(e, `loop${i}`), { passive: false });
            box.addEventListener('touchcancel', (e) => handleEnd(e, `loop${i}`), { passive: false }); // Cas d'interruption
        }

        console.log("Événements configurés pour mobile et desktop.");
    }, { once: true });
};
