(function (DP) {
  const strategies = {
    post: (kg) => 3 + kg * 0.5,
    courier: (kg) => 6 + kg * 0.8,
    express: (kg) => 12 + kg * 1.5,
  };
  const STRATEGY_NAMES = Object.keys(strategies);

  function shippingPrice(name, kg) {
    if (!STRATEGY_NAMES.includes(name)) throw new Error(`Unknown strategy: ${name}`);
    if (!(kg >= 0)) throw new RangeError('kg must be a number >= 0');
    return Math.round(strategies[name](kg) * 100) / 100;
  }

  // An independent strategies registry, like the `strategies` map in the JS sample:
  // adding a new entry never touches the existing ones.
  function createShipping() {
    const own = { ...strategies };
    return {
      names: () => Object.keys(own),
      add(name, fn) {
        if (typeof fn !== 'function') throw new TypeError('strategy must be a function');
        if (Object.prototype.hasOwnProperty.call(own, name)) throw new Error(`Strategy already exists: ${name}`);
        own[name] = fn;
      },
      price(name, kg) {
        if (!Object.prototype.hasOwnProperty.call(own, name)) throw new Error(`Unknown strategy: ${name}`);
        if (!(kg >= 0)) throw new RangeError('kg must be a number >= 0');
        return Math.round(own[name](kg) * 100) / 100;
      },
    };
  }

  DP.logic.strategy = { shippingPrice, STRATEGY_NAMES, createShipping };
})(window.DP);
