(function (DP) {
  const diagram = `<svg viewBox="0 0 560 250" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-strategy" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0L10 5L0 10z" class="d-arrow"/>
    </marker>
  </defs>
  <rect class="d-box-accent" x="20" y="20" width="150" height="56" rx="8"/>
  <text class="d-text" x="95" y="45" text-anchor="middle">Order (Context)</text>
  <text class="d-sub" x="95" y="63" text-anchor="middle">strategy</text>
  <path class="d-line" d="M170 48 L260 48" marker-end="url(#arr-strategy)"/>
  <text class="d-sub" x="215" y="40" text-anchor="middle">uses</text>
  <rect class="d-box" x="260" y="20" width="200" height="56" rx="8"/>
  <text class="d-text" x="360" y="43" text-anchor="middle">«interface»</text>
  <text class="d-sub" x="360" y="62" text-anchor="middle">ShippingStrategy · price()</text>
  <path class="d-line d-dash" d="M240 170 L320 76" marker-end="url(#arr-strategy)"/>
  <path class="d-line d-dash" d="M360 170 L360 76" marker-end="url(#arr-strategy)"/>
  <path class="d-line d-dash" d="M480 170 L400 76" marker-end="url(#arr-strategy)"/>
  <rect class="d-box" x="185" y="170" width="110" height="50" rx="8"/>
  <text class="d-text" x="240" y="200" text-anchor="middle">Post</text>
  <rect class="d-box" x="305" y="170" width="110" height="50" rx="8"/>
  <text class="d-text" x="360" y="200" text-anchor="middle">Courier</text>
  <rect class="d-box" x="425" y="170" width="110" height="50" rx="8"/>
  <text class="d-text" x="480" y="200" text-anchor="middle">Express</text>
</svg>`;

  const code = {
    bad: {
      js: String.raw`function shippingPrice(type, kg) {
  if (type === 'post') {
    return 3 + kg * 0.5;
  } else if (type === 'courier') {
    return 6 + kg * 0.8;
  } else if (type === 'express') {
    return 12 + kg * 1.5;
  }
  // every new method = edit this function (and re-test all branches)
  throw new Error('Unknown type');
}`,
      java: String.raw`double shippingPrice(String type, double kg) {
    if (type.equals("post")) {
        return 3 + kg * 0.5;
    } else if (type.equals("courier")) {
        return 6 + kg * 0.8;
    } else if (type.equals("express")) {
        return 12 + kg * 1.5;
    }
    // every new method = edit this method
    throw new IllegalArgumentException("Unknown type");
}`,
      cpp: String.raw`#include <stdexcept>
#include <string>

double shippingPrice(const std::string& type, double kg) {
    if (type == "post") {
        return 3 + kg * 0.5;
    } else if (type == "courier") {
        return 6 + kg * 0.8;
    } else if (type == "express") {
        return 12 + kg * 1.5;
    }
    // every new method = edit this function
    throw std::invalid_argument("Unknown type");
}`,
      php: String.raw`<?php
function shippingPrice(string $type, float $kg): float
{
    if ($type === 'post') {
        return 3 + $kg * 0.5;
    } elseif ($type === 'courier') {
        return 6 + $kg * 0.8;
    } elseif ($type === 'express') {
        return 12 + $kg * 1.5;
    }
    // every new method = edit this function
    throw new InvalidArgumentException('Unknown type');
}`,
    },
    good: {
      js: String.raw`const strategies = {
  post:    (kg) => 3 + kg * 0.5,
  courier: (kg) => 6 + kg * 0.8,
  express: (kg) => 12 + kg * 1.5,
};

function shippingPrice(type, kg) {
  const strategy = strategies[type];
  if (!strategy) throw new Error('Unknown type');
  return strategy(kg);
}

// new method = add one entry, nothing else changes
strategies.drone = (kg) => 20 + kg * 2;`,
      java: String.raw`interface ShippingStrategy {
    double price(double kg);
}

class Post implements ShippingStrategy {
    public double price(double kg) { return 3 + kg * 0.5; }
}
class Courier implements ShippingStrategy {
    public double price(double kg) { return 6 + kg * 0.8; }
}
class Express implements ShippingStrategy {
    public double price(double kg) { return 12 + kg * 1.5; }
}

class Order {
    private ShippingStrategy strategy;

    Order(ShippingStrategy strategy) { this.strategy = strategy; }
    void setStrategy(ShippingStrategy s) { this.strategy = s; }
    double shippingPrice(double kg) { return strategy.price(kg); }
}

// usage
Order order = new Order(new Post());
order.setStrategy(new Express());   // swap at runtime
System.out.println(order.shippingPrice(10));`,
      cpp: String.raw`#include <iostream>
#include <memory>
#include <utility>

struct ShippingStrategy {
    virtual ~ShippingStrategy() = default;
    virtual double price(double kg) const = 0;
};

struct Post : ShippingStrategy {
    double price(double kg) const override { return 3 + kg * 0.5; }
};
struct Courier : ShippingStrategy {
    double price(double kg) const override { return 6 + kg * 0.8; }
};
struct Express : ShippingStrategy {
    double price(double kg) const override { return 12 + kg * 1.5; }
};

class Order {
    std::unique_ptr<ShippingStrategy> strategy;

public:
    explicit Order(std::unique_ptr<ShippingStrategy> s) : strategy(std::move(s)) {}
    void setStrategy(std::unique_ptr<ShippingStrategy> s) { strategy = std::move(s); }
    double shippingPrice(double kg) const { return strategy->price(kg); }
};

int main() {
    Order order(std::make_unique<Post>());
    order.setStrategy(std::make_unique<Express>());  // swap at runtime
    std::cout << order.shippingPrice(10) << '\n';
}`,
      php: String.raw`<?php
interface ShippingStrategy
{
    public function price(float $kg): float;
}

class Post implements ShippingStrategy
{
    public function price(float $kg): float { return 3 + $kg * 0.5; }
}
class Courier implements ShippingStrategy
{
    public function price(float $kg): float { return 6 + $kg * 0.8; }
}
class Express implements ShippingStrategy
{
    public function price(float $kg): float { return 12 + $kg * 1.5; }
}

class Order
{
    public function __construct(private ShippingStrategy $strategy) {}

    public function setStrategy(ShippingStrategy $s): void
    {
        $this->strategy = $s;
    }

    public function shippingPrice(float $kg): float
    {
        return $this->strategy->price($kg);
    }
}

$order = new Order(new Post());
$order->setStrategy(new Express());   // swap at runtime
echo $order->shippingPrice(10);`,
    },
    // Strategy used for 2 fixed cases that never change, and the plain version
    overkill: {
      js: String.raw`// Only 2 fixed discounts that will never change,
// but 3 classes and a Cart were built around them
class DiscountStrategy {
  apply(price) { throw new Error('not implemented'); }
}
class RegularDiscount extends DiscountStrategy {
  apply(price) { return price; }
}
class VipDiscount extends DiscountStrategy {
  apply(price) { return price * 0.9; }
}

class Cart {
  constructor(strategy) { this.strategy = strategy; }
  setStrategy(strategy) { this.strategy = strategy; }
  total(price) { return this.strategy.apply(price); }
}

const cart = new Cart(new VipDiscount());
console.log(cart.total(100)); // 90`,
      java: String.raw`// Only 2 fixed discounts that will never change,
// but an interface, 2 classes and a Cart were built around them
interface DiscountStrategy {
    double apply(double price);
}

class RegularDiscount implements DiscountStrategy {
    public double apply(double price) { return price; }
}
class VipDiscount implements DiscountStrategy {
    public double apply(double price) { return price * 0.9; }
}

class Cart {
    private DiscountStrategy strategy;

    Cart(DiscountStrategy strategy) { this.strategy = strategy; }
    void setStrategy(DiscountStrategy s) { this.strategy = s; }
    double total(double price) { return strategy.apply(price); }
}

// usage
Cart cart = new Cart(new VipDiscount());
System.out.println(cart.total(100)); // 90.0`,
      cpp: String.raw`#include <iostream>
#include <memory>
#include <utility>

// Only 2 fixed discounts that will never change,
// but an interface, 2 classes and a Cart were built around them
struct DiscountStrategy {
    virtual ~DiscountStrategy() = default;
    virtual double apply(double price) const = 0;
};
struct RegularDiscount : DiscountStrategy {
    double apply(double price) const override { return price; }
};
struct VipDiscount : DiscountStrategy {
    double apply(double price) const override { return price * 0.9; }
};

class Cart {
    std::unique_ptr<DiscountStrategy> strategy;

public:
    explicit Cart(std::unique_ptr<DiscountStrategy> s) : strategy(std::move(s)) {}
    double total(double price) const { return strategy->apply(price); }
};

int main() {
    Cart cart(std::make_unique<VipDiscount>());
    std::cout << cart.total(100) << '\n';  // 90
}`,
      php: String.raw`<?php
// Only 2 fixed discounts that will never change,
// but an interface, 2 classes and a Cart were built around them
interface DiscountStrategy
{
    public function apply(float $price): float;
}

class RegularDiscount implements DiscountStrategy
{
    public function apply(float $price): float { return $price; }
}
class VipDiscount implements DiscountStrategy
{
    public function apply(float $price): float { return $price * 0.9; }
}

class Cart
{
    public function __construct(private DiscountStrategy $strategy) {}

    public function total(float $price): float
    {
        return $this->strategy->apply($price);
    }
}

$cart = new Cart(new VipDiscount());
echo $cart->total(100); // 90`,
    },
    simple: {
      js: String.raw`function total(price, isVip) {
  return isVip ? price * 0.9 : price;
}

console.log(total(100, true)); // 90`,
      java: String.raw`double total(double price, boolean isVip) {
    return isVip ? price * 0.9 : price;
}

// usage
System.out.println(total(100, true)); // 90.0`,
      cpp: String.raw`#include <iostream>

double total(double price, bool isVip) {
    return isVip ? price * 0.9 : price;
}

int main() {
    std::cout << total(100, true) << '\n';  // 90
}`,
      php: String.raw`<?php
function total(float $price, bool $isVip): float
{
    return $isVip ? $price * 0.9 : $price;
}

echo total(100, true); // 90`,
    },
  };

  DP.register({
    id: 'strategy',
    name: 'Strategy',
    category: 'behavioral',
    text: {
      az: {
        summary: `Eyni işi görməyin bir neçə üsulu varsa, hər üsulu ayrıca "strategiya" kimi yaz və lazım olanı seç.`,
        analogy: `Xəritə tətbiqi kimi. Ünvan eynidir, amma marşrutu "piyada", "avtomobillə" və ya "ictimai nəqliyyatla" qura bilərsən. Hər seçimin marşrutu fərqli qayda ilə hesablanır, tətbiqin qalan hissəsi isə dəyişmir. Yeni seçim (məsələn, velosiped) əlavə olunanda köhnələr olduğu kimi qalır.`,
        problem: `Çatdırılma qiymətini hesablayırıq: poçt, kuryer, ekspress. Pis kodda hamısı bir funksiyanın içində böyük if / else if zəncirindədir. Dördüncü üsul (məsələn, dron) əlavə etmək üçün həmin funksiyanı açıb dəyişməlisən. Hər dəyişiklikdə əvvəl düzgün işləyən üsulları təsadüfən sındırmaq riski var və funksiya getdikcə böyüyür.`,
        solution: `Hər üsulu öz hesablama qaydası ilə ayrıca yazırsan (Post, Courier, Express). Hamısı eyni formadadır: çəki verirsən, qiymət alırsan. Sifariş isə yalnız seçilmiş üsulu çağırır və onun içində qiymətin necə hesablandığını bilmir. İstədiyin vaxt üsulu dəyişə bilərsən (setStrategy). Yeni üsul əlavə etmək = yeni bir parça yazmaq. Köhnələrə toxunmursan, ona görə heç nə sınmır.`,
        usedIn: [
          `Çatdırılma və ya vergi hesablanması: ölkəyə və ya çatdırılma növünə görə fərqli qayda.`,
          `Sıralama: siyahını ada, qiymətə və ya tarixə görə sıralamaq üçün müxtəlif müqayisə qaydaları (comparator).`,
          `Ödəniş üsulları: kart, nağd və ya köçürmə. Hər birinin öz ödəniş qaydası var.`,
          `Giriş növləri: parol, Google ilə giriş və ya korporativ giriş (SSO).`,
        ],
        avoid: `Yalnız 2–3 variant varsa və gələcəkdə də dəyişməyəcəksə, sadə if / else kifayətdir. Strategiya onu artıq mürəkkəbləşdirər: bir funksiya əvəzinə bir neçə sinif yazmaq lazım gəlir.`,
        avoidWhen: [
          `Variantlar azdır (2–3) və sabitdir. Məsələn, "adi müştəri" və "VIP müştəri" endirimi: bu qayda ildə bir dəfə də dəyişmir.`,
          `Variantlar bir-birindən çox az fərqlənir: yalnız bir rəqəm və ya bir şərt dəyişir. Bunun üçün ayrıca sinif yazmaq artıqdır.`,
          `Seçim bir yerdə edilir və işləmə zamanı heç vaxt dəyişmir. Onda interfeys və sinif zənciri əvəzinə bir şərt kifayətdir.`,
        ],
        overkillNote: `Lazımsız mürəkkəb kodda endirim yalnız iki sabit hal üçündür (adi və VIP). Buna baxmayaraq bir interfeys, iki sinif və Cart sinfi yazılıb, halbuki eyni iş bir sətirlik şərtlə görülür. Sadə həll qısadır, oxunaqlıdır və dəyişdirmək asandır. Gələcəkdə həqiqətən 5–6 fərqli endirim qaydası yaranarsa, onda Strategy-yə keçmək məntiqli olar.`,
      },
      en: {
        summary: `If there are several ways to do the same job, write each way as its own "strategy" and pick the one you need.`,
        analogy: `Like a maps app. The destination is the same, but you can plan the route "on foot", "by car" or "by public transport". Each choice has its own way of calculating the route, while the rest of the app stays the same. When a new choice (say, bicycle) is added, the old ones stay as they were.`,
        problem: `We calculate a shipping price: post, courier, express. In the bad code they all sit inside one function in a long if / else if chain. To add a fourth method (say, a drone) you have to open that function and change it. Every change risks accidentally breaking methods that already worked, and the function keeps growing.`,
        solution: `You write each method separately with its own calculation rule (Post, Courier, Express). They all have the same shape: you give a weight, you get a price. The order just calls the selected method and does not know how the price is calculated inside. You can switch the method whenever you like (setStrategy). Adding a new method = writing one new piece. You do not touch the old ones, so nothing breaks.`,
        usedIn: [
          `Shipping or tax calculation: a different rule for each country or delivery type.`,
          `Sorting: different comparison rules to sort a list by name, price or date (comparator).`,
          `Payment methods: card, cash or transfer. Each one has its own payment rule.`,
          `Login types: password, sign in with Google or corporate sign-in (SSO).`,
        ],
        avoid: `With only 2–3 variants that will never change, a plain if / else is enough. A strategy would over-complicate it: you would write several classes instead of one function.`,
        avoidWhen: [
          `There are few variants (2–3) and they are fixed. For example the "regular customer" and "VIP customer" discount: this rule does not change once a year.`,
          `The variants differ very little: only one number or one condition changes. Writing a separate class for that is too much.`,
          `The choice is made in one place and never changes at runtime. Then a single condition is enough instead of an interface and a chain of classes.`,
        ],
        overkillNote: `In the over-complicated code the discount covers only two fixed cases (regular and VIP). Even so, an interface, two classes and a Cart class were written, while the same job is done with a one-line condition. The simple solution is short, readable and easy to change. If you ever really get 5–6 different discount rules, that is when switching to Strategy makes sense.`,
      },
    },
    diagram,
    diagramLabel: {
      az: 'Strategy diaqramı: Order ShippingStrategy interfeysindən istifadə edir, Post, Courier və Express onu həyata keçirir',
      en: 'Strategy diagram: Order uses the ShippingStrategy interface, implemented by Post, Courier and Express',
    },
    code,
    mount: (stage, lang) => DP.demos.strategy(stage, lang),
  });
})(window.DP);
