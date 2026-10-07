(function (DP) {
  const diagram = `<svg viewBox="0 0 520 220" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-builder" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0L10 5L0 10z" class="d-arrow"/>
    </marker>
  </defs>
  <rect class="d-box" x="15" y="75" width="110" height="70" rx="8"/>
  <text class="d-text" x="70" y="105" text-anchor="middle">Client</text>
  <text class="d-sub" x="70" y="125" text-anchor="middle">chooses steps</text>
  <path class="d-line" d="M125 110 L185 110" marker-end="url(#arr-builder)"/>
  <rect class="d-box-accent" x="185" y="30" width="170" height="140" rx="8"/>
  <text class="d-text" x="270" y="55" text-anchor="middle">PizzaBuilder</text>
  <text class="d-sub" x="270" y="78" text-anchor="middle">size("L")</text>
  <text class="d-sub" x="270" y="96" text-anchor="middle">addCheese()</text>
  <text class="d-sub" x="270" y="114" text-anchor="middle">addOlives()</text>
  <text class="d-sub" x="270" y="132" text-anchor="middle">thinCrust()</text>
  <text class="d-sub" x="270" y="156" text-anchor="middle">build()</text>
  <text class="d-sub" x="270" y="195" text-anchor="middle">each step returns the builder itself</text>
  <path class="d-line" d="M355 100 L405 100" marker-end="url(#arr-builder)"/>
  <text class="d-sub" x="380" y="92" text-anchor="middle">build()</text>
  <rect class="d-box" x="405" y="70" width="100" height="60" rx="8"/>
  <text class="d-text" x="455" y="96" text-anchor="middle">Pizza</text>
  <text class="d-sub" x="455" y="114" text-anchor="middle">ready object</text>
</svg>`;

  const code = {
    bad: {
      js: String.raw`class Pizza {
  constructor(size, cheese, olives, mushrooms, pepperoni, thinCrust, extraSauce) {
    Object.assign(this, { size, cheese, olives, mushrooms, pepperoni, thinCrust, extraSauce });
  }
}

// which true / false means what? you must count the positions
const pizza = new Pizza('L', true, false, true, false, true, false);

// swap two booleans by mistake: still runs, but the pizza is wrong
const wrong = new Pizza('L', true, false, false, true, true, false);`,
      java: String.raw`class Pizza {
    Pizza(String size, boolean cheese, boolean olives, boolean mushrooms,
          boolean pepperoni, boolean thinCrust, boolean extraSauce) {
        // ... store the 7 values
    }
}

public class Main {
    public static void main(String[] args) {
        // which true / false means what? you must count the positions
        Pizza pizza = new Pizza("L", true, false, true, false, true, false);

        // swap two booleans by mistake: still compiles, but the pizza is wrong
        Pizza wrong = new Pizza("L", true, false, false, true, true, false);
    }
}`,
      cpp: String.raw`#include <string>

struct Pizza {
    Pizza(std::string size, bool cheese, bool olives, bool mushrooms,
          bool pepperoni, bool thinCrust, bool extraSauce) {
        // ... store the 7 values
    }
};

int main() {
    // which true / false means what? you must count the positions
    Pizza pizza("L", true, false, true, false, true, false);

    // swap two booleans by mistake: still compiles, but the pizza is wrong
    Pizza wrong("L", true, false, false, true, true, false);
}`,
      php: String.raw`<?php
class Pizza
{
    public function __construct(
        public string $size,
        public bool $cheese,
        public bool $olives,
        public bool $mushrooms,
        public bool $pepperoni,
        public bool $thinCrust,
        public bool $extraSauce,
    ) {}
}

// which true / false means what? you must count the positions
$pizza = new Pizza('L', true, false, true, false, true, false);

// swap two booleans by mistake: still runs, but the pizza is wrong
$wrong = new Pizza('L', true, false, false, true, true, false);`,
    },
    good: {
      js: String.raw`class PizzaBuilder {
  #size = null;
  #toppings = [];
  #thin = false;
  #sauce = false;

  size(s) { this.#size = s; return this; }
  addCheese() { this.#toppings.push('cheese'); return this; }
  addOlives() { this.#toppings.push('olives'); return this; }
  addMushrooms() { this.#toppings.push('mushrooms'); return this; }
  addPepperoni() { this.#toppings.push('pepperoni'); return this; }
  thinCrust() { this.#thin = true; return this; }
  extraSauce() { this.#sauce = true; return this; }

  build() {
    if (!this.#size) throw new Error('size is required');
    return Object.freeze({
      size: this.#size,
      toppings: [...this.#toppings],
      thinCrust: this.#thin,
      extraSauce: this.#sauce,
    });
  }
}

const pizza = new PizzaBuilder().size('L').addCheese().addOlives().thinCrust().build();`,
      java: String.raw`import java.util.ArrayList;
import java.util.List;

class Pizza {
    final String size;
    final List<String> toppings;
    final boolean thinCrust;
    final boolean extraSauce;

    private Pizza(Builder b) {
        size = b.size;
        toppings = List.copyOf(b.toppings);
        thinCrust = b.thinCrust;
        extraSauce = b.extraSauce;
    }

    static class Builder {
        private String size;
        private final List<String> toppings = new ArrayList<>();
        private boolean thinCrust;
        private boolean extraSauce;

        Builder size(String s) { size = s; return this; }
        Builder addCheese() { toppings.add("cheese"); return this; }
        Builder addOlives() { toppings.add("olives"); return this; }
        Builder thinCrust() { thinCrust = true; return this; }
        Builder extraSauce() { extraSauce = true; return this; }

        Pizza build() {
            if (size == null) throw new IllegalStateException("size is required");
            return new Pizza(this);
        }
    }
}

public class Main {
    public static void main(String[] args) {
        Pizza pizza = new Pizza.Builder().size("L").addCheese().addOlives().thinCrust().build();
    }
}`,
      cpp: String.raw`#include <stdexcept>
#include <string>
#include <utility>
#include <vector>

struct Pizza {
    std::string size;
    std::vector<std::string> toppings;
    bool thinCrust = false;
    bool extraSauce = false;
};

class PizzaBuilder {
    Pizza pizza;

public:
    PizzaBuilder& size(std::string s) { pizza.size = std::move(s); return *this; }
    PizzaBuilder& addCheese() { pizza.toppings.push_back("cheese"); return *this; }
    PizzaBuilder& addOlives() { pizza.toppings.push_back("olives"); return *this; }
    PizzaBuilder& thinCrust() { pizza.thinCrust = true; return *this; }
    PizzaBuilder& extraSauce() { pizza.extraSauce = true; return *this; }

    Pizza build() const {
        if (pizza.size.empty()) throw std::logic_error("size is required");
        return pizza;
    }
};

int main() {
    Pizza pizza = PizzaBuilder().size("L").addCheese().addOlives().thinCrust().build();
}`,
      php: String.raw`<?php
final class Pizza
{
    public function __construct(
        public readonly string $size,
        public readonly array $toppings,
        public readonly bool $thinCrust,
        public readonly bool $extraSauce,
    ) {}
}

final class PizzaBuilder
{
    private ?string $size = null;
    private array $toppings = [];
    private bool $thinCrust = false;
    private bool $extraSauce = false;

    public function size(string $s): static { $this->size = $s; return $this; }
    public function addCheese(): static { $this->toppings[] = 'cheese'; return $this; }
    public function addOlives(): static { $this->toppings[] = 'olives'; return $this; }
    public function thinCrust(): static { $this->thinCrust = true; return $this; }
    public function extraSauce(): static { $this->extraSauce = true; return $this; }

    public function build(): Pizza
    {
        if ($this->size === null) {
            throw new LogicException('size is required');
        }
        return new Pizza($this->size, $this->toppings, $this->thinCrust, $this->extraSauce);
    }
}

$pizza = (new PizzaBuilder())->size('L')->addCheese()->addOlives()->thinCrust()->build();`,
    },
    // Builder for an object with only two values, and the plain version
    overkill: {
      js: String.raw`// A user has only TWO values, but a whole builder was written for it
class UserBuilder {
  #name = null;
  #email = null;

  name(value) { this.#name = value; return this; }
  email(value) { this.#email = value; return this; }

  build() {
    if (!this.#name || !this.#email) throw new Error('name and email are required');
    return { name: this.#name, email: this.#email };
  }
}

const user = new UserBuilder().name('Aysel').email('aysel@mail.az').build();`,
      java: String.raw`// A user has only TWO values, but a whole builder was written for it
class User {
    final String name;
    final String email;

    private User(Builder b) {
        name = b.name;
        email = b.email;
    }

    static class Builder {
        private String name;
        private String email;

        Builder name(String value) { name = value; return this; }
        Builder email(String value) { email = value; return this; }

        User build() {
            if (name == null || email == null) throw new IllegalStateException("name and email are required");
            return new User(this);
        }
    }
}

// usage
User user = new User.Builder().name("Aysel").email("aysel@mail.az").build();`,
      cpp: String.raw`#include <stdexcept>
#include <string>
#include <utility>

// A user has only TWO values, but a whole builder was written for it
struct User {
    std::string name;
    std::string email;
};

class UserBuilder {
    User user;

public:
    UserBuilder& name(std::string value) { user.name = std::move(value); return *this; }
    UserBuilder& email(std::string value) { user.email = std::move(value); return *this; }

    User build() const {
        if (user.name.empty() || user.email.empty()) throw std::logic_error("name and email are required");
        return user;
    }
};

// usage
User user = UserBuilder().name("Aysel").email("aysel@mail.az").build();`,
      php: String.raw`<?php
// A user has only TWO values, but a whole builder was written for it
final class User
{
    public function __construct(
        public readonly string $name,
        public readonly string $email,
    ) {}
}

final class UserBuilder
{
    private ?string $name = null;
    private ?string $email = null;

    public function name(string $value): static { $this->name = $value; return $this; }
    public function email(string $value): static { $this->email = $value; return $this; }

    public function build(): User
    {
        if ($this->name === null || $this->email === null) {
            throw new LogicException('name and email are required');
        }
        return new User($this->name, $this->email);
    }
}

$user = (new UserBuilder())->name('Aysel')->email('aysel@mail.az')->build();`,
    },
    simple: {
      js: String.raw`// two values: a plain object is clear enough
const user = { name: 'Aysel', email: 'aysel@mail.az' };`,
      java: String.raw`// two values: a record is clear enough
record User(String name, String email) {}

// usage
User user = new User("Aysel", "aysel@mail.az");`,
      cpp: String.raw`#include <string>

// two values: a plain struct is clear enough
struct User {
    std::string name;
    std::string email;
};

// usage
User user{"Aysel", "aysel@mail.az"};`,
      php: String.raw`<?php
// two values: a constructor with named arguments is clear enough
final class User
{
    public function __construct(
        public readonly string $name,
        public readonly string $email,
    ) {}
}

$user = new User(name: 'Aysel', email: 'aysel@mail.az');`,
    },
  };

  DP.register({
    id: 'builder',
    name: 'Builder',
    category: 'creational',
    text: {
      az: {
        summary: `Mürəkkəb obyekti bir böyük konstruktorla yox, addım-addım və oxunaqlı şəkildə qurursan.`,
        analogy: `Sendviç sifariş etmək kimi. Əvvəl çörəyin ölçüsünü deyirsən, sonra bir-bir əlavə edirsən: pendir, zeytun, sous. Satıcı hər addımı yadda saxlayır və axırda "hazırdır" deyəndə sendviçi hazırlayıb verir. Bütün seçimləri bir cümlədə sıra ilə desəydin ("böyük, bəli, xeyr, bəli, xeyr..."), qarışıqlıq olardı və satıcı səni səhv başa düşə bilərdi.`,
        problem: `Pizza sinfinin konstruktoru 7 parametr alır: new Pizza("L", true, false, true, false, true, false). Bu sətirdən hansı true-nun pendir, hansının zeytun olduğunu anlamaq mümkün deyil: sinfin kodunu açıb sırayla saymalısan. İki parametrin yerini səhv salsan, kod xətasız işləyir, amma səhv pizza hazırlanır. Yeni seçim (məsələn, "əlavə sous") əlavə etdikdə konstruktoru dəyişməli və bütün köhnə çağırışları düzəltməlisən. Buna "teleskop konstruktoru" deyilir: parametr siyahısı teleskop kimi uzanır.`,
        solution: `1. PizzaBuilder adlı ayrıca "qurucu" sinif var. O, seçimləri yadda saxlayır: size("L"), addCheese(), addOlives() və s. 2. Hər metod nə etdiyini adı ilə deyir və builder-in özünü qaytarır (return this). Buna görə çağırışları bir-birinin ardınca yazmaq olur: .size("L").addCheese().addOlives(). 3. Seçmədiyin şeyi yazmırsan, onun üçün false yazmaq lazım deyil. 4. Sonda build() çağırırsan. Builder yoxlayır (məsələn, ölçü seçilibmi) və hazır Pizza obyektini yaradır. Beləliklə, yarımçıq pizza yaranmır. 5. Yeni seçim əlavə etmək üçün builder-ə yeni metod yazırsan, köhnə çağırışlara toxunmursan. Demoda seçimləri aç-bağla: sağdakı zəncir hər dəfə yenilənir.`,
        usedIn: [
          `SQL sorğu qurucuları: SELECT, WHERE, ORDER BY hissələri bir-birinin ardınca əlavə olunur, axırda isə hazır sorğu alınır.`,
          `HTTP sorğuları: ünvan, başlıqlar, metod və məzmun addım-addım əlavə edilir, axırda sorğu göndərilir.`,
          `Java-da StringBuilder: mətni parça-parça əlavə edirsən, sonda toString() ilə tam mətni alırsan.`,
          `Hesabat yaradıcıları: başlıq, cədvəl və qrafik seçimləri bir-bir verilir, axırda sənəd hazırlanır.`,
        ],
        avoid: `Az parametri olan obyekt üçün Builder əlavə sinif və əlavə kod deməkdir. Parametrlər azdırsa, adi konstruktor, adlı parametrlər və ya sadə obyekt kifayətdir.`,
        avoidWhen: [
          `Obyektin 2-3 parametri var və hamısı məcburidir (məsələn, ad və e-poçt).`,
          `Dilin özü bunu artıq həll edir: adlı parametrlər (məsələn, PHP 8-də) və ya standart dəyərlər (JavaScript-də obyekt parametri).`,
          `Obyekti bir dəfə, bir yerdə yaradırsan və bu kod heç vaxt təkrarlanmayacaq.`,
          `Obyektin qurulması üçün heç bir yoxlama və ya xüsusi sıra lazım deyil, ona görə addım-addım qurmağın üstünlüyü yoxdur.`,
        ],
        overkillNote: `Lazımsız kodda yalnız iki məlumatı (ad və e-poçt) olan istifadəçi üçün UserBuilder yazılıb. İki parametri adi konstruktor və ya sadə obyekt oxunaqlı şəkildə qəbul edir, çünki sıranı səhv salmaq çətindir. Builder isə əlavə sinif, əlavə metodlar və əlavə build() addımı gətirir, sadə həll isə 1 sətirdir. Builder o zaman yerinə düşür ki, parametrlər çoxdur (təxminən 5-dən çox), çoxu könüllüdür və çağırışı oxuyanda hansı dəyərin nə olduğu bilinmir.`,
      },
      en: {
        summary: `You build a complex object step by step in a readable way, instead of using one huge constructor.`,
        analogy: `Like ordering a sandwich. First you say the size of the bread, then you add things one by one: cheese, olives, sauce. The seller remembers each step, and when you finally say "that's it" they make the sandwich and hand it over. If you had to say all the choices in one sentence in a fixed order ("large, yes, no, yes, no..."), it would get confusing and the seller could misunderstand you.`,
        problem: `The constructor of the Pizza class takes 7 parameters: new Pizza("L", true, false, true, false, true, false). From this line you cannot tell which true is cheese and which is olives: you have to open the class and count the positions. If you swap two parameters, the code runs without any error, but the wrong pizza is made. When you add a new option (say, "extra sauce"), you must change the constructor and fix all the old calls. This is called a "telescoping constructor": the parameter list stretches out like a telescope.`,
        solution: `1. There is a separate "builder" class called PizzaBuilder. It remembers the choices: size("L"), addCheese(), addOlives() and so on. 2. Each method says what it does by its name and returns the builder itself (return this). That is why the calls can be written one after another: .size("L").addCheese().addOlives(). 3. You do not write what you did not choose, so there is no need to write false for it. 4. At the end you call build(). The builder checks (for example, was the size chosen) and creates the finished Pizza object. This way no half-made pizza appears. 5. To add a new option you write a new method in the builder and do not touch the old calls. In the demo, switch the options on and off: the chain on the right is updated each time.`,
        usedIn: [
          `SQL query builders: the SELECT, WHERE and ORDER BY parts are added one after another, and a finished query comes out at the end.`,
          `HTTP requests: the address, headers, method and body are added step by step, and the request is sent at the end.`,
          `StringBuilder in Java: you add text piece by piece and get the full text with toString() at the end.`,
          `Report generators: title, table and chart options are given one by one, and the document is produced at the end.`,
        ],
        avoid: `For an object with few parameters, a Builder means an extra class and extra code. If the parameters are few, a normal constructor, named parameters or a simple object is enough.`,
        avoidWhen: [
          `The object has 2-3 parameters and all of them are required (for example name and email).`,
          `The language itself already solves this: named parameters (for example in PHP 8) or default values (an options object in JavaScript).`,
          `You create the object once in one place, and this code will never be repeated.`,
          `The parts of the object do not depend on each other, and building step by step (with its order and checks) gives no benefit.`,
        ],
        overkillNote: `In the over-complicated code a UserBuilder was written for a user that has only two values (name and email). A normal constructor or a simple object takes two parameters in a readable way, because it is hard to mix up the order. A builder brings an extra class, extra methods and an extra build() step, while the simple solution is 1 line. Builder fits when there are many parameters (roughly more than 5), most of them are optional, and when reading the call you cannot tell which value is what.`,
      },
    },
    diagram,
    diagramLabel: {
      az: 'Builder diaqramı: Client PizzaBuilder-in addımlarını çağırır, build() isə hazır Pizza qaytarır',
      en: 'Builder diagram: the Client calls the PizzaBuilder steps, and build() returns the finished Pizza',
    },
    code,
    mount: (stage, lang) => DP.demos.builder(stage, lang),
  });
})(window.DP);
