(function (DP) {
  const diagram = `<svg viewBox="0 0 520 220" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-singleton" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0L10 5L0 10z" class="d-arrow"/>
    </marker>
  </defs>
  <rect class="d-box" x="20" y="15" width="140" height="55" rx="8"/>
  <text class="d-text" x="90" y="38" text-anchor="middle">Users page</text>
  <text class="d-sub" x="90" y="56" text-anchor="middle">getInstance()</text>
  <rect class="d-box" x="20" y="83" width="140" height="55" rx="8"/>
  <text class="d-text" x="90" y="106" text-anchor="middle">Orders page</text>
  <text class="d-sub" x="90" y="124" text-anchor="middle">getInstance()</text>
  <rect class="d-box" x="20" y="151" width="140" height="55" rx="8"/>
  <text class="d-text" x="90" y="174" text-anchor="middle">Reports page</text>
  <text class="d-sub" x="90" y="192" text-anchor="middle">getInstance()</text>
  <path class="d-line" d="M160 42 L330 95" marker-end="url(#arr-singleton)"/>
  <path class="d-line" d="M160 110 L330 110" marker-end="url(#arr-singleton)"/>
  <path class="d-line" d="M160 178 L330 125" marker-end="url(#arr-singleton)"/>
  <rect class="d-box-accent" x="330" y="70" width="170" height="80" rx="8"/>
  <text class="d-text" x="415" y="98" text-anchor="middle">DatabaseConnection</text>
  <text class="d-sub" x="415" y="117" text-anchor="middle">the only instance</text>
  <text class="d-sub" x="415" y="135" text-anchor="middle">private constructor</text>
</svg>`;

  const code = {
    bad: {
      js: String.raw`class DatabaseConnection {
  constructor() {
    console.log('Opening a new connection...');   // slow and expensive
  }
  query(sql) {
    return 'Ran: ' + sql;
  }
}

// every page opens its own connection
const usersPage = new DatabaseConnection();
const ordersPage = new DatabaseConnection();
console.log(usersPage === ordersPage);   // false: two connections`,
      java: String.raw`class DatabaseConnection {
    DatabaseConnection() {
        System.out.println("Opening a new connection...");   // slow and expensive
    }

    String query(String sql) {
        return "Ran: " + sql;
    }
}

public class Main {
    public static void main(String[] args) {
        // every page opens its own connection
        DatabaseConnection usersPage = new DatabaseConnection();
        DatabaseConnection ordersPage = new DatabaseConnection();
        System.out.println(usersPage == ordersPage);   // false: two connections
    }
}`,
      cpp: String.raw`#include <iostream>
#include <string>

class DatabaseConnection {
public:
    DatabaseConnection() {
        std::cout << "Opening a new connection...\n";   // slow and expensive
    }
    void query(const std::string& sql) { std::cout << "Ran: " << sql << '\n'; }
};

int main() {
    // every page opens its own connection
    DatabaseConnection usersPage;
    DatabaseConnection ordersPage;
    std::cout << (&usersPage == &ordersPage) << '\n';   // 0: two connections
}`,
      php: String.raw`<?php
class DatabaseConnection
{
    public function __construct()
    {
        echo "Opening a new connection...\n";   // slow and expensive
    }

    public function query(string $sql): string
    {
        return "Ran: $sql";
    }
}

// every page opens its own connection
$usersPage = new DatabaseConnection();
$ordersPage = new DatabaseConnection();
var_dump($usersPage === $ordersPage);   // bool(false): two connections`,
    },
    good: {
      js: String.raw`class DatabaseConnection {
  static #instance = null;
  static #allowNew = false;

  constructor() {
    if (!DatabaseConnection.#allowNew) {
      throw new Error('Use DatabaseConnection.getInstance()');
    }
    console.log('Opening a new connection...');
  }

  static getInstance() {
    if (DatabaseConnection.#instance === null) {
      DatabaseConnection.#allowNew = true;
      DatabaseConnection.#instance = new DatabaseConnection();   // created only once
      DatabaseConnection.#allowNew = false;
    }
    return DatabaseConnection.#instance;
  }

  query(sql) {
    return 'Ran: ' + sql;
  }
}

const usersPage = DatabaseConnection.getInstance();
const ordersPage = DatabaseConnection.getInstance();
console.log(usersPage === ordersPage);   // true: the same connection`,
      java: String.raw`class DatabaseConnection {
    private static DatabaseConnection instance;   // starts empty

    private DatabaseConnection() {   // nobody outside can call new
        System.out.println("Opening a new connection...");
    }

    public static synchronized DatabaseConnection getInstance() {
        if (instance == null) {
            instance = new DatabaseConnection();   // created only once
        }
        return instance;
    }

    public String query(String sql) {
        return "Ran: " + sql;
    }
}

public class Main {
    public static void main(String[] args) {
        DatabaseConnection usersPage = DatabaseConnection.getInstance();
        DatabaseConnection ordersPage = DatabaseConnection.getInstance();
        System.out.println(usersPage == ordersPage);   // true: the same connection
    }
}`,
      cpp: String.raw`#include <iostream>
#include <string>

class DatabaseConnection {
    DatabaseConnection() {   // private: nobody outside can create one
        std::cout << "Opening a new connection...\n";
    }

public:
    DatabaseConnection(const DatabaseConnection&) = delete;            // no copies
    DatabaseConnection& operator=(const DatabaseConnection&) = delete;

    static DatabaseConnection& getInstance() {
        static DatabaseConnection instance;   // created once, on first call (thread-safe since C++11)
        return instance;
    }

    void query(const std::string& sql) { std::cout << "Ran: " << sql << '\n'; }
};

int main() {
    DatabaseConnection& usersPage = DatabaseConnection::getInstance();
    DatabaseConnection& ordersPage = DatabaseConnection::getInstance();
    std::cout << (&usersPage == &ordersPage) << '\n';   // 1: the same connection
}`,
      php: String.raw`<?php
final class DatabaseConnection
{
    private static ?DatabaseConnection $instance = null;   // starts empty

    private function __construct()   // nobody outside can call new
    {
        echo "Opening a new connection...\n";
    }

    private function __clone() {}   // no copies either

    public static function getInstance(): self
    {
        return self::$instance ??= new self();   // created only once
    }

    public function query(string $sql): string
    {
        return "Ran: $sql";
    }
}

$usersPage = DatabaseConnection::getInstance();
$ordersPage = DatabaseConnection::getInstance();
var_dump($usersPage === $ordersPage);   // bool(true): the same connection`,
    },
    // Singleton applied to a stateless helper, where nothing needs to be shared
    overkill: {
      js: String.raw`// The formatter keeps no data and is cheap to create,
// yet it was turned into a Singleton
class PriceFormatter {
  static #instance = null;

  static getInstance() {
    if (PriceFormatter.#instance === null) {
      PriceFormatter.#instance = new PriceFormatter();
    }
    return PriceFormatter.#instance;
  }

  format(amount) {
    return amount.toFixed(2) + ' AZN';
  }
}

console.log(PriceFormatter.getInstance().format(5));   // 5.00 AZN`,
      java: String.raw`// The formatter keeps no data and is cheap to create,
// yet it was turned into a Singleton
class PriceFormatter {
    private static PriceFormatter instance;

    private PriceFormatter() {}

    public static PriceFormatter getInstance() {
        if (instance == null) {
            instance = new PriceFormatter();
        }
        return instance;
    }

    public String format(double amount) {
        return String.format("%.2f AZN", amount);
    }
}

// usage
System.out.println(PriceFormatter.getInstance().format(5));   // 5.00 AZN`,
      cpp: String.raw`#include <cstdio>
#include <string>

// The formatter keeps no data and is cheap to create,
// yet it was turned into a Singleton
class PriceFormatter {
    PriceFormatter() = default;

public:
    static PriceFormatter& getInstance() {
        static PriceFormatter instance;
        return instance;
    }

    std::string format(double amount) const {
        char buffer[32];
        std::snprintf(buffer, sizeof buffer, "%.2f AZN", amount);
        return buffer;
    }
};

// usage
auto text = PriceFormatter::getInstance().format(5);   // "5.00 AZN"`,
      php: String.raw`<?php
// The formatter keeps no data and is cheap to create,
// yet it was turned into a Singleton
final class PriceFormatter
{
    private static ?PriceFormatter $instance = null;

    private function __construct() {}

    public static function getInstance(): self
    {
        return self::$instance ??= new self();
    }

    public function format(float $amount): string
    {
        return number_format($amount, 2) . ' AZN';
    }
}

echo PriceFormatter::getInstance()->format(5);   // 5.00 AZN`,
    },
    simple: {
      js: String.raw`// no state, nothing to share: a plain function is enough
function formatPrice(amount) {
  return amount.toFixed(2) + ' AZN';
}

console.log(formatPrice(5));   // 5.00 AZN`,
      java: String.raw`class Prices {
    // no state, nothing to share: a plain static method is enough
    static String format(double amount) {
        return String.format("%.2f AZN", amount);
    }
}

// usage
System.out.println(Prices.format(5));   // 5.00 AZN`,
      cpp: String.raw`#include <cstdio>
#include <string>

// no state, nothing to share: a plain function is enough
inline std::string formatPrice(double amount) {
    char buffer[32];
    std::snprintf(buffer, sizeof buffer, "%.2f AZN", amount);
    return buffer;
}

// usage
auto text = formatPrice(5);   // "5.00 AZN"`,
      php: String.raw`<?php
// no state, nothing to share: a plain function is enough
function formatPrice(float $amount): string
{
    return number_format($amount, 2) . ' AZN';
}

echo formatPrice(5);   // 5.00 AZN`,
    },
  };

  DP.register({
    id: 'singleton',
    name: 'Singleton',
    category: 'creational',
    text: {
      az: {
        summary: `Bir sinifdən proqramda yalnız bir obyekt yaradılır və hamı həmin eyni obyektdən istifadə edir.`,
        analogy: `Şəhərdə yalnız bir bələdiyyə binası var. Rəsmi iş üçün hamı həmin eyni binaya gedir, heç kim özü üçün yeni bina tikmir. Hər kəs öz binasını tiksəydi, sənədlərin hansı binada qaldığını bilmək mümkün olmazdı. Singleton da belədir: obyekt bir dəfə yaradılır, sonra proqramın hər yerində həmin eyni obyekt işlədilir.`,
        problem: `Tətbiqin verilənlər bazasına qoşulmaq üçün DatabaseConnection sinfi var. Pis kodda hər səhifə (məsələn, istifadəçilər və sifarişlər) özü new DatabaseConnection() yazır. Nəticədə eyni işi görən iki ayrı bağlantı açılır. Bağlantı açmaq yavaşdır, həm də serverin yaddaşını və bağlantı limitini işlədir. Tətbiq böyüdükcə yüzlərlə bağlantı yaranır və verilənlər bazası limitə çatıb yeni sorğuları qəbul etməyə bilər. Üstəlik, hansı bağlantının hansı olduğunu izləmək çətinləşir.`,
        solution: `1. Konstruktor (obyekti yaradan xüsusi metod) kənardan çağırıla bilməz: Java, C++ və PHP-də private edilir, JavaScript nümunəsində isə kənardan çağırılanda xəta verir. Beləliklə, istənilən yerdə new yazmaq mümkün olmur. 2. Sinfin öz içində yaradılmış obyekti saxlayan instance dəyişəni var. Başlanğıcda o boşdur. 3. getInstance() çağırılanda belə olur: instance boşdursa, bağlantı bir dəfə yaradılıb saxlanır. Doludursa, əvvəl saxlanmış eyni bağlantı qaytarılır. 4. İstənilən səhifə DatabaseConnection.getInstance() yazır və həmişə eyni bağlantını alır. Demoda sağ tərəfə bax: üç dəyişənin hamısı eyni #1 bağlantısına baxır, yaradılan bağlantı sayı isə 1-dir.`,
        usedIn: [
          `Tətbiq ayarları (config): ayarlar fayldan bir dəfə oxunur və bütün proqram həmin eyni ayarları görür.`,
          `Verilənlər bazası bağlantısı: bir bağlantı açılır və bütün səhifələr onu paylaşır.`,
          `Logger (jurnal yazan sinif): proqramın hər yeri eyni jurnala ardıcıl yazır, yazılar bir-birinə qarışmır.`,
          `Keş (cache): məlumat bir yerdə saxlanılır ki, hər səhifə eyni məlumatı yenidən yükləməsin.`,
        ],
        avoid: `Singleton əslində istənilən yerdən əlçatan "qlobal dəyişən"dir. Onu hər yerdən dəyişmək olar və xəta olanda səbəbi tapmaq çətinləşir. Testlərdə də problem yaradır: bir test obyektin vəziyyətini dəyişsə, növbəti test onu dəyişmiş halda görür. Ona görə Singleton-u yalnız həqiqətən "bir dənə" olmalı olan şey üçün işlət.`,
        avoidWhen: [
          `Sinif heç nə yadda saxlamır və yaradılması bahalı deyil (məsələn, qiyməti formatlayan köməkçi). Adi funksiya kifayətdir.`,
          `Sinif sadə məlumat daşıyır (məsələn, istifadəçi: ad və e-poçt). Hər istifadəçi ayrı obyekt olmalıdır.`,
          `Kodu avtomatik testlərlə yoxlayırsan və hər testdə təmiz obyekt lazımdır. Singleton testlər arasında vəziyyəti saxlayır. Bu halda obyekti bir yerdə yaradıb lazım olan yerlərə parametr kimi vermək (buna asılılığı kənardan vermək, yəni dependency injection deyilir) daha yaxşıdır.`,
          `Gələcəkdə iki obyekt lazım ola bilər (məsələn, ikinci bir verilənlər bazasına qoşulmaq). Singleton bunu çətinləşdirir.`,
        ],
        overkillNote: `Lazımsız kodda PriceFormatter (qiyməti formatlayan sinif) Singleton edilib. Amma o heç nə yadda saxlamır və yaradılması da bahalı deyil: yalnız 5 rəqəmini "5.00 AZN" şəklinə salır. Yəni "yalnız bir dənə olsun" qaydasına ehtiyac yoxdur. Əvəzində gizli qlobal vəziyyət və testlərdə çətinlik qazanırıq. Adi funksiya eyni işi görür və təxminən 2 dəfə qısadır. Singleton o zaman yerinə düşür ki, obyekti yaratmaq bahalıdır, ya da iki nüsxə qarışıqlıq yaradır (məsələn, verilənlər bazası bağlantısı, ümumi ayarlar).`,
      },
      en: {
        summary: `Only one object of a class is ever created, and everyone uses that same object.`,
        analogy: `A city has just one city hall. For official business everyone goes to that same building, and nobody builds a new one for themselves. If everyone built their own, nobody could tell in which building a document was left. Singleton works the same way: the object is created once, and then that same object is used everywhere in the program.`,
        problem: `The app has a DatabaseConnection class used to connect to the database. In the bad code every page (for example users and orders) writes new DatabaseConnection() itself. As a result, two separate connections that do the same job are opened. Opening a connection is slow, and it also uses server memory and the connection limit. As the app grows, hundreds of connections appear, and the database may hit its limit and stop accepting new requests. On top of that, it becomes hard to keep track of which connection is which.`,
        solution: `1. The constructor (the special method that creates the object) cannot be called from outside: in Java, C++ and PHP it is private, and in the JavaScript sample it throws an error when called from outside. So writing new anywhere else is not possible. 2. The class has an instance variable that holds the created object. At the start it is empty. 3. When getInstance() is called: if instance is empty, the connection is created once and stored. If it is not empty, the same stored connection is returned. 4. Any page writes DatabaseConnection.getInstance() and always gets the same connection. Look at the right side of the demo: all three variables point to the same connection #1, and the number of connections created is 1.`,
        usedIn: [
          `App settings (config): settings are read from a file once, and the whole program sees the same settings.`,
          `Database connection: one connection is opened and all pages share it.`,
          `Logger (the class that writes the log): every part of the program writes to the same log in order, so the entries do not get mixed up.`,
          `Cache: data is kept in one place so that each page does not load the same data again.`,
        ],
        avoid: `A Singleton is really a "global variable" that can be reached from anywhere. It can be changed from anywhere, which makes bugs harder to track down. It also causes trouble in tests: if one test changes the object's state, the next test sees it changed. So use Singleton only for something that truly must exist exactly once.`,
        avoidWhen: [
          `The class remembers nothing and is cheap to create (for example a helper that formats prices). A plain function is enough.`,
          `The class just carries data (for example a user: name and email). Every user must be a separate object.`,
          `You check the code with automated tests and every test needs a clean object. A Singleton keeps its state between tests. In that case it is better to create the object in one place and pass it to the places that need it as a parameter (this is called dependency injection).`,
          `You may need two objects in the future (for example connecting to a second database). Singleton makes that harder.`,
        ],
        overkillNote: `In the over-complicated code, PriceFormatter (a class that formats prices) was made a Singleton. But it remembers nothing and is not expensive to create: it only turns the number 5 into "5.00 AZN". So the rule "there must be only one" is not needed. What we get instead is hidden global state and harder tests. A plain function does the same job and is about 2 times shorter. Singleton becomes justified when creating the object is expensive, or when two copies would cause confusion (for example a database connection or shared settings).`,
      },
    },
    diagram,
    diagramLabel: {
      az: 'Singleton diaqramı: bütün səhifələr getInstance() ilə eyni DatabaseConnection obyektini alır',
      en: 'Singleton diagram: all pages get the same DatabaseConnection object through getInstance()',
    },
    code,
    mount: (stage, lang) => DP.demos.singleton(stage, lang),
  });
})(window.DP);
