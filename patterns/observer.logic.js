(function (DP) {
  function createSubject() {
    const observers = [];
    const subject = {
      subscribe(fn) {
        if (typeof fn !== 'function') throw new TypeError('observer must be a function');
        if (!observers.includes(fn)) observers.push(fn);
        return () => subject.unsubscribe(fn);
      },
      unsubscribe(fn) {
        const i = observers.indexOf(fn);
        if (i !== -1) observers.splice(i, 1);
      },
      notify(data) {
        // iterate a copy so observers may unsubscribe while being notified
        observers.slice().forEach((fn) => fn(data));
      },
      count() {
        return observers.length;
      },
    };
    return subject;
  }

  // The WeatherStation from the code samples: it stores the temperature and a list of
  // listeners, and only knows how to call them with the new value.
  function createStation(initial) {
    const subject = createSubject();
    let temperature = initial;
    return {
      subscribe: subject.subscribe,
      unsubscribe: subject.unsubscribe,
      count: subject.count,
      getTemperature() {
        return temperature;
      },
      setTemperature(t) {
        if (typeof t !== 'number' || Number.isNaN(t)) throw new TypeError('temperature must be a number');
        temperature = t;
        subject.notify(t);
      },
    };
  }

  DP.logic.observer = { createSubject, createStation };
})(window.DP);
