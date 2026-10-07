(function (DP) {
  const diagram = `<svg viewBox="0 0 520 220" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-factory-method" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0 0L10 5L0 10z" class="d-arrow"/>
    </marker>
  </defs>
  <rect class="d-box-accent" x="12" y="75" width="140" height="70" rx="8"/>
  <text class="d-text" x="82" y="103" text-anchor="middle">Checkout</text>
  <text class="d-sub" x="82" y="122" text-anchor="middle">process()</text>
  <text class="d-sub" x="82" y="138" text-anchor="middle">createPayment()</text>
  <path class="d-line d-dash" d="M152 100 L195 42"/>
  <path class="d-line d-dash" d="M152 110 L195 110"/>
  <path class="d-line d-dash" d="M152 120 L195 178"/>
  <text class="d-sub" x="172" y="66" text-anchor="middle">extends</text>
  <rect class="d-box" x="195" y="15" width="145" height="55" rx="8"/>
  <text class="d-text" x="267" y="38" text-anchor="middle">CardCheckout</text>
  <text class="d-sub" x="267" y="56" text-anchor="middle">createPayment()</text>
  <rect class="d-box" x="195" y="83" width="145" height="55" rx="8"/>
  <text class="d-text" x="267" y="106" text-anchor="middle">CashCheckout</text>
  <text class="d-sub" x="267" y="124" text-anchor="middle">createPayment()</text>
  <rect class="d-box" x="195" y="151" width="145" height="55" rx="8"/>
  <text class="d-text" x="267" y="174" text-anchor="middle">TransferCheckout</text>
  <text class="d-sub" x="267" y="192" text-anchor="middle">createPayment()</text>
  <path class="d-line" d="M340 42 L375 42" marker-end="url(#arr-factory-method)"/>
  <path class="d-line" d="M340 110 L375 110" marker-end="url(#arr-factory-method)"/>
  <path class="d-line" d="M340 178 L375 178" marker-end="url(#arr-factory-method)"/>
  <rect class="d-box" x="375" y="15" width="135" height="55" rx="8"/>
  <text class="d-text" x="442" y="38" text-anchor="middle">CardPayment</text>
  <text class="d-sub" x="442" y="56" text-anchor="middle">pay(amount)</text>
  <rect class="d-box" x="375" y="83" width="135" height="55" rx="8"/>
  <text class="d-text" x="442" y="106" text-anchor="middle">CashPayment</text>
  <text class="d-sub" x="442" y="124" text-anchor="middle">pay(amount)</text>
  <rect class="d-box" x="375" y="151" width="135" height="55" rx="8"/>
  <text class="d-text" x="442" y="174" text-anchor="middle">TransferPayment</text>
  <text class="d-sub" x="442" y="192" text-anchor="middle">pay(amount)</text>
</svg>`;

  const code = {
    bad: {
      js: String.raw`class CardPayment { pay(amount) { console.log('Card: charged ' + amount + ' AZN'); } }
class CashPayment { pay(amount) { console.log('Cash: take ' + amount + ' AZN from the customer'); } }
class TransferPayment { pay(amount) { console.log('Transfer: waiting for ' + amount + ' AZN to arrive'); } }

// this if / else is copied into every place that needs a payment
function payOnCheckout(type, amount) {
  if (type === 'card') {
    new CardPayment().pay(amount);
  } else if (type === 'cash') {
    new CashPayment().pay(amount);
  } else if (type === 'transfer') {
    new TransferPayment().pay(amount);
  }
  // a new type (e.g. crypto) = edit this function AND every copy of it
}

payOnCheckout('card', 50);`,
      java: String.raw`class CardPayment {
    void pay(double amount) { System.out.println("Card: charged " + amount + " AZN"); }
}
class CashPayment {
    void pay(double amount) { System.out.println("Cash: take " + amount + " AZN from the customer"); }
}
class TransferPayment {
    void pay(double amount) { System.out.println("Transfer: waiting for " + amount + " AZN to arrive"); }
}

class Shop {
    // this if / else is copied into every place that needs a payment
    void payOnCheckout(String type, double amount) {
        if (type.equals("card")) {
            new CardPayment().pay(amount);
        } else if (type.equals("cash")) {
            new CashPayment().pay(amount);
        } else if (type.equals("transfer")) {
            new TransferPayment().pay(amount);
        }
        // a new type (e.g. crypto) = edit this method AND every copy of it
    }
}`,
      cpp: String.raw`#include <iostream>
#include <string>

struct CardPayment { void pay(double a) { std::cout << "Card: charged " << a << " AZN\n"; } };
struct CashPayment { void pay(double a) { std::cout << "Cash: take " << a << " AZN from the customer\n"; } };
struct TransferPayment { void pay(double a) { std::cout << "Transfer: waiting for " << a << " AZN to arrive\n"; } };

// this if / else is copied into every place that needs a payment
void payOnCheckout(const std::string& type, double amount) {
    if (type == "card") {
        CardPayment().pay(amount);
    } else if (type == "cash") {
        CashPayment().pay(amount);
    } else if (type == "transfer") {
        TransferPayment().pay(amount);
    }
    // a new type (e.g. crypto) = edit this function AND every copy of it
}

int main() { payOnCheckout("card", 50); }`,
      php: String.raw`<?php
class CardPayment { public function pay(float $amount): void { echo "Card: charged $amount AZN\n"; } }
class CashPayment { public function pay(float $amount): void { echo "Cash: take $amount AZN from the customer\n"; } }
class TransferPayment { public function pay(float $amount): void { echo "Transfer: waiting for $amount AZN to arrive\n"; } }

// this if / else is copied into every place that needs a payment
function payOnCheckout(string $type, float $amount): void
{
    if ($type === 'card') {
        (new CardPayment())->pay($amount);
    } elseif ($type === 'cash') {
        (new CashPayment())->pay($amount);
    } elseif ($type === 'transfer') {
        (new TransferPayment())->pay($amount);
    }
    // a new type (e.g. crypto) = edit this function AND every copy of it
}

payOnCheckout('card', 50);`,
    },
    good: {
      js: String.raw`class CardPayment { pay(amount) { console.log('Card: charged ' + amount + ' AZN'); } }
class CashPayment { pay(amount) { console.log('Cash: take ' + amount + ' AZN from the customer'); } }
class TransferPayment { pay(amount) { console.log('Transfer: waiting for ' + amount + ' AZN to arrive'); } }

class Checkout {
  // the factory method: each subclass decides which payment to create
  createPayment() {
    throw new Error('Subclass must implement createPayment()');
  }

  process(amount) {
    const payment = this.createPayment();   // does not know which kind it got
    payment.pay(amount);
  }
}

class CardCheckout extends Checkout { createPayment() { return new CardPayment(); } }
class CashCheckout extends Checkout { createPayment() { return new CashPayment(); } }
class TransferCheckout extends Checkout { createPayment() { return new TransferPayment(); } }

new CardCheckout().process(50);   // Card: charged 50 AZN`,
      java: String.raw`interface Payment {
    void pay(double amount);
}
class CardPayment implements Payment {
    public void pay(double amount) { System.out.println("Card: charged " + amount + " AZN"); }
}
class CashPayment implements Payment {
    public void pay(double amount) { System.out.println("Cash: take " + amount + " AZN from the customer"); }
}
class TransferPayment implements Payment {
    public void pay(double amount) { System.out.println("Transfer: waiting for " + amount + " AZN to arrive"); }
}

abstract class Checkout {
    // the factory method: each subclass decides which payment to create
    abstract Payment createPayment();

    void process(double amount) {
        Payment payment = createPayment();   // does not know which kind it got
        payment.pay(amount);
    }
}

class CardCheckout extends Checkout { Payment createPayment() { return new CardPayment(); } }
class CashCheckout extends Checkout { Payment createPayment() { return new CashPayment(); } }
class TransferCheckout extends Checkout { Payment createPayment() { return new TransferPayment(); } }

public class Main {
    public static void main(String[] args) {
        new CardCheckout().process(50);   // Card: charged 50.0 AZN
    }
}`,
      cpp: String.raw`#include <iostream>
#include <memory>

struct Payment {
    virtual ~Payment() = default;
    virtual void pay(double amount) = 0;
};
struct CardPayment : Payment { void pay(double a) override { std::cout << "Card: charged " << a << " AZN\n"; } };
struct CashPayment : Payment { void pay(double a) override { std::cout << "Cash: take " << a << " AZN from the customer\n"; } };
struct TransferPayment : Payment { void pay(double a) override { std::cout << "Transfer: waiting for " << a << " AZN to arrive\n"; } };

class Checkout {
public:
    virtual ~Checkout() = default;

    // the factory method: each subclass decides which payment to create
    virtual std::unique_ptr<Payment> createPayment() = 0;

    void process(double amount) {
        auto payment = createPayment();   // does not know which kind it got
        payment->pay(amount);
    }
};

struct CardCheckout : Checkout { std::unique_ptr<Payment> createPayment() override { return std::make_unique<CardPayment>(); } };
struct CashCheckout : Checkout { std::unique_ptr<Payment> createPayment() override { return std::make_unique<CashPayment>(); } };
struct TransferCheckout : Checkout { std::unique_ptr<Payment> createPayment() override { return std::make_unique<TransferPayment>(); } };

int main() {
    CardCheckout checkout;
    checkout.process(50);   // Card: charged 50 AZN
}`,
      php: String.raw`<?php
interface Payment
{
    public function pay(float $amount): void;
}

class CardPayment implements Payment { public function pay(float $amount): void { echo "Card: charged $amount AZN\n"; } }
class CashPayment implements Payment { public function pay(float $amount): void { echo "Cash: take $amount AZN from the customer\n"; } }
class TransferPayment implements Payment { public function pay(float $amount): void { echo "Transfer: waiting for $amount AZN to arrive\n"; } }

abstract class Checkout
{
    // the factory method: each subclass decides which payment to create
    abstract protected function createPayment(): Payment;

    public function process(float $amount): void
    {
        $payment = $this->createPayment();   // does not know which kind it got
        $payment->pay($amount);
    }
}

class CardCheckout extends Checkout { protected function createPayment(): Payment { return new CardPayment(); } }
class CashCheckout extends Checkout { protected function createPayment(): Payment { return new CashPayment(); } }
class TransferCheckout extends Checkout { protected function createPayment(): Payment { return new TransferPayment(); } }

(new CardCheckout())->process(50);   // Card: charged 50 AZN`,
    },
    // A factory for a class that has only one fixed kind, and the plain version
    overkill: {
      js: String.raw`class Receipt {
  print() { console.log('Receipt printed'); }
}

// There is only ONE kind of receipt, but a whole factory was built for it
class ReceiptCreator {
  createReceipt() {
    throw new Error('Subclass must implement createReceipt()');
  }
  show() {
    this.createReceipt().print();
  }
}

class DefaultReceiptCreator extends ReceiptCreator {   // the only creator that will ever exist
  createReceipt() { return new Receipt(); }
}

new DefaultReceiptCreator().show();`,
      java: String.raw`class Receipt {
    void print() { System.out.println("Receipt printed"); }
}

// There is only ONE kind of receipt, but a whole factory was built for it
abstract class ReceiptCreator {
    abstract Receipt createReceipt();

    void show() {
        createReceipt().print();
    }
}

// the only creator that will ever exist
class DefaultReceiptCreator extends ReceiptCreator {
    Receipt createReceipt() { return new Receipt(); }
}

// usage
new DefaultReceiptCreator().show();`,
      cpp: String.raw`#include <iostream>
#include <memory>

struct Receipt {
    void print() { std::cout << "Receipt printed\n"; }
};

// There is only ONE kind of receipt, but a whole factory was built for it
class ReceiptCreator {
public:
    virtual ~ReceiptCreator() = default;
    virtual std::unique_ptr<Receipt> createReceipt() = 0;

    void show() { createReceipt()->print(); }
};

// the only creator that will ever exist
struct DefaultReceiptCreator : ReceiptCreator {
    std::unique_ptr<Receipt> createReceipt() override { return std::make_unique<Receipt>(); }
};

int main() { DefaultReceiptCreator().show(); }`,
      php: String.raw`<?php
class Receipt
{
    public function print(): void { echo "Receipt printed\n"; }
}

// There is only ONE kind of receipt, but a whole factory was built for it
abstract class ReceiptCreator
{
    abstract protected function createReceipt(): Receipt;

    public function show(): void
    {
        $this->createReceipt()->print();
    }
}

// the only creator that will ever exist
class DefaultReceiptCreator extends ReceiptCreator
{
    protected function createReceipt(): Receipt { return new Receipt(); }
}

(new DefaultReceiptCreator())->show();`,
    },
    simple: {
      js: String.raw`class Receipt {
  print() { console.log('Receipt printed'); }
}

// one kind of receipt: just create it
new Receipt().print();`,
      java: String.raw`class Receipt {
    void print() { System.out.println("Receipt printed"); }
}

// one kind of receipt: just create it
new Receipt().print();`,
      cpp: String.raw`#include <iostream>

struct Receipt {
    void print() { std::cout << "Receipt printed\n"; }
};

int main() {
    Receipt receipt;   // one kind of receipt: just create it
    receipt.print();
}`,
      php: String.raw`<?php
class Receipt
{
    public function print(): void { echo "Receipt printed\n"; }
}

// one kind of receipt: just create it
(new Receipt())->print();`,
    },
  };

  DP.register({
    id: 'factory-method',
    name: 'Factory Method',
    category: 'creational',
    text: {
      az: {
        summary: `Obyekti özün new ilə yaratmırsan: onu hazırlamağı xüsusi bir metoda (fabrik metoduna) tapşırırsan.`,
        analogy: `Pizza şirkətinin bir neçə filialı var. Hər filial "pizza hazırla" sifarişini eyni qaydada qəbul edir, amma Bakı filialı Bakı üslubunda, İstanbul filialı İstanbul üslubunda pizza bişirir. Sifariş verən filialın pizzanı necə hazırladığını bilmir. O, sadəcə hazır pizzanı alır. Kodda da belədir: ümumi hissə "mənə ödəniş obyekti ver" deyir, hansı sinfin yaradılacağını isə uyğun fabrik metodu seçir.`,
        problem: `Mağazada müştəri kartla, nağd və ya köçürmə ilə ödəyə bilər. Pis kodda payOnCheckout funksiyası if / else if ilə ödəniş növünü yoxlayır və hər halda new CardPayment(), new CashPayment() və ya new TransferPayment() yazır. Eyni if / else zənciri geri qaytarma səhifəsində, hesabatda və başqa yerlərdə də təkrarlanır. Yeni ödəniş növü (məsələn, kripto) əlavə etmək istəsən, bütün həmin yerləri tapıb düzəltməlisən. Birini unutsan, proqram həmin yerdə səhv işləyəcək.`,
        solution: `1. Hər ödəniş növü üçün ayrı sinif var (CardPayment, CashPayment, TransferPayment) və hamısında pay(amount) metodu var. 2. Ümumi Checkout sinfi var. Onun process(amount) metodu ödənişi yerinə yetirir, amma ödəniş obyektini özü yaratmır: bunun üçün createPayment() metodunu çağırır. Bu metod fabrik metodudur. 3. Hər ödəniş növü üçün Checkout-un kiçik bir alt sinfi var (CardCheckout, CashCheckout, TransferCheckout). O yalnız createPayment() metodunu yazır və öz ödənişini qaytarır. 4. process() yalnız "ödəniş obyekti" ilə işləyir. Onun kart, nağd və ya köçürmə olduğunu bilmir və bilməsinə ehtiyac yoxdur. Yeni növ üçün (məsələn, CryptoCheckout) yeni kiçik sinif yazırsan, köhnə koda toxunmursan. Hansı Checkout-un yaradılacağı yalnız bir yerdə seçilir, məsələn, istifadəçi ödəniş düyməsini basanda.`,
        usedIn: [
          `Sənəd redaktorları: "Yeni sənəd" düyməsi PDF, Word və ya cədvəl sənədi yaradır. Hər sənəd növü öz obyektini hazırlamağı bilir.`,
          `Oyunlar: hər səviyyə öz düşmənini yaradır (meşədə canavar, səhrada ilan), oyunun əsas kodu isə yalnız "düşmən" obyekti ilə işləyir.`,
          `Bildirişlər: tətbiq bildiriş göndərir, SMS, e-poçt və ya push (telefon bildirişi) obyektini isə uyğun alt sinif hazırlayır.`,
          `Verilənlər bazası sürücüləri: MySQL və ya PostgreSQL üçün uyğun bağlantı obyekti hazırlanır, qalan kod isə eyni qalır.`,
        ],
        avoid: `Hər new çağırışı fabrikə çevrilməməlidir. Yaradılan növ həmişə eynidirsə, fabrik yalnız əlavə sinif və uzun kod deməkdir. Hər yeni növ üçün ayrı alt sinif yazmaq da kiçik layihədə çox ola bilər.`,
        avoidWhen: [
          `Yaradılan sinif yalnız birdir və dəyişməyəcək. Birbaşa new yazmaq kifayətdir.`,
          `Növ sayı azdır (2-3) və seçim yalnız bir yerdə edilir. Orada bir if və ya sadə xəritə (obyektdə açar-dəyər cütləri) daha qısadır.`,
          `Obyektin yaradılmasında heç bir məntiq yoxdur və kodun başqa yerləri onun hansı növ olduğuna əhəmiyyət vermir.`,
          `Kodu tez yazılan sınaq nüsxəsidir (prototip). Əvvəl sadə yaz, if / else təkrarı çoxalanda fabrikə keç.`,
        ],
        overkillNote: `Lazımsız kodda qəbz (Receipt) həmişə eyni cür çap olunur və başqa növü yoxdur. Buna baxmayaraq ReceiptCreator və DefaultReceiptCreator sinifləri yazılıb. Yəni yalnız bir seçim var, amma onu seçmək üçün əlavə siniflər qurulub. Sadə həll yalnız new Receipt() yazmaqdır. Fabrik metodu o zaman yerinə düşür ki, eyni əməliyyat (burada ödəniş) bir neçə növ obyektlə işləyir və yeni növlər gəlməkdə davam edir.`,
      },
      en: {
        summary: `You do not create the object yourself with new: you hand the job to a special method (the factory method).`,
        analogy: `A pizza company has several branches. Every branch takes the "make a pizza" order the same way, but the Baku branch bakes it Baku style and the Istanbul branch bakes it Istanbul style. The customer does not know how the pizza is made. They just receive the finished pizza. In code it is the same: the common part says "give me a payment object", and the matching factory method decides which class to create.`,
        problem: `In a shop the customer can pay by card, cash or transfer. In the bad code the payOnCheckout function checks the payment type with if / else if and writes new CardPayment(), new CashPayment() or new TransferPayment() in each branch. The same if / else chain is repeated on the refund page, in the report and in other places. If you want to add a new payment type (say, crypto), you have to find and fix all those places. If you forget one, the program will behave wrongly there.`,
        solution: `1. Each payment type has its own class (CardPayment, CashPayment, TransferPayment) and all of them have a pay(amount) method. 2. There is a common Checkout class. Its process(amount) method carries out the payment, but it does not create the payment object itself: it calls createPayment() for that. This method is the factory method. 3. For each payment type there is a small subclass of Checkout (CardCheckout, CashCheckout, TransferCheckout). It only writes createPayment() and returns its own payment. 4. process() works only with "a payment object". It does not know whether it is card, cash or transfer, and it does not need to. For a new type (say, CryptoCheckout) you write a new small class and do not touch the old code. Which Checkout to create is chosen in just one place, for example when the user presses the pay button.`,
        usedIn: [
          `Document editors: the "New document" button creates a PDF, a Word or a spreadsheet document. Each document type knows how to prepare its own object.`,
          `Games: each level creates its own enemy (a wolf in the forest, a snake in the desert), while the main game code only works with an "enemy" object.`,
          `Notifications: the app sends a notification, and the matching subclass prepares the SMS, email or push (phone notification) object.`,
          `Database drivers: the right connection object is prepared for MySQL or PostgreSQL, and the rest of the code stays the same.`,
        ],
        avoid: `Not every new call should become a factory. If the created kind is always the same, a factory is just extra classes and longer code. Writing a separate subclass for every new kind can also be too much for a small project.`,
        avoidWhen: [
          `There is only one class to create and it will not change. Writing new directly is enough.`,
          `There are few kinds (2-3) and the choice is made in only one place. A single if or a simple map (key-value pairs in an object) is shorter there.`,
          `Creating the object has no logic of its own, and the rest of the code does not care which kind it is.`,
          `The code is a quick trial version (a prototype). Write it simply first, and move to a factory when the if / else repetition grows.`,
        ],
        overkillNote: `In the over-complicated code the receipt (Receipt) is always printed the same way and has no other kind. Even so, the classes ReceiptCreator and DefaultReceiptCreator were written. So there is just one choice, but extra classes were built to make it. The simple solution is just to write new Receipt(). The factory method fits when the same operation (here, paying) works with several kinds of objects and new kinds keep coming.`,
      },
    },
    diagram,
    diagramLabel: {
      az: 'Factory Method diaqramı: hər Checkout alt sinfi createPayment() ilə öz ödəniş obyektini yaradır',
      en: 'Factory Method diagram: each Checkout subclass creates its own payment object with createPayment()',
    },
    code,
    mount: (stage, lang) => DP.demos['factory-method'](stage, lang),
  });
})(window.DP);
