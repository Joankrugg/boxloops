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
    source.loop = true; // Activer la boucle
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

// Gestion des événements
function handleInteraction(event, id) {
    if (event.type === 'mousedown' || event.type === 'touchstart') {
        playSample(id);
    } else if (event.type === 'mouseup' || event.type === 'touchend' || event.type === 'mouseleave' || event.type === 'touchcancel') {
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

            box.addEventListener('mousedown', (e) => handleInteraction(e, `loop${i}`));
            box.addEventListener('mouseup', (e) => handleInteraction(e, `loop${i}`));
            box.addEventListener('mouseleave', (e) => handleInteraction(e, `loop${i}`));

            box.addEventListener('touchstart', (e) => handleInteraction(e, `loop${i}`), { passive: false });
            box.addEventListener('touchend', (e) => handleInteraction(e, `loop${i}`), { passive: false });
            box.addEventListener('touchcancel', (e) => handleInteraction(e, `loop${i}`), { passive: false });
        }

        console.log("Événements configurés pour mobile et desktop.");
    }, { once: true });
};
