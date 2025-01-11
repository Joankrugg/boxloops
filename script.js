let audioContext;
let audioBuffers = {};
let playingLoops = {};

// Initialisation du contexte audio
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log("AudioContext initialisé");
    }
}

// Chargement des fichiers audio
async function loadAudio(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return audioContext.decodeAudioData(arrayBuffer);
}

// Lecture d'un sample
function playSample(id) {
    initAudioContext();
    const buffer = audioBuffers[id];
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start();
    playingLoops[id] = source;
    console.log("Lecture démarrée pour :", id);
}

// Arrêt d'un sample
function stopSample(id) {
    if (playingLoops[id]) {
        playingLoops[id].stop();
        delete playingLoops[id];
        console.log("Lecture arrêtée pour :", id);
    }
}

// Configuration des boucles
window.onload = async () => {
    document.body.addEventListener('touchstart', () => {
        if (!audioContext) initAudioContext();
    }, { once: true });

    for (let i = 1; i <= 24; i++) {
        const buffer = await loadAudio(`loops/loop${i}.mp3`);
        audioBuffers[`loop${i}`] = buffer;

        const box = document.getElementById(`loop${i}`);

        box.addEventListener('touchstart', (event) => {
            event.preventDefault();
            playSample(`loop${i}`);
        }, { passive: false });

        box.addEventListener('touchend', (event) => {
            event.preventDefault();
            stopSample(`loop${i}`);
        }, { passive: false });
    }
};
