const submenu = document.getElementById('submenu');
const submenuContent = document.getElementById('submenu-content');
const descriptionSubmenu = document.getElementById('description-submenu');
const descriptionContent = document.getElementById('description-content');

const dungeon = [
    ['E', ' ', 'R', ' ', ' ', 'S', ' ', 'R', ' ', 'E'],
    [' ', ' ', ' ', ' ', 'C', ' ', ' ', ' ', 'T', ' '],
    ['R', ' ', 'T', ' ', ' ', ' ', ' ', 'C', ' ', 'R'],
    [' ', 'C', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    ['S', ' ', ' ', ' ', '@', ' ', ' ', ' ', ' ', 'S'],
    [' ', ' ', ' ', ' ', ' ', ' ', 'T', ' ', 'C', ' '],
    ['R', 'C', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'R'],
    [' ', ' ', 'T', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', 'C', ' ', ' ', ' ', ' ', ' '],
    ['E', ' ', 'R', ' ', 'S', ' ', ' ', 'R', ' ', 'E']
];

let playerX = 4;
let playerY = 4;
let playerHP = 100;
let playerMP = 50;
let playerExp = 0;
let playerLevel = 1;
let maxInventorySpaces = 10;
let inventory = ['Potion', 'Empty', 'Empty', 'Empty', 'Empty', 'Empty', 'Empty', 'Empty', 'Empty', 'Empty'];
let nezukoHP = 50;

let tanjiroEquipment = { weapon: 'Nichirin Blade', armor: null, boots: null, stats: { attack: 5, agility: 0, spirit: 0, defense: 0 } };
let nezukoEquipment = { accessory: 'Demon Box', stats: { defense: 3, agility: 2, spirit: 0 } };
let baseStats = { strength: 5, agility: 5, spirit: 5 };

let enemies = [
    { x: 0, y: 0, hp: 20 },
    { x: 9, y: 0, hp: 20 },
    { x: 0, y: 9, hp: 20 },
    { x: 9, y: 9, hp: 20 }
];

const itemDescriptions = {
    'Potion': 'Heals 30 HP',
    'Nichirin Blade': 'Attack +5, Agility +0, Spirit +0',
    'Demon Slayer Mark': 'Attack +10, Agility +5, Spirit +5 (Rare)',
    'Demon Armor': 'Defense +8, Spirit +3',
    'Demon Boots': 'Agility +5, Spirit +2',
    'Demon Box': 'Defense +3, Agility +2 (Nezuko’s protective box)',
    'Empty': 'No item in this slot'
};

function renderDungeon() {
    const gameArea = document.getElementById('game-area');
    gameArea.innerHTML = '';
    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            if (x === playerX && y === playerY) {
                tile.style.backgroundImage = "url('https://via.placeholder.com/40x40.png/27ae60/ffffff?text=T')";
                tile.classList.add('player');
            } else if (enemies.some(e => e.x === x && e.y === y && e.hp > 0)) {
                tile.style.backgroundImage = "url('https://via.placeholder.com/40x40.png/e74c3c/ffffff?text=E')";
                tile.classList.add('enemy');
            } else if (dungeon[y][x] === 'S') {
                tile.textContent = 'S';
                tile.classList.add('stairs');
            } else if (dungeon[y][x] === 'R') {
                tile.textContent = 'R';
                tile.classList.add('room');
            } else if (dungeon[y][x] === 'T') {
                tile.textContent = 'T';
                tile.classList.add('trap');
            } else if (dungeon[y][x] === 'C') {
                tile.textContent = 'C';
                tile.classList.add('corridor');
            } else {
                tile.textContent = dungeon[y][x];
            }
            gameArea.appendChild(tile);
        }
    }
    updateUI();
}

function updateUI() {
    document.getElementById('level').textContent = `Level: ${playerLevel}`;
    document.getElementById('tanjiro-hp').textContent = `Tanjiro HP: ${playerHP}/100`;
    document.getElementById('nezuko-hp').textContent = `Nezuko HP: ${nezukoHP}/50`;
    document.getElementById('mp').textContent = `MP: ${playerMP}/50`;
    document.getElementById('exp').textContent = `Exp: ${playerExp}/${playerLevel * 100}`;
}

function levelUp() {
    const expNeeded = playerLevel * 100;
    if (playerExp >= expNeeded) {
        playerLevel++;
        playerExp -= expNeeded;
        playerHP = 100;
        playerMP = 50;
        nezukoHP = 50;
        maxInventorySpaces += 2;
        baseStats.strength += 1;
        baseStats.agility += 1;
        baseStats.spirit += 1;
    }
}

function moveEnemies() {
    enemies.forEach(enemy => {
        if (enemy.hp > 0 && Math.random() < 0.5) {
            if (enemy.x < playerX && dungeon[enemy.y][enemy.x + 1] !== 'C') enemy.x++;
            else if (enemy.x > playerX && dungeon[enemy.y][enemy.x - 1] !== 'C') enemy.x--;
            if (enemy.y < playerY && dungeon[enemy.y + 1][enemy.x] !== 'C') enemy.y++;
            else if (enemy.y > playerY && dungeon[enemy.y - 1][enemy.x] !== 'C') enemy.y--;
            if (Math.abs(enemy.x - playerX) <= 1 && Math.abs(enemy.y - playerY) <= 1) {
                const tanjiroDefense = tanjiroEquipment.stats.defense || 0;
                const nezukoDefense = nezukoEquipment.stats.defense || 0;
                const damage = Math.max(0, 5 - (tanjiroDefense + nezukoDefense) / 2);
                if (nezukoHP > 0 && Math.random() < 0.7) {
                    nezukoHP = Math.max(0, nezukoHP - damage);
                } else {
                    playerHP = Math.max(0, playerHP - damage);
                }
                updateUI();
            }
        }
    });
}

function nezukoProtect() {
    if (nezukoHP > 0) {
        alert('Nezuko protects Tanjiro, taking damage instead!');
    } else {
        alert('Nezuko is too weak to protect!');
    }
}

function attackEnemy(newX, newY, useBreathing = false) {
    const enemyIndex = enemies.findIndex(e => e.x === newX && e.y === newY && e.hp > 0);
    if (enemyIndex !== -1) {
        let damage = baseStats.strength + tanjiroEquipment.stats.attack;
        if (useBreathing && playerMP >= 5) {
            damage += 10;
            playerMP -= 5;
        }
        enemies[enemyIndex].hp -= damage;
        playerExp += 5;
        if (enemies[enemyIndex].hp <= 0) {
            enemies.splice(enemyIndex, 1);
        }
        levelUp();
        renderDungeon();
        return true;
    }
    return false;
}

function useItem(item) {
    if (item === 'Potion' && (playerHP < 100 || nezukoHP < 50)) {
        if (confirm('Are you sure you want to use this item?')) {
            if (playerHP < 100) playerHP = Math.min(100, playerHP + 30);
            else if (nezukoHP < 50) nezukoHP = Math.min(50, nezukoHP + 30);
            const index = inventory.indexOf(item);
            inventory[index] = 'Empty';
            refreshSubmenu('inventory');
        }
    } else if (item === 'Demon Slayer Mark') {
        if (confirm('Are you sure you want to use this item?')) {
            tanjiroEquipment.stats.attack += 10;
            tanjiroEquipment.stats.agility += 5;
            tanjiroEquipment.stats.spirit += 5;
            tanjiroEquipment.stats.defense += 5;
            const index = inventory.indexOf(item);
            inventory[index] = 'Empty';
            equipItem('Demon Slayer Mark');
            refreshSubmenu('inventory');
        }
    }
}

function equipItem(item) {
    const slots = {
        'Nichirin Blade': 'weapon',
        'Demon Slayer Mark': 'weapon',
        'Demon Armor': 'armor',
        'Demon Boots': 'boots',
        'Demon Box': 'accessory'
    };
    const slot = slots[item];
    const character = slot === 'accessory' ? 'nezuko' : 'tanjiro';
    const equipment = character === 'tanjiro' ? tanjiroEquipment : nezukoEquipment;
    const index = inventory.indexOf(item);
    if (index !== -1) {
        if (confirm('Are you sure you want to equip this item?')) {
            equipment[slot] = item;
            inventory[index] = 'Empty';
            updateEquipmentStats();
            refreshSubmenu('inventory');
        }
    }
}

function dropItem(item) {
    const index = inventory.indexOf(item);
    if (index !== -1 && item !== 'Empty') {
        if (confirm('Are you sure you want to drop this item?')) {
            inventory[index] = 'Empty';
            refreshSubmenu('inventory');
        }
    }
}

function unequipItem(character, slot) {
    const equipment = character === 'tanjiro' ? tanjiroEquipment : nezukoEquipment;
    const currentItem = equipment[slot];
    if (currentItem && currentItem !== null) {
        const emptySlotIndex = inventory.indexOf('Empty');
        if (emptySlotIndex !== -1) {
            if (confirm('Unequip or Cancel?')) {
                equipment[slot] = null;
                inventory[emptySlotIndex] = currentItem;
                updateEquipmentStats();
                refreshSubmenu('status');
            }
        } else {
            if (confirm('No inventory space left! Drop this item instead?')) {
                equipment[slot] = null;
                refreshSubmenu('status');
            }
        }
    }
}

function sortInventory() {
    inventory.sort((a, b) => {
        if (a === 'Empty') return 1;
        if (b === 'Empty') return -1;
        return a.localeCompare(b);
    });
    refreshSubmenu('inventory');
}

function updateEquipmentStats() {
    tanjiroEquipment.stats = { attack: 0, agility: 0, spirit: 0, defense: 0 };
    nezukoEquipment.stats = { attack: 0, agility: 0, spirit: 0, defense: 0 };
    if (tanjiroEquipment.weapon === 'Nichirin Blade') {
        tanjiroEquipment.stats.attack = 5;
    } else if (tanjiroEquipment.weapon === 'Demon Slayer Mark') {
        tanjiroEquipment.stats.attack = 15;
        tanjiroEquipment.stats.agility = 5;
        tanjiroEquipment.stats.spirit = 5;
        tanjiroEquipment.stats.defense = 5;
    }
    if (tanjiroEquipment.armor === 'Demon Armor') {
        tanjiroEquipment.stats.defense += 8;
        tanjiroEquipment.stats.spirit += 3;
    }
    if (tanjiroEquipment.boots === 'Demon Boots') {
        tanjiroEquipment.stats.agility += 5;
        tanjiroEquipment.stats.spirit += 2;
    }
    if (nezukoEquipment.accessory === 'Demon Box') {
        nezukoEquipment.stats.defense += 3;
        nezukoEquipment.stats.agility += 2;
    }
}

function refreshSubmenu(type) {
    if (submenu && submenuContent) {
        switch (type) {
            case 'inventory':
                showInventory();
                break;
            case 'skill-tree':
                showBreathingStyles();
                break;
            case 'status':
                showStatus();
                break;
            case 'legend':
                showLegend();
                break;
        }
    }
    if (descriptionSubmenu && descriptionContent) {
        if (type !== 'inventory') {
            descriptionSubmenu.style.display = 'none';
            descriptionSubmenu.classList.remove('visible');
        }
    }
}

function showInventory() {
    if (submenu && submenuContent) {
        submenu.style.display = 'block';
        submenu.classList.add('visible');
        let inventoryHTML = '<div class="submenu-content">';
        inventory.forEach((item, index) => {
            inventoryHTML += `
                <div class="submenu-item" data-item="${item}" data-index="${index}">
                    ${item}
                </div>
            `;
        });
        inventoryHTML += `<button id="sort-btn">Sort</button></div>`;
        submenuContent.innerHTML = inventoryHTML;

        document.querySelectorAll('.submenu-item').forEach(item => {
            const selectedItem = item.getAttribute('data-item');
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                descriptionSubmenu.style.display = 'block';
                descriptionSubmenu.classList.add('visible');
                descriptionContent.innerHTML = `
                    <div class="description-content">
                        <p>${itemDescriptions[selectedItem] || 'No description available'}</p>
                    </div>
                    <div class="description-actions">
                        ${selectedItem !== 'Empty' ? `
                            ${selectedItem === 'Potion' || selectedItem === 'Demon Slayer Mark' ? '<button id="use-btn">Use</button>' : ''}
                            ${selectedItem.startsWith('Demon') || selectedItem.includes('Blade') || selectedItem === 'Demon Slayer Mark' ? '<button id="equip-btn">Equip</button>' : ''}
                            <button id="drop-btn">Drop</button>
                        ` : ''}
                    </div>
                `;

                document.getElementById('use-btn')?.addEventListener('click', () => {
                    useItem(selectedItem);
                    descriptionSubmenu.style.display = 'none';
                    descriptionSubmenu.classList.remove('visible');
                    refreshSubmenu('inventory');
                }, { once: true });

                document.getElementById('equip-btn')?.addEventListener('click', () => {
                    equipItem(selectedItem);
                    descriptionSubmenu.style.display = 'none';
                    descriptionSubmenu.classList.remove('visible');
                    refreshSubmenu('inventory');
                }, { once: true });

                document.getElementById('drop-btn')?.addEventListener('click', () => {
                    dropItem(selectedItem);
                    descriptionSubmenu.style.display = 'none';
                    descriptionSubmenu.classList.remove('visible');
                    refreshSubmenu('inventory');
                }, { once: true });
            }, { once: true });
        });

        document.getElementById('sort-btn')?.addEventListener('click', () => {
            sortInventory();
        }, { once: true });

        submenu.querySelector('.close-btn')?.addEventListener('click', () => {
            submenu.style.display = 'none';
            submenu.classList.remove('visible');
            descriptionSubmenu.style.display = 'none';
            descriptionSubmenu.classList.remove('visible');
        }, { once: true });
    }
}

function showBreathingStyles() {
    if (submenu && submenuContent) {
        submenu.style.display = 'block';
        submenu.classList.add('visible');
        submenuContent.innerHTML = `
            <div class="submenu-content">
                <div class="submenu-item" data-item="Water Breathing: First Form">
                    Water Breathing: First Form (5 MP, 20 dmg)
                    <button id="use-breathing-btn">Use</button>
                </div>
            </div>
        `;
        document.getElementById('use-breathing-btn')?.addEventListener('click', () => {
            if (playerMP >= 5) {
                attackEnemy(playerX, playerY, true);
                refreshSubmenu('skill-tree');
            } else {
                alert('Not enough MP!');
            }
        }, { once: true });

        submenu.querySelector('.close-btn')?.addEventListener('click', () => {
            submenu.style.display = 'none';
            submenu.classList.remove('visible');
        }, { once: true });
    }
}

function showStatus() {
    if (submenu && submenuContent) {
        submenu.style.display = 'block';
        submenu.classList.add('visible');
        submenuContent.innerHTML = `
            <div class="submenu-content">
                <div class="status-content">
                    <p><strong>Status:</strong><br>
                    Name: Tanjiro & Nezuko<br>
                    Level: ${playerLevel}<br>
                    Tanjiro HP: ${playerHP}/100<br>
                    Nezuko HP: ${nezukoHP}/50<br>
                    MP: ${playerMP}/50<br>
                    Exp: ${playerExp}/${playerLevel * 100}<br>
                    <strong>Stats:</strong><br>
                    Strength: ${baseStats.strength + tanjiroEquipment.stats.attack}<br>
                    Agility: ${baseStats.agility + (tanjiroEquipment.stats.agility || 0) + (nezukoEquipment.stats.agility || 0)}<br>
                    Spirit: ${baseStats.spirit + (tanjiroEquipment.stats.spirit || 0) + (nezukoEquipment.stats.spirit || 0)}<br>
                    Defense: ${tanjiroEquipment.stats.defense + (nezukoEquipment.stats.defense || 0)}</p>
                </div>
                <div class="equipment-content">
                    <h3>Tanjiro Equipment</h3>
                    <button id="tanjiro-weapon-slot">${tanjiroEquipment.weapon || 'Empty'}</button>
                    <button id="tanjiro-armor-slot">${tanjiroEquipment.armor || 'Empty'}</button>
                    <button id="tanjiro-boots-slot">${tanjiroEquipment.boots || 'Empty'}</button>
                    <h3>Nezuko Equipment</h3>
                    <button id="nezuko-accessory-slot">${nezukoEquipment.accessory || 'Empty'}</button>
                </div>
            </div>
        `;
        document.getElementById('tanjiro-weapon-slot')?.addEventListener('click', () => unequipItem('tanjiro', 'weapon'), { once: true });
        document.getElementById('tanjiro-armor-slot')?.addEventListener('click', () => unequipItem('tanjiro', 'armor'), { once: true });
        document.getElementById('tanjiro-boots-slot')?.addEventListener('click', () => unequipItem('tanjiro', 'boots'), { once: true });
        document.getElementById('nezuko-accessory-slot')?.addEventListener('click', () => unequipItem('nezuko', 'accessory'), { once: true });

        submenu.querySelector('.close-btn')?.addEventListener('click', () => {
            submenu.style.display = 'none';
            submenu.classList.remove('visible');
        }, { once: true });
    }
}

function showLegend() {
    if (submenu && submenuContent) {
        submenu.style.display = 'block';
        submenu.classList.add('visible');
        submenuContent.innerHTML = `
            <div class="submenu-content">
                <p><strong>Map Legend:</strong><br>
                T - Tanjiro (You!)<br>
                E - Demon (Enemy)<br>
                S - Stairs (Exit)<br>
                R - Room (Loot?)<br>
                T - Trap (Danger!)<br>
                C - Corridor (Path)<br>
                [space] - Ground</p>
            </div>
        `;
        submenu.querySelector('.close-btn')?.addEventListener('click', () => {
            submenu.style.display = 'none';
            submenu.classList.remove('visible');
        }, { once: true });
    }
}

document.getElementById('inventory-btn')?.addEventListener('click', () => showInventory());
document.getElementById('skill-tree-btn')?.addEventListener('click', () => showBreathingStyles());
document.getElementById('status-btn')?.addEventListener('click', () => showStatus());
document.getElementById('legend-btn')?.addEventListener('click', () => showLegend());
document.getElementById('back-btn')?.addEventListener('click', () => {
    submenu.style.display = 'none';
    submenu.classList.remove('visible');
    descriptionSubmenu.style.display = 'none';
    descriptionSubmenu.classList.remove('visible');
});

document.getElementById('nezuko-avatar')?.addEventListener('click', () => nezukoProtect());
document.addEventListener('keydown', (e) => {
    if (e.key === 'n' || e.key === 'N') nezukoProtect();
    const oldX = playerX;
    const oldY = playerY;
    if (e.key === 'ArrowUp' && playerY > 0) playerY--;
    if (e.key === 'ArrowDown' && playerY < 9) playerY++;
    if (e.key === 'ArrowLeft' && playerX > 0) playerX--;
    if (e.key === 'ArrowRight' && playerX < 9) playerX++;
    if (dungeon[playerY][playerX] !== 'C') {
        if (attackEnemy(playerX, playerY, e.key === 'w' || e.key === 'W')) {
            playerX = oldX;
            playerY = oldY;
        } else {
            if (dungeon[playerY][playerX] === 'T') {
                if (nezukoHP > 0 && Math.random() < 0.7) {
                    nezukoHP = Math.max(0, nezukoHP - 10);
                } else {
                    playerHP = Math.max(0, playerHP - 10);
                }
            }
            dungeon[oldY][oldX] = ' ';
            dungeon[playerY][playerX] = '@';
        }
        moveEnemies();
        renderDungeon();
    } else {
        playerX = oldX;
        playerY = oldY;
    }
});

renderDungeon();