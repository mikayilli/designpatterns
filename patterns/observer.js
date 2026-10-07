(function (DP) {
  const diagram = `<svg viewBox="0 0 520 220" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-observer" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0L10 5L0 10z" class="d-arrow"/>
    </marker>
  </defs>
  <rect class="d-box-accent" x="20" y="75" width="160" height="70" rx="8"/>
  <text class="d-text" x="100" y="105" text-anchor="middle">Subject</text>
  <text class="d-sub" x="100" y="125" text-anchor="middle">subscribe() · notify()</text>
  <path class="d-line" d="M180 100 L340 42" marker-end="url(#arr-observer)"/>
  <path class="d-line" d="M180 110 L340 110" marker-end="url(#arr-observer)"/>
  <path class="d-line" d="M180 120 L340 178" marker-end="url(#arr-observer)"/>
  <text class="d-sub" x="236" y="94" text-anchor="middle">notify()</text>
  <rect class="d-box" x="340" y="15" width="160" height="55" rx="8"/>
  <text class="d-text" x="420" y="38" text-anchor="middle">Observer A</text>
  <text class="d-sub" x="420" y="56" text-anchor="middle">update()</text>
  <rect class="d-box" x="340" y="83" width="160" height="55" rx="8"/>
  <text class="d-text" x="420" y="106" text-anchor="middle">Observer B</text>
  <text class="d-sub" x="420" y="124" text-anchor="middle">update()</text>
  <rect class="d-box" x="340" y="151" width="160" height="55" rx="8"/>
  <text class="d-text" x="420" y="174" text-anchor="middle">Observer C</text>
  <text class="d-sub" x="420" y="192" text-anchor="middle">update()</text>
</svg>`;

  const code = {
    bad: {
      js: String.raw`class WeatherStation {
  constructor(phoneApp, webWidget) {
    this.phoneApp = phoneApp;
    this.webWidget = webWidget;
  }

  setTemperature(t) {
    this.phoneApp.update(t);   // must know every consumer
    this.webWidget.update(t);  // new display = edit this class
  }
}`,
      java: String.raw`class WeatherStation {
    private PhoneApp phoneApp;
    private WebWidget webWidget;

    WeatherStation(PhoneApp phoneApp, WebWidget webWidget) {
        this.phoneApp = phoneApp;
        this.webWidget = webWidget;
    }

    void setTemperature(double t) {
        phoneApp.update(t);   // must know every consumer
        webWidget.update(t);  // new display = edit this class
    }
}`,
      cpp: String.raw`class WeatherStation {
    PhoneApp& phoneApp;
    WebWidget& webWidget;

public:
    WeatherStation(PhoneApp& p, WebWidget& w) : phoneApp(p), webWidget(w) {}

    void setTemperature(double t) {
        phoneApp.update(t);   // must know every consumer
        webWidget.update(t);  // new display = edit this class
    }
};`,
      php: String.raw`<?php
class WeatherStation
{
    public function __construct(
        private PhoneApp $phoneApp,
        private WebWidget $webWidget,
    ) {}

    public function setTemperature(float $t): void
    {
        $this->phoneApp->update($t);   // must know every consumer
        $this->webWidget->update($t);  // new display = edit this class
    }
}`,
    },
    good: {
      js: String.raw`class WeatherStation {
  #listeners = [];

  subscribe(fn) { this.#listeners.push(fn); }
  unsubscribe(fn) { this.#listeners = this.#listeners.filter((l) => l !== fn); }

  setTemperature(t) {
    this.#listeners.forEach((fn) => fn(t));
  }
}

const station = new WeatherStation();
station.subscribe((t) => console.log('Phone:', t));
station.subscribe((t) => console.log('Web:', t));
station.setTemperature(25);`,
      java: String.raw`import java.util.ArrayList;
import java.util.List;

interface Observer {
    void update(double temperature);
}

class WeatherStation {
    private final List<Observer> observers = new ArrayList<>();

    void subscribe(Observer o)   { observers.add(o); }
    void unsubscribe(Observer o) { observers.remove(o); }

    void setTemperature(double t) {
        for (Observer o : observers) o.update(t);
    }
}

// usage
WeatherStation station = new WeatherStation();
station.subscribe(t -> System.out.println("Phone: " + t));
station.subscribe(t -> System.out.println("Web: " + t));
station.setTemperature(25);`,
      cpp: String.raw`#include <functional>
#include <iostream>
#include <utility>
#include <vector>

class WeatherStation {
    std::vector<std::function<void(double)>> listeners;

public:
    // to support unsubscribe, return an id/token from subscribe()
    void subscribe(std::function<void(double)> fn) {
        listeners.push_back(std::move(fn));
    }

    void setTemperature(double t) {
        for (auto& fn : listeners) fn(t);
    }
};

int main() {
    WeatherStation station;
    station.subscribe([](double t) { std::cout << "Phone: " << t << '\n'; });
    station.subscribe([](double t) { std::cout << "Web: " << t << '\n'; });
    station.setTemperature(25);
}`,
      php: String.raw`<?php
interface Observer
{
    public function update(float $temperature): void;
}

class WeatherStation
{
    /** @var Observer[] */
    private array $observers = [];

    public function subscribe(Observer $o): void
    {
        $this->observers[] = $o;
    }

    public function unsubscribe(Observer $o): void
    {
        $this->observers = array_values(array_filter(
            $this->observers,
            fn (Observer $x) => $x !== $o
        ));
    }

    public function setTemperature(float $t): void
    {
        foreach ($this->observers as $o) {
            $o->update($t);
        }
    }
}`,
    },
    // Observer used where only ONE place ever needs the news, and the plain version
    overkill: {
      js: String.raw`// Only ONE place ever shows the cart count,
// but a whole subscribe/notify system was built for it
class CartCount {
  #listeners = [];
  subscribe(fn) { this.#listeners.push(fn); }
  unsubscribe(fn) { this.#listeners = this.#listeners.filter((l) => l !== fn); }
  notify(value) { this.#listeners.forEach((fn) => fn(value)); }
}

let items = 0;
const badge = document.querySelector('#badge');
const cartCount = new CartCount();
cartCount.subscribe((n) => { badge.textContent = n; });  // the only subscriber, forever

function addToCart() {
  items += 1;
  cartCount.notify(items);
}`,
      java: String.raw`import java.util.ArrayList;
import java.util.List;

// Only ONE place ever shows the cart count,
// but a whole subscribe/notify system was built for it
interface CartObserver {
    void onCountChanged(int count);
}

class Cart {
    private final List<CartObserver> observers = new ArrayList<>();
    private int items = 0;

    void subscribe(CartObserver o) { observers.add(o); }

    void addItem() {
        items++;
        for (CartObserver o : observers) o.onCountChanged(items);
    }
}

// usage: the only observer that will ever exist
Cart cart = new Cart();
cart.subscribe(count -> badge.setText(String.valueOf(count)));
cart.addItem();`,
      cpp: String.raw`#include <functional>
#include <string>
#include <utility>
#include <vector>

// Only ONE place ever shows the cart count,
// but a whole subscribe/notify system was built for it
class Cart {
    std::vector<std::function<void(int)>> observers;
    int items = 0;

public:
    void subscribe(std::function<void(int)> fn) { observers.push_back(std::move(fn)); }

    void addItem() {
        ++items;
        for (auto& fn : observers) fn(items);
    }
};

// usage: the only observer that will ever exist
Cart cart;
cart.subscribe([&](int n) { badge.setText(std::to_string(n)); });
cart.addItem();`,
      php: String.raw`<?php
// Only ONE place ever shows the cart count,
// but a whole subscribe/notify system was built for it
interface CartObserver
{
    public function onCountChanged(int $count): void;
}

class BadgeObserver implements CartObserver
{
    public function onCountChanged(int $count): void
    {
        echo "Cart: $count";
    }
}

class Cart
{
    /** @var CartObserver[] */
    private array $observers = [];
    private int $items = 0;

    public function subscribe(CartObserver $o): void { $this->observers[] = $o; }

    public function addItem(): void
    {
        $this->items++;
        foreach ($this->observers as $o) {
            $o->onCountChanged($this->items);
        }
    }
}

// usage: the only observer that will ever exist
$cart = new Cart();
$cart->subscribe(new BadgeObserver());
$cart->addItem();`,
    },
    simple: {
      js: String.raw`let items = 0;
const badge = document.querySelector('#badge');

function addToCart() {
  items += 1;
  badge.textContent = items;  // one place to update: just do it directly
}`,
      java: String.raw`class Cart {
    private int items = 0;
    private final Label badge;   // the one place that shows the count

    Cart(Label badge) { this.badge = badge; }

    void addItem() {
        items++;
        badge.setText(String.valueOf(items));   // just update it directly
    }
}`,
      cpp: String.raw`#include <string>

class Cart {
    int items = 0;
    Label& badge;   // the one place that shows the count

public:
    explicit Cart(Label& b) : badge(b) {}

    void addItem() {
        ++items;
        badge.setText(std::to_string(items));   // just update it directly
    }
};`,
      php: String.raw`<?php
class Cart
{
    private int $items = 0;

    public function addItem(): void
    {
        $this->items++;
        echo "Cart: {$this->items}";   // one place to show it: just do it directly
    }
}`,
    },
  };

  DP.register({
    id: 'observer',
    name: 'Observer',
    category: 'behavioral',
    text: {
      az: {
        summary: `Bir şey dəyişəndə, onu izləmək istəyənlərin hamısına avtomatik xəbər verilir.`,
        analogy: `YouTube kanalına abunə olmaq kimi. Kanal sahibi yeni video yükləyəndə abunə olanların hamısına bildiriş gedir. Kanal sahibi hər abunəçini tanımır və onların bildirişlə nə etdiyini bilmir. O, sadəcə "abunə olanların hamısına xəbər ver" əmrini yerinə yetirir. İstəyən abunə olur, istəyən abunəlikdən çıxır, kanal sahibinin işi dəyişmir.`,
        problem: `Hava stansiyası temperaturu ölçür, telefon tətbiqi və veb səhifə isə onu göstərir. Pis kodda stansiyanın içinə telefonun və veb səhifənin adı birbaşa yazılıb: phoneApp.update(t), webWidget.update(t). Üçüncü ekran (məsələn, ağıllı saat) əlavə etmək istəsən, stansiyanın kodunu açıb dəyişməli olacaqsan. Hər yeni ekran = stansiyada yeni dəyişiklik. Stansiya ilə ekranlar bir-birinə bərk bağlanıb.`,
        solution: `Stansiya ekranların kim olduğunu bilməyə ehtiyac duymur. O, yalnız "xəbər gözləyənlər" siyahısını saxlayır. Temperatur dəyişəndə siyahıdakı hər kəsi eyni şəkildə çağırır: "temperatur dəyişdi, al". Siyahıdakının telefon, veb səhifə və ya saat olması stansiyanı maraqlandırmır, çünki hamısı bir funksiya kimi çağırıla bilir. Xəbəri necə göstərmək hər ekranın öz işidir. Yeni ekran əlavə etmək üçün stansiyaya toxunmaq lazım deyil, sadəcə subscribe() çağırırsan. İşi bitən ekran unsubscribe() ilə siyahıdan çıxır.`,
        usedIn: [
          `Brauzerdə düymə kliki: button.addEventListener('click', ...) yazanda brauzerə "klik olanda mənə xəbər ver" deyirsən.`,
          `Redux / Vuex: məlumat (store) dəyişəndə ona abunə olan komponentlər avtomatik yenilənir.`,
          `YouTube kanalı: yeni video çıxanda abunəçilərin hamısına bildiriş gedir.`,
          `Onlayn mağaza: məhsul yenidən anbara gələndə "xəbər ver" düyməsini basanların hamısına e-poçt göndərilir.`,
        ],
        avoid: `Observer hər yerdə lazım deyil. Xəbər veriləcək yalnız bir yer varsa, onu birbaşa çağırmaq daha sadə və daha aydındır. Observer isə kimin nə vaxt xəbər aldığını izləməyi çətinləşdirə bilər.`,
        avoidWhen: [
          `Xəbər veriləcək yalnız bir yer var və gələcəkdə də olacaq. Məsələn, səbətdəki məhsul sayını yalnız bir rəqəmdə göstərmək.`,
          `Xəbər verən və xəbər alan bir-birinin yanındadır (eyni sinif və ya yan-yana fayl). Birbaşa çağırış daha aydındır.`,
          `Xəbərlərin işləmə ardıcıllığı vacibdir (əvvəl A, sonra B işləməlidir). Observer-də abunəçilərin sırasına güvənmək risklidir.`,
          `İşi bitən abunəçini siyahıdan çıxarmağı (unsubscribe) təmin edə bilmirsənsə. Belə abunəçi lazımsız yerə işləməyə davam edir və yaddaşı doldurur (yaddaş sızması).`,
        ],
        overkillNote: `Lazımsız mürəkkəb kodda səbətdəki məhsul sayı yalnız bir yerdə (rozetkada) göstərilir. Buna baxmayaraq abunə siyahısı, subscribe, unsubscribe və notify yazılıb. Bu, bir nəfərə zəng etmək üçün bütöv bir zəng mərkəzi qurmağa bənzəyir: kod uzundur, amma heç nə qazandırmır. Sadə həll eyni işi görür və təxminən 3 dəfə qısadır. Əgər sabah həmin sayı başlıqda, bildirişdə və hesabatda da göstərmək lazım olsa, onda Observer yerinə düşəcək.`,
      },
      en: {
        summary: `When something changes, everyone who wanted to follow it is told automatically.`,
        analogy: `Like subscribing to a YouTube channel. When the owner uploads a video, every subscriber gets a notification. The owner does not know each subscriber personally and does not know what they do with the notification. They just carry out one command: "tell everyone who subscribed". Anyone can subscribe or unsubscribe, and the owner's job stays the same.`,
        problem: `A weather station measures the temperature, and a phone app and a web page display it. In the bad code the names of the phone and the web page are written directly inside the station: phoneApp.update(t), webWidget.update(t). If you want a third display (say, a smart watch), you have to open the station's code and change it. Every new display = a new change in the station. The station and the displays are tightly glued together.`,
        solution: `The station does not need to know who the displays are. It only keeps a list of "those waiting for news". When the temperature changes, it calls everyone on the list in the same way: "temperature changed, here it is". Whether a list entry is a phone, a web page or a watch does not matter to the station, because all of them can be called like a function. How to show the news is each display's own job. To add a new display you do not touch the station, you just call subscribe(). A display that is done calls unsubscribe() to leave the list.`,
        usedIn: [
          `A button click in the browser: when you write button.addEventListener('click', ...) you tell the browser "let me know when it is clicked".`,
          `Redux / Vuex: when the data (store) changes, the components subscribed to it update automatically.`,
          `A YouTube channel: when a new video comes out, every subscriber gets a notification.`,
          `An online shop: when a product is back in stock, everyone who pressed "notify me" gets an email.`,
        ],
        avoid: `Observer is not needed everywhere. If there is only one place to notify, calling it directly is simpler and clearer. Observer can make it harder to follow who is notified and when.`,
        avoidWhen: [
          `There is only one place to notify, and there will only ever be one. For example, showing the cart count in a single badge.`,
          `The sender and the receiver sit next to each other (same class or neighbouring files). A direct call is clearer.`,
          `The order in which things run matters (A must run before B). Relying on the order of subscribers in Observer is risky.`,
          `You cannot guarantee that a finished subscriber is removed from the list (unsubscribe). It keeps working for nothing and fills up memory (a memory leak).`,
        ],
        overkillNote: `In the over-complicated code the cart count is shown in just one place (a badge). Even so, a subscriber list, subscribe, unsubscribe and notify were written. It is like building a whole call centre just to phone one person: the code is long and gains nothing. The simple solution does the same job and is about 3 times shorter. If tomorrow the same count must also appear in the header, a notification and a report, that is when Observer fits.`,
      },
    },
    diagram,
    diagramLabel: {
      az: 'Observer diaqramı: Subject abunəçilərin hamısına notify() göndərir',
      en: 'Observer diagram: the Subject sends notify() to every subscribed Observer',
    },
    code,
    mount: (stage, lang) => DP.demos.observer(stage, lang),
  });
})(window.DP);
