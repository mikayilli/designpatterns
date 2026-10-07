(function (DP) {
  const SIZES = ['S', 'M', 'L'];

  // The PizzaBuilder from the code samples: each step stores one choice and returns the
  // builder itself, so calls can be chained. Nothing is checked or created until build().
  function createPizzaBuilder() {
    let size = null;
    let thin = false;
    let sauce = false;
    const toppings = [];
    const calls = [];

    const builder = {
      size(s) {
        if (!SIZES.includes(s)) throw new RangeError(`size must be one of ${SIZES.join(', ')}`);
        size = s;
        calls.push(`size("${s}")`);
        return builder;
      },
      thinCrust() {
        thin = true;
        calls.push('thinCrust()');
        return builder;
      },
      extraSauce() {
        sauce = true;
        calls.push('extraSauce()');
        return builder;
      },
      build() {
        if (size === null) throw new Error('size is required');
        return Object.freeze({
          size,
          toppings: Object.freeze(toppings.slice()),
          thinCrust: thin,
          extraSauce: sauce,
        });
      },
      // the calls made so far, written like the code in the samples
      chain() {
        return ['new PizzaBuilder()', ...calls, 'build()'];
      },
    };

    const topping = (method, name) => {
      builder[method] = () => {
        if (!toppings.includes(name)) toppings.push(name);
        calls.push(`${method}()`);
        return builder;
      };
    };
    topping('addCheese', 'cheese');
    topping('addOlives', 'olives');
    topping('addMushrooms', 'mushrooms');
    topping('addPepperoni', 'pepperoni');

    return builder;
  }

  // choices: { size, cheese, olives, mushrooms, pepperoni, thinCrust, extraSauce } (booleans)
  function fromChoices(choices) {
    const builder = createPizzaBuilder().size(choices.size);
    if (choices.cheese) builder.addCheese();
    if (choices.olives) builder.addOlives();
    if (choices.mushrooms) builder.addMushrooms();
    if (choices.pepperoni) builder.addPepperoni();
    if (choices.thinCrust) builder.thinCrust();
    if (choices.extraSauce) builder.extraSauce();
    return builder;
  }

  // The "bad" way: one constructor with 7 positional parameters.
  function telescoping(choices) {
    const args = [
      `"${choices.size}"`,
      ...['cheese', 'olives', 'mushrooms', 'pepperoni', 'thinCrust', 'extraSauce'].map((k) => String(Boolean(choices[k]))),
    ];
    return `new Pizza(${args.join(', ')})`;
  }

  function describePizza(pizza) {
    const parts = [...pizza.toppings];
    if (pizza.thinCrust) parts.push('thin crust');
    if (pizza.extraSauce) parts.push('extra sauce');
    return `${pizza.size} pizza: ${parts.length ? parts.join(', ') : 'plain'}`;
  }

  DP.logic.builder = { SIZES, createPizzaBuilder, fromChoices, telescoping, describePizza };
})(window.DP);
