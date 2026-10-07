(function (DP) {
  const checkName = (name) => {
    if (typeof name !== 'string' || name.trim() === '') throw new TypeError('filename must be a non-empty string');
  };

  // Counters the demo shows: how many heavy loads really happened vs. how many times
  // display() was asked for.
  function createStats() {
    return { realLoads: 0, displayCalls: 0 };
  }

  // RealImage from the code samples: creating it is the expensive part ("downloads" the file).
  function createRealImage(filename, stats) {
    checkName(filename);
    if (!stats) throw new TypeError('stats is required');
    stats.realLoads += 1;
    return {
      display() {
        return `Showing ${filename}`;
      },
    };
  }

  // ImageProxy: same interface as RealImage (display()), but it creates the RealImage
  // only on the first allowed display() and reuses it afterwards.
  function createImageProxy(filename, options) {
    checkName(filename);
    const opts = options || {};
    const stats = opts.stats;
    if (!stats) throw new TypeError('stats is required');
    const canView = typeof opts.canView === 'function' ? opts.canView : () => true;
    const factory = typeof opts.factory === 'function' ? opts.factory : createRealImage;
    let real = null;
    return {
      filename,
      display() {
        if (!canView()) throw new Error(`access denied: ${filename}`);
        stats.displayCalls += 1;
        if (!real) real = factory(filename, stats);
        return real.display();
      },
      isLoaded() {
        return real !== null;
      },
    };
  }

  DP.logic.proxy = { createStats, createRealImage, createImageProxy };
})(window.DP);
