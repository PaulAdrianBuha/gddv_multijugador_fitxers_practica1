let idJoc, idJugador;
let punts = [0, 0];
let guanyador = null;

const cercle = document.getElementById('cercle');
const textEstat = document.getElementById('estat');
const divJoc = document.getElementById('joc');
const textPuntuacio = document.getElementById('puntuacio');
const progressPlayer = document.getElementById('progressPlayer');
const progressOtherPlayer = document.getElementById('progressOtherPlayer');

// Connectar al servidor del joc
function unirseAlJoc() {
    fetch('game.php?action=join')
        .then(response => response.json())
        .then(data => {
            idJoc = data.game_id;
            idJugador = data.player_id;
            comprovarEstatDelJoc();
        });
}

// Comprovar l'estat del joc cada mig segon
function comprovarEstatDelJoc() {
    fetch(`game.php?action=status&game_id=${idJoc}`)
        .then(response => response.json())
        .then(joc => {
            if (joc.error) {
                textEstat.innerText = joc.error;
                return;
            }

            punts = joc.points;
            guanyador = joc.winner;

            textPuntuacio.innerText = `Jugador 1: ${punts[0]} | Jugador 2: ${punts[1]}`;

            if (guanyador) {
                if (guanyador === idJugador) {
                    textEstat.innerText = 'Has guanyat!';
                } else {
                    textEstat.innerText = 'Has perdut!';
                }
                cercle.style.display = 'none';
                return;
            }

            if (joc.player1 === idJugador) {
                if (joc.player2) {
                    textEstat.innerText = 'Joc en curs...';
                    divJoc.style.display = 'block';
                    // console.log(joc);
                    progressPlayer.value = joc.progress_player1;
                    progressOtherPlayer.value = joc.progress_player2;
                } else {
                    textEstat.innerText = 'Ets el Jugador 1. Esperant el Jugador 2...';
                }
            } else if (joc.player2 === idJugador) {
                textEstat.innerText = 'Joc en curs...';
                divJoc.style.display = 'block';
                progressPlayer.value = joc.progress_player2;
                progressOtherPlayer.value = joc.progress_player1;
            } else {
                textEstat.innerText = 'Espectant...';
                divJoc.style.display = 'block';
            }

            // Gestionar la visualització del cercle
            if (joc.circle.visible) {
                mostrarCercle(joc.circle.x, joc.circle.y);
            } else {
                amagarCercle();
            }

            setTimeout(comprovarEstatDelJoc, 500);
        });
}

// Mostrar el cercle a la posició especificada
function mostrarCercle(x, y) {
    cercle.style.left = x + 'px';
    cercle.style.top = y + 'px';
    cercle.style.display = 'block';
    cercle.onclick = gestionarClickAlCercle;
}

// Amagar el cercle
function amagarCercle() {
    cercle.style.display = 'none';
    cercle.onclick = null;
}

// Gestionar el clic al cercle
function gestionarClickAlCercle() {
    fetch(`game.php?action=click&game_id=${idJoc}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            }
            // El cercle es mostrarà i els punts s'actualitzaran en la següent comprovació d'estat
        });
}

const input = document.getElementById('input');
const output = document.getElementById('output');
const textToTypeText = document.getElementById('texttotype').textContent;

input.addEventListener('input', function(event) {
    // Find the number of matching characters
    let text = event.target.value;
    let matchCount = [...text].findIndex((char, i) => char !== textToTypeText[i]); // Find first non-matching (last correct character)

    // If all characters match (findIndex == -1), set matchCount to the length, otherwise keep it
    matchCount = matchCount === -1 ? text.length : matchCount;

    output.textContent = `You typed: ${event.target.value}`;
    console.log(matchCount);
    fetch(`game.php?action=type&game_id=${idJoc}&progress=${matchCount}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            }
        });
});

// Iniciar el joc unint-se
unirseAlJoc();