import './style.css';

const TOTAL_ITEMS = 400;
const VISIBLE_ROWS = 10;
const ITEM_HEIGHT = 144; // Measured height including margin/gap (adjust if needed)

const container = document.getElementById('app');

// Generate items
const items = Array.from({ length: TOTAL_ITEMS }, (_, i) => ({
    src: `https://picsum.photos/200/300?random=${i + 1}`,
    label: `Lorem ${i + 1}`,
    index: i + 1,
}));

// Create outer spacer that simulates full height
const spacer = document.createElement('div');
spacer.className = 'grid';
container.appendChild(spacer);

// Create absolutely positioned inner grid
const grid = document.createElement('div');
grid.className = 'grid';
grid.style.position = 'absolute';
container.appendChild(grid);

// --- Helper: Calculate items per row dynamically ---
function getItemsPerRow() {
    const sample = document.createElement('div');
    sample.className = 'grid-item';
    sample.style.visibility = 'hidden';
    grid.appendChild(sample);
    const itemWidth = sample.offsetWidth;
    grid.removeChild(sample);

    const containerWidth = container.clientWidth;
    return Math.floor(containerWidth / itemWidth);
}

// --- Setup pool ---
let pool = [];

function setupPool() {
    const itemsPerRow = getItemsPerRow();
    const visibleItems = itemsPerRow * VISIBLE_ROWS;

    // Clear existing
    grid.innerHTML = '';
    pool = [];

    for (let i = 0; i < visibleItems; i++) {
        const item = document.createElement('div');
        item.className = 'grid-item';
        grid.appendChild(item);
        pool.push(item);
    }

    // Set spacer height based on total items
    const totalRows = Math.ceil(TOTAL_ITEMS / itemsPerRow);
    spacer.style.height = `${totalRows * ITEM_HEIGHT}px`;
}

// --- Scroll handler ---
function update() {
    const itemsPerRow = getItemsPerRow();
    const scrollTop = container.scrollTop;
    const startRow = Math.floor(scrollTop / ITEM_HEIGHT);
    const startIndex = startRow * itemsPerRow;

    grid.style.top = `${startRow * ITEM_HEIGHT}px`;

    for (let i = 0; i < pool.length; i++) {
        const index = startIndex + i;
        const el = pool[i];

        if (index < TOTAL_ITEMS) {
            const { src, label } = items[index];
            el.innerHTML = `<img src="${src}" alt="${label}" width="96"><div>${label}</div>`;
            el.style.display = '';
        } else {
            el.style.display = 'none';
        }
    }
}

// Initialize
setupPool();
update();
container.addEventListener('scroll', update);

// Optional: re-calculate on resize
window.addEventListener('resize', () => {
    setupPool();
    update();
});

document.getElementById('button').addEventListener('click', (e) => {
    const indexToRemove = JSON.parse(document.getElementById('input').value);
    const index = items.findIndex((el) => el.index === indexToRemove);

    if (-1 !== index) {
        items.splice(index, 1);
        update();
    }

    document.getElementById('input').value = '';
});

container.scrollTop = 0;
