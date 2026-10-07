(function (DP) {
  const diagram = `<svg viewBox="0 0 520 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-proxy" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0L10 5L0 10z" class="d-arrow"/>
    </marker>
  </defs>
  <rect class="d-box" x="10" y="70" width="100" height="60" rx="8"/>
  <text class="d-text" x="60" y="96" text-anchor="middle">Client</text>
  <text class="d-sub" x="60" y="114" text-anchor="middle">display()</text>
  <path class="d-line" d="M110 100 L180 100" marker-end="url(#arr-proxy)"/>
  <rect class="d-box-accent" x="180" y="60" width="150" height="80" rx="8"/>
  <text class="d-text" x="255" y="92" text-anchor="middle">ImageProxy</text>
  <text class="d-sub" x="255" y="112" text-anchor="middle">check · cache</text>
  <text class="d-sub" x="255" y="128" text-anchor="middle">display()</text>
  <path class="d-dash" d="M330 100 L395 100" marker-end="url(#arr-proxy)"/>
  <text class="d-sub" x="362" y="90" text-anchor="middle">1st time</text>
  <rect class="d-box" x="395" y="70" width="115" height="60" rx="8"/>
  <text class="d-text" x="452" y="96" text-anchor="middle">RealImage</text>
  <text class="d-sub" x="452" y="114" text-anchor="middle">display()</text>
  <text class="d-sub" x="255" y="175" text-anchor="middle">same interface: the Client cannot tell them apart</text>
</svg>`;

  const code = {
    bad: {
      js: String.raw`class RealImage {
  constructor(file) {
    this.file = file;
    console.log('Loading ' + file + '...');   // slow and heavy
  }
  display() { console.log('Showing ' + this.file); }
}

class Gallery {
  constructor(files) {
    // every image is loaded right now, even if nobody ever opens it
    this.images = files.map((f) => new RealImage(f));
  }
  show(i) { this.images[i].display(); }
}

const gallery = new Gallery(['a.jpg', 'b.jpg', 'c.jpg']);   // 3 loads at startup
gallery.show(0);`,
      java: String.raw`import java.util.ArrayList;
import java.util.List;

class RealImage {
    private final String file;

    RealImage(String file) {
        this.file = file;
        System.out.println("Loading " + file + "...");   // slow and heavy
    }

    void display() { System.out.println("Showing " + file); }
}

class Gallery {
    private final List<RealImage> images = new ArrayList<>();

    Gallery(List<String> files) {
        // every image is loaded right now, even if nobody ever opens it
        for (String f : files) images.add(new RealImage(f));
    }

    void show(int i) { images.get(i).display(); }
}

// new Gallery(List.of("a.jpg", "b.jpg", "c.jpg")) -> 3 loads at startup`,
      cpp: String.raw`#include <iostream>
#include <string>
#include <utility>
#include <vector>

class RealImage {
    std::string file;

public:
    explicit RealImage(std::string f) : file(std::move(f)) {
        std::cout << "Loading " << file << "...\n";   // slow and heavy
    }
    void display() const { std::cout << "Showing " << file << '\n'; }
};

class Gallery {
    std::vector<RealImage> images;

public:
    explicit Gallery(const std::vector<std::string>& files) {
        // every image is loaded right now, even if nobody ever opens it
        for (const auto& f : files) images.emplace_back(f);
    }
    void show(std::size_t i) const { images.at(i).display(); }
};`,
      php: String.raw`<?php
class RealImage
{
    public function __construct(private string $file)
    {
        echo "Loading {$file}...\n";   // slow and heavy
    }

    public function display(): void
    {
        echo "Showing {$this->file}\n";
    }
}

class Gallery
{
    /** @var RealImage[] */
    private array $images;

    public function __construct(array $files)
    {
        // every image is loaded right now, even if nobody ever opens it
        $this->images = array_map(fn (string $f) => new RealImage($f), $files);
    }

    public function show(int $i): void
    {
        $this->images[$i]->display();
    }
}`,
    },
    good: {
      js: String.raw`class RealImage {
  constructor(file) {
    this.file = file;
    console.log('Loading ' + file + '...');   // slow and heavy
  }
  display() { console.log('Showing ' + this.file); }
}

// Same interface as RealImage: display()
class ImageProxy {
  #real = null;

  constructor(file) { this.file = file; }

  display() {
    this.#real ??= new RealImage(this.file);   // load only the first time
    this.#real.display();                      // later calls reuse it
  }
}

const gallery = ['a.jpg', 'b.jpg', 'c.jpg'].map((f) => new ImageProxy(f));  // 0 loads
gallery[0].display();   // Loading a.jpg... + Showing a.jpg
gallery[0].display();   // Showing a.jpg (no new load)`,
      java: String.raw`interface Image {
    void display();
}

class RealImage implements Image {
    private final String file;

    RealImage(String file) {
        this.file = file;
        System.out.println("Loading " + file + "...");   // slow and heavy
    }

    public void display() { System.out.println("Showing " + file); }
}

class ImageProxy implements Image {
    private final String file;
    private RealImage real;   // created later, on demand

    ImageProxy(String file) { this.file = file; }

    public void display() {
        if (real == null) real = new RealImage(file);   // load only the first time
        real.display();                                 // later calls reuse it
    }
}

// usage
Image img = new ImageProxy("a.jpg");   // nothing loaded yet
img.display();   // Loading a.jpg... + Showing a.jpg
img.display();   // Showing a.jpg (no new load)`,
      cpp: String.raw`#include <iostream>
#include <memory>
#include <string>
#include <utility>

class Image {
public:
    virtual ~Image() = default;
    virtual void display() = 0;
};

class RealImage : public Image {
    std::string file;

public:
    explicit RealImage(std::string f) : file(std::move(f)) {
        std::cout << "Loading " << file << "...\n";   // slow and heavy
    }
    void display() override { std::cout << "Showing " << file << '\n'; }
};

class ImageProxy : public Image {
    std::string file;
    std::unique_ptr<RealImage> real;   // created later, on demand

public:
    explicit ImageProxy(std::string f) : file(std::move(f)) {}

    void display() override {
        if (!real) real = std::make_unique<RealImage>(file);   // load only the first time
        real->display();                                       // later calls reuse it
    }
};`,
      php: String.raw`<?php
interface Image
{
    public function display(): void;
}

class RealImage implements Image
{
    public function __construct(private string $file)
    {
        echo "Loading {$file}...\n";   // slow and heavy
    }

    public function display(): void
    {
        echo "Showing {$this->file}\n";
    }
}

class ImageProxy implements Image
{
    private ?RealImage $real = null;   // created later, on demand

    public function __construct(private string $file) {}

    public function display(): void
    {
        $this->real ??= new RealImage($this->file);   // load only the first time
        $this->real->display();                       // later calls reuse it
    }
}

// usage
$img = new ImageProxy('a.jpg');   // nothing loaded yet
$img->display();   // Loading a.jpg... + Showing a.jpg
$img->display();   // Showing a.jpg (no new load)`,
    },
    // A proxy that only forwards every call: no lazy loading, no cache, no access check
    overkill: {
      js: String.raw`class Icon {
  display() { console.log('Showing the 16px save icon'); }
}

// This proxy only forwards the call. It adds nothing.
class IconProxy {
  constructor(icon) { this.icon = icon; }

  display() {
    this.icon.display();
  }
}

const icon = new IconProxy(new Icon());
icon.display();`,
      java: String.raw`interface Icon {
    void display();
}

class SaveIcon implements Icon {
    public void display() { System.out.println("Showing the 16px save icon"); }
}

// This proxy only forwards the call. It adds nothing.
class IconProxy implements Icon {
    private final Icon icon;

    IconProxy(Icon icon) { this.icon = icon; }

    public void display() {
        icon.display();
    }
}

// usage
Icon icon = new IconProxy(new SaveIcon());
icon.display();`,
      cpp: String.raw`#include <iostream>

class Icon {
public:
    virtual ~Icon() = default;
    virtual void display() = 0;
};

class SaveIcon : public Icon {
public:
    void display() override { std::cout << "Showing the 16px save icon\n"; }
};

// This proxy only forwards the call. It adds nothing.
class IconProxy : public Icon {
    Icon& icon;

public:
    explicit IconProxy(Icon& i) : icon(i) {}

    void display() override {
        icon.display();
    }
};`,
      php: String.raw`<?php
interface Icon
{
    public function display(): void;
}

class SaveIcon implements Icon
{
    public function display(): void
    {
        echo "Showing the 16px save icon\n";
    }
}

// This proxy only forwards the call. It adds nothing.
class IconProxy implements Icon
{
    public function __construct(private Icon $icon) {}

    public function display(): void
    {
        $this->icon->display();
    }
}

// usage
$icon = new IconProxy(new SaveIcon());
$icon->display();`,
    },
    simple: {
      js: String.raw`class Icon {
  display() { console.log('Showing the 16px save icon'); }
}

const icon = new Icon();   // tiny and always needed: use it directly
icon.display();`,
      java: String.raw`class SaveIcon {
    void display() { System.out.println("Showing the 16px save icon"); }
}

// usage
SaveIcon icon = new SaveIcon();   // tiny and always needed: use it directly
icon.display();`,
      cpp: String.raw`#include <iostream>

class SaveIcon {
public:
    void display() { std::cout << "Showing the 16px save icon\n"; }
};

int main() {
    SaveIcon icon;   // tiny and always needed: use it directly
    icon.display();
}`,
      php: String.raw`<?php
class SaveIcon
{
    public function display(): void
    {
        echo "Showing the 16px save icon\n";
    }
}

$icon = new SaveIcon();   // tiny and always needed: use it directly
$icon->display();`,
    },
  };

  DP.register({
    id: 'proxy',
    name: 'Proxy',
    category: 'structural',
    text: {
      az: {
        summary: `Əsl obyektin yerinə onun "əvəzedicisi" dayanır: eyni görünür, amma əsl işi lazım olanda görür, yoxlayır və ya yadda saxlayır.`,
        analogy: `Direktorun katibi kimi. Sən direktora zəng edəndə əvvəlcə katib cavab verir. Katib sənin kim olduğunu yoxlaya bilər, sadə sualı özü cavablandıra bilər, yalnız həqiqətən lazım olanda direktoru çağırır. Sən üçün hər şey eyni qalır: "direktorla danışırsan". Direktor isə lazımsız zənglərdən qorunur.`,
        problem: `RealImage sinfinin konstruktoru şəkli yükləyir və bu ağır işdir. Pis kodda Gallery yaradılan kimi new RealImage(f) ilə bütün şəkilləri dərhal yükləyir. İstifadəçi yalnız birinci şəkli açsa belə, üçü də yüklənir. Şəkil sayı yüzlərlə olanda səhifə gec açılır, trafik və yaddaş boş yerə xərclənir. Gizli şəkil üçün giriş yoxlamasını da kimsə hər yerdə ayrıca yazmalıdır.`,
        solution: `ImageProxy yaradırıq. O, RealImage ilə eyni display() metoduna malikdir, buna görə Gallery fərq görmür. ImageProxy yaradılanda heç nə yüklənmir, yalnız şəklin adını yadda saxlayır. display() ilk dəfə çağırılanda proksi yeni RealImage yaradır (şəkil bu an yüklənir) və onu özündə saxlayır. İkinci və sonrakı çağırışlarda artıq hazır olan RealImage istifadə olunur, yenidən yüklənmir. Eyni yerdə istəsən giriş yoxlaması da əlavə edə bilərsən: icazə yoxdursa, proksi RealImage-ə heç müraciət etmir. Beləliklə Gallery-nin kodu dəyişmir, ağır iş yalnız lazım olanda görülür.`,
        usedIn: [
          `Şəkillərin "lazy loading"-i: səhifədə şəkil ekrana yaxınlaşanda yüklənir, əvvəldən yox.`,
          `Brauzer keşi və CDN: eyni faylı hər dəfə uzaq serverdən yox, yaxın nüsxədən verir.`,
          `Giriş nəzarəti: bank tətbiqində müştərinin hesabına müraciət əvvəlcə icazə yoxlamasından keçir.`,
          `Vue 3 reaktivliyi və ORM-lər: obyektin sahəsi oxunanda və ya verilənlər bazasından əlaqəli məlumat lazım olanda proksi bunu gizlicə izləyir və ya yükləyir.`,
        ],
        avoid: `Proksi yalnız həqiqətən bir iş gördükdə lazımdır: gec yükləmə, keş, giriş yoxlaması və ya jurnal. Heç nə etməyib hər çağırışı olduğu kimi ötürürsə, kodu yalnız uzadır.`,
        avoidWhen: [
          `Obyekt yüngüldür və həmişə lazımdır. Gec yükləməyə və keşə ehtiyac yoxdur.`,
          `Proksi hər çağırışı heç nə etmədən ötürür (nə keş, nə yoxlama, nə jurnal).`,
          `Sadə bir yoxlama (məsələn, if (!user.isAdmin) return) bir yerdə lazımdır. Bunun üçün ayrıca sinif yazmağa dəyməz.`,
          `Keşlənmiş məlumatın köhnəlməsi riski var və onu nə vaxt yeniləməyi bilmirsən. Köhnə məlumat səhv göstərilə bilər.`,
        ],
        overkillNote: `Lazımsız mürəkkəb kodda Icon sinfi kiçikdir və həmişə lazımdır. IconProxy isə hər display() çağırışını olduğu kimi Icon-a ötürür: nə gec yükləmə, nə keş, nə də giriş yoxlaması var. Bu, katibin yalnız "Direktor sizi dinləyir" deyib telefonu ötürməsinə bənzəyir: əlavə addımdır, amma heç nə qazandırmır. Sadə həll new Icon().display() yazmaqdır. Əgər ikon əvəzinə ağır şəkil olsa, ya da hər baxışdan əvvəl icazə yoxlamaq lazım gəlsə, proksi yerinə düşər.`,
      },
      en: {
        summary: `A "stand-in" takes the place of the real object: it looks the same, but does the real work only when needed, checks access or remembers the result.`,
        analogy: `Like a director's secretary. When you call the director, the secretary answers first. The secretary can check who you are, can answer a simple question alone, and calls the director only when it is really needed. For you everything stays the same: "you are talking to the director". The director is protected from needless calls.`,
        problem: `The constructor of the RealImage class loads the picture, and that is heavy work. In the bad code, as soon as the Gallery is created it loads all the pictures at once with new RealImage(f). Even if the user opens only the first picture, all three are loaded. With hundreds of pictures the page opens slowly and traffic and memory are wasted. And the access check for a private picture would have to be written separately by someone, everywhere.`,
        solution: `We create an ImageProxy. It has the same display() method as RealImage, so the Gallery sees no difference. When an ImageProxy is created nothing is loaded, it only remembers the file name. When display() is called for the first time, the proxy creates a new RealImage (the picture is loaded at this moment) and keeps it. On the second and later calls the ready RealImage is used and nothing is loaded again. In the same place you can also add an access check: if there is no permission, the proxy does not even touch the RealImage. So the Gallery code does not change, and the heavy work is done only when needed.`,
        usedIn: [
          `Lazy loading of images: a picture on a web page is loaded when it comes near the screen, not at the start.`,
          `Browser cache and CDN: the same file is served from a nearby copy instead of the far server every time.`,
          `Access control: in a banking app, a request to a customer's account first passes a permission check.`,
          `Vue 3 reactivity and ORMs: when a field is read, or related data from the database is needed, a proxy quietly tracks it or loads it.`,
        ],
        avoid: `A proxy is needed only when it really does something: lazy loading, a cache, an access check or logging. If it does nothing and just passes every call on, it only makes the code longer.`,
        avoidWhen: [
          `The object is light and always needed. There is no need for lazy loading or a cache.`,
          `The proxy passes every call on without doing anything (no cache, no check, no logging).`,
          `One simple check (for example, if (!user.isAdmin) return) is needed in one place. It is not worth writing a separate class for it.`,
          `The cached data may become stale and you do not know when to refresh it. Old data could be shown by mistake.`,
        ],
        overkillNote: `In the over-complicated code the Icon class is tiny and always needed. IconProxy passes every display() call straight to Icon: there is no lazy loading, no cache and no access check. It is like a secretary who only says "The director is listening" and hands over the phone: an extra step that gains nothing. The simple solution is to write new Icon().display(). If the icon were a heavy picture, or you had to check permission before every view, a proxy would fit.`,
      },
    },
    diagram,
    diagramLabel: {
      az: 'Proxy diaqramı: Client ImageProxy-ni çağırır, proksi isə RealImage-i yalnız ilk dəfə yaradır',
      en: 'Proxy diagram: the Client calls the ImageProxy, which creates the RealImage only the first time',
    },
    code,
    mount: (stage, lang) => DP.demos.proxy(stage, lang),
  });
})(window.DP);
