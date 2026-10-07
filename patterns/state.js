(function (DP) {
  const diagram = `<svg viewBox="0 0 520 250" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-state" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0L10 5L0 10z" class="d-arrow"/>
    </marker>
  </defs>
  <rect class="d-box-accent" x="170" y="10" width="180" height="55" rx="8"/>
  <text class="d-text" x="260" y="34" text-anchor="middle">Order</text>
  <text class="d-sub" x="260" y="52" text-anchor="middle">asks its current state</text>
  <path class="d-dash" d="M215 65 L52 110"/>
  <path class="d-dash" d="M240 65 L184 110"/>
  <path class="d-dash" d="M280 65 L316 110"/>
  <path class="d-dash" d="M305 65 L448 110"/>
  <rect class="d-box" x="8" y="110" width="88" height="55" rx="8"/>
  <text class="d-text" x="52" y="134" text-anchor="middle">New</text>
  <text class="d-sub" x="52" y="152" text-anchor="middle">state</text>
  <rect class="d-box" x="140" y="110" width="88" height="55" rx="8"/>
  <text class="d-text" x="184" y="134" text-anchor="middle">Paid</text>
  <text class="d-sub" x="184" y="152" text-anchor="middle">state</text>
  <rect class="d-box" x="272" y="110" width="88" height="55" rx="8"/>
  <text class="d-text" x="316" y="134" text-anchor="middle">Shipped</text>
  <text class="d-sub" x="316" y="152" text-anchor="middle">state</text>
  <rect class="d-box" x="404" y="110" width="88" height="55" rx="8"/>
  <text class="d-text" x="448" y="134" text-anchor="middle">Delivered</text>
  <text class="d-sub" x="448" y="152" text-anchor="middle">state</text>
  <path class="d-line" d="M96 137 L140 137" marker-end="url(#arr-state)"/>
  <path class="d-line" d="M228 137 L272 137" marker-end="url(#arr-state)"/>
  <path class="d-line" d="M360 137 L404 137" marker-end="url(#arr-state)"/>
  <text class="d-sub" x="118" y="130" text-anchor="middle">pay</text>
  <text class="d-sub" x="250" y="130" text-anchor="middle">ship</text>
  <text class="d-sub" x="382" y="130" text-anchor="middle">deliver</text>
  <rect class="d-box" x="140" y="195" width="130" height="45" rx="8"/>
  <text class="d-text" x="205" y="223" text-anchor="middle">Cancelled</text>
  <path class="d-line" d="M52 165 L52 217 L140 217" marker-end="url(#arr-state)"/>
  <path class="d-line" d="M184 165 L184 195" marker-end="url(#arr-state)"/>
  <text class="d-sub" x="96" y="211" text-anchor="middle">cancel</text>
</svg>`;

  const code = {
    bad: {
      js: String.raw`class Order {
  status = 'new';

  pay() {
    if (this.status === 'new') this.status = 'paid';
    else throw new Error('Cannot pay when ' + this.status);
  }

  ship() {
    if (this.status === 'paid') this.status = 'shipped';
    else throw new Error('Cannot ship when ' + this.status);
  }

  deliver() {
    if (this.status === 'shipped') this.status = 'delivered';
    else throw new Error('Cannot deliver when ' + this.status);
  }

  cancel() {
    if (this.status === 'new' || this.status === 'paid') this.status = 'cancelled';
    else throw new Error('Cannot cancel when ' + this.status);
  }
}   // a new status = an extra "else if" inside EVERY method`,
      java: String.raw`class Order {
    String status = "new";

    void pay() {
        if (status.equals("new")) status = "paid";
        else throw new IllegalStateException("Cannot pay when " + status);
    }

    void ship() {
        if (status.equals("paid")) status = "shipped";
        else throw new IllegalStateException("Cannot ship when " + status);
    }

    void deliver() {
        if (status.equals("shipped")) status = "delivered";
        else throw new IllegalStateException("Cannot deliver when " + status);
    }

    void cancel() {
        if (status.equals("new") || status.equals("paid")) status = "cancelled";
        else throw new IllegalStateException("Cannot cancel when " + status);
    }
}   // a new status = an extra "else if" inside EVERY method`,
      cpp: String.raw`#include <stdexcept>
#include <string>

class Order {
    std::string status = "new";

public:
    void pay() {
        if (status == "new") status = "paid";
        else throw std::logic_error("Cannot pay when " + status);
    }

    void ship() {
        if (status == "paid") status = "shipped";
        else throw std::logic_error("Cannot ship when " + status);
    }

    void deliver() {
        if (status == "shipped") status = "delivered";
        else throw std::logic_error("Cannot deliver when " + status);
    }

    void cancel() {
        if (status == "new" || status == "paid") status = "cancelled";
        else throw std::logic_error("Cannot cancel when " + status);
    }
};   // a new status = an extra "else if" inside EVERY method`,
      php: String.raw`<?php
class Order
{
    private string $status = 'new';

    public function pay(): void
    {
        if ($this->status === 'new') $this->status = 'paid';
        else throw new LogicException("Cannot pay when {$this->status}");
    }

    public function ship(): void
    {
        if ($this->status === 'paid') $this->status = 'shipped';
        else throw new LogicException("Cannot ship when {$this->status}");
    }

    public function deliver(): void
    {
        if ($this->status === 'shipped') $this->status = 'delivered';
        else throw new LogicException("Cannot deliver when {$this->status}");
    }

    public function cancel(): void
    {
        if ($this->status === 'new' || $this->status === 'paid') $this->status = 'cancelled';
        else throw new LogicException("Cannot cancel when {$this->status}");
    }
}   // a new status = an extra "else if" inside EVERY method`,
    },
    good: {
      js: String.raw`// By default an action is NOT allowed
class State {
  pay()     { throw new Error('Cannot pay in ' + this.constructor.name); }
  ship()    { throw new Error('Cannot ship in ' + this.constructor.name); }
  deliver() { throw new Error('Cannot deliver in ' + this.constructor.name); }
  cancel()  { throw new Error('Cannot cancel in ' + this.constructor.name); }
}

// each state lists only what it allows
class NewState extends State {
  pay(order)    { order.setState(new PaidState()); }
  cancel(order) { order.setState(new CancelledState()); }
}
class PaidState extends State {
  ship(order)   { order.setState(new ShippedState()); }
  cancel(order) { order.setState(new CancelledState()); }
}
class ShippedState extends State {
  deliver(order) { order.setState(new DeliveredState()); }
}
class DeliveredState extends State {}
class CancelledState extends State {}

class Order {
  #state = new NewState();
  setState(state) { this.#state = state; }

  // the order does not check the status: it asks its current state
  pay()     { this.#state.pay(this); }
  ship()    { this.#state.ship(this); }
  deliver() { this.#state.deliver(this); }
  cancel()  { this.#state.cancel(this); }
}`,
      java: String.raw`interface State {
    // by default an action is NOT allowed
    default void pay(Order o)     { throw new IllegalStateException("Cannot pay in " + getClass().getSimpleName()); }
    default void ship(Order o)    { throw new IllegalStateException("Cannot ship in " + getClass().getSimpleName()); }
    default void deliver(Order o) { throw new IllegalStateException("Cannot deliver in " + getClass().getSimpleName()); }
    default void cancel(Order o)  { throw new IllegalStateException("Cannot cancel in " + getClass().getSimpleName()); }
}

// each state lists only what it allows
class NewState implements State {
    public void pay(Order o)    { o.setState(new PaidState()); }
    public void cancel(Order o) { o.setState(new CancelledState()); }
}
class PaidState implements State {
    public void ship(Order o)   { o.setState(new ShippedState()); }
    public void cancel(Order o) { o.setState(new CancelledState()); }
}
class ShippedState implements State {
    public void deliver(Order o) { o.setState(new DeliveredState()); }
}
class DeliveredState implements State {}
class CancelledState implements State {}

class Order {
    private State state = new NewState();

    void setState(State s) { state = s; }

    // the order does not check the status: it asks its current state
    void pay()     { state.pay(this); }
    void ship()    { state.ship(this); }
    void deliver() { state.deliver(this); }
    void cancel()  { state.cancel(this); }
}`,
      cpp: String.raw`#include <stdexcept>
#include <string>

class Order;

struct State {
    virtual ~State() = default;
    virtual std::string name() const = 0;
    // by default an action is NOT allowed
    virtual void pay(Order&)     { refuse("pay"); }
    virtual void ship(Order&)    { refuse("ship"); }
    virtual void deliver(Order&) { refuse("deliver"); }
    virtual void cancel(Order&)  { refuse("cancel"); }

private:
    void refuse(const std::string& action) const {
        throw std::logic_error("Cannot " + action + " in " + name());
    }
};

struct NewState : State {
    std::string name() const override { return "NewState"; }
    void pay(Order& o) override;
    void cancel(Order& o) override;
};
struct PaidState : State {
    std::string name() const override { return "PaidState"; }
    void ship(Order& o) override;
    void cancel(Order& o) override;
};
struct ShippedState : State {
    std::string name() const override { return "ShippedState"; }
    void deliver(Order& o) override;
};
struct DeliveredState : State { std::string name() const override { return "DeliveredState"; } };
struct CancelledState : State { std::string name() const override { return "CancelledState"; } };

// one shared object per state
inline NewState newState;
inline PaidState paidState;
inline ShippedState shippedState;
inline DeliveredState deliveredState;
inline CancelledState cancelledState;

class Order {
    State* state = &newState;

public:
    void setState(State& s) { state = &s; }

    // the order does not check the status: it asks its current state
    void pay()     { state->pay(*this); }
    void ship()    { state->ship(*this); }
    void deliver() { state->deliver(*this); }
    void cancel()  { state->cancel(*this); }
};

void NewState::pay(Order& o)         { o.setState(paidState); }
void NewState::cancel(Order& o)      { o.setState(cancelledState); }
void PaidState::ship(Order& o)       { o.setState(shippedState); }
void PaidState::cancel(Order& o)     { o.setState(cancelledState); }
void ShippedState::deliver(Order& o) { o.setState(deliveredState); }`,
      php: String.raw`<?php
// By default an action is NOT allowed
abstract class State
{
    public function pay(Order $o): void     { throw new LogicException('Cannot pay in ' . static::class); }
    public function ship(Order $o): void    { throw new LogicException('Cannot ship in ' . static::class); }
    public function deliver(Order $o): void { throw new LogicException('Cannot deliver in ' . static::class); }
    public function cancel(Order $o): void  { throw new LogicException('Cannot cancel in ' . static::class); }
}

// each state lists only what it allows
class NewState extends State
{
    public function pay(Order $o): void    { $o->setState(new PaidState()); }
    public function cancel(Order $o): void { $o->setState(new CancelledState()); }
}
class PaidState extends State
{
    public function ship(Order $o): void   { $o->setState(new ShippedState()); }
    public function cancel(Order $o): void { $o->setState(new CancelledState()); }
}
class ShippedState extends State
{
    public function deliver(Order $o): void { $o->setState(new DeliveredState()); }
}
class DeliveredState extends State {}
class CancelledState extends State {}

class Order
{
    private State $state;

    public function __construct() { $this->state = new NewState(); }

    public function setState(State $s): void { $this->state = $s; }

    // the order does not check the status: it asks its current state
    public function pay(): void     { $this->state->pay($this); }
    public function ship(): void    { $this->state->ship($this); }
    public function deliver(): void { $this->state->deliver($this); }
    public function cancel(): void  { $this->state->cancel($this); }
}`,
    },
    // State pattern used for a plain on/off flag, and the plain version
    overkill: {
      js: String.raw`// A lamp is either on or off. That is all it will ever be,
// but a whole state machine was built for it
class OnState {
  toggle(lamp) { lamp.setState(new OffState()); }
  label() { return 'on'; }
}
class OffState {
  toggle(lamp) { lamp.setState(new OnState()); }
  label() { return 'off'; }
}

class Lamp {
  #state = new OffState();
  setState(state) { this.#state = state; }
  toggle() { this.#state.toggle(this); }
  label() { return this.#state.label(); }
}

const lamp = new Lamp();
lamp.toggle();
console.log(lamp.label());   // 'on'`,
      java: String.raw`// A lamp is either on or off. That is all it will ever be,
// but a whole state machine was built for it
interface LampState {
    void toggle(Lamp lamp);
    String label();
}

class OnState implements LampState {
    public void toggle(Lamp lamp) { lamp.setState(new OffState()); }
    public String label() { return "on"; }
}

class OffState implements LampState {
    public void toggle(Lamp lamp) { lamp.setState(new OnState()); }
    public String label() { return "off"; }
}

class Lamp {
    private LampState state = new OffState();

    void setState(LampState s) { state = s; }
    void toggle() { state.toggle(this); }
    String label() { return state.label(); }
}

// usage
Lamp lamp = new Lamp();
lamp.toggle();
System.out.println(lamp.label());   // on`,
      cpp: String.raw`#include <string>

// A lamp is either on or off. That is all it will ever be,
// but a whole state machine was built for it
struct LampState {
    virtual ~LampState() = default;
    virtual LampState& toggled() = 0;   // which state comes next
    virtual std::string label() const = 0;
};

struct OnState : LampState {
    LampState& toggled() override;
    std::string label() const override { return "on"; }
};

struct OffState : LampState {
    LampState& toggled() override;
    std::string label() const override { return "off"; }
};

inline OnState onState;
inline OffState offState;
inline LampState& OnState::toggled()  { return offState; }
inline LampState& OffState::toggled() { return onState; }

class Lamp {
    LampState* state = &offState;

public:
    void toggle() { state = &state->toggled(); }
    std::string label() const { return state->label(); }
};`,
      php: String.raw`<?php
// A lamp is either on or off. That is all it will ever be,
// but a whole state machine was built for it
interface LampState
{
    public function toggle(Lamp $lamp): void;
    public function label(): string;
}

class OnState implements LampState
{
    public function toggle(Lamp $lamp): void { $lamp->setState(new OffState()); }
    public function label(): string { return 'on'; }
}

class OffState implements LampState
{
    public function toggle(Lamp $lamp): void { $lamp->setState(new OnState()); }
    public function label(): string { return 'off'; }
}

class Lamp
{
    private LampState $state;

    public function __construct() { $this->state = new OffState(); }

    public function setState(LampState $s): void { $this->state = $s; }
    public function toggle(): void { $this->state->toggle($this); }
    public function label(): string { return $this->state->label(); }
}

$lamp = new Lamp();
$lamp->toggle();
echo $lamp->label();   // on`,
    },
    simple: {
      js: String.raw`class Lamp {
  isOn = false;
  toggle() { this.isOn = !this.isOn; }   // one true/false value is enough
}

const lamp = new Lamp();
lamp.toggle();
console.log(lamp.isOn ? 'on' : 'off');   // 'on'`,
      java: String.raw`class Lamp {
    private boolean on = false;

    void toggle() { on = !on; }   // one true/false value is enough
    boolean isOn() { return on; }
}

// usage
Lamp lamp = new Lamp();
lamp.toggle();
System.out.println(lamp.isOn() ? "on" : "off");   // on`,
      cpp: String.raw`#include <iostream>

class Lamp {
    bool on = false;

public:
    void toggle() { on = !on; }   // one true/false value is enough
    bool isOn() const { return on; }
};

int main() {
    Lamp lamp;
    lamp.toggle();
    std::cout << (lamp.isOn() ? "on" : "off") << '\n';   // on
}`,
      php: String.raw`<?php
class Lamp
{
    private bool $on = false;

    public function toggle(): void { $this->on = !$this->on; }   // one true/false value is enough
    public function isOn(): bool { return $this->on; }
}

$lamp = new Lamp();
$lamp->toggle();
echo $lamp->isOn() ? 'on' : 'off';   // on`,
    },
  };

  DP.register({
    id: 'state',
    name: 'State',
    category: 'behavioral',
    text: {
      az: {
        summary: `Obyektin hər vəziyyəti ayrıca sinifdir. Obyekt "indi nə etmək olar" sualını öz içində if/else ilə yox, indiki vəziyyət obyektindən soruşur.`,
        analogy: `Svetofor kimi. Qırmızı işıq yananda maşınlar dayanır, yaşıl yananda keçir. Hər rəngin öz qaydası var. Maşın sürücüsü "indi saat neçədir, nə edim" deyə düşünmür, sadəcə indi yanan rəngə baxır. Rəng dəyişəndə qaydalar da avtomatik dəyişir.`,
        problem: `Onlayn mağazada sifariş "yeni", "ödənilib", "göndərilib", "çatdırılıb" və "ləğv edilib" vəziyyətlərindən keçir. Pis kodda Order sinfinin hər metodunda (pay(), ship(), deliver(), cancel()) status üçün if/else yazılıb. Məsələn, ship() yalnız status "paid" olanda işləməlidir, cancel() isə yalnız "new" və ya "paid" olanda. Yeni bir vəziyyət əlavə etmək istəsən (məsələn, "qaytarılıb"), bütün metodları açıb yenidən yoxlamalı olacaqsan. Birini unutsan, sifariş qadağan olunmuş vəziyyətə düşə bilər, məsələn göndərilmiş sifariş ləğv edilə bilər.`,
        solution: `Hər vəziyyət ayrıca sinif olur: NewState, PaidState, ShippedState və s. Hər vəziyyət sinfi yalnız özündə icazə verilən əməlləri yazır. Məsələn, NewState yalnız pay() və cancel() icazə verir. Yazılmayan əməl baza State sinfindən gələn xətanı atır: "Cannot ship in NewState". Order sinfi isə statusu yoxlamır. O yalnız indiki vəziyyət obyektini saxlayır və çağırışı ona ötürür: order.pay() işləyəndə this.state.pay(this) çağırılır. Vəziyyət obyekti lazım olanda order.setState(new PaidState()) ilə sifarişin vəziyyətini dəyişir. Yeni vəziyyət əlavə etmək üçün yeni sinif yazırsan və hansı vəziyyətdən ona keçid olduğunu həmin vəziyyətdə göstərirsən. Order sinfinə toxunmursan.`,
        usedIn: [
          `Sifariş və çatdırılma: sifariş "yeni"dən "çatdırılıb"a keçir və hər mərhələdə fərqli əməllərə icazə verilir.`,
          `Musiqi pleyeri: "oxunur", "pauzadadır", "dayandırılıb" vəziyyətlərində eyni Play düyməsi fərqli iş görür.`,
          `Sənəd təsdiqi: qaralama, yoxlamada, təsdiqlənib, rədd edilib. Hər mərhələdə kimin nə edə biləcəyi fərqlidir.`,
          `Bank kartı: aktiv, bloklanıb, müddəti bitib. Bloklanmış kartla ödəniş etmək olmur.`,
        ],
        avoid: `Obyektin yalnız iki vəziyyəti varsa (açıq/bağlı) və vəziyyətə görə davranış az dəyişirsə, State lazım deyil. Sadə true/false dəyişən kifayətdir.`,
        avoidWhen: [
          `Vəziyyət sadəcə açıq/bağlı kimi bir true/false dəyəridir.`,
          `Vəziyyətlər çox azdır və gələcəkdə də artmayacaq. Bir-iki if yoxlaması daha aydındır.`,
          `Vəziyyətdən asılı olaraq obyektin davranışı əslində dəyişmir, yalnız bir etiket (yazı) dəyişir.`,
          `Obyekt tək bir yerdə, qısa müddət işlədilir və sonra atılır. Ayrıca siniflər yazmağa dəyməz.`,
        ],
        overkillNote: `Lazımsız mürəkkəb kodda lampa yalnız yanıq və ya sönük ola bilər. Buna baxmayaraq OnState, OffState, Lamp və setState yazılıb. Bu, işıq açarını yandırmaq üçün ayrıca idarəetmə mərkəzi qurmağa bənzəyir. Sadə həll isə bir true/false dəyişəndir. Əgər sabah lampanın "yanır", "sönüb", "parıldayır", "sınıb" vəziyyətləri olsa və hər birində düymə fərqli iş görsə, State yerinə düşəcək.`,
      },
      en: {
        summary: `Each state of an object is its own class. The object does not decide "what is allowed now" with if/else inside itself, it asks its current state object.`,
        analogy: `Like a traffic light. When the light is red, cars stop, and when it is green, they go. Each colour has its own rules. A driver does not work out "what time is it, what should I do", they just look at the colour that is lit now. When the colour changes, the rules change automatically.`,
        problem: `In an online shop an order moves through "new", "paid", "shipped", "delivered" and "cancelled". In the bad code the Order class has an if/else on the status inside every method (pay(), ship(), deliver(), cancel()). For example, ship() must only work when the status is "paid", and cancel() only when it is "new" or "paid". If you want to add one more state (say, "returned"), you must open and re-check every method. If you forget one, the order can end up in a forbidden situation, for example a shipped order being cancelled.`,
        solution: `Each state becomes its own class: NewState, PaidState, ShippedState and so on. Each state class writes only the actions it allows. For example, NewState allows only pay() and cancel(). An action that is not written falls back to the base State class, which throws an error: "Cannot ship in NewState". The Order class does not check the status. It only keeps the current state object and passes the call on: when order.pay() runs, it calls this.state.pay(this). When needed, the state object changes the order's state with order.setState(new PaidState()). To add a new state you write a new class and, in the states that can lead to it, you add the transition. You do not touch the Order class.`,
        usedIn: [
          `Orders and delivery: an order goes from "new" to "delivered", and each step allows different actions.`,
          `A music player: in "playing", "paused" and "stopped" the same Play button does different things.`,
          `Document approval: draft, under review, approved, rejected. In each step who can do what is different.`,
          `A bank card: active, blocked, expired. You cannot pay with a blocked card.`,
        ],
        avoid: `If an object has only two states (open/closed) and its behaviour barely changes with the state, State is not needed. A plain true/false variable is enough.`,
        avoidWhen: [
          `The state is just a true/false value like open/closed.`,
          `There are very few states and there will never be more. One or two if checks are clearer.`,
          `The behaviour does not really change with the state, only a label (text) changes.`,
          `The object is used in one place for a short time and then thrown away. Separate classes are not worth writing.`,
        ],
        overkillNote: `In the over-complicated code a lamp can only be on or off. Even so, OnState, OffState, Lamp and setState were written. It is like building a separate control centre just to flip a light switch. The simple solution is one true/false variable. If tomorrow the lamp had the states "on", "off", "flashing" and "broken", and a button did something different in each, that is when State fits.`,
      },
    },
    diagram,
    diagramLabel: {
      az: 'State diaqramı: Order əməli indiki vəziyyət obyektinə ötürür, vəziyyətlər isə bir-birinə keçid edir',
      en: 'State diagram: the Order passes the action to its current state object, and the states move from one to the next',
    },
    code,
    mount: (stage, lang) => DP.demos.state(stage, lang),
  });
})(window.DP);
