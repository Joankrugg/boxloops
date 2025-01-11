// Contexte audio global
let audioContext;
let audioBuffers = {};
let playingLoops = {};

// Initialisation de l'AudioContext
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Chargement des fichiers audio
async function loadAudio(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erreur de chargement : ${response.statusText}`);
        const arrayBuffer = await response.arrayBuffer();
        return await audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
        console.error(`Erreur de chargement audio pour ${url} :`, error);
        throw error;
    }
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
}

// Arrêt d'un sample
function stopSample(id) {
    if (playingLoops[id]) {
        playingLoops[id].stop();
        delete playingLoops[id];
    }
}

// Gestion des événements
function handleStart(event, id) {
    if (event.cancelable) event.preventDefault();
    console.log(`handleStart déclenché pour : ${id}`);
    if (!playingLoops[id]) playSample(id);
}

function handleEnd(event, id) {
    if (event.cancelable) event.preventDefault();
    console.log(`handleEnd déclenché pour : ${id}`);
    if (playingLoops[id]) stopSample(id);
}

// Chargement des boucles audio et configuration des événements
window.onload = async () => {
    document.body.addEventListener('click', async () => {
        initAudioContext();

        for (let i = 1; i <= 12; i++) {
            const audioBuffer = await loadAudio(`loops/loop${i}.mp3`);
            audioBuffers[`loop${i}`] = audioBuffer;

            const box = document.getElementById(`loop${i}`);
            box.addEventListener('mousedown', (e) => handleStart(e, `loop${i}`));
            box.addEventListener('mouseup', (e) => handleEnd(e, `loop${i}`));
            box.addEventListener('mouseleave', (e) => handleEnd(e, `loop${i}`));
            box.addEventListener('touchstart', (e) => handleStart(e, `loop${i}`), { passive: false });
            box.addEventListener('touchend', (e) => handleEnd(e, `loop${i}`), { passive: false });
            box.addEventListener('touchcancel', (e) => handleEnd(e, `loop${i}`), { passive: false });
        }

        console.log("Événements configurés pour mobile et desktop.");
    }, { once: true });
};
