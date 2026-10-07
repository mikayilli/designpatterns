(function (DP) {
  const diagram = `<svg viewBox="0 0 520 230" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-command" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0L10 5L0 10z" class="d-arrow"/>
    </marker>
  </defs>
  <rect class="d-box" x="15" y="30" width="140" height="70" rx="8"/>
  <text class="d-text" x="85" y="60" text-anchor="middle">History</text>
  <text class="d-sub" x="85" y="80" text-anchor="middle">undo() · redo()</text>
  <path class="d-line" d="M155 65 L195 65" marker-end="url(#arr-command)"/>
  <rect class="d-box-accent" x="195" y="30" width="140" height="70" rx="8"/>
  <text class="d-text" x="265" y="60" text-anchor="middle">Command</text>
  <text class="d-sub" x="265" y="80" text-anchor="middle">execute() · undo()</text>
  <path class="d-line" d="M335 65 L375 65" marker-end="url(#arr-command)"/>
  <rect class="d-box" x="375" y="30" width="130" height="70" rx="8"/>
  <text class="d-text" x="440" y="60" text-anchor="middle">Editor</text>
  <text class="d-sub" x="440" y="80" text-anchor="middle">text</text>
  <path class="d-dash" d="M225 100 L160 150"/>
  <path class="d-dash" d="M305 100 L370 150"/>
  <rect class="d-box" x="70" y="150" width="170" height="55" rx="8"/>
  <text class="d-text" x="155" y="175" text-anchor="middle">TypeCommand</text>
  <text class="d-sub" x="155" y="193" text-anchor="middle">adds a word</text>
  <rect class="d-box" x="280" y="150" width="170" height="55" rx="8"/>
  <text class="d-text" x="365" y="175" text-anchor="middle">DeleteCommand</text>
  <text class="d-sub" x="365" y="193" text-anchor="middle">removes a word</text>
</svg>`;

  const code = {
    bad: {
      js: String.raw`class Editor {
  text = '';
  type(word) { this.text = (this.text + ' ' + word).trim(); }
  deleteLastWord() { this.text = this.text.split(' ').slice(0, -1).join(' '); }
}

const editor = new Editor();
// every button changes the text directly: nothing remembers what happened
helloButton.onclick = () => editor.type('Hello');
deleteButton.onclick = () => editor.deleteLastWord();
undoButton.onclick = () => {
  // impossible: the old text was never saved, and a deleted word is gone for good
};`,
      java: String.raw`class Editor {
    String text = "";

    void type(String word) { text = (text + " " + word).trim(); }

    void deleteLastWord() {
        int i = text.lastIndexOf(' ');
        text = i < 0 ? "" : text.substring(0, i);
    }
}

// every button changes the text directly: nothing remembers what happened
Editor editor = new Editor();
helloButton.onClick(() -> editor.type("Hello"));
deleteButton.onClick(() -> editor.deleteLastWord());
undoButton.onClick(() -> {
    // impossible: the old text was never saved, and a deleted word is gone for good
});`,
      cpp: String.raw`#include <string>

struct Editor {
    std::string text;

    void type(const std::string& word) { text += text.empty() ? word : " " + word; }

    void deleteLastWord() {
        auto i = text.rfind(' ');
        text = (i == std::string::npos) ? "" : text.substr(0, i);
    }
};

// every button changes the text directly: nothing remembers what happened
Editor editor;
helloButton.onClick([&] { editor.type("Hello"); });
deleteButton.onClick([&] { editor.deleteLastWord(); });
undoButton.onClick([&] {
    // impossible: the old text was never saved, and a deleted word is gone for good
});`,
      php: String.raw`<?php
class Editor
{
    public string $text = '';

    public function type(string $word): void
    {
        $this->text = trim($this->text . ' ' . $word);
    }

    public function deleteLastWord(): void
    {
        $words = explode(' ', $this->text);
        array_pop($words);
        $this->text = implode(' ', $words);
    }
}

// every button changes the text directly: nothing remembers what happened
$editor = new Editor();
$helloButton->onClick(fn () => $editor->type('Hello'));
$deleteButton->onClick(fn () => $editor->deleteLastWord());
// undo is impossible: the old text was never saved, and a deleted word is gone for good`,
    },
    good: {
      js: String.raw`class Editor { text = ''; }

class TypeCommand {
  constructor(editor, word) { this.editor = editor; this.word = word; }
  execute() {
    this.before = this.editor.text;   // remember how things were
    this.editor.text = (this.before + ' ' + this.word).trim();
  }
  undo() { this.editor.text = this.before; }
}

class DeleteCommand {
  constructor(editor) { this.editor = editor; }
  execute() {
    this.before = this.editor.text;
    this.editor.text = this.before.split(' ').slice(0, -1).join(' ');
  }
  undo() { this.editor.text = this.before; }
}

class History {
  #done = [];
  #undone = [];
  execute(cmd) { cmd.execute(); this.#done.push(cmd); this.#undone = []; }
  undo() { const cmd = this.#done.pop(); if (cmd) { cmd.undo(); this.#undone.push(cmd); } }
  redo() { const cmd = this.#undone.pop(); if (cmd) { cmd.execute(); this.#done.push(cmd); } }
}

const editor = new Editor();
const history = new History();
history.execute(new TypeCommand(editor, 'Hello'));
history.execute(new TypeCommand(editor, 'world'));
history.undo();   // editor.text is 'Hello' again
history.redo();   // editor.text is 'Hello world'`,
      java: String.raw`import java.util.ArrayDeque;
import java.util.Deque;

class Editor { String text = ""; }

interface Command {
    void execute();
    void undo();
}

class TypeCommand implements Command {
    private final Editor editor;
    private final String word;
    private String before;

    TypeCommand(Editor editor, String word) { this.editor = editor; this.word = word; }

    public void execute() {
        before = editor.text;   // remember how things were
        editor.text = (before + " " + word).trim();
    }

    public void undo() { editor.text = before; }
}

class History {
    private final Deque<Command> done = new ArrayDeque<>();
    private final Deque<Command> undone = new ArrayDeque<>();

    void execute(Command c) { c.execute(); done.push(c); undone.clear(); }
    void undo() { if (!done.isEmpty()) { Command c = done.pop(); c.undo(); undone.push(c); } }
    void redo() { if (!undone.isEmpty()) { Command c = undone.pop(); c.execute(); done.push(c); } }
}

// usage
Editor editor = new Editor();
History history = new History();
history.execute(new TypeCommand(editor, "Hello"));
history.execute(new TypeCommand(editor, "world"));
history.undo();   // editor.text is "Hello" again`,
      cpp: String.raw`#include <memory>
#include <string>
#include <utility>
#include <vector>

struct Editor { std::string text; };

struct Command {
    virtual ~Command() = default;
    virtual void execute() = 0;
    virtual void undo() = 0;
};

class TypeCommand : public Command {
    Editor& editor;
    std::string word, before;

public:
    TypeCommand(Editor& e, std::string w) : editor(e), word(std::move(w)) {}

    void execute() override {
        before = editor.text;   // remember how things were
        editor.text += editor.text.empty() ? word : " " + word;
    }
    void undo() override { editor.text = before; }
};

class History {
    std::vector<std::unique_ptr<Command>> done, undone;

public:
    void execute(std::unique_ptr<Command> c) {
        c->execute();
        done.push_back(std::move(c));
        undone.clear();
    }
    void undo() {
        if (done.empty()) return;
        done.back()->undo();
        undone.push_back(std::move(done.back()));
        done.pop_back();
    }
    void redo() {
        if (undone.empty()) return;
        undone.back()->execute();
        done.push_back(std::move(undone.back()));
        undone.pop_back();
    }
};

// usage
// Editor editor; History history;
// history.execute(std::make_unique<TypeCommand>(editor, "Hello"));
// history.undo();   // editor.text is "" again`,
      php: String.raw`<?php
class Editor
{
    public string $text = '';
}

interface Command
{
    public function execute(): void;
    public function undo(): void;
}

class TypeCommand implements Command
{
    private string $before = '';

    public function __construct(private Editor $editor, private string $word) {}

    public function execute(): void
    {
        $this->before = $this->editor->text;   // remember how things were
        $this->editor->text = trim($this->before . ' ' . $this->word);
    }

    public function undo(): void
    {
        $this->editor->text = $this->before;
    }
}

class History
{
    /** @var Command[] */
    private array $done = [];
    /** @var Command[] */
    private array $undone = [];

    public function execute(Command $c): void
    {
        $c->execute();
        $this->done[] = $c;
        $this->undone = [];
    }

    public function undo(): void
    {
        if ($c = array_pop($this->done)) {
            $c->undo();
            $this->undone[] = $c;
        }
    }

    public function redo(): void
    {
        if ($c = array_pop($this->undone)) {
            $c->execute();
            $this->done[] = $c;
        }
    }
}

// usage
$editor = new Editor();
$history = new History();
$history->execute(new TypeCommand($editor, 'Hello'));
$history->undo();   // $editor->text is '' again`,
    },
    // Command used for a one-off action that never needs undo, queue or log
    overkill: {
      js: String.raw`// The print button only ever prints. Nobody needs undo, a queue or a log,
// but the action was wrapped in a Command class anyway
class PrintCommand {
  constructor(printer) { this.printer = printer; }
  execute() { this.printer.print(); }
}

class Button {
  constructor(command) { this.command = command; }
  click() { this.command.execute(); }
}

const printButton = new Button(new PrintCommand(window));
printButton.click();`,
      java: String.raw`// The print button only ever prints. Nobody needs undo, a queue or a log,
// but the action was wrapped in a Command class anyway
interface Command {
    void execute();
}

class PrintCommand implements Command {
    private final Printer printer;

    PrintCommand(Printer printer) { this.printer = printer; }

    public void execute() { printer.print(); }
}

class Button {
    private final Command command;

    Button(Command command) { this.command = command; }

    void click() { command.execute(); }
}

// usage
Button printButton = new Button(new PrintCommand(printer));
printButton.click();`,
      cpp: String.raw`#include <memory>
#include <utility>

// The print button only ever prints. Nobody needs undo, a queue or a log,
// but the action was wrapped in a Command class anyway
struct Command {
    virtual ~Command() = default;
    virtual void execute() = 0;
};

class PrintCommand : public Command {
    Printer& printer;

public:
    explicit PrintCommand(Printer& p) : printer(p) {}
    void execute() override { printer.print(); }
};

class Button {
    std::unique_ptr<Command> command;

public:
    explicit Button(std::unique_ptr<Command> c) : command(std::move(c)) {}
    void click() { command->execute(); }
};

// usage
// Button printButton(std::make_unique<PrintCommand>(printer));
// printButton.click();`,
      php: String.raw`<?php
// The print button only ever prints. Nobody needs undo, a queue or a log,
// but the action was wrapped in a Command class anyway
interface Command
{
    public function execute(): void;
}

class PrintCommand implements Command
{
    public function __construct(private Printer $printer) {}

    public function execute(): void
    {
        $this->printer->print();
    }
}

class Button
{
    public function __construct(private Command $command) {}

    public function click(): void
    {
        $this->command->execute();
    }
}

// usage
$printButton = new Button(new PrintCommand($printer));
$printButton->click();`,
    },
    simple: {
      js: String.raw`// One action, no undo: just call it
printButton.onclick = () => window.print();`,
      java: String.raw`// One action, no undo: just call it
printButton.onClick(() -> printer.print());`,
      cpp: String.raw`// One action, no undo: just call it
printButton.onClick([&] { printer.print(); });`,
      php: String.raw`<?php
// One action, no undo: just call it
$printButton->onClick(fn () => $printer->print());`,
    },
  };

  DP.register({
    id: 'command',
    name: 'Command',
    category: 'behavioral',
    text: {
      az: {
        summary: `Hər əməli (məsələn, "söz yaz") ayrıca obyekt kimi saxlayırsan. Beləcə onu geri almaq, təkrar etmək və ya siyahıda saxlamaq mümkün olur.`,
        analogy: `Restoranda sifariş vərəqi kimi. Ofisiant sifarişi yadında saxlamır, vərəqə yazır və aşpaza verir. Vərəqdə nə sifariş olunduğu yazılıb, ona görə də sonra baxıb siyahını görmək, lazım gəlsə sifarişi ləğv etmək və ya eyni sifarişi təkrar vermək olar. Ofisiant yeməyin necə bişdiyini bilmir, onun işi yalnız vərəqi çatdırmaqdır.`,
        problem: `Sadə mətn redaktorunda düymələr birbaşa Editor-un metodlarını çağırır: editor.type('Hello'), editor.deleteLastWord(). Bu kodda "Undo" düyməsini yazmaq mümkün deyil, çünki əməl icra olunanda mətnin əvvəlki halı heç yerdə saxlanmayıb. Silinmiş söz birdəfəlik itir. Hər düymə üçün ayrıca "əvvəlki hal" yazmağa çalışsan, kod hər yerdə təkrarlanacaq. Redaktora yeni əməl əlavə etdikcə (məsələn, "kopyala") vəziyyət daha da qarışacaq.`,
        solution: `Hər əməl ayrıca sinif olur: TypeCommand və DeleteCommand. Hər birində iki metod var: execute() əməli icra edir, undo() onu geri qaytarır. Əməl icra olunmazdan əvvəl mətnin əvvəlki halını özündə saxlayır, ona görə də undo() sadəcə həmin halı geri qoyur. History obyekti icra olunmuş əmrləri siyahıda saxlayır. Undo basılanda History son əmri götürüb onun undo() metodunu çağırır və əmri "geri alınanlar" siyahısına qoyur. Redo basılanda həmin əmrin execute() metodunu yenidən çağırır. Undo-dan sonra yeni bir əmr icra etsən, geri alınanlar siyahısı silinir, çünki tarixçə artıq başqa yola dönüb. History yalnız "execute və undo" metodlarını bilir, əmrin içində nə olduğu onu maraqlandırmır. Yeni əməl əlavə etmək üçün yalnız yeni bir sinif yazırsan.`,
        usedIn: [
          `Mətn və şəkil redaktorları: Ctrl+Z (geri al) və Ctrl+Y (təkrar et) hər edilən əməli əmr kimi saxladığı üçün işləyir.`,
          `Əməliyyat növbəsi: istifadəçinin əməlləri əmr kimi növbəyə yığılır, sonra bir-bir icra olunur, lazım gəlsə təkrar cəhd edilir.`,
          `Makrolar və qeyd: bir sıra əməli yadda saxlayıb sonra eyni ardıcıllıqla yenidən işlətmək olur.`,
          `Uzaqdan idarə pultu: hər düymə bir əmrdir. Pult televizorun içini bilmir, sadəcə əmri göndərir.`,
        ],
        avoid: `Əməl yalnız bir dəfə icra olunursa və heç vaxt geri alınmayacaqsa, növbəyə qoyulmayacaqsa və qeyd edilməyəcəksə, onu ayrıca sinfə çevirmək lazım deyil. Sadə funksiya çağırışı kifayətdir.`,
        avoidWhen: [
          `Düymə yalnız bir şey edir və bunu geri almaq, təkrar etmək lazım deyil. Məsələn, "Çap et" düyməsi.`,
          `Əməlləri nə növbəyə qoymaq, nə qeyd etmək, nə də sonra təkrar işlətmək lazımdır.`,
          `Əməl geri alına bilməz (məsələn, göndərilmiş e-poçtu geri çağırmaq mümkün deyil). Onda "undo()" yazmaq yalandır.`,
          `Proqram kiçikdir və əməllərin sayı azdır. Hər əməl üçün ayrıca sinif yazmaq kodu lazımsız uzadır.`,
        ],
        overkillNote: `Lazımsız mürəkkəb kodda "Çap et" düyməsi yalnız çap edir. Undo, növbə və qeyd lazım deyil. Buna baxmayaraq PrintCommand sinfi, Command interfeysi və Button sinfi yazılıb. Bu, bir qapını açmaq üçün ona ayrıca pult düzəltməyə bənzəyir: kod uzundur, amma heç nə qazandırmır. Sadə həll bir sətirdir. Əgər sabah "Çap et" əməlini geri almaq, siyahıya yığmaq və ya qeyd etmək lazım olsa, onda Command yerinə düşəcək.`,
      },
      en: {
        summary: `You keep every action (for example "type a word") as its own object. That makes it possible to undo it, repeat it or store it in a list.`,
        analogy: `Like an order slip in a restaurant. The waiter does not keep the order in their head, they write it on a slip and hand it to the cook. The slip says what was ordered, so you can look through the slips later, cancel an order if needed, or place the same order again. The waiter does not know how the dish is cooked, their job is only to deliver the slip.`,
        problem: `In a simple text editor the buttons call the Editor's methods directly: editor.type('Hello'), editor.deleteLastWord(). In this code an "Undo" button cannot be written, because when an action runs, the previous text is not saved anywhere. A deleted word is gone for good. If you try to write a separate "previous state" for every button, the code gets repeated everywhere. And every new action you add to the editor (say, "copy") makes it messier.`,
        solution: `Each action becomes its own class: TypeCommand and DeleteCommand. Each has two methods: execute() runs the action and undo() reverses it. Before it runs, the command stores the previous text inside itself, so undo() simply puts that text back. A History object keeps the executed commands in a list. When Undo is pressed, History takes the last command, calls its undo() and moves it to the "undone" list. When Redo is pressed, it calls that command's execute() again. If you run a new command after an Undo, the undone list is cleared, because the history has gone down a different path. History only knows "execute and undo", what is inside the command does not matter to it. To add a new action you just write a new class.`,
        usedIn: [
          `Text and image editors: Ctrl+Z (undo) and Ctrl+Y (redo) work because every action is stored as a command.`,
          `Job queues: user actions are collected as commands in a queue, then run one by one and retried if needed.`,
          `Macros and recording: you can save a sequence of actions and run them again in the same order.`,
          `A remote control: every button is a command. The remote does not know what is inside the TV, it just sends the command.`,
        ],
        avoid: `If an action runs only once and will never be undone, queued or logged, there is no need to turn it into a separate class. A plain function call is enough.`,
        avoidWhen: [
          `A button does only one thing and it never needs undoing or repeating. For example, a "Print" button.`,
          `You never need to queue, log or replay the actions later.`,
          `The action cannot be undone (for example, you cannot take back a sent email). Writing an "undo()" for it would be a lie.`,
          `The program is small and has few actions. A separate class for each one just makes the code longer.`,
        ],
        overkillNote: `In the over-complicated code the "Print" button only prints. No undo, queue or log is needed. Still, a PrintCommand class, a Command interface and a Button class were written. It is like building a separate remote control just to open one door: the code is long and gains nothing. The simple solution is one line. If tomorrow "Print" must be undone, collected in a list or logged, that is when Command fits.`,
      },
    },
    diagram,
    diagramLabel: {
      az: 'Command diaqramı: History əmrlərin execute() və undo() metodlarını çağırır, əmrlər isə Editor üzərində işləyir',
      en: 'Command diagram: History calls execute() and undo() on commands, and the commands work on the Editor',
    },
    code,
    mount: (stage, lang) => DP.demos.command(stage, lang),
  });
})(window.DP);
