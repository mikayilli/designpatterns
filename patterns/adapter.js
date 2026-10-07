(function (DP) {
  const diagram = `<svg viewBox="0 0 520 190" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-adapter" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0L10 5L0 10z" class="d-arrow"/>
    </marker>
  </defs>
  <rect class="d-box" x="10" y="55" width="130" height="80" rx="8"/>
  <text class="d-text" x="75" y="90" text-anchor="middle">App</text>
  <text class="d-sub" x="75" y="110" text-anchor="middle">needs celsius()</text>
  <path class="d-line" d="M140 95 L190 95" marker-end="url(#arr-adapter)"/>
  <rect class="d-box-accent" x="190" y="45" width="140" height="100" rx="8"/>
  <text class="d-text" x="260" y="82" text-anchor="middle">Adapter</text>
  <text class="d-sub" x="260" y="102" text-anchor="middle">celsius()</text>
  <text class="d-sub" x="260" y="122" text-anchor="middle">translates the call</text>
  <path class="d-line" d="M330 95 L380 95" marker-end="url(#arr-adapter)"/>
  <rect class="d-box" x="380" y="55" width="130" height="80" rx="8"/>
  <text class="d-text" x="445" y="85" text-anchor="middle">Sensor</text>
  <text class="d-sub" x="445" y="105" text-anchor="middle">readFahrenheit()</text>
  <text class="d-sub" x="445" y="123" text-anchor="middle">(cannot change)</text>
  <text class="d-sub" x="260" y="30" text-anchor="middle">same call on the left, different call on the right</text>
</svg>`;

  const code = {
    bad: {
      js: String.raw`// Third-party class: we cannot change it, it only speaks Fahrenheit
const sensor = new FahrenheitSensor();

// Screen 1: convert here...
const c1 = (sensor.readFahrenheit() - 32) * 5 / 9;
showOnDashboard(c1);

// Screen 2: ...and again here (copy-pasted formula)
const c2 = (sensor.readFahrenheit() - 32) * 5 / 9;
if (c2 > 30) sendHeatAlert(c2);

// Screen 3: someone forgot to convert, shows 86 instead of 30
showOnWidget(sensor.readFahrenheit());`,
      java: String.raw`// Third-party class: we cannot change it, it only speaks Fahrenheit
FahrenheitSensor sensor = new FahrenheitSensor();

// Screen 1: convert here...
double c1 = (sensor.readFahrenheit() - 32) * 5 / 9;
showOnDashboard(c1);

// Screen 2: ...and again here (copy-pasted formula)
double c2 = (sensor.readFahrenheit() - 32) * 5 / 9;
if (c2 > 30) sendHeatAlert(c2);

// Screen 3: someone forgot to convert, shows 86 instead of 30
showOnWidget(sensor.readFahrenheit());`,
      cpp: String.raw`// Third-party class: we cannot change it, it only speaks Fahrenheit
FahrenheitSensor sensor;

// Screen 1: convert here...
double c1 = (sensor.readFahrenheit() - 32) * 5 / 9;
showOnDashboard(c1);

// Screen 2: ...and again here (copy-pasted formula)
double c2 = (sensor.readFahrenheit() - 32) * 5 / 9;
if (c2 > 30) sendHeatAlert(c2);

// Screen 3: someone forgot to convert, shows 86 instead of 30
showOnWidget(sensor.readFahrenheit());`,
      php: String.raw`<?php
// Third-party class: we cannot change it, it only speaks Fahrenheit
$sensor = new FahrenheitSensor();

// Screen 1: convert here...
$c1 = ($sensor->readFahrenheit() - 32) * 5 / 9;
showOnDashboard($c1);

// Screen 2: ...and again here (copy-pasted formula)
$c2 = ($sensor->readFahrenheit() - 32) * 5 / 9;
if ($c2 > 30) sendHeatAlert($c2);

// Screen 3: someone forgot to convert, shows 86 instead of 30
showOnWidget($sensor->readFahrenheit());`,
    },
    good: {
      js: String.raw`// Third-party class (cannot be changed)
class FahrenheitSensor {
  readFahrenheit() { return 86; }
}

// What the app expects: any object with celsius()
class FahrenheitAdapter {
  constructor(sensor) { this.sensor = sensor; }

  celsius() {
    // the only place that knows the formula
    return (this.sensor.readFahrenheit() - 32) * 5 / 9;
  }
}

const temperature = new FahrenheitAdapter(new FahrenheitSensor());
console.log(temperature.celsius());  // 30`,
      java: String.raw`// What the app expects
interface Temperature {
    double celsius();
}

// Third-party class (cannot be changed)
class FahrenheitSensor {
    double readFahrenheit() { return 86; }
}

// The Adapter: looks like Temperature, talks to the sensor inside
class FahrenheitAdapter implements Temperature {
    private final FahrenheitSensor sensor;

    FahrenheitAdapter(FahrenheitSensor sensor) { this.sensor = sensor; }

    @Override
    public double celsius() {
        // the only place that knows the formula
        return (sensor.readFahrenheit() - 32) * 5 / 9;
    }
}

// usage
Temperature temperature = new FahrenheitAdapter(new FahrenheitSensor());
System.out.println(temperature.celsius());  // 30.0`,
      cpp: String.raw`#include <iostream>

// What the app expects
class Temperature {
public:
    virtual ~Temperature() = default;
    virtual double celsius() const = 0;
};

// Third-party class (cannot be changed)
class FahrenheitSensor {
public:
    double readFahrenheit() const { return 86; }
};

// The Adapter: looks like Temperature, talks to the sensor inside
class FahrenheitAdapter : public Temperature {
    const FahrenheitSensor& sensor;

public:
    explicit FahrenheitAdapter(const FahrenheitSensor& s) : sensor(s) {}

    double celsius() const override {
        // the only place that knows the formula
        return (sensor.readFahrenheit() - 32) * 5 / 9;
    }
};

int main() {
    FahrenheitSensor sensor;
    FahrenheitAdapter temperature(sensor);
    std::cout << temperature.celsius() << '\n';  // 30
}`,
      php: String.raw`<?php
// What the app expects
interface Temperature
{
    public function celsius(): float;
}

// Third-party class (cannot be changed)
class FahrenheitSensor
{
    public function readFahrenheit(): float { return 86; }
}

// The Adapter: looks like Temperature, talks to the sensor inside
class FahrenheitAdapter implements Temperature
{
    public function __construct(private FahrenheitSensor $sensor) {}

    public function celsius(): float
    {
        // the only place that knows the formula
        return ($this->sensor->readFahrenheit() - 32) * 5 / 9;
    }
}

// usage
$temperature = new FahrenheitAdapter(new FahrenheitSensor());
echo $temperature->celsius();  // 30`,
    },
    // Adapter used where the class ALREADY has the interface the app expects
    overkill: {
      js: String.raw`// CelsiusSensor already has celsius(), exactly what the app expects
class CelsiusSensor {
  celsius() { return 30; }
}

// ...but we still wrapped it in an adapter that translates nothing
class CelsiusAdapter {
  constructor(sensor) { this.sensor = sensor; }

  celsius() {
    return this.sensor.celsius();  // just forwards the call
  }
}

const temperature = new CelsiusAdapter(new CelsiusSensor());
console.log(temperature.celsius());  // 30`,
      java: String.raw`// What the app expects
interface Temperature {
    double celsius();
}

// CelsiusSensor already implements it...
class CelsiusSensor implements Temperature {
    public double celsius() { return 30; }
}

// ...but we still wrapped it in an adapter that translates nothing
class CelsiusAdapter implements Temperature {
    private final Temperature sensor;

    CelsiusAdapter(Temperature sensor) { this.sensor = sensor; }

    public double celsius() {
        return sensor.celsius();  // just forwards the call
    }
}

// usage
Temperature temperature = new CelsiusAdapter(new CelsiusSensor());
System.out.println(temperature.celsius());`,
      cpp: String.raw`#include <iostream>

// What the app expects
class Temperature {
public:
    virtual ~Temperature() = default;
    virtual double celsius() const = 0;
};

// CelsiusSensor already implements it...
class CelsiusSensor : public Temperature {
public:
    double celsius() const override { return 30; }
};

// ...but we still wrapped it in an adapter that translates nothing
class CelsiusAdapter : public Temperature {
    const Temperature& sensor;

public:
    explicit CelsiusAdapter(const Temperature& s) : sensor(s) {}
    double celsius() const override { return sensor.celsius(); }  // just forwards
};

int main() {
    CelsiusSensor sensor;
    CelsiusAdapter temperature(sensor);
    std::cout << temperature.celsius() << '\n';
}`,
      php: String.raw`<?php
// What the app expects
interface Temperature
{
    public function celsius(): float;
}

// CelsiusSensor already implements it...
class CelsiusSensor implements Temperature
{
    public function celsius(): float { return 30; }
}

// ...but we still wrapped it in an adapter that translates nothing
class CelsiusAdapter implements Temperature
{
    public function __construct(private Temperature $sensor) {}

    public function celsius(): float
    {
        return $this->sensor->celsius();  // just forwards the call
    }
}

// usage
$temperature = new CelsiusAdapter(new CelsiusSensor());
echo $temperature->celsius();`,
    },
    simple: {
      js: String.raw`// CelsiusSensor already has celsius(): use it directly
class CelsiusSensor {
  celsius() { return 30; }
}

const temperature = new CelsiusSensor();
console.log(temperature.celsius());  // 30`,
      java: String.raw`// CelsiusSensor already has celsius(): use it directly
interface Temperature {
    double celsius();
}

class CelsiusSensor implements Temperature {
    public double celsius() { return 30; }
}

// usage
Temperature temperature = new CelsiusSensor();
System.out.println(temperature.celsius());`,
      cpp: String.raw`#include <iostream>

// CelsiusSensor already has celsius(): use it directly
class CelsiusSensor {
public:
    double celsius() const { return 30; }
};

int main() {
    CelsiusSensor temperature;
    std::cout << temperature.celsius() << '\n';  // 30
}`,
      php: String.raw`<?php
// CelsiusSensor already has celsius(): use it directly
class CelsiusSensor
{
    public function celsius(): float { return 30; }
}

$temperature = new CelsiusSensor();
echo $temperature->celsius();  // 30`,
    },
  };

  DP.register({
    id: 'adapter',
    name: 'Adapter',
    category: 'structural',
    text: {
      az: {
        summary: `Bir-birinə uyğun gəlməyən iki şeyin arasına "tərcüməçi" qoyursan ki, onlar birlikdə işləyə bilsin.`,
        analogy: `Xarici ölkəyə səyahət edəndə telefonun şarj cihazının fişi oradakı rozetkaya oturmur. Nə şarj cihazını, nə də rozetkanı dəyişirsən, sadəcə aralarına adapter qoyursan. Adapter bir tərəfdən sənin fişini qəbul edir, o biri tərəfdən rozetkanın istədiyi formada çıxış verir. Hər iki tərəf olduğu kimi qalır, uyğunsuzluğu yalnız adapter həll edir.`,
        problem: `Tətbiqimiz temperaturu Selsi ilə göstərir. Hazır sensor sinfi (FahrenheitSensor) isə başqasının yazdığı koddur və yalnız readFahrenheit() verir, yəni Fahrenheit. Pis kodda tətbiqin hər yerində sensor.readFahrenheit() çağırılır və hər yerdə eyni (f - 32) * 5 / 9 düsturu yenidən yazılır. Düsturu bir yerdə səhv yazsan və ya çevirməyi unutsan, ekranlardan biri səhv rəqəm göstərəcək (30 əvəzinə 86). Sabah sensoru başqa istehsalçının sensoru ilə əvəz etsən, bütün bu yerləri tək-tək tapıb dəyişməli olacaqsan, çünki sensorun "dili" tətbiqin hər yerinə yayılıb.`,
        solution: `Əvvəlcə tətbiqin istədiyi forma bir dəfə müəyyən edilir: Temperature, yəni içində yalnız celsius() olan şey. Sensor sinfinə toxunmuruq, çünki o başqasının kodudur. Əvəzində FahrenheitAdapter adlı yeni sinif yazırıq: o kənardan Temperature kimi görünür, içində isə sensoru saxlayır. Kimsə temperature.celsius() çağıranda adapter içəridə sensor.readFahrenheit() çağırır, nəticəni Selsiyə çevirir və qaytarır. Tətbiqin qalan hissəsi yalnız celsius() bilir və sensorun Fahrenheit ilə işlədiyindən xəbərsizdir. Düstur tək yerdədir. Sabah sensoru dəyişsən, yalnız adapteri dəyişirsən.`,
        usedIn: [
          `Ödəniş xidmətləri: tətbiq yalnız pay(amount) bilir, amma hər ödəniş sisteminin (Stripe, PayPal və s.) öz fərqli çağırışları var. Hər biri üçün ayrıca adapter yazılır.`,
          `Köhnə sistemlər: bank köhnə sistemi XML formatında danışır, yeni tətbiq isə JSON-da. Aralarındakı adapter formatı çevirir, heç bir tərəf yenidən yazılmır.`,
          `Verilənlər bazası sürücüləri (məsələn JDBC): Java kodu həmişə eyni çağırışları yazır, hər bazanın sürücüsü onları həmin bazanın öz dilinə tərcümə edir.`,
          `USB-C → HDMI çevirici: noutbukun çıxışı bir formadadır, monitorun girişi başqa. Çevirici ikisini uyğunlaşdırır, nə noutbuku, nə monitoru dəyişirsən.`,
        ],
        avoid: `Sinfi özün dəyişə bilirsənsə, adapter yazmaq əvəzinə metodun adını birbaşa düzəlt. Adapter əsasən dəyişə bilmədiyin kod (kənar kitabxana, köhnə sistem) üçündür.`,
        avoidWhen: [
          `Sinif artıq tətbiqin gözlədiyi interfeysə malikdir. Adapter yalnız hər çağırışı olduğu kimi ötürəcək, yəni heç nəyi tərcümə etməyəcək.`,
          `Sinif sənin öz kodundur. Metodu və ya formatı özün dəyişə bilirsən, ayrıca "tərcüməçi" yazmaq lazım deyil.`,
          `Kənar sinif yalnız bir yerdə, bir dəfə çağırılır və çevirmə bir sətirdir. Orada birbaşa çevirmək daha sadədir.`,
          `Uyğunsuzluq çox böyükdür və adapter yarım tətbiq həcmində kod tələb edir. Onda başqa kitabxana seçmək və ya həmin hissəni yenidən yazmaq daha ağıllıdır.`,
        ],
        overkillNote: `Lazımsız mürəkkəb kodda CelsiusSensor artıq celsius() metoduna malikdir, yəni tətbiqin istədiyi formadadır. Buna baxmayaraq CelsiusAdapter yazılıb və o yalnız hər çağırışı olduğu kimi ötürür, heç nəyi tərcümə etmir. Bu, eyni dildə danışan iki adamın arasına tərcüməçi qoymağa bənzəyir: əlavə sinif var, qazanc yoxdur. Sadə həll sensoru birbaşa istifadə edir. Sabah formatı fərqli (məsələn, Fahrenheit verən) bir sensor da əlavə olunsa və sən onun kodunu dəyişə bilməsən, onda Adapter yerinə düşəcək.`,
      },
      en: {
        summary: `You put a "translator" between two things that do not fit together, so that they can work together.`,
        analogy: `When you travel abroad, your phone charger's plug does not fit the local socket. You change neither the charger nor the socket, you just put an adapter between them. The adapter accepts your plug on one side and gives the socket the shape it wants on the other. Both sides stay exactly as they were, and only the adapter solves the mismatch.`,
        problem: `Our app shows temperature in Celsius. The ready-made sensor class (FahrenheitSensor) is someone else's code and only offers readFahrenheit(), which is Fahrenheit. In the bad code the whole app calls sensor.readFahrenheit() and the same (f - 32) * 5 / 9 formula is written again in every place. If you get the formula wrong in one place or forget to convert, one of the screens shows a wrong number (86 instead of 30). If tomorrow you replace the sensor with another maker's sensor, you have to find and change all these places one by one, because the sensor's "language" has spread across the whole app.`,
        solution: `First, the shape the app wants is defined once: Temperature, meaning something that has only celsius(). We do not touch the sensor class, because it is someone else's code. Instead we write a new class, FahrenheitAdapter: from the outside it looks like a Temperature, and inside it holds the sensor. When someone calls temperature.celsius(), the adapter calls sensor.readFahrenheit() inside, converts the result to Celsius and returns it. The rest of the app knows only celsius() and has no idea the sensor works in Fahrenheit. The formula lives in one place. If you change the sensor tomorrow, you change only the adapter.`,
        usedIn: [
          `Payment services: the app only knows pay(amount), but every payment system (Stripe, PayPal, etc.) has its own different calls. One adapter is written for each.`,
          `Legacy systems: a bank's old system speaks XML while the new app speaks JSON. An adapter between them converts the format, and neither side is rewritten.`,
          `Database drivers (for example JDBC): Java code always writes the same calls, and each database's driver translates them into that database's own language.`,
          `A USB-C to HDMI converter: the laptop's output has one shape and the monitor's input another. The converter fits them together, and you change neither the laptop nor the monitor.`,
        ],
        avoid: `If you can change the class yourself, fix the method name directly instead of writing an adapter. Adapter is mainly for code you cannot change (an outside library, a legacy system).`,
        avoidWhen: [
          `The class already has the interface the app expects. The adapter would only pass every call through unchanged, so it translates nothing.`,
          `The class is your own code. You can change the method or the format yourself, so a separate "translator" is not needed.`,
          `The outside class is called in only one place, once, and the conversion is one line. Converting directly there is simpler.`,
          `The mismatch is huge and the adapter would need about half an app of code. Then choosing another library or rewriting that part is wiser.`,
        ],
        overkillNote: `In the over-complicated code, CelsiusSensor already has celsius(), which is exactly the shape the app expects. Even so, a CelsiusAdapter was written, and it only passes each call through, translating nothing. It is like putting an interpreter between two people who speak the same language: there is an extra class and no gain. The simple solution uses the sensor directly. If tomorrow a sensor with a different format (say, one that gives Fahrenheit) is added and you cannot change its code, that is when Adapter fits.`,
      },
    },
    diagram,
    diagramLabel: {
      az: 'Adapter diaqramı: tətbiq celsius() çağırır, Adapter onu sensorun readFahrenheit() çağırışına tərcümə edir',
      en: 'Adapter diagram: the app calls celsius(), the Adapter translates it into the sensor\'s readFahrenheit() call',
    },
    code,
    mount: (stage, lang) => DP.demos.adapter(stage, lang),
  });
})(window.DP);
