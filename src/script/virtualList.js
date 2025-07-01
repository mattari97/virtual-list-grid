/**
 * Creates a virtualized scroll list inside a container.
 *
 * @param {Object} config
 * @param {string} config.selector - CSS selector for the container element
 * @param {string} config.className - Class name applied to the inner content container
 * @param {number} config.itemsGap - Gap between items in pixels
 * @param {number} config.inlinePadding - Padding on left and right of the container
 * @param {Function} config.onCreateItem - Returns a new DOM element for a single item
 * @param {Function} config.onUpdateItem - Updates a DOM element with item data
 * @param {Function} config.onFilterItems - Returns a filtered array of items
 * @param {Function} config.onWasInitialized - Called once the virtual list is initialized
 *
 * @returns {{
 *   initializeLayout: Function,       // Call when the container size has changed
 *   refreshLayoutHeight: Function,    // Call when the number of items has changed
 *   updateVisibleItems: Function,     // Call when items themselves (but not their count) changed
 *   destroy: Function                 // Call to completely tear down the virtual list
 * }}
 */
export const createVirtualList = (config) => {
    if (typeof config !== 'object' || config === null) {
        throw new Error('Config must be a non-null object');
    }

    if (typeof config.selector !== 'string' || !document.querySelector(config.selector)) {
        throw new Error('Missing or invalid "selector" in config');
    }

    if (typeof config.className !== 'string') {
        throw new Error('"className" must be a string');
    }

    if (typeof config.itemsGap !== 'number' || !Number.isFinite(config.itemsGap)) {
        throw new Error('"itemsGap" must be a valid number');
    }

    if (typeof config.inlinePadding !== 'number' || !Number.isFinite(config.inlinePadding)) {
        throw new Error('"inlinePadding" must be a valid number');
    }

    if (typeof config.onCreateItem !== 'function') {
        throw new Error('"onCreateItem" must be a function');
    }

    if (typeof config.onUpdateItem !== 'function') {
        throw new Error('"onUpdateItem" must be a function');
    }

    if (typeof config.onFilterItems !== 'function') {
        throw new Error('"onFilterItems" must be a function');
    }

    if (typeof config.onWasInitialized !== 'function') {
        throw new Error('"onWasInitialized" must be a function');
    }

    let filteredItems = [];
    let itemHeight = 0;
    let itemsPerRow = 0;
    let pool = [];
    let poolRowCount = 0;
    let previousRow = 0;

    const container = document.querySelector(config.selector);

    const spacer = document.createElement('div');
    container.appendChild(spacer);

    const inner = document.createElement('div');
    inner.className = config.className ?? '';
    inner.style.position = 'absolute';
    container.appendChild(inner);

    const setup = () => {
        const { width, height } = container.getBoundingClientRect();
        const item = config.onCreateItem();
        item.style.visibility = 'hidden';
        inner.appendChild(item);

        const itemDimensions = item.getBoundingClientRect();
        itemHeight = itemDimensions.height;

        const visibleRowCount = Math.ceil((height - config.itemsGap) / (itemHeight + config.itemsGap));
        poolRowCount = visibleRowCount + 3;

        const containerWidth = width - 2 * config.inlinePadding;
        const itemTotalWidth = itemDimensions.width + config.itemsGap;
        itemsPerRow = Math.floor((containerWidth + config.itemsGap) / itemTotalWidth);

        inner.removeChild(item);
    };

    const refreshLayoutHeight = () => {
        filteredItems = config.onFilterItems();
        const totalRows = Math.ceil(filteredItems.length / itemsPerRow);
        const spacerHeight = totalRows * itemHeight + (totalRows - 1) * config.itemsGap;
        spacer.style.height = `${spacerHeight}px`;

        updateVisibleItems();
    };

    const initializeLayout = () => {
        setup();
        const visibleItems = itemsPerRow * poolRowCount;

        inner.innerHTML = '';
        pool = [];

        for (let i = 0; i < visibleItems; i++) {
            const item = config.onCreateItem();
            inner.appendChild(item);
            pool.push(item);
        }

        refreshLayoutHeight();
    };

    const updateVisibleItems = (startRow = null) => {
        startRow ??= Math.floor(container.scrollTop / (itemHeight + config.itemsGap));
        previousRow = startRow;

        const offsetTop = 0 === startRow ? 0 : startRow * (itemHeight + config.itemsGap);
        inner.style.top = `${offsetTop}px`;

        const startIndex = startRow * itemsPerRow;
        for (let i = 0; i < pool.length; i++) {
            const index = startIndex + i;
            const item = pool[i];

            if (index >= filteredItems.length) {
                item.style.display = 'none';
                continue;
            }

            item.style.display = '';
            config.onUpdateItem(item, filteredItems[index]);
        }
    };

    const handleScroll = (e) => {
        const virtualList = e.currentTarget;
        if (!virtualList) return;

        const startRow = Math.floor(virtualList.scrollTop / (itemHeight + config.itemsGap));

        if (startRow !== previousRow) {
            updateVisibleItems(startRow);
        }
    };

    const destroy = () => {
        container.removeChild(spacer);
        container.removeChild(inner);
        container.removeEventListener('scroll', handleScroll);
    };

    initializeLayout();

    container.addEventListener('scroll', handleScroll);

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            initializeLayout();
            updateVisibleItems();
        }, 300);
    });

    config.onWasInitialized();

    return {
        refreshLayoutHeight,
        initializeLayout,
        updateVisibleItems,
        destroy,
    };
};
