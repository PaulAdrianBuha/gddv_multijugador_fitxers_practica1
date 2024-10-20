let idJoc, idJugador, phrase;
let punts = [0, 0];
let guanyador = null;

const textEstat = document.getElementById('estat');
const divJoc = document.getElementById('joc');
const divAreaDeJoc = document.getElementById('areaDeJoc');

const progressPlayer = document.getElementById('progressPlayer');
const progressOtherPlayer = document.getElementById('progressOtherPlayer');

const textToType = document.getElementById('textToType');
const textTypedRight = document.getElementById('textTypedRight');
const textTypedWrong = document.getElementById('textTypedWrong');
const textLeft = document.getElementById('textLeft');

const input = document.getElementById('input');
const output = document.getElementById('output');
const sabotageChar = document.getElementById('sabotageChar');

// Connectar al servidor del joc
function unirseAlJoc() {
    fetch('game.php?action=join')
        .then(response => response.json())
        .then(data => {
            idJoc = data.game_id;
            idJugador = data.player_id;
            phrase = data.phrase;
            progressPlayer.max = phrase.length;
            progressOtherPlayer.max = phrase.length;
            textLeft.textContent = phrase;
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

            console.log(joc.active_sabotage_char);

            if (guanyador) {
                if (joc.player1 === idJugador) {
                    progressPlayer.value = joc.progress_player1;
                    progressOtherPlayer.value = joc.progress_player2;
                } else {
                    progressPlayer.value = joc.progress_player2;
                    progressOtherPlayer.value = joc.progress_player1;
                }
                input.disabled = true;
                
                if (guanyador === idJugador) {
                    textEstat.innerText = 'Has guanyat!';
                    divAreaDeJoc.style.backgroundColor = "#bedfb3"; // green background
                } else {
                    textEstat.innerText = 'Has perdut!';
                    divAreaDeJoc.style.backgroundColor = "#dfb3b3"; // red background
                }
                return;
            }

            if (joc.player1 === idJugador) {
                if (joc.player2) {
                    textEstat.innerText = 'Joc en curs...';
                    divJoc.style.display = 'block';
                    sabotageChar.textContent = joc.active_sabotage_char;
                    progressPlayer.value = joc.progress_player1;
                    progressOtherPlayer.value = joc.progress_player2;
                } else {
                    textEstat.innerText = 'Ets el Jugador 1. Esperant el Jugador 2...';
                }
            } else if (joc.player2 === idJugador) {
                textEstat.innerText = 'Joc en curs...';
                divJoc.style.display = 'block';
                sabotageChar.textContent = joc.active_sabotage_char;
                progressPlayer.value = joc.progress_player2;
                progressOtherPlayer.value = joc.progress_player1;
            } else {
                textEstat.innerText = 'Espectant...';
                divJoc.style.display = 'block';
            }
            setTimeout(comprovarEstatDelJoc, 500);
        });
}


input.addEventListener('input', function(event) {
    const textToTypeText = textTypedRight.textContent + textTypedWrong.textContent + textLeft.textContent;

    // Find the number of matching characters
    let text = event.target.value;
    let matchCount = [...text].findIndex((char, i) => char !== textToTypeText[i]); // Find first non-matching (last correct character)

    // If all characters match (findIndex == -1), set matchCount to the length, otherwise keep it
    matchCount = matchCount === -1 ? text.length : matchCount;

    textTypedRight.textContent = textToTypeText.substring(0, matchCount); // from start to the last matching char
    textTypedWrong.textContent = textToTypeText.substring(matchCount, text.length); // from the last matching char to the current typed char
    textLeft.textContent = textToTypeText.substring(text.length, textToTypeText.length); // from the current typed char to the end

    output.textContent = `You typed: ${event.target.value}`;
    if (matchCount == textToTypeText.length) {
        input.disabled = true;
    }
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