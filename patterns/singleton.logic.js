(function (DP) {
  // A DatabaseConnection, as in the code samples. Each one gets a number so the demo
  // can show whether two variables point to the SAME connection or to different ones.
  function makeConnection(id) {
    return {
      id,
      query(sql) {
        if (typeof sql !== 'string' || sql.trim() === '') throw new TypeError('sql must be a non-empty string');
        return `connection #${id} ran: ${sql}`;
      },
    };
  }

  // The "bad" way: plain `new DatabaseConnection()` every time something needs the database.
  function createNaive() {
    let created = 0;
    return {
      open() {
        created += 1;
        return makeConnection(created);
      },
      created() {
        return created;
      },
    };
  }

  // The Singleton: the connection is created on the first getInstance() call and reused.
  // tryNew() stands for `new DatabaseConnection()` from outside: the constructor is private.
  function createSingleton() {
    let instance = null;
    let created = 0;
    return {
      getInstance() {
        if (instance === null) {
          created += 1;
          instance = makeConnection(created);
        }
        return instance;
      },
      tryNew() {
        throw new Error('DatabaseConnection constructor is private, use getInstance()');
      },
      created() {
        return created;
      },
    };
  }

  DP.logic.singleton = { createNaive, createSingleton };
})(window.DP);
