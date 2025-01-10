// Contexte audio global (ne sera activé qu'après un geste utilisateur)
let audioContext;
let audioBuffers = {};
let playingLoops = {};
let effectNodes = {}; // Stockage des nœuds d'effets

// Fonction pour démarrer l'AudioContext après un clic
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Créer les effets
        effectNodes.delay = audioContext.createDelay();
        effectNodes.delay.delayTime.value = 0.5;

        effectNodes.reverb = audioContext.createConvolver();
        loadReverbImpulse('path/to/impulse-response.wav'); // Charger un fichier d'impulsion pour la reverb

        effectNodes.tremoloGain = audioContext.createGain();
        effectNodes.tremoloLFO = audioContext.createOscillator();
        effectNodes.tremoloLFO.frequency.value = 5; // Fréquence du tremolo
        effectNodes.tremoloLFO.connect(effectNodes.tremoloGain.gain);
        effectNodes.tremoloLFO.start();

        effectNodes.filter = audioContext.createBiquadFilter();
        effectNodes.filter.type = 'highpass';
        effectNodes.filter.frequency.value = 1000;

        // Connecter les effets en chaîne
        effectNodes.delay.connect(effectNodes.reverb);
        effectNodes.reverb.connect(effectNodes.tremoloGain);
        effectNodes.tremoloGain.connect(effectNodes.filter);
        effectNodes.filter.connect(audioContext.destination);
    }
}

// Charger un fichier d'impulsion pour la reverb
async function loadReverbImpulse(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = await audioContext.decodeAudioData(arrayBuffer);
    effectNodes.reverb.buffer = buffer;
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

    // Connecter la source aux effets
    source.connect(effectNodes.delay);

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

// Fonction pour mettre à jour les sliders
function updateEffect(id, value) {
    if (id === 'delay') {
        effectNodes.delay.delayTime.value = value;
    } else if (id === 'reverb') {
        effectNodes.reverb.buffer ? (effectNodes.reverb.wet.value = value) : null;
    } else if (id === 'tremolo') {
        effectNodes.tremoloLFO.frequency.value = value * 10; // Fréquence entre 0 et 10 Hz
    } else if (id === 'filter') {
        effectNodes.filter.frequency.value = value * 5000; // Fréquence entre 0 et 5000 Hz
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

        // Configurer les sliders
        document.querySelectorAll('.effect-slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                updateEffect(e.target.id, parseFloat(e.target.value));
            });
        });
    }, { once: true }); // S'assurer que cet événement ne se déclenche qu'une seule fois
};
