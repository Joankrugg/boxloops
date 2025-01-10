// Contexte audio global (ne sera activé qu'après un geste utilisateur)
let audioContext;
let audioBuffers = {};
let playingLoops = {};

// Fonction pour démarrer l'AudioContext après un clic
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Fonction pour charger les fichiers audio et les stocker en mémoire
async function loadAudio(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return audioContext.decodeAudioData(arrayBuffer);
}

// Fonction pour démarrer une boucle audio tant que le bouton est pressé
function playSample(id) {
    initAudioContext(); // Assurer que l'AudioContext est bien initialisé

    const buffer = audioBuffers[id];
    const source = audioContext.createBufferSource();
    source.buffer = buffer;

    // Connecter la source au contexte audio
    source.connect(audioContext.destination);

    // Démarrer immédiatement
    source.start();

    // Stocker la source pour pouvoir l'arrêter
    playingLoops[id] = source;
}

// Fonction pour arrêter la lecture d'un sample
function stopSample(id) {
    if (playingLoops[id]) {
        playingLoops[id].stop(); // Arrêter la lecture
        delete playingLoops[id]; // Supprimer la référence à la source
    }
}

// Charger les boucles musicales lors du chargement de la page
window.onload = async () => {
    // L'utilisateur doit interagir avec la page pour permettre le démarrage du contexte audio
    document.body.addEventListener('click', async () => {
        if (!audioContext) {
            initAudioContext(); // Démarrer l'AudioContext une fois qu'il y a eu un clic
        }

        for (let i = 1; i <= 12; i++) {
            const audioBuffer = await loadAudio(`loops/loop${i}.mp3`); // Charger chaque boucle audio
            audioBuffers[`loop${i}`] = audioBuffer; // Stocker le buffer audio

            const box = document.getElementById(`loop${i}`);

            // Jouer lorsque le bouton est pressé
            box.addEventListener('mousedown', () => playSample(`loop${i}`));
            box.addEventListener('touchstart', () => playSample(`loop${i}`), { passive: true });

            // Arrêter lorsque le bouton est relâché
            box.addEventListener('mouseup', () => stopSample(`loop${i}`));
            box.addEventListener('mouseleave', () => stopSample(`loop${i}`)); // Si le curseur sort du bouton
            box.addEventListener('touchend', () => stopSample(`loop${i}`));
        }
    }, { once: true }); // S'assurer que cet événement ne se déclenche qu'une seule fois
};
