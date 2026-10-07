(function (DP) {
  const diagram = `<svg viewBox="0 0 520 220" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-iterator" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0L10 5L0 10z" class="d-arrow"/>
    </marker>
  </defs>
  <rect class="d-box" x="15" y="75" width="120" height="70" rx="8"/>
  <text class="d-text" x="75" y="105" text-anchor="middle">Client</text>
  <text class="d-sub" x="75" y="125" text-anchor="middle">one simple loop</text>
  <path class="d-line" d="M135 110 L195 110" marker-end="url(#arr-iterator)"/>
  <text class="d-sub" x="165" y="102" text-anchor="middle">next()</text>
  <rect class="d-box-accent" x="195" y="75" width="130" height="70" rx="8"/>
  <text class="d-text" x="260" y="105" text-anchor="middle">Iterator</text>
  <text class="d-sub" x="260" y="125" text-anchor="middle">hasNext() · next()</text>
  <path class="d-line" d="M375 50 L325 95" marker-end="url(#arr-iterator)"/>
  <path class="d-line" d="M375 170 L325 125" marker-end="url(#arr-iterator)"/>
  <text class="d-sub" x="372" y="108" text-anchor="middle">creates</text>
  <rect class="d-box" x="375" y="22" width="130" height="55" rx="8"/>
  <text class="d-text" x="440" y="46" text-anchor="middle">ListCollection</text>
  <text class="d-sub" x="440" y="64" text-anchor="middle">array inside</text>
  <rect class="d-box" x="375" y="143" width="130" height="55" rx="8"/>
  <text class="d-text" x="440" y="167" text-anchor="middle">TreeCollection</text>
  <text class="d-sub" x="440" y="185" text-anchor="middle">nodes inside</text>
</svg>`;

  const code = {
    bad: {
      js: String.raw`const playlist = ['Beach', 'Hotel', 'Mom'];                 // an array
const folder = { name: 'Photos', children: [                  // a tree
  { name: 'Trip', children: [{ name: 'Beach', children: [] }] },
  { name: 'Family', children: [] },
] };

// the client must know HOW each collection is built
for (let i = 0; i < playlist.length; i++) {
  console.log(playlist[i]);
}

function printFolder(node) {          // different code for the tree
  console.log(node.name);
  for (const child of node.children) printFolder(child);
}
printFolder(folder);`,
      java: String.raw`String[] playlist = {"Beach", "Hotel", "Mom"};   // an array
TreeNode folder = buildFolderTree();               // a tree

// the client must know HOW each collection is built
for (int i = 0; i < playlist.length; i++) {
    System.out.println(playlist[i]);
}

void printFolder(TreeNode node) {                  // different code for the tree
    System.out.println(node.name);
    for (TreeNode child : node.children) printFolder(child);
}
printFolder(folder);`,
      cpp: String.raw`#include <iostream>
#include <string>
#include <vector>

struct Node {
    std::string name;
    std::vector<Node> children;
};

// different code for the tree
void printFolder(const Node& node) {
    std::cout << node.name << '\n';
    for (const Node& child : node.children) printFolder(child);
}

int main() {
    std::vector<std::string> playlist = {"Beach", "Hotel", "Mom"};   // an array
    Node folder{"Photos", {{"Trip", {{"Beach", {}}}}, {"Family", {}}}};   // a tree

    // the client must know HOW each collection is built
    for (size_t i = 0; i < playlist.size(); i++) {
        std::cout << playlist[i] << '\n';
    }
    printFolder(folder);
}`,
      php: String.raw`<?php
$playlist = ['Beach', 'Hotel', 'Mom'];                       // an array
$folder = ['name' => 'Photos', 'children' => [               // a tree
    ['name' => 'Trip', 'children' => [['name' => 'Beach', 'children' => []]]],
    ['name' => 'Family', 'children' => []],
]];

// the client must know HOW each collection is built
for ($i = 0; $i < count($playlist); $i++) {
    echo $playlist[$i], "\n";
}

function printFolder(array $node): void   // different code for the tree
{
    echo $node['name'], "\n";
    foreach ($node['children'] as $child) {
        printFolder($child);
    }
}
printFolder($folder);`,
    },
    good: {
      js: String.raw`class ListCollection {
  #items;
  constructor(items) { this.#items = [...items]; }

  *[Symbol.iterator]() {            // walks an array
    for (const item of this.#items) yield item;
  }
}

class TreeCollection {
  constructor(root) { this.root = root; }

  *[Symbol.iterator]() {            // walks nodes: a parent first, then its children
    const stack = [this.root];
    while (stack.length > 0) {
      const node = stack.pop();
      stack.push(...[...node.children].reverse());
      yield node.name;
    }
  }
}

// ONE client loop works for any collection (for...of keeps calling next() for us)
function printAll(collection) {
  for (const item of collection) console.log(item);
}

printAll(new ListCollection(['Beach', 'Hotel', 'Mom']));
printAll(new TreeCollection(folder));`,
      java: String.raw`import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Iterator;
import java.util.List;
import java.util.NoSuchElementException;

class ListCollection<T> implements Iterable<T> {
    private final List<T> items;

    ListCollection(List<T> items) { this.items = List.copyOf(items); }

    public Iterator<T> iterator() { return items.iterator(); }   // walks a list
}

class TreeCollection implements Iterable<String> {
    private final TreeNode root;

    TreeCollection(TreeNode root) { this.root = root; }

    public Iterator<String> iterator() {        // walks nodes: a parent first, then its children
        Deque<TreeNode> stack = new ArrayDeque<>();
        stack.push(root);
        return new Iterator<>() {
            public boolean hasNext() { return !stack.isEmpty(); }

            public String next() {
                if (stack.isEmpty()) throw new NoSuchElementException();
                TreeNode node = stack.pop();
                for (int i = node.children.size() - 1; i >= 0; i--) stack.push(node.children.get(i));
                return node.name;
            }
        };
    }
}

// ONE client loop works for any collection
static void printAll(Iterable<?> collection) {
    for (Object item : collection) System.out.println(item);
}`,
      cpp: String.raw`#include <iostream>
#include <string>
#include <vector>

struct Node {
    std::string name;
    std::vector<Node> children;
};

class ListIterator {
    const std::vector<std::string>& items;
    size_t index = 0;

public:
    explicit ListIterator(const std::vector<std::string>& v) : items(v) {}
    bool hasNext() const { return index < items.size(); }
    std::string next() { return items[index++]; }
};

class TreeIterator {
    std::vector<const Node*> stack;   // nodes still to visit

public:
    explicit TreeIterator(const Node& root) : stack{&root} {}
    bool hasNext() const { return !stack.empty(); }
    std::string next() {              // a parent first, then its children
        const Node* node = stack.back();
        stack.pop_back();
        for (auto it = node->children.rbegin(); it != node->children.rend(); ++it) stack.push_back(&*it);
        return node->name;
    }
};

// ONE client loop works for any iterator
template <class Iter>
void printAll(Iter it) {
    while (it.hasNext()) std::cout << it.next() << '\n';
}

// printAll(ListIterator(playlist));
// printAll(TreeIterator(folder));`,
      php: String.raw`<?php
class ListCollection implements IteratorAggregate
{
    public function __construct(private array $items) {}

    public function getIterator(): Iterator   // walks an array
    {
        return new ArrayIterator($this->items);
    }
}

class TreeCollection implements IteratorAggregate
{
    public function __construct(private array $root) {}

    public function getIterator(): Generator   // walks nodes: a parent first, then its children
    {
        $stack = [$this->root];
        while ($stack) {
            $node = array_pop($stack);
            foreach (array_reverse($node['children']) as $child) {
                $stack[] = $child;
            }
            yield $node['name'];
        }
    }
}

// ONE client loop works for any collection (foreach keeps calling next() for us)
function printAll(iterable $collection): void
{
    foreach ($collection as $item) {
        echo $item, "\n";
    }
}

printAll(new ListCollection(['Beach', 'Hotel', 'Mom']));
printAll(new TreeCollection($folder));`,
    },
    // a custom iterator written for a plain array, where for...of / foreach already does the job
    overkill: {
      js: String.raw`// A plain array of prices: the language already knows how to walk it,
// but a custom iterator class was written anyway
class PriceIterator {
  #prices;
  #index = 0;
  constructor(prices) { this.#prices = prices; }
  hasNext() { return this.#index < this.#prices.length; }
  next() { return this.#prices[this.#index++]; }
}

const prices = [5, 12, 8];
const it = new PriceIterator(prices);
let total = 0;
while (it.hasNext()) total += it.next();
console.log(total);   // 25`,
      java: String.raw`import java.util.List;

// A plain list of prices: the language already knows how to walk it,
// but a custom iterator class was written anyway
class PriceIterator {
    private final List<Integer> prices;
    private int index = 0;

    PriceIterator(List<Integer> prices) { this.prices = prices; }

    boolean hasNext() { return index < prices.size(); }
    int next() { return prices.get(index++); }
}

// usage
List<Integer> prices = List.of(5, 12, 8);
PriceIterator it = new PriceIterator(prices);
int total = 0;
while (it.hasNext()) total += it.next();
System.out.println(total);   // 25`,
      cpp: String.raw`#include <iostream>
#include <vector>

// A plain vector of prices: the language already knows how to walk it,
// but a custom iterator class was written anyway
class PriceIterator {
    const std::vector<int>& prices;
    size_t index = 0;

public:
    explicit PriceIterator(const std::vector<int>& p) : prices(p) {}
    bool hasNext() const { return index < prices.size(); }
    int next() { return prices[index++]; }
};

int main() {
    std::vector<int> prices = {5, 12, 8};
    PriceIterator it(prices);
    int total = 0;
    while (it.hasNext()) total += it.next();
    std::cout << total << '\n';   // 25
}`,
      php: String.raw`<?php
// A plain array of prices: the language already knows how to walk it,
// but a custom iterator class was written anyway
class PriceIterator
{
    private int $index = 0;

    public function __construct(private array $prices) {}

    public function hasNext(): bool { return $this->index < count($this->prices); }
    public function next(): int { return $this->prices[$this->index++]; }
}

$prices = [5, 12, 8];
$it = new PriceIterator($prices);
$total = 0;
while ($it->hasNext()) {
    $total += $it->next();
}
echo $total;   // 25`,
    },
    simple: {
      js: String.raw`const prices = [5, 12, 8];
let total = 0;
for (const price of prices) total += price;   // built-in loop, nothing to write
console.log(total);   // 25`,
      java: String.raw`import java.util.List;

List<Integer> prices = List.of(5, 12, 8);
int total = 0;
for (int price : prices) total += price;   // built-in for-each, nothing to write
System.out.println(total);   // 25`,
      cpp: String.raw`#include <iostream>
#include <vector>

int main() {
    std::vector<int> prices = {5, 12, 8};
    int total = 0;
    for (int price : prices) total += price;   // built-in range-for, nothing to write
    std::cout << total << '\n';   // 25
}`,
      php: String.raw`<?php
$prices = [5, 12, 8];
$total = 0;
foreach ($prices as $price) {
    $total += $price;   // built-in foreach, nothing to write
}
echo $total;   // 25`,
    },
  };

  DP.register({
    id: 'iterator',
    name: 'Iterator',
    category: 'behavioral',
    text: {
      az: {
        summary: `Kolleksiyanın içində nə olduğunu bilmədən, onun elementlərini bir-bir eyni üsulla gəzirsən.`,
        analogy: `Kitabın səhifələrini çevirmək kimi. Kitab qalın ola bilər, nazik ola bilər, ona fərq etmir: sən yalnız "növbəti səhifə" deyirsən. Kitabın necə tikildiyini və ya səhifələrin harada saxlandığını bilməyə ehtiyac yoxdur. Eyni "növbəti" hərəkəti musiqi siyahısında da, fotoalbomda da edirsən.`,
        problem: `Pis kodda iki kolleksiya var: massiv (playlist) və qovluq ağacı (folder). Müştəri kodu hər birinin necə qurulduğunu bilməlidir: massivi for döngüsü və indekslə, ağacı isə printFolder() funksiyası və rekursiya ilə gəzir. Üçüncü kolleksiya əlavə etsən (məsələn, əlaqəli siyahı), yenə yeni gəzmə kodu yazmalı olacaqsan. Bu kod proqramın bir çox yerində təkrarlanır. Kolleksiyanın daxili quruluşu dəyişəndə (məsələn, massiv ağaca çevrilsə) onu gəzən bütün yerlər sınır.`,
        solution: `Hər kolleksiya özü üçün gəzmə üsulunu hazırlayır. ListCollection massivi indekslə, TreeCollection isə düyünləri yığınla (stack) gəzir. Bu işi hər biri öz iteratorunda görür. Müştəri üçün isə hər ikisi eyni görünür: növbəti element varmı (hasNext()) və onu ver (next()). JavaScript və PHP-də bunu dil özü edir: for...of və foreach dövrü hər dəfə next() çağırır. Beləcə printAll() funksiyası yalnız bir dəfə yazılır və istənilən kolleksiya ilə işləyir. Kolleksiyanın içi dəyişsə, yalnız onun iteratoru dəyişir, müştəri kodu eyni qalır. Hər iterator öz yerini özü yadda saxlayır, ona görə eyni kolleksiyanı iki nəfər müstəqil gəzə bilər.`,
        usedIn: [
          `Dillərin for...of, foreach, for-each dövrləri: massiv, Set, Map kimi müxtəlif kolleksiyaları eyni sintaksislə gəzir.`,
          `Verilənlər bazasından nəticə oxumaq: sətirlər bir-bir gətirilir, bütün cədvəl yaddaşa yüklənmir.`,
          `Fayl sistemində qovluqları gəzmək: iç-içə qovluqlar bir-bir verilir, sən qovluq ağacının quruluşunu bilmirsən.`,
          `Səhifələmə (pagination): "Daha çox göstər" düyməsi növbəti hissəni gətirir, sanki növbəti elementi istəyirsən.`,
        ],
        avoid: `Kolleksiya adi massivdirsə, dilin hazır dövrü (for...of, foreach) kifayətdir. Öz iterator sinfini yazmaq yalnız kolleksiya özü qeyri-standart quruluşa malik olanda və ya xüsusi gəzmə qaydası lazım olanda mənalıdır.`,
        avoidWhen: [
          `Kolleksiya adi massiv və ya siyahıdır. Dilin hazır dövrü eyni işi görür.`,
          `Yalnız bir kolleksiya var və onu bir yerdə gəzirsən.`,
          `Kolleksiya çox kiçikdir (bir neçə element) və gələcəkdə də dəyişməyəcək.`,
          `Gəzərkən kolleksiyaya element əlavə edib silirsənsə. Hazır iteratorlar bunu çox vaxt icazə vermir (xəta atır), ona görə başqa üsul seç.`,
        ],
        overkillNote: `Lazımsız mürəkkəb kodda qiymətlər adi massivdədir. Dil onu for...of ilə artıq gəzə bilir. Buna baxmayaraq PriceIterator sinfi, indeks dəyişəni, hasNext() və next() yazılıb. Bu, düz yolda gedərkən özünə ayrıca xəritə çəkməyə bənzəyir. Sadə həll bir sətirdir. Əgər sabah qiymətlər ağacda və ya əlaqəli siyahıda saxlanılsa və eyni dövr hər ikisi ilə işləməlidirsə, öz iteratorun yerinə düşəcək.`,
      },
      en: {
        summary: `You walk through a collection's elements one by one, in the same way, without knowing what is inside it.`,
        analogy: `Like turning the pages of a book. The book can be thick or thin, it does not matter: you only say "next page". You do not need to know how the book was bound or where the pages are kept. You make the same "next" move in a music playlist and in a photo album.`,
        problem: `In the bad code there are two collections: an array (playlist) and a folder tree (folder). The client code must know how each one is built: it walks the array with a for loop and an index, and the tree with a printFolder() function and recursion. If you add a third collection (say, a linked list), you must write yet another walking code. This code is repeated in many places in the program. When the inside of a collection changes (say, an array becomes a tree), every place that walks it breaks.`,
        solution: `Each collection prepares its own way of walking. ListCollection walks the array with an index and TreeCollection walks the nodes with a stack. Each does this in its own iterator. For the client both look the same: is there a next element (hasNext()) and give it to me (next()). In JavaScript and PHP the language does this for you: the for...of and foreach loops call next() each time. So the printAll() function is written once and works with any collection. If the inside of a collection changes, only its iterator changes and the client code stays the same. Each iterator remembers its own position, so two people can walk the same collection independently.`,
        usedIn: [
          `The for...of, foreach and for-each loops of programming languages: they walk different collections such as arrays, Sets and Maps with the same syntax.`,
          `Reading a database result: rows are fetched one by one, the whole table is not loaded into memory.`,
          `Walking folders in a file system: nested folders are given one at a time and you do not need to know how the folder tree is built.`,
          `Pagination: a "Show more" button brings the next portion, as if you asked for the next element.`,
        ],
        avoid: `If the collection is a plain array, the language's built-in loop (for...of, foreach) is enough. Writing your own iterator class makes sense only when the collection has an unusual structure or you need a special walking order.`,
        avoidWhen: [
          `The collection is a plain array or list. The built-in loop does the same job.`,
          `There is only one collection and you walk it in one place.`,
          `The collection is very small (a few elements) and will not change.`,
          `You add or remove elements while walking. Built-in iterators often forbid this (they throw an error), so pick another approach.`,
        ],
        overkillNote: `In the over-complicated code the prices are in a plain array. The language can already walk it with for...of. Even so, a PriceIterator class, an index variable, hasNext() and next() were written. It is like drawing yourself a map while walking down a straight road. The simple solution is one line. If tomorrow the prices were kept in a tree or a linked list and the same loop must work with both, that is when your own iterator fits.`,
      },
    },
    diagram,
    diagramLabel: {
      az: 'Iterator diaqramı: Client hər kolleksiyanın yaratdığı Iterator-dan hasNext() və next() ilə elementləri alır',
      en: 'Iterator diagram: the Client takes elements with hasNext() and next() from the Iterator that each collection creates',
    },
    code,
    mount: (stage, lang) => DP.demos.iterator(stage, lang),
  });
})(window.DP);
