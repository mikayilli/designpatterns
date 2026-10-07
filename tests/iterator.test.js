module.exports = (test, assert, DP) => {
  const { createListCollection, createTreeCollection, makeNode, printAll } = DP.logic.iterator;

  const tree = () =>
    makeNode('Photos', [
      makeNode('Trip', [makeNode('Beach'), makeNode('Hotel')]),
      makeNode('Family', [makeNode('Mom'), makeNode('Dad')]),
    ]);

  test('list iterator returns items in order', () => {
    const it = createListCollection(['a', 'b', 'c']).createIterator();
    assert.strictEqual(it.hasNext(), true);
    assert.strictEqual(it.next(), 'a');
    assert.strictEqual(it.next(), 'b');
    assert.strictEqual(it.next(), 'c');
    assert.strictEqual(it.hasNext(), false);
  });

  test('next() after the end throws', () => {
    const it = createListCollection(['a']).createIterator();
    it.next();
    assert.throws(() => it.next(), /no more elements/);
  });

  test('an empty list has nothing to iterate', () => {
    const it = createListCollection([]).createIterator();
    assert.strictEqual(it.hasNext(), false);
    assert.throws(() => it.next(), Error);
  });

  test('tree iterator visits parent first, then children left to right', () => {
    const it = createTreeCollection(tree()).createIterator();
    const seen = [];
    while (it.hasNext()) seen.push(it.next());
    assert.deepStrictEqual(seen, ['Photos', 'Trip', 'Beach', 'Hotel', 'Family', 'Mom', 'Dad']);
  });

  test('the same printAll works for a list and for a tree', () => {
    assert.deepStrictEqual(printAll(createListCollection([1, 2, 3])), [1, 2, 3]);
    assert.strictEqual(printAll(createTreeCollection(tree())).length, 7);
  });

  test('printAll sends each element to the given log function', () => {
    const got = [];
    printAll(createListCollection(['x', 'y']), (v) => got.push(v));
    assert.deepStrictEqual(got, ['x', 'y']);
  });

  test('every createIterator() call starts a fresh, independent walk', () => {
    const col = createListCollection(['a', 'b', 'c']);
    const one = col.createIterator();
    const two = col.createIterator();
    one.next();
    one.next();
    assert.strictEqual(two.next(), 'a');
    assert.strictEqual(one.next(), 'c');
  });

  test('a single-node tree has one element', () => {
    assert.deepStrictEqual(printAll(createTreeCollection(makeNode('only'))), ['only']);
  });

  test('the list collection copies its input so outside changes do not leak in', () => {
    const src = ['a', 'b'];
    const col = createListCollection(src);
    src.push('c');
    assert.deepStrictEqual(printAll(col), ['a', 'b']);
  });

  test('validation: list needs an array, tree needs a node, node needs children array', () => {
    assert.throws(() => createListCollection('abc'), TypeError);
    assert.throws(() => createTreeCollection(null), TypeError);
    assert.throws(() => createTreeCollection({}), TypeError);
    assert.throws(() => makeNode('x', 'not-array'), TypeError);
    assert.throws(() => printAll({}), TypeError);
  });
};
