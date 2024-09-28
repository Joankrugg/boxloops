// Contexte audio global (ne sera activé qu'après un geste utilisateur)
let audioContext;
let audioBuffers = {};
let playingLoops = {};
const bpm = 120;
const measureTime = (60 / bpm) * 4; // Durée d'une mesure (4 temps)

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

// Fonction pour démarrer une boucle audio
function startLoop(id) {
    initAudioContext(); // Assurer que l'AudioContext est bien initialisé
    
    const buffer = audioBuffers[id];
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Connecter la source au contexte audio
    source.connect(audioContext.destination);

    // Synchroniser la lecture avec le BPM
    const now = audioContext.currentTime;
    const nextStartTime = Math.ceil(now / measureTime) * measureTime; // Prochaine mesure entière
    source.start(nextStartTime); // Démarrer au prochain battement

    playingLoops[id] = source; // Sauvegarder la source pour l'arrêter plus tard
}

// Fonction pour arrêter une boucle audio
function stopLoop(id) {
    if (playingLoops[id]) {
        playingLoops[id].stop(); // Arrêter la lecture
        delete playingLoops[id]; // Supprimer la référence à la source
    }
}

// Fonction pour basculer l'état d'une boucle (toggle)
function toggleLoop(id) {
    const box = document.getElementById(id);

    if (box.classList.contains('active')) {
        stopLoop(id); // Arrêter la boucle si elle est active
        box.classList.remove('active');
    } else {
        startLoop(id); // Démarrer la boucle si elle n'est pas active
        box.classList.add('active');
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

            // Ajouter un événement au clic pour chaque carré
            document.getElementById(`loop${i}`).addEventListener('click', () => toggleLoop(`loop${i}`));
        }
    }, { once: true }); // S'assurer que cet événement ne se déclenche qu'une seule fois
};
