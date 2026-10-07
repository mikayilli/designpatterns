(function (DP) {
  function makeNode(value, children) {
    const kids = children === undefined ? [] : children;
    if (!Array.isArray(kids)) throw new TypeError('children must be an array of nodes');
    return { value, children: kids };
  }

  // ListCollection: backed by an array. Its iterator remembers an index.
  function createListCollection(items) {
    if (!Array.isArray(items)) throw new TypeError('items must be an array');
    const data = items.slice();
    return {
      createIterator() {
        let index = 0;
        return {
          hasNext: () => index < data.length,
          next() {
            if (index >= data.length) throw new Error('no more elements');
            index += 1;
            return data[index - 1];
          },
        };
      },
    };
  }

  // TreeCollection: backed by linked nodes. Its iterator remembers a stack of nodes still to visit.
  // Order: a parent first, then its children from left to right.
  function createTreeCollection(root) {
    if (!root || typeof root !== 'object' || !Array.isArray(root.children)) {
      throw new TypeError('root must be a node made with makeNode()');
    }
    return {
      createIterator() {
        const stack = [root];
        return {
          hasNext: () => stack.length > 0,
          next() {
            if (stack.length === 0) throw new Error('no more elements');
            const node = stack.pop();
            for (let i = node.children.length - 1; i >= 0; i -= 1) stack.push(node.children[i]);
            return node.value;
          },
        };
      },
    };
  }

  // The client: it works with ANY collection, because it only uses hasNext() / next().
  function printAll(collection, log) {
    if (!collection || typeof collection.createIterator !== 'function') {
      throw new TypeError('collection must have createIterator()');
    }
    const out = [];
    const it = collection.createIterator();
    while (it.hasNext()) {
      const value = it.next();
      out.push(value);
      if (typeof log === 'function') log(value);
    }
    return out;
  }

  DP.logic.iterator = { makeNode, createListCollection, createTreeCollection, printAll };
})(window.DP);
