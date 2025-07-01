# Virtual List

A minimal virtual list scroller for DOM-heavy lists. Supports dynamic filtering, resizing, and fast rendering via pooling.

## Usage

```js
import { createVirtualList } from './virtualList.js';

const virtual = createVirtualList({
    selector: '#list-container',
    className: 'list-inner',
    items: Array.from({ lenght: 5000 }, (_, i) => ({ name: `Item ${i + 1}` })),
    itemsGap: 12,
    inlinePadding: 16,
    onCreateItem: () => document.createElement('div'),
    onUpdateItem: (el, data) => {
        el.textContent = data.name;
    },
    onFilterItems: () => yourFilteredArray,
    onWasInitialized: () => console.log('List ready!'),
});
```
