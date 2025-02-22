document.addEventListener('DOMContentLoaded', () => {
    const gameArea = document.getElementById('game-area');
    gameArea.style.gridTemplateColumns = 'repeat(10, 1fr)';
    gameArea.style.gridTemplateRows = 'repeat(10, 1fr)';

    for (let i = 0; i < 100; i++) {
        const tile = document.createElement('div');
        tile.classList.add('tile');
        if (i === 45) tile.classList.add('player'); // Place player in the middle (row 5, column 5)
        gameArea.appendChild(tile);
    }

    document.addEventListener('keydown', (event) => {
        const player = document.querySelector('.tile.player');
        if (!player) return;

        let newIndex = Array.from(gameArea.children).indexOf(player);
        switch (event.key) {
            case 'ArrowUp': newIndex -= 10; break;
            case 'ArrowDown': newIndex += 10; break;
            case 'ArrowLeft': newIndex -= 1; break;
            case 'ArrowRight': newIndex += 1; break;
            default: return;
        }

        if (newIndex >= 0 && newIndex < 100) {
            player.classList.remove('player');
            gameArea.children[newIndex].classList.add('player');
        }
    });
});
