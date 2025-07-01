import '../css/style.css';
import { createVirtualList } from './virtualList';
let showSelected = false;

const items = Array.from({ length: 200 }, (_, i) => ({
    src: `https://picsum.photos/200/300?random=${i + 1}`,
    label: `Lorem ${i + 1}`,
    pageIndex: i + 1,
    selected: i % 3 === 0,
}));

const onCreateItem = () => {
    const $item = document.createElement('div');
    $item.className = 'grid-item';

    const $imgContainer = document.createElement('div');
    $imgContainer.classList.add('img-container');

    const $img = document.createElement('img');
    $img.classList.add('img');
    $img.src = '';

    $imgContainer.appendChild($img);

    const $label = document.createElement('div');
    $label.classList.add('label');

    $item.appendChild($imgContainer);
    $item.appendChild($label);
    return $item;
};

const onUpdateItem = ($item, data) => {
    $item.querySelector('.img').src = data.src;
    $item.querySelector('.label').textContent = data.label;
    $item.classList.toggle('selected', data.selected);
    $item.dataset.index = data.pageIndex;
};

const onFilterItems = () => {
    return showSelected ? items.filter((item) => item.selected) : items;
};

const config = {
    selector: '#app',
    items: items,
    itemsGap: 16,
    className: 'grid',
    bufferCount: 2,
    onCreateItem,
    onUpdateItem,
    onFilterItems,
};

const virtualList = createVirtualList(config);

document.querySelectorAll('.grid-item').forEach((item) => {
    item.addEventListener('click', (e) => {
        const index = JSON.parse(e.currentTarget.dataset.index);
        const item = items.find((item) => item.pageIndex === index);

        if (item) {
            item.selected = !item.selected;

            if (showSelected) {
                virtualList.refreshSpacer();
            }

            virtualList.updatePool();
        }
    });
});

document.getElementById('button2').addEventListener('click', () => {
    showSelected = !showSelected;
    virtualList.refreshSpacer();
    virtualList.updatePool();
});
