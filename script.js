// Contexte audio global (ne sera activé qu'après un geste utilisateur)
let audioContext;
let audioBuffers = {};
let playingLoops = {};

// Fonction pour démarrer l'AudioContext après un clic ou un toucher
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Fonction pour charger les fichiers audio
async function loadAudio(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return audioContext.decodeAudioData(arrayBuffer);
}

// Fonction pour jouer un sample
function playSample(id) {
    initAudioContext();
    const buffer = audioBuffers[id];
    const source = audioContext.createBufferSource();
    source.buffer = buffer;

    // Connecter la source au contexte audio
    source.connect(audioContext.destination);

    // Démarrer immédiatement
    source.start();

    playingLoops[id] = source;
}

// Fonction pour arrêter un sample
function stopSample(id) {
    if (playingLoops[id]) {
        playingLoops[id].stop();
        delete playingLoops[id];
    }
}

// Charger les boucles audio
window.onload = async () => {
    document.body.addEventListener('touchstart', () => {
        if (!audioContext) initAudioContext();
    }, { once: true });

    for (let i = 1; i <= 12; i++) {
        const audioBuffer = await loadAudio(`loops/loop${i}.mp3`);
        audioBuffers[`loop${i}`] = audioBuffer;

        const box = document.getElementById(`loop${i}`);

        box.addEventListener('touchstart', (event) => {
            event.preventDefault();
            playSample(`loop${i}`);
        });

        box.addEventListener('touchend', (event) => {
            event.preventDefault();
            stopSample(`loop${i}`);
        });
    }
};
