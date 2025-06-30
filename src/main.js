import './style.css';
let showSelected = false;
const TOTAL_ITEMS = 400;
const VISIBLE_ROWS = 10;
const ITEM_HEIGHT = 144; // Measured height including margin/gap (adjust if needed)

const container = document.getElementById('app');

// Generate items
const items = Array.from({ length: TOTAL_ITEMS }, (_, i) => ({
    src: `https://picsum.photos/200/300?random=${i + 1}`,
    label: `Lorem ${i + 1}`,
    pageIndex: i + 1,
    selected: false,
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

    const containerWidth = container.clientWidth - 32;
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
        item.addEventListener('click', (e) => {
            const index = JSON.parse(e.currentTarget.dataset.index);
            const itemIndex = items.findIndex((item) => item.pageIndex === index);

            if (-1 !== itemIndex) {
                const item = items[itemIndex];
                items[itemIndex].selected = !item.selected;
                update();
            }
        });
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
    console.log(itemsPerRow);
    const scrollTop = container.scrollTop;
    const startRow = Math.floor(scrollTop / ITEM_HEIGHT);
    const startIndex = startRow * itemsPerRow;

    grid.style.top = `${startRow * ITEM_HEIGHT}px`;

    const filteredItems = showSelected ? items.filter((item) => item.selected) : items;
    const totalItems = showSelected ? filteredItems.length : TOTAL_ITEMS;

    for (let i = 0; i < pool.length; i++) {
        const index = startIndex + i;
        const el = pool[i];

        if (index < totalItems) {
            const { src, label, selected, pageIndex } = filteredItems[index];
            el.innerHTML = `<img src="${src}" alt="${label}" width="96"><div>${label}</div>`;
            el.style.display = '';
            el.classList.toggle('selected', selected);
            el.dataset.index = pageIndex;
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

document.getElementById('button').addEventListener('click', () => {
    const indexToRemove = JSON.parse(document.getElementById('input').value);
    const index = items.findIndex((el) => el.pageIndex === indexToRemove);

    if (-1 !== index) {
        items.splice(index, 1);
        update();
    }

    document.getElementById('input').value = '';
});

document.getElementById('button2').addEventListener('click', () => {
    showSelected = !showSelected;
    update();
});

container.scrollTop = 0;
