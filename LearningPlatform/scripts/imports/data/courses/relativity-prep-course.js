module.exports = {
  subject: {
    name: 'Software Engineering Interview Prep',
    slug: 'software-engineering-interview-prep'
  },

  course: {
    title: 'Relativity Technical Interview Prep: Java, OOP, C#, SQL, Docker & Azure',
    slug: 'relativity-technical-interview-prep',
    description: 'Comprehensive interview preparation covering OOP fundamentals, Java deep dive, C#/.NET, SQL Server, Docker, Kubernetes, and Azure. Designed for a software engineering internship at Relativity.',
    level: 'INTERMEDIATE',
    isPublished: false
  },

  modules: [
    // ─────────────────────────────────────────────
    // MODULE 1: OOP FUNDAMENTALS
    // ─────────────────────────────────────────────
    {
      title: 'Module 1: OOP - Fundamenty i Zasady',
      order: 1,
      isPublished: false,

      lessons: [
        // ── LESSON 1.1 ──────────────────────────
        {
          title: 'Lesson 1.1: Cztery Filary OOP',
          order: 1,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Object-Oriented Programming (OOP) to paradygmat programowania oparty na czterech fundamentalnych zasadach: **enkapsulacji**, **dziedziczeniu**, **polimorfizmie** i **abstrakcji**. Na rozmowie kwalifikacyjnej w Relativity mozesz byc pewna, ze padnie pytanie o kazdy z tych filarow - nie tylko "co to jest", ale rowniez "pokaz mi przyklad" i "kiedy tego uzywasz". Celem tego modulu jest zarowno solidne zrozumienie teorii, jak i umiejetnosc natychmiastowego pokazania kodu.'
            },
            {
              blockType: 'text',
              content: '**Enkapsulacja** (Encapsulation) to zasada ukrywania wewnetrznego stanu obiektu i udostepniania go tylko przez zdefiniowany interfejs (metody publiczne). Klasa jest jak czarna skrzynka - wiesz, co robi, ale nie musisz wiedziec jak. W Javie realizujemy to przez modyfikatory dostepu: `private` dla pol, `public` dla getterow/setterow. Klucz: enkapsulacja chroni integralnosc danych - nie mozna ustawic wieku osoby na -5, jesli walidacja jest w setterze.\n\nPrzyklad Java:\n```java\npublic class BankAccount {\n    private double balance; // ukryty stan\n\n    public void deposit(double amount) {\n        if (amount > 0) balance += amount; // walidacja!\n    }\n\n    public double getBalance() { return balance; }\n}\n```'
            },
            {
              blockType: 'text',
              content: '**Dziedziczenie** (Inheritance) pozwala klasie podrzednej (child) przejac pola i metody klasy nadrzednej (parent), rozszerzajac lub modyfikujac jej zachowanie. W Javie uzywamy slowa kluczowego `extends`. Dziedziczenie modeluje relacje **"jest"** (is-a): Pies JEST Zwierzeciem, Samochod JEST Pojazdem. Uwaga: Java nie wspiera wielokrotnego dziedziczenia klas (w przeciwienstwie do C++) - klasa moze extendowac tylko jedna klase, ale implementowac wiele interfejsow.\n\n```java\npublic class Animal {\n    protected String name;\n    public void eat() { System.out.println(name + " eats"); }\n}\n\npublic class Dog extends Animal {\n    public void bark() { System.out.println(name + " barks"); }\n}\n```'
            },
            {
              blockType: 'text',
              content: '**Polimorfizm** (Polymorphism) oznacza "wiele form" - ten sam interfejs moze miec rozne implementacje. Wystepuje w dwoch odmianach:\n\n1. **Polimorfizm kompilacji** (static/compile-time) - **method overloading**: wiele metod o tej samej nazwie, roznych parametrach.\n2. **Polimorfizm wykonania** (dynamic/runtime) - **method overriding**: klasa podrzedna nadpisuje metode klasy nadrzednej; JVM decyduje ktora wersje wywolac w trakcie dzialania programu.\n\nRuntime polymorphism jest sercem OOP - pozwala pisac kod generyczny operujacy na klasie bazowej, a zachowujacy sie roznie w zaleznosci od konkretnego obiektu.\n\n```java\nAnimal[] animals = { new Dog(), new Cat(), new Bird() };\nfor (Animal a : animals) {\n    a.makeSound(); // kazdy wywoluje swoja wersje - polimorfizm!\n}\n```'
            },
            {
              blockType: 'text',
              content: '**Abstrakcja** (Abstraction) to ukrywanie zlozonosci implementacji i pokazywanie tylko tego, co istotne dla uzytkownika. Realizujemy ja przez **klasy abstrakcyjne** (`abstract class`) i **interfejsy** (`interface`). Abstrakcja odpowiada na pytanie: "Co obiekt robi?" a nie "Jak to robi?". Przyklad: uzywasz listy w Javie i wiesz, ze `add()` dodaje element - nie obchodzi cie, czy w srodku jest tablica, linked lista, czy cos innego. To wlasnie abstrakcja.'
            },
            {
              blockType: 'table',
              caption: 'Cztery filary OOP - podsumowanie',
              hasHeaders: true,
              headers: ['Filar', 'Kluczowe pytanie', 'Realizacja w Javie', 'Przyklad'],
              rows: [
                ['Enkapsulacja', 'Jak chronic dane?', 'private + gettery/settery', 'BankAccount.balance'],
                ['Dziedziczenie', 'Jak wspoldzielic kod?', 'extends', 'Dog extends Animal'],
                ['Polimorfizm', 'Jak miec wiele form?', 'override / overload', 'animal.makeSound()'],
                ['Abstrakcja', 'Co, nie jak?', 'abstract class / interface', 'List, Collection API']
              ]
            },
            {
              blockType: 'callout',
              variant: 'tip',
              title: 'Kluczowe rozroznienie na interview',
              content: 'Rozroznienie interface vs abstract class to klasyczne pytanie. Abstract class moze miec stan (pola) i metody z implementacja. Interface (od Java 8 moze miec default methods) definiuje kontrakt. Regula: jezeli chcesz wspoldzielic KOD - abstract class. Jezeli chcesz zdefiniowac KONTRAKT/ZACHOWANIE - interface. Klasa moze implementowac wiele interfejsow, ale extendowac tylko jedna klase.'
            },
            {
              blockType: 'text',
              content: 'Porownanie `abstract class` vs `interface` w Javie:\n\n```java\n// Abstract class - wspolny kod + kontrakt\npublic abstract class Shape {\n    protected String color; // stan - mozliwy tylko tutaj!\n    public abstract double area(); // musi byc zaimplementowane\n    public void describe() { // konkretna metoda - wspoldzielona\n        System.out.println("Shape: " + color);\n    }\n}\n\n// Interface - czysty kontrakt\npublic interface Drawable {\n    void draw(); // domyslnie public abstract\n    default void highlight() { // od Java 8 mozna default\n        System.out.println("Highlighting...");\n    }\n}\n\n// Klasa moze robic oba naraz!\npublic class Circle extends Shape implements Drawable {\n    private double radius;\n    @Override public double area() { return Math.PI * radius * radius; }\n    @Override public void draw() { System.out.println("Drawing circle"); }\n}\n```'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption:
                'Diagram UML: filary OOP — enkapsulacja (kapsula), dziedziczenie (Animal→Dog/Cat/Bird), polimorfizm (Animal wskazuje na różne implementacje makeSound), abstrakcja (interfejs + implementacje). Zastąp obrazem z Media.',
              align: 'center',
              width: 'lg',
            },
            {
              blockType: 'callout',
              variant: 'warning',
              title: 'Czesty blad: Dziedziczenie zamiast kompozycji',
              content: 'Nie naduzyway dziedziczenia! Relacja "jest" musi byc naprawde prawdziwa. Czesto lepszym rozwiazaniem jest kompozycja ("ma"). Przyklad: zamiast EmailNotification extends Notification extends Message - uzyj kompozycji: Notification ma MessageFormatter, ma EmailSender. To zasada "Prefer composition over inheritance" - wazna na rozmowie.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Ktory z filarow OOP jest realizowany przez modyfikator "private" w Javie?',
              tagSlugs: ['oop', 'encapsulation', 'java', 'intermediate'],
              choices: [
                'Polimorfizm',
                'Enkapsulacja',
                'Dziedziczenie',
                'Abstrakcja'
              ],
              correctAnswer: 'Enkapsulacja',
              solution: 'Enkapsulacja polega na ukrywaniu wewnetrznego stanu obiektu. Modyfikator private ukrywa pola klasy, uniemozliwiajac bezposredni dostep z zewnatrz. Dostep jest mozliwy tylko przez publiczne metody (gettery/settery), co pozwala na walidacje i kontrole dostepu.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'Klasa w Javie chce wspoldzielic wspolny KOD miedzy podklasami oraz definiowac metody abstrakcyjne. Ktore rozwiazanie jest najwlasciwsze?',
              tagSlugs: ['oop', 'abstract-classes', 'interfaces', 'java', 'intermediate'],
              choices: [
                'Interface z default methods',
                'Zwykla klasa z metodami protected',
                'Abstract class',
                'Enum z metodami'
              ],
              correctAnswer: 'Abstract class',
              solution: 'Abstract class pozwala na posiadanie stanu (pol instancji), konkretnych metod (wspolny kod do wspoldzielenia) oraz metod abstrakcyjnych (kontrakt). Interface nie moze miec stanu instanceowego. Zwykla klasa nie moze miec metod abstrakcyjnych. Abstract class jest idealnym wyborem gdy chcemy wspoldzielic implementacje i jednoczesnie wymusic overriding wybranych metod.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'W Javie klasa moze dziedziczyc (extends) z wielu klas jednoczesnie.',
              tagSlugs: ['oop', 'inheritance', 'java', 'intermediate'],
              correctAnswer: 'false',
              solution: 'Falsz. Java nie wspiera wielokrotnego dziedziczenia klas (multiple inheritance) - jest to swiadoma decyzja projektowa, ktora eliminuje "diamentowy problem". Klasa moze extendowac tylko jedna klase, ale moze implementowac wiele interfejsow. C++ wspiera wielokrotne dziedziczenie, Java nie.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 4,
              prompt: 'Czym rozni sie method overloading od method overriding?',
              tagSlugs: ['oop', 'polymorphism', 'java', 'intermediate'],
              choices: [
                'Overloading to nadpisanie metody w podklasie, overriding to wiele metod o tej samej nazwie',
                'Overloading to wiele metod o tej samej nazwie roznych parametrach (compile-time), overriding to nadpisanie metody w podklasie (runtime)',
                'Sa to synonimy oznaczajace to samo',
                'Overloading dotyczy tylko konstruktorow, overriding dotyczy metod'
              ],
              correctAnswer: 'Overloading to wiele metod o tej samej nazwie roznych parametrach (compile-time), overriding to nadpisanie metody w podklasie (runtime)',
              solution: 'Overloading (przeciazanie) - wiele metod o tej samej nazwie, roznych sygnaturach parametrow, rozstrzygane w czasie kompilacji - to polimorfizm statyczny. Overriding (nadpisywanie) - podklasa dostarcza wlasna implementacje metody klasy bazowej (ta sama sygnatura), rozstrzygane w czasie wykonania przez JVM - to polimorfizm dynamiczny (runtime polymorphism).',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 5,
              prompt: 'Wyjasnij roznice miedzy interface a abstract class w Javie. Kiedy uzyjesz kazdego z nich? Podaj przyklad scenariusza dla obu.',
              tagSlugs: ['oop', 'interfaces', 'abstract-classes', 'java', 'intermediate'],
              solution: 'Interface definiuje czysty kontrakt - co klasa musi umiec robic, bez implementacji (od Java 8 mozliwe default methods). Nie moze miec stanu instancji. Klasa moze implementowac wiele interfejsow. Abstract class moze miec stan (pola), konstruktory, konkretne metody (wspolny kod) i metody abstrakcyjne. Klasa moze extendowac tylko jedna. Kiedy uzywac: Interface - gdy chcesz zdefiniowac zachowanie bez zaleznosci od hierarchii dziedziczenia (np. Serializable, Comparable, Runnable). Abstract class - gdy chcesz wspoldzielic implementacje miedzy pokrewnymi klasami (np. AbstractList jako baza dla ArrayList i LinkedList). Przyklad: Drawable (interface) implementuja zarowno Circle jak i Triangle. Shape (abstract class) jest bazowa dla Circle, Square, Triangle - wspoldzielac metode calculatePerimeter().',
              points: 3,
              isPublished: false
            }
          ]
        },

        // ── LESSON 1.2 ──────────────────────────
        {
          title: 'Lesson 1.2: SOLID - Zasady Projektowania Obiektowego',
          order: 2,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'SOLID to akronim pieciu zasad projektowania obiektowego sformulowanych przez Roberta C. Martina ("Uncle Bob"). Sa to nie tyle reguly, co wskazowki pomagajace pisac kod, ktory jest latwy do utrzymania, rozszerzania i testowania. Na rozmowie kwalifikacyjnej SOLID to pewnik - musisz znac kazda zasade, umiec podac przyklad jej naruszenia i naprawy. Zapamietaj: SOLID nie oznacza, ze kazdy projekt musi byc maksymalnie abstrakcyjny - to narzedzia do uzycia gdy sa potrzebne.'
            },
            {
              blockType: 'text',
              content: '**S - Single Responsibility Principle (SRP)**: Klasa powinna miec jeden i tylko jeden powod do zmiany. Innymi slowy: klasa robi jedna rzecz i robi ja dobrze. Naruszenie: klasa `UserService` ktora zapisuje uzytkownika do bazy, wysyla email powitalny, generuje PDF z potwierdzeniem i loguje akcje. Naprawa: wyodrebnij `UserRepository`, `EmailService`, `PdfGenerator`, `AuditLogger`. Dzieki temu zmiana logiki wysylania maili nie dotyka kodu zapisu do bazy.'
            },
            {
              blockType: 'text',
              content: '**O - Open/Closed Principle (OCP)**: Klasy powinny byc **otwarte na rozszerzenie**, ale **zamkniete na modyfikacje**. Gdy dodajesz nowa funkcjonalnosc, nie modyfikujesz istniejacego kodu - rozszerzasz go. Realizacja: interfejsy i abstrakcje. Przyklad naruszenia:\n```java\n// ZLE - kazdy nowy typ wymagal modyfikacji tej metody\npublic double calculateDiscount(String customerType) {\n    if (customerType.equals("VIP")) return 0.2;\n    if (customerType.equals("REGULAR")) return 0.1;\n    // trzeba tu modyfikowac gdy pojawi sie nowy typ!\n}\n\n// DOBRZE - nowy typ = nowa klasa, stary kod niezmieniony\npublic interface DiscountStrategy {\n    double calculate();\n}\npublic class VipDiscount implements DiscountStrategy {\n    public double calculate() { return 0.2; }\n}\n```'
            },
            {
              blockType: 'text',
              content: '**L - Liskov Substitution Principle (LSP)**: Obiekty klasy podrzednej powinny byc wymienne z obiektami klasy nadrzednej bez zmiany poprawnosci programu. Jesli masz `Animal animal = new Dog()`, to wszystko co mowisz o Animal powinno byc prawda dla Dog. Klasyczne naruszenie: `Square extends Rectangle`. Prostokat ma niezalezna szerokosc i wysokosc. Kwadrat ma szerokosc = wysokosc. Jesli kod bazowy zaklada "moge ustawic wysokosc i szerokosc niezaleznie", Square to lamie - setHeight() zmienia rowniez width, co moze byc nieoczekiwane.\n\nTest LSP: jesli w podklasie musisz rzucic wyjatek lub zrobic nothing w miejscu gdzie bazowa klasa miala sens - naruszylas LSP.'
            },
            {
              blockType: 'text',
              content: '**I - Interface Segregation Principle (ISP)**: Klienty nie powinny byc zmuszone do implementowania interfejsow, ktorych nie uzywa. Lepiej miec wiele malych, wyspecjalizowanych interfejsow niz jeden duzy "gruby" interfejs (fat interface). Naruszenie:\n```java\n// ZLE - duzy interfejs\npublic interface Worker {\n    void work();\n    void eat();   // robot nie je!\n    void sleep(); // robot nie spi!\n}\n\n// DOBRZE - segregacja\npublic interface Workable { void work(); }\npublic interface Eatable { void eat(); }\npublic class Human implements Workable, Eatable { ... }\npublic class Robot implements Workable { ... } // nie musi implementowac eat()\n```'
            },
            {
              blockType: 'text',
              content: '**D - Dependency Inversion Principle (DIP)**: Moduly wysokiego poziomu nie powinny zalezec od modulow niskiego poziomu. Oba powinny zalezec od **abstrakcji** (interfejsow). Abstrakcje nie powinny zalezec od szczegolow - szczegoly powinny zalezec od abstrakcji. To fundament Dependency Injection i Spring Framework!\n\n```java\n// ZLE - wysokopoziomowy OrderService zalezy od konkretnej implementacji\npublic class OrderService {\n    private MySqlOrderRepository repo = new MySqlOrderRepository(); // twarda zaleznosc!\n}\n\n// DOBRZE - zalezy od abstrakcji, konkret wstrzykiwany z zewnatrz\npublic class OrderService {\n    private final OrderRepository repo; // interfejs!\n    public OrderService(OrderRepository repo) { this.repo = repo; } // DI\n}\n```\nTeraz mozesz wstrzyknac `MySqlOrderRepository`, `MongoOrderRepository`, a nawet `MockOrderRepository` do testow - bez zmiany `OrderService`!'
            },
            {
              blockType: 'table',
              caption: 'SOLID - szybkie podsumowanie',
              hasHeaders: true,
              headers: ['Zasada', 'Krotko', 'Sygnatura naruszenia', 'Naprawa'],
              rows: [
                ['SRP', 'Jedna odpowiedzialnosc', 'Klasa zmienia sie z wielu powodow', 'Wyodrebnij klasy'],
                ['OCP', 'Rozszerzaj, nie modyfikuj', 'if-else / switch na typach', 'Interfejs + strategia'],
                ['LSP', 'Podklasa zastepuje base', 'Override rzuca wyjatek / robi nic', 'Zmien hierarchie'],
                ['ISP', 'Male interfejsy', 'NotImplementedException w metodzie', 'Podziel interfejs'],
                ['DIP', 'Zaleznosc od abstrakcji', 'new KonkretnaKlasa() w srodku', 'Wstrzyknij przez konstruktor']
              ]
            },
            {
              blockType: 'callout',
              variant: 'info',
              title: 'SOLID w praktyce Spring Boot',
              content: 'Spring Boot jest zbudowany wokol SOLID. @Service, @Repository, @Component - to SRP (kazdy bean ma jedna odpowiedzialnosc). @Autowired / constructor injection - to DIP (Spring wstrzykuje zaleznosci). Jezeli uzywasz Spring, uzywasz SOLID na co dzien. Na rozmowie wspomnij to - pokaze ze rozumiesz nie tylko teoria ale i praktyczne zastosowanie.'
            },
            {
              blockType: 'text',
              content: '[IMAGE_PLACEHOLDER: Diagram SOLID - 5 kaflii, kazdy z innym kolorem. S: klasa podzielona na male kawatki z etykietami. O: hierarchia klas z interfejsem na gorze i strzalkami rozszerzenia (nie modyfikacji). L: drzewo dziedziczenia z checkmarkami "zastepuje poprawnie". I: jeden duzy interfejs podzielony na 3 male. D: strzalka od High-level Module do Interface (abstrakcja) i od Low-level Module do Interface - oba zaleza od abstrakcji, nie od siebie nawzajem. Nowoczesny, clean design.]'
            },
            {
              blockType: 'text',
              content: '[VIDEO_PLACEHOLDER: "SOLID Principles In 8 Minutes" by Asaprogrammer (YouTube, 8 min). Topics covered: wszystkie 5 zasad z przykladami kodu Java. Recommended timestamp: 00:00-08:00. Link: https://www.youtube.com/watch?v=9HAPkHFqGN0 Why helpful: Szybkie, zwarte powtorzenie wszystkich zasad z wizualnymi przykladami kodu - idealne dzien przed interview. Quality notes: Wysoka jakosc, dobrze narysowane diagramy, jasne tlumaczenie.]'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Klasa PaymentProcessor obsluguje walidacje kart, polaczenie z brama platnosci, logowanie transakcji i wysylanie potwierdzen emailem. Ktora zasada SOLID jest naruszona?',
              tagSlugs: ['solid', 'oop', 'intermediate'],
              choices: [
                'Open/Closed Principle',
                'Liskov Substitution Principle',
                'Single Responsibility Principle',
                'Dependency Inversion Principle'
              ],
              correctAnswer: 'Single Responsibility Principle',
              solution: 'SRP mowi, ze klasa powinna miec jeden i tylko jeden powod do zmiany. PaymentProcessor ma co najmniej 4 powody do zmiany: zmiana logiki walidacji, zmiana bramy platnosci, zmiana formatu logow, zmiana szablonu emaila. Rozwiazanie: wyodrebnij CardValidator, PaymentGatewayClient, TransactionLogger, EmailNotificationService.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'Metoda calculateArea() w klasie nadrzednej Shape zawsze zwraca liczbe wieksza od 0. Klasa pochodna HollowShape nadpisuje ta metode i moze zwrocic 0. Ktora zasada SOLID jest naruszona?',
              tagSlugs: ['solid', 'oop', 'intermediate'],
              choices: [
                'Single Responsibility Principle',
                'Open/Closed Principle',
                'Liskov Substitution Principle',
                'Interface Segregation Principle'
              ],
              correctAnswer: 'Liskov Substitution Principle',
              solution: 'LSP mowi, ze obiekty klasy pochodnej musza byc zastepowalne przez obiekty klasy bazowej bez naruszenia poprawnosci programu. Jesli Shape.calculateArea() gwarantuje > 0, a HollowShape moze zwrocic 0, to kod bazujacy na Shape moze sie niepoprawnie zachowac gdy dostanie HollowShape. Naruszenie LSP czesto sygnalizuje blad w hierarchii dziedziczenia.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'Dependency Inversion Principle mowi, ze klasy wyzszego poziomu powinny tworzyc (new) obiekty klas nizszego poziomu, aby miec nad nimi pelna kontrole.',
              tagSlugs: ['solid', 'oop', 'intermediate'],
              correctAnswer: 'false',
              solution: 'Falsz - to jest odwrotnosc DIP. DIP mowi ze klasy wyzszego poziomu NIE powinny tworzyc obiektow klas nizszego poziomu bezposrednio. Zamiast tego, oba powinny zalezec od abstrakcji (interfejsow). Konkretne implementacje sa wstrzykiwane z zewnatrz (Dependency Injection). Uzycie "new KonkretnaKlasa()" wewnatrz klasy tworzy twarda zaleznosc, ktora utrudnia testowanie i zmiane implementacji.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Masz kod, ktory sprawdza typ platnosci i na tej podstawie przetwarza platnosc: if (type == "CREDIT_CARD") ... else if (type == "PAYPAL") ... else if (type == "CRYPTO") .... Ktora zasada SOLID jest naruszona i jak naprawisz ten kod? Opisz rozwiazanie.',
              tagSlugs: ['solid', 'oop', 'design-patterns', 'intermediate'],
              solution: 'Naruszona jest Open/Closed Principle - kazdorazowe dodanie nowej metody platnosci wymaga modyfikacji istniejacego kodu (dodania kolejnego else if). Naprawa: zastosuj wzorzec Strategy. Stworz interfejs PaymentStrategy z metoda process(). Dla kazdej metody platnosci stworz oddzielna klase: CreditCardStrategy, PayPalStrategy, CryptoStrategy - kazda implementuje PaymentStrategy. PaymentProcessor przyjmuje PaymentStrategy przez konstruktor (DIP + DI). Dodanie nowej metody platnosci = nowa klasa, zero modyfikacji istniejacego kodu. To jednoczesnie naprawia OCP i stosuje DIP.',
              points: 3,
              isPublished: false
            }
          ]
        },

        // ── LESSON 1.3 ──────────────────────────
        {
          title: 'Lesson 1.3: Wzorce Projektowe - Creational Patterns',
          order: 3,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Wzorce projektowe (Design Patterns) to sprawdzone, powtarzalne rozwiazania czesto wystepujacych problemow w projektowaniu oprogramowania. Zostaly skatalogowane przez "Gang of Four" (GoF) w ksiazce "Design Patterns" (1994). Dzielimy je na trzy kategorie: **Creational** (tworzenie obiektow), **Structural** (struktura klas), **Behavioral** (komunikacja miedzy obiektami). W tej lekcji skupiamy sie na wzorcach kreacyjnych - sa najczesciej pytane na rozmowach kwalifikacyjnych.'
            },
            {
              blockType: 'text',
              content: '**Singleton** - zapewnia, ze klasa ma tylko jedna instancje i udostepnia globalny punkt dostepu do niej. Uzycie: polaczenia z baza danych, konfiguracja aplikacji, logger.\n\n```java\npublic class DatabaseConnection {\n    private static volatile DatabaseConnection instance; // volatile - bezpieczny w multithreading\n    private Connection connection;\n\n    private DatabaseConnection() { // prywatny konstruktor!\n        // inicjalizacja polaczenia\n    }\n\n    public static DatabaseConnection getInstance() {\n        if (instance == null) {\n            synchronized (DatabaseConnection.class) { // double-checked locking\n                if (instance == null) {\n                    instance = new DatabaseConnection();\n                }\n            }\n        }\n        return instance;\n    }\n}\n```\nWazne: Singleton jest kontrowersyjny bo utrudnia testowanie (global state). W Spring Boot preferuje sie singleton beans zarzadzane przez kontener IoC.'
            },
            {
              blockType: 'text',
              content: '**Factory Method** - definiuje interfejs do tworzenia obiektu, ale pozwala podklasom zdecydowac, ktora klase instancjonowac. Klient nie wie, jaki konkretny obiekt otrzymuje - wie tylko, ze spelnia on interfejs.\n\n```java\n// Interfejs produktu\npublic interface Notification {\n    void send(String message);\n}\n\n// Konkretne produkty\npublic class EmailNotification implements Notification {\n    public void send(String message) { /* wysylanie emaila */ }\n}\npublic class SmsNotification implements Notification {\n    public void send(String message) { /* wysylanie SMS */ }\n}\n\n// Factory\npublic class NotificationFactory {\n    public static Notification create(String type) {\n        return switch (type) {\n            case "EMAIL" -> new EmailNotification();\n            case "SMS" -> new SmsNotification();\n            default -> throw new IllegalArgumentException("Unknown type: " + type);\n        };\n    }\n}\n\n// Uzycie - klient nie zna konkretnej klasy\nNotification n = NotificationFactory.create("EMAIL");\nn.send("Hello!");\n```'
            },
            {
              blockType: 'text',
              content: '**Builder** - oddziela konstruowanie zlozonego obiektu od jego reprezentacji. Uzywany gdy obiekt ma wiele opcjonalnych parametrow, a konstruktor z 10 argumentami jest nieczytelny i error-prone (latwo przestawic argumenty tego samego typu).\n\n```java\npublic class HttpRequest {\n    private final String url;    // wymagane\n    private final String method; // wymagane\n    private final Map<String, String> headers; // opcjonalne\n    private final String body;   // opcjonalne\n    private final int timeout;   // opcjonalne\n\n    private HttpRequest(Builder builder) {\n        this.url = builder.url;\n        this.method = builder.method;\n        this.headers = builder.headers;\n        this.body = builder.body;\n        this.timeout = builder.timeout;\n    }\n\n    public static class Builder {\n        private String url;\n        private String method;\n        private Map<String, String> headers = new HashMap<>();\n        private String body;\n        private int timeout = 30;\n\n        public Builder(String url, String method) {\n            this.url = url;\n            this.method = method;\n        }\n        public Builder header(String key, String value) {\n            this.headers.put(key, value);\n            return this; // method chaining!\n        }\n        public Builder body(String body) { this.body = body; return this; }\n        public Builder timeout(int seconds) { this.timeout = seconds; return this; }\n        public HttpRequest build() { return new HttpRequest(this); }\n    }\n}\n\n// Uzycie - czytelne!\nHttpRequest request = new HttpRequest.Builder("https://api.example.com", "POST")\n    .header("Content-Type", "application/json")\n    .body("{\"key\": \"value\"}")\n    .timeout(60)\n    .build();\n```'
            },
            {
              blockType: 'text',
              content: '**Abstract Factory** - rozszerza Factory Method, tworzac rodziny powiazyanych obiektow. Zamiast jednej fabryki dla jednego produktu, mamy fabryke fabryk. Przyklad: GUI toolkit ktory tworzy przyciski, checkboxy i inputy - dla Windows wyglada inaczej niz dla Mac, ale API jest takie samo.\n\n```java\n// Abstract Factory\npublic interface UIFactory {\n    Button createButton();\n    Checkbox createCheckbox();\n}\n\n// Konkretne fabryki\npublic class WindowsFactory implements UIFactory {\n    public Button createButton() { return new WindowsButton(); }\n    public Checkbox createCheckbox() { return new WindowsCheckbox(); }\n}\npublic class MacFactory implements UIFactory {\n    public Button createButton() { return new MacButton(); }\n    public Checkbox createCheckbox() { return new MacCheckbox(); }\n}\n\n// Aplikacja uzywa factory, nie zna konkretnych klas\npublic class Application {\n    private UIFactory factory;\n    public Application(UIFactory factory) { this.factory = factory; }\n    // tworzy UI uzywajac factory - dziala dla Windows i Mac\n}\n```'
            },
            {
              blockType: 'table',
              caption: 'Wzorce kreacyjne - porownanie',
              hasHeaders: true,
              headers: ['Wzorzec', 'Problem', 'Rozwiazanie', 'Przyklad z Javy/Springa'],
              rows: [
                ['Singleton', 'Potrzeba dokladnie 1 instancji', 'Prywatny konstruktor + static getInstance()', 'Spring Beans (domyslnie singleton)'],
                ['Factory Method', 'Tworzenie obiektow bez znajomosci konkretnej klasy', 'Metoda fabryczna zwraca interfejs', 'Calendar.getInstance(), Connection.getConnection()'],
                ['Builder', 'Konstruowanie zlozonych obiektow z wieloma parametrami', 'Fluent API z metoda build()', 'StringBuilder, Lombok @Builder, HttpRequest.newBuilder()'],
                ['Abstract Factory', 'Rodziny powiazyanych obiektow', 'Interfejs fabryki + konkretne fabryki', 'DocumentBuilderFactory (JAXP)']
              ]
            },
            {
              blockType: 'callout',
              variant: 'tip',
              title: 'Builder to twoj przyjaciel',
              content: 'Builder jest jednym z najczesciej uzywanych wzorcow w nowoczesnej Javie. Biblioteka Lombok automatycznie generuje Builder przez adnotacje @Builder - bardzo czesto zobaczysz to w projektach Spring Boot. Jezeli nie znasz Lomboka, wspomnij ze wiesz o @Builder na rozmowie - to plus.'
            },
            {
              blockType: 'text',
              content: '[IMAGE_PLACEHOLDER: Diagram porowniacy cztery wzorce kreacyjne. Cztery sekcje z roznym kolorem tla. Singleton: jedna klasa z "private static instance" i strzalka od multiple clients do jednej instancji. Factory: klient -> Factory.create() -> <<interface>> Product, a ponizej ConcreteProductA i ConcreteProductB. Builder: klient uzywa fluent API (builder.setA().setB().build()) i na koncu dostaje gotowy obiekt. Abstract Factory: dwa zestawy obiektow (Windows set i Mac set), klient uzywa tego samego UIFactory interfejsu. Clean, nowoczesny diagram z kolorowymi akcentami.]'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Tworzysz klase konfiguracji aplikacji, ktora wczytuje ustawienia z pliku. Konfiguracja powinna byc wczytana tylko raz i wspoldzielona w calej aplikacji. Ktory wzorzec jest najodpowiedniejszy?',
              tagSlugs: ['design-patterns', 'creational-patterns', 'oop', 'intermediate'],
              choices: [
                'Factory Method',
                'Builder',
                'Singleton',
                'Abstract Factory'
              ],
              correctAnswer: 'Singleton',
              solution: 'Singleton zapewnia, ze istnieje dokladnie jedna instancja klasy i udostepnia globalny punkt dostepu. Konfiguracja aplikacji to idealny przypadek uzycia - chcemy wczytac konfiguracje raz, w jednym miejscu, i udostepniac ja wszeltu w aplikacji. W Spring Boot @Configuration i @Bean tworza singletons domyslnie.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'Klasa User ma 12 pol, z czego 3 sa wymagane a 9 opcjonalnych. Konstruktor z 12 parametrami jest nieczytelny. Ktory wzorzec najlepiej rozwiaze ten problem?',
              tagSlugs: ['design-patterns', 'creational-patterns', 'oop', 'intermediate'],
              choices: [
                'Singleton - raz stworz i wspoldziel',
                'Factory Method - ukryj tworzenie za fabryke',
                'Builder - fluent API dla opcjonalnych parametrow',
                'Abstract Factory - stworz rodziny obiektow'
              ],
              correctAnswer: 'Builder - fluent API dla opcjonalnych parametrow',
              solution: 'Builder rozwiazuje problem "telescoping constructor" (konstruktor z wieloma parametrami). Pozwala ustawiac tylko potrzebne pola przez czytelne metody (method chaining), a wywolanie build() tworzy immutable obiekt. User.builder().name("Anna").email("a@b.com").age(25).build() jest o wiele czytelniejsze niz new User("Anna", null, "a@b.com", 25, null, null, null...).',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'Wzorzec Singleton jest zawsze najlepszym rozwiazaniem dla wspoldzielonych zasobow, poniewaz zapewnia jeden globalny punkt dostepu.',
              tagSlugs: ['design-patterns', 'creational-patterns', 'intermediate'],
              correctAnswer: 'false',
              solution: 'Falsz. Singleton ma istotne wady: utrudnia testowanie (global state, nie mozna latwo podmenic w testach), moze prowadzic do ukrytych zaleznosci, i sprawia problemy w srodowiskach wielowatkowych jezeli nie jest poprawnie zaimplementowany. W nowoczesnych aplikacjach Spring Boot preferuje sie Dependency Injection zarzadzane przez kontener (IoC container), ktory sam zarzadza zakresem zycia beanow.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Wyjasnij roznice miedzy Factory Method a Abstract Factory. Podaj przyklad scenariusza dla kazdego z nich.',
              tagSlugs: ['design-patterns', 'creational-patterns', 'oop', 'intermediate'],
              solution: 'Factory Method definiuje metode do tworzenia jednego produktu - podklasy decyduja jaki konkretny produkt stworzyc. Przyklad: NotificationFactory.create("EMAIL") zwraca EmailNotification lub SmsNotification - jeden typ produktu, rozne implementacje. Abstract Factory tworzy rodziny powiazyanych produktow. Zamiast jednej metody create(), fabryka ma wiele metod tworzacych rozne produkty tej samej rodziny. Przyklad: CrossPlatformUIFactory ma createButton(), createTextField(), createDialog() - WindowsUIFactory tworzy wszystkie widgety w stylu Windows, MacUIFactory - w stylu Mac. Kluczowa roznica: Factory Method = jeden produkt, Abstract Factory = rodzina powiazyanych produktow.',
              points: 3,
              isPublished: false
            }
          ]
        },

        // ── LESSON 1.4 ──────────────────────────
        {
          title: 'Lesson 1.4: Wzorce Projektowe - Structural i Behavioral Patterns',
          order: 4,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Wzorce strukturalne (Structural Patterns) opisuja jak skladac klasy i obiekty w wieksze struktury. Wzorce behawioralne (Behavioral Patterns) skupiaja sie na komunikacji i interakcji miedzy obiektami. W tej lekcji przejdziemy przez najwazniejsze z nich - te, ktore najczesciej pojawia sie na rozmowach kwalifikacyjnych i w rzeczywistych projektach.'
            },
            {
              blockType: 'text',
              content: '**Strategy Pattern** (behawioralny) - definiuje rodzine algorytmow, enkapsuluje kazdy z nich i umozliwia ich wymienne uzycie. Klient wybiera strategie w trakcie dzialania. To implementacja OCP i DIP w praktyce.\n\n```java\n// Strategia sortowania\npublic interface SortStrategy {\n    void sort(int[] data);\n}\n\npublic class BubbleSort implements SortStrategy {\n    public void sort(int[] data) { /* implementacja bubble sort */ }\n}\n\npublic class QuickSort implements SortStrategy {\n    public void sort(int[] data) { /* implementacja quick sort */ }\n}\n\n// Context - uzywac strategii\npublic class DataProcessor {\n    private SortStrategy strategy;\n\n    public DataProcessor(SortStrategy strategy) {\n        this.strategy = strategy;\n    }\n\n    public void setStrategy(SortStrategy strategy) { // dynamiczna zmiana!\n        this.strategy = strategy;\n    }\n\n    public void process(int[] data) {\n        strategy.sort(data);\n    }\n}\n\n// Uzycie\nDataProcessor processor = new DataProcessor(new QuickSort());\nprocessor.process(data); // uzywa QuickSort\nprocessor.setStrategy(new BubbleSort());\nprocessor.process(data); // teraz uzywa BubbleSort\n```'
            },
            {
              blockType: 'text',
              content: '**Observer Pattern** (behawioralny) - definiuje zaleznosc jeden-do-wielu miedzy obiektami. Gdy jeden obiekt (Subject) zmienia stan, wszystkie zalezne obiekty (Observers) sa automatycznie powiadamiane. Fundament event-driven architecture, reaktywnego programowania, i GUI events.\n\n```java\n// Observer interface\npublic interface StockObserver {\n    void update(String stockSymbol, double price);\n}\n\n// Subject\npublic class StockMarket {\n    private List<StockObserver> observers = new ArrayList<>();\n    private Map<String, Double> prices = new HashMap<>();\n\n    public void addObserver(StockObserver observer) {\n        observers.add(observer);\n    }\n\n    public void updatePrice(String symbol, double price) {\n        prices.put(symbol, price);\n        notifyObservers(symbol, price); // powiadomienie!\n    }\n\n    private void notifyObservers(String symbol, double price) {\n        for (StockObserver observer : observers) {\n            observer.update(symbol, price);\n        }\n    }\n}\n\n// Konkretny observer\npublic class AlertService implements StockObserver {\n    public void update(String symbol, double price) {\n        if (price > 1000) System.out.println("ALERT: " + symbol + " = " + price);\n    }\n}\n```'
            },
            {
              blockType: 'text',
              content: '**Decorator Pattern** (strukturalny) - dynamicznie dodaje nowe zachowanie do obiektow bez modyfikacji ich klasy. Alternatywa dla dziedziczenia gdy chcemy dodac zachowanie w runtime lub uniknac eksplozji podklas.\n\n```java\n// Base interface\npublic interface Coffee {\n    double getCost();\n    String getDescription();\n}\n\n// Konkretny komponent\npublic class SimpleCoffee implements Coffee {\n    public double getCost() { return 1.0; }\n    public String getDescription() { return "Coffee"; }\n}\n\n// Bazowy dekorator\npublic abstract class CoffeeDecorator implements Coffee {\n    protected Coffee coffee;\n    public CoffeeDecorator(Coffee coffee) { this.coffee = coffee; }\n}\n\n// Konkretne dekoratory\npublic class MilkDecorator extends CoffeeDecorator {\n    public MilkDecorator(Coffee coffee) { super(coffee); }\n    public double getCost() { return coffee.getCost() + 0.25; }\n    public String getDescription() { return coffee.getDescription() + ", Milk"; }\n}\n\npublic class SugarDecorator extends CoffeeDecorator {\n    public SugarDecorator(Coffee coffee) { super(coffee); }\n    public double getCost() { return coffee.getCost() + 0.1; }\n    public String getDescription() { return coffee.getDescription() + ", Sugar"; }\n}\n\n// Uzycie - kompozycja dekoratorow!\nCoffee coffee = new SimpleCoffee();\ncoffee = new MilkDecorator(coffee);\ncoffee = new SugarDecorator(coffee);\nSystem.out.println(coffee.getCost());        // 1.35\nSystem.out.println(coffee.getDescription()); // Coffee, Milk, Sugar\n```\nJava I/O dziala dokladnie tak: `new BufferedReader(new InputStreamReader(new FileInputStream("file.txt")))` - to Decorator Pattern!'
            },
            {
              blockType: 'text',
              content: '**Adapter Pattern** (strukturalny) - konwertuje interfejs klasy na inny interfejs, jakiego oczekuje klient. Pozwala wspolpracowac klasom o niekompatybilnych interfejsach.\n\n```java\n// Stary interfejs (np. zewnetrzna biblioteka)\npublic interface OldPaymentSystem {\n    void makePayment(int amountInCents);\n}\n\n// Nowy interfejs w naszym systemie\npublic interface PaymentProcessor {\n    void processPayment(double amountInDollars);\n}\n\n// Adapter - laczy oba\npublic class PaymentAdapter implements PaymentProcessor {\n    private OldPaymentSystem oldSystem;\n\n    public PaymentAdapter(OldPaymentSystem oldSystem) {\n        this.oldSystem = oldSystem;\n    }\n\n    public void processPayment(double amountInDollars) {\n        int cents = (int)(amountInDollars * 100); // konwersja!\n        oldSystem.makePayment(cents);\n    }\n}\n```'
            },
            {
              blockType: 'text',
              content: '**Command Pattern** (behawioralny) - enkapsuluje zadanie jako obiekt, co pozwala na parametryzacje klientow, kolejkowanie operacji, logowanie i cofanie (undo). Uzycie: operacje undo/redo w edytorach, kolejki zadan, transakcje.\n\n```java\npublic interface Command {\n    void execute();\n    void undo();\n}\n\npublic class TextEditor {\n    private StringBuilder text = new StringBuilder();\n    private Deque<Command> history = new ArrayDeque<>();\n\n    public void executeCommand(Command cmd) {\n        cmd.execute();\n        history.push(cmd);\n    }\n\n    public void undoLastCommand() {\n        if (!history.isEmpty()) history.pop().undo();\n    }\n\n    // getter dla text...\n}\n```'
            },
            {
              blockType: 'table',
              caption: 'Wzorce projektowe - kiedy uzywac',
              hasHeaders: true,
              headers: ['Wzorzec', 'Typ', 'Uzyj gdy...', 'Przyklad w Javie'],
              rows: [
                ['Strategy', 'Behavioral', 'Chcesz wymienic algorytm w runtime', 'Collections.sort() z Comparator'],
                ['Observer', 'Behavioral', 'Jeden zmiana -> wiele powiadomien', 'EventListener, RxJava, Spring Events'],
                ['Decorator', 'Structural', 'Chcesz dodac zachowanie bez subclassingu', 'Java I/O streams, Spring Security filters'],
                ['Adapter', 'Structural', 'Niekompatybilne interfejsy', 'Arrays.asList(), InputStreamReader'],
                ['Command', 'Behavioral', 'Potrzebujesz undo/redo lub kolejkowania', 'Thread (Runnable to Command), JPA transactions']
              ]
            },
            {
              blockType: 'callout',
              variant: 'info',
              title: 'Wzorce w Spring Framework',
              content: 'Spring intensywnie uzywa wzorcow projektowych: Singleton (Spring Beans), Factory (BeanFactory, ApplicationContext), Proxy (AOP, @Transactional), Template Method (JdbcTemplate, RestTemplate), Observer (ApplicationEvent/ApplicationListener), Decorator (BeanDefinitionDecorator). Znajomosc wzorcow pomoze zrozumiec Spring na glebokim poziomie - to duzy plus na rozmowie.'
            },
            {
              blockType: 'text',
              content: '[IMAGE_PLACEHOLDER: Diagram 5 wzorcow projektowych w jednym. Ulozone w siatce 2x3. Strategy: Context z wymienialnym Strategy interface i dwoma ConcreteStrategy. Observer: Subject z lista Observers, strzalki notify() do kazdego. Decorator: obiekty owiniete w siebie jak matrioszka (SimpleCoffee -> MilkDecorator -> SugarDecorator). Adapter: po lewej OldInterface, po prawej NewInterface, posrodku Adapter jako "translator". Command: stos Command obiektow (history) z execute() i undo(). Nowoczesny diagram UML z kolorowymi akcentami dla kazdego wzorca.]'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Implementujesz system platnosci wspierajacy PayPal, Stripe i kryptowaluty. Uzytkownik moze zmienic metode platnosci w trakcie dzialania aplikacji. Ktory wzorzec jest najodpowiedniejszy?',
              tagSlugs: ['design-patterns', 'behavioral-patterns', 'oop', 'intermediate'],
              choices: [
                'Singleton',
                'Strategy',
                'Decorator',
                'Command'
              ],
              correctAnswer: 'Strategy',
              solution: 'Strategy pozwala na definiowanie rodziny algorytmow (metod platnosci), enkapsulowanie kazdego i umozliwienie ich wymiennego uzywania w runtime. PaymentStrategy interface z metodami PayPalStrategy, StripeStrategy, CryptoStrategy. Context (OrderService) trzyma referencje do aktualnej strategii i moze ja zmienic przez setter. To klasyczny przypadek uzycia Strategy.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'Java I/O uzywa new BufferedReader(new FileReader("file.txt")). Ktory wzorzec projektowy to reprezentuje?',
              tagSlugs: ['design-patterns', 'structural-patterns', 'java', 'intermediate'],
              choices: [
                'Adapter - konwertuje FileReader na BufferedReader',
                'Decorator - BufferedReader opakowuje FileReader dodajac buforowanie',
                'Factory - tworzy odpowiedni typ Reader',
                'Composite - laczy wiele Readerow'
              ],
              correctAnswer: 'Decorator - BufferedReader opakowuje FileReader dodajac buforowanie',
              solution: 'To klasyczny przyklad Decorator Pattern. BufferedReader implementuje ten sam interfejs (Reader) co FileReader, ale opakowuje go dodajac dodatkowa funkcjonalnosc (buforowanie). Mozna dodawac kolejne warstwy dekoratorow: new DataInputStream(new BufferedInputStream(new FileInputStream(...))). Kazdy dekorator wzbogaca zachowanie bez modyfikacji opakowywanego obiektu.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'Observer Pattern i Event-Driven Architecture to dwa zupelnie niezwiazane ze soba podejscia do projektowania systemow.',
              tagSlugs: ['design-patterns', 'behavioral-patterns', 'intermediate'],
              correctAnswer: 'false',
              solution: 'Falsz. Event-Driven Architecture jest w istocie Observer Pattern na poziomie architektonicznym. Komponenty publikuja zdarzenia (Subject) do magistrali zdarzen, a inne komponenty subskrybuja i reaguja na zdarzenia (Observers). Spring Application Events, Apache Kafka, RabbitMQ - to wszystko realizacje Observer Pattern na roznych skalach. Rozumienie Observer Pattern pomaga zrozumiec zdarzeniowe systemy.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Wyjasnij Adapter Pattern. Masz nowa platfrome platnosci z interfejsem processPayment(double amount), ale stara biblioteka uzywana w projekcie ma metode makeTransaction(String currency, int cents). Napisz klase Adapter laczaca oba interfejsy.',
              tagSlugs: ['design-patterns', 'structural-patterns', 'oop', 'intermediate'],
              solution: 'Adapter konwertuje interfejs jednej klasy na interfejs oczekiwany przez klienta. Implementacja: 1) Definiujemy nowy interfejs PaymentProcessor z metodami processPayment(double amount). 2) Mamy istniejaca klase LegacyPaymentLibrary z makeTransaction(String currency, int cents). 3) Tworzymy LegacyPaymentAdapter implementujacy PaymentProcessor, przechowujacy referencje do LegacyPaymentLibrary. W processPayment() konwertujemy double dolary na int centy (mnozymy przez 100), parsujemy waluty, i delegujemy do oldLibrary.makeTransaction("USD", cents). Dzieki temu nowy kod uzywa wylacznie nowego interfejsu, a stara biblioteka nie jest modyfikowana.',
              points: 3,
              isPublished: false
            }
          ]
        },

        // ── LESSON 1.5 ──────────────────────────
        {
          title: 'Lesson 1.5: Antywzorce i Code Smells',
          order: 5,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Antywzorce (antipatterns) to czesto stosowane podejscia do rozwiazywania problemow, ktore sa nieskuteczne i moga prowadzic do negatywnych konsekwencji. Code smells to symptomy w kodzie, ktore sugeruja mozliwy blad projektowy - nie sa bledami same w sobie, ale wskazuja miejsca wymagajace uwagi. Znajomosc antywzorcow jest rownie wazna jak znajomosc wzorcow - pokazuje doswiadczenie i krytyczne myslenie, cenione na rozmowach kwalifikacyjnych.'
            },
            {
              blockType: 'text',
              content: '**God Class / God Object** - klasa ktora wie zbyt duzo lub robi zbyt duzo. Naruszenie SRP w ekstremalnej formie. Objawy: klasa ma setki metod, jest importowana wsedzie, jej zmiana wymaga modyfikacji wielu czesci systemu. Przyklad: `ApplicationManager` ktory zajmuje sie autoryzacja, baza danych, UI, cache, emailami i logowaniem. Naprawa: rozbij na dedykowane serwisy zgodnie z SRP.\n\n```java\n// ZLE - God Class\npublic class ApplicationManager {\n    public User login(String username, String password) { ... }\n    public void saveToDatabase(Object entity) { ... }\n    public void renderUI(String template) { ... }\n    public void sendEmail(String to, String subject) { ... }\n    public void logAction(String action) { ... }\n    // + 200 innych metod...\n}\n```'
            },
            {
              blockType: 'text',
              content: '**Primitive Obsession** - nadmierne uzywanie prymitywnych typow zamiast obiektow domenowych. Objaw: przekazywanie String dla adresu email, int dla kwoty pienieznej, String[] dla adresu. Problem: brak walidacji, brak semantyki, latwo pomylic argumenty.\n\n```java\n// ZLE - primitive obsession\npublic void createUser(String name, String email, String phone, int age) { ... }\n// Latwo przekazac email jako phone lub odwrotnie!\n\n// DOBRZE - typy domenowe\npublic record Email(String value) {\n    public Email {\n        if (!value.contains("@")) throw new IllegalArgumentException("Invalid email");\n    }\n}\npublic record PhoneNumber(String value) { ... }\npublic void createUser(String name, Email email, PhoneNumber phone, int age) { ... }\n// Teraz kompilator pilnuje poprawnosci typow!\n```'
            },
            {
              blockType: 'text',
              content: '**Magic Numbers / Magic Strings** - uzywanie niewyjasnionego literalu w kodzie. Zmniejsza czytelnosc i utrudnia zmiany.\n\n```java\n// ZLE\nif (user.getAge() >= 18) { ... }          // co oznacza 18?\nif (order.getStatus().equals("PENDING")) { } // co jesli zmienisz napis?\nThread.sleep(86400000);                    // ile to ms? (24h)\n\n// DOBRZE\nprivate static final int LEGAL_AGE = 18;\nenum OrderStatus { PENDING, CONFIRMED, SHIPPED, DELIVERED }\nprivate static final long ONE_DAY_MS = TimeUnit.DAYS.toMillis(1);\n```'
            },
            {
              blockType: 'text',
              content: '**Spaghetti Code** - kod z gleboko zagniezdzonymi if-else, petlami, i brakiem struktury. Trudny do czytania, testowania i modyfikacji. Objawy: metody o 200 linii, zagniezdzone if-y na 5+ poziomach, zmienna tymczasowe przekazywane przez caly kod.\n\n```java\n// ZLE - Arrow Pattern (spaghetti)\npublic void processOrder(Order order) {\n    if (order != null) {\n        if (order.getUser() != null) {\n            if (order.getUser().isActive()) {\n                if (order.getItems() != null && !order.getItems().isEmpty()) {\n                    // tu wreszcie logika - 4 poziomy zagniezdzenia!\n                }\n            }\n        }\n    }\n}\n\n// DOBRZE - Early return (Guard Clauses)\npublic void processOrder(Order order) {\n    if (order == null) throw new IllegalArgumentException("Order cannot be null");\n    if (order.getUser() == null) throw new IllegalStateException("Order has no user");\n    if (!order.getUser().isActive()) throw new IllegalStateException("User is not active");\n    if (order.getItems() == null || order.getItems().isEmpty()) throw new IllegalStateException("Order has no items");\n    // tu logika - 0 poziomow zagniezdzenia!\n}\n```'
            },
            {
              blockType: 'text',
              content: '**Shotgun Surgery** - zmiana jednej rzeczy wymaga modyfikacji wielu klas. Odwrotnosc God Class. Jesli za kazdym razem gdy zmieniasz format logowania musisz edytowac 15 klas - to Shotgun Surgery. Czesto wynika z naruszonego SRP (logika rozrzucona zamiast skupiona).\n\n**Feature Envy** - metoda interesuje sie bardziej innymi klasami niz wlasna. Metoda Order.calculateTotal() ktoragrab dane z Customer, Discount, Tax, Shipping i je przetwarza - moze powinna byc w TotalCalculator albo te klasy powinny dostarczac juz obliczone wartosci.\n\n**Duplicate Code (DRY violation)** - ten sam kod pojawia sie w wielu miejscach. Zmiana jednej kopii nie zmienia innych. Naprawa: wyodrebnij metode, klase, lub uzyj Template Method.'
            },
            {
              blockType: 'table',
              caption: 'Code Smells - symptomy i naprawy',
              hasHeaders: true,
              headers: ['Code Smell', 'Objaw', 'Naprawa', 'Zwiazana zasada'],
              rows: [
                ['God Class', 'Klasa z setkami metod', 'Wyodrebnij serwisy', 'SRP'],
                ['Primitive Obsession', 'String/int wszedzie', 'Typy domenowe / Value Objects', 'Enkapsulacja'],
                ['Magic Numbers', 'Nagie liczby w kodzie', 'Stale nazwane / enum', 'Czytelnosc'],
                ['Arrow Pattern', 'Gleboke if-else', 'Guard clauses / early return', 'Czytelnosc'],
                ['Shotgun Surgery', 'Zmiana -> wiele plikow', 'Skupi odpowiedzialnosc', 'SRP, kohezja'],
                ['Duplicate Code', 'Kopiuj-wklej kod', 'Ekstrakcja metody/klasy', 'DRY']
              ]
            },
            {
              blockType: 'callout',
              variant: 'tip',
              title: 'Na rozmowie: jak mowic o code review',
              content: 'Gdy pytaja Cie o doswiadczenie z code review, wspomnij konkretne code smells ktore szukasz: "Zwracam uwage na naruszenia SRP (za duze klasy), magic numbers (powinny byc stale lub enum), i deep nesting (zamieniamy na guard clauses). Uzywam zasad SOLID jako przewodnika." To pokazuje doswiadczenie i strukturalne myslenie.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Metoda processPayment() ma 10 zagniezdzen if-else, 200 linii kodu i dotyka danych z 8 roznych klas. Jak najtrafniej opiszesz ten kod?',
              tagSlugs: ['anti-patterns', 'code-quality', 'oop', 'intermediate'],
              choices: [
                'To przyklad dobrze zintegrowanego kodu',
                'To Spaghetti Code z elementami Feature Envy i naruszeniem SRP',
                'To wzorzec Command enkapsulujacy logike',
                'To przyklad God Class'
              ],
              correctAnswer: 'To Spaghetti Code z elementami Feature Envy i naruszeniem SRP',
              solution: 'Metoda 200-liniowa z 10 zagniezdzonymi if-else to spaghetti code (brak struktury, trudna do testowania). Dotykanie danych z 8 klas to Feature Envy - metoda jest bardziej zainteresowana innymi klasami niz wlasna. Naruszenie SRP - metoda ma wiele powodow do zmiany. Naprawa: podziel na male metody z guard clauses, wyodrebnij logike do wlasciwych klas, zastosuj Strategy Pattern dla warunkow.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'Primitive Obsession to antywzorzec, ktory polega na uzyciu klas obiektowych zamiast prymitywow tam gdzie prymitywy by wystarczyly.',
              tagSlugs: ['anti-patterns', 'code-quality', 'intermediate'],
              correctAnswer: 'false',
              solution: 'Falsz - to odwrotna definicja. Primitive Obsession to antywzorzec polegajacy na nadmiernym uzywaniu prymitywow (String, int, boolean) zamiast tworzenia wlasciwych typow domenowych (Email, Money, PhoneNumber). Problem: brak walidacji, brak semantyki, latwosc pomylenia argumentow. Naprawa polega na stworzeniu klas reprezentujacych pojecia domenowe - co jest pozadanym stanem.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'Po kazdej zmianie formatu logow musisz edytowac 20 roznych klas w calym projekcie. Jak nazywa sie ten antywzorzec?',
              tagSlugs: ['anti-patterns', 'code-quality', 'intermediate'],
              choices: [
                'God Class',
                'Spaghetti Code',
                'Shotgun Surgery',
                'Feature Envy'
              ],
              correctAnswer: 'Shotgun Surgery',
              solution: 'Shotgun Surgery to antywzorzec, w ktorym jedna zmiana wymagala modyfikacji wielu miejsc w kodzie. Jest to zwykle wynikiem rozproszenia odpowiedzialnosci (naruszenie SRP). Rozwiazanie: skupic logike logowania w jednej klasie (np. LoggingService), ktora inne klasy uzywaja przez DI. Wtedy zmiana formatu logow = modyfikacja tylko jednej klasy.',
              points: 1,
              isPublished: false
            }
          ]
        }
      ]
    },

    // ─────────────────────────────────────────────
    // MODULE 2: JAVA DEEP DIVE
    // ─────────────────────────────────────────────
    {
      title: 'Module 2: Java Deep Dive',
      order: 2,
      isPublished: false,

      lessons: [
        // ── LESSON 2.1 ──────────────────────────
        {
          title: 'Lesson 2.1: Java Memory Model - Heap, Stack i Garbage Collector',
          order: 1,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Znajomosc modelu pamieci Javy to jeden z markerow seniority - odroznia kogos kto "pisze w Javie" od kogos kto "rozumie Jave". Na rozmowie w Relativity, gdzie pracujesz z systemami przetwarzajacymi duze ilosci danych prawniczych, pytania o garbage collection, wycieki pamieci i OutOfMemoryError sa realnym scenariuszem. W tej lekcji rozlozymy JVM memory na czesci pierwsze.'
            },
            {
              blockType: 'text',
              content: '**Stack Memory** przechowuje ramki metod (method frames). Kazde wywolanie metody tworzy nowa ramke na stosie, zawierajaca: lokalne zmienne prymitywne, referencje do obiektow (nie same obiekty!), i adres powrotu. Stack jest zarzadzany automatycznie - ramka jest niszczona gdy metoda konczy dzialanie. Stack jest prywatny dla kazdego watku. Kiedy stos sie przepelni (gleboka rekurencja) - dostajemy `StackOverflowError`.\n\n```java\npublic void example() {\n    int x = 5;              // x na stacku\n    String s = "hello";     // referencja "s" na stacku,\n                            // ale obiekt "hello" na HEAP!\n    Person p = new Person(); // referencja "p" na stacku,\n                            // obiekt Person na HEAP!\n}\n// Po wyjsciu z metody: x i referencje znikaja ze stosu,\n// obiekty na heap czekaja na GC jesli nie ma innych referencji\n```'
            },
            {
              blockType: 'text',
              content: '**Heap Memory** to wspolna pamiec dla wszystkich watkow, gdzie JVM alokuje obiekty. Heap dzieli sie na generacje:\n\n- **Young Generation** (Eden + Survivor S0/S1): Nowo tworzone obiekty trafiaja tu. Minor GC czesto sprza ten obszar. Krotko zyajace obiekty (np. zmienne lokalne w metodach) sa tu niszczone szybko.\n- **Old Generation (Tenured)**: Obiekty ktore przezyyly kilka Minor GC sa promowane tutaj. Major GC sprza ten obszar rzadziej ale jest bardziej kosztowny.\n- **Metaspace** (od Java 8, wczesniej PermGen): Przechowuje metadane klas, bytecode, informacje o metodach.\n\nKiedy Heap jest pelny a GC nie moze zwolnic wystarczajaco pamieci - dostajemy `OutOfMemoryError: Java heap space`.'
            },
            {
              blockType: 'text',
              content: '[IMAGE_PLACEHOLDER: Diagram JVM Memory Model. Dwa glowne obszary: Stack (po lewej) i Heap (po prawej). Stack pokazuje ramki metod dla watku glownego - ramka1(main), ramka2(processData), ramka3(calculateTotal) - kazda z lokalnymi zmiennymi. Heap podzielony na Young Generation (Eden + Survivor S0 + Survivor S1) i Old Generation (Tenured). Strzalki od referencji na stosie do obiektow na heapie. Na dole: Metaspace z bytecode klas. GC strzalki pokazujace Minor GC (Young Gen) i Major GC (Old Gen). Czytelne etykiety, rozne kolory dla obszarow.]'
            },
            {
              blockType: 'text',
              content: '**Garbage Collector (GC)** automatycznie zwalnia pamiec obiektow do ktorych nie ma juz referencji. Obiekt kwalifikuje sie do GC gdy nie jest osiagalny przez zadna zyjaca referencje (reachability). JVM oferuje kilka algorytmow GC:\n\n- **Serial GC**: Pojedynczy watek, przestoje aplikacji (Stop-The-World). Dla malych aplikacji.\n- **Parallel GC**: Wiele watkow GC, nadal STW. Dobra przepustowosc, wieksze pauzy.\n- **G1 GC** (Garbage First): Domyslny od Java 9. Dzieli heap na regiony, minimalizuje pauzy. Dobry balans przepustowosci i latencji.\n- **ZGC / Shenandoah**: Ultra-niskie latencje (<10ms), skaluje sie do terabajtow. Dla low-latency systemow.\n\nWybor GC mozna ustawic flagami JVM: `-XX:+UseG1GC`, `-XX:+UseZGC`.'
            },
            {
              blockType: 'text',
              content: '**Memory Leaks w Javie** - wbrew opinii poczatkujacych, Java moze miec wycieki pamieci. Wycieki zdarzaja sie gdy trzymasz referencje do obiektow ktorych juz nie potrzebujesz, uniemozliwiajac GC ich zebranie.\n\nNajczestsze przyczyny:\n```java\n// 1. Static collections - rosna i nie sa czyszczone\nprivate static final List<byte[]> cache = new ArrayList<>();\n// Kazdy request dodaje do listy, nic nie usuwa\n\n// 2. Event listeners nie usuniete\nbutton.addActionListener(this); // dodajesz listener\n// ale nigdy nie robisz button.removeActionListener(this)!\n\n// 3. ThreadLocal nie wyczyszczone\nThreadLocal<LargeObject> threadLocal = new ThreadLocal<>();\nthreadLocal.set(new LargeObject());\n// Thread pool: ten sam watek bedzie zyc dalej, LargeObject tez!\n// Naprawa: threadLocal.remove() po uzyciu\n\n// 4. Otwarty stream / connection\nBufferedReader reader = new BufferedReader(new FileReader("file.txt"));\n// brak reader.close() lub try-with-resources\n```'
            },
            {
              blockType: 'text',
              content: 'Najlepsza praktyka dla zasobow: **try-with-resources** (Java 7+). Automatycznie zamyka zasoby implementujace `AutoCloseable`:\n\n```java\n// ZLE - moze nie zamknac w razie wyjatku\nBufferedReader reader = new BufferedReader(new FileReader("file.txt"));\nString line = reader.readLine();\nreader.close(); // co jesli readLine() rzucilo wyjatek?\n\n// DOBRZE - try-with-resources\ntry (BufferedReader reader = new BufferedReader(new FileReader("file.txt"))) {\n    String line = reader.readLine();\n} // reader.close() wywolane automatycznie nawet przy wyjatku!\n\n// Wiele zasobow\ntry (Connection conn = dataSource.getConnection();\n     PreparedStatement stmt = conn.prepareStatement(sql)) {\n    // ...\n} // oba zamkniete automatycznie w odwrotnej kolejnosci\n```'
            },
            {
              blockType: 'callout',
              variant: 'warning',
              title: 'String Pool - specjalny obszar pamieci',
              content: 'String literals w Javie sa internowane (interned) w specjalnej puli (String Pool) w Heap. "hello" == "hello" zwroci true poniewaz obie referencje wskazuja na ten sam obiekt w puli. Ale new String("hello") == new String("hello") zwroci false - to dwa rozne obiekty na heapie poza pulem. Zawsze porownuj Stringi uzywajac .equals(), nigdy ==. To klasyczne pytanie na rozmowie!'
            },
            {
              blockType: 'table',
              caption: 'Stack vs Heap - kluczowe roznice',
              hasHeaders: true,
              headers: ['Aspekt', 'Stack', 'Heap'],
              rows: [
                ['Co przechowuje', 'Prymitywy i referencje', 'Obiekty i tablice'],
                ['Zarzadzanie', 'Automatyczne (ramki)', 'Garbage Collector'],
                ['Dostep', 'Prywatny dla watku', 'Wspoldzielony (wszystkie watki)'],
                ['Szybkosc', 'Bardzo szybki (LIFO)', 'Wolniejszy (alokacja)'],
                ['Rozmiar', 'Maly (512KB-8MB)', 'Duzy (konfigurowalny -Xmx)'],
                ['Blad przepelnienia', 'StackOverflowError', 'OutOfMemoryError']
              ]
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Gdzie w pamieci JVM jest przechowywany obiekt stworzony przez "Person p = new Person()"?',
              tagSlugs: ['java', 'java-memory', 'intermediate'],
              choices: [
                'Tylko na Stack - zmienna p zawiera caly obiekt',
                'Referencja p jest na Stack, a obiekt Person jest na Heap',
                'Caly obiekt jest na Heap, nie ma nic na Stack',
                'W Metaspace razem z bytecode klasy Person'
              ],
              correctAnswer: 'Referencja p jest na Stack, a obiekt Person jest na Heap',
              solution: 'Stack przechowuje referencje (adres pamieci) do obiektu, nie sam obiekt. Obiekt Person (z jego polami) jest alokowany na Heap. Gdy metoda sie konczy, referencja p znika ze stosu, ale obiekt Person pozostaje na Heap dopoki GC go nie zbierze (jesli nie ma innych referencji do niego).',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'Dlaczego porownywanie Stringow przez == moze dawac bledne wyniki w Javie?',
              tagSlugs: ['java', 'java-gotchas', 'intermediate'],
              choices: [
                'Stringi sa prymitywami i == porownuje ich wartosci inaczej niz obiekty',
                '== porownuje referencje (adresy pamieci), nie wartosci. Dwa Stringi o tej samej tresci moga byc roznymi obiektami na Heap',
                'Java nie wspiera == dla Stringow, trzeba uzyc compareTo()',
                '== zawsze zwraca true dla Stringow z String Pool'
              ],
              correctAnswer: '== porownuje referencje (adresy pamieci), nie wartosci. Dwa Stringi o tej samej tresci moga byc roznymi obiektami na Heap',
              solution: 'W Javie == dla obiektow porownuje referencje (adresy w pamieci), nie zawartosci. "hello" == "hello" moze zwrocic true (oba wskazuja na ten sam obiekt w String Pool), ale new String("hello") == new String("hello") zwroci false (dwa rozne obiekty na Heap). Zawsze uzywaj .equals() do porownywania wartosci Stringow.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'W Javie nie mozna miec wyciekow pamieci (memory leaks), poniewaz Garbage Collector automatycznie zarzadza pamiecia.',
              tagSlugs: ['java', 'java-memory', 'intermediate'],
              correctAnswer: 'false',
              solution: 'Falsz. Java moze miec wycieki pamieci - zdarzaja sie gdy program trzyma referencje do obiektow ktorych juz nie potrzebuje, uniemozliwiajac GC ich zebranie. Typowe przyczyny: nieusuwane obiekty ze statycznych kolekcji, niezamkniete resources (streams, connections), nieusniete event listenery, ThreadLocal bez wywolania remove(). GC moze zbierac tylko obiekty nieosiagalne - jesli trzymasz referencje, obiekt nie zostanie zebrany.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Wyjasnij co sie dzieje w pamieci JVM gdy wywolujesz metode rekurencyjnie bez warunku stopu. Jaki blad dostaniesz i dlaczego?',
              tagSlugs: ['java', 'java-memory', 'intermediate'],
              solution: 'Kazde wywolanie metody tworzy nowa ramke na stosie (stack frame) przechowujaca lokalne zmienne i adres powrotu. Stos ma ograniczony rozmiar (domyslnie 512KB-1MB, konfigurowalne przez -Xss). Przy nieskonczonej rekurencji bez warunku stopu, kazde wywolanie dodaje nowa ramke nie usuwajac poprzednich. W koncu stos sie przepelni i JVM rzuci StackOverflowError (nie OutOfMemoryError!). To roznica od przepelnienia Heap (OutOfMemoryError: Java heap space). Naprawa: zawsze definiuj warunek stopu (base case) dla rekurencji, lub zamien rekurencje na iteracje z explicite zarzadzanym stosem dla glebokiej rekurencji.',
              points: 2,
              isPublished: false
            }
          ]
        },

        // ── LESSON 2.2 ──────────────────────────
        {
          title: 'Lesson 2.2: Collections Framework - Kiedy Co Uzywac',
          order: 2,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Java Collections Framework to jeden z najczesciej uzywanych i najczesciej pytanych obszarow na rozmowach kwalifikacyjnych. Musisz nie tylko wiedziec, ze "ArrayList jest szybsza od LinkedList dla losowego dostepu" - musisz wiedziec DLACZEGO i umiec to uzasadnic znajomoscia wewnetrznej implementacji. W tej lekcji przejdziemy przez kluczowe interfejsy i implementacje ze szczegolowym omowieniem zlozonosci.'
            },
            {
              blockType: 'text',
              content: '**List** - uporzadkowana kolekcja z duplikatami. Dwie glowne implementacje:\n\n**ArrayList** - oparta na dynamicznej tablicy. Dobry losowy dostep O(1) przez indeks. Dodawanie na koniec amortyzowane O(1). Wstawianie/usuwanie w srodku O(n) bo trzeba przesunac elementy. Najlepsza dla: przechowywania i iterowania danych, gdy dostep przez indeks jest czesty.\n\n**LinkedList** - doubly linked list. Dostep przez indeks O(n) - trzeba przejsc od poczatku. Wstawianie/usuwanie na poczatku/koncu O(1). Implementuje tez Deque! Najlepsza dla: kolejki/stosu gdzie czeste operacje na poczatku/koncu.\n\n```java\n// Kiedy ArrayList:\nList<String> products = new ArrayList<>();\nproducts.add("A"); // czesto dodajesz na koniec\nString first = products.get(0); // i uzyskujesz dostep przez indeks\n\n// Kiedy LinkedList (jako Queue/Deque):\nDeque<Task> taskQueue = new LinkedList<>();\ntaskQueue.addFirst(urgentTask); // O(1)!\ntaskQueue.addLast(normalTask);  // O(1)!\nTask next = taskQueue.pollFirst(); // O(1)!\n```'
            },
            {
              blockType: 'text',
              content: '**Map** - mapowanie klucz -> wartosc. Trzy kluczowe implementacje:\n\n**HashMap** - oparta na tablicy haszy. Get/Put/Remove srednie O(1) (przy dobrej funkcji hash). Nie gwarantuje porzadku. Dopuszcza jeden null key i wiele null values. Najczesciej uzywana.\n\n**TreeMap** - oparta na Red-Black Tree. Get/Put/Remove O(log n). Klucze posortowane naturalnie lub przez Comparator. Uzywaj gdy potrzebujesz posortowanych kluczy lub operacji jak firstKey(), lastKey(), headMap().\n\n**LinkedHashMap** - HashMap + doubly linked list dla porzadku wstawiania. Iteracja w porzadku wstawiania. Swietna do LRU Cache (accessOrder=true).\n\n```java\n// HashMap - szybkie lookup\nMap<String, User> userCache = new HashMap<>();\nuserCache.put("user123", user); // O(1)\nUser found = userCache.get("user123"); // O(1)\n\n// TreeMap - posortowane klucze\nTreeMap<String, Integer> scores = new TreeMap<>();\nscores.put("Alice", 95);\nscores.put("Bob", 87);\nscores.firstKey(); // "Alice" - alfabetycznie pierwszy!\n\n// LinkedHashMap - zachowaj porzadek wstawiania\nMap<String, String> config = new LinkedHashMap<>(); // klucze w kolejnosci wstawiania\n```'
            },
            {
              blockType: 'text',
              content: '**Set** - kolekcja bez duplikatow:\n\n**HashSet** - oparte na HashMap (wartosc to dummy Object). Add/Remove/Contains O(1). Brak porzadku. Najszybsze sprawdzanie czy element istnieje.\n\n**TreeSet** - oparte na TreeMap. O(log n). Elementy posortowane.\n\n**LinkedHashSet** - porzadek wstawiania + brak duplikatow.\n\n```java\n// HashSet - sprawdzanie czlonkostwa, usuwanie duplikatow\nSet<String> visitedUrls = new HashSet<>();\nif (!visitedUrls.contains(url)) { // O(1)\n    visitedUrls.add(url); // O(1)\n    crawl(url);\n}\n\n// Usuwanie duplikatow z listy\nList<String> withDuplicates = Arrays.asList("a", "b", "a", "c", "b");\nSet<String> unique = new LinkedHashSet<>(withDuplicates); // zachowuje porzadek!\n```'
            },
            {
              blockType: 'text',
              content: '**Queue i Deque**:\n\n**ArrayDeque** - implementuje Deque (double-ended queue). Szybsza niz LinkedList dla kolejek i stosow. Brak null. Uzyj jako Stack zamiast klasy Stack (Stack jest synchronized i przestarzala).\n\n**PriorityQueue** - kolejka priorytetowa (min-heap). Peek/Poll zwracaja najmniejszy element. Uzycie: Dijkstra, harmonogramy zadan, top-k problems.\n\n```java\n// Stack - uzywaj ArrayDeque!\nDeque<Integer> stack = new ArrayDeque<>();\nstack.push(1); stack.push(2); stack.push(3);\nstack.pop(); // 3 - LIFO\n\n// Queue - tez ArrayDeque!\nQueue<String> queue = new ArrayDeque<>();\nqueue.offer("first"); queue.offer("second");\nqueue.poll(); // "first" - FIFO\n\n// PriorityQueue - zawsze pobiera najmniejszy\nPriorityQueue<Integer> minHeap = new PriorityQueue<>();\nminHeap.offer(5); minHeap.offer(1); minHeap.offer(3);\nminHeap.poll(); // 1 - nie 5!\n```'
            },
            {
              blockType: 'text',
              content: '**Kluczowe zagadnienia: equals() i hashCode()**. HashMap i HashSet opieraja sie na haszy. Jesli nadpisujesz equals(), MUSISZ nadpisac hashCode() - to kontrakt! Zasada: obiekty rowne przez equals() MUSZA miec ten sam hashCode(). Obiekt bez wlasciwego hashCode() w HashMapie bedzie sie zachowac nieprzewidywalnie.\n\n```java\npublic class Person {\n    private String name;\n    private int age;\n\n    @Override\n    public boolean equals(Object o) {\n        if (this == o) return true;\n        if (!(o instanceof Person)) return false;\n        Person p = (Person) o;\n        return age == p.age && Objects.equals(name, p.name);\n    }\n\n    @Override\n    public int hashCode() {\n        return Objects.hash(name, age); // musi byc spojny z equals!\n    }\n}\n\n// Bez poprawnego hashCode:\nMap<Person, String> map = new HashMap<>();\nPerson p1 = new Person("Alice", 30);\nmap.put(p1, "engineer");\nPerson p2 = new Person("Alice", 30); // "rowny" do p1\nmap.get(p2); // null! Bez hashCode, trafia do zlego bucketa\n```'
            },
            {
              blockType: 'table',
              caption: 'Collections - zlozonosc i zastosowania',
              hasHeaders: true,
              headers: ['Klasa', 'Get', 'Add', 'Remove', 'Kiedy uzywac'],
              rows: [
                ['ArrayList', 'O(1)', 'O(1) amort.', 'O(n)', 'Czesty dostep przez indeks'],
                ['LinkedList', 'O(n)', 'O(1) na konc.', 'O(1) na konc.', 'Kolejka, czeste add/remove na krawedzi'],
                ['HashMap', 'O(1)', 'O(1)', 'O(1)', 'Szybki lookup po kluczu'],
                ['TreeMap', 'O(log n)', 'O(log n)', 'O(log n)', 'Posortowane klucze, range queries'],
                ['HashSet', 'O(1)', 'O(1)', 'O(1)', 'Szybkie contains(), unikalnosc'],
                ['PriorityQueue', 'O(1) peek', 'O(log n)', 'O(log n)', 'Min/Max element, harmonogram']
              ]
            },
            {
              blockType: 'callout',
              variant: 'warning',
              title: 'Unikaj synchronizowanych kolekcji jesli nie potrzebujesz',
              content: 'Vector i Stack sa przestarzale i synchronized - co spowalnia nawet single-threaded kod. Uzyj ArrayList i ArrayDeque zamiast nich. Dla multi-threaded potrzebujesz ConcurrentHashMap (nie Collections.synchronizedMap), CopyOnWriteArrayList, lub ConcurrentLinkedQueue. Wzmianka o tym na rozmowie pokazuje swiadomosc performance i concurrency.'
            },
            {
              blockType: 'text',
              content: '[VIDEO_PLACEHOLDER: "Java Collections Framework Tutorial" by Telusko (YouTube, 15 min). Topics covered: List, Set, Map, Queue z przykladami kodu. Recommended timestamp: 00:00-15:00. Link: https://www.youtube.com/watch?v=GdAon80-0KA Why helpful: Zwiezle pokazuje wszystkie glowne kolekcje z live codingiem - idealne powtorzenie przed interview. Quality notes: Jasne tempo, dobre przyklady kodu, sprawdzone tlumaczenia.]'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Musisz przechowac 1 milion obiektow i czesto sprawdzac czy dany obiekt juz istnieje (contains). Ktora kolekcja bedzie najszybsza?',
              tagSlugs: ['java', 'collections', 'intermediate'],
              choices: [
                'ArrayList - bo jest najpopularniejsza',
                'LinkedList - bo ma staly czas wstawiania',
                'HashSet - bo contains() jest O(1)',
                'TreeSet - bo elementy sa posortowane'
              ],
              correctAnswer: 'HashSet - bo contains() jest O(1)',
              solution: 'HashSet opiera sie na hashowaniu. contains() oblicza hash elementu i sprawdza odpowiedni "bucket" - sredni czas O(1) niezaleznie od rozmiaru kolekcji. ArrayList.contains() iteruje przez wszystkie elementy O(n). LinkedList similarly O(n). TreeSet.contains() to O(log n) - szybsze niz lista ale wolniejsze niz HashSet dla samego contains().',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'Klasa Person ma nadpisane equals() ale NIE nadpisuje hashCode(). Co sie stanie gdy uzyjesz obiektow Person jako kluczy w HashMap?',
              tagSlugs: ['java', 'collections', 'java-gotchas', 'intermediate'],
              choices: [
                'Wszystko bedzie dzialac poprawnie, hashCode() nie jest potrzebny dla HashMap',
                'Kompilator zgloszi blad - nie mozna uzyc Person jako klucza',
                'HashMap moze nie znalezc klucza przez get() nawet jesli obiekt byl wstawiony przez put()',
                'HashMap automatycznie wygeneruje hashCode na podstawie equals()'
              ],
              correctAnswer: 'HashMap moze nie znalezc klucza przez get() nawet jesli obiekt byl wstawiony przez put()',
              solution: 'HashMap uzywa hashCode() do okreslenia bucketa, potem equals() do weryfikacji. Jesli nie nadpiszesz hashCode(), dwa "rowne" obiekty (przez equals()) moga miec rozne hasze i trafia do roznych bucketow. map.get(p2) nie znajdzie wartosci wstawionej przez map.put(p1, val) nawet jesli p1.equals(p2) == true. Kontrakt Java: jezeli a.equals(b) to a.hashCode() == b.hashCode(). Zawsze nadpisuj oba lub zadne.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'LinkedList jest zawsze szybsza niz ArrayList dla operacji wstawiania elementow.',
              tagSlugs: ['java', 'collections', 'intermediate'],
              correctAnswer: 'false',
              solution: 'Falsz. Zalezy od MIEJSCA wstawiania. LinkedList jest szybsza O(1) dla wstawiania na poczatku lub koncu listy (jesli mamy referencje do wezla). Dla wstawiania w srodku LinkedList takze potrzebuje O(n) czasu na ZNALEZIENIE miejsca. ArrayList jest czesto szybsza w praktyce nawet dla wstawiania ze wzgledu na lepsze cache locality (tablica to ciagly blok pamieci). Wskazowka: dla wiekszosci przypadkow ArrayList > LinkedList.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Zbuduj system cache dla wynikow zapytan bazodanowych. Cache ma max 100 wpisow. Gdy osiagnie limit, powinien usunac najdawniej uzywany wpis (LRU - Least Recently Used). Ktora klase Java uzylbys i jak ja skonfigurujesz? Opisz implementacje.',
              tagSlugs: ['java', 'collections', 'intermediate'],
              solution: 'LinkedHashMap z accessOrder=true i nadpisana metoda removeEldestEntry() to idealne rozwiazanie dla LRU Cache. LinkedHashMap(capacity, loadFactor, accessOrder=true) przestawia element na koniec listy przy kazdym dostepie (get/put). removeEldestEntry() jest wywolywana po kazdym put() - gdy zwroci true, najstarszy element (glowa listy) jest usuwany. Implementacja: new LinkedHashMap<String, QueryResult>(100, 0.75f, true) { @Override protected boolean removeEldestEntry(Map.Entry eldest) { return size() > 100; } }. To klasyczne pytanie interview - LinkedHashMap + nadpisanie removeEldestEntry = LRU Cache w kilku liniach.',
              points: 3,
              isPublished: false
            }
          ]
        },

        // ── LESSON 2.3 ──────────────────────────
        {
          title: 'Lesson 2.3: Concurrency - Watki, Synchronizacja i ExecutorService',
          order: 3,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Wspolbieznosc (concurrency) to jeden z najtrudniejszych obszarow w programowaniu i jednoczesnie jeden z kluczowych dla systemu Relativity, ktory przetwarza olbrzymie ilosci dokumentow prawniczych. Bledne zarzadzanie watkami prowadzi do race conditions, deadlockow i trudnych do reprodukowania bugow. W tej lekcji poznasz narzedzia Javy do bezpiecznego programowania wielowatkowego.'
            },
            {
              blockType: 'text',
              content: '**Tworzenie watkow** - dwa podejscia:\n\n```java\n// 1. Extend Thread (mniej elastyczne - Java nie ma multiple inheritance)\npublic class MyThread extends Thread {\n    @Override\n    public void run() {\n        System.out.println("Running in: " + Thread.currentThread().getName());\n    }\n}\nnew MyThread().start(); // ZAWSZE start(), nigdy run()!\n\n// 2. Implement Runnable (preferowane - mozna implementowac wiele interfejsow)\npublic class MyTask implements Runnable {\n    @Override\n    public void run() {\n        System.out.println("Task running!");\n    }\n}\nnew Thread(new MyTask()).start();\n\n// 3. Lambda (najwygodniejsze dla prostych taskow)\nnew Thread(() -> System.out.println("Lambda task!")).start();\n```\nWAZNE: wywolanie `run()` zamiast `start()` nie stworzy nowego watku - wykona run() w biezacym watku!'
            },
            {
              blockType: 'text',
              content: '**Race Condition i synchronizacja** - race condition wystepuje gdy dwa watki jednoczesnie modyfikuja wspoldzielony stan i wynik zalezy od kolejnosci wykonania.\n\n```java\n// Problem - race condition!\npublic class Counter {\n    private int count = 0;\n\n    public void increment() {\n        count++; // NIE jest atomowe! Read-Modify-Write to 3 operacje!\n    }\n}\n// Watek1 czyta count=5, Watek2 czyta count=5, obaj zapisuja 6 - utracilismy jednen increment!\n\n// Rozwiazanie 1: synchronized method\npublic synchronized void increment() {\n    count++; // tylko jeden watek moze wejsc naraz\n}\n\n// Rozwiazanie 2: synchronized block (bardziej granularne)\npublic void increment() {\n    synchronized (this) {\n        count++;\n    }\n}\n\n// Rozwiazanie 3: AtomicInteger (najszybsze dla prostych licznikow)\nprivate AtomicInteger count = new AtomicInteger(0);\npublic void increment() {\n    count.incrementAndGet(); // atomowe bez synchronizacji!\n}\n```'
            },
            {
              blockType: 'text',
              content: '**volatile** - gwarantuje, ze zmiany zmiennej sa widoczne dla wszystkich watkow natychmiast (widocznosc, nie atomowosc!). Bez volatile, kompilator/JVM moze optymalizowac i keszowac wartosci w rejestrach - inny watek moze nie widziec zmiany.\n\n```java\npublic class StopFlagExample {\n    private volatile boolean running = true; // volatile - kluczowe!\n\n    public void doWork() {\n        while (running) { // zawsze czyta z glownej pamieci, nie cache\n            // praca...\n        }\n    }\n\n    public void stop() {\n        running = false; // widziane natychmiast przez wszystkie watki\n    }\n}\n// Bez volatile, watek moze keszowac running=true i nigdy nie zobaczyc zmiany!\n```\n**Kluczowe**: volatile zapewnia WIDOCZNOSC, nie ATOMOWOSC. count++ na volatile int nadal nie jest bezpieczny - uzyj synchronized lub AtomicInteger.'
            },
            {
              blockType: 'text',
              content: '**ExecutorService** - zamiast tworzyc watki recznie, uzyj puli watkow (thread pool). Tworzenie watkow jest kosztowne - pooling znacznie wydajniejszy.\n\n```java\n// Rodzaje ExecutorService\nExecutorService fixedPool = Executors.newFixedThreadPool(4); // 4 watki zawsze\nExecutorService cachedPool = Executors.newCachedThreadPool(); // dynamiczny rozmiar\nExecutorService singleThread = Executors.newSingleThreadExecutor(); // 1 watek (kolejkuje)\nScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2); // harmonogram\n\n// Uzycie - submit zwraca Future\nFuture<Integer> future = fixedPool.submit(() -> {\n    Thread.sleep(1000);\n    return 42;\n});\n\nSystem.out.println("Robie inne rzeczy...\");\nInteger result = future.get(); // blokuje az task sie skonczy\n\n// Zamykanie - ZAWSZE w finally lub try-with-resources!\nfixedPool.shutdown(); // czeka na zakonczenie zadan\nfixedPool.awaitTermination(60, TimeUnit.SECONDS);\n\n// Lub force shutdown:\nfixedPool.shutdownNow(); // przerywa trwajace zadania\n```'
            },
            {
              blockType: 'text',
              content: '**Deadlock** - dwa watki czekaja na siebie nawzajem (circular dependency na lockach). Deadlock jest cichy i bardzo trudny do debugowania.\n\n```java\n// Klasyczny deadlock\nObject lockA = new Object();\nObject lockB = new Object();\n\nThread t1 = new Thread(() -> {\n    synchronized (lockA) {           // t1 trzyma A\n        Thread.sleep(100);\n        synchronized (lockB) { }     // t1 czeka na B\n    }\n});\n\nThread t2 = new Thread(() -> {\n    synchronized (lockB) {           // t2 trzyma B\n        Thread.sleep(100);\n        synchronized (lockA) { }     // t2 czeka na A - DEADLOCK!\n    }\n});\n```\n**Zapobieganie deadlockowi**: zawsze akwiruj locki w tej samej kolejnosci (lockA przed lockB zawsze), uzywaj tryLock() z timeoutem (java.util.concurrent.locks.Lock), unikaj zagniezdzonej synchronizacji.'
            },
            {
              blockType: 'text',
              content: '**CompletableFuture (Java 8+)** - nowoczesne podejscie do asynchronicznego programowania, bez blockowania watkow:\n\n```java\n// Asynchroniczne wykonanie\nCompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {\n    return fetchDataFromDatabase(); // wykonuje sie asynchronicznie\n});\n\n// Chaining - bez blokowania!\nfuture\n    .thenApply(data -> processData(data))     // transformacja\n    .thenAccept(result -> saveResult(result)) // efekt uboczny\n    .exceptionally(ex -> { log(ex); return null; }); // obsluga bledu\n\n// Laczenie wielu futures\nCompletableFuture<String> f1 = CompletableFuture.supplyAsync(() -> fetchUser());\nCompletableFuture<String> f2 = CompletableFuture.supplyAsync(() -> fetchOrders());\n\nCompletableFuture.allOf(f1, f2)\n    .thenRun(() -> System.out.println("Oba skonczyly sie!")); // czeka na oba\n```'
            },
            {
              blockType: 'callout',
              variant: 'tip',
              title: 'ConcurrentHashMap - nie Collections.synchronizedMap',
              content: 'Dla wspoldzielonej mapy w srodowisku wielowatkowym uzyj ConcurrentHashMap, nie Collections.synchronizedMap(). SynchronizedMap blokuje CALA mape dla kazdej operacji. ConcurrentHashMap uzywa segment locking / CAS operations - wiele watkow moze pisac rownoczesnie do roznych segmentow, co drastycznie zwieksza przepustowosc. To czesto pytanie na seniority-poziomych rozmowach.'
            },
            {
              blockType: 'table',
              caption: 'Narzedzia do concurrency - kiedy uzywac',
              hasHeaders: true,
              headers: ['Narzedzie', 'Kiedy uzywac', 'Unikaj gdy'],
              rows: [
                ['synchronized', 'Prosty, krytyczny sekcja, rzadkie konflikty', 'Wysoka rywalizacja - bottleneck'],
                ['volatile', 'Prosta flaga, widocznosc bez atomowosci', 'Operacje zlozzone (count++)'],
                ['AtomicInteger/Long', 'Licznik, CAS operations, wysoka rywalizacja', 'Zlozone transakcje multi-variable'],
                ['ReentrantLock', 'Potrzebujesz tryLock(), fairness, interruptible', 'Prosta synchronizacja'],
                ['ExecutorService', 'Pula watkow, zadania asynchroniczne', 'Nigdy - zawsze uzyj zamiast new Thread'],
                ['CompletableFuture', 'Async pipeline, nie chcesz blokowac', 'Proste jednokrokowe zadania']
              ]
            },
            {
              blockType: 'text',
              content: '[IMAGE_PLACEHOLDER: Diagram concurrency w Javie. Po lewej: Race Condition - dwa watki (Thread 1 i Thread 2) jednoczesnie czytaja count=5, oba zapisuja 6, zamiast 7. W srodku: Deadlock - dwa watki z klockami A i B, strzalki pokazujace circular wait (Thread1 -> lockB, Thread2 -> lockA). Po prawej: Thread Pool - ExecutorService z 4 watkami, queue zadan czekajacych, strzalki przydzielenia. Na dole: CompletableFuture pipeline - supplyAsync -> thenApply -> thenAccept z asynchronicznymi strzalkami. Kolorowy, edukacyjny diagram.]'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Dwa watki wykonuja counter++ jednoczesnie na wspoldzielonej zmiennej int. counter zaczyna od 0. Jaki jest wynik po zakonczeniu obu watkow?',
              tagSlugs: ['java', 'concurrency', 'intermediate'],
              choices: [
                'Zawsze 2 - Java gwarantuje poprawnosc dla podstawowych operacji',
                'Zawsze 1 - drugi watek zawsze nadpisuje wynik pierwszego',
                '1 lub 2 - wynik jest nieprzewidywalny (race condition)',
                '0 - obie operacje sie anuluja'
              ],
              correctAnswer: '1 lub 2 - wynik jest nieprzewidywalny (race condition)',
              solution: 'counter++ to nie jest atomowa operacja - sklada sie z Read (odczytaj wartosc), Modify (dodaj 1), Write (zapisz z powrotem) - 3 osobnych krokow. Przy rownoleglym wykonaniu: oba watki moga odczytac 0, obliczyc 1, i zapisac 1 - zamiast oczekiwanego 2. To race condition. Naprawa: synchronized, AtomicInteger.incrementAndGet(), lub wydziel operacje do jednego watku.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'Jaka jest roznica miedzy wywolaniem thread.run() a thread.start()?',
              tagSlugs: ['java', 'concurrency', 'java-gotchas', 'intermediate'],
              choices: [
                'Nie ma roznicy - oba uruchamiaja nowy watek',
                'start() uruchamia nowy watek, run() wywoluje metode run() w biezacym watku (bez nowego watku!)',
                'run() jest szybsze bo nie potrzebuje synchronizacji',
                'start() wymaga uprawnien systemowych, run() jest bezpieczniejsze'
              ],
              correctAnswer: 'start() uruchamia nowy watek, run() wywoluje metode run() w biezacym watku (bez nowego watku!)',
              solution: 'To klasyczny blad poczatkujacych. thread.start() tworzy nowy watek systemowy i wywoluje run() w tym nowym watku - to jest wspolbieznosc. thread.run() to zwykle wywolanie metody - wykonuje sie w watku wywolujacym (main thread lub jakimkolwiek aktualnym), bez zadnej wspolbieznosci. Zawsze uzywaj start() gdy chcesz wspolbieznosci.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'Slowo kluczowe volatile w Javie gwarantuje atomowosc operacji takich jak count++.',
              tagSlugs: ['java', 'concurrency', 'intermediate'],
              correctAnswer: 'false',
              solution: 'Falsz. volatile gwarantuje WIDOCZNOSC - zmiany sa natychmiast widoczne dla wszystkich watkow bez keszowania. Nie gwarantuje ATOMOWOSCI zlozonych operacji. count++ na volatile int nadal nie jest thread-safe bo to read-modify-write (3 operacje). Dla atomowych operacji na liczbach uzyj AtomicInteger/AtomicLong lub synchronized.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Wyjasnij co to jest deadlock w Javie, jak do niego dochodzi, i jak mu zapobiegac. Podaj przyklad scenariusza deadlocku.',
              tagSlugs: ['java', 'concurrency', 'intermediate'],
              solution: 'Deadlock wystepuje gdy dwa lub wiecej watkow czeka na siebie nawzajem w sposob kolowy, uniemozliwiajac jakiemukolwiek postep. Przyklad: Thread1 trzyma Lock A i czeka na Lock B. Thread2 trzyma Lock B i czeka na Lock A - zaden nie moze kontynuowac. Warunki konieczne (Coffman conditions): 1) Mutual exclusion (lock jest ekskluzywny), 2) Hold and wait (watek trzyma locki i czeka na kolejne), 3) No preemption (lockow nie mozna zabrac silom), 4) Circular wait. Zapobieganie: 1) Zawsze akwiruj locki w tej samej kolejnosci (eliminuje circular wait), 2) Uzyj tryLock() z timeoutem - jesli nie dostaniesz locka w X sekund, cofnij i sprobuj ponownie, 3) Unikaj zagniezdzonej synchronizacji, 4) Uzyj wyzej-poziomowych abstrakcji (ConcurrentHashMap, BlockingQueue) zamiast recznie zarzadzac lockami.',
              points: 3,
              isPublished: false
            }
          ]
        },

        // ── LESSON 2.4 ──────────────────────────
        {
          title: 'Lesson 2.4: Streams API i Programowanie Funkcyjne',
          order: 4,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Java Streams API (wprowadzone w Java 8) zrewolucjonizowalo sposob przetwarzania danych w Javie. Zamiast pisac petlenie i zmienne tymczasowe, piszesz deklaratywne pipeline ktore opisuja CO chcesz zrobic, a nie JAK. Relativity przetwarza ogromne ilosci dokumentow - umiejetnosc pisania efektywnych Streams to praktyczna wartosc, nie tylko teoria.'
            },
            {
              blockType: 'text',
              content: 'Stream to sekwencja elementow ktora mozna przetwarzac w potoku (pipeline). Sklada sie z trzech czesci:\n1. **Source** (zrodlo): Collection, array, I/O channel\n2. **Intermediate operations** (posrednie): filter, map, sorted, distinct, limit - zwracaja nowy Stream (lazy!)\n3. **Terminal operation** (koncowa): collect, forEach, count, reduce - uruchamia potok\n\n```java\nList<String> employees = Arrays.asList("Alice", "Bob", "Charlie", "David", "Anna");\n\n// Przyklad pelnego pipeline\nList<String> result = employees.stream()      // zrodlo\n    .filter(name -> name.startsWith("A"))     // intermediate (lazy)\n    .map(String::toUpperCase)                 // intermediate (lazy)\n    .sorted()                                 // intermediate (lazy)\n    .collect(Collectors.toList());            // terminal - uruchamia potok!\n\n// Wynik: [ALICE, ANNA]\n```\nKluczowe: intermediate operations sa **lazy** - nie wykonuja sie dopoki terminal operation ich nie wywoła. To umozliwia optymalizacje!'
            },
            {
              blockType: 'text',
              content: 'Najwazniejsze operacje Streams:\n\n```java\nList<Employee> employees = getEmployees();\n\n// filter - filtrowanie\nList<Employee> seniors = employees.stream()\n    .filter(e -> e.getYearsExperience() >= 5)\n    .collect(Collectors.toList());\n\n// map - transformacja typu\nList<String> names = employees.stream()\n    .map(Employee::getName) // method reference\n    .collect(Collectors.toList());\n\n// flatMap - splaszczanie zagniezdoznych kolekcji\nList<String> allSkills = employees.stream()\n    .flatMap(e -> e.getSkills().stream()) // List<List<String>> -> List<String>\n    .distinct()\n    .collect(Collectors.toList());\n\n// sorted z Comparator\nList<Employee> byAge = employees.stream()\n    .sorted(Comparator.comparing(Employee::getAge).reversed())\n    .collect(Collectors.toList());\n\n// reduce - agregacja do jednej wartosci\nint totalExp = employees.stream()\n    .mapToInt(Employee::getYearsExperience)\n    .sum(); // lub .reduce(0, Integer::sum)\n\n// groupingBy - grupowanie\nMap<String, List<Employee>> byDept = employees.stream()\n    .collect(Collectors.groupingBy(Employee::getDepartment));\n\n// count, anyMatch, allMatch, noneMatch\nlong count = employees.stream().filter(e -> e.getSalary() > 100000).count();\nboolean anyJava = employees.stream().anyMatch(e -> e.getSkills().contains("Java"));\n```'
            },
            {
              blockType: 'text',
              content: '**Optional** - kontener ktory moze zawierac lub nie zawierac wartosci. Eliminuje NullPointerException przez wymuszenie explicite obslugi przypadku "brak wartosci".\n\n```java\n// Bez Optional - NullPointerException czeka!\npublic String getUserCity(int userId) {\n    User user = userRepo.findById(userId); // moze zwrocic null!\n    return user.getAddress().getCity(); // NPE jesli user lub address null!\n}\n\n// Z Optional - explicite obsluga\npublic Optional<String> getUserCity(int userId) {\n    return userRepo.findById(userId)        // zwraca Optional<User>\n        .map(User::getAddress)              // Optional<Address>\n        .map(Address::getCity);             // Optional<String>\n}\n\n// Uzycie Optional\nString city = getUserCity(123)\n    .orElse("Unknown city");              // domyslna wartosc\n\nString city2 = getUserCity(123)\n    .orElseThrow(() -> new UserNotFoundException("User not found"));\n\n// Sprawdzenie\nOptional<String> optCity = getUserCity(123);\nif (optCity.isPresent()) {\n    System.out.println(optCity.get());\n}\n// Lepiej:\noptCity.ifPresent(c -> System.out.println(c));\n```'
            },
            {
              blockType: 'text',
              content: '**Functional Interfaces i Lambdy** - interfejsy z jedyna abstrakcyjny metoda (@FunctionalInterface). Mozna je wyrazic jako lambda lub method reference.\n\n```java\n// Wbudowane funkcyjne interfejsy\nFunction<String, Integer>  f = s -> s.length();          // T -> R\nPredicate<String>          p = s -> s.isEmpty();          // T -> boolean\nConsumer<String>           c = s -> System.out.println(s); // T -> void\nSupplier<String>           s = () -> "hello";             // () -> T\nBiFunction<Integer,Integer,Integer> bf = (a, b) -> a + b;  // T,U -> R\n\n// Method references - 4 rodzaje\nList<String> names = ...;\nnames.forEach(System.out::println);         // instance method na innym obiekcie\nnames.stream().map(String::toUpperCase);    // instance method na elemencie\nnames.stream().map(Integer::parseInt);      // jest statyczna metode? nie - to jest instance\nStream.of(1,2,3).map(Object::toString);     // static method reference: Integer::parseInt\nList<String> newList = names.stream().collect(ArrayList::new, ...); // constructor ref\n```'
            },
            {
              blockType: 'text',
              content: '**Parallel Streams** - przetwarzanie rownolegle na wielu rdzeniach. Proste w uzyciu, ale nie zawsze szybsze!\n\n```java\n// Zamiana na parallel - jedna metoda!\nlong count = employees.parallelStream() // lub .stream().parallel()\n    .filter(e -> e.getSalary() > 50000)\n    .count();\n\n// Kiedy parallel jest warte:\n// - Duze kolekcje (>10k elementow)\n// - Operacje bezstanowe i niezalezne\n// - Operacje CPU-intensive\n// - Brak wspoldzielonego mutable state\n\n// Kiedy parallel SZKODZI:\n// - Male kolekcje (overhead wiekszy niz zysk)\n// - IO-bound operacje\n// - Gdy kolejnosc ma znaczenie\n// - Operacje na wspoldzielonej mutable kolekcji (race condition!)\n```\nNigdy nie zakladaj ze parallel = szybciej. Zawsze mierz!'
            },
            {
              blockType: 'callout',
              variant: 'warning',
              title: 'Streams nie sa lista - nie mozna ich reuzywac',
              content: 'Stream moze byc skonsumowan tylko raz. Po wywolaniu terminal operation, stream jest zamkniety. Probaj uzyc go ponownie -> IllegalStateException. Jesli potrzebujesz wielokrotnego przetwarzania, zbierz do List najpierw. Rowniez: unikaj w Streamach operacji z efektami ubocznymi (jak modyfikacja zewnetrznej listy w forEach) - to antywzorzec, uzyj collect() zamiast tego.'
            },
            {
              blockType: 'table',
              caption: 'Streams - kluczowe operacje',
              hasHeaders: true,
              headers: ['Operacja', 'Typ', 'Opis', 'Przyklad'],
              rows: [
                ['filter', 'Intermediate', 'Wybiera elementy spelniajace warunek', '.filter(x -> x > 0)'],
                ['map', 'Intermediate', 'Transformuje kazdy element', '.map(String::length)'],
                ['flatMap', 'Intermediate', 'Spaszcza zagniezdzone kolekcje', '.flatMap(list -> list.stream())'],
                ['sorted', 'Intermediate', 'Sortuje elementy', '.sorted(Comparator.reverseOrder())'],
                ['distinct', 'Intermediate', 'Usuwa duplikaty', '.distinct()'],
                ['collect', 'Terminal', 'Zbiera do kolekcji', '.collect(Collectors.toList())'],
                ['reduce', 'Terminal', 'Agreguje do jednej wartosci', '.reduce(0, Integer::sum)'],
                ['count', 'Terminal', 'Liczy elementy', '.count()'],
                ['anyMatch', 'Terminal', 'Sprawdza czy jakis pasuje', '.anyMatch(x -> x > 5)']
              ]
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Masz List<String> z imionami. Chcesz: 1) wyfiltruj imiona dluzsze niz 3 znaki, 2) zamien na uppercase, 3) posortuj, 4) zbierz do listy. Ktory kod jest poprawny?',
              tagSlugs: ['java', 'streams', 'intermediate'],
              choices: [
                'list.stream().filter(s -> s.length() > 3).map(String::toUpperCase).sorted().collect(Collectors.toList())',
                'list.stream().map(String::toUpperCase).filter(s -> s.length() > 3).toList().sort()',
                'list.forEach(s -> s.length() > 3).map(String::toUpperCase).sorted()',
                'list.stream().collect(Collectors.toList()).filter(s -> s.length() > 3)'
              ],
              correctAnswer: 'list.stream().filter(s -> s.length() > 3).map(String::toUpperCase).sorted().collect(Collectors.toList())',
              solution: 'Poprawny pipeline Streams: stream() -> intermediate operations (filter, map, sorted - w dowolnej kolejnosci, ale tutaj filtrujemy pierwsze dla efektywnosci) -> terminal operation (collect). Nie mozna wywolac filter() po collect() bo collect() zwraca List a nie Stream. forEach() nie zwraca Stream. Kolejnosc filter przed map jest lepsza wydajnosciowo - przekazujemy mniej elementow do map().',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'Parallel Stream zawsze wykonuje sie szybciej niz zwykly Stream dla tej samej kolekcji.',
              tagSlugs: ['java', 'streams', 'intermediate'],
              correctAnswer: 'false',
              solution: 'Falsz. Parallel Stream ma overhead tworzenia i synchronizacji watkow z ForkJoinPool. Dla malych kolekcji ten overhead jest wiekszy niz zysk z parallelizmu. Parallel Stream jest korzystny dla: duzych kolekcji (>10k elementow), operacji CPU-intensive, bezstanowych operacji bez wspoldzielonego mutable state. Dla IO-bound operacji (bazy, siec) rowniez niekoniecznie szybszy. Zawsze mierz uzywajac JMH lub profilerow.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'Jaki jest wynik: Optional.of("hello").filter(s -> s.length() > 10).orElse("default")?',
              tagSlugs: ['java', 'streams', 'intermediate'],
              choices: [
                '"hello" - filter nie zmienia wartosci Optional',
                '"default" - filter zwraca pusty Optional bo "hello" ma 5 znakow, nie > 10',
                'NullPointerException - filter na Optional nie jest dozwolony',
                'Pusty Optional - orElse() jest ignorowany'
              ],
              correctAnswer: '"default" - filter zwraca pusty Optional bo "hello" ma 5 znakow, nie > 10',
              solution: 'Optional.of("hello") tworzy Optional z wartoscia "hello". filter(s -> s.length() > 10) sprawdza warunek: "hello".length() == 5, co nie jest > 10, wiec filter zwraca Optional.empty(). Na pustym Optional, orElse("default") zwraca wartosc domyslna "default". To pokazuje power Optional do bezpiecznego lancuchowania operacji bez NPE.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Masz List<Employee> gdzie Employee ma pola: String department, int salary, String name. Uzyj Streams API, aby: znalezc srednia pensje pracownikow z dziale "Engineering", ktorzy zarabiaja powyzej 50000. Jesli dzial jest pusty lub nikt nie spelnia warunkow, zwroc 0.0.',
              tagSlugs: ['java', 'streams', 'intermediate'],
              solution: 'Rozwiazanie: employees.stream().filter(e -> "Engineering".equals(e.getDepartment())).filter(e -> e.getSalary() > 50000).mapToInt(Employee::getSalary).average().orElse(0.0). Kroki: 1) stream() na liscie, 2) filter po dziale (equals z literalem po lewej zapobiega NPE jesli getDepartment() null), 3) filter po pensji, 4) mapToInt() dla wydajnych operacji numerycznych (IntStream), 5) average() zwraca OptionalDouble bo lista moze byc pusta, 6) orElse(0.0) dla przypadku pustej kolekcji lub braku pasujacych elementow.',
              points: 3,
              isPublished: false
            }
          ]
        },

        // ── LESSON 2.5 ──────────────────────────
        {
          title: 'Lesson 2.5: Java Gotchas na Interview - Pulapki i Subtelnosci',
          order: 5,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Kazdy senior Java developer ma w glowie liste "pulapek" - nieintuicyjnych zachowan Javy, ktore moga prowadzic do bugow lub blednych odpowiedzi na rozmowach. Ta lekcja zbiera najwazniejsze z nich. Znajomosc tych subtelnosci to roznica miedzy kandydatem ktory "pisze w Javie" a tym, ktory "zna Jave".'
            },
            {
              blockType: 'text',
              content: '**Integer Caching (-128 do 127)**\n\n```java\nInteger a = 127;\nInteger b = 127;\nSystem.out.println(a == b); // TRUE! (z powodu cache)\n\nInteger c = 128;\nInteger d = 128;\nSystem.out.println(c == d); // FALSE! (poza zakresem cache)\n\nSystem.out.println(c.equals(d)); // TRUE - zawsze uzyj equals()!\n```\nJVM keszuje obiekty Integer od -128 do 127 (przez IntegerCache). Autoboxing dla wartosci w tym zakresie zwraca ten sam obiekt. Poza tym zakresem - nowy obiekt. ZAWSZE uzywaj `.equals()` dla obiektowych typow!'
            },
            {
              blockType: 'text',
              content: '**String jest immutable**\n\n```java\nString s = "hello";\ns.toUpperCase(); // NIE zmienia s! Zwraca NOWY String\nSystem.out.println(s); // "hello" - niezmienione!\n\n// Poprawnie:\nString upper = s.toUpperCase();\nSystem.out.println(upper); // "HELLO"\n\n// Konkatenacja w petli - ZLE! Tworzy N obiektow!\nString result = "";\nfor (int i = 0; i < 10000; i++) {\n    result += i; // kazde += tworzy nowy String!\n}\n\n// DOBRZE - StringBuilder jest mutable i efektywny\nStringBuilder sb = new StringBuilder();\nfor (int i = 0; i < 10000; i++) {\n    sb.append(i); // modyfikuje ten sam obiekt\n}\nString result = sb.toString();\n```'
            },
            {
              blockType: 'text',
              content: '**equals() i hashCode() kontrakt**\n\n```java\n// Jezeli a.equals(b) -> a.hashCode() == b.hashCode() (MUSI byc prawda)\n// Jezeli a.hashCode() == b.hashCode() -> a.equals(b) MOZE byc false (kolizja hasha)\n// Jezeli !a.equals(b) -> hasze MOGA byc rowne (kolizja) lub rozne\n\n// Naruszenie kontraktu:\npublic class BadClass {\n    private int value;\n\n    @Override\n    public boolean equals(Object o) {\n        return o instanceof BadClass && ((BadClass)o).value == this.value;\n    }\n    // BEZ hashCode - dziedziczy z Object (uzywa adresu pamieci)\n    // Dwa obiekty z value=5 beda equals() ale maja rozne hashCode -> ZLE!\n}\n```'
            },
            {
              blockType: 'text',
              content: '**NullPointerException - klasyczne przypadki**\n\n```java\n// 1. Unboxing null\nInteger boxed = null;\nint primitive = boxed; // NPE przy unboxingu!\n\n// 2. Wywolanie metody na null\nString s = null;\nif (s.equals("hello")) { } // NPE!\n// Poprawnie:\nif ("hello".equals(s)) { } // literaly sa bezpieczne po lewej\n\n// 3. Porownanie typow: instanceof vs null\nObject obj = null;\nif (obj instanceof String) { // false - instanceof zwraca false dla null\n    String s = (String) obj; // to NIGDY sie nie wykona\n}\n// instanceof jest null-safe!\n\n// 4. return null zamiast Optional lub pustej listy\npublic List<User> getUsers() {\n    if (noUsers) return null; // ZLE! Klient dostanie NPE\n    // return Collections.emptyList(); // DOBRZE\n}\n```'
            },
            {
              blockType: 'text',
              content: '**Checked vs Unchecked Exceptions**\n\n```java\n// Checked Exception - MUSISZ obsluzyc (catches lub throws)\n// Extends Exception (nie RuntimeException)\npublic void readFile(String path) throws IOException { // musi byc zadeklarowane\n    Files.readAllLines(Path.of(path));\n}\n\n// Unchecked Exception - mozesz ale nie musisz obsluzyc\n// Extends RuntimeException\npublic void divide(int a, int b) { // nie musi deklarowac throws\n    if (b == 0) throw new IllegalArgumentException("Division by zero\"); // unchecked\n    return a / b;\n}\n\n// Error - bledy JVM, nie powinienes lapac\n// StackOverflowError, OutOfMemoryError\n\n// Dobra praktyka:\n// - Checked: recoverable conditions (plik nie istnieje - uzytkownik moze poprawic sciezke)\n// - Unchecked: programming errors (null argument, index out of bounds)\n// - Unikaj swallowing exceptions (catch (Exception e) {}  - puste catch to ZLO)\n```'
            },
            {
              blockType: 'text',
              content: '**final, finally, finalize - trzy rozne rzeczy!**\n\n```java\n// final - stala wartosc / nie mozna nadpisac / nie mozna dziedziczyc\nfinal int MAX = 100;             // stala\nfinal class ImmutableClass { }   // nie mozna extendowac\nfinal void method() { }          // nie mozna overridowac\n\n// finally - blok wykonujacy sie zawsze (try-catch-finally)\ntry {\n    riskyOperation();\n} catch (IOException e) {\n    handleError(e);\n} finally {\n    cleanup(); // wykonuje sie ZAWSZE - nawet jesli wyjatek\n}\n\n// finalize - przestarzala metoda wywolywa przez GC przed usuniciem obiektu\n// UNIKAJ! Nie gwarantuje czasu wywolania, moze opoznic GC\n// Zamiast finalize uzyj: try-with-resources, Cleaner API (Java 9+)\n@Override\nprotected void finalize() throws Throwable { // PRZESTARZALE, nie uzywaj\n    super.finalize();\n}\n```'
            },
            {
              blockType: 'text',
              content: '**Generics i Type Erasure**\n\n```java\n// Generics sa usuwane w runtime (type erasure)!\nList<String> strings = new ArrayList<>();\nList<Integer> ints = new ArrayList<>();\n\n// W runtime oba sa po prostu ArrayList - bez informacji o typie!\nSystem.out.println(strings.getClass() == ints.getClass()); // TRUE!\n\n// Konsekwencje type erasure:\n// 1. Nie mozesz: new T() lub new T[10] - nie wiadomo czym jest T w runtime\n// 2. Instanceof z generics nie dziala: if (obj instanceof List<String>) - blad kompilacji\n// 3. Nie mozesz overloadowac tylko przez typ generyczny\n\n// Wildcards - ? extends vs ? super\nList<? extends Number> bounded = new ArrayList<Integer>(); // producent - tylko czytanie\nList<? super Integer> lower = new ArrayList<Number>();     // konsument - tylko pisanie\n// Regula PECS: Producer Extends, Consumer Super\n```'
            },
            {
              blockType: 'table',
              caption: 'Java Gotchas - szybkie podsumowanie',
              hasHeaders: true,
              headers: ['Gotcha', 'Blad', 'Poprawnie'],
              rows: [
                ['Integer ==', 'new Integer(5) == new Integer(5) -> false', 'integer1.equals(integer2)'],
                ['String immutability', 's.toUpperCase() zmienia s', 'String upper = s.toUpperCase()'],
                ['StringBuilder vs +', 'str += x w petli -> O(n^2)', 'StringBuilder.append()'],
                ['NPE na equals', '"hello".equals(s)', 'literaly po lewej lub Objects.equals()'],
                ['Checked vs Unchecked', 'Lapanie Exception wszedzie', 'Lapaj specyficzne wyjatki'],
                ['finalize()', 'Uzycie finalize() do cleanup', 'try-with-resources / AutoCloseable']
              ]
            },
            {
              blockType: 'callout',
              variant: 'info',
              title: 'Java Records (Java 16+)',
              content: 'Records to nowy typ w Javie (stable od Java 16) - niezmienne klasy danych z automatycznie generowanym konstruktorem, getterami, equals(), hashCode() i toString(). public record Person(String name, int age) {} zastepuje klase z 50 liniami boilerplate. W nowych projektach Spring Boot 3.x mozesz je spotkac. Wspomnij ze znasz Records na rozmowie - to plus.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Co wypisze ponizszy kod?\nInteger x = 100; Integer y = 100;\nSystem.out.println(x == y);\nInteger a = 200; Integer b = 200;\nSystem.out.println(a == b);',
              tagSlugs: ['java', 'java-gotchas', 'intermediate'],
              choices: [
                'true, true - Java optymalizuje wszystkie Integery',
                'false, false - zawsze uzyj equals() dla obiektow',
                'true, false - JVM keszuje Integer od -128 do 127',
                'false, true - wieksze liczby sa keszowane, male nie'
              ],
              correctAnswer: 'true, false - JVM keszuje Integer od -128 do 127',
              solution: 'JVM keszuje obiekty Integer od -128 do 127 (IntegerCache). Autoboxing 100 -> zwraca ten sam obiekt z cache, wiec x == y to true (ten sam adres pamieci). Autoboxing 200 -> tworzy nowe obiekty bo poza zakresem cache, wiec a == b to false (rozne adresy). Dlatego ZAWSZE uzywaj .equals() dla obiektow Integer, nie ==.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'Jaka jest roznica miedzy Checked a Unchecked Exception w Javie?',
              tagSlugs: ['java', 'exception-handling', 'intermediate'],
              choices: [
                'Checked exceptions sa szybsze bo sa optymalizowane przez kompilator',
                'Checked exceptions musza byc obsluzone lub zadeklarowane (throws), Unchecked (RuntimeException) nie musza',
                'Unchecked exceptions sa powazniejsze i zawsze zatrzymuja aplikacje',
                'Nie ma roznicy - to tylko nazwy dla tego samego mechanizmu'
              ],
              correctAnswer: 'Checked exceptions musza byc obsluzone lub zadeklarowane (throws), Unchecked (RuntimeException) nie musza',
              solution: 'Checked exceptions (extends Exception, nie RuntimeException) - kompilator wymaga ich obslugi przez catch lub deklaracje throws w sygnaturze metody. Przykladj: IOException, SQLException. Reprezentuja recoverable conditions. Unchecked exceptions (extends RuntimeException) - kompilator nie wymaga obslugi. Przyklady: NullPointerException, IllegalArgumentException, ArrayIndexOutOfBoundsException. Reprezentuja bledy programowe.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'String concatenation za pomoca operatora + w petli jest tak samo wydajna jak uzycie StringBuilder.',
              tagSlugs: ['java', 'java-gotchas', 'intermediate'],
              correctAnswer: 'false',
              solution: 'Falsz. Poniewaz String jest immutable, kazde uzycie += tworzy nowy obiekt String (kopiujac caly dotychczasowy content). W petli z N iteracjami tworzy sie O(N) obiektow, a total czas jest O(N^2) bo kazda konkatenacja kopiuje coraz dluzszy String. StringBuilder modyfikuje wewnetrzny bufor w miejscu - O(1) amortyzowane per append, O(N) lacznie. Roznica jest drastyczna dla duzych petli. Kompilator optymalizuje + poza petlami, ale NIE wewnatrz petli.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Wyjasnij dlaczego puste bloki catch (swallowing exceptions) sa niebezpieczne. Co powinno sie znalezc w bloku catch zamiast tego?',
              tagSlugs: ['java', 'exception-handling', 'best-practices', 'intermediate'],
              solution: 'Swallowing exceptions (puste bloki catch: catch(Exception e) {}) sa niebezpieczne z kilku powodow: 1) Ukrywaja bledy - aplikacja kontynuuje dzialanie w blednym stanie bez zadnego sygnalu, 2) Trudny debugging - gdy cos nie dziala, nie ma zadnych informacji o przyczynie, 3) Dane moga byc uszkodzone lub transakcja niepelna bez zadnego alertu. Zamiast pustego catch: a) Loguj wyjatek: logger.error("Operation failed", e), b) Przerob na odpowiedni biznesowy wyjatek: throw new OrderProcessingException("Payment failed", e), c) Jesli naprawde ignorujesz, dodaj komentarz wyjasnijacy DLACZEGO, d) Lapaj specyficzne wyjatki zamiast ogolnego Exception - pozwala obsluzyc rozne przypadki roznie, e) Rozwazyc czy wartosc domyslna ma sens: catch(IOException e) { return Collections.emptyList(); }.',
              points: 3,
              isPublished: false
            }
          ]
        }
      ]
    }
  ]
};
