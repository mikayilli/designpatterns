(function (DP) {
  const diagram = `<svg viewBox="0 0 520 210" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-decorator" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0L10 5L0 10z" class="d-arrow"/>
    </marker>
  </defs>
  <rect class="d-box" x="10" y="20" width="500" height="175" rx="10"/>
  <text class="d-text" x="30" y="46">MilkDecorator</text>
  <text class="d-sub" x="150" y="46">+ 0.50, adds ", Milk"</text>
  <rect class="d-box" x="40" y="62" width="440" height="120" rx="10"/>
  <text class="d-text" x="60" y="88">SugarDecorator</text>
  <text class="d-sub" x="190" y="88">+ 0.20, adds ", Sugar"</text>
  <rect class="d-box-accent" x="70" y="104" width="380" height="64" rx="10"/>
  <text class="d-text" x="90" y="130">Coffee</text>
  <text class="d-sub" x="90" y="150">3.00, "Coffee"</text>
  <path class="d-line" d="M450 24 L450 102" marker-end="url(#arr-decorator)"/>
  <text class="d-sub" x="510" y="14" text-anchor="end">cost() goes in, totals come back out</text>
</svg>`;

  const code = {
    bad: {
      js: String.raw`class Coffee {
  cost() { return 300; }
  description() { return 'Coffee'; }
}

// one subclass for every combination of extras...
class CoffeeWithMilk extends Coffee {
  cost() { return 350; }
  description() { return 'Coffee, Milk'; }
}
class CoffeeWithSugar extends Coffee {
  cost() { return 320; }
  description() { return 'Coffee, Sugar'; }
}
class CoffeeWithMilkAndSugar extends Coffee {
  cost() { return 370; }          // prices repeated everywhere
  description() { return 'Coffee, Milk, Sugar'; }
}
// CoffeeWithCream, CoffeeWithMilkAndCream, CoffeeWithSugarAndCream ...
// 4 extras = 16 classes, 10 extras = 1024 classes`,
      java: String.raw`class Coffee {
    int cost() { return 300; }
    String description() { return "Coffee"; }
}

// one subclass for every combination of extras...
class CoffeeWithMilk extends Coffee {
    int cost() { return 350; }
    String description() { return "Coffee, Milk"; }
}
class CoffeeWithSugar extends Coffee {
    int cost() { return 320; }
    String description() { return "Coffee, Sugar"; }
}
class CoffeeWithMilkAndSugar extends Coffee {
    int cost() { return 370; }   // prices repeated everywhere
    String description() { return "Coffee, Milk, Sugar"; }
}
// CoffeeWithCream, CoffeeWithMilkAndCream, CoffeeWithSugarAndCream ...
// 4 extras = 16 classes, 10 extras = 1024 classes`,
      cpp: String.raw`#include <string>

class Coffee {
public:
    virtual ~Coffee() = default;
    virtual int cost() const { return 300; }
    virtual std::string description() const { return "Coffee"; }
};

// one subclass for every combination of extras...
class CoffeeWithMilk : public Coffee {
public:
    int cost() const override { return 350; }
    std::string description() const override { return "Coffee, Milk"; }
};
class CoffeeWithSugar : public Coffee {
public:
    int cost() const override { return 320; }
    std::string description() const override { return "Coffee, Sugar"; }
};
class CoffeeWithMilkAndSugar : public Coffee {
public:
    int cost() const override { return 370; }  // prices repeated everywhere
    std::string description() const override { return "Coffee, Milk, Sugar"; }
};
// CoffeeWithCream, CoffeeWithMilkAndCream, CoffeeWithSugarAndCream ...
// 4 extras = 16 classes, 10 extras = 1024 classes`,
      php: String.raw`<?php
class Coffee
{
    public function cost(): int { return 300; }
    public function description(): string { return 'Coffee'; }
}

// one subclass for every combination of extras...
class CoffeeWithMilk extends Coffee
{
    public function cost(): int { return 350; }
    public function description(): string { return 'Coffee, Milk'; }
}
class CoffeeWithSugar extends Coffee
{
    public function cost(): int { return 320; }
    public function description(): string { return 'Coffee, Sugar'; }
}
class CoffeeWithMilkAndSugar extends Coffee
{
    public function cost(): int { return 370; }   // prices repeated everywhere
    public function description(): string { return 'Coffee, Milk, Sugar'; }
}
// CoffeeWithCream, CoffeeWithMilkAndCream, CoffeeWithSugarAndCream ...
// 4 extras = 16 classes, 10 extras = 1024 classes`,
    },
    good: {
      js: String.raw`class Coffee {
  cost() { return 300; }             // price in qəpik
  description() { return 'Coffee'; }
}

class MilkDecorator {
  constructor(drink) { this.drink = drink; }   // wraps any drink
  cost() { return this.drink.cost() + 50; }
  description() { return this.drink.description() + ', Milk'; }
}

class SugarDecorator {
  constructor(drink) { this.drink = drink; }
  cost() { return this.drink.cost() + 20; }
  description() { return this.drink.description() + ', Sugar'; }
}

// wrap layer by layer, in any combination
let drink = new Coffee();
drink = new MilkDecorator(drink);
drink = new SugarDecorator(drink);
console.log(drink.description(), drink.cost());  // Coffee, Milk, Sugar 370`,
      java: String.raw`interface Coffee {
    int cost();
    String description();
}

class SimpleCoffee implements Coffee {
    public int cost() { return 300; }   // price in qəpik
    public String description() { return "Coffee"; }
}

// base for all extras: it IS a Coffee and it HAS a Coffee inside
abstract class CoffeeDecorator implements Coffee {
    protected final Coffee drink;
    CoffeeDecorator(Coffee drink) { this.drink = drink; }
}

class MilkDecorator extends CoffeeDecorator {
    MilkDecorator(Coffee drink) { super(drink); }
    public int cost() { return drink.cost() + 50; }
    public String description() { return drink.description() + ", Milk"; }
}

class SugarDecorator extends CoffeeDecorator {
    SugarDecorator(Coffee drink) { super(drink); }
    public int cost() { return drink.cost() + 20; }
    public String description() { return drink.description() + ", Sugar"; }
}

// usage: wrap layer by layer
Coffee drink = new SugarDecorator(new MilkDecorator(new SimpleCoffee()));
System.out.println(drink.description() + " " + drink.cost());  // Coffee, Milk, Sugar 370`,
      cpp: String.raw`#include <iostream>
#include <memory>
#include <string>
#include <utility>

class Coffee {
public:
    virtual ~Coffee() = default;
    virtual int cost() const = 0;
    virtual std::string description() const = 0;
};

class SimpleCoffee : public Coffee {
public:
    int cost() const override { return 300; }  // price in qəpik
    std::string description() const override { return "Coffee"; }
};

class MilkDecorator : public Coffee {
    std::unique_ptr<Coffee> drink;   // the wrapped drink

public:
    explicit MilkDecorator(std::unique_ptr<Coffee> d) : drink(std::move(d)) {}
    int cost() const override { return drink->cost() + 50; }
    std::string description() const override { return drink->description() + ", Milk"; }
};

class SugarDecorator : public Coffee {
    std::unique_ptr<Coffee> drink;

public:
    explicit SugarDecorator(std::unique_ptr<Coffee> d) : drink(std::move(d)) {}
    int cost() const override { return drink->cost() + 20; }
    std::string description() const override { return drink->description() + ", Sugar"; }
};

int main() {
    std::unique_ptr<Coffee> drink = std::make_unique<SimpleCoffee>();
    drink = std::make_unique<MilkDecorator>(std::move(drink));
    drink = std::make_unique<SugarDecorator>(std::move(drink));
    std::cout << drink->description() << ' ' << drink->cost() << '\n';  // Coffee, Milk, Sugar 370
}`,
      php: String.raw`<?php
interface Coffee
{
    public function cost(): int;
    public function description(): string;
}

class SimpleCoffee implements Coffee
{
    public function cost(): int { return 300; }   // price in qəpik
    public function description(): string { return 'Coffee'; }
}

class MilkDecorator implements Coffee
{
    public function __construct(private Coffee $drink) {}   // wraps any drink

    public function cost(): int { return $this->drink->cost() + 50; }
    public function description(): string { return $this->drink->description() . ', Milk'; }
}

class SugarDecorator implements Coffee
{
    public function __construct(private Coffee $drink) {}

    public function cost(): int { return $this->drink->cost() + 20; }
    public function description(): string { return $this->drink->description() . ', Sugar'; }
}

// usage: wrap layer by layer
$drink = new SugarDecorator(new MilkDecorator(new SimpleCoffee()));
echo $drink->description() . ' ' . $drink->cost();  // Coffee, Milk, Sugar 370`,
    },
    // Decorator used where there is only ONE fixed add-on, and the plain version
    overkill: {
      js: String.raw`// The shop sells only ONE add-on, milk, and never will sell another,
// but a whole wrapping system was built for it
class Coffee {
  cost() { return 300; }
  description() { return 'Coffee'; }
}

class MilkDecorator {
  constructor(drink) { this.drink = drink; }
  cost() { return this.drink.cost() + 50; }
  description() { return this.drink.description() + ', Milk'; }
}

const plain = new Coffee();
const withMilk = new MilkDecorator(new Coffee());
console.log(plain.cost(), withMilk.cost());  // 300 350`,
      java: String.raw`// The shop sells only ONE add-on, milk, and never will sell another,
// but a whole wrapping system was built for it
interface Coffee {
    int cost();
    String description();
}

class SimpleCoffee implements Coffee {
    public int cost() { return 300; }
    public String description() { return "Coffee"; }
}

abstract class CoffeeDecorator implements Coffee {
    protected final Coffee drink;
    CoffeeDecorator(Coffee drink) { this.drink = drink; }
}

class MilkDecorator extends CoffeeDecorator {
    MilkDecorator(Coffee drink) { super(drink); }
    public int cost() { return drink.cost() + 50; }
    public String description() { return drink.description() + ", Milk"; }
}

// usage
Coffee withMilk = new MilkDecorator(new SimpleCoffee());
System.out.println(withMilk.cost());  // 350`,
      cpp: String.raw`#include <iostream>
#include <memory>
#include <string>
#include <utility>

// The shop sells only ONE add-on, milk, and never will sell another,
// but a whole wrapping system was built for it
class Coffee {
public:
    virtual ~Coffee() = default;
    virtual int cost() const = 0;
    virtual std::string description() const = 0;
};

class SimpleCoffee : public Coffee {
public:
    int cost() const override { return 300; }
    std::string description() const override { return "Coffee"; }
};

class MilkDecorator : public Coffee {
    std::unique_ptr<Coffee> drink;

public:
    explicit MilkDecorator(std::unique_ptr<Coffee> d) : drink(std::move(d)) {}
    int cost() const override { return drink->cost() + 50; }
    std::string description() const override { return drink->description() + ", Milk"; }
};

int main() {
    MilkDecorator withMilk(std::make_unique<SimpleCoffee>());
    std::cout << withMilk.cost() << '\n';  // 350
}`,
      php: String.raw`<?php
// The shop sells only ONE add-on, milk, and never will sell another,
// but a whole wrapping system was built for it
interface Coffee
{
    public function cost(): int;
    public function description(): string;
}

class SimpleCoffee implements Coffee
{
    public function cost(): int { return 300; }
    public function description(): string { return 'Coffee'; }
}

class MilkDecorator implements Coffee
{
    public function __construct(private Coffee $drink) {}

    public function cost(): int { return $this->drink->cost() + 50; }
    public function description(): string { return $this->drink->description() . ', Milk'; }
}

// usage
$withMilk = new MilkDecorator(new SimpleCoffee());
echo $withMilk->cost();  // 350`,
    },
    simple: {
      js: String.raw`class Coffee {
  constructor(withMilk = false) { this.withMilk = withMilk; }

  cost() { return this.withMilk ? 350 : 300; }  // one extra: a plain field is enough
  description() { return this.withMilk ? 'Coffee, Milk' : 'Coffee'; }
}

const withMilk = new Coffee(true);
console.log(withMilk.cost());  // 350`,
      java: String.raw`class Coffee {
    private final boolean withMilk;   // one extra: a plain field is enough

    Coffee(boolean withMilk) { this.withMilk = withMilk; }

    int cost() { return withMilk ? 350 : 300; }
    String description() { return withMilk ? "Coffee, Milk" : "Coffee"; }
}

// usage
Coffee withMilk = new Coffee(true);
System.out.println(withMilk.cost());  // 350`,
      cpp: String.raw`#include <iostream>
#include <string>

class Coffee {
    bool withMilk;   // one extra: a plain field is enough

public:
    explicit Coffee(bool milk = false) : withMilk(milk) {}

    int cost() const { return withMilk ? 350 : 300; }
    std::string description() const { return withMilk ? "Coffee, Milk" : "Coffee"; }
};

int main() {
    Coffee withMilk(true);
    std::cout << withMilk.cost() << '\n';  // 350
}`,
      php: String.raw`<?php
class Coffee
{
    public function __construct(private bool $withMilk = false) {}   // one extra: a plain field is enough

    public function cost(): int { return $this->withMilk ? 350 : 300; }
    public function description(): string { return $this->withMilk ? 'Coffee, Milk' : 'Coffee'; }
}

$withMilk = new Coffee(true);
echo $withMilk->cost();  // 350`,
    },
  };

  DP.register({
    id: 'decorator',
    name: 'Decorator',
    category: 'structural',
    text: {
      az: {
        summary: `Obyektin özünü dəyişmədən, onu "sarıyaraq" ona qat-qat yeni imkanlar əlavə edirsən.`,
        analogy: `Hədiyyəni bükmək kimi. Hədiyyənin özünə toxunmursan, üstünə əvvəl kağız, sonra lent, sonra kart əlavə edirsən. Hər qat öz işini görür. Bir qatı istəyirsənsə bir qat, hamısını istəyirsənsə hamısını sarıyırsan. Qəhvədə də belədir: eyni qəhvəyə süd, şəkər, qaymaq istədiyin qədər və istədiyin kombinasiyada əlavə edirsən, hər əlavə həm qiyməti, həm təsviri artırır.`,
        problem: `Qəhvə dükanında qəhvəyə süd, şəkər, qaymaq, sirop əlavə etmək olar. Pis kodda hər kombinasiya üçün ayrıca sinif yazılır: CoffeeWithMilk, CoffeeWithMilkAndSugar, CoffeeWithSugarAndCream və s. Hər əlavə ya var, ya yox olduğu üçün 4 əlavə 2 × 2 × 2 × 2 = 16 sinif deməkdir (sadə qəhvə də daxil). 5-ci əlavə gələndə 32 sinif olur, 10 əlavə üçün 1024. Qiymətlər və təsvirlər hər sinifdə təkrar yazılır, ona görə süd qiyməti dəyişəndə onlarla sinfə toxunmalı olursan. "İki dəfə süd" kimi istək üçün isə yenə yeni sinif lazımdır.`,
        solution: `Hər kəs eyni sözləşməyə əməl edir: qəhvə cost() və description() verir. Sadə Coffee yalnız qəhvənin özünü bilir: qiyməti 3.00, təsviri "Coffee". MilkDecorator isə başqa bir qəhvəni içində saxlayır və özü də qəhvə kimi davranır. cost() çağırılanda əvvəl içindəki qəhvənin qiymətini alır, üstünə süd haqqını (0.50) əlavə edir. description() də eyni qaydadır: içindəkinin təsvirinə ", Milk" əlavə edir. Süd və şəkər istəyirsənsə, qəhvəni əvvəl süd qatı ilə, sonra şəkər qatı ilə sarıyırsan: new SugarDecorator(new MilkDecorator(new Coffee())). Yeni əlavə (məsələn, sirop) üçün yalnız bir yeni sinif yazırsan, köhnə heç nə dəyişmir. Kombinasiyanı da proqram işləyərkən istifadəçi özü qurur.`,
        usedIn: [
          `Java giriş-çıxış (I/O): new BufferedReader(new InputStreamReader(...)) yazanda hər qat bir imkan əlavə edir (mətnə çevirmə, sürətli oxuma).`,
          `Funksiyanı sarıyan funksiyalar (Python-da @decorator, JavaScript-də oxşar sarğılar): məsələn, funksiyanın içinə toxunmadan hər çağırışın vaxtını ölçən və ya jurnala yazan qat.`,
          `Oyunlarda qəhrəmana qılınc, qalxan, sehrli zireh əlavə etmək: hər əlavə gücü dəyişir, qəhrəmanın özü isə eyni qalır.`,
          `Onlayn mağazada son qiymət: məhsulun qiymətinə endirim, çatdırılma haqqı, vergi qat-qat əlavə olunur və hər qat öz hissəsini hesablayır.`,
        ],
        avoid: `Əlavələr azdırsa və sabitdirsə (məsələn, yalnız bir dənə), Decorator lazımsız yerə çoxlu kiçik sinif yaradır. Qat çox olanda isə sıranın nəticəyə təsiri və xətanı tapmaq çətinləşə bilər.`,
        avoidWhen: [
          `Yalnız bir-iki sabit əlavə var və kombinasiya yoxdur. Bu halda sadə if və ya bir sahə (field) kifayətdir.`,
          `Əlavələr işləmə zamanı seçilmir: hamısı əvvəlcədən məlumdur və dəyişməyəcək.`,
          `Qatların sırası nəticəni kəskin dəyişir və bunu izləmək çətindir. Məsələn, vergi endirimdən əvvəl hesablansa və ya sonra hesablansa, qiymət fərqli çıxır.`,
          `Sarıyılan sinifdə çoxlu metod var. Hər decorator onların hamısını içindəkinə ötürməli olacaq və bu, çoxlu boş kod yaradır.`,
        ],
        overkillNote: `Lazımsız mürəkkəb kodda dükan yalnız bir əlavə satır: süd. Buna baxmayaraq Coffee interfeysi, SimpleCoffee, abstrakt CoffeeDecorator və MilkDecorator yazılıb, yəni bir if-in görə biləcəyi iş üçün dörd tip. Sadə həll Coffee sinfinə withMilk sahəsi qoyur və cost()-da ona baxır. Decorator o zaman yerinə düşəcək ki, əlavələr çoxalsın (şəkər, qaymaq, sirop...), müştəri onları istədiyi kombinasiyada seçsin və sən hər kombinasiya üçün ayrıca sinif yazmaq istəməyəsən.`,
      },
      en: {
        summary: `Without changing the object itself, you "wrap" it to add new abilities layer by layer.`,
        analogy: `Like wrapping a gift. You do not touch the gift itself, you add paper first, then a ribbon, then a card on top. Each layer does its own job. You wrap one layer if you want one, and all of them if you want all. Coffee works the same way: to the same coffee you add milk, sugar or cream, as many as you like and in any combination, and each extra raises both the price and the description.`,
        problem: `In a coffee shop you can add milk, sugar, cream or syrup to a coffee. In the bad code a separate class is written for every combination: CoffeeWithMilk, CoffeeWithMilkAndSugar, CoffeeWithSugarAndCream, and so on. Since each extra is either in or out, 4 extras mean 2 × 2 × 2 × 2 = 16 classes (plain coffee included). A 5th extra makes it 32 classes, and 10 extras make 1024. Prices and descriptions are repeated in every class, so when the price of milk changes you have to touch dozens of classes. And a wish like "double milk" needs yet another class.`,
        solution: `Everyone follows the same contract: a coffee gives cost() and description(). The plain Coffee only knows the coffee itself: price 3.00, description "Coffee". A MilkDecorator holds another coffee inside and behaves like a coffee itself. When cost() is called, it first takes the price of the coffee inside and adds the milk fee (0.50) on top. description() works the same way: it adds ", Milk" to the description of the coffee inside. If you want milk and sugar, you wrap the coffee in a milk layer first and a sugar layer next: new SugarDecorator(new MilkDecorator(new Coffee())). For a new extra (say, syrup) you write just one new class and nothing old changes. The user builds the combination while the program is running.`,
        usedIn: [
          `Java input/output (I/O): when you write new BufferedReader(new InputStreamReader(...)), each layer adds one ability (converting to text, fast reading).`,
          `Functions that wrap functions (@decorator in Python, similar wrappers in JavaScript): for example, a layer that measures the time of every call or writes it to a log without touching the function inside.`,
          `Adding a sword, a shield and magic armor to a hero in a game: each addition changes the power while the hero itself stays the same.`,
          `The final price in an online shop: a discount, a delivery fee and tax are added to the product price layer by layer, and each layer calculates its own part.`,
        ],
        avoid: `If the extras are few and fixed (for example, just one), Decorator creates many small classes for nothing. With many layers, the effect of their order and finding a bug can also get harder.`,
        avoidWhen: [
          `There are only one or two fixed extras and no combinations. A simple if or one field is enough.`,
          `The extras are not chosen while the program runs: all of them are known in advance and will not change.`,
          `The order of the layers changes the result sharply and is hard to follow. For example, if tax is calculated before or after the discount, the price comes out different.`,
          `The wrapped class has many methods. Every decorator would have to pass all of them through to the one inside, which creates lots of empty code.`,
        ],
        overkillNote: `In the over-complicated code the shop sells only one extra: milk. Even so, a Coffee interface, SimpleCoffee, an abstract CoffeeDecorator and MilkDecorator were written, which is four types for a job one if could do. The simple solution puts a withMilk field in Coffee and checks it in cost(). Decorator will fit when the extras multiply (sugar, cream, syrup...), customers pick them in any combination, and you do not want to write a separate class for each combination.`,
      },
    },
    diagram,
    diagramLabel: {
      az: 'Decorator diaqramı: Coffee SugarDecorator-un, o da MilkDecorator-un içindədir, hər qat öz qiymətini əlavə edir',
      en: 'Decorator diagram: Coffee sits inside SugarDecorator, which sits inside MilkDecorator, and each layer adds its own price',
    },
    code,
    mount: (stage, lang) => DP.demos.decorator(stage, lang),
  });
})(window.DP);
