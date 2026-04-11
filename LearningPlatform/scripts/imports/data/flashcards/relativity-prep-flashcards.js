module.exports = [
  // ─────────────────────────────────────────────
  // OOP FUNDAMENTALS (~25 kart)
  // ─────────────────────────────────────────────
  {
    question: 'Jakie sa cztery filary OOP?',
    answer: 'Enkapsulacja (ukrywanie stanu za interfejsem), Dziedziczenie (wspoldzielenie kodu przez relacje "jest"), Polimorfizm (wiele form jednego interfejsu), Abstrakcja (ukrywanie zlozonosci, pokazywanie tylko istotnego).',
    tagSlugs: ['oop', 'beginner']
  },
  {
    question: 'Czym rozni sie interface od abstract class w Javie?',
    answer: 'Abstract class moze miec stan (pola), konstruktory i konkretne metody - sluzy do wspoldzielenia kodu. Interface definiuje czysty kontrakt (co, nie jak). Klasa moze extendowac tylko jedna klase, ale implementowac wiele interfejsow. Regula: wspolny kod = abstract class, kontrakt/zachowanie = interface.',
    tagSlugs: ['oop', 'java', 'intermediate']
  },
  {
    question: 'Co to jest method overloading vs method overriding?',
    answer: 'Overloading (przeciazanie) - wiele metod o tej samej nazwie, roznych sygnaturach parametrow. Rozstrzygane w czasie kompilacji (static polymorphism). Overriding (nadpisywanie) - podklasa dostarcza wlasna implementacje metody klasy bazowej (ta sama sygnatura). Rozstrzygane w runtime (dynamic polymorphism). @Override adnotacja chroni przed literowkami.',
    tagSlugs: ['oop', 'java', 'polymorphism', 'intermediate']
  },
  {
    question: 'Co to znaczy ze Java nie wspiera multiple inheritance?',
    answer: 'Klasa moze extendowac tylko jedna klase - eliminuje "diamentowy problem" (niejednoznacznosc gdy dwie klasy bazowe maja ta sama metode). Ale klasa moze implementowac wiele interfejsow. Od Java 8 interfejsy moga miec default methods, wiec mozliwa jest wielokrotna "implementacja", ale kompilator wymaga rozwiazania konfliktow.',
    tagSlugs: ['oop', 'java', 'inheritance', 'intermediate']
  },
  {
    question: 'Co to jest Single Responsibility Principle (SOLID - S)?',
    answer: 'Klasa powinna miec jeden i tylko jeden powod do zmiany - robi jedna rzecz dobrze. Naruszenie: klasa UserService ktora waliduje, zapisuje do bazy, wysyla email i generuje PDF. Naprawa: wyodrebnij UserRepository, EmailService, PdfGenerator. Zmiana logiki emaila nie powinna dotkac kodu bazy danych.',
    tagSlugs: ['oop', 'solid', 'intermediate']
  },
  {
    question: 'Co to jest Open/Closed Principle (SOLID - O)?',
    answer: 'Klasy powinny byc otwarte na rozszerzenie, ale zamkniete na modyfikacje. Nowa funkcjonalnosc = nowa klasa (extends/implements), nie modyfikacja istniejacego kodu. Realizacja: interfejsy i abstrakcje. Przyklad: zamiast if-else na typach platnosci, stworz PaymentStrategy interface z implementacjami CreditCardStrategy, PayPalStrategy.',
    tagSlugs: ['oop', 'solid', 'intermediate']
  },
  {
    question: 'Co to jest Liskov Substitution Principle (SOLID - L)?',
    answer: 'Obiekty klasy podrzednej musza byc wymienne z obiektami klasy nadrzednej bez naruszenia poprawnosci programu. Test: jesli w podklasie musisz rzucic wyjatek lub zrobic nothing w miejscu gdzie baza miala sens - naruszylas LSP. Klasyczny przyklad naruszenia: Square extends Rectangle (kwadrat zmienia szerokosc przy ustawieniu wysokosci).',
    tagSlugs: ['oop', 'solid', 'intermediate']
  },
  {
    question: 'Co to jest Dependency Inversion Principle (SOLID - D)?',
    answer: 'Moduly wysokiego poziomu nie powinny zalezec od modulow niskiego poziomu - oba powinny zalezec od abstrakcji (interfejsow). Zamiast new MySqlRepository() w srodku klasy, wstrzyknij przez konstruktor interfejs Repository. To fundament Dependency Injection i Spring Framework. Pozwala podmieniac implementacje (np. mock w testach) bez zmiany kodu.',
    tagSlugs: ['oop', 'solid', 'intermediate']
  },
  {
    question: 'Co to jest wzorzec Singleton i kiedy go uzywac?',
    answer: 'Singleton zapewnia dokladnie jedna instancje klasy przez caly czas zycia aplikacji. Implementacja: prywatny konstruktor + static getInstance() z double-checked locking i volatile. Uzywaj dla: konfiguracja, logger, connection pool. Wada: utrudnia testowanie (global state). W Spring Boot preferuj singleton beans przez IoC container zamiast recznie implementowac.',
    tagSlugs: ['design-patterns', 'creational-patterns', 'intermediate']
  },
  {
    question: 'Co to jest wzorzec Builder i kiedy go uzywac?',
    answer: 'Builder oddziela konstruowanie zlozonego obiektu od jego reprezentacji. Uzyj gdy klasa ma wiele opcjonalnych parametrow - konstruktor z 10 argumentami jest nieczytelny i error-prone. Wzorzec: klasa Builder z metodami fluent API (setX().setY().build()). W Javie: Lombok @Builder automatycznie generuje Builder. Przyklad: HttpRequest.Builder z url, headers, body, timeout.',
    tagSlugs: ['design-patterns', 'creational-patterns', 'intermediate']
  },
  {
    question: 'Co to jest wzorzec Strategy i kiedy go uzywac?',
    answer: 'Strategy definiuje rodzine algorytmow, enkapsuluje kazdy i umozliwia ich wymienne uzywanie w runtime. Context trzyma referencje do Strategy i moze ja zmienic przez setter. Uzyj gdy: chcesz wybierac algorytm dynamicznie, masz if-else na typach ktore sie rozrastaja, chcesz wdrozyc OCP. Przyklad: PaymentStrategy z CreditCard, PayPal, Crypto implementacjami.',
    tagSlugs: ['design-patterns', 'behavioral-patterns', 'intermediate']
  },
  {
    question: 'Co to jest wzorzec Observer i gdzie jest uzywany?',
    answer: 'Observer definiuje zaleznosc jeden-do-wielu: gdy Subject zmienia stan, wszyscy Observers sa automatycznie powiadamiani. Subject ma liste observerow (add/remove), notifyObservers() przy zmianie stanu. Uzycia: event-driven architecture, Spring Events, GUI listeners, reactive programming (RxJava). To wzorzec ktory lezy u podstaw Event-Driven Architecture.',
    tagSlugs: ['design-patterns', 'behavioral-patterns', 'intermediate']
  },
  {
    question: 'Co to jest wzorzec Decorator i jak rozni sie od dziedziczenia?',
    answer: 'Decorator dynamicznie dodaje zachowanie do obiektow bez zmiany klasy. Dekorator implementuje ten sam interfejs co dekorowany obiekt i go opakowuje. Roznica od dziedziczenia: dziedziczenie jest statyczne (w compile time), decorator jest dynamiczny (w runtime). Mozna kombinowac dekoratory. Przyklad w Javie: Java I/O streams - new BufferedReader(new FileReader(path)) to Decorator Pattern.',
    tagSlugs: ['design-patterns', 'structural-patterns', 'intermediate']
  },
  {
    question: 'Co to jest God Class i jak jej unikac?',
    answer: 'God Class to klasa ktora wie zbyt duzo i robi zbyt duzo - naruszenie SRP w ekstremalnej formie. Objawy: setki metod, importowana wsedzie, jej zmiana dotyka calego systemu. Jak unikac: stosuj SRP, regularnie pytaj "czy ta metoda nalezy naprawde do tej klasy?", szukaj grupy metod operujacych na wspolnych danych jako sygnalu do wyodrebnienia klasy.',
    tagSlugs: ['anti-patterns', 'oop', 'intermediate']
  },

  // ─────────────────────────────────────────────
  // JAVA DEEP DIVE (~25 kart)
  // ─────────────────────────────────────────────
  {
    question: 'Czym rozni sie Stack od Heap w JVM?',
    answer: 'Stack przechowuje ramki metod z lokalnymi prymitywami i REFERENCJAMI do obiektow. Jest prywatny per watek, zarzadzany automatycznie, maly. Heap przechowuje same OBIEKTY, wspoldzielony przez watki, zarzadzany przez GC, konfigurowalny (-Xmx). StackOverflowError = przepelnienie stosu. OutOfMemoryError: Java heap space = przepelnienie sterty.',
    tagSlugs: ['java', 'java-memory', 'intermediate']
  },
  {
    question: 'Dlaczego porownywanie Stringow przez == jest bledne w Javie?',
    answer: '== porownuje referencje (adresy w pamieci), nie wartosci. "hello" == "hello" moze zwrocic true (String Pool), ale new String("hello") == new String("hello") zawsze false (dwa rozne obiekty na Heap). Zawsze uzywaj .equals() lub Objects.equals() dla bezpiecznego porownania nullable stringow. To klasyczne pytanie na rozmowach kwalifikacyjnych.',
    tagSlugs: ['java', 'java-gotchas', 'intermediate']
  },
  {
    question: 'Co to jest Integer Cache w Javie i jak wplywa na porownania?',
    answer: 'JVM keszuje obiekty Integer od -128 do 127. Autoboxing w tym zakresie zwraca ten sam obiekt z cache, wiec == zwraca true. Poza zakresem tworzy nowe obiekty, wiec == zwraca false. Przyklad: Integer a = 127; Integer b = 127; a == b to true. Integer c = 128; Integer d = 128; c == d to false. Zawsze uzywaj .equals() dla obiektow Integer.',
    tagSlugs: ['java', 'java-gotchas', 'intermediate']
  },
  {
    question: 'Czym rozni sie ArrayList od LinkedList - kiedy co uzywac?',
    answer: 'ArrayList: tablica dynamiczna, get(i) O(1), add na koncu O(1) amortyzowane, wstawianie w srodku O(n). Dobre cache locality. LinkedList: doubly linked list, get(i) O(n), add/remove na krawedzi O(1). Implementuje Deque. W praktyce: ArrayList do wszystkiego domyslnie, LinkedList tylko jako Queue/Deque gdy czeste operacje na poczatku/koncu.',
    tagSlugs: ['java', 'collections', 'intermediate']
  },
  {
    question: 'Czym rozni sie HashMap od TreeMap od LinkedHashMap?',
    answer: 'HashMap: hash table, O(1) get/put, brak porzadku, dopuszcza null key. TreeMap: Red-Black Tree, O(log n), klucze posortowane (naturalnie lub Comparator), przydatny dla range queries. LinkedHashMap: HashMap + linked list, zachowuje porzadek wstawiania (lub dostepowania z accessOrder=true), idealny dla LRU Cache. Domyslnie uzywaj HashMap.',
    tagSlugs: ['java', 'collections', 'intermediate']
  },
  {
    question: 'Jaki jest kontrakt equals() i hashCode() w Javie?',
    answer: 'Jezeli a.equals(b) to MUSI byc a.hashCode() == b.hashCode(). Odwrotnie nie musi zachodzic (kolizje hasha sa OK). Jesli nadpisujesz equals(), MUSISZ nadpisac hashCode(). Bez tego HashMap/HashSet nie znajdzie wstawionego obiektu bo szuka w zlym buckecie. Uzywaj Objects.hash(field1, field2) lub Lomboks @EqualsAndHashCode.',
    tagSlugs: ['java', 'collections', 'java-gotchas', 'intermediate']
  },
  {
    question: 'Co to jest race condition i jak jej zapobiegac?',
    answer: 'Race condition wystepuje gdy wynik operacji zalezy od kolejnosci wykonania watkow. Przyklad: counter++ to read-modify-write (3 operacje) - dwa watki moga odczytac ta sama wartosc i stracic jeden increment. Rozwiazania: synchronized method/block (wzajemne wykluczanie), AtomicInteger.incrementAndGet() (lock-free CAS), lub wyodrebnienie do jednego watku. Preferuj AtomicInteger dla prostych licznikow.',
    tagSlugs: ['java', 'concurrency', 'intermediate']
  },
  {
    question: 'Co robi slowo kluczowe volatile w Javie?',
    answer: 'volatile gwarantuje WIDOCZNOSC zmian dla wszystkich watkow - bez keszowania w rejestrach CPU. Nie gwarantuje ATOMOWOSCI zlozonych operacji. volatile boolean running = true jako flaga stopu watku jest poprawne. Ale volatile int count; count++ nie jest thread-safe (read-modify-write). Dla atomowych operacji uzyj AtomicInteger lub synchronized.',
    tagSlugs: ['java', 'concurrency', 'intermediate']
  },
  {
    question: 'Co to jest deadlock i jak mu zapobiegac?',
    answer: 'Deadlock: dwa watki czekaja na siebie nawzajem (circular dependency na lockach). T1 trzyma A, czeka na B; T2 trzyma B, czeka na A. Zapobieganie: 1) Zawsze akwiruj locki w tej samej kolejnosci. 2) Uzyj tryLock() z timeoutem. 3) Unikaj zagniezdzonej synchronizacji. 4) Uzyj wyzej-poziomowych abstrakcji (ConcurrentHashMap zamiast recznie synchronizowanej mapy).',
    tagSlugs: ['java', 'concurrency', 'intermediate']
  },
  {
    question: 'Czym rozni sie ExecutorService od recznie tworzonych watkow?',
    answer: 'Tworzenie watkow jest kosztowne (alokacja, OS context switch). ExecutorService zarzadza pula watkow - watki sa reuzywane. Typy: newFixedThreadPool(n) - N watkow zawsze, newCachedThreadPool() - dynamiczny, newSingleThreadExecutor() - 1 watek, newScheduledThreadPool() - harmonogram. Zawsze zamykaj przez shutdown() w finally lub try-with-resources. Nigdy nie tworzaj new Thread() w produkcji.',
    tagSlugs: ['java', 'concurrency', 'intermediate']
  },
  {
    question: 'Jak dziala Java Streams - czym jest lazy evaluation?',
    answer: 'Stream to potok: Source -> Intermediate Operations (lazy) -> Terminal Operation. Intermediate operations (filter, map, sorted) nie sa wykonywane dopoki terminal operation (collect, count, forEach) ich nie wyzwoli. Pozwala na optymalizacje: filter przed map przetwarza mniej elementow. Stream mozna skonsumowan tylko raz - po terminal operation jest zamkniety.',
    tagSlugs: ['java', 'streams', 'intermediate']
  },
  {
    question: 'Co to jest Optional w Javie i dlaczego jest lepszy niz null?',
    answer: 'Optional<T> to kontener ktory moze lub nie zawierac wartosci. Eliminuje NullPointerException przez wymuszenie explicite obslugi braku wartosci. Metody: orElse(default), orElseThrow(exception), ifPresent(consumer), map(), filter(). Zamiast zwracac null z metod, zwracaj Optional.empty(). Mozna lancuchowac: Optional.ofNullable(person).map(Person::getAddress).map(Address::getCity).orElse("Unknown").',
    tagSlugs: ['java', 'streams', 'intermediate']
  },
  {
    question: 'Czym rozni sie checked exception od unchecked exception?',
    answer: 'Checked exceptions (extends Exception, nie RuntimeException): kompilator wymaga obslugi (catch lub throws w sygnaturze). Reprezentuja recoverable conditions (IOException, SQLException). Unchecked (extends RuntimeException): bez wymusonej obslugi, programming errors (NullPointerException, IllegalArgumentException). Zasada: uzywaj checked gdy klient moze sensownie obsluzyc blad, unchecked dla bledow programisty.',
    tagSlugs: ['java', 'exception-handling', 'intermediate']
  },
  {
    question: 'Co to jest String immutability i jakie ma konsekwencje?',
    answer: 'String jest niemutowalny - metody jak toUpperCase() zwracaja NOWY obiekt, nie modyfikuja oryginalu. Konsekwencje: String Pool (internowanie literalow), bezpieczenstwo (String jako klucz mapy nie zmienia sie), thread safety. Problem: konkatenacja w petli tworzy O(n) obiektow -> O(n^2) czas. Rozwiazanie: StringBuilder (mutowalny, efektywny append). Kompilator optymalizuje + poza petlami, ale nie wewnatrz.',
    tagSlugs: ['java', 'java-gotchas', 'intermediate']
  },
  {
    question: 'Co to sa generics w Javie i co to znaczy type erasure?',
    answer: 'Generics pozwalaja pisac typowo-bezpieczny kod parametryzowany typem (List<String>, Map<K,V>). Type erasure - typy generyczne sa usuwane w czasie kompilacji. W runtime List<String> i List<Integer> to ten sam typ raw List. Konsekwencje: nie mozna new T(), not instanceof List<String>, nie mozna overloadowac metod tylko przez typ generyczny. To rozni sie od C# gdzie generics sa zachowywane w runtime.',
    tagSlugs: ['java', 'generics', 'intermediate']
  },

  // ─────────────────────────────────────────────
  // C# i .NET (~15 kart)
  // ─────────────────────────────────────────────
  {
    question: 'Jak wyglada property w C# i czym rozni sie od Java getter/setter?',
    answer: 'C# property: public string Name { get; set; } - kompilator generuje backing field i metody get/set. Uzycie jak pole (p.Name = "Alice"), nie jak metoda (p.getName()). Mozna miec property z walidacja w get/set, read-only (tylko get), lub expression-body (=> value). W Javie odpowiedniki to getName()/setName() - C# jest bardziej zwiezle.',
    tagSlugs: ['csharp', 'intermediate']
  },
  {
    question: 'Co to jest async/await w C# i jak sie ma do Java CompletableFuture?',
    answer: 'async/await to syntactic sugar dla asynchronicznego kodu bez blokowania watku. async metoda zwraca Task<T> (jak CompletableFuture<T> w Javie). await "czeka" na wynik bez blokowania - kompilator generuje state machine. Pulapka: nigdy nie uzywaj .Result lub .Wait() w ASP.NET (deadlock przez synchronization context). Zawsze await all the way. Task.WhenAll() dla rownoleglosci.',
    tagSlugs: ['csharp', 'async-await', 'intermediate']
  },
  {
    question: 'Czym LINQ Where/Select/OrderBy odpowiada Java Streams?',
    answer: 'Java -> C# LINQ: filter() -> Where(), map() -> Select(), flatMap() -> SelectMany(), sorted() -> OrderBy()/OrderByDescending(), collect(toList()) -> ToList(), count() -> Count(), anyMatch() -> Any(), allMatch() -> All(), reduce() -> Aggregate(), limit(n) -> Take(n). Dwa style LINQ: Method Syntax (lambda-based) i Query Syntax (SQL-like). Oba kompiluja do tego samego kodu.',
    tagSlugs: ['csharp', 'linq', 'intermediate']
  },
  {
    question: 'Czym roznia sie AddSingleton, AddScoped i AddTransient w .NET DI?',
    answer: 'AddSingleton: jedna instancja przez caly czas zycia aplikacji. Dla stateless serwisow, konfiguracji. AddScoped: nowa instancja per request HTTP, wspoldzielona w obrebie requestu. Dla DbContext/repozytoriow (jeden request = jedna sesja bazy). AddTransient: nowa instancja za kazdym razem gdy serwis jest wstrzykiwany. Dla lekkich, bezstanowych serwisow. Nigdy nie wstrzykuj Scoped do Singleton (captive dependency bug).',
    tagSlugs: ['csharp', 'dotnet', 'intermediate']
  },
  {
    question: 'Czym rozni sie IEnumerable od IQueryable w C#?',
    answer: 'IEnumerable<T>: operacje wykonywane w pamieci CLR. Dane pobrane, filtrowanie w C# (LINQ to Objects). IQueryable<T>: zapytanie budowane jako expression tree, wykonywane przez providera (EF Core konwertuje na SQL). Uzywaj IQueryable dla zapytan bazodanowych - EF generuje optymalny SQL. Uzywaj IEnumerable po pobraniu danych do pamieci. Blad: wywolanie AsEnumerable() za wczesnie pobiera wszystkie dane przed filtrowaniem.',
    tagSlugs: ['csharp', 'linq', 'dotnet', 'intermediate']
  },
  {
    question: 'Co to jest IDisposable i jak go poprawnie uzywac?',
    answer: 'IDisposable to interfejs z metoda Dispose() do zwolnienia niezarzadzanych zasobow (polaczenia, pliki, strumienie). Poprawne uzycie: using statement (using (var x = new Resource()) { }) lub using declaration (using var x = new Resource();) - automatycznie wywoluje Dispose() nawet przy wyjatku. Odpowiednik Java: AutoCloseable z try-with-resources. Nigdy nie polegaj na finalize() - nie gwarantuje czasu wywolania.',
    tagSlugs: ['csharp', 'dotnet', 'intermediate']
  },
  {
    question: 'Czym rozni sie virtual/override w C# od Javy?',
    answer: 'W Javie wszystkie metody (poza static, final, private) sa domyslnie wirtualne - podklasa moze je override bez zadnych slow w bazie. W C# metody sa domyslnie NIE-wirtualne. Klasa bazowa musi oznaczyc metode jako virtual, podklasa uzywa override. Jesli chcesz zablokac dalsze nadpisywanie: sealed override. Jest to intencjonalne - C# wymaga jasnego wyrazenia intencji w hierarchii.',
    tagSlugs: ['csharp', 'oop', 'intermediate']
  },
  {
    question: 'Co to sa C# Records i czym sa lepsze od zwyklych klas dla danych?',
    answer: 'Record (C# 9+) to niemutowalny typ danych z automatycznie generowanym equals(), hashCode(), ToString() i dekonstrukcja. public record Person(string Name, int Age); to 1 linia zamiast 30+ boilerplate. Records sa value-based equality (dwa Person("Alice", 30) sa rowne). Podobne do Java Records (Java 16). Idealne dla DTO, Value Objects, wiadomosci w CQRS.',
    tagSlugs: ['csharp', 'intermediate']
  },

  // ─────────────────────────────────────────────
  // SQL SERVER (~15 kart)
  // ─────────────────────────────────────────────
  {
    question: 'Jak pobrac TOP N wierszy w SQL Server?',
    answer: 'SQL Server: SELECT TOP 10 * FROM Orders ORDER BY OrderDate DESC. Nie LIMIT (PostgreSQL/MySQL) ani ROWNUM (Oracle). Bez ORDER BY wyniki sa niedeterministyczne. Mozna tez SELECT TOP 10 PERCENT. W OFFSET/FETCH: SELECT * FROM Orders ORDER BY OrderDate OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY (SQL Server 2012+).',
    tagSlugs: ['sql-server', 'sql', 'intermediate']
  },
  {
    question: 'Czym rozni sie WHERE od HAVING w SQL?',
    answer: 'WHERE filtruje wiersze PRZED grupowaniem (dziala na poszczegolnych wierszach). HAVING filtruje grupy PO GROUP BY (dziala na wynikach agregacji: COUNT, SUM, AVG). Przyklad: WHERE IsActive = 1 usuwa nieaktywnych przed liczeniem. HAVING COUNT(*) > 5 usuwa dzialy z mniej niz 6 pracownikami. Nie mozna uzywac funkcji agregujacych w WHERE.',
    tagSlugs: ['sql-server', 'sql', 'intermediate']
  },
  {
    question: 'Co to sa Window Functions (funkcje okna) w SQL?',
    answer: 'Window Functions obliczaja wartosci na podstawie "okna" wierszy bez zwijania wynikow (w odroznieniu od GROUP BY). Uzywaja OVER(PARTITION BY ... ORDER BY ...). ROW_NUMBER() - numer wiersza (1,2,3,4). RANK() - 1,2,2,4 (pomija po powtorzeniu). DENSE_RANK() - 1,2,2,3 (nie pomija). LAG()/LEAD() - poprzedni/nastepny wiersz. SUM() OVER() - suma biezaca (running total).',
    tagSlugs: ['sql-server', 'sql', 'intermediate']
  },
  {
    question: 'Co to jest CTE (Common Table Expression) i kiedy go uzywac?',
    answer: 'CTE (WITH clause) to nazwane podrzedne zapytanie ktore mozna referencjonowac w glownym zapytaniu. Czytelniejsze niz zagniezdzone subquery. WITH MyCTE AS (SELECT ...) SELECT * FROM MyCTE WHERE ... Recursive CTE sluzy do zapytan hierarchicznych (org chart, kategorie). CTE moze byc uzywany wiele razy w zapytaniu (bez powtarzania kodu) i moze byc CTE-on-CTE.',
    tagSlugs: ['sql-server', 'sql', 'intermediate']
  },
  {
    question: 'Czym rozni sie Clustered od Non-Clustered Index w SQL Server?',
    answer: 'Clustered Index: determinuje fizyczny porzadek danych w tabeli. Dane SA indeksem. Max 1 per tabela (zwykle PRIMARY KEY). Non-Clustered: osobna struktura B-tree z kluczem i pointerem do wiersza. Max 999 per tabela. Key Lookup = koszt gdy Non-Clustered nie ma wszystkich kolumn i musi pobiec do tabeli. Covering Index (INCLUDE) eliminuje Key Lookup dodajac kolumny do leaf node bez B-tree.',
    tagSlugs: ['sql-server', 'indexing', 'intermediate']
  },
  {
    question: 'Co to jest non-sargable query i dlaczego jest problemem?',
    answer: 'Non-sargable (Search ARGument ABLE) - zapytanie gdzie SQL nie moze uzyc indeksu bo kolumna jest transformowana. Najczestsze przyczyny: funkcja na kolumnie (WHERE YEAR(date) = 2024), leading wildcard (WHERE name LIKE "%Smith"), implicit conversion (WHERE int_col = "123"). Naprawa: uzywaj surowych kolumn w WHERE. Zamiast YEAR(date) = 2024: date >= "2024-01-01" AND date < "2025-01-01".',
    tagSlugs: ['sql-server', 'performance', 'indexing', 'intermediate']
  },
  {
    question: 'Co to sa ACID properties transakcji?',
    answer: 'Atomicity: albo wszystkie operacje sukces albo rollback. Consistency: baza przechodzi miedzy spojnymi stanami, constrainty zachowane. Isolation: rownolegle transakcje nie widza niezatwierdzonych zmian innych (stopien konfigurowalny). Durability: po COMMIT dane sa trwale zapisane nawet po awarii (Write-Ahead Log). W SQL Server domyslny poziom izolacji to READ COMMITTED.',
    tagSlugs: ['sql-server', 'transactions', 'intermediate']
  },
  {
    question: 'Jakie sa poziomy izolacji transakcji i co to Dirty Read?',
    answer: 'Dirty Read: czytasz dane innej transakcji ktora nie zostala jeszcze zatwierdzona (moze zrobic ROLLBACK). Mozliwy przy READ UNCOMMITTED. Poziomy od najnizszego: READ UNCOMMITTED (dirty reads mozliwe), READ COMMITTED (domyslny, brak dirty reads), REPEATABLE READ (brak non-repeatable reads), SERIALIZABLE (pelen isolation, wolny). SQL Server ma tez SNAPSHOT (row versioning, readers nie blokuja writers).',
    tagSlugs: ['sql-server', 'transactions', 'intermediate']
  },

  // ─────────────────────────────────────────────
  // DOCKER i KUBERNETES (~15 kart)
  // ─────────────────────────────────────────────
  {
    question: 'Co to jest Multi-Stage Build w Docker i po co go uzywac?',
    answer: 'Multi-Stage Build uzywa wielu FROM w jednym Dockerfile. Stage builder kompiluje aplikacje (JDK, Maven, kod zrodlowy). Stage runtime kopiuje tylko skompilowany artefakt (JAR, DLL) do lekkiego obrazu (JRE zamiast JDK). Zalety: duzo mniejszy obraz produkcyjny (~200MB vs ~800MB), kod zrodlowy nie trafia do produkcji, jeden Dockerfile zamiast dwoch. Standard dla Java i .NET.',
    tagSlugs: ['docker', 'intermediate']
  },
  {
    question: 'Czym rozni sie Named Volume od Bind Mount w Docker?',
    answer: 'Named Volume: Docker zarzadza lokalizacja (docker volume create), przenosny, dziala tak samo na kazdej maszynie. Preferowany dla produkcji (dane bazy). Bind Mount: mapuje konkretna sciezke z hosta (np. /home/user/code:/app), zalezny od struktury hosta. Idealny dla development (live reload - edytujesz na hoscie, zmiany widoczne w kontenerze natychmiast).',
    tagSlugs: ['docker', 'intermediate']
  },
  {
    question: 'Jak kontenery Docker sie komunikuja w tej samej sieci?',
    answer: 'Docker tworzy wbudowany DNS dla sieci. Kontenery w tej samej sieci moga sie komunikowac przez NAZWE kontenera jako hostname. Nie potrzeba znac IP (ktore sa dynamiczne). W Docker Compose wszystkie serwisy sa automatycznie w jednej sieci - serwis "api" komunikuje sie z "postgres" przez host "postgres:5432". Zewnetrzny dostep: port mapping (-p 8080:80 lub ports: - "8080:80").',
    tagSlugs: ['docker', 'intermediate']
  },
  {
    question: 'Co to jest Pod w Kubernetes?',
    answer: 'Pod to najmniejsza jednostka deploymentu w K8s. Opakowuje jeden lub wiecej kontenerow ktore wspoldziela siec (komunikacja przez localhost) i storage (wolumeny). Pody sa efemeryczne - jesli padna, nie wracaja same. Zwykle jeden kontener per Pod (plus ewentualnie sidecar). Pody maja IP w klastrze, ale zmieniajace sie - dlatego potrzebny Service jako stabilny punkt dostepowy.',
    tagSlugs: ['kubernetes', 'intermediate']
  },
  {
    question: 'Czym rozni sie Deployment od samodzielnego Poda w K8s?',
    answer: 'Pod samodzielny: jezeli pada, nikt go nie restartuje. Deployment: kontroler ktory utrzymuje zadana liczbe replik (replicas), automatycznie restartuje Pody ktore padly, obsluguje rolling updates (zero-downtime deploy) i rollbacki. W produkcji ZAWSZE uzywaj Deployment. Samodzielne Pody uzywaj tylko do debugowania lub jednorazowych zadan.',
    tagSlugs: ['kubernetes', 'intermediate']
  },
  {
    question: 'Co to jest Service w Kubernetes i jakie sa jego typy?',
    answer: 'Service to stabilny punkt dostepowy dla Podow (load balancing). Pody maja zmieniajace sie IP, Service daje stala nazwe i IP. Typy: ClusterIP (domyslny, wewnatrz klastra), NodePort (ekspozycja na porcie Node, 30000-32767), LoadBalancer (zewnetrzny load balancer w chmurze, Azure Load Balancer), ExternalName (mapowanie na zewnetrzna nazwe DNS). Dla AKS z publicznym dostepem: LoadBalancer lub Ingress.',
    tagSlugs: ['kubernetes', 'intermediate']
  },
  {
    question: 'Czym rozni sie livenessProbe od readinessProbe w K8s?',
    answer: 'livenessProbe: czy kontener zyje? Jesli fail -> K8s restartuje kontener. Wykrywa deadlocki/frozen state. readinessProbe: czy gotowy do ruchu? Jesli fail -> usuwany z load balancera, ruch nie trafia, ale NIE jest restartowany. Scenariusz: Java app startuje 30s (wczytuje cache, laczy z baza) - jest zywa (liveness OK) ale nie gotowa (readiness FAIL). Bez readiness K8s wyslalby ruch do nie-gotowej aplikacji.',
    tagSlugs: ['kubernetes', 'intermediate']
  },
  {
    question: 'Co to jest HPA (Horizontal Pod Autoscaler) i jakie ma wymagania?',
    answer: 'HPA automatycznie zwieksza/zmniejsza liczbe replik Deployment na podstawie metryk (CPU, pamiec, custom). Konfiguracja: minReplicas, maxReplicas, target CPU utilization (np. 70%). WYMAGANIE: Pody musza miec ustawione resources.requests. Metrics Server oblicza utilization jako faktyczne/requested - bez requests mianownik jest undefined i HPA nie dziala. Zalecenie: zawsze ustawiaj requests i limits w spec kontenera.',
    tagSlugs: ['kubernetes', 'intermediate']
  },

  // ─────────────────────────────────────────────
  // AZURE i CLOUD (~10 kart)
  // ─────────────────────────────────────────────
  {
    question: 'Czym rozni sie AKS od Azure App Service?',
    answer: 'AKS (Azure Kubernetes Service): zarzadzany K8s, pelna kontrola, dla mikroserwisow i zaawansowanej orchestracji. Microsoft zarzadza Control Plane, Ty zarzadzasz Node Pools i aplikacjami. Azure App Service: PaaS, wdrazasz kod lub kontener, Azure zarzadza wszystkim (serwery, OS, scaling). Prostszy dla pojedynczej aplikacji. Wybor: wiele mikroserwisow = AKS, prosta aplikacja = App Service.',
    tagSlugs: ['azure', 'cloud', 'intermediate']
  },
  {
    question: 'Czym rozni sie Azure Blob Storage od Azure SQL Database?',
    answer: 'Azure Blob Storage: object storage dla plikow, dokumentow, obrazow, backupow (odpowiednik AWS S3). Przechowuje dane jako blobs w kontenerach. Azure SQL Database: relacyjna baza danych SQL Server jako usluga (odpowiednik AWS RDS). Automatyczne backupy, HA, skalowanie. Dla Relativity: dokumenty prawnicze w Blob Storage, metadane i relacje miedzy dokumentami w SQL Database.',
    tagSlugs: ['azure', 'cloud', 'intermediate']
  },
  {
    question: 'Co to jest Circuit Breaker Pattern i jak dziala?',
    answer: 'Circuit Breaker chroni system przed kaskadowymi awariami. Stany: CLOSED (normalny), OPEN (po N bledach - natychmiast zwraca fallback bez proby wywolania), HALF-OPEN (po czasie probuje ponownie - jesli sukces wraca do CLOSED, jesli blad wraca do OPEN). W .NET: biblioteka Polly. Zapobiega blokowaniu watkow przez timeout zewnetrznego serwisu ktory nie odpowiada.',
    tagSlugs: ['azure', 'cloud', 'distributed-systems', 'intermediate']
  },
  {
    question: 'Co to jest CAP Theorem?',
    answer: 'Rozproszony system moze zagwarantowac co najwyzej DWA z: Consistency (kazdy odczyt zwraca najnowszy zapis lub blad), Availability (kazde zadanie dostaje odpowiedz, moze nie byc najnowsza), Partition Tolerance (system dziala mimo utraty polaczen). P jest wymagane w praktyce - wiec wybierasz CP (SQL Server, MongoDB) lub AP (Cassandra, DynamoDB eventually consistent). Relativity = dane prawnicze = CP wazniejsze.',
    tagSlugs: ['cloud', 'distributed-systems', 'intermediate']
  },
  {
    question: 'Dlaczego aplikacja musi byc "stateless" dla horizontal scaling?',
    answer: 'Stateful aplikacja przechowuje sesje w lokalnej pamieci instancji. Przy horizontal scaling nastepny request moze trafic do innej instancji (load balancer round-robin), ktora nie ma sesji -> uzytkownik wylogowany. Stateless: caly stan przechowywany zewnetrznie (Redis, baza). Wszystkie instancje moga obslugzyc kazdy request. Rozwiazanie: session state w Redis, JWT tokeny (stan po stronie klienta), lub sticky sessions (gorsze rozwiazanie).',
    tagSlugs: ['cloud', 'distributed-systems', 'intermediate']
  },
  {
    question: 'Co to jest Azure Service Bus i dlaczego uzywac kolejek zamiast synchronicznego HTTP?',
    answer: 'Azure Service Bus to managed messaging service dla kolejek (Queue) i tematow pub/sub (Topic). Zalety asynchronicznej komunikacji: decoupling (OrderService nie czeka na EmailService), buforowanie (Email slow nie blokuje Order), automatyczny retry przy bledie, niezalezne skalowanie serwisow. Deadletter queue dla nieudanych wiadomosci. Service Bus gwarantuje dostarczenie (at-least-once delivery).',
    tagSlugs: ['azure', 'cloud', 'microservices', 'intermediate']
  },

  // ─────────────────────────────────────────────
  // INTERVIEW PREP - DODATKOWE (~10 kart)
  // ─────────────────────────────────────────────
  {
    question: 'Co to jest Dependency Injection i jak Spring to realizuje?',
    answer: 'DI to wzorzec gdzie zaleznosci sa wstrzykiwane z zewnatrz zamiast tworzonych wewnatrz klasy. Spring realizuje DI przez IoC Container: @Service, @Repository, @Component sa rejestrowane jako beans (domyslnie singleton). @Autowired lub constructor injection wstrzykuje zaleznosci. Zalety: luzne sprzezenie, latwe testowanie (mockowanie), latwa zmiana implementacji bez zmiany kodu. To implementacja DIP z SOLID.',
    tagSlugs: ['java', 'spring-boot', 'oop', 'intermediate']
  },
  {
    question: 'Czym rozni sie mikroarchitektura od monolitu?',
    answer: 'Monolit: jedna aplikacja zawierajaca cala logike biznesowa. Prosta do developmentu i debugowania, trudna do skalowania czesciowego i deploymentu. Mikroserwisy: male, niezalezne serwisy komunikujace sie przez API lub kolejki. Niezalezny deployment i skalowanie, technologiczna niezaleznosc, ale skomplikowane operacje (distributed tracing, service discovery). Relativity: najprawdopodobniej mikroserwisy na AKS.',
    tagSlugs: ['microservices', 'intermediate']
  },
  {
    question: 'Co to jest REST API i jakie sa jego zasady?',
    answer: 'REST (Representational State Transfer): architektura API przez HTTP. Zasady: Stateless (serwer nie trzyma stanu sesji), Uniform Interface (zasoby identyfikowane przez URI, standardowe metody: GET/POST/PUT/DELETE/PATCH), Layered (klient nie wie czy rozmawia z serwerem czy proxy), Cache. HTTP status codes: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error.',
    tagSlugs: ['interview-prep', 'intermediate']
  },
  {
    question: 'Co to jest SCRUM i jakie sa jego kluczowe elementy?',
    answer: 'SCRUM to framework Agile. Zespol: Product Owner (priorytety backlogu), Scrum Master (facilitator), Development Team. Eventy: Sprint Planning, Daily Standup (co robilem, co bede, blokery, max 15 min), Sprint Review (demo), Sprint Retrospective (co poprawic). Artefakty: Product Backlog, Sprint Backlog, Increment. Sprint = 1-4 tygodnie (zwykle 2). Story Points = wzgledna zlozonosc (Fibonacci).',
    tagSlugs: ['interview-prep', 'intermediate']
  },
  {
    question: 'Co to jest CI/CD i jak wyglada typowy pipeline?',
    answer: 'CI (Continuous Integration): przy kazdym commicie automatycznie: build, unit tests, code analysis. CD (Continuous Deployment): automatyczny deployment do staging lub prod. Typowy pipeline (GitHub Actions): commit -> testy -> build Docker image -> push do registry (ACR) -> deploy do K8s (kubectl set image) -> weryfikacja (rollout status). Cel: czeste, bezpieczne wdrazanie. Feature flags dla nowych funkcji bez ryzyka.',
    tagSlugs: ['interview-prep', 'azure', 'intermediate']
  }
];
