(function (DP) {
  // prices in qəpik (1 AZN = 100) so there are no floating-point surprises
  const EXTRAS = {
    milk: { label: 'Milk', cost: 50 },
    sugar: { label: 'Sugar', cost: 20 },
    cream: { label: 'Cream', cost: 70 },
    syrup: { label: 'Syrup', cost: 60 },
  };
  const BASE_COST = 300;

  // The plain Coffee: the object that gets wrapped.
  function createCoffee() {
    return {
      name: 'Coffee',
      inner: null,
      cost: () => BASE_COST,
      description: () => 'Coffee',
    };
  }

  // A decorator has the same cost()/description() as the drink it wraps,
  // calls the wrapped drink first, then adds its own bit.
  function createDecorator(kind, inner) {
    if (!Object.prototype.hasOwnProperty.call(EXTRAS, kind)) throw new RangeError(`unknown extra: ${kind}`);
    if (!inner || typeof inner.cost !== 'function' || typeof inner.description !== 'function') {
      throw new TypeError('inner must be a drink with cost() and description()');
    }
    const extra = EXTRAS[kind];
    return {
      name: extra.label,
      inner,
      cost: () => inner.cost() + extra.cost,
      description: () => `${inner.description()}, ${extra.label}`,
    };
  }

  // Layer names from the inside (Coffee) to the outside (last wrapper).
  function getLayers(drink) {
    const names = [];
    for (let d = drink; d; d = d.inner) names.unshift(d.name);
    return names;
  }

  // Classes needed if every combination of n extras were its own subclass.
  function subclassCount(n) {
    if (typeof n !== 'number') throw new TypeError('n must be a number');
    if (!Number.isInteger(n) || n < 0) throw new RangeError('n must be a whole number, 0 or more');
    return 2 ** n;
  }

  function formatPrice(cents) {
    if (typeof cents !== 'number' || Number.isNaN(cents)) throw new TypeError('price must be a number');
    return `${(cents / 100).toFixed(2)} AZN`;
  }

  DP.logic.decorator = { EXTRAS, createCoffee, createDecorator, getLayers, subclassCount, formatPrice };
})(window.DP);
