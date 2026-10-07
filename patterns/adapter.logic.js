(function (DP) {
  const KINDS = ['celsius', 'fahrenheit'];

  const assertNumber = (n, what) => {
    if (typeof n !== 'number' || Number.isNaN(n)) throw new TypeError(`${what} must be a number`);
  };
  const round1 = (n) => Math.round(n * 10) / 10;

  function fahrenheitToCelsius(f) {
    assertNumber(f, 'fahrenheit');
    return round1(((f - 32) * 5) / 9);
  }

  function celsiusToFahrenheit(c) {
    assertNumber(c, 'celsius');
    return round1((c * 9) / 5 + 32);
  }

  // The third-party / legacy class: it only offers readFahrenheit().
  function createFahrenheitSensor(f) {
    assertNumber(f, 'fahrenheit');
    return { readFahrenheit: () => f };
  }

  // A sensor that already speaks the app's language: celsius().
  function createCelsiusSensor(c) {
    assertNumber(c, 'celsius');
    return { celsius: () => c };
  }

  // The Adapter: gives the app the celsius() it expects on top of readFahrenheit().
  // `log` (optional) receives one line per step so a demo can show the translation.
  function createTemperatureAdapter(sensor, log) {
    if (!sensor || typeof sensor.readFahrenheit !== 'function') {
      throw new TypeError('sensor must have a readFahrenheit() method');
    }
    const say = typeof log === 'function' ? log : () => {};
    return {
      celsius() {
        const f = sensor.readFahrenheit();
        say(`sensor.readFahrenheit() = ${f}`);
        const c = fahrenheitToCelsius(f);
        say(`(${f} - 32) * 5 / 9 = ${c}`);
        return c;
      },
    };
  }

  // The same idea the other way round: fahrenheit() on top of celsius().
  function createReverseAdapter(sensor, log) {
    if (!sensor || typeof sensor.celsius !== 'function') {
      throw new TypeError('sensor must have a celsius() method');
    }
    const say = typeof log === 'function' ? log : () => {};
    return {
      fahrenheit() {
        const c = sensor.celsius();
        say(`sensor.celsius() = ${c}`);
        const f = celsiusToFahrenheit(c);
        say(`${c} * 9 / 5 + 32 = ${f}`);
        return f;
      },
    };
  }

  // Plug = what the sensor offers, socket = what the app expects.
  // withAdapter = whether an Adapter is placed between them.
  function connect(plug, socket, withAdapter) {
    if (!KINDS.includes(plug)) throw new RangeError(`unknown plug: ${plug}`);
    if (!KINDS.includes(socket)) throw new RangeError(`unknown socket: ${socket}`);
    const unit = socket === 'celsius' ? 'C' : 'F';
    const sensor = plug === 'celsius' ? createCelsiusSensor(25) : createFahrenheitSensor(77);
    const lines = [];
    const log = (l) => lines.push(l);

    if (plug === socket) {
      const value = plug === 'celsius' ? sensor.celsius() : sensor.readFahrenheit();
      lines.push(plug === 'celsius' ? `sensor.celsius() = ${value}` : `sensor.readFahrenheit() = ${value}`);
      return { ok: true, via: withAdapter ? 'adapter' : 'direct', needless: Boolean(withAdapter), value, unit, lines };
    }
    if (!withAdapter) return { ok: false, via: null, needless: false, value: null, unit, lines };

    const value =
      socket === 'celsius' ? createTemperatureAdapter(sensor, log).celsius() : createReverseAdapter(sensor, log).fahrenheit();
    return { ok: true, via: 'adapter', needless: false, value, unit, lines };
  }

  DP.logic.adapter = {
    KINDS,
    fahrenheitToCelsius,
    celsiusToFahrenheit,
    createFahrenheitSensor,
    createCelsiusSensor,
    createTemperatureAdapter,
    createReverseAdapter,
    connect,
  };
})(window.DP);
