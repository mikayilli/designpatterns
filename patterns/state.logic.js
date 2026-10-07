(function (DP) {
  const STATES = ['new', 'paid', 'shipped', 'delivered', 'cancelled'];
  const ACTIONS = ['pay', 'ship', 'deliver', 'cancel'];

  // One object per state. Each state lists ONLY the actions it allows and
  // says which state comes next. An action that is missing is not allowed.
  const STATE_OBJECTS = {
    new: { name: 'NewState', pay: 'paid', cancel: 'cancelled' },
    paid: { name: 'PaidState', ship: 'shipped', cancel: 'cancelled' },
    shipped: { name: 'ShippedState', deliver: 'delivered' },
    delivered: { name: 'DeliveredState' },
    cancelled: { name: 'CancelledState' },
  };

  function createOrder() {
    let current = 'new';

    // The order has no if/else on the status: it asks the current state object.
    function act(action) {
      if (!ACTIONS.includes(action)) throw new TypeError(`unknown action: ${action}`);
      const state = STATE_OBJECTS[current];
      if (!state[action]) throw new Error(`Cannot ${action} an order in ${state.name}`);
      current = state[action];
    }

    const order = {
      getState() {
        return current;
      },
      getStateName() {
        return STATE_OBJECTS[current].name;
      },
      allowed() {
        return ACTIONS.filter((a) => STATE_OBJECTS[current][a]);
      },
      can(action) {
        if (!ACTIONS.includes(action)) throw new TypeError(`unknown action: ${action}`);
        return Boolean(STATE_OBJECTS[current][action]);
      },
      perform: act,
    };
    ACTIONS.forEach((a) => {
      order[a] = () => act(a);
    });
    return order;
  }

  DP.logic.state = { createOrder, STATES, ACTIONS };
})(window.DP);
