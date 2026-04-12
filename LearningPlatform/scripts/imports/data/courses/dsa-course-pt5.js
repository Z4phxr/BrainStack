// data/courses/dsa-course-pt5.js
// MODUL 9: Mock Interview - Zadania Egzaminacyjne (same taski, minimalna teoria)

module.exports = {
  subject: {
    name: 'Computer Science & Algorytmy',
    slug: 'computer-science-algorytmy'
  },

  course: {
    title: 'DSA & Algorytmy: Kompletne Przygotowanie do Rozmow Kwalifikacyjnych (Junior SWE)',
    slug: 'dsa-interview-prep-junior',
    description: 'Kompleksowy kurs przygotowujacy do technicznych rozmow kwalifikacyjnych na stanowisko Junior Software Engineer. Opanujesz Big O Notation, kluczowe struktury danych, algorytmy sortowania i wyszukiwania, drzewa, grafy oraz programowanie dynamiczne - dokladnie to, czego szukaja rekruterzy w 2025 roku.',
    level: 'INTERMEDIATE',
    isPublished: false
  },

  modules: [

    // =========================================================
    // MODUL 9: Mock Interview - Zadania Egzaminacyjne
    // =========================================================
    {
      title: 'Modul 9: Mock Interview - Egzamin Koncowy',
      order: 9,
      isPublished: false,

      lessons: [

        // -------------------------------------------------------
        // LEKCJA 9.1 - Big O i Struktury Danych
        // -------------------------------------------------------
        {
          title: 'Lekcja 9.1: Mock Interview - Big O i Struktury Danych',
          order: 1,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Czas na sprawdzian! Ta lekcja to symulacja pytan z prawdziwej rozmowy kwalifikacyjnej dotyczacych Big O Notation i struktur danych. Odpowiadaj tak jak na rozmowie - bez zaglądania do poprzednich lekcji. Kazde zadanie to typowe pytanie zadawane przez rekruterow w Google, Microsoft, Amazon i polskich startupach. Powodzenia!'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Rekruter pyta: "Jaka jest zlozonosc wyszukiwania elementu w nieposortowanej tablicy?" Co odpowiadasz?',
              tagSlugs: ['big-o', 'array', 'quiz', 'mock-interview'],
              choices: [
                'O(1) - tablice maja szybki dostep',
                'O(log n) - mozna uzyc Binary Search',
                'O(n) - trzeba sprawdzic kazdy element',
                'O(n^2) - potrzebne porownanie par'
              ],
              correctAnswer: 'O(n) - trzeba sprawdzic kazdy element',
              solution: 'Dla nieposortowanej tablicy nie mozemy uzyc Binary Search. Jedyna opcja to Linear Search - sprawdzamy kazdy element po kolei, az znajdziemy szukany lub dojdziemy do konca. W worst case przeglądamy wszystkie n elementow = O(n). Binary Search (O(log n)) wymaga danych posortowanych.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'Rekruter pokazuje kod: "Mam Hash Map gdzie kluczem jest liczba, a wartoscia jej indeks. Dodaje 1 milion elementow. Jaka bedzie srednia zlozonosc wyszukiwania jednego elementu?"',
              tagSlugs: ['hash-map', 'big-o', 'quiz', 'mock-interview'],
              choices: [
                'O(1 000 000) - trzeba sprawdzic caly milion',
                'O(log 1 000 000) - ok. 20 krokow',
                'O(1) - Hash Map daje staly czas niezaleznie od rozmiaru',
                'O(sqrt(1 000 000)) - ok. 1000 krokow'
              ],
              correctAnswer: 'O(1) - Hash Map daje staly czas niezaleznie od rozmiaru',
              solution: 'Hash Map oblicza hash klucza i bezposrednio trafia do bucketu - jedna operacja niezaleznie od rozmiaru. Wyszukiwanie miliona czy miliarda elementow to ciag O(1). To wlasnie jest przewaga Hash Map nad tablica posortowana (O(log n)) czy nieposortowana (O(n)). Zastrz.: O(1) to srednia - worst case (wszystkie kolizje) to O(n).',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'Rekruter pyta: "Czy Stack i Queue maja ta sama time complexity dla operacji push i pop/enqueue i dequeue?"',
              tagSlugs: ['stack', 'queue', 'big-o', 'quiz', 'mock-interview'],
              correctAnswer: 'true',
              solution: 'Prawda. Zarowno Stack (push/pop na szczyt) jak i Queue (enqueue na tyl, dequeue z przodu) sa O(1) dla swoich podstawowych operacji - jezeli zaimplementowane poprawnie (Linked List lub cykliczna tablica dla Queue). Roznica to semantyka (LIFO vs FIFO), nie wydajnosc.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 4,
              prompt: 'Rekruter pyta: "Masz Linked List i tablice. Dla ktorej operacja wstawiania na POCZATEK jest szybsza i dlaczego?"',
              tagSlugs: ['linked-list', 'array', 'big-o', 'quiz', 'mock-interview'],
              choices: [
                'Tablica - bo ma szybki dostep po indeksie',
                'Linked List - bo wystarczy zmienic wskaznik head, O(1) vs O(n) dla tablicy',
                'Oba sa jednakowo szybkie - O(1)',
                'Tablica - bo dane sa ciaglem w pamieci'
              ],
              correctAnswer: 'Linked List - bo wystarczy zmienic wskaznik head, O(1) vs O(n) dla tablicy',
              solution: 'Wstawienie na poczatek Linked List: stworz nowy wezel, ustaw jego next = head, ustaw head = nowy. Trzy operacje = O(1). Wstawienie na poczatek tablicy: trzeba przesunac WSZYSTKIE n elementow o jedno miejsce w prawo, zeby zrobic miejsce = O(n). To jeden z kluczowych powodow uzycia Linked List zamiast tablicy - gdy czesto dodajesz na poczatek.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 5,
              prompt: 'Rekruter pokazuje kod i pyta o zlozonosc:\n\nfunction mystery(n) {\n  let count = 0;\n  for (let i = 0; i < n; i++) {\n    for (let j = i; j < n; j++) {\n      count++;\n    }\n  }\n  return count;\n}',
              tagSlugs: ['big-o', 'complexity-analysis', 'quiz', 'mock-interview'],
              choices: [
                'O(n)',
                'O(n log n)',
                'O(n^2)',
                'O(2^n)'
              ],
              correctAnswer: 'O(n^2)',
              solution: 'Zewnetrzna petla: n iteracji (i=0..n-1). Wewnetrzna: dla kazdego i, j biegnie od i do n-1, wiec (n-i) iteracji. Lacznie: n + (n-1) + (n-2) + ... + 1 = n*(n+1)/2 ≈ n^2/2. Ignorujemy stale: O(n^2). Choc wewnetrzna petla nie zawsze biegnie pelne n razy, ciag arytmetyczny daje O(n^2). Typowy przyklad: prawy trojkat iteracji.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 6,
              prompt: 'Rekruter pyta: "Czy Doubly Linked List ma mniejsza space complexity niz Singly Linked List?"',
              tagSlugs: ['linked-list', 'space-complexity', 'quiz', 'mock-interview'],
              correctAnswer: 'false',
              solution: 'Falsz. Doubly Linked List ma WIEKSZA space complexity - kazdy wezel przechowuje dwa wskazniki (next I prev) zamiast jednego (next). Dla n wezlow: Singly LL = n*(dane + 1 wskaznik), Doubly LL = n*(dane + 2 wskazniki). Doubly LL uzywa wiecej pamieci w zamian za mozliwosc poruszania sie w obu kierunkach.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 7,
              prompt: 'Rekruter pyta: "Opisz roznice miedzy Array a Hash Table. Kiedy uzylbys kazdego z nich? Podaj konkretne przyklady zastosowan."',
              tagSlugs: ['array', 'hash-table', 'quiz', 'mock-interview'],
              solution: 'Array: ciagly blok pamieci. O(1) dostep po indeksie, O(n) wyszukiwanie, O(n) wstawienie w srodku. Dobre gdy: masz numeryczne indeksy, potrzebujesz random access, kolejnosc ma znaczenie, dane sa zwarte. Przyklad: przechowywanie wynikow gry (score[0], score[1]...), bufor pixeli obrazu. Hash Table: klucz-wartosc z hashem. O(1) avg wyszukiwanie/wstawienie/usuniecie po kluczu. Dobre gdy: masz nieregularne klucze (stringi, obiekty), czesto szukasz po kluczu, chcesz deduplikacje. Przyklad: cache DNS (domena->IP), liczenie czestotliwosci slow, sesje uzytkownikow (sessionId->dane), Two Sum (wartosc->indeks). Kluczowa roznica: Array optymalne gdy klucze to ciagly zakres liczb; Hash Map gdy klucze sa dowolne lub rzadkie.',
              points: 3,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 8,
              prompt: 'Rekruter pyta: "Co to jest amortyzowana zlozonosc i dlaczego operacja push() na Dynamic Array jest O(1) amortyzowane mimo ze czasem kosztuje O(n)?"',
              tagSlugs: ['array', 'big-o', 'quiz', 'mock-interview'],
              choices: [
                'Amortyzowana zlozonosc ignoruje kosztowne operacje - push jest zawsze O(1)',
                'Kosztowne resizing (O(n)) zdarza sie rzadko i rozklada sie na wiele operacji push, dajac sredni koszt O(1) na operacje',
                'Amortyzowana zlozonosc to to samo co average case zlozonosc',
                'Push jest O(n) amortyzowane, nie O(1)'
              ],
              correctAnswer: 'Kosztowne resizing (O(n)) zdarza sie rzadko i rozklada sie na wiele operacji push, dajac sredni koszt O(1) na operacje',
              solution: 'Amortyzowana analiza rozklada koszt drogich operacji na sekwencje operacji. Dynamic Array podwaja rozmiar przy resizingu (O(n)). Po resizingu do rozmiaru 2k, mozna dodac kolejne k elementow bez resizingu. Koszt: k operacji O(1) + 1 operacja O(k). Srednio: (k + k) / (k+1) ≈ 2 = O(1) na operacje. Inne spojrzenie: kazdy element "placi" za swoje przyszle przeniesienie przy resizingu.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 9,
              prompt:
                'Rekruter pyta: "Masz wybrać strukturę danych do implementacji systemu Undo/Redo w edytorze tekstu. Co wybierzesz i dlaczego? Jak obsłużysz oba kierunki (cofnij i ponow)?"',
              tagSlugs: ['stack', 'quiz', 'mock-interview'],
              solution: 'Wybor: dwa Stacki - undoStack i redoStack. Logika: Kazda akcja uzytkownika (wpisanie, usuniecie) wklada stan (lub operacje delta) na undoStack. Undo: pop z undoStack (cofnij akcje) i push na redoStack (mozna ponowic). Redo: pop z redoStack i push na undoStack. Nowa akcja po Undo: wyczysc redoStack (nie mozna ponowic po nowej akcji). Dlaczego Stack? LIFO - ostatnia akcja jest pierwsza do cofniecia. Dlaczego dwa Stacki? Jeden do cofania, drugi do ponawiania - oba O(1) push/pop. Alternatywa: Doubly Linked List z wskaznikiem "current" - ale dwa Stacki sa prostsze i bardziej intuicyjne do wytlumaczenia na rozmowie.',
              points: 2,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 10,
              prompt: 'Rekruter pyta: "Jaka jest roznica miedzy Stack Overflow a Heap Overflow w kontekscie pamieci programu?"',
              tagSlugs: ['quiz', 'mock-interview', 'intermediate'],
              choices: [
                'Nie ma roznicy - oba oznaczaja ze program uzywa za duzo pamieci',
                'Stack Overflow: przekroczona pamiec stosu wywolan (gleboka rekurencja). Heap Overflow: przekroczona pamiec dynamiczna (zbyt wiele alokacji obiektow)',
                'Stack Overflow dotyczy struktur danych Stack, Heap Overflow dotyczy struktury Heap',
                'Oba terminy odnosza sie do tego samego bledu - przepelnienia pamieci'
              ],
              correctAnswer: 'Stack Overflow: przekroczona pamiec stosu wywolan (gleboka rekurencja). Heap Overflow: przekroczona pamiec dynamiczna (zbyt wiele alokacji obiektow)',
              solution: 'Pamiec procesu ma dwie glowne regiony: Stack (stos) - przechowuje ramki wywolan funkcji, zmienne lokalne. Ograniczony rozmiar (zazwyczaj 1-8MB). Stack Overflow = zbyt gleboka rekurencja wypelnia stos. Heap (sterta) - dynamiczna alokacja obiektow (new, malloc). Wiekszy, ale skonczona. Heap Overflow = alokacja wiecej pamieci niz dostepne. W JavaScript/Javie: Stack Overflow = "Maximum call stack size exceeded" z nieskonczaona rekurencja.',
              points: 1,
              isPublished: false
            }
          ]
        },

        // -------------------------------------------------------
        // LEKCJA 9.2 - Sortowanie i Wyszukiwanie
        // -------------------------------------------------------
        {
          title: 'Lekcja 9.2: Mock Interview - Sortowanie i Wyszukiwanie',
          order: 2,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Symulacja pytan rekruterskich dotyczacych algorytmow sortowania i wyszukiwania. To pytania zadawane przez firmy technologiczne na poziomie junior i mid. Odpowiadaj tak jak na prawdziwej rozmowie - uzasadniaj wybory, mow o trade-offach, podawaj zlozonosci.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Rekruter: "Masz tablice 10 milionow imion (stringow). Chcesz posortowac i zachowac stabilnosc (rowne imiona w oryginalnej kolejnosci). Jaki algorytm wybierzesz?"',
              tagSlugs: ['sortowanie', 'quiz', 'mock-interview'],
              choices: [
                'Quick Sort - najszybszy w praktyce',
                'Bubble Sort - najprostszy do implementacji',
                'Merge Sort lub Tim Sort - gwarantuja O(n log n) i sa stabilne',
                'Selection Sort - minimalna liczba zamian'
              ],
              correctAnswer: 'Merge Sort lub Tim Sort - gwarantuja O(n log n) i sa stabilne',
              solution: 'Wymagania: duze dane (10M) -> O(n^2) odpada. Stabilnosc wymagana -> Quick Sort (niestabilny) odpada. Merge Sort: O(n log n) zawsze, stabilny. Tim Sort (Python/Java default): hybryda Merge Sort + Insertion Sort, O(n log n), stabilny, zoptymalizowany dla realnych danych. Oba sa poprawna odpowiedzia. Heap Sort (niestabilny) i Quick Sort (niestabilny) nie spelniaja wymagania stabilnosci.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'Rekruter: "Binary Search mozna zastosowac do znalezienia pierwszego wystapienia elementu w tablicy z duplikatami." Czy to prawda?',
              tagSlugs: ['binary-search', 'quiz', 'mock-interview'],
              correctAnswer: 'true',
              solution: 'Prawda. Standardowy Binary Search zatrzymuje sie przy DOWOLNYM wystapeniu. Ale mozna go zmodyfikowac: gdy znajdziemy target, zamiast zwracac, kontynuujemy szukanie w lewej polowie (right = mid - 1). W ten sposob znajdziemy PIERWSZE wystapienie. Analogicznie dla ostatniego: gdy znajdziemy target, kontynuujemy w prawej polowie (left = mid + 1). To "Find Left Bound" i "Find Right Bound" warianty Binary Search.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'Rekruter: "Dlaczego Quick Sort jest zazwyczaj szybszy od Merge Sort w praktyce, mimo ze oba maja O(n log n) average case?"',
              tagSlugs: ['quick-sort', 'merge-sort', 'quiz', 'mock-interview'],
              choices: [
                'Quick Sort ma lepszy worst case',
                'Quick Sort jest stabilny, Merge Sort nie',
                'Quick Sort dziala in-place z lepsza cache locality; Merge Sort tworzy kopie danych powodujac cache misses',
                'Quick Sort uzywa mniej pamieci podrecznej (RAM)'
              ],
              correctAnswer: 'Quick Sort dziala in-place z lepsza cache locality; Merge Sort tworzy kopie danych powodujac cache misses',
              solution: 'Oba maja O(n log n) average, ale stale maja znaczenie. Quick Sort operuje in-place - przestawia elementy w oryginalnej tablicy. Procesor prefetchuje sasiednie dane do cache. Merge Sort allokuje nowe tablice przy scalaniu - dane sa w roznych miejscach pamieci, powodujac cache misses (powolne). Cache miss to 100-1000x wolniej niz cache hit. Praktycznie Quick Sort jest 2-3x szybszy mimo gorszego worst case.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Rekruter: "Masz posortowana tablice ktora zostala obrocona (rotated) - np. [4,5,6,7,0,1,2]. Jak znajdziesz element w O(log n)?"',
              tagSlugs: ['binary-search', 'quiz', 'mock-interview', 'intermediate'],
              solution: 'Modyfikowany Binary Search: left=0, right=n-1. W petli: mid = left + (right-left)/2. Sprawdz ktora polowa jest posortowana: jesli arr[left] <= arr[mid] - lewa polowa [left..mid] jest posortowana. Jesli target jest w zakresie [arr[left], arr[mid]) - szukaj w lewej (right=mid-1). W przeciwnym razie szukaj w prawej (left=mid+1). Jesli arr[mid] < arr[left] - prawa polowa [mid..right] jest posortowana. Jesli target jest w zakresie (arr[mid], arr[right]] - szukaj w prawej (left=mid+1). W przeciwnym razie szukaj w lewej (right=mid-1). Klucz: zawsze przynajmniej jedna polowa jest posortowana, co pozwala na klasyczna logike Binary Search dla tej polowy. O(log n) time, O(1) space.',
              points: 3,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 5,
              prompt: 'Rekruter: "Insertion Sort vs Merge Sort dla tablicy [1, 2, 3, 4, 5] (juz posortowanej). Ktory bedzie szybszy i dlaczego?"',
              tagSlugs: ['sortowanie', 'quiz', 'mock-interview'],
              choices: [
                'Merge Sort - zawsze O(n log n), czyli lepszy',
                'Insertion Sort - O(n) best case dla juz posortowanej tablicy, szybszy niz O(n log n) Merge Sort',
                'Oba beda jednakowo szybkie',
                'Bubble Sort bylby najszybszy - O(n) z optymalizacja'
              ],
              correctAnswer: 'Insertion Sort - O(n) best case dla juz posortowanej tablicy, szybszy niz O(n log n) Merge Sort',
              solution: 'Insertion Sort ma O(n) best case: dla juz posortowanej tablicy, wewnetrzna petla while nigdy nie wykonuje zamiany (kazdy element jest >= poprzedni). Jeden przejazd bez zamian = O(n). Merge Sort zawsze dzieli i scala = O(n log n) nawet dla posortowanych danych. Wiec dla posortowanej tablicy: Insertion Sort O(n) < Merge Sort O(n log n). To wlasnie dlatego Tim Sort uzywa Insertion Sort dla malych lub prawie posortowanych fragmentow.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 6,
              prompt: 'Rekruter: "Nie istnieje algorytm sortowania oparty na porownaniach, ktory w worst case dzialalby szybciej niz O(n log n)."',
              tagSlugs: ['sortowanie', 'big-o', 'quiz', 'mock-interview', 'advanced'],
              correctAnswer: 'true',
              solution: 'Prawda. Jest to udowodniony matematycznie lower bound dla algorytmow porownawczych. Dowod przez drzewko decyzyjne: n elementow ma n! permutacji (lisci w drzewie). Minimalna glebokosc drzewa binarnego z n! listami to ceil(log2(n!)) ≈ n log n (wzor Stirlinga). Dlatego Merge Sort i Heap Sort sa optymalne. Szybsze sortowanie jest mozliwe TYLKO przy dodatkowych zalozeniach o danych (Counting Sort, Radix Sort - nieporownawcze).',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 7,
              prompt: 'Rekruter: "Jaka jest time complexity Counting Sort i kiedy jest szybszy od O(n log n) algorytmow?"',
              tagSlugs: ['sortowanie', 'big-o', 'quiz', 'mock-interview'],
              choices: [
                'O(n^2) - zawsze wolniejszy',
                'O(n log n) - taki sam jak Merge Sort',
                'O(n + k) gdzie k to zakres wartosci - szybszy gdy k = O(n)',
                'O(k) - niezaleznie od n'
              ],
              correctAnswer: 'O(n + k) gdzie k to zakres wartosci - szybszy gdy k = O(n)',
              solution: 'Counting Sort: zlicz wystapienia kazdej wartosci (tablica size k), odtwarz posortowana tablice. O(n + k) time i space. Jest szybszy od O(n log n) gdy k = O(n) lub mniejsze, bo n + k < n log n. Przyklad: sortowanie n=10M liczb z zakresu [0,100] - k=101, wiec O(10M + 101) ≈ O(n) znacznie szybsze od O(n log n)=O(230M). Ale dla k=2^32 (pelny int) - Counting Sort jest niepraktyczny.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 8,
              prompt: 'Rekruter: "Zaimplementuj Binary Search i opisz wszystkie edge cases ktore musisz obsluzyc."',
              tagSlugs: ['binary-search', 'quiz', 'mock-interview'],
              solution: 'function binarySearch(arr, target) { if (!arr || arr.length === 0) return -1; let left = 0, right = arr.length - 1; while (left <= right) { const mid = left + Math.floor((right - left) / 2); // bezpieczne mid if (arr[mid] === target) return mid; if (arr[mid] < target) left = mid + 1; else right = mid - 1; } return -1; } Edge cases: 1) Pusta tablica - zwroc -1 (null check na poczatku). 2) Jeden element - petla wykonuje sie raz, dziala poprawnie. 3) Target mniejszy od wszystkich - right bedzie < left po jednej iteracji. 4) Target wiekszy od wszystkich - left bedzie > right. 5) Integer overflow w mid - uzywam left + (right-left)/2. 6) Warunek left <= right (nie left < right) - konieczny gdy szukany element to jedyny pozostaly. 7) Zwracam -1 (nie null, nie false) jako konwencje "nie znaleziono".',
              points: 3,
              isPublished: false
            }
          ]
        },

        // -------------------------------------------------------
        // LEKCJA 9.3 - Drzewa i Grafy
        // -------------------------------------------------------
        {
          title: 'Lekcja 9.3: Mock Interview - Drzewa i Grafy',
          order: 3,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Pytania o drzewa i grafy to serce rozmow algorytmicznych na poziomie junior-mid. W tej lekcji znajdziesz typowe zadania jakie spotykasz w rekrutacjach do firm technologicznych - od prostych definicji, przez klasyczne traversale, po problemy grafowe z prawdziwych rozmow.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Rekruter: "Masz drzewo binarne. Chcesz znalezc najkrotsza sciezke (minimalna glebokosc - liczba krawedzi) od korzenia do najblizszego liscia. Jakiego algorytmu uzywasz?"',
              tagSlugs: ['binary-tree', 'bfs', 'quiz', 'mock-interview'],
              choices: [
                'DFS (Postorder) - przetworzy wszystkie liscie',
                'DFS (Inorder) - zwroci elementy posortowane',
                'BFS (Level Order) - znajdzie pierwszy lisc na najplytszym poziomie',
                'Binary Search - szybkie przeszukiwanie drzewa'
              ],
              correctAnswer: 'BFS (Level Order) - znajdzie pierwszy lisc na najplytszym poziomie',
              solution: 'BFS odwiedza wezly warstwa po warstwie. Gdy napotkamy pierwszy lisc (wezel bez dzieci), to jest on na minimalnej glebokosci - BFS gwarantuje ze odwiedzi najplytsze liscie pierwsze. DFS (rekurencja) musialbby odwiedzic cale drzewo i wziac minimum, co jest rowniez poprawne ale BFS konczy wczesniej (po znalezieniu pierwszego liscia). To klasyczna roznica DFS (max depth przez wszystkie sciezki) vs BFS (min depth przez pierwsze trafienie).',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'Rekruter: "Inorder traversal Binary Search Tree zawsze zwraca elementy w posortowanej kolejnosci rosnącej."',
              tagSlugs: ['bst', 'tree-traversal', 'quiz', 'mock-interview'],
              correctAnswer: 'true',
              solution: 'Prawda. Wlasnosc BST: lewe poddrzewo < korzen < prawe poddrzewo (rekurencyjnie dla kazdego wezla). Inorder traversal: Lewy, Korzen, Prawy - odwiedza najpierw cale lewe poddrzewo (mniejsze wartosci), potem korzen, potem cale prawe (wieksze). Wynik jest posortowany rosnaco. To pozwala na O(n) weryfikacje czy drzewo jest BST (sprawdz czy Inorder jest niemalejacy).',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'Rekruter: "Masz graf niewazone. Chcesz znalezc najkrotsza sciezke (najmniej krawedzi) miedzy wezlami A i B. Jakiego algorytmu uzywasz?"',
              tagSlugs: ['grafy', 'bfs', 'quiz', 'mock-interview'],
              choices: [
                'DFS - przeszuka caly graf',
                'BFS - gwarantuje najkrotsza sciezke w grafie niewazonm',
                'Dijkstra - algorytm najkrotszej sciezki',
                'Topological Sort - porzadkuje wezly'
              ],
              correctAnswer: 'BFS - gwarantuje najkrotsza sciezke w grafie niewazonm',
              solution: 'BFS odwiedza wezly w kolejnosci rosnacego dystansu od zrodla. Gdy pierwszy raz dotrze do B, gwarantuje ze uzylo minimalnej liczby krawedzi. DFS moze znalezc dluzsza sciezke. Dijkstra to BFS z wagami - dla niewazonego grafu BFS (wszystkie wagi = 1) jest prostszy i wystarczajacy. Dijkstra jest potrzebny dla grafow z rozymi wagami krawedzi.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 4,
              prompt: 'Rekruter: "W problemie Course Schedule (czy mozna ukonczyc wszystkie kursy z zaleznosci), jaki problem grafowy rozwiazujesz?"',
              tagSlugs: ['grafy', 'topological-sort', 'quiz', 'mock-interview'],
              choices: [
                'Najkrotsza sciezka w grafie wazonm (Dijkstra)',
                'Wykrywanie cyklu w grafie skierowanym (Topological Sort)',
                'Liczba spojnych skladowych (Union-Find)',
                'Minimalne drzewo rozpinajace (MST)'
              ],
              correctAnswer: 'Wykrywanie cyklu w grafie skierowanym (Topological Sort)',
              solution: 'Jezeli kurs A wymaga B, a B wymaga A - mamy cykl i nie mozna ukonczyc zadnego. Pytanie "czy mozna ukonczyc wszystkie kursy" to pytanie "czy graf zaleznosci jest acykliczny (DAG)?". Rozwiazanie: Kahn\'s Algorithm (BFS Topological Sort). Jezeli przetworzone wszystkie wezly = brak cyklu = mozna ukonczyc. Jezeli mniej niz n wezlow przetworzone = jest cykl = niemozliwe.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 5,
              prompt: 'Rekruter: "Union-Find jest lepsza strukturą danych niż DFS do sprawdzania czy dwa wezly sa w tej samej spojnej skladowej, jezeli graaf jest dynamiczny (krawedzie sa dodawane w czasie rzeczywistym)."',
              tagSlugs: ['union-find', 'grafy', 'quiz', 'mock-interview'],
              correctAnswer: 'true',
              solution: 'Prawda. DFS dla statycznego grafu: O(V+E) jednorazowo, ale kazde zapytanie po dodaniu krawedzi wymaga powtorzenia DFS = O(V+E) per zapytanie. Union-Find: union() O(alpha(n)) ≈ O(1) przy dodawaniu krawedzi, find()/connected() O(alpha(n)) dla zapytania. Dla dynamicznych grafow (online connectivity) Union-Find jest znacznie lepszy. DFS jest lepszy dla jednorazowej analizy statycznego grafu.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 6,
              prompt: 'Rekruter: "Sprawdz czy Binary Tree jest symetryczne wzgledem osi pionowej (np. [1,2,2,3,4,4,3] jest symetryczne, [1,2,2,null,3,null,3] nie jest). Opisz algorytm."',
              tagSlugs: ['binary-tree', 'dfs', 'quiz', 'mock-interview'],
              solution: 'Algorytm rekurencyjny: function isSymmetric(root) { return isMirror(root.left, root.right); } function isMirror(left, right) { if (!left && !right) return true; // oba null - OK if (!left || !right) return false; // jeden null - asymetria if (left.val !== right.val) return false; // rozne wartosci return isMirror(left.left, right.right) && isMirror(left.right, right.left); } Logika: Drzewo jest symetryczne gdy lewe i prawe poddrzewo sa lustrzanym odbiciem. Lustrzane odbicie: zewnetrzne dzieci (left.left i right.right) sa takie same ORAZ wewnetrzne (left.right i right.left) sa takie same. Warunki bazowe: oba null = OK. Jeden null = asymetria. Rozne wartosci = asymetria. Time: O(n) - odwiedzamy kazdy wezel raz. Space: O(h) - stos rekurencji o glebokosci h.',
              points: 2,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 7,
              prompt: 'Rekruter: "Jaka jest space complexity BFS na drzewie w najgorszym przypadku i kiedy ten worst case nastepuje?"',
              tagSlugs: ['binary-tree', 'bfs', 'space-complexity', 'quiz', 'mock-interview'],
              choices: [
                'O(1) - BFS nie uzywa dodatkowej pamieci',
                'O(log n) - tylko poziom aktualnie przetwarzany',
                'O(n) - gdy drzewo jest szerokie (Perfect Tree), ostatni poziom ma n/2 wezlow',
                'O(n^2) - dla kazdego wezla przechowujemy wszystkich sasiadow'
              ],
              correctAnswer: 'O(n) - gdy drzewo jest szerokie (Perfect Tree), ostatni poziom ma n/2 wezlow',
              solution: 'BFS uzywa kolejki. W najgorszym przypadku (Perfect Binary Tree), ostatni poziom zawiera n/2 wezlow - wszystkie sa w kolejce jednoczesnie = O(n) space. W porownaniu, DFS (rekurencja) uzywa O(h) space gdzie h = log n dla zbalansowanego drzewa. Dla szerokich drzew DFS jest oszczedniejszy pamieciowo, dla glebokich (zdegenerowanych) drzew BFS jest lepszy.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 8,
              prompt: 'Rekruter: "Opisz algorytm liczenia wysp (Number of Islands) na siatce 2D. Jaka jest zlozonosc? Jakie edge cases musisz obsluzyc?"',
              tagSlugs: ['grafy', 'dfs', 'quiz', 'mock-interview'],
              solution: 'Algorytm: Iteruj po kazdej komorce siatki. Gdy napotkasz "1" (ziemie) ktora nie jest odwiedzona: incrementuj licznik, uruchom DFS/BFS aby zaznaczyc caly spojny obszar jako odwiedzony (zamien "1" na "0" lub uzyj visited[][]). DFS: rekurencyjnie odwiedz 4 sasiadow (gora, dol, lewo, prawo) jezeli sa "1" i w granicach siatki. Zlozonosc: O(m*n) time - kazda komorka odwiedzana co najwyzej dwa razy. O(m*n) space - stos rekurencji lub visited[][] (worst case cala siatka to jedna wyspa). Edge cases: 1) Pusta siatka (null lub rows=0) - return 0. 2) Siatka 1x1 - sprawdz czy "1". 3) Cala siatka to woda - return 0. 4) Siatka bez wody - return 1. 5) Granice siatki - sprawdz row>=0, row<m, col>=0, col<n przed DFS.',
              points: 2,
              isPublished: false
            }
          ]
        },

        // -------------------------------------------------------
        // LEKCJA 9.4 - Dynamic Programming
        // -------------------------------------------------------
        {
          title: 'Lekcja 9.4: Mock Interview - Dynamic Programming',
          order: 4,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'DP to jeden z najtrudniejszych tematow na rozmowach. Pytania ponizej symuluja rozne poziomy trudnosci - od definicji, przez klasyczne wzorce, po pytania wymagajace samodzielnego zdefiniowania stanu DP. Odpowiadaj pelnym zdaniem jak na rozmowie - definicja dp[i], przejscie, baza, wynik.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Rekruter: "Jaki jest warunek konieczny do zastosowania Dynamic Programming zamiast prostej rekurencji?"',
              tagSlugs: ['dynamic-programming', 'quiz', 'mock-interview'],
              choices: [
                'Problem musi miec jedyne rozwiazanie',
                'Problem musi miec nakladajace sie podproblemy (overlapping subproblems) i optymalna podstrukture (optimal substructure)',
                'Problem musi byc mozliwy do rozwiazania w O(n)',
                'Problem musi byc o liczbach calkowitych'
              ],
              correctAnswer: 'Problem musi miec nakladajace sie podproblemy (overlapping subproblems) i optymalna podstrukture (optimal substructure)',
              solution: 'DP wymaga dwoch wlasciwosci: 1) Overlapping Subproblems: te same podproblemy pojawiaja sie wielokrotnie w drzewie rekurencji (inaczej memoizacja nie pomaga). 2) Optimal Substructure: optymalne rozwiazanie problemu sklada sie z optymalnych rozwiazan podproblemow. Bez pierwszej - prosta rekurencja lub D&C wystarczy. Bez drugiej - DP moze nie dac poprawnego wyniku.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'Rekruter: "Masz problem Coin Change z monetami [1, 5, 6] i target = 10. Greedy wybiera: 6+1+1+1+1 = 5 monet. DP daje: 5+5 = 2 monety. Co to pokazuje?"',
              tagSlugs: ['dynamic-programming', 'greedy', 'quiz', 'mock-interview'],
              choices: [
                'DP zawsze daje lepszy wynik niz Greedy',
                'Greedy bylby poprawny gdyby monety byty inaczej dobrane - nie ma uniwersalnej reguly',
                'Greedy jest poprawny tylko dla monet bed acych wielokrotnosciami mniejszych',
                'Coin Change powinien byc rozwiazywany Backtrackingiem, nie DP ani Greedy'
              ],
              correctAnswer: 'Greedy jest poprawny tylko dla monet bed acych wielokrotnosciami mniejszych',
              solution: 'Greedy "bierz zawsze najwieksza" dziala dla kanonicznego systemu monetarnego (euro, dolary) gdzie kazda moneta jest wielokrotnoscia mniejszych. Dla monet [1,5,6]: 6 nie jest wielokrotnoscia 5, wiec Greedy zawodzi. DP gwarantuje optimum przez eksploracje wszystkich mozliwosci. To klasyczny kontrprzyklad pokazujacy ze Greedy wymaga matematycznego dowodu - nie mozna "ufac intuicji".',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'Rekruter: "Tabulation (Bottom-Up DP) zawsze uzywa mniej pamieci niz Memoization (Top-Down DP)."',
              tagSlugs: ['dynamic-programming', 'memoization', 'tabulation', 'quiz', 'mock-interview'],
              correctAnswer: 'false',
              solution: 'Falsz. Oba podejscia maja podobna space complexity O(n) dla 1D problemow. Tabulation oblicza WSZYSTKIE podproblemy (tablica dp[0..n]). Memoization oblicza TYLKO potrzebne podproblemy (moze byc mniej!). Dla niektorych problemow gdzie nie wszystkie podproblemy sa potrzebne, Memoization moze uzyc MNIEJ pamieci. Natomiast Tabulation moze byc zoptymalizowana do O(1) lub O(k) jezeli przejscie zalezy tylko od ostatnich k wartosci (np. Fibonacci: tylko prev1 i prev2).',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Rekruter: "Opisz rozwiazanie problemu Unique Paths: robot idzie ze (0,0) do (m-1, n-1) robiajac tylko kroki w prawo lub w dol. Ile jest unikalnych sciezek? Podaj definicje dp[i][j], przejscie i baze."',
              tagSlugs: ['dynamic-programming', 'quiz', 'mock-interview'],
              solution: 'Definicja: dp[i][j] = liczba unikalnych sciezek dojscia do komorki (i,j). Przejscie: dp[i][j] = dp[i-1][j] + dp[i][j-1]. Do komorki (i,j) mozna dojsc z gory (i-1,j) lub z lewej (i,j-1). Suma obu mozliwosci. Baza: dp[0][j] = 1 dla wszystkich j (gorny rzad - tylko sciezka w prawo). dp[i][0] = 1 dla wszystkich i (lewa kolumna - tylko sciezka w dol). Wynik: dp[m-1][n-1]. Zlozonosc: O(m*n) time i space. Optymalizacja space: mozna zredukowac do O(n) uzywajac tylko jednego wiersza dp[] i nadpisujac wartosci lewej kolumny.',
              points: 2,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 5,
              prompt: 'Rekruter: "W problemie 0/1 Knapsack, dlaczego kazdy element moze byc uzyty co najwyzej raz (w przeciwienstwie do Coin Change)? Co w implementacji 1D DP to gwarantuje?"',
              tagSlugs: ['dynamic-programming', 'knapsack', 'quiz', 'mock-interview'],
              choices: [
                'Nic nie gwarantuje - algorytm sam to pilnuje',
                'Iteracja pojemnosci od TYLU (W do 0) - korzystamy z wartosci sprzed biezacej rundy, wiec element nie moze byc dodany dwa razy',
                'Iteracja pojemnosci od PRZODU (0 do W) - element dodawany tylko raz',
                'Uzycie tablicy 2D zamiast 1D automatycznie zapewnia 0/1'
              ],
              correctAnswer: 'Iteracja pojemnosci od TYLU (W do 0) - korzystamy z wartosci sprzed biezacej rundy, wiec element nie moze byc dodany dwa razy',
              solution: 'Przy iteracji od tylu: gdy obliczamy dp[w], dp[w-weight] juz NIE zostal zaktualizowany w biezacej rundzie (jest z poprzedniej iteracji po elementach). Wiec dp[w-weight] reprezentuje "najlepszy wynik BEZ biezacego elementu" = nie mozemy go dodac dwa razy. Przy iteracji od przodu (jak Coin Change): dp[w-weight] juz zostal zaktualizowany = biezacy element moze byc uzyty wielokrotnie = Unbounded Knapsack.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 6,
              prompt: 'Rekruter: "Masz problem: znajdz minimalna liczbe operacji (insert, delete, replace) zeby zamienic string word1 w word2 (Edit Distance). Podaj definicje dp[i][j], wzor przejscia dla przypadku gdy znaki pasuja i nie pasuja, i baze."',
              tagSlugs: ['dynamic-programming', 'quiz', 'mock-interview', 'advanced'],
              solution: 'Definicja: dp[i][j] = minimalna liczba operacji do przeksztalcenia word1[0..i-1] w word2[0..j-1]. Przejscie gdy znaki pasuja (word1[i-1] === word2[j-1]): dp[i][j] = dp[i-1][j-1]. Brak operacji - znaki juz zgodne, redukujemy do podproblemu bez tych znakow. Przejscie gdy znaki NIE pasuja: dp[i][j] = 1 + min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1]). dp[i-1][j-1]+1 = replace (zamien word1[i-1] na word2[j-1]). dp[i-1][j]+1 = delete (usun word1[i-1]). dp[i][j-1]+1 = insert (wstaw word2[j-1] do word1). Baza: dp[0][j] = j (j insertions z pustego). dp[i][0] = i (i deletions do pustego). Zlozonosc: O(m*n) time i space.',
              points: 3,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 7,
              prompt: 'Rekruter: "Problem Longest Increasing Subsequence (LIS) mozna rozwiazac w O(n log n) uzywajac Binary Search, a nie tylko w O(n^2) DP."',
              tagSlugs: ['dynamic-programming', 'quiz', 'mock-interview', 'advanced'],
              correctAnswer: 'true',
              solution: 'Prawda. Standardowe DP dla LIS to O(n^2). Istnieje algorytm O(n log n) zwany "Patience Sorting": utrzymuj tablice "konczyn" aktywnych podsekwencji. Dla kazdego elementu: Binary Search (O(log n)) aby znalezc gdzie go wstawic. Jezeli wiekszy od wszystkich - rozszerz tablice. Inaczej - zastap pierwszy element wiekszy od biezacego. Dlugosc tablicy = dlugosc LIS. O(n log n) total. Ta optymalizacja nie jest wymagana na junior, ale znajomosc jej istnienia imponuje.',
              points: 1,
              isPublished: false
            }
          ]
        },

        // -------------------------------------------------------
        // LEKCJA 9.5 - Mixed Bag
        // -------------------------------------------------------
        {
          title: 'Lekcja 9.5: Mock Interview - Mixed Bag (jak na prawdziwej rozmowie)',
          order: 5,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Finalna lekcja to mieszanka pytan z roznych modulow - dokladnie tak jak wyglada prawdziwa rozmowa kwalifikacyjna. Rekruter nie trzyma sie jednej kategorii. Bedziesz musial szybko rozpoznac z jakim problemem masz do czynienia, jaki algorytm lub wzorzec zastosowac i jak uzasadnic swoj wybor. To test Twojej pelnej wiedzy.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Rekruter: "Dane sa dwa posortowane Linked Listy. Scalaj je w jedna posortowana liste. Jaka jest time complexity optymalnego rozwiazania?"',
              tagSlugs: ['linked-list', 'quiz', 'mock-interview'],
              choices: [
                'O(n log n) - trzeba posortowac po scaleniu',
                'O(n + m) - jeden przejazd przez obie listy z dwoma wskaznikami',
                'O(n * m) - porownuje kazda pare',
                'O(n^2) - zagniezdzone petle'
              ],
              correctAnswer: 'O(n + m) - jeden przejazd przez obie listy z dwoma wskaznikami',
              solution: 'Algorytm Two Pointers: wskaznik p1 na liste 1, p2 na liste 2. Porownuj p1.val i p2.val, dodaj mniejszy do wyniku, przesuń ten wskaznik. Powtarzaj az jeden wskaznik = null, dolacz reszte drugiej listy. Jeden przejazd przez lacznie n+m wezlow = O(n+m). O(1) dodatkowa pamiec jezeli laczymy wezly in-place (nie tworzac nowych). To merge step z Merge Sort!',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 2,
              prompt: 'Rekruter: "Znajdz k-ta najmniejsza wartosc w BST bez uzycia tablicy pomocniczej do przechowywania wszystkich wartosci."',
              tagSlugs: ['bst', 'quiz', 'mock-interview', 'intermediate'],
              solution: 'Rozwiazanie: Inorder traversal BST daje wartosci posortowane rosnaco. k-ta wartosc = k-ty element Inorder. Implementacja bez tablicy: iteracyjny Inorder ze Stackiem, licznik k. function kthSmallest(root, k) { const stack = []; let current = root; let count = 0; while (current || stack.length > 0) { while (current) { stack.push(current); current = current.left; } current = stack.pop(); count++; if (count === k) return current.val; current = current.right; } return -1; } Zlozonosc: O(H + k) time gdzie H = wysokosc drzewa (idziemy do lewego dna H krokow, potem k krokow Inorder). O(H) space dla stosu. Alternatywa rekurencyjna z licznikiem jako obiektem {val, count} dziala analogicznie.',
              points: 2,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'Rekruter: "Masz string zawierajacy tylko nawiasy: {, }, (, ), [, ]. Sprawdz czy sa poprawnie zbilansowane. Jaka struktura danych i jaka jest zlozonosc?"',
              tagSlugs: ['stack', 'quiz', 'mock-interview'],
              choices: [
                'Counter (licznik) - licz otwierajace i zamykajace; O(n) time, O(1) space',
                'Stack - push otwierajacy, pop i sprawdz przy zamykajacym; O(n) time, O(n) space',
                'Queue - FIFO przetwarza znaki; O(n) time, O(n) space',
                'Hash Map - mapuj otwierajace na zamykajace; O(n) time, O(1) space'
              ],
              correctAnswer: 'Stack - push otwierajacy, pop i sprawdz przy zamykajacym; O(n) time, O(n) space',
              solution: 'Stack jest idealny. Dla kazdego znaku: jezeli otwierajacy ({, (, [) - push na stos. Jezeli zamykajacy - pop ze stosu i sprawdz czy pasuja (} pasuje do {, ) do (, ] do [). Jezeli stos pusty przy zamykajacym lub nie pasuja - false. Na koncu: stos pusty = true, niepusty = false (nie wszystkie otwarte zostaly zamkniete). O(n) time - jeden przejazd. O(n) space - w worst case stos zawiera n/2 nawiasow. Counter nie dziala dla mieszanych typow: "([)]" mialby 2 otwierajace i 2 zamykajace ale jest niepoprawny.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 4,
              prompt: 'Rekruter: "Jaki wzorzec algorytmiczny zastosujesz do problemu \'Znajdz najdluzszy podstring bez powtarzajacych sie znakow\'?"',
              tagSlugs: ['sliding-window', 'quiz', 'mock-interview'],
              choices: [
                'Two Pointers Opposite Direction',
                'Sliding Window Variable Size z Hash Map',
                'Binary Search',
                'Dynamic Programming 2D'
              ],
              correctAnswer: 'Sliding Window Variable Size z Hash Map',
              solution: 'Sliding Window Variable Size: lewy i prawy wskaznik definiuja okno. Prawy przesuwa sie zawsze w prawo. Hash Map przechowuje znak -> ostatni indeks wystapienia. Gdy napotykamy powtotzony znak w oknie: przesuwamy lewy wskaznik za poprzednie wystapienie. Aktualizujemy maxLen = max(maxLen, right - left + 1). O(n) time - kazdy znak dodawany i usuwany co najwyzej raz. O(k) space gdzie k = liczba unikalnych znakow (max 26 dla lowercase, 128 dla ASCII).',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 5,
              prompt: 'Rekruter: "Min-Heap przechowuje elementy w pelni posortowanej kolejnosci (jak posortowana tablica), z minimalnym elementem na poczatku."',
              tagSlugs: ['heap', 'quiz', 'mock-interview'],
              correctAnswer: 'false',
              solution: 'Falsz. Heap gwarantuje tylko "heap property" - rodzic <= dzieci (dla Min-Heap). NIE gwarantuje pelnego posortowania. Przyklad Min-Heap: [1, 3, 2, 5, 4, 6] - korzen (1) jest minimum, ale reszta nie jest posortowana (3 jest przed 2). Aby wyciagnac elementy w posortowanej kolejnosci, trzeba n razy wykonac extract-min = O(n log n) - to Heap Sort. Posortowana tablica daje kazdy element posortowany, Heap tylko gwarantuje minimum na szczycie.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 6,
              prompt: 'Rekruter: "Klasyczne pytanie: Two Sum. Masz tablice nums i liczbe target. Znajdz dwa indeksy takie ze nums[i] + nums[j] = target. Opisz trzy podejscia (brute force, sortowanie + two pointers, hash map) i porownaj ich zlozonosci."',
              tagSlugs: ['array', 'hash-map', 'two-pointers', 'quiz', 'mock-interview'],
              solution: 'Podejscie 1 - Brute Force: dwie zagniezdzone petle, sprawdz kazda pare. O(n^2) time, O(1) space. Prosto ale za wolno dla duzych n. Podejscie 2 - Sortowanie + Two Pointers: posortuj tablice (tracac oryginalne indeksy, wiec save pary [wartosc, indeks]). Two Pointers: left=0, right=n-1. Sum < target -> left++. Sum > target -> right--. Sum == target -> return [arr[left][1], arr[right][1]]. O(n log n) time (sortowanie dominuje), O(n) space (sortowanie + zapisanie indeksow). Podejscie 3 - Hash Map: jeden przejazd. Dla kazdego nums[i] sprawdz czy (target - nums[i]) jest w mapie. Jesli tak - zwroc [map.get(complement), i]. Jesli nie - dodaj nums[i] -> i do mapy. O(n) time, O(n) space. Optymalne dla oryginalnego Two Sum gdzie potrzebujemy indeksy. Podejscie 2 byloby optymalne gdybysmy mogli zwrocic wartosci (nie indeksy) i tablica jest juz posortowana.',
              points: 3,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 7,
              prompt: 'Rekruter: "Masz problem: obrocic tablice o k pozycji w prawo in-place, O(1) space. Np. [1,2,3,4,5], k=2 -> [4,5,1,2,3]. Jaka technika?"',
              tagSlugs: ['array', 'quiz', 'mock-interview', 'intermediate'],
              choices: [
                'Skopiuj do nowej tablicy i przepisz z przesuniciem',
                'Trzy reversale: cala tablica, pierwszych k elementow, ostatnich n-k elementow',
                'Cykliczne przesuniecie po jednym elemencie k razy',
                'Sortowanie z modulo'
              ],
              correctAnswer: 'Trzy reversale: cala tablica, pierwszych k elementow, ostatnich n-k elementow',
              solution: 'Algorytm trzech reversali: [1,2,3,4,5], k=2. Krok 1: odwroc cala -> [5,4,3,2,1]. Krok 2: odwroc pierwsze k=2 elementy -> [4,5,3,2,1]. Krok 3: odwroc ostatnie n-k=3 elementy -> [4,5,1,2,3]. Gotowe! Dlaczego dziala: reversal to elegancka manipulacja indeksami. Kazdy reversal to O(n/2) zamian. Lacznie O(n) time, O(1) space - idealnie in-place. To klasyczny "trick" czesto pytany wlasnie dla sprawdzenia znajomosci tego wzorca.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 8,
              prompt: 'Rekruter: "Finalne pytanie: masz n par nawiasow. Wygeneruj wszystkie poprawne kombinacje (np. n=3 -> ["((()))","(()())","(())()","()(())","()()()"]). Opisz algorytm i zlozonosc."',
              tagSlugs: ['backtracking', 'quiz', 'mock-interview', 'intermediate'],
              solution: 'Algorytm Backtracking: generujemy string znak po znaku, sledzac open (liczba otwartych nawiasow) i close (liczba zamknietych). function generate(n) { const result = []; function bt(current, open, close) { if (current.length === 2*n) { result.push(current); return; } if (open < n) bt(current + "(", open+1, close); if (close < open) bt(current + ")", open, close+1); } bt("", 0, 0); return result; } Pruning: dodaj "(" tylko jezeli open < n. Dodaj ")" tylko jezeli close < open (nie mozna zamknac jesli nie ma co zamykac). Poprawnosc: kazda wygenerowana kombinacja jest poprawna (close nigdy nie wyprzedza open). Zlozonosc: O(4^n / sqrt(n)) - liczba poprawnych kombinacji (liczby Catalana). Space: O(n) dla stosu rekurencji. Ta zlozonosc jest akceptowalna odpowiedzia - dokładny wzor jest trudny.',
              points: 3,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 9,
              prompt: 'Rekruter: "Ostatnie pytanie. Masz posortowana tablice i chcesz policzyc ile par (i,j) spelnia nums[i] + nums[j] == target (i != j). Jaka jest optymalna zlozonosc?"',
              tagSlugs: ['two-pointers', 'array', 'quiz', 'mock-interview'],
              choices: [
                'O(n^2) - brute force wszystkich par',
                'O(n log n) - binary search dla kazdego elementu',
                'O(n) - Two Pointers z obsluga duplikatow',
                'O(1) - formula matematyczna'
              ],
              correctAnswer: 'O(n) - Two Pointers z obsluga duplikatow',
              solution: 'Two Pointers na posortowanej: left=0, right=n-1. Gdy nums[left]+nums[right] == target: policz duplikaty po obu stronach. Jezeli nums[left] != nums[right]: countL = ile nums[left], countR = ile nums[right], dodaj countL * countR par, przesuń left za wszystkie countL, right przed wszystkie countR. Jezeli nums[left] == nums[right]: mamy k elementow tej samej wartosci, par = k*(k-1)/2, break. O(n) time, O(1) space. Bez obslug duplikatow proste Two Pointers jest O(n) dla unikalnych wartosci.',
              points: 1,
              isPublished: false
            }
          ]
        }
      ]
    }
  ]
};
