(function (DP) {
  const diagram = `<svg viewBox="0 0 520 240" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-facade" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0L10 5L0 10z" class="d-arrow"/>
    </marker>
  </defs>
  <rect class="d-box" x="10" y="90" width="100" height="60" rx="8"/>
  <text class="d-text" x="60" y="116" text-anchor="middle">Client</text>
  <text class="d-sub" x="60" y="134" text-anchor="middle">1 call</text>
  <path class="d-line" d="M110 120 L170 120" marker-end="url(#arr-facade)"/>
  <rect class="d-box-accent" x="170" y="80" width="150" height="80" rx="8"/>
  <text class="d-text" x="245" y="112" text-anchor="middle">Facade</text>
  <text class="d-sub" x="245" y="132" text-anchor="middle">watchMovie()</text>
  <text class="d-sub" x="245" y="148" text-anchor="middle">endMovie()</text>
  <path class="d-dash" d="M320 105 L380 40" marker-end="url(#arr-facade)"/>
  <path class="d-dash" d="M320 115 L380 93" marker-end="url(#arr-facade)"/>
  <path class="d-dash" d="M320 125 L380 147" marker-end="url(#arr-facade)"/>
  <path class="d-dash" d="M320 135 L380 200" marker-end="url(#arr-facade)"/>
  <rect class="d-box" x="380" y="15" width="130" height="50" rx="8"/>
  <text class="d-text" x="445" y="46" text-anchor="middle">Lights</text>
  <rect class="d-box" x="380" y="75" width="130" height="50" rx="8"/>
  <text class="d-text" x="445" y="106" text-anchor="middle">Projector</text>
  <rect class="d-box" x="380" y="135" width="130" height="50" rx="8"/>
  <text class="d-text" x="445" y="166" text-anchor="middle">Sound</text>
  <rect class="d-box" x="380" y="195" width="130" height="40" rx="8"/>
  <text class="d-text" x="445" y="220" text-anchor="middle">Player</text>
</svg>`;

  const code = {
    bad: {
      js: String.raw`// Every screen that plays a movie repeats the same steps, in this exact order
function playOnMainScreen() {
  lights.dim();
  projector.on();
  sound.on();
  player.on();
  player.play('Inception');
}

function playOnKidsScreen() {
  lights.dim();
  projector.on();
  sound.on();
  player.on();
  player.play('Frozen');   // forget one line (or swap two) and it breaks
}

// ...and the same 5 steps in reverse to switch everything off`,
      java: String.raw`class MainScreen {
    void playMovie(Lights lights, Projector projector, Sound sound, Player player) {
        // the client must know all 4 subsystems and the exact order
        lights.dim();
        projector.on();
        sound.on();
        player.on();
        player.play("Inception");
    }
}

class KidsScreen {
    void playMovie(Lights lights, Projector projector, Sound sound, Player player) {
        lights.dim();
        projector.on();
        sound.on();
        player.on();
        player.play("Frozen");   // forget one line (or swap two) and it breaks
    }
}`,
      cpp: String.raw`// Every client repeats the same steps, in this exact order
void playOnMainScreen(Lights& lights, Projector& projector, Sound& sound, Player& player) {
    lights.dim();
    projector.on();
    sound.on();
    player.on();
    player.play("Inception");
}

void playOnKidsScreen(Lights& lights, Projector& projector, Sound& sound, Player& player) {
    lights.dim();
    projector.on();
    sound.on();
    player.on();
    player.play("Frozen");   // forget one line (or swap two) and it breaks
}`,
      php: String.raw`<?php
class MainScreen
{
    public function playMovie(Lights $lights, Projector $projector, Sound $sound, Player $player): void
    {
        // the client must know all 4 subsystems and the exact order
        $lights->dim();
        $projector->on();
        $sound->on();
        $player->on();
        $player->play('Inception');
    }
}

class KidsScreen
{
    public function playMovie(Lights $lights, Projector $projector, Sound $sound, Player $player): void
    {
        $lights->dim();
        $projector->on();
        $sound->on();
        $player->on();
        $player->play('Frozen');   // forget one line (or swap two) and it breaks
    }
}`,
    },
    good: {
      js: String.raw`class HomeTheaterFacade {
  constructor(lights, projector, sound, player) {
    this.lights = lights;
    this.projector = projector;
    this.sound = sound;
    this.player = player;
  }

  watchMovie(title) {
    this.lights.dim();
    this.projector.on();
    this.sound.on();
    this.player.on();
    this.player.play(title);
  }

  endMovie() {
    this.player.stop();
    this.player.off();
    this.sound.off();
    this.projector.off();
    this.lights.bright();
  }
}

const theater = new HomeTheaterFacade(lights, projector, sound, player);
theater.watchMovie('Inception');   // one call instead of five
theater.endMovie();`,
      java: String.raw`class HomeTheaterFacade {
    private final Lights lights;
    private final Projector projector;
    private final Sound sound;
    private final Player player;

    HomeTheaterFacade(Lights l, Projector p, Sound s, Player pl) {
        this.lights = l;
        this.projector = p;
        this.sound = s;
        this.player = pl;
    }

    void watchMovie(String title) {
        lights.dim();
        projector.on();
        sound.on();
        player.on();
        player.play(title);
    }

    void endMovie() {
        player.stop();
        player.off();
        sound.off();
        projector.off();
        lights.bright();
    }
}

// usage
HomeTheaterFacade theater = new HomeTheaterFacade(lights, projector, sound, player);
theater.watchMovie("Inception");   // one call instead of five
theater.endMovie();`,
      cpp: String.raw`#include <string>

class HomeTheaterFacade {
    Lights& lights;
    Projector& projector;
    Sound& sound;
    Player& player;

public:
    HomeTheaterFacade(Lights& l, Projector& p, Sound& s, Player& pl)
        : lights(l), projector(p), sound(s), player(pl) {}

    void watchMovie(const std::string& title) {
        lights.dim();
        projector.on();
        sound.on();
        player.on();
        player.play(title);
    }

    void endMovie() {
        player.stop();
        player.off();
        sound.off();
        projector.off();
        lights.bright();
    }
};

// usage: HomeTheaterFacade theater(lights, projector, sound, player);
//        theater.watchMovie("Inception");   // one call instead of five`,
      php: String.raw`<?php
class HomeTheaterFacade
{
    public function __construct(
        private Lights $lights,
        private Projector $projector,
        private Sound $sound,
        private Player $player,
    ) {}

    public function watchMovie(string $title): void
    {
        $this->lights->dim();
        $this->projector->on();
        $this->sound->on();
        $this->player->on();
        $this->player->play($title);
    }

    public function endMovie(): void
    {
        $this->player->stop();
        $this->player->off();
        $this->sound->off();
        $this->projector->off();
        $this->lights->bright();
    }
}

// usage
$theater = new HomeTheaterFacade($lights, $projector, $sound, $player);
$theater->watchMovie('Inception');   // one call instead of five
$theater->endMovie();`,
    },
    // A facade over ONE class with ONE call: it only renames the call
    overkill: {
      js: String.raw`class Lamp {
  on() { console.log('Lamp is on'); }
}

// A "facade" over one class and one call: it hides nothing
class LampFacade {
  constructor(lamp) {
    this.lamp = lamp;
  }

  turnOn() {
    this.lamp.on();
  }
}

const facade = new LampFacade(new Lamp());
facade.turnOn();`,
      java: String.raw`class Lamp {
    void on() { System.out.println("Lamp is on"); }
}

// A "facade" over one class and one call: it hides nothing
class LampFacade {
    private final Lamp lamp;

    LampFacade(Lamp lamp) { this.lamp = lamp; }

    void turnOn() {
        lamp.on();
    }
}

// usage
LampFacade facade = new LampFacade(new Lamp());
facade.turnOn();`,
      cpp: String.raw`#include <iostream>

class Lamp {
public:
    void on() { std::cout << "Lamp is on\n"; }
};

// A "facade" over one class and one call: it hides nothing
class LampFacade {
    Lamp& lamp;

public:
    explicit LampFacade(Lamp& l) : lamp(l) {}

    void turnOn() {
        lamp.on();
    }
};

// usage: Lamp lamp; LampFacade facade(lamp); facade.turnOn();`,
      php: String.raw`<?php
class Lamp
{
    public function on(): void
    {
        echo "Lamp is on\n";
    }
}

// A "facade" over one class and one call: it hides nothing
class LampFacade
{
    public function __construct(private Lamp $lamp) {}

    public function turnOn(): void
    {
        $this->lamp->on();
    }
}

// usage
$facade = new LampFacade(new Lamp());
$facade->turnOn();`,
    },
    simple: {
      js: String.raw`class Lamp {
  on() { console.log('Lamp is on'); }
}

const lamp = new Lamp();
lamp.on();   // one class, one call: just use it directly`,
      java: String.raw`class Lamp {
    void on() { System.out.println("Lamp is on"); }
}

// usage
Lamp lamp = new Lamp();
lamp.on();   // one class, one call: just use it directly`,
      cpp: String.raw`#include <iostream>

class Lamp {
public:
    void on() { std::cout << "Lamp is on\n"; }
};

int main() {
    Lamp lamp;
    lamp.on();   // one class, one call: just use it directly
}`,
      php: String.raw`<?php
class Lamp
{
    public function on(): void
    {
        echo "Lamp is on\n";
    }
}

$lamp = new Lamp();
$lamp->on();   // one class, one call: just use it directly`,
    },
  };

  DP.register({
    id: 'facade',
    name: 'Facade',
    category: 'structural',
    text: {
      az: {
        summary: `Mürəkkəb bir sistemin qarşısına sadə bir "pult" qoyursan: bir düyməni basırsan, arxada çoxlu iş görülür.`,
        analogy: `Ev kinoteatrında "Filmə bax" düyməsi kimi. Əslində film izləmək üçün işığı azaltmaq, proyektoru, səs sistemini və pleyeri düzgün ardıcıllıqla açmaq lazımdır. Sən bunları ayrı-ayrı etmirsən, bir düyməni basırsan və pult hamısını sənin yerinə edir. Cihazlar öz yerində qalır, sadəcə sən onlarla birbaşa məşğul olmursan.`,
        problem: `Kinoteatrda dörd hissə var: lights, projector, sound və player. Pis kodda hər ekran (MainScreen, KidsScreen və s.) filmi başlatmaq üçün beş çağırışı özü yazır: lights.dim(), projector.on(), sound.on(), player.on(), player.play(...). Sıra da vacibdir: məsələn, işıq sönməmiş proyektoru açmaq olmaz. Bir sətri unudan və ya yerini dəyişən ekran səhv işləyir. Eyni beş sətir hər yerə kopyalanıb. Sabah yeni bir cihaz (məsələn, pərdə) əlavə olunsa, bütün ekranların kodunu tapıb dəyişməli olacaqsan.`,
        solution: `Beş çağırışı bir sinifə yığırıq: HomeTheaterFacade. Bu sinif dörd cihazı saxlayır və iki sadə metod verir: watchMovie(title) hamısını düzgün sıra ilə açır, endMovie() hamısını tərs sıra ilə bağlayır. İndi ekran yalnız theater.watchMovie("Inception") yazır. Cihazların adlarını və sırasını ekran bilmir, bunu yalnız fasad bilir. Yeni cihaz əlavə olunsa, yalnız HomeTheaterFacade-in içində bir sətir əlavə edirsən. Vacib: fasad cihazları gizlətmir və silmir. Lazım olsa, yenə player.play(...) kimi birbaşa çağırmaq olar.`,
        usedIn: [
          `jQuery və ya fetch(): fetch(url) arxada sorğunu qurur, göndərir, cavabı gözləyir. Sən isə bir sətir yazırsan.`,
          `Ödəniş SDK-ları: "ödəniş et" deyəndə arxada kart yoxlanılır, bank çağırılır, nəticə qeyd olunur.`,
          `Kompilyator: bir "compile" əmri arxada oxuma, analiz, optimallaşdırma və fayl yazma mərhələlərini ardıcıl işlədir.`,
          `Restoranda ofisiant: sən "bir burger" deyirsən, ofisiant aşpaza, kassaya və anbara özü müraciət edir.`,
        ],
        avoid: `Fasad hər sinfin qarşısına qoyulmur. Arxada yalnız bir sinif və ya bir çağırış varsa, fasad sadəcə əlavə bir qat yaradır və heç nəyi sadələşdirmir.`,
        avoidWhen: [
          `Arxada yalnız bir sinif və ya bir çağırış var. Fasad onu sadəcə təkrarlayır.`,
          `Müştəri üçün çağırışların sırası və sayı dəyişkəndir və hər yerdə fərqlidir. Hamısını bir metoda yığmaq mümkün deyil.`,
          `Alt sistemlər artıq sadədir və tək-tək istifadəsi aydındır.`,
          `Fasadın içinə get-gedə hər şeyi doldurursan və o, nəhəng bir sinfə çevrilir. Bu halda iş bölgüsü pozulur.`,
        ],
        overkillNote: `Lazımsız mürəkkəb kodda yalnız bir Lamp sinfi və bir on() çağırışı var. LampFacade isə sadəcə həmin çağırışı təkrarlayır: heç bir ardıcıllığı, heç bir mürəkkəbliyi gizlətmir. Bu, bir kranı açmaq üçün əlavə bir "kran pultu" qoymağa bənzəyir. Sadə həll lamp.on() yazmaqdır. Fasad o zaman yerinə düşər ki, bir işi görmək üçün bir neçə sinfi düzgün sırada çağırmaq lazım olsun və bu çağırışlar bir neçə yerdə təkrarlansın.`,
      },
      en: {
        summary: `You put one simple "remote" in front of a complicated system: you press one button and a lot of work happens behind it.`,
        analogy: `Like the "Watch movie" button of a home theater. To watch a film you really need to dim the lights and turn on the projector, the sound system and the player in the right order. You do not do these one by one: you press one button and the remote does it all for you. The devices stay where they are, you just do not deal with them directly.`,
        problem: `The theater has four parts: lights, projector, sound and player. In the bad code every screen (MainScreen, KidsScreen and so on) writes the five calls itself to start a movie: lights.dim(), projector.on(), sound.on(), player.on(), player.play(...). The order matters too: for example, you must not turn the projector on before the lights are dimmed. A screen that forgets a line or swaps two of them works wrongly. The same five lines are copied everywhere. If a new device (say, a curtain) is added tomorrow, you must find and change the code of every screen.`,
        solution: `We gather the five calls into one class: HomeTheaterFacade. It holds the four devices and offers two simple methods: watchMovie(title) turns everything on in the right order and endMovie() turns everything off in the reverse order. Now a screen only writes theater.watchMovie("Inception"). The screen does not know the names or the order of the devices, only the facade does. If a new device is added, you add one line inside HomeTheaterFacade only. Important: the facade does not hide or remove the devices. If needed, you can still call player.play(...) directly.`,
        usedIn: [
          `jQuery or fetch(): fetch(url) builds the request, sends it and waits for the answer behind the scenes. You write one line.`,
          `Payment SDKs: when you say "pay", the card is checked, the bank is called and the result is recorded behind the scenes.`,
          `A compiler: one "compile" command runs reading, analysis, optimisation and writing the file one after another behind the scenes.`,
          `A waiter in a restaurant: you say "one burger" and the waiter talks to the cook, the cashier and the storeroom for you.`,
        ],
        avoid: `A facade is not put in front of every class. If there is only one class or one call behind it, the facade just adds an extra layer and simplifies nothing.`,
        avoidWhen: [
          `There is only one class or one call behind it. The facade just repeats it.`,
          `The calls the client needs vary in order and number and differ everywhere. They cannot be gathered into one method.`,
          `The subsystems are already simple and it is clear how to use them one by one.`,
          `You keep stuffing everything into the facade until it becomes a giant class. Then the split of responsibilities is lost.`,
        ],
        overkillNote: `In the over-complicated code there is only one Lamp class and one on() call. LampFacade just repeats that call: it hides no order and no complexity. It is like adding an extra "tap remote" just to open a tap. The simple solution is to write lamp.on(). A facade fits when doing one job needs several classes called in the right order, and those calls are repeated in several places.`,
      },
    },
    diagram,
    diagramLabel: {
      az: 'Facade diaqramı: Client yalnız Facade-i çağırır, Facade isə alt sistemləri düzgün sırada çağırır',
      en: 'Facade diagram: the Client calls only the Facade, and the Facade calls the subsystems in the right order',
    },
    code,
    mount: (stage, lang) => DP.demos.facade(stage, lang),
  });
})(window.DP);
