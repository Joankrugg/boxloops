// Contexte audio global
let audioContext;
let audioBuffers = {};
let playingLoops = {};

// Fonction pour démarrer l'AudioContext après une interaction utilisateur (important pour mobile)
function initAudioContext() {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.error("Erreur lors de la création de l'AudioContext:", e);
            alert("Votre navigateur ne supporte pas l'API Web Audio."); // Message plus clair
            return false; // Indiquer un échec
        }
        if (audioContext.state === 'suspended') {
          audioContext.resume().then(() => {
            console.log('Audio Context résumed');
          });
        }
        console.log("AudioContext initialisé.");
    }
    return true; // Indiquer le succès
}

// Charger les fichiers audio (gestion des erreurs améliorée)
async function loadAudio(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status} lors du chargement de ${url}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        return await audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
        console.error("Erreur lors du chargement ou du décodage de l'audio:", error);
        return null; // Important de retourner null en cas d'erreur
    }
}

// Jouer un sample (vérification du buffer)
function playSample(id) {
    if (!initAudioContext()) return; // Arrêter si l'initialisation échoue
    const buffer = audioBuffers[id];
    if (!buffer) {
        console.error(`Buffer audio non trouvé pour ${id}`);
        return;
    }
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(audioContext.destination);

    // Gestion des erreurs de lecture (ex: si le contexte est suspendu)
    source.onended = () => {
        delete playingLoops[id];
    }
    try {
        source.start();
        playingLoops[id] = source;
    } catch (error) {
        console.error("Erreur lors de la lecture du son :", error);
    }
}

// Arrêter un sample (sécurité)
function stopSample(id) {
    if (playingLoops[id]) {
        try {
            playingLoops[id].stop();
        } catch (error) {
          console.error("Erreur lors de l'arret du son", error)
        }
        delete playingLoops[id];
    }
}

// Gestion des événements (simplifiée)
function handleInteraction(event, id) {
    const isPlaying = !!playingLoops[id];
    if (event.type === 'mousedown' || event.type === 'touchstart') {
        if (!isPlaying) {
            playSample(id);
        }
    } else if (event.type === 'mouseup' || event.type === 'touchend' || event.type === 'mouseleave' || event.type === 'touchcancel') {
      if(isPlaying){
        stopSample(id);
      }
    }
}

// Charger les sons et configurer les événements
window.addEventListener('load', async () => {
    document.body.addEventListener('touchstart', initAudioContext, { once: true, passive: true }); // Initialisation au premier touch
    document.body.addEventListener('click', initAudioContext, { once: true }); // Initialisation au premier click

    for (let i = 1; i <= 12; i++) {
        const audioBuffer = await loadAudio(`loops/loop${i}.mp3`);
        if (audioBuffer) { // Vérifier si le chargement a réussi
            audioBuffers[`loop${i}`] = audioBuffer;
            const box = document.getElementById(`loop${i}`);
            if (box){
                box.addEventListener('mousedown', (e) => handleInteraction(e, `loop${i}`));
                box.addEventListener('mouseup', (e) => handleInteraction(e, `loop${i}`));
                box.addEventListener('mouseleave', (e) => handleInteraction(e, `loop${i}`));
                box.addEventListener('touchstart', (e) => handleInteraction(e, `loop${i}`));
                box.addEventListener('touchend', (e) => handleInteraction(e, `loop${i}`));
                box.addEventListener('touchcancel', (e) => handleInteraction(e, `loop${i}`));
            } else {
                console.error(`Element with id loop${i} not found`)
            }

        }
    }
    console.log("Événements configurés.");
});
