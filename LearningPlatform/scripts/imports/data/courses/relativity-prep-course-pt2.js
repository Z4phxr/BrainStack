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
    // MODULE 3: C# DLA JAVA DEVELOPEROW
    // ─────────────────────────────────────────────
    {
      title: 'Module 3: C# dla Java Developerow',
      order: 3,
      isPublished: false,

      lessons: [
        // ── LESSON 3.1 ──────────────────────────
        {
          title: 'Lesson 3.1: C# vs Java - Kluczowe Roznice Skladniowe i Konceptualne',
          order: 1,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Jako Java developer masz ogromna przewage przy nauce C# - oba jezyki sa silnie typowane, obiektowe, dzialaja na wirtualnej maszynie (JVM vs CLR), i dziela wiele konceptow. Roznce sa wazne, ale nie fundamentalne. Relativity uzywa C# i .NET do budowania swojej platformy - znajomosc kluczowych roznic pokaze ze jestes zdolny do szybkiego przestawienia sie. Ta lekcja koncentruje sie na "co jest inaczej niz w Javie" - nie uczymy C# od zera, ale mapujemy Twoja wiedze.'
            },
            {
              blockType: 'text',
              content: '**Properties zamiast getterow/setterow** - w Javie piszesz `getName()` i `setName()`. C# ma wbudowany mechanizm properties:\n\n```csharp\n// Java - boilerplate gettery/settery\npublic class Person {\n    private String name;\n    public String getName() { return name; }\n    public void setName(String name) { this.name = name; }\n}\n\n// C# - properties (elegantsze!)\npublic class Person {\n    // Auto-property - kompilator generuje backing field\n    public string Name { get; set; }\n\n    // Property z walidacja\n    private int age;\n    public int Age {\n        get { return age; }\n        set {\n            if (value < 0) throw new ArgumentException("Age cannot be negative");\n            age = value;\n        }\n    }\n\n    // Read-only property (tylko get)\n    public string FullInfo => $"{Name}, age {Age}"; // expression body\n}\n\n// Uzycie - jak pola, nie jak metody!\nPerson p = new Person();\np.Name = "Alice"; // nie p.setName("Alice")!\nConsole.WriteLine(p.Name); // nie p.getName()\n```'
            },
            {
              blockType: 'text',
              content: '**var i typy - inference i roznice**\n\n```csharp\n// C# ma var (podobne do Java var z Java 10)\nvar name = "Alice";        // string - kompilator wnioskuje typ\nvar age = 25;              // int\nvar list = new List<int>(); // List<int>\n\n// Ale C# var NIE jest dynamic - typ jest statyczny!\n// name = 42; // blad kompilacji!\n\n// Typy wartosciowe (Value Types) vs Referencyjne\n// W C# struktury (struct) sa value types - kopiowane przy przypisaniu!\nstruct Point { public int X; public int Y; }\nPoint p1 = new Point { X = 1, Y = 2 };\nPoint p2 = p1;  // KOPIA - modyfikacja p2 nie zmienia p1!\n\n// W Javie wszystko (poza prymitywami) jest referencja - brak odpowiednika struct\n\n// Nullable value types (unikalne dla C#)\nint? nullableInt = null; // int? to Nullable<int>\nint value = nullableInt ?? 0; // null-coalescing operator - jesli null, uzyj 0\n```'
            },
            {
              blockType: 'text',
              content: '**Delegaty i zdarzenia (Delegates i Events)** - to C#-specific, brak bezposredniego odpowiednika w Javie:\n\n```csharp\n// Delegate - typ bezpieczny wskaznik na metode\npublic delegate int MathOperation(int a, int b);\n\npublic int Add(int a, int b) => a + b;\npublic int Multiply(int a, int b) => a * b;\n\nMathOperation op = Add;\nConsole.WriteLine(op(3, 4)); // 7\nop = Multiply;\nConsole.WriteLine(op(3, 4)); // 12\n\n// Wbudowane delegaty - Func i Action (jak Java Functional Interfaces)\nFunc<int, int, int> add = (a, b) => a + b;  // zwraca wartosc\nAction<string> print = s => Console.WriteLine(s); // void\nPredicate<int> isEven = n => n % 2 == 0;    // zwraca bool\n\n// Events - Observer Pattern wbudowany w jezyk!\npublic class Button {\n    public event EventHandler Clicked; // deklaracja zdarzenia\n\n    public void SimulateClick() {\n        Clicked?.Invoke(this, EventArgs.Empty); // ?. - null conditional\n    }\n}\n\n// Subskrypcja\nButton btn = new Button();\nbtn.Clicked += (sender, e) => Console.WriteLine("Clicked!"); // += dodaje handler\nbtn.Clicked -= handler; // -= usuwa handler\n```\nW Javie odpowiednikiem sa functional interfaces (Function, Consumer, Predicate) i listener pattern, ale C# ma to wbudowane jako jezyk, nie tylko biblioteke.'
            },
            {
              blockType: 'text',
              content: '**Kluczowe roznice skladniowe** - lista rzeczy ktore wyglada inaczej niz w Javie:\n\n```csharp\n// 1. String interpolation (podobne do Java text blocks ale inne)\nstring name = "Alice";\nstring msg = $"Hello, {name}! Age: {25 + 1}"; // $ prefix\n// Java: String.format("Hello %s!", name) lub "Hello " + name\n\n// 2. Namespace zamiast package\nnamespace Relativity.Core.Services { ... } // C#\n// package com.relativity.core.services; // Java\n\n// 3. using zamiast import\nusing System.Collections.Generic; // C#\n// import java.util.List; // Java\n\n// 4. Operator ?. (null-conditional) - C# ma, Java nie!\nstring upper = person?.Address?.City?.ToUpper(); // null jesli cokolwiek jest null\n// Java: Optional.ofNullable(person).map(p -> p.getAddress())...orElse(null)\n\n// 5. Operator ?? (null-coalescing)\nstring result = name ?? "default"; // jesli name == null -> "default"\n\n// 6. out i ref parametry (brak w Javie)\nbool success = int.TryParse("123", out int number); // number ustawione przez metode\n\n// 7. Enums z metodami - C# enum prostsze niz Java\npublic enum Status { Active, Inactive, Pending }\n// Java enum moze miec pola i metody - C# enum to tylko nazwane liczby\n\n// 8. checked/unchecked nie istnieja w C# jak w Javie (inna obsuga exceptions)\n```'
            },
            {
              blockType: 'text',
              content: '**Interfejsy i klasy w C# vs Java** - glowne roznice:\n\n```csharp\n// C# interfejs - domyslnie public (bez modyfikatora jak w Java)\npublic interface IRepository<T> {\n    T GetById(int id);\n    IEnumerable<T> GetAll();\n    void Save(T entity);\n}\n// Konwencja: nazwy interfejsow zaczynaja sie od I (IEnumerable, IDisposable)\n// Java nie ma tej konwencji\n\n// C# nie ma checked exceptions - wszystkie exceptions sa "unchecked"!\n// void ReadFile() throws IOException {} // Java - deklaracja throws\nvoid ReadFile() { ... } // C# - brak deklaracji, wszystko unchecked\n\n// sealed zamiast final (dla klas)\npublic sealed class Singleton { } // nie mozna dziedziczyc - jak final w Javie\npublic sealed override void Method() { } // nie mozna nadpisac w podklasie\n\n// abstract - identyczne jak w Java\npublic abstract class BaseRepository<T> {\n    public abstract T GetById(int id);\n    public virtual void LogAccess() { Console.WriteLine("Accessed"); } // virtual = mozna override\n}\n```'
            },
            {
              blockType: 'table',
              caption: 'Java vs C# - szybkie mapowanie konceptow',
              hasHeaders: true,
              headers: ['Koncept', 'Java', 'C#'],
              rows: [
                ['Getter/Setter', 'getName() / setName()', 'Name { get; set; }'],
                ['Typ nieokreslony', 'var (Java 10+)', 'var'],
                ['Pakiety', 'package com.example', 'namespace Example'],
                ['Import', 'import java.util.List', 'using System.Collections.Generic'],
                ['String format', 'String.format() / +', '$"interpolacja {var}"'],
                ['Null bezpieczenstwo', 'Optional<T>', '?. operator, ?? operator, Nullable<T>'],
                ['Delegaty', 'Functional interfaces', 'delegate, Func<>, Action<>'],
                ['Zdarzenia', 'Listener pattern', 'event keyword'],
                ['Brak dziedziczenia', 'final class', 'sealed class'],
                ['Override dopuszczony', 'Domyslnie', 'Wymaga virtual w bazie'],
                ['Wyjatki', 'Checked + Unchecked', 'Tylko unchecked'],
                ['Struktury', 'Brak (tylko class)', 'struct (value type)']
              ]
            },
            {
              blockType: 'callout',
              variant: 'tip',
              title: 'Virtual i Override w C# - kluczowa roznica od Javy',
              content: 'W Javie wszystkie metody (poza static, final i private) sa domyslnie wirtualne - podklasa moze je nadpisac bez zadnych slow kluczowych w klasie bazowej. W C# jest odwrotnie: metody sa domyslnie NIE-wirtualne. Aby umozliwic nadpisanie, baza musi oznaczyc metode jako virtual. Podklasa uzywa override. Jesli chcesz zablokwac dalsze nadpisywanie - uzyj sealed override. To wazna roznica ktora moze zaskoczyc Java developera przechodzacego na C#.'
            },
            {
              blockType: 'text',
              content: '[IMAGE_PLACEHOLDER: Diagram porownujacy Java i C# side-by-side. Dwie kolumny z naglowkami "Java" i "C#". Wiersze dla kluczowych konceptow: Properties (getter/setter vs {get;set;}), Null safety (Optional vs ?. operator), Events (Listener interface vs event keyword), Exception handling (checked/unchecked vs tylko unchecked), Method overriding (domyslnie virtual vs wymaga virtual keyword). Dla kazdego wiersza: snippet kodu po obu stronach z kolorowym podkresleniem roznicy. Edukacyjny diagram porownawczy.]'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Jak poprawnie zdefiniowac property "Name" w C#, ktore mozna czytac i zapisywac z zewnatrz klasy?',
              tagSlugs: ['csharp', 'intermediate'],
              choices: [
                'public string getName() { return name; } public void setName(string value) { name = value; }',
                'public string Name { get; set; }',
                'public string Name = "";',
                'public readonly string Name;'
              ],
              correctAnswer: 'public string Name { get; set; }',
              solution: 'C# properties uzywaja skladu { get; set; }. Auto-property public string Name { get; set; } automatycznie generuje backing field i dostarcza getter i setter. Pierwsza opcja to styl Java (nie C#). Publiczne pole (opcja 3) lamie enkapsulacje. readonly (opcja 4) pozwala tylko na odczyt po inicjalizacji.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'Co zwroci wyrazenie: string result = null ?? "default" ?? "backup"; w C#?',
              tagSlugs: ['csharp', 'intermediate'],
              choices: [
                'null',
                '"default"',
                '"backup"',
                'Blad kompilacji - nie mozna lancuchowac ??'
              ],
              correctAnswer: '"default"',
              solution: 'Operator ?? (null-coalescing) zwraca lewy operand jesli nie jest null, w przeciwnym razie prawy. null ?? "default" -> "default" (lewy operand null wiec bierze prawy). Nastepnie "default" ?? "backup" -> "default" (lewy operand nie jest null). Lacuchowanie ?? jest dozwolone. To bardzo uzyteczny operator C# ktory eliminuje wiele if(x == null) checks.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'W C#, podobnie jak w Javie, wszystkie metody klasy sa domyslnie wirtualne i moga byc nadpisane przez podklasy.',
              tagSlugs: ['csharp', 'oop', 'intermediate'],
              correctAnswer: 'false',
              solution: 'Falsz. To kluczowa roznica miedzy Java a C#. W Javie metody sa domyslnie wirtualne (podklasa moze override bez zadnych dodatkowych slow kluczowych w klasie bazowej). W C# metody sa domyslnie NIE-wirtualne - aby umozliwic nadpisanie, klasa bazowa musi oznaczyc metode jako virtual. Podklasa uzywa override. Jesli sprobujemy nadpisac metode bez virtual w bazie, dostaniemy ostrzezenie kompilatora (ukrycie zamiast override).',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Wyjasnij czym sa delegaty (delegates) w C# i jak sie maja do functional interfaces w Javie. Podaj przyklad uzycia Func<> i Action<> w C#.',
              tagSlugs: ['csharp', 'intermediate'],
              solution: 'Delegaty w C# to typy ktore reprezentuja referencje do metod o okreslonym podpisie. Sa typowo bezpieczne wskazniki na funkcje. Odpowiadaja Java functional interfaces (@FunctionalInterface). Wbudowane typy delegatow: Func<T, TResult> odpowiada java.util.function.Function<T,R> (przyjmuje T, zwraca TResult). Action<T> odpowiada java.util.function.Consumer<T> (przyjmuje T, zwraca void). Predicate<T> odpowiada java.util.function.Predicate<T> (przyjmuje T, zwraca bool). Przyklad: Func<int, int, int> add = (a, b) => a + b; Console.WriteLine(add(3, 4)); // 7. Action<string> log = msg => Console.WriteLine(msg); log("Hello!"). Roznica: C# ma dodatkowo event keyword ktory ogranicza dostep do delegatu (zewnetrzny kod moze tylko += i -=, nie moze Invoke() samodzielnie).',
              points: 3,
              isPublished: false
            }
          ]
        },

        // ── LESSON 3.2 ──────────────────────────
        {
          title: 'Lesson 3.2: async/await, LINQ i Generics w C#',
          order: 2,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'W tej lekcji skupiamy sie na trzech najbardziej charakterystycznych funkcjonalnosciach C# - tych ktore wyrozniaja go wsrod innych jezykow i ktore ciezko "przetlumac" 1:1 z Javy. async/await upraszcza programowanie asynchroniczne, LINQ to wbudowany jezyk zapytan dla kolekcji i baz danych, a generics maja kilka roznic wobec Javy wartych znajomosci. Opanowanie tych trzech obszarow to fundament pracy w .NET.'
            },
            {
              blockType: 'text',
              content: '**async/await** - asynchroniczne programowanie bez callback hell. C# ma to wbudowane w jezyk od C# 5.0 (2012), na dlugo przed Java CompletableFuture.\n\n```csharp\n// Synchroniczne - blokuje watek!\npublic string GetUserData(int userId) {\n    Thread.Sleep(2000); // blokuje watek na 2 sekundy!\n    return "user data";\n}\n\n// Asynchroniczne z async/await - nie blokuje!\npublic async Task<string> GetUserDataAsync(int userId) {\n    await Task.Delay(2000); // NIE blokuje - watek jest wolny w tym czasie\n    return "user data";\n}\n\n// Wywolanie:\nasync Task ProcessAsync() {\n    string data = await GetUserDataAsync(123); // czeka bez blokowania\n    Console.WriteLine(data);\n}\n\n// Rownolegle operacje\nasync Task<(string, string)> GetBothAsync() {\n    Task<string> t1 = GetUserDataAsync(1);\n    Task<string> t2 = GetOrderDataAsync(2);\n    await Task.WhenAll(t1, t2); // oba wykonuja sie rownoleglie!\n    return (t1.Result, t2.Result);\n}\n```\nKluczowe: `async` metoda zwraca `Task` (odpowiednik Java `CompletableFuture`). `await` "czeka" na wynik bez blokowania watku - pod spodem to state machine generowana przez kompilator.'
            },
            {
              blockType: 'text',
              content: '**Pulapki async/await** - rzeczy ktore moga cie zaskoczyc:\n\n```csharp\n// 1. Nie mix sync i async (deadlock!)\npublic string GetData() {\n    return GetDataAsync().Result; // NIEBEZPIECZNE - moze powodowac deadlock w ASP.NET!\n    // Uzyj: await GetDataAsync() zamiast .Result lub .Wait()\n}\n\n// 2. async void to ZLO (tylko dla event handlerow)\npublic async void DoWork() { // ZLE - wyjatki sa tracone!\n    await SomeOperationAsync();\n}\npublic async Task DoWorkAsync() { // DOBRZE\n    await SomeOperationAsync();\n}\n\n// 3. ConfigureAwait(false) - w bibliotekach unikaj przechwytywania kontekstu\npublic async Task<string> LibraryMethodAsync() {\n    var result = await HttpClient.GetAsync(url).ConfigureAwait(false);\n    // false = nie wracaj do oryginalnego kontekstu (szybsze w bibliotekach)\n    return await result.Content.ReadAsStringAsync().ConfigureAwait(false);\n}\n\n// 4. Async all the way - jesli jeden poziom jest async, wszystkie musza byc\n// Nie mozna wywolac await w metodzie nie-async\n```'
            },
            {
              blockType: 'text',
              content: '**LINQ** (Language Integrated Query) - wbudowany jezyk zapytan dla kolekcji, XML, baz danych. Jezeli lubisz Java Streams, LINQ bedzie intuicyjne - ale z lepszym query syntax!\n\n```csharp\nList<Employee> employees = GetEmployees();\n\n// Dwa style LINQ - Query Syntax i Method Syntax\n\n// Method Syntax (podobny do Java Streams)\nvar seniors = employees\n    .Where(e => e.YearsExperience >= 5)    // filter\n    .Select(e => e.Name)                    // map\n    .OrderBy(e => e)                        // sorted\n    .ToList();                              // collect\n\n// Query Syntax (podobny do SQL - unikalne dla C#!)\nvar seniors2 = from e in employees\n               where e.YearsExperience >= 5\n               select e.Name into name\n               orderby name\n               select name;\n\n// Zaawansowane operacje\nvar avgSalary = employees\n    .Where(e => e.Department == "Engineering")\n    .Average(e => e.Salary); // zamiast mapToInt().average()\n\nvar grouped = employees\n    .GroupBy(e => e.Department)\n    .Select(g => new { Dept = g.Key, Count = g.Count() });\n    // anonymous types - jak Records w Javie ale inline!\n\n// Pierwsza i ostatnia\nEmployee first = employees.First(e => e.Name.StartsWith("A")); // rzuca jesli brak\nEmployee? firstOrNull = employees.FirstOrDefault(e => e.Name.StartsWith("Z")); // null jesli brak\n```'
            },
            {
              blockType: 'text',
              content: '**LINQ do baz danych - Entity Framework Core** - LINQ nie tylko dla kolekcji! Entity Framework Core (ORM dla .NET) pozwala pisac LINQ ktory jest tlumaczony na SQL:\n\n```csharp\n// LINQ -> SQL automatycznie!\nvar recentOrders = await context.Orders\n    .Where(o => o.CreatedAt > DateTime.Now.AddDays(-7))\n    .Include(o => o.Customer)  // JOIN\n    .OrderByDescending(o => o.Total)\n    .Take(10)                  // TOP 10\n    .ToListAsync();            // async query!\n\n// Powyzsze generuje SQL:\n// SELECT TOP 10 o.*, c.*\n// FROM Orders o JOIN Customers c ON o.CustomerId = c.Id\n// WHERE o.CreatedAt > DATEADD(day, -7, GETDATE())\n// ORDER BY o.Total DESC\n\n// Deferred execution - jak Java Streams!\nIQueryable<Order> query = context.Orders.Where(o => o.Total > 1000);\n// Na razie zero SQL!\nquery = query.OrderBy(o => o.CreatedAt); // jeszcze zero SQL!\nList<Order> results = await query.ToListAsync(); // TERAZ wykonuje SQL\n```\nTo odpowiednik Hibernate/JPA w Javie, ale z LINQ zamiast JPQL lub Criteria API.'
            },
            {
              blockType: 'text',
              content: '**Generics w C# vs Java** - podobne ale z kilkoma wazanymi ruznicami:\n\n```csharp\n// Podstawowe generics - podobne do Java\npublic class Repository<T> where T : class { // constraint - T musi byc klasa (reference type)\n    private List<T> items = new List<T>();\n    public T GetById(int id) => items[id];\n    public void Add(T item) => items.Add(item);\n}\n\n// Constraints - bardziej rozbudowane niz w Java\npublic class Service<T> where T : class, IEntity, new() {\n    // T musi byc: klasa, implementowac IEntity, miec bezparametrowy konstruktor\n    T instance = new T(); // mozliwe dzieki new() constraint!\n}\n\n// Kluczowa roznica: C# NIE ma type erasure!\n// Java usuwa typy generyczne w runtime (type erasure)\n// C# zachowuje informacje o typach w runtime!\nvoid ShowType<T>() {\n    Console.WriteLine(typeof(T).Name); // dziala w runtime!\n}\nShowType<int>();    // "Int32"\nShowType<string>(); // "String"\n\n// W Javie to niemozliwe z powodu type erasure:\n// public void showType(List<T> list) { list.getClass().getGenericInterfaces(); // ograniczone }\n\n// Covariance i contravariance (zaawansowane)\nIEnumerable<string> strings = new List<string>();\nIEnumerable<object> objects = strings; // OK! IEnumerable<out T> jest covariant\n// W Java: List<String> nie jest podtypem List<Object>!\n```'
            },
            {
              blockType: 'callout',
              variant: 'info',
              title: 'IEnumerable vs IQueryable - wazna roznica w .NET',
              content: 'IEnumerable<T> - wykonuje operacje w pamieci (jak Java Stream). Dane sa pobrane do pamieci, filtrowanie w C#. IQueryable<T> - zapytanie jest budowane jako wyrazenie i wykonywane przez provider (np. Entity Framework konwertuje na SQL). Uzywaj IQueryable dla zapytan bazodanowych - pozwala EF na generowanie optymalnego SQL. Uzywaj IEnumerable po pobraniu danych do pamieci. Mieszanie moze prowadzic do N+1 problem lub pobrania wszystkich rekordow do pamieci przed filtrowaniem.'
            },
            {
              blockType: 'text',
              content: '[VIDEO_PLACEHOLDER: "C# LINQ Tutorial for Beginners" by Kudvenkat (YouTube, 20 min). Topics covered: LINQ query syntax, method syntax, Where/Select/OrderBy/GroupBy, deferred execution. Recommended timestamp: 00:00-20:00. Link: https://www.youtube.com/watch?v=yClSNQdVD7g Why helpful: Bardzo jasne tlumaczenie LINQ z SQL analogiami - idealne dla kogos kto zna SQL i Java Streams. Quality notes: Swietna jakosc, wolne tempo, duzo przykladow kodu na zywo.]'
            },
            {
              blockType: 'table',
              caption: 'Java Streams vs C# LINQ - mapowanie operacji',
              hasHeaders: true,
              headers: ['Java Streams', 'C# LINQ', 'Opis'],
              rows: [
                ['.filter(predicate)', '.Where(predicate)', 'Filtrowanie elementow'],
                ['.map(function)', '.Select(function)', 'Transformacja elementow'],
                ['.flatMap(function)', '.SelectMany(function)', 'Splaszczenie kolekcji'],
                ['.sorted(comparator)', '.OrderBy() / .OrderByDescending()', 'Sortowanie'],
                ['.collect(toList())', '.ToList() / .ToArray()', 'Materializacja wyniku'],
                ['.count()', '.Count()', 'Liczenie elementow'],
                ['.anyMatch()', '.Any()', 'Czy jakis spelnia warunek'],
                ['.allMatch()', '.All()', 'Czy wszystkie spelniaja warunek'],
                ['.reduce()', '.Aggregate()', 'Agregacja'],
                ['.distinct()', '.Distinct()', 'Unikalne elementy'],
                ['.limit(n)', '.Take(n)', 'Pierwsze N elementow'],
                ['.skip(n)', '.Skip(n)', 'Pomin N elementow']
              ]
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Co sie stanie gdy wywolasz .Result na Task<T> w ASP.NET Core zamiast await?',
              tagSlugs: ['csharp', 'async-await', 'intermediate'],
              choices: [
                'Nic - .Result i await sa rownowazne',
                'Moze wystapic deadlock, szczegolnie w ASP.NET Core ze wzgledu na synchronization context',
                'Aplikacja automatycznie przejdzie na async bez deadlocku',
                'Kompilator zabrania uzycia .Result w ASP.NET Core'
              ],
              correctAnswer: 'Moze wystapic deadlock, szczegolnie w ASP.NET Core ze wzgledu na synchronization context',
              solution: 'W ASP.NET Core (i WinForms/WPF), wywolanie .Result lub .Wait() na Task moze spowodowac deadlock. ASP.NET Core ma synchronization context - gdy metoda async kontynuuje po await, probuje wrocic do oryginalnego kontekstu (watku). Ale ten watek jest zablokowany przez .Result czekajac na Task. Kazdy czeka na drugiego - deadlock! Rozwiazanie: zawsze uzywaj await zamiast .Result, lub jesli musisz - ConfigureAwait(false).',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'Jakie jest C# LINQ odpowiedniki Java: employees.stream().filter(e -> e.getSalary() > 50000).map(Employee::getName).collect(Collectors.toList())?',
              tagSlugs: ['csharp', 'linq', 'intermediate'],
              choices: [
                'employees.Where(e => e.Salary > 50000).Map(e => e.Name).ToList()',
                'employees.Where(e => e.Salary > 50000).Select(e => e.Name).ToList()',
                'employees.Filter(e => e.Salary > 50000).Select(e => e.Name).Collect()',
                'from e in employees where e.Salary > 50000 collect e.Name'
              ],
              correctAnswer: 'employees.Where(e => e.Salary > 50000).Select(e => e.Name).ToList()',
              solution: 'LINQ method syntax: Where() odpowiada filter(), Select() odpowiada map(), ToList() odpowiada collect(Collectors.toList()). C# LINQ nie ma Map() - to Select(). Collect() nie istnieje w C# - uzywamy ToList(), ToArray(), ToDictionary() etc. Query syntax alternatywa: from e in employees where e.Salary > 50000 select e.Name.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'C# generics, podobnie jak Java generics, uzywaja type erasure - informacje o typach sa usuwane w runtime.',
              tagSlugs: ['csharp', 'intermediate'],
              correctAnswer: 'false',
              solution: 'Falsz. To kluczowa roznica miedzy Java i C# generics. Java uzywa type erasure - typy generyczne sa usuwane w czasie kompilacji, w runtime List<String> i List<Integer> sa tym samym typem raw List. C# zachowuje peine informacje o typach generycznych w runtime (reification). Mozna napisac typeof(T), new T() z new() constraint, sprawdzac is List<string> w runtime. To wazna zaleta C# generics nad Java.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Masz liste produktow (klasa Product z polami: string Name, decimal Price, string Category, int Stock). Uzyj LINQ aby znalezc nazwy 3 najtanszych produktow z kategorii "Electronics" ktore sa dostepne na stanie (Stock > 0). Posortuj wynik alfabetycznie.',
              tagSlugs: ['csharp', 'linq', 'intermediate'],
              solution: 'var result = products.Where(p => p.Category == "Electronics" && p.Stock > 0).OrderBy(p => p.Price).Take(3).OrderBy(p => p.Name).Select(p => p.Name).ToList(). Albo w query syntax: var result = (from p in products where p.Category == "Electronics" && p.Stock > 0 orderby p.Price take 3... note: take nie istnieje w query syntax wiec mieszamy: (from p in products where p.Category == "Electronics" && p.Stock > 0 orderby p.Price select p).Take(3).OrderBy(p => p.Name).Select(p => p.Name).ToList(). Kluczowe: Where() na wielokrotnych warunkach, OrderBy dla ceny, Take(3) dla top 3, kolejny OrderBy dla alfabetycznego sortowania nazw, Select() dla projekcji tylko na nazwy, ToList() dla materializacji.',
              points: 3,
              isPublished: false
            }
          ]
        },

        // ── LESSON 3.3 ──────────────────────────
        {
          title: 'Lesson 3.3: .NET Ekosystem - ASP.NET Core, Dependency Injection i Co Musisz Wiedziec',
          order: 3,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: '.NET to platforma Microsoftu do budowania aplikacji - odpowiednik JVM+Maven+Spring dla Javy. Relativity buduje swoja platforme na .NET i C# - znajomosc ekosystemu, nawet pobie znie, pokazuje ze powaznie podchodzisz do stanowiska. W tej lekcji omawiamy kluczowe elementy ktore beda relewantne w pracy: ASP.NET Core (framework webowy), wbudowany kontener DI, i narzedzia ekosystemu.'
            },
            {
              blockType: 'text',
              content: '**ASP.NET Core - Web Framework** - odpowiednik Spring Boot dla .NET. Szybki, cross-platform (dziala na Linux/Mac/Windows), open-source.\n\n```csharp\n// Program.cs - punkt wejscia aplikacji (odpowiednik Spring Boot main)\nvar builder = WebApplication.CreateBuilder(args);\n\n// Rejestracja serwisow (DI Container - odpowiednik Spring Beans)\nbuilder.Services.AddControllers();                    // MVC\nbuilder.Services.AddScoped<IUserRepository, UserRepository>(); // DI\nbuilder.Services.AddSingleton<IConfiguration>(config);\n\nvar app = builder.Build();\n\n// Middleware pipeline (odpowiednik Spring Filter Chain)\napp.UseHttpsRedirection();\napp.UseAuthentication();\napp.UseAuthorization();\napp.MapControllers();\n\napp.Run();\n\n// Controller - odpowiednik @RestController w Spring\n[ApiController]\n[Route("api/[controller]")] // np. api/users\npublic class UsersController : ControllerBase {\n    private readonly IUserRepository _repo;\n\n    public UsersController(IUserRepository repo) { // Constructor Injection\n        _repo = repo;\n    }\n\n    [HttpGet("{id}")]                           // GET api/users/123\n    public async Task<ActionResult<User>> GetUser(int id) {\n        var user = await _repo.GetByIdAsync(id);\n        if (user == null) return NotFound();\n        return Ok(user);\n    }\n\n    [HttpPost]                                  // POST api/users\n    public async Task<ActionResult<User>> CreateUser([FromBody] CreateUserDto dto) {\n        var user = await _repo.CreateAsync(dto);\n        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);\n    }\n}\n```'
            },
            {
              blockType: 'text',
              content: '**Dependency Injection w .NET** - wbudowany kontener DI (nie potrzeba Spring!). Trzy zakresy zycia:\n\n```csharp\n// Rejestracja w Program.cs / Startup.cs\nbuilder.Services.AddSingleton<IMyService, MyService>();\n// Jedna instancja przez caly czas zycia aplikacji\n// Odpowiednik: @Singleton w Spring lub singleton scope\n\nbuilder.Services.AddScoped<IUserRepository, UserRepository>();\n// Jedna instancja per request HTTP\n// Najczestszy dla bazy danych - caly request uzywa tego samego DbContext\n// Odpowiednik: @RequestScope w Spring (rzadziej uzywany - Spring domyslnie singleton)\n\nbuilder.Services.AddTransient<IEmailSender, EmailSender>();\n// Nowa instancja za kazdym razem gdy jest wstrzykiwana\n// Uzywaj dla lekkich, bezstanowych serwisow\n\n// Wstrzykiwanie przez konstruktor (preferowane!)\npublic class OrderService {\n    private readonly IOrderRepository _repo;\n    private readonly IEmailSender _email;\n    private readonly ILogger<OrderService> _logger;\n\n    public OrderService(\n        IOrderRepository repo,\n        IEmailSender email,\n        ILogger<OrderService> logger) {\n        _repo = repo;\n        _email = email;\n        _logger = logger;\n    }\n}\n// .NET automatycznie wstrzyknie zarejestrowane serwisy!\n```\n**Konwencja**: prywatne pola poprzedzone `_` (underscore) - to standard C#.'
            },
            {
              blockType: 'text',
              content: '**Middleware Pipeline** - jak Spring Filter Chain. Kazde zadanie HTTP przechodzi przez lancuch middleware:\n\n```csharp\n// Middleware to funkcja: (HttpContext, next) => Task\n// Kolejnosc ma znaczenie!\n\napp.Use(async (context, next) => {\n    // Przed nastepnym middleware\n    Console.WriteLine($"Request: {context.Request.Path}");\n    await next.Invoke(); // wywolaj nastepne middleware\n    // Po nastepnym middleware\n    Console.WriteLine($"Response: {context.Response.StatusCode}");\n});\n\n// Wbudowane middleware\napp.UseRouting();           // dopasowanie tras\napp.UseAuthentication();    // sprawdzenie kto dzwoni (JWT, Cookie)\napp.UseAuthorization();     // sprawdzenie czy ma prawo\napp.UseExceptionHandler();  // globalna obsluga wyjatkow\napp.UseStaticFiles();       // pliki statyczne\napp.UseHttpsRedirection();  // przekierowanie HTTP -> HTTPS\n\n// Kolejnosc: Authentication PRZED Authorization (wazne!)\n```'
            },
            {
              blockType: 'text',
              content: '**Narzedzia .NET ekosystemu** - odpowiedniki Java tooling:\n\n```\nNarzedzie .NET        | Odpowiednik Java\n---------------------|------------------\ndotnet CLI           | mvn / gradle CLI\nNuGet                | Maven Central / Gradle repos\n.csproj              | pom.xml / build.gradle\nEntity Framework Core| Hibernate / JPA\nXUnit / NUnit        | JUnit\nMoq / NSubstitute    | Mockito\nSerilog / NLog       | Log4j / Logback / SLF4J\nSwagger/Swashbuckle  | SpringDoc / Springfox\nAutoMapper           | MapStruct\n```\n\n```bash\n# Podstawowe komendy dotnet CLI\ndotnet new webapi -n MyApi    # nowy projekt WebAPI\ndotnet build                  # kompilacja\ndotnet run                    # uruchomienie\ndotnet test                   # testy\ndotnet add package Serilog    # dodaj NuGet package (jak mvn add dependency)\ndotnet publish -c Release     # build produkcyjny\n```'
            },
            {
              blockType: 'text',
              content: '**IDisposable i using statement** - zarzadzanie zasobami w C# (odpowiednik Java try-with-resources):\n\n```csharp\n// Implementacja IDisposable - jak AutoCloseable w Java\npublic class DatabaseConnection : IDisposable {\n    private SqlConnection _connection;\n\n    public DatabaseConnection(string connectionString) {\n        _connection = new SqlConnection(connectionString);\n        _connection.Open();\n    }\n\n    public void Dispose() {\n        _connection?.Dispose();\n        _connection = null;\n    }\n}\n\n// Uzycie - using statement automatycznie wywoluje Dispose()\nusing (var conn = new DatabaseConnection(connectionString)) {\n    // uzyj polaczenia\n} // Dispose() wywolane automatycznie - nawet przy wyjatku!\n\n// C# 8+ - using declaration (jeszcze krotsze)\nusing var conn = new DatabaseConnection(connectionString); // Dispose na koncu scope\n// mozna mieszac wiele using w jednym bloku!\nusing var conn1 = new DatabaseConnection(cs1);\nusing var conn2 = new DatabaseConnection(cs2);\n// oba zostana Dispose() na koncu bloku\n```'
            },
            {
              blockType: 'callout',
              variant: 'tip',
              title: 'Przydatne na rozmowie: Record Types w C# 9+',
              content: 'C# 9 wprowadzil Record types - niezmienne typy danych z automatycznym equals(), hashCode(), toString() i destrukturyzacja. public record Person(string Name, int Age); to 1 linia zamiast 30+ linii boilerplate. Bardzo podobne do Java Records (Java 16). Relativity uzywa nowoczesnego .NET wiec mozesz spotkac records w kodzie. Wspomnij ze znasz te funkcjonalnosc na rozmowie.'
            },
            {
              blockType: 'text',
              content: '[IMAGE_PLACEHOLDER: Diagram porownujacy Spring Boot i ASP.NET Core. Dwie kolumny side-by-side. Spring Boot: main() -> SpringApplication.run(), @RestController, @Service, @Repository, @Autowired, application.properties. ASP.NET Core: WebApplication.CreateBuilder(), [ApiController], AddScoped/Singleton/Transient, constructor injection, appsettings.json. Strzalki pokazujace odpowiedniki miedzy nimi. Na dole: HTTP request flow - wejscie przez Middleware/Filter Chain, przez Controller, przez Service, do Repository, do Database. Czytelny diagram architektoniczny.]'
            },
            {
              blockType: 'table',
              caption: 'Spring Boot vs ASP.NET Core - mapowanie',
              hasHeaders: true,
              headers: ['Spring Boot', 'ASP.NET Core', 'Opis'],
              rows: [
                ['@SpringBootApplication', 'WebApplication.CreateBuilder()', 'Punkt wejscia aplikacji'],
                ['@RestController', '[ApiController] + ControllerBase', 'Kontroler REST'],
                ['@GetMapping / @PostMapping', '[HttpGet] / [HttpPost]', 'Mapowanie endpointow'],
                ['@Service', 'AddScoped<I,T>()', 'Rejestracja serwisu'],
                ['@Repository', 'AddScoped<I,T>()', 'Rejestracja repozytorium'],
                ['@Autowired (constructor)', 'Constructor parameter', 'Wstrzykiwanie zaleznosci'],
                ['application.properties', 'appsettings.json', 'Konfiguracja'],
                ['Hibernate/JPA', 'Entity Framework Core', 'ORM'],
                ['@Transactional', 'TransactionScope / EF SaveChanges', 'Transakcje'],
                ['Spring Security', 'ASP.NET Identity / JWT Middleware', 'Autentykacja']
              ]
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Jaka jest roznica miedzy AddScoped, AddSingleton i AddTransient w .NET DI container?',
              tagSlugs: ['csharp', 'dotnet', 'intermediate'],
              choices: [
                'Nie ma roznicy - wszystkie tworza nowa instancje za kazdym razem',
                'Singleton: 1 instancja na aplikacje. Scoped: 1 instancja na request HTTP. Transient: nowa instancja za kazdym razem',
                'Scoped: 1 instancja na aplikacje. Singleton: 1 instancja na request. Transient: nowa instancja za kazdym razem',
                'Transient: 1 instancja na aplikacje. Scoped: nowa instancja za kazdym razem. Singleton: 1 na request'
              ],
              correctAnswer: 'Singleton: 1 instancja na aplikacje. Scoped: 1 instancja na request HTTP. Transient: nowa instancja za kazdym razem',
              solution: 'AddSingleton - jedna instancja przez caly czas zycia aplikacji (jak Spring singleton beans). Uzywaj dla stateless serwisow i konfiguracji. AddScoped - nowa instancja per request HTTP, wspoldzielona w obrebie jednego requestu. Idealne dla DbContext / repozytoriow - caly request uzywa tej samej sesji bazy. AddTransient - nowa instancja za kazdym razem gdy serwis jest wstrzykiwany. Uzywaj dla lekkich, bezstanowych serwisow.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'W ASP.NET Core, kolejnosc dodawania middleware w Program.cs nie ma znaczenia dla dzialania aplikacji.',
              tagSlugs: ['csharp', 'dotnet', 'intermediate'],
              correctAnswer: 'false',
              solution: 'Falsz. Kolejnosc middleware ma KLUCZOWE znaczenie. Middleware tworzy potok (pipeline) gdzie kazde zadanie przechodzi przez nie kolejno. Przyklad: UseAuthentication() MUSI byc przed UseAuthorization() - najpierw identyfikujemy kto dzwoni, potem sprawdzamy czy ma uprawnienia. UseRouting() musi byc przed MapControllers(). UseExceptionHandler() powinien byc pierwszy - zeby moc lapac wyjatki z innych middleware. Bledna kolejnosc = nieprawidlowe dzialanie lub bledy runtime.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'Ktora opcja poprawnie implementuje IDisposable pattern aby zasoby byly zawsze zwolnione?',
              tagSlugs: ['csharp', 'dotnet', 'intermediate'],
              choices: [
                'Wywolaj Dispose() recznie na koncu metody',
                'Uzyj using statement lub using declaration',
                'Uzyj finalize() do zwolnienia zasobow',
                'Poloz sie na Garbage Collector by wywolal Dispose()'
              ],
              correctAnswer: 'Uzyj using statement lub using declaration',
              solution: 'using statement (using (var x = new Resource()) { }) automatycznie wywoluje Dispose() na koncu bloku nawet jesli wyjatek zostanie rzucony. using declaration (using var x = new Resource();) wywoluje Dispose() na koncu scope metody. Reczne wywolanie Dispose() jest bledne bo wyjatek przed Dispose() spowoduje wyciek. finalize() jest przestarzale i nie gwarantuje czasu wykonania. GC nie wywoluje Dispose() automatycznie!',
              points: 1,
              isPublished: false
            }
          ]
        }
      ]
    },

    // ─────────────────────────────────────────────
    // MODULE 4: SQL SERVER
    // ─────────────────────────────────────────────
    {
      title: 'Module 4: SQL Server i Bazy Danych',
      order: 4,
      isPublished: false,

      lessons: [
        // ── LESSON 4.1 ──────────────────────────
        {
          title: 'Lesson 4.1: SQL Server - Specyfika i Roznice wobec PostgreSQL/MySQL',
          order: 1,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Relativity uzywa Microsoft SQL Server jako glownej bazy danych. Jezeli znasz PostgreSQL lub MySQL, SQL Server bedzie znajomy - rdzen SQL jest taki sam. Ale SQL Server ma swoja specyfike skladniowa, swoje funkcje i swoje narzedzia. W tej lekcji omawiamy kluczowe roznice i to, co SQL Server robi inaczej. Znajomosc T-SQL (Transact-SQL - dialekt SQL Servera) jest wartoscia na rozmowie w Relativity.'
            },
            {
              blockType: 'text',
              content: '**T-SQL specyfika - TOP, ISNULL, GETDATE i inne**\n\n```sql\n-- TOP zamiast LIMIT (PostgreSQL/MySQL)\n-- PostgreSQL: SELECT * FROM Orders LIMIT 10;\nSELECT TOP 10 * FROM Orders;               -- SQL Server\nSELECT TOP 10 PERCENT * FROM Orders;       -- top 10% wierszy!\n\n-- TOP z ORDER BY - praktyczny przyklad\nSELECT TOP 5 OrderId, Total\nFROM Orders\nORDER BY Total DESC; -- 5 najdrozszych zamowien\n\n-- ISNULL zamiast COALESCE (obydwa dzialaja w SQL Server!)\nSELECT ISNULL(MiddleName, \'N/A\') FROM Customers;      -- SQL Server specific\nSELECT COALESCE(MiddleName, \'N/A\') FROM Customers;    -- standard SQL (lepiej!)\n\n-- Funkcje daty\nSELECT GETDATE();              -- aktualny czas (PostgreSQL: NOW())\nSELECT GETUTCDATE();           -- aktualny czas UTC\nSELECT DATEADD(day, 7, GETDATE());           -- dodaj 7 dni\nSELECT DATEDIFF(day, OrderDate, GETDATE());  -- roznica w dniach\nSELECT DATEPART(year, OrderDate);            -- wyciagnij czesc daty\n\n-- STRING funkcje\nSELECT LEN(Name) FROM Customers;            -- dlugosc (PostgreSQL: LENGTH())\nSELECT CHARINDEX(\'@\', Email) FROM Customers; -- pozycja znaku (PostgreSQL: STRPOS())\nSELECT CONCAT(FirstName, \' \', LastName) FROM Customers; -- laczenie\n```'
            },
            {
              blockType: 'text',
              content: '**Identifikatory i nazewnictwo** - SQL Server ma specyfike:\n\n```sql\n-- SQL Server: square brackets dla nazw z spacjami lub slowami kluczowymi\nSELECT [Order Id], [User Name] FROM [Order Details];\n-- PostgreSQL: cudzyslow dla identyfikatorow\nSELECT "Order Id", "User Name" FROM "Order Details";\n\n-- Identity (auto-increment)\nCREATE TABLE Products (\n    ProductId INT IDENTITY(1,1) PRIMARY KEY,  -- SQL Server: IDENTITY(start, increment)\n    Name NVARCHAR(100) NOT NULL               -- NVARCHAR = unicode (vs VARCHAR)\n);\n-- PostgreSQL: SERIAL lub GENERATED ALWAYS AS IDENTITY\n-- MySQL: AUTO_INCREMENT\n\n-- NVARCHAR vs VARCHAR - wazna roznica!\n-- NVARCHAR - przechowuje unicode (2 bajty na znak) - dla miedzynarodowych danych\n-- VARCHAR - ASCII (1 bajt na znak) - dla danych tylko angielskich\n-- W SQL Server zawsze uzywaj NVARCHAR dla tekstow uzytkownika!\n\n-- Typy danych SQL Server vs PostgreSQL\n-- SQL Server DATETIME2 (precyzja) vs PostgreSQL TIMESTAMP\n-- SQL Server BIT (0/1) vs PostgreSQL BOOLEAN (true/false)\n-- SQL Server UNIQUEIDENTIFIER vs PostgreSQL UUID\n```'
            },
            {
              blockType: 'text',
              content: '**Zapytania zaawansowane - GROUP BY, HAVING, subqueries**\n\n```sql\n-- GROUP BY + HAVING (HAVING filtruje grupy, WHERE filtruje wiersze)\nSELECT\n    Department,\n    COUNT(*) AS EmployeeCount,\n    AVG(Salary) AS AvgSalary,\n    MAX(Salary) AS MaxSalary\nFROM Employees\nWHERE IsActive = 1                  -- filtruj PRZED grupowaniem\nGROUP BY Department\nHAVING COUNT(*) > 5                 -- filtruj grupy (min 6 pracownikow)\nORDER BY AvgSalary DESC;\n\n-- Subquery w WHERE\nSELECT Name, Salary\nFROM Employees\nWHERE Salary > (\n    SELECT AVG(Salary) FROM Employees  -- subquery\n);\n\n-- Subquery w FROM (derived table)\nSELECT d.Department, d.AvgSalary\nFROM (\n    SELECT Department, AVG(Salary) AS AvgSalary\n    FROM Employees\n    GROUP BY Department\n) AS d\nWHERE d.AvgSalary > 70000;\n\n-- EXISTS - efektywniejszy niz IN dla duzych zbiorow\nSELECT Name FROM Customers c\nWHERE EXISTS (\n    SELECT 1 FROM Orders o WHERE o.CustomerId = c.CustomerId\n); -- tylko klienci ktorzy zlozyli przynajmniej 1 zamowienie\n```'
            },
            {
              blockType: 'text',
              content: '**Window Functions (Funkcje okna)** - potezne funkcje do analityki, dostepne w SQL Server:\n\n```sql\n-- ROW_NUMBER, RANK, DENSE_RANK\nSELECT\n    Name,\n    Department,\n    Salary,\n    ROW_NUMBER() OVER (PARTITION BY Department ORDER BY Salary DESC) AS RankInDept,\n    -- ROW_NUMBER: 1,2,3,4,5 (bez powtozen)\n    RANK() OVER (ORDER BY Salary DESC) AS OverallRank,\n    -- RANK: 1,2,2,4 (pomija numer po powtorzeniach)\n    DENSE_RANK() OVER (ORDER BY Salary DESC) AS DenseRank\n    -- DENSE_RANK: 1,2,2,3 (nie pomija numerow)\nFROM Employees;\n\n-- LAG i LEAD - dostep do poprzedniego/nastepnego wiersza\nSELECT\n    OrderDate,\n    Total,\n    LAG(Total) OVER (ORDER BY OrderDate) AS PreviousTotal,\n    Total - LAG(Total) OVER (ORDER BY OrderDate) AS Change\nFROM Orders;\n\n-- Running total (suma biezaca)\nSELECT\n    OrderDate,\n    Total,\n    SUM(Total) OVER (ORDER BY OrderDate ROWS UNBOUNDED PRECEDING) AS RunningTotal\nFROM Orders;\n\n-- Top N per group (np. top 3 produkty w kazdej kategorii)\nSELECT * FROM (\n    SELECT Name, Category, Price,\n           ROW_NUMBER() OVER (PARTITION BY Category ORDER BY Price DESC) AS rn\n    FROM Products\n) AS ranked\nWHERE rn <= 3;\n```'
            },
            {
              blockType: 'text',
              content: '**Common Table Expressions (CTE) - WITH clause**\n\n```sql\n-- CTE - nazwane podrzendne zapytanie, czytelniejsze niz subquery\nWITH HighValueCustomers AS (\n    SELECT CustomerId, SUM(Total) AS TotalSpent\n    FROM Orders\n    GROUP BY CustomerId\n    HAVING SUM(Total) > 10000\n),\nCustomerDetails AS (\n    SELECT c.Name, c.Email, hvc.TotalSpent\n    FROM Customers c\n    JOIN HighValueCustomers hvc ON c.CustomerId = hvc.CustomerId\n)\nSELECT * FROM CustomerDetails ORDER BY TotalSpent DESC;\n\n-- Recursive CTE - dla danych hierarchicznych (org chart, kategorie)\nWITH OrgChart AS (\n    -- Anchor (punkt startowy)\n    SELECT EmployeeId, Name, ManagerId, 0 AS Level\n    FROM Employees\n    WHERE ManagerId IS NULL  -- CEO (brak managera)\n\n    UNION ALL\n\n    -- Rekurencja\n    SELECT e.EmployeeId, e.Name, e.ManagerId, oc.Level + 1\n    FROM Employees e\n    JOIN OrgChart oc ON e.ManagerId = oc.EmployeeId\n)\nSELECT Name, Level FROM OrgChart ORDER BY Level, Name;\n```'
            },
            {
              blockType: 'callout',
              variant: 'warning',
              title: 'SELECT * to antywzorzec w produkcji',
              content: 'SELECT * w produkcyjnym kodzie to zly nawyk: pobiera kolumny ktore nie sa potrzebne (marnowanie sieci i pamieci), utrudnia optymalizacje przez query optimizer, moze zwrocic niespodziewane kolumny po zmianie schematu, i uniemozliwia covering index optimization. Zawsze wymieniaj konkretne kolumny: SELECT OrderId, Total, OrderDate FROM Orders. To pokazuje professionalizm na rozmowie.'
            },
            {
              blockType: 'table',
              caption: 'SQL Server vs PostgreSQL vs MySQL - kluczowe roznice skladniowe',
              hasHeaders: true,
              headers: ['Funkcjonalnosc', 'SQL Server (T-SQL)', 'PostgreSQL', 'MySQL'],
              rows: [
                ['Limit wierszy', 'SELECT TOP 10', 'SELECT ... LIMIT 10', 'SELECT ... LIMIT 10'],
                ['Auto-increment', 'IDENTITY(1,1)', 'SERIAL / GENERATED', 'AUTO_INCREMENT'],
                ['Aktualna data', 'GETDATE()', 'NOW() / CURRENT_TIMESTAMP', 'NOW()'],
                ['Dlugosc stringa', 'LEN()', 'LENGTH()', 'LENGTH()'],
                ['If-null', 'ISNULL() / COALESCE()', 'COALESCE()', 'IFNULL() / COALESCE()'],
                ['Unicode string', 'NVARCHAR', 'VARCHAR (UTF8 domyslnie)', 'NVARCHAR / VARCHAR'],
                ['Identyfikatory', '[nazwa ze spacją]', '"nazwa ze spacją"', '`nazwa ze spacją`'],
                ['If-else w SQL', 'IIF() lub CASE WHEN', 'CASE WHEN', 'IF() lub CASE WHEN']
              ]
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Chcesz pobrac 10 najnowszych zamowien z tabeli Orders (kolumna: OrderDate). Ktora skladnia jest poprawna dla SQL Server?',
              tagSlugs: ['sql-server', 'sql', 'intermediate'],
              choices: [
                'SELECT * FROM Orders ORDER BY OrderDate DESC LIMIT 10',
                'SELECT TOP 10 * FROM Orders ORDER BY OrderDate DESC',
                'SELECT * FROM Orders WHERE ROWNUM <= 10 ORDER BY OrderDate DESC',
                'SELECT FIRST 10 * FROM Orders ORDER BY OrderDate DESC'
              ],
              correctAnswer: 'SELECT TOP 10 * FROM Orders ORDER BY OrderDate DESC',
              solution: 'SQL Server uzywa TOP do ograniczania liczby wierszy, nie LIMIT (PostgreSQL/MySQL). ROWNUM to Oracle. FIRST nie istnieje jako standardowy odpowiednik. Wazne: TOP powinien byc uzywany z ORDER BY gdy chcemy "top N" w sensie sorted - bez ORDER BY wyniki sa niedetermistyczne. Poprawna kolejnosc: SELECT TOP N ... FROM ... WHERE ... ORDER BY ...',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'Jaka jest roznica miedzy WHERE a HAVING w SQL?',
              tagSlugs: ['sql-server', 'sql', 'intermediate'],
              choices: [
                'Nie ma roznicy - mozna ich uzywac zamiennie',
                'WHERE filtruje wiersze przed grupowaniem, HAVING filtruje grupy po GROUP BY',
                'HAVING filtruje wiersze przed grupowaniem, WHERE filtruje po GROUP BY',
                'WHERE dziala tylko na VARCHAR kolumny, HAVING na numeryczne'
              ],
              correctAnswer: 'WHERE filtruje wiersze przed grupowaniem, HAVING filtruje grupy po GROUP BY',
              solution: 'WHERE wykonuje sie PRZED GROUP BY - wyklucza wiersze ktore nie spelniaja warunku zanim zostan zgrupowane. HAVING wykonuje sie PO GROUP BY - filtruje grupy na podstawie wynikow agregacji (COUNT, SUM, AVG). Przyklad: WHERE IsActive = 1 usuwa nieaktywnych pracownikow przed liczeniem. HAVING COUNT(*) > 5 usuwa dzialy z mniej niz 6 pracownikami. Uzycie WHERE zamiast HAVING lub odwrotnie jest czestym bledem.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'NVARCHAR i VARCHAR w SQL Server przechowuja dane w ten sam sposob i mozna ich uzywac zamiennie.',
              tagSlugs: ['sql-server', 'sql', 'intermediate'],
              correctAnswer: 'false',
              solution: 'Falsz. NVARCHAR (National Variable Character) przechowuje unicode i uzywa 2 bajtow na znak - obsluguje wszystkie jezyki swiata (chinskie, arabskie, polskie znaki). VARCHAR przechowuje dane w stronie kodowej serwera (zwykle 1 bajt na znak) - moze nie obsluzyc wszystkich znakow miedzynarodowych. W aplikacjach wielojezycznych (lub gdy uzytkownik moze wprowadzac dowolne znaki) ZAWSZE uzywaj NVARCHAR. VARCHAR jest szybszy i zajmuje mniej miejsca dla danych wylacznie ASCII.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Napisz zapytanie SQL Server ktore zwroci nazwe dzialu i srednia pensje, ale tylko dla dzialow gdzie srednia pensja jest wieksza niz ogolna srednia pensja wszystkich pracownikow. Uzyj CTE aby wyliczyc ogolna srednia.',
              tagSlugs: ['sql-server', 'sql', 'intermediate'],
              solution: 'WITH OverallAvg AS (SELECT AVG(Salary) AS AvgSalary FROM Employees), DeptAvg AS (SELECT Department, AVG(Salary) AS DeptAvgSalary FROM Employees GROUP BY Department) SELECT d.Department, d.DeptAvgSalary FROM DeptAvg d CROSS JOIN OverallAvg o WHERE d.DeptAvgSalary > o.AvgSalary ORDER BY d.DeptAvgSalary DESC. Alternatywnie bez CTE: SELECT Department, AVG(Salary) AS DeptAvg FROM Employees GROUP BY Department HAVING AVG(Salary) > (SELECT AVG(Salary) FROM Employees) ORDER BY DeptAvg DESC. Wersja z CTE jest czytelniejsza i unika powtarzania subquery.',
              points: 3,
              isPublished: false
            }
          ]
        },

        // ── LESSON 4.2 ──────────────────────────
        {
          title: 'Lesson 4.2: Indeksy, Query Optimization i Execution Plans',
          order: 2,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Rozumienie indeksow to roznica miedzy kodem ktory "dziala" a kodem ktory "dziala szybko". W systemach takich jak Relativity, ktore przetwarzaja miliony dokumentow prawniczych, zle zaprojektowane indeksy moga sprawic ze zapytanie trwa minuty zamiast milisekund. Ta lekcja daje Ci narzedzia do diagnozy i optymalizacji zapytan SQL - wiedze ktora jest ceniona przez kazdy team inzynierski.'
            },
            {
              blockType: 'text',
              content: '**Co to jest indeks i jak dziala?**\n\nIndeks to osobna struktura danych (B-tree, hash) ktora SQL Server utrzymuje obok tabeli, pozwalajac na szybkie wyszukiwanie bez skanowania wszystkich wierszy.\n\nBez indeksu: `SELECT * FROM Orders WHERE CustomerId = 123` - SQL Server musi przejrzec KAZDY wiersz tabeli (Table Scan) - O(n).\n\nZ indeksem na CustomerId: SQL Server przeszukuje B-tree i bezposrednio przechodzi do pasujacych wierszy - O(log n).\n\n```sql\n-- Tworzenie indeksu\nCREATE INDEX IX_Orders_CustomerId\nON Orders (CustomerId);              -- zwykly indeks\n\n-- Indeks zlozony (composite) - kolejnosc ma znaczenie!\nCREATE INDEX IX_Orders_Customer_Date\nON Orders (CustomerId, OrderDate);   -- efektywny dla WHERE CustomerId = ? AND OrderDate > ?\n                                     -- NIE efektywny dla samego WHERE OrderDate > ?\n\n-- Unique indeks - jak UNIQUE constraint\nCREATE UNIQUE INDEX IX_Users_Email\nON Users (Email);\n\n-- Usuwanie indeksu\nDROP INDEX IX_Orders_CustomerId ON Orders;\n```'
            },
            {
              blockType: 'text',
              content: '**Clustered vs Non-Clustered Index** - kluczowa roznica w SQL Server:\n\n**Clustered Index** - determinuje fizyczny porzadek danych w tabeli. Dane SA indeksem. Kazda tabela moze miec tylko jeden. Domyslnie tworzony na PRIMARY KEY.\n\n**Non-Clustered Index** - osobna struktura z pointerami do wierszy. Tabela moze ich miec wiele (max 999 w SQL Server).\n\n```sql\n-- PRIMARY KEY automatycznie tworzy CLUSTERED INDEX\nCREATE TABLE Orders (\n    OrderId INT PRIMARY KEY,  -- tutaj: CLUSTERED INDEX na OrderId\n    CustomerId INT,\n    OrderDate DATETIME2,\n    Total DECIMAL(10,2)\n);\n\n-- Mozna tez jawnie:\nCREATE CLUSTERED INDEX CX_Orders_OrderId ON Orders(OrderId);\n\n-- NON-CLUSTERED (domyslne dla CREATE INDEX bez CLUSTERED)\nCREATE NONCLUSTERED INDEX IX_Orders_CustomerId ON Orders(CustomerId);\n\n-- Covering Index - zawiera wszystkie potrzebne kolumny (unika lookupow!)\nCREATE INDEX IX_Orders_Customer_Covering\nON Orders (CustomerId)          -- kolumna wyszukiwania\nINCLUDE (OrderDate, Total);     -- kolumny "zawarte" - nie w B-tree, ale w leaf node\n-- Zapytanie: SELECT OrderDate, Total FROM Orders WHERE CustomerId = 5\n-- Jest w calosci obsluzone przez ten indeks - zero lookupow do tabeli!\n```'
            },
            {
              blockType: 'text',
              content: '**Execution Plan - jak czytac i rozumiec**\n\nExecution Plan to plan ktory SQL Server Query Optimizer wybiera do wykonania zapytania. To najcenniejsze narzedzie do diagnozy powolnych zapytan.\n\n```sql\n-- Wlacz Execution Plan w SQL Server Management Studio: Ctrl+M\n-- Lub w zapytaniu:\nSET SHOWPLAN_XML ON; -- lub\nSET STATISTICS IO ON;\nSET STATISTICS TIME ON;\n\n-- Uruchom zapytanie - zobaczysz plan\nSELECT o.OrderId, c.Name, o.Total\nFROM Orders o\nJOIN Customers c ON o.CustomerId = c.CustomerId\nWHERE o.Total > 1000;\n```\n\n**Co szukac w Execution Plan:**\n\n- **Table Scan** - brak indeksu lub optimizer woli scan (czesto problem dla malych tabel)\n- **Index Seek** - DOBRY - uzywa indeksu efektywnie (B-tree search)\n- **Key Lookup** - zly - SQL musi chodzic do tabeli po dodatkowe kolumny (rozwazen covering index)\n- **Hash Match / Sort** - kosztowne operacje - mozna uniknac odpowiednim indeksem\n- **Estimated vs Actual Rows** - duza roznica = nieaktualne statystyki (UPDATE STATISTICS)'
            },
            {
              blockType: 'text',
              content: '**Popularne przyczyny powolnych zapytan i jak je naprawic**\n\n```sql\n-- 1. Funkcja na kolumnie w WHERE - uniemozliwia uzycie indeksu!\nSELECT * FROM Orders WHERE YEAR(OrderDate) = 2024;  -- ZLE (non-sargable)\n-- Naprawa:\nSELECT * FROM Orders\nWHERE OrderDate >= \'2024-01-01\' AND OrderDate < \'2025-01-01\'; -- DOBRZE\n\n-- 2. Leading wildcard w LIKE - nie uzywa indeksu!\nSELECT * FROM Customers WHERE Name LIKE \'%Smith\';  -- ZLE (poszukuje % na poczatku)\nSELECT * FROM Customers WHERE Name LIKE \'Smith%\';  -- DOBRZE (prefix search - uzywa indeksu)\n\n-- 3. Implicit conversion - SQL musi konwertowac typy\nSELECT * FROM Orders WHERE CustomerId = \'123\';  -- ZLE jesli CustomerId to INT!\n-- SQL musi konwertowac VARCHAR do INT lub odwrotnie, blokuje indeks\nSELECT * FROM Orders WHERE CustomerId = 123;    -- DOBRZE\n\n-- 4. OR miedzy rozrymi kolumnami - czesto nie uzywa indeksow\nSELECT * FROM Customers WHERE FirstName = \'Alice\' OR LastName = \'Alice\';\n-- Rozwazen: UNION ALL zamiast OR\nSELECT * FROM Customers WHERE FirstName = \'Alice\'\nUNION ALL\nSELECT * FROM Customers WHERE LastName = \'Alice\' AND FirstName != \'Alice\';\n\n-- 5. SELECT * - pobiera niepotrzebne kolumny, uniemozliwia covering index\nSELECT * FROM Orders WHERE CustomerId = 123; -- ZLE\nSELECT OrderId, Total, OrderDate FROM Orders WHERE CustomerId = 123; -- DOBRZE\n```'
            },
            {
              blockType: 'text',
              content: '**Statystyki i fragmentacja**\n\nSQL Server Query Optimizer podejmuje decyzje na podstawie **statystyk** - informacji o rozkladzie danych. Nieaktualne statystyki = zly plan.\n\n```sql\n-- Sprawdzenie statystyk\nDBCC SHOW_STATISTICS (\'Orders\', \'IX_Orders_CustomerId\');\n\n-- Aktualizacja statystyk (zwykle automatyczna, ale mozna recznie)\nUPDATE STATISTICS Orders;\nUPDATE STATISTICS Orders IX_Orders_CustomerId; -- tylko konkretny indeks\n\n-- Fragmentacja indeksu - po wielu INSERT/UPDATE/DELETE indeks sie fragmentuje\n-- Sprawdzenie fragmentacji\nSELECT\n    index_type_desc,\n    avg_fragmentation_in_percent,\n    page_count\nFROM sys.dm_db_index_physical_stats(DB_ID(), OBJECT_ID(\'Orders\'), NULL, NULL, \'LIMITED\');\n\n-- Naprawa:\n-- < 10% fragmentacji: OK, nic nie rob\n-- 10-30%: REORGANIZE (online, wolniejszy)\nALTER INDEX IX_Orders_CustomerId ON Orders REORGANIZE;\n-- > 30%: REBUILD (szybszy, ale blokuje tabele lub mozna ONLINE)\nALTER INDEX IX_Orders_CustomerId ON Orders REBUILD;\n```'
            },
            {
              blockType: 'callout',
              variant: 'tip',
              title: 'Zlota zasada indeksowania',
              content: 'Indeksy przyspieszaja SELECTy ale spowalniaja INSERT/UPDATE/DELETE (bo SQL musi aktualizowac indeks). Nie dodawaj indeksow na oselep - analizuj zapytania i dodawaj tam gdzie naprawde potrzeba. Zasada: indeksuj kolumny ktore czesto pojawiaja sie w WHERE, JOIN, ORDER BY. Unikaj indeksowania kolumn o malej kardynalnosci (np. kolumna Gender z 2 wartosciami - indeks czesto nie pomoze).'
            },
            {
              blockType: 'text',
              content: '[IMAGE_PLACEHOLDER: Diagram indeksowania SQL Server. Po lewej: Table bez indeksu - zapytanie powoduje Table Scan (przejscie przez wszystkie wiersze, O(n)). Po prawej: Table z Non-Clustered Index - B-tree struktura z kluczem indeksu, leaf nodes wskazuja na wiersze tabeli (RID lub Clustered Key), Index Seek O(log n). Na dole: porownanie Clustered Index (dane SA posortowane fizycznie) vs Non-Clustered (osobna struktura z pointerami). Covering Index: leaf node zawiera dodatkowe kolumny INCLUDE - zero lookup do tabeli. Kolorowy, edukacyjny diagram z etykietami.]'
            },
            {
              blockType: 'table',
              caption: 'Kiedy uzywac jakich indeksow',
              hasHeaders: true,
              headers: ['Scenariusz', 'Rozwiazanie', 'Dlaczego'],
              rows: [
                ['Szukasz po kluczu obcym', 'Non-Clustered na FK kolumnie', 'JOIN i WHERE po FK beda szybkie'],
                ['Zapytanie pobiera duzo kolumn', 'Covering Index z INCLUDE', 'Eliminuje Key Lookup'],
                ['Sortowanie po kolumnie', 'Indeks na kolumnie ORDER BY', 'Eliminuje sortowanie w pamieci'],
                ['Wielka kardynalnosc (ID, email)', 'Jeden indeks na tej kolumnie', 'Duza selektywnosc = skuteczny'],
                ['Mala kardynalnosc (status, boolean)', 'Rozwazen indeks filtrowany', 'Filtrowany index tylko dla aktywnych'],
                ['Czeste INSERT/UPDATE', 'Minmalizuj liczbe indeksow', 'Kazdy indeks spowalnia zapis']
              ]
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Dlaczego zapytanie WHERE YEAR(OrderDate) = 2024 jest wolniejsze niz WHERE OrderDate >= \'2024-01-01\' AND OrderDate < \'2025-01-01\'?',
              tagSlugs: ['sql-server', 'sql', 'performance', 'intermediate'],
              choices: [
                'Nie ma roznicy - oba zapytania beda tak samo szybkie',
                'YEAR() to funkcja serwerowa ktora wymaga wiecej CPU',
                'Funkcja YEAR() na kolumnie uniemozliwia uzycie indeksu na OrderDate (non-sargable), wymuszajac Table Scan',
                'Drugie zapytanie jest bledne - nie mozna uzywac porownania dat w taki sposob'
              ],
              correctAnswer: 'Funkcja YEAR() na kolumnie uniemozliwia uzycie indeksu na OrderDate (non-sargable), wymuszajac Table Scan',
              solution: 'Zapytanie jest "non-sargable" gdy SQL Server nie moze uzyc indeksu ze wzgledu na transformacje kolumny. YEAR(OrderDate) oblicza funkcje dla KAZDEGO wiersza, co uniemozliwia index seek. Drugie zapytanie uzywa surowej kolumny OrderDate w porownaniu - SQL Server moze wykonac Index Seek (Binary Search w B-tree). To klasyczna optymalizacja - zawsze preferuj surowe kolumny w WHERE.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'Czym rozni sie Clustered Index od Non-Clustered Index w SQL Server?',
              tagSlugs: ['sql-server', 'indexing', 'intermediate'],
              choices: [
                'Clustered jest szybszy bo jest tworzony automatycznie',
                'Clustered determinuje fizyczny porzadek danych w tabeli (max 1 per tabela), Non-Clustered to osobna struktura z pointerami (max 999)',
                'Non-Clustered obejmuje wszystkie kolumny, Clustered tylko klucz',
                'Nie ma roznicy w wydajnosci, roznia sie tylko sposobem tworzenia'
              ],
              correctAnswer: 'Clustered determinuje fizyczny porzadek danych w tabeli (max 1 per tabela), Non-Clustered to osobna struktura z pointerami (max 999)',
              solution: 'Clustered Index to "indeks ktory Jest tabelą" - dane sa fizycznie posortowane wedlug klucza clustered (zwykle PRIMARY KEY). Kazda tabela ma max 1 clustered index. Non-Clustered Index to osobna struktura B-tree z kluczem indeksu i pointerem do wiersza w tabeli (RID lub klucz clustered). Tabela moze miec do 999 non-clustered indexow (praktycznie duzo mniej). Key Lookup to koszt gdy non-clustered index nie zawiera wszystkich potrzebnych kolumn i musi pobiec do tabeli.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'Dodanie wielu indeksow do tabeli zawsze poprawia wydajnosc zarowno zapytan SELECT jak i INSERT/UPDATE/DELETE.',
              tagSlugs: ['sql-server', 'indexing', 'performance', 'intermediate'],
              correctAnswer: 'false',
              solution: 'Falsz. Indeksy poprawiaja wydajnosc SELECTow ale pogarszaja wydajnosc zapytan modyfikujacych dane (INSERT, UPDATE, DELETE). Przy kazdej modyfikacji SQL Server musi zaktualizowac wszystkie indeksy na tabeli. Tabela z 10 indeksami bedzie miala 10-krotnie wiecej pracy przy INSERT niz bez indeksow. Wazna jest balans - indeksuj kolumny ktore sa czesto uzywane w WHERE/JOIN, ale nie naduzywaj. Analizuj pattern zapytan zanim dodasz indeks.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Powolne zapytanie: SELECT * FROM Documents WHERE UPPER(Title) = \'CONTRACT\'. Podaj dwa powody dlaczego jest wolne i jak je zoptymalizowac.',
              tagSlugs: ['sql-server', 'performance', 'indexing', 'intermediate'],
              solution: 'Dwa problemy: 1) UPPER(Title) to funkcja na kolumnie - non-sargable, uniemozliwia uzycie indeksu na Title. SQL musi wykonac Table Scan i przetworzyc UPPER() dla kazdego wiersza. 2) SELECT * pobiera wszystkie kolumny - nieefektywne i uniemozliwia covering index. Optymalizacja: a) Przechowuj dane juz w uppercase (np. uppercase przy INSERT) lub uzyj COLLATE case-insensitive: ALTER TABLE Documents ALTER COLUMN Title NVARCHAR(500) COLLATE Latin1_General_CI_AS; wtedy WHERE Title = "contract" bedzie dzialac case-insensitive z indeksem. b) Lub: WHERE Title = UPPER(\'contract\') - funkcja na stronie parametru nie blokuje indeksu! c) Wymien SELECT * na konkretne kolumny i stworz covering index. d) Rozwazen indeks filtrowany lub computed column na UPPER(Title) z indeksem na nim.',
              points: 3,
              isPublished: false
            }
          ]
        },

        // ── LESSON 4.3 ──────────────────────────
        {
          title: 'Lesson 4.3: Transakcje, Izolacja i Stored Procedures',
          order: 3,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Transakcje to jeden z fundamentow relacyjnych baz danych. W systemie Relativity gdzie dane prawnicze musza byc spójne i niepodzielne - transakcje sa krytyczne. Ta lekcja omawia ACID, poziomy izolacji (czesto pytane na senior-level rozmowach), i Stored Procedures ktore sa czesto uzywane w .NET projektach korporacyjnych.'
            },
            {
              blockType: 'text',
              content: '**ACID - Wlasciwosci Transakcji**\n\n**A - Atomicity (Atomowosc)**: Transakcja jest niepodzielna - albo wszystkie operacje sie udaja, albo zadna. Nie ma stanu "po czesci". Przyklad: przelew bankowy - odejmij z konta A I dodaj do konta B musi byc atomowe.\n\n**C - Consistency (Spojnosc)**: Transakcja przenosi baze z jednego spojnego stanu do drugiego. Wszystkie reguly biznesowe (constrainty, triggery) sa zachowane.\n\n**I - Isolation (Izolacja)**: Rownolegle transakcje nie widza nawzajem swoich niepoprawionych zmian. Stopien izolacji jest konfigurowalny.\n\n**D - Durability (Trwalosc)**: Po zatwierdzeniu (COMMIT) transakcji, dane sa trwale zapisane - nawet po awarii systemu (dzieki Write-Ahead Log).'
            },
            {
              blockType: 'text',
              content: '**Transakcje w T-SQL**\n\n```sql\n-- Podstawowa transakcja\nBEGIN TRANSACTION;\n    UPDATE Accounts SET Balance = Balance - 1000 WHERE AccountId = 1;\n    UPDATE Accounts SET Balance = Balance + 1000 WHERE AccountId = 2;\n    -- Jesli tu jest blad, oba UPDATE zostana cofniete!\nCOMMIT TRANSACTION; -- zatwierdz\n\n-- Z obsluga bledow\nBEGIN TRANSACTION;\nBEGIN TRY\n    UPDATE Accounts SET Balance = Balance - 1000 WHERE AccountId = 1;\n    -- Walidacja\n    IF (SELECT Balance FROM Accounts WHERE AccountId = 1) < 0\n        THROW 50001, \'Insufficient funds\', 1;\n\n    UPDATE Accounts SET Balance = Balance + 1000 WHERE AccountId = 2;\n    COMMIT TRANSACTION;\nEND TRY\nBEGIN CATCH\n    ROLLBACK TRANSACTION; -- cofnij wszystkie zmiany!\n    THROW; -- re-throw wyjatek\nEND CATCH;\n\n-- Savepoints - czesciowe wycofanie\nBEGIN TRANSACTION;\n    INSERT INTO Orders (CustomerId) VALUES (123);\n    SAVE TRANSACTION AfterInsert; -- punkt zapisu\n\n    INSERT INTO OrderItems (OrderId, ProductId) VALUES (SCOPE_IDENTITY(), 456);\n    -- Cos poszlo nie tak z itemem, cofnij tylko do savepoint:\n    ROLLBACK TRANSACTION AfterInsert;\n    -- Ale zamowienie (Orders) nadal istnieje!\nCOMMIT TRANSACTION;\n```'
            },
            {
              blockType: 'text',
              content: '**Poziomy Izolacji (Isolation Levels)** - konfiguruje jak transakcje widza nawzajem swoje dane:\n\n**READ UNCOMMITTED** - najnizszy poziom. Widzi "brudne odczyty" (dirty reads) - dane innych transakcji ktore jeszcze nie zostaly zatwierdzone. Szybki ale niebezpieczny.\n\n**READ COMMITTED** - domyslny w SQL Server. Widzi tylko zatwierdzone dane. Mozliwe "non-repeatable reads" - dane moga sie zmienic miedzy odczytami w tej samej transakcji.\n\n**REPEATABLE READ** - gwarantuje ze te same wiersze odczytane dwukrotnie beda identyczne. Blokuje odczytane wiersze. Mozliwe "phantom reads" - nowe wiersze moga sie pojawic.\n\n**SERIALIZABLE** - najwyzszy poziom. Transakcje sa izolowane jak by byly sekwencyjne. Blokuje zakresy. Najwolniejszy.\n\n**SNAPSHOT** - specyficzne dla SQL Server. Uzywa wersjonowania wierszy (row versioning) zamiast blokad. Readers nie blokuja Writers - wysokie wspolbieznosci bez blokad.\n\n```sql\n-- Ustawienie poziomu izolacji\nSET TRANSACTION ISOLATION LEVEL READ COMMITTED; -- domyslny\nSET TRANSACTION ISOLATION LEVEL SNAPSHOT;       -- bez blokad!\nSET TRANSACTION ISOLATION LEVEL SERIALIZABLE;   -- najwyzszy\n\n-- Lub per-zapytanie (hint)\nSELECT * FROM Orders WITH (NOLOCK); -- jak READ UNCOMMITTED - brudne odczyty!\nSELECT * FROM Orders WITH (UPDLOCK); -- blokada do aktualizacji\n```'
            },
            {
              blockType: 'text',
              content: '**Stored Procedures** - precompilowane procedury SQL przechowywane w bazie:\n\n```sql\n-- Tworzenie Stored Procedure\nCREATE PROCEDURE GetOrdersByCustomer\n    @CustomerId INT,\n    @FromDate DATETIME2 = NULL,  -- opcjonalny parametr z domyslna wartoscia\n    @MaxResults INT = 100\nAS\nBEGIN\n    SET NOCOUNT ON; -- nie zwracaj liczby wierszy (wydajnosc)\n\n    SELECT TOP (@MaxResults)\n        o.OrderId,\n        o.Total,\n        o.OrderDate,\n        c.Name AS CustomerName\n    FROM Orders o\n    JOIN Customers c ON o.CustomerId = c.CustomerId\n    WHERE o.CustomerId = @CustomerId\n        AND (@FromDate IS NULL OR o.OrderDate >= @FromDate)\n    ORDER BY o.OrderDate DESC;\nEND;\n\n-- Wywolanie\nEXEC GetOrdersByCustomer @CustomerId = 123;\nEXEC GetOrdersByCustomer @CustomerId = 123, @FromDate = \'2024-01-01\';\nEXEC GetOrdersByCustomer 123, \'2024-01-01\', 10;\n\n-- SP z OUTPUT parametrem\nCREATE PROCEDURE CreateOrder\n    @CustomerId INT,\n    @Total DECIMAL(10,2),\n    @NewOrderId INT OUTPUT  -- wynikowy parametr\nAS\nBEGIN\n    INSERT INTO Orders (CustomerId, Total, OrderDate)\n    VALUES (@CustomerId, @Total, GETDATE());\n\n    SET @NewOrderId = SCOPE_IDENTITY(); -- ID ostatnio wstawionego wiersza\nEND;\n\n-- Wywolanie z OUTPUT\nDECLARE @Id INT;\nEXEC CreateOrder @CustomerId = 123, @Total = 500.00, @NewOrderId = @Id OUTPUT;\nSELECT @Id AS NewOrderId;\n```'
            },
            {
              blockType: 'text',
              content: '**Deadlocks w SQL Server** - dwa procesy czekaja na siebie nawzajem:\n\n```sql\n-- Scenariusz deadlock\n-- Transakcja 1:\nBEGIN TRAN;\nUPDATE Orders SET Status = \'Processing\' WHERE OrderId = 1; -- lock na OrderId 1\n-- czeka na dostep do Customers...\n\n-- Transakcja 2 (rownolegle):\nBEGIN TRAN;\nUPDATE Customers SET LastOrderDate = GETDATE() WHERE CustomerId = 5; -- lock na CustomerId 5\n-- czeka na dostep do Orders...\n\n-- DEADLOCK! SQL Server automatycznie wybiera "ofiare" (victim) i robi ROLLBACK\n-- Victim dostaje error 1205\n\n-- Zapobieganie deadlockom:\n-- 1. Dostep do tabel zawsze w tej samej kolejnosci\n-- 2. Krotkie transakcje - im krotsza transakcja, mniej czasu na deadlock\n-- 3. SNAPSHOT isolation - readers nie blokuja writers\n-- 4. Indeksy - mniej blokad przy efektywnym dostepe\n-- 5. SET DEADLOCK_PRIORITY - mozna ustawic ktora transakcja jest ofiara\n```'
            },
            {
              blockType: 'callout',
              variant: 'warning',
              title: 'WITH (NOLOCK) - nie uzywaj bez zastanowienia',
              content: 'WITH (NOLOCK) lub READ UNCOMMITTED jest czesto uzywany "dla wydajnosci" ale moze dawac brudne odczyty - widzisz dane ktore nigdy nie zostana zatwierdzone (transakcja zostanie cofnieta). Dla raportow gdzie 100% precyzja nie jest wymagana - moze byc OK. Dla danych finansowych, prawniczych (jak w Relativity!) lub gdykolwiek decyzje biznesowe sa podejmowane na podstawie danych - NIGDY nie uzywaj NOLOCK. Lepszym rozwiazaniem dla wydajnosci jest SNAPSHOT isolation.'
            },
            {
              blockType: 'table',
              caption: 'Poziomy izolacji - problemy i wydajnosc',
              hasHeaders: true,
              headers: ['Poziom', 'Dirty Read', 'Non-Repeatable Read', 'Phantom Read', 'Wydajnosc'],
              rows: [
                ['READ UNCOMMITTED', 'Mozliwy', 'Mozliwy', 'Mozliwy', 'Najlepsza'],
                ['READ COMMITTED (domyslny)', 'Niemozliwy', 'Mozliwy', 'Mozliwy', 'Dobra'],
                ['REPEATABLE READ', 'Niemozliwy', 'Niemozliwy', 'Mozliwy', 'Srednia'],
                ['SERIALIZABLE', 'Niemozliwy', 'Niemozliwy', 'Niemozliwy', 'Najgorsza'],
                ['SNAPSHOT (SQL Server)', 'Niemozliwy', 'Niemozliwy', 'Niemozliwy*', 'Dobra (bez blokad)']
              ]
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Co to jest "Dirty Read" i przy jakim poziomie izolacji moze wystapic?',
              tagSlugs: ['sql-server', 'transactions', 'intermediate'],
              choices: [
                'Odczyt niekompletnych danych z powodu bledu sieciowego, moze wystapic przy kazdym poziomie',
                'Odczyt danych zmienionej przez inna transakcje ktora jeszcze nie zostala zatwierdzona (nie-commited), mozliwy przy READ UNCOMMITTED',
                'Odczyt zduplikowanych wierszy, mozliwy przy READ COMMITTED',
                'Odczyt starych (cache-owanych) danych, mozliwy przy SNAPSHOT isolation'
              ],
              correctAnswer: 'Odczyt danych zmienionej przez inna transakcje ktora jeszcze nie zostala zatwierdzona (nie-commited), mozliwy przy READ UNCOMMITTED',
              solution: 'Dirty Read (brudny odczyt) - transakcja T1 czyta dane zmienione przez transakcje T2, ktora jeszcze nie zostala zatwierdzona (COMMIT). Jesli T2 zrobi ROLLBACK, T1 czytala dane ktore nigdy nie istnially. Mozliwy tylko przy READ UNCOMMITTED (lub WITH NOLOCK). Wszystkie wyzsze poziomy izolacji (READ COMMITTED i powyzej) eliminuja dirty reads.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'SCOPE_IDENTITY() w SQL Server zwraca ostatnie auto-generated ID z dowolnej tabeli w bazie danych.',
              tagSlugs: ['sql-server', 'sql', 'intermediate'],
              correctAnswer: 'false',
              solution: 'Falsz. SCOPE_IDENTITY() zwraca ostatnio wygenerowane ID przez IDENTITY w biezacym scope (aktualnej procedurze lub batchu) i biezacej sesji. Jest bezpieczny w srodowiskach wielowatkowych. @@IDENTITY (starsza funkcja) zwraca ostatnio wygenerowane ID w biezacej sesji - ale moze byc mylace gdy trigger wstawia wiersz do innej tabeli. IDENT_CURRENT(\'tablename\') zwraca ostatnie ID dla konkretnej tabeli w dowolnej sesji. Zawsze uzywaj SCOPE_IDENTITY() zamiast @@IDENTITY.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'Jaka jest glowna zaleta SNAPSHOT isolation w SQL Server wobec SERIALIZABLE?',
              tagSlugs: ['sql-server', 'transactions', 'performance', 'intermediate'],
              choices: [
                'SNAPSHOT jest szybszy bo nie sprawdza spojnosci danych',
                'SNAPSHOT uzywa wersjonowania wierszy - readers nie blokuja writers, eliminujac wiele zakleszten bez poswiecania spojnosci',
                'SNAPSHOT automatycznie rozwiazuje deadlocki za pomoca AI',
                'SNAPSHOT dziala tylko dla odczytow, zapisy sa identyczne jak SERIALIZABLE'
              ],
              correctAnswer: 'SNAPSHOT uzywa wersjonowania wierszy - readers nie blokuja writers, eliminujac wiele zakleszten bez poswiecania spojnosci',
              solution: 'SNAPSHOT isolation uzywa Row Versioning - SQL Server przechowuje poprzednie wersje wierszy w tempdb. Gdy transakcja T1 odczytuje dane zmodyfikowane przez T2 (nie-committed), T1 widzi poprzednia wersje sprzed poczatku T2. Readers nie blokuja Writers i Writers nie blokuja Readers - dramatycznie zmniejsza ilosc blokad i deadlockow. SERIALIZABLE blokuje zakresy danych i powoduje duza rywalizacje. SNAPSHOT oferuje podobny poziom izolacji (bez phantom reads) z duzdzekso lepsza wydajnoscia.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Wyjasnij co to jest ACID i dlaczego jest wazne dla systemu jak Relativity (platforma do analizy dokumentow prawniczych). Podaj przyklad gdzie brak Atomicity mogloby powodowac powazne problemy.',
              tagSlugs: ['sql-server', 'transactions', 'intermediate'],
              solution: 'ACID to cztery wlasciwosci transakcji: Atomicity (niepodzielnosc - albo wszystko albo nic), Consistency (baza jest zawsze w spojnym stanie), Isolation (transakcje nie widza nawzajem niezatwierdzonych zmian), Durability (zatwierdzone dane sa trwale zapisane). Dla Relativity gdzie przechowywane sa dane prawnicze (dowody, dokumenty spraw sadowych, przywileje klientow): Brak Atomicity - przyklad: dodawanie dokumentu do sprawy sadowej. Operacja wymaga zapisania metadanych, powiazania z dokumentem, aktualizacji licznikow, zalogowania dostepu. Bez atomowosci, awaria po polowie operacji mogla by zostawic dokument polaczony ze sprawa ale bez metadanych - co prowadzi do nieczytelnych rekordow sadowych. Brak Durability bylby katastrofalny - dokument zatwierdzony przez prawnika moze zniknac po awarii serwera. Brak Consistency - mozliwe duplikaty dowodow lub uszkodzone relacje miedzy dokumentami a sprawami.',
              points: 3,
              isPublished: false
            }
          ]
        }
      ]
    }
  ]
};
