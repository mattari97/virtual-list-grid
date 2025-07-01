export const createVirtualList = (config) => {
    let filteredItems = [];
    let itemHeight = 0;
    let itemsPerRow = 0;
    let pool = [];
    let poolRowCount = 0;
    let previousRow = 0;

    const $container = document.querySelector(config.selector);

    const $spacer = document.createElement('div');
    $container.appendChild($spacer);

    const $inner = document.createElement('div');
    $inner.className = config.className;
    $inner.style.position = 'absolute';
    $container.appendChild($inner);

    const setup = () => {
        const { clientWidth, clientHeight } = $container;
        const $item = config.onCreateItem();
        $item.style.visibility = 'hidden';
        $inner.appendChild($item);

        itemHeight = $item.offsetHeight;

        const visibleRowCount = Math.ceil(clientHeight / (itemHeight + config.itemsGap - config.itemsGap));
        poolRowCount = visibleRowCount + 3;

        const containerWidth = clientWidth - 2 * config.itemsGap;
        itemsPerRow = Math.floor(containerWidth / $item.offsetWidth);

        $inner.removeChild($item);
    };

    const refreshSpacer = () => {
        filteredItems = config.onFilterItems();
        const totalRows = Math.ceil(filteredItems.length / itemsPerRow);
        const spacerHeight = totalRows * itemHeight + (totalRows - 1) * config.itemsGap;
        $spacer.style.height = `${spacerHeight}px`;
    };

    const setupPool = () => {
        setup();
        const visibleItems = itemsPerRow * poolRowCount;

        $inner.innerHTML = '';
        pool = [];

        for (let i = 0; i < visibleItems; i++) {
            const $item = config.onCreateItem();
            $inner.appendChild($item);
            pool.push($item);
        }

        refreshSpacer();
    };

    const updatePool = (startRow = null) => {
        startRow ??= Math.floor($container.scrollTop / (itemHeight + config.itemsGap));
        previousRow = startRow;

        const offsetTop = 0 === startRow ? 0 : startRow * (itemHeight + config.itemsGap);
        $inner.style.top = `${offsetTop}px`;

        const startIndex = startRow * itemsPerRow;
        for (let i = 0; i < pool.length; i++) {
            const index = startIndex + i;
            const $item = pool[i];

            if (index >= filteredItems.length) {
                $item.style.display = 'none';
                continue;
            }

            $item.style.display = '';
            config.onUpdateItem($item, filteredItems[index]);
        }
    };

    const handleScroll = (e) => {
        const $virtualList = e.currentTarget;
        if (!$virtualList) return;

        const startRow = Math.floor($virtualList.scrollTop / (itemHeight + config.itemsGap));

        if (startRow !== previousRow) {
            updatePool(startRow);
        }
    };

    const destroy = () => {
        $container.innerHTML = '';
    };

    setupPool();
    updatePool();

    $container.addEventListener('scroll', handleScroll);

    window.addEventListener('resize', () => {
        setupPool();
        updatePool();
    });

    return {
        refreshSpacer,
        setupPool,
        updatePool,
        destroy,
    };
};
