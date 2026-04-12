// data/courses/dsa-course.js
// MODUL 1: Big O Notation & Complexity Analysis
// MODUL 2: Podstawowe Struktury Danych

module.exports = {
  subject: {
    name: 'Computer Science & Algorytmy',
    slug: 'computer-science-algorytmy'
  },

  course: {
    title: 'DSA & Algorytmy: Kompletne Przygotowanie do Rozmów Kwalifikacyjnych (Junior SWE)',
    slug: 'dsa-interview-prep-junior',
    description: 'Kompleksowy kurs przygotowujacy do technicznych rozmow kwalifikacyjnych na stanowisko Junior Software Engineer. Opanujesz Big O Notation, kluczowe struktury danych, algorytmy sortowania i wyszukiwania, drzewa, grafy oraz programowanie dynamiczne - dokladnie to, czego szukaja rekruterzy w 2025 roku.',
    level: 'BEGINNER',
    isPublished: false
  },

  modules: [
    // =========================================================
    // MODUL 1: Big O Notation & Complexity Analysis
    // =========================================================
    {
      title: 'Modul 1: Big O Notation i Analiza Zlozonosci',
      order: 1,
      isPublished: false,

      lessons: [
        // -------------------------------------------------------
        // LEKCJA 1.1
        // -------------------------------------------------------
        {
          title: 'Lekcja 1.1: Czym jest Big O i dlaczego rekruterzy o to pytaja',
          order: 1,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Wyobraz sobie, ze masz dwie funkcje, ktore robia to samo - obie znajduja element w liscie. Jedna dziala swietnie przy 10 elementach, ale przy milionach danych "wisie" na 30 sekund. Druga jest szybka niezaleznie od rozmiaru danych. Jak rozmawiamy o tej roznicy w sposob precyzyjny i niezalezny od konkretnego sprzetu? Wlasnie do tego sluzy **notacja Big O** - to wspolny jezyk inzynierow do opisywania wydajnosci algorytmow.'
            },
            {
              blockType: 'text',
              content: '**Big O Notation** (czytaj: "big oh") to matematyczny sposob opisu tego, jak czas dzialania lub zuzycie pamieci algorytmu rosnie wraz ze wzrostem rozmiaru danych wejsciowych. Kluczowe slowo to **rosnie** - nie interesuje nas dokladna liczba operacji, ale **tempo wzrostu**. Jezeli algorytm robi 3n + 5 operacji dla n elementow, piszemy O(n), bo stale (3 i 5) staja sie nieistotne przy duzym n. Big O zawsze opisuje **najgorszy mozliwy przypadek** (worst case), chyba ze wyraznie zaznaczono inaczej.'
            },
            {
              blockType: 'callout',
              variant: 'info',
              title: 'Dlaczego to wazne na rozmowie?',
              content: 'Praktycznie kazde pytanie algorytmiczne na rozmowie kwalifikacyjnej konczy sie pytaniem: "Jaka jest zlozonosc czasowa i pamieciowa Twojego rozwiazania?" Nieznajomsc Big O to natychmiastowa dyskwalifikacja, nawet jezeli napisales poprawny kod. Rekruterzy z Google, Microsoft i Meta traktuja to jako absolutne minimum wiedzy.'
            },
            {
              blockType: 'text',
              content: 'Rozmawiajac o zlozonosci, uzywamy zmiennej **n**, ktora oznacza rozmiar danych wejsciowych. Dla tablicy n to liczba elementow. Dla stringa n to liczba znakow. Dla grafu n to liczba wezlow (a m to liczba krawedzi). Wazne jest, zeby zawsze **zdefiniowac co oznacza n** w kontekscie danego problemu - to pokazuje rekruterowi, ze rozumiesz problem dokladnie.'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Wykres porownujacy tempo wzrostu roznych klas zlozonosci: O(1) - pozioma linia, O(log n) - bardzo lagodna krzywa, O(n) - linia prosta, O(n log n) - lekko wygiety, O(n^2) - gwaltownie rosnaca parabola, O(2^n) - eksponencjalny wzrost. Os X: rozmiar danych wejsciowych (n). Os Y: liczba operacji / czas wykonania. Kazda linia w innym kolorze z etykieta. Wykres pokazuje dramatyczna roznice miedzy O(n^2) i O(log n) przy duzych n.',
              align: 'center',
              width: 'lg'
            },
            {
              blockType: 'table',
              caption: 'Klasy zlozonosci od najszybszej do najwolniejszej',
              hasHeaders: true,
              headers: ['Notacja', 'Nazwa', 'Przyklad', 'n=1000 operacji'],
              rows: [
                ['O(1)', 'Stala', 'Dostep do elementu tablicy po indeksie', '1'],
                ['O(log n)', 'Logarytmiczna', 'Binary Search', '~10'],
                ['O(n)', 'Liniowa', 'Przeszukiwanie liniowe', '1 000'],
                ['O(n log n)', 'Liniowo-logarytmiczna', 'Merge Sort, Quick Sort', '~10 000'],
                ['O(n^2)', 'Kwadratowa', 'Bubble Sort, zagniezdzone petle', '1 000 000'],
                ['O(2^n)', 'Eksponencjalna', 'Rekurencja bez memoizacji', 'Ogromna'],
                ['O(n!)', 'Silniowa', 'Brute force permutacji', 'Nieobliczalna']
              ]
            },
            {
              blockType: 'text',
              content: 'Jak czytac zlozonosc kodu? Prosta regula: **jedna petla = O(n)**, **dwie zagniezdzone petle = O(n^2)**, **dzielenie na pol w petli = O(log n)**. Operacje nastepujace po sobie (nie zagniezdzone) sie sumuja: O(n) + O(n) = O(2n) = O(n). Operacje zagniezdzone sie mnozy: petla O(n) wewnatrz petli O(n) = O(n * n) = O(n^2). Zawsze ignoruj stale i mniejsze czlony: O(3n^2 + 5n + 100) = O(n^2).'
            },
            {
              blockType: 'callout',
              variant: 'tip',
              title: 'Trik na rozmowie: mysl o "co sie stanie, gdy n bedzie bardzo duze?"',
              content: 'Jesli nie jestes pewny zlozonosci, zapytaj siebie: "Co sie stanie z moim algorytmem, gdy n wzrosnie z 1000 do 1 000 000?" Jesli czas wzrosnie 1000x - to O(n). Jesli wzrosnie milion razy - to O(n^2). Jesli prawie sie nie zmieni - to O(log n) lub O(1). To prosty sposob na sprawdzenie swojej intuicji.'
            },
            {
              blockType: 'text',
              content: 'Wazna roznica: Big O (worst case), Theta (average case), Omega (best case). Na rozmowach prawie zawsze mowimy o **worst case** (Big O), chyba ze rekruter wprost zapyta o average. Dla Bubble Sort: najlepszy przypadek to O(n) (juz posortowane), ale worst case to O(n^2) - i o tym bedziemy mowic. Rozumienie tej roznicy pokazuje dojrzalosc techniczna.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Jaka jest zlozonosc czasowa nastepujacego kodu?\n\nfor (int i = 0; i < n; i++) {\n    for (int j = 0; j < n; j++) {\n        System.out.println(i + j);\n    }\n}',
              tagSlugs: ['big-o', 'time-complexity', 'beginner'],
              choices: [
                'O(n)',
                'O(n^2)',
                'O(2n)',
                'O(log n)'
              ],
              correctAnswer: 'O(n^2)',
              solution: 'Dwie zagniezdzone petle, kazda iterujaca n razy, daja n * n = n^2 operacji. To klasyczny przyklad zlozonosci kwadratowej. Stala przy n^2 jest pomijana w notacji Big O.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'Masz algorytm o zlozonosci O(3n^2 + 5n + 100). Jaki jest jego Big O?',
              tagSlugs: ['big-o', 'complexity-analysis', 'beginner'],
              choices: [
                'O(3n^2 + 5n + 100)',
                'O(n^2 + n)',
                'O(n^2)',
                'O(n)'
              ],
              correctAnswer: 'O(n^2)',
              solution: 'W notacji Big O ignorujemy stale (3, 5, 100) i zachowujemy tylko najszybciej rosnacy skladnik. Przy duzym n, czlon 3n^2 dominuje nad 5n i 100. Dlatego O(3n^2 + 5n + 100) = O(n^2).',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'Big O Notation zawsze opisuje najgorszy mozliwy przypadek (worst case) wykonania algorytmu.',
              tagSlugs: ['big-o', 'beginner'],
              correctAnswer: 'true',
              solution: 'Prawda. Big O (notacja "big oh") z definicji opisuje gorny kres zlozonosci, czyli worst case. Istnieja tez Omega (dolny kres, best case) i Theta (tight bound, average case), ale na rozmowach dominuje Big O jako miara worst case.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 4,
              prompt: 'Ktora operacja ma zlozonosc O(1)?',
              tagSlugs: ['big-o', 'beginner'],
              choices: [
                'Przeszukanie tablicy w celu znalezienia maksimum',
                'Posortowanie tablicy algorytmem Merge Sort',
                'Dostep do elementu tablicy po indeksie: arr[5]',
                'Wypisanie wszystkich elementow tablicy'
              ],
              correctAnswer: 'Dostep do elementu tablicy po indeksie: arr[5]',
              solution: 'Dostep do elementu tablicy po indeksie to operacja stala O(1) - niezaleznie od rozmiaru tablicy, zawsze zajmuje tyle samo czasu. Tablica jest przechowywana w pamieci jako ciagly blok, wiec obliczenie adresu dowolnego elementu to jedno dodawanie (adres_bazowy + indeks * rozmiar_typu).',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 5,
              prompt: 'Wytlumacz roznice miedzy zlozonoscia O(n log n) a O(n^2). Dlaczego ma to znaczenie w praktyce? Podaj przykladowe algorytmy dla obu klas.',
              tagSlugs: ['big-o', 'complexity-analysis', 'intermediate'],
              solution: 'O(n log n) rosnie znacznie wolniej niz O(n^2). Dla n = 1000: O(n log n) to okolo 10 000 operacji, O(n^2) to 1 000 000 operacji - roznca 100x. Dla n = 1 000 000 roznica jest jeszcze dramatyczniejsza. W praktyce: O(n^2) jest akceptowalne tylko dla malych danych (n < kilka tysiecy). Dla duzych zbiorow danych zawsze wybieramy O(n log n). Przykladowe algorytmy: O(n log n) - Merge Sort, Quick Sort (average case), Heap Sort. O(n^2) - Bubble Sort, Insertion Sort, Selection Sort.',
              points: 2,
              isPublished: false
            }
          ]
        },

        // -------------------------------------------------------
        // LEKCJA 1.2
        // -------------------------------------------------------
        {
          title: 'Lekcja 1.2: Time Complexity vs Space Complexity',
          order: 2,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Kazdy algorytm ma dwa wymiary wydajnosci: **czas** (ile operacji wykonuje) i **pamiec** (ile dodatkowej pamieci potrzebuje). Mozesz miec algorytm super szybki, ale zjadajacy gigabajty pamieci - lub wolniejszy, ale dzialajacy na microcontrollerze z 4KB RAM. **Space Complexity** (zlozonosc pamieciowa) mierzy ilosc **dodatkowej** pamieci uzytej przez algorytm, nie liczac rozmiaru danych wejsciowych. To, ile nowej pamieci tworzymy w trakcie dzialania.'
            },
            {
              blockType: 'text',
              content: 'Wazna terminologia: **auxiliary space** to pamiec uzywana tylko przez algorytm (np. zmienne pomocnicze, rekurencyjny stos wywolan), bez uwzglednienia danych wejsciowych. **Space complexity** czesto uwzglednia i dane wejsciowe, i pamiec pomocnicza. Na rozmowach najczesciej pytamy o **auxiliary space** - ile *ekstra* pamieci potrzebuje Twoj algorytm ponad dane wejsciowe. Jezeli rekruter nie sprecyzuje, pytaj - to pokazuje dokladnosc myslenia.'
            },
            {
              blockType: 'text',
              content: 'Przyklad: algorytm sortowania **Bubble Sort** dziala w miejscu (in-place). Zmienia kolejnosc elementow w oryginalnej tablicy, uzywajac tylko jednej zmiennej pomocniczej do zamiany. Jego space complexity to **O(1)** - staly zuzycie pamieci niezaleznie od n. Natomiast **Merge Sort** tworzy nowe tablice podczas scalania - potrzebuje O(n) dodatkowej pamieci. Szybszy algorytm (Merge Sort, O(n log n)) kosztuje nas wiecej pamieci niz wolniejszy (Bubble Sort, O(n^2)).'
            },
            {
              blockType: 'callout',
              variant: 'info',
              title: 'Rekurencja i stack space',
              content: 'Uwazaj na rekurencje! Kazde wywolanie rekurencyjne zajmuje miejsce na stosie wywolan (call stack). Jesli rekurencja ma glebokosci n (np. rekurencyjny DFS na liscie), space complexity to O(n) - nawet jezeli nie tworzysz zadnych nowych struktur danych. To czesto przeoczany aspekt na rozmowach.'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Diagram ilustrujacy trade-off miedzy czasem a pamiecia. Dwie osie: os X to Space Complexity (od O(1) do O(n)), os Y to Time Complexity (od O(n log n) do O(n^2)). Zaznaczone punkty: Merge Sort (szybki, duzo pamieci), Bubble Sort (wolny, mala pamiec), Quick Sort (szybki, mala pamiec). Strzalka i opis "sweet spot" przy Quick Sort. Wizualnie pokazuje klasyczny trade-off: szybkosc vs pamiec.',
              align: 'center',
              width: 'md'
            },
            {
              blockType: 'table',
              caption: 'Space Complexity popularnych algorytmow i struktur',
              hasHeaders: true,
              headers: ['Algorytm / Struktura', 'Space Complexity', 'Uwagi'],
              rows: [
                ['Bubble Sort', 'O(1)', 'In-place, tylko jedna zmienna pomocnicza'],
                ['Merge Sort', 'O(n)', 'Tworzy nowe tablice podczas scalania'],
                ['Quick Sort', 'O(log n)', 'Rekurencja, stos wywolan'],
                ['BFS (grafy)', 'O(n)', 'Kolejka moze zawierac wszystkie wezly'],
                ['DFS (grafy)', 'O(h)', 'h = glebokosc rekurencji / stosu'],
                ['Hash Table', 'O(n)', 'Przechowuje n par klucz-wartosc'],
                ['Binary Search', 'O(1)', 'Iteracyjnie; O(log n) rekurencyjnie']
              ]
            },
            {
              blockType: 'text',
              content: 'Na rozmowie rekruter moze zapytac: "Czy mozesz zoptymalizowac space complexity tego rozwiazania?" To pytanie o trade-off. Czesto mozemy zamienic pamiec na czas: algorytm O(n) pamiec + O(n) czas mozemy zamienic na O(1) pamiec + O(n^2) czas. Nie ma jednej dobrej odpowiedzi - zalezy od kontekstu: czy mamy ograniczona pamiec, czy priorytetem jest szybkosc. Pokazanie ze rozumiesz ten trade-off to duzy plus.'
            },
            {
              blockType: 'callout',
              variant: 'tip',
              title: 'Jak mowic o space complexity na rozmowie',
              content: 'Zawsze podawaj OBA: time complexity i space complexity. Format: "Moje rozwiazanie ma time complexity O(n log n) i space complexity O(n) ze wzgledu na dodatkowa tablice uzywana podczas scalania." Jezeli zapomnisz o space - rekruter zapyta. Lepiej powiedziec samemu - pokaze to proaktywne myslenie.'
            },
            {
              blockType: 'text',
              content: 'Specjalny przypadek: **O(1) space** to "in-place". Algorytm in-place modyfikuje dane bezposrednio bez tworzenia kopii. Przykladem jest Two Pointers na tablicy - tylko dwa wskazniki (zmienne int), wiec O(1). Na rozmowie jezeli rekruter pyta "czy mozesz to zrobic in-place?" - pyta czy mozesz rozwiazac problem w O(1) space. To czesty pattern w pytaniach o reversal string, rotate array, i podobnych.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Jaka jest space complexity Merge Sort?',
              tagSlugs: ['space-complexity', 'merge-sort', 'beginner'],
              choices: [
                'O(1)',
                'O(log n)',
                'O(n)',
                'O(n^2)'
              ],
              correctAnswer: 'O(n)',
              solution: 'Merge Sort wymaga O(n) dodatkowej pamieci, poniewaz podczas operacji scalania (merge) tworzy nowe tymczasowe tablice. Mimo ze jest szybszy niz O(n^2) algorytmy pod wzgledem czasu, placi za to pamiecią.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'Rekurencja zawsze ma space complexity O(1), poniewaz nie tworzy nowych struktur danych.',
              tagSlugs: ['space-complexity', 'rekurencja', 'gotchas', 'beginner'],
              correctAnswer: 'false',
              solution: 'Falsz. Kazde wywolanie rekurencyjne zajmuje miejsce na stosie wywolan (call stack). Rekurencja o glebokosci n ma space complexity O(n) ze wzgledu na stos wywolan, nawet jesli nie tworzy zadnych dodatkowych struktur danych.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'Ktory algorytm dziala "in-place" (space complexity O(1))?',
              tagSlugs: ['space-complexity', 'beginner'],
              choices: [
                'Merge Sort',
                'Bubble Sort',
                'Rekurencyjny DFS',
                'BFS z kolejka'
              ],
              correctAnswer: 'Bubble Sort',
              solution: 'Bubble Sort jest algorytmem in-place - zamienia elementy bezposrednio w oryginalnej tablicy, uzywajac tylko jednej zmiennej pomocniczej do zamiany (swap). Merge Sort potrzebuje O(n) dodatkowej pamieci, DFS i BFS potrzebuja pamieci na stos/kolejke.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Wyjasnij pojecie "trade-off miedzy czasem a pamiecia" (time-space trade-off). Podaj konkretny przyklad algorytmu lub techniki, ktora swiadomie wymienia pamiec na szybkosc.',
              tagSlugs: ['time-complexity', 'space-complexity', 'intermediate'],
              solution: 'Time-space trade-off oznacza, ze czesto mozemy przyspieszyc algorytm kosztem wiekszego zuzycia pamieci (lub odwrotnie). Klasyczny przyklad: Memoization w Dynamic Programming - zapamietujemy wyniki podproblemow w tablicy/mapie (zuzycie O(n) lub O(n^2) pamieci), dzieki czemu eliminujemy wielokrotne przeliczanie tych samych wynikow (przyspieszenie z O(2^n) do O(n)). Inny przyklad: Hash Table - przechowujemy wszystkie dane w pamieci O(n), ale dzieki temu wyszukiwanie jest O(1) zamiast O(n). Wybor zalezy od kontekstu: ograniczona pamiec (embedded systems) vs priorytet szybkosci (serwery z duza RAM).',
              points: 2,
              isPublished: false
            }
          ]
        },

        // -------------------------------------------------------
        // LEKCJA 1.3
        // -------------------------------------------------------
        {
          title: 'Lekcja 1.3: Analiza Zlozonosci Kodu - czytaj jak rekruter',
          order: 3,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Analiza zlozonosci kodu to umiejetnosc, ktora mozna cwicyc do perfekcji. Zamiast zgadywac, mozna stosowac **mechaniczne reguly**, ktore daja poprawny wynik prawie zawsze. W tej lekcji nauczysz sie czytac dowolny fragment kodu i natychmiast okreslac jego Big O - tak samo jak robi to doswiadczony inzynier na code review lub rekruter na rozmowie.'
            },
            {
              blockType: 'text',
              content: '**Regula 1: Operacje nastepujace po sobie sie sumuja.** Masz blok A o zlozonosci O(n) i potem blok B o zlozonosci O(n^2)? Suma to O(n + n^2) = O(n^2). Zachowujesz **dominujacy skladnik**. Przyklad: przeszukanie tablicy (O(n)) a potem zagniezdzone petle (O(n^2)) = O(n^2). Jezeli drugi blok dominuje, mozesz zignorowac pierwszy przy zapisie Big O.'
            },
            {
              blockType: 'text',
              content: '**Regula 2: Operacje zagniezdzone sie mnozy.** Petla O(n) wewnatrz petli O(n) = O(n^2). Petla O(n) wewnatrz petli O(m) = O(n*m) - jesli n i m sa niezalezne, nie mozesz ich uproscic! Przyklad: iterujesz po tablicy A dlugosci n, a dla kazdego elementu iterujesz po tablicy B dlugosci m - zlozonosc to O(n*m).'
            },
            {
              blockType: 'text',
              content: '**Regula 3: Redukcja o polowe = O(log n).** Zawsze gdy algorytm w petli lub rekurencji dzieli przestrzen poszukiwan przez stala (najczesciej 2), masz O(log n). Binary Search: zaczyna od n elementow, potem n/2, n/4, n/8... po log2(n) krokach dochodzi do 1. Podobnie dziala wyszukiwanie w drzewie BST (w srednim przypadku). Jesli widzisz "dziel na pol" - mysl logarytm.'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Schemat regul analizy Big O z przykladami kodu. Trzy panele: 1) Sekwencja - dwa bloki kodu jeden po drugim, strzalka pokazujaca sumowanie zlozonosci, wynik O(max(A,B)). 2) Zagniezdzone petle - zewnetrzna petla O(n) zawiera wewnetrzna petle O(n), wynik O(n^2). 3) Dzielenie na pol - petla ze zmiennym i=i*2 lub i=i/2, strzalka i opis "log n krokow". Kazdy panel z innym kolorem tla dla lepszej czytelnosci.',
              align: 'center',
              width: 'lg'
            },
            {
              blockType: 'text',
              content: 'Przykladowa analiza krok po kroku:\n\n```\nfunction example(arr) {\n  let max = arr[0];           // O(1)\n  for (let i of arr) {        // O(n)\n    if (i > max) max = i;     //   O(1) wewnatrz\n  }                           // Lacznie: O(n)\n  arr.sort();                 // O(n log n)\n  for (let i of arr) {        // O(n)\n    for (let j of arr) {      // O(n)\n      console.log(i,j);       //   O(1) wewnatrz\n    }                         // Lacznie: O(n^2)\n  }\n}\n```\nCalkowita zlozonosc: O(1) + O(n) + O(n log n) + O(n^2) = **O(n^2)** (dominujacy skladnik).'
            },
            {
              blockType: 'callout',
              variant: 'warning',
              title: 'Czeste pulapki w analizie zlozonosci',
              content: 'Uwazaj na wbudowane metody jezyka! W JavaScript: arr.sort() to O(n log n), nie O(1). arr.includes() to O(n), nie O(1). arr.splice() to O(n) ze wzgledu na przesuwanie elementow. W Pythonie: "in" dla listy to O(n), ale "in" dla setu to O(1). Rekruter moze zapytac o zlozonosc kodu z uzyciem tych metod - musisz znac ich zlozonosc!'
            },
            {
              blockType: 'text',
              content: 'Specjalny przypadek: **amortyzowana zlozonosc** (amortized complexity). Dynamic Array (np. ArrayList w Javie, list w Pythonie) ma operacje push/append O(1) amortyzowane. Dlaczego? Czasami tablica musi sie "rozszerzyc" (skopiowac wszystkie elementy) - ta operacja to O(n). Ale dzieje sie rzadko i "rozklada sie" na wiele operacji, wiec srednio to O(1). Na rozmowie mozna spotkac pytanie o amortyzowana zlozonosc - warto zrozumiec ten koncept.'
            },
            {
              blockType: 'callout',
              variant: 'tip',
              title: 'Cwicz analise na LeetCode',
              content: 'Po kazdym zadaniu na LeetCode, zanim spojrzysz na editorial, zapisz na kartce: 1) Time complexity mojego rozwiazania i dlaczego. 2) Space complexity i dlaczego. Potem porownaj z editorialem. Ta praktyka buduje intuicje szybciej niz jakakolwiek inna metoda nauki.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Jaka jest time complexity tego kodu?\n\nfor (let i = 1; i <= n; i *= 2) {\n  console.log(i);\n}',
              tagSlugs: ['big-o', 'time-complexity', 'beginner'],
              choices: [
                'O(n)',
                'O(n^2)',
                'O(log n)',
                'O(1)'
              ],
              correctAnswer: 'O(log n)',
              solution: 'Petla mnozy i przez 2 w kazdej iteracji (i = 1, 2, 4, 8, 16...). Pyta "ile razy mozna pomnozyc 1 przez 2 zanim przekroczysz n?" - to log2(n) razy. Dlatego zlozonosc to O(log n). Kluczowy sygnal: gdy indeks petli jest mnozony lub dzielony przez stala, myslimy logarytm.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'Co jest zlozonoscia metody .sort() w JavaScript (V8 engine)?',
              tagSlugs: ['big-o', 'gotchas', 'intermediate'],
              choices: [
                'O(n)',
                'O(n^2)',
                'O(n log n)',
                'O(1)'
              ],
              correctAnswer: 'O(n log n)',
              solution: 'JavaScript Array.sort() uzywa TimSort (hybryda Merge Sort i Insertion Sort), ktory ma zlozonosc O(n log n) w worst i average case. To wazne na rozmowach - uzycie .sort() w petli O(n) daje O(n^2 log n), nie O(n^2)!',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'Nastepujacy kod ma zlozonosc O(n^2):\n\nfor (let i = 0; i < n; i++) {\n  console.log(i);\n}\nfor (let j = 0; j < n; j++) {\n  console.log(j);\n}',
              tagSlugs: ['big-o', 'time-complexity', 'beginner'],
              correctAnswer: 'false',
              solution: 'Falsz. Dwie petle nastepujace PO SOBIE (nie zagniezdzone) sie sumuja: O(n) + O(n) = O(2n) = O(n). Zagniezdzone petle (jedna wewnatrz drugiej) daja O(n^2). Kluczowa roznica: sekwencja vs zagniezdnienie.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 4,
              prompt: 'Masz tablice rozmiaru n i m (n != m). Iterujesz po kazdym elemencie tablicy n, a dla kazdego elementu iterujesz po calej tablicy m. Jaka jest zlozonosc?',
              tagSlugs: ['big-o', 'time-complexity', 'intermediate'],
              choices: [
                'O(n^2)',
                'O(n + m)',
                'O(n * m)',
                'O(max(n, m))'
              ],
              correctAnswer: 'O(n * m)',
              solution: 'Gdy dwie petle iteruja po roznych danych (n i m), zlozonosc to O(n * m). NIE mozna uproscic do O(n^2), bo n i m sa niezalezne i moga miec rozne wartosci. O(n^2) jest tylko specjalnym przypadkiem gdy n = m.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 5,
              prompt: 'Przeanalizuj zlozonosc czasowa i pamieciowa nastepujacego kodu i uzasadnij odpowiedz:\n\nfunction findDuplicates(arr) {\n  const seen = new Set();\n  const result = [];\n  for (let num of arr) {\n    if (seen.has(num)) {\n      result.push(num);\n    } else {\n      seen.add(num);\n    }\n  }\n  return result;\n}',
              tagSlugs: ['big-o', 'hash-table', 'intermediate'],
              solution: 'Time complexity: O(n) - iterujemy po tablicy raz (jedna petla). Operacje Set.has() i Set.add() sa O(1) srednio (hash table pod spodem). Wiec n elementow * O(1) = O(n). Space complexity: O(n) - w najgorszym przypadku (brak duplikatow) Set przechowuje wszystkie n elementow. Tablica result moze tez przechowac do n/2 elementow (jezeli polowa to duplikaty). Lacznie O(n) space complexity.',
              points: 3,
              isPublished: false
            }
          ]
        }
      ]
    },

    // =========================================================
    // MODUL 2: Podstawowe Struktury Danych
    // =========================================================
    {
      title: 'Modul 2: Podstawowe Struktury Danych',
      order: 2,
      isPublished: false,

      lessons: [
        // -------------------------------------------------------
        // LEKCJA 2.1
        // -------------------------------------------------------
        {
          title: 'Lekcja 2.1: Arrays i Dynamic Arrays',
          order: 1,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Tablica (Array) to fundamentalna struktura danych - podstawa wszystkiego innego. To **ciagly blok pamieci** przechowujacy elementy tego samego typu, jeden za drugim. Jezeli tablica zaczyna sie pod adresem 1000, a kazdy int to 4 bajty, to element [0] jest pod 1000, [1] pod 1004, [2] pod 1008 itd. Dzieki tej regularnosci dostep do dowolnego elementu po indeksie jest natychmiastowy - O(1). To największa sila tablicy.'
            },
            {
              blockType: 'text',
              content: 'Tablice statyczne (jak int[] w Javie lub int arr[10] w C) maja **staly rozmiar** - musisz zadeklarowac go z gory. Tablice dynamiczne (ArrayList w Javie, list w Pythonie, Vec w Rust, std::vector w C++) **automatycznie rosna** gdy dodajesz elementy. Jak to dziala? Gdy tablica sie zapelni, alokowana jest nowa, wieksza tablica (zazwyczaj 2x wieksza), wszystkie elementy sa kopiowane, a stara tablica jest zwalniana. Ta operacja kopiowania to O(n), ale zdarza sie rzadko - srednio push to O(1) amortyzowane.'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Diagram pamieci tablicy. Pokazuje ciagly blok pamieci z adresami (0x1000, 0x1004, 0x1008...) i wartosciami (42, 15, 8, 23). Strzalka od "arr[2]" do wartosci 8 z podpisem "O(1) access". Pod spodem drugi diagram pokazujacy resizing tablicy dynamicznej: stara tablica (4 elementy, pelna), strzalka "x2 rozmiar", nowa tablica (8 miejsc, 4 elementy skopiowane + nowe miejsce). Etykiety: "stary rozmiar" i "nowy rozmiar".',
              align: 'center',
              width: 'lg'
            },
            {
              blockType: 'table',
              caption: 'Operacje na tablicy - zlozonosci czasowe',
              hasHeaders: true,
              headers: ['Operacja', 'Zlozonosc', 'Wyjasnienie'],
              rows: [
                ['Dostep [i]', 'O(1)', 'Bezposredni obliczony adres pamieci'],
                ['Wyszukiwanie (unsorted)', 'O(n)', 'Trzeba sprawdzic kazdy element'],
                ['Wyszukiwanie (sorted)', 'O(log n)', 'Mozna uzyc Binary Search'],
                ['Wstawianie na koniec', 'O(1) amort.', 'Czasem O(n) przy resizing'],
                ['Wstawianie w srodku', 'O(n)', 'Trzeba przesunac elementy'],
                ['Usuwanie z konca', 'O(1)', 'Tylko zmniejsz licznik'],
                ['Usuwanie ze srodka', 'O(n)', 'Trzeba przesunac elementy']
              ]
            },
            {
              blockType: 'text',
              content: 'Kluczowe wzorce tablicowe na rozmowach:\n\n**Two Pointers**: Dwa wskazniki (lewy i prawy) poruszajace sie ku sobie lub w tym samym kierunku. Uzywane do: reversal, palindrome check, two sum (na posortowanej), usuwania duplikatow.\n\n**Sliding Window**: "Okno" stalej lub zmiennej szerokosci przesuwa sie po tablicy. Uzywane do: maximum subarray, longest substring bez powtorzen, minimum sum subarray.\n\n**Prefix Sum**: Tablica prefixSum[i] = suma arr[0..i]. Pozwala na O(1) zapytania o sume dowolnego zakresu.'
            },
            {
              blockType: 'text',
              content: 'Wazna technika: **"trick z modulo"** do cyklicznych tablic. Jezeli chcesz iterowoac po tablicy cyklicznie (gdy dojdziesz do konca, wracasz na poczatek), uzywaj `index % n`. Przyklad: indeksy 0, 1, 2, 3, 4, 0, 1, 2... dla tablicy rozmiaru 5 mozna generowac jako `i % 5` dla i = 0, 1, 2, 3, 4, 5, 6, 7...'
            },
            {
              blockType: 'callout',
              variant: 'warning',
              title: 'Czesty blad: off-by-one errors',
              content: 'Najczestszy blad przy tablicach to "off by one" - iteracja poza zakresem lub zatrzymanie sie o jeden za wczesnie. Zanim zaczniesz pisac petle, wypisz na kartce: czy warunek powinien byc i < n czy i <= n? Czy startuje od 0 czy od 1? Przetestuj mentalnie na malym przykladzie (n=3) zanim zaczniesz kodowac.'
            },
            {
              blockType: 'text',
              content: 'Czeste pytania o tablice na rozmowach:\n\n- Two Sum (znajdz dwa elementy sumujace sie do targetu)\n- Maximum Subarray (Kadane\'s Algorithm)\n- Rotate Array (obroc tablice o k pozycji)\n- Find Missing Number (znajdz brakujacy liczbe w zakresie 1-n)\n- Best Time to Buy and Sell Stock (jeden przejazd, O(n))\n\nWszystkie te problemy rozwiazuje sie przy uzyciu jednego z wymienionych wyzej wzorcow. Rozpoznanie wzorca to polowa sukcesu.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Dlaczego dostep do elementu tablicy po indeksie (arr[i]) jest O(1)?',
              tagSlugs: ['array', 'big-o', 'beginner'],
              choices: [
                'Poniewaz tablica jest zawsze posortowana',
                'Poniewaz elementy sa przechowywane w ciagly bloku pamieci, wiec adres jest obliczany wzorem: adres_bazowy + i * rozmiar_elementu',
                'Poniewaz procesor specjalnie optymalizuje dostep do tablic',
                'Poniewaz indeks jest przechowywany razem z elementem'
              ],
              correctAnswer: 'Poniewaz elementy sa przechowywane w ciagly bloku pamieci, wiec adres jest obliczany wzorem: adres_bazowy + i * rozmiar_elementu',
              solution: 'Tablica to ciagly blok pamieci. Znajac adres poczatkowy i rozmiar jednego elementu, mozna natychmiast obliczyc adres dowolnego elementu: adres = adres_bazowy + i * rozmiar_elementu. To jedno dzialanie arytmetyczne - O(1), niezaleznie od rozmiaru tablicy.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'Jaka jest amortyzowana zlozonosc operacji push (dodania na koniec) do Dynamic Array (np. ArrayList, Python list)?',
              tagSlugs: ['array', 'big-o', 'intermediate'],
              choices: [
                'O(n) - zawsze trzeba kopiowac',
                'O(log n) - dzieki binarnym poszukiwaniom miejsca',
                'O(1) amortyzowane - czasem O(n) przy resizing, ale srednio O(1)',
                'O(n^2) - musi przesortowac po dodaniu'
              ],
              correctAnswer: 'O(1) amortyzowane - czasem O(n) przy resizing, ale srednio O(1)',
              solution: 'Dynamic Array podwaja swoj rozmiar gdy sie zapelni (operacja O(n)). Ale ta kosztowna operacja zdarza sie coraz rzadziej - po wstawieniu n elementow, nastepny resize skopiuje n elementow, ale potem mozna wstawic kolejne n elementow bez resizingu. Koszt n resizingow "amortyzuje" sie na n wstawien, dajac O(1) srednio.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'Wstawienie elementu w srodku tablicy (nie na koniec) ma zlozonosc O(1).',
              tagSlugs: ['array', 'big-o', 'beginner'],
              correctAnswer: 'false',
              solution: 'Falsz. Wstawienie elementu w srodku tablicy wymaga przesuniecia wszystkich elementow po nim o jedno miejsce w prawo. W najgorszym przypadku (wstawienie na poczatek) trzeba przesunac n elementow - O(n). Tylko wstawienie na koniec jest O(1) amortyzowane.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Wytlumacz wzorzec "Two Pointers" na tablicach. Jak dziala? Kiedy go uzyc? Podaj przyklad problemu, ktory rozwiazuje.',
              tagSlugs: ['array', 'two-pointers', 'wzorce-algorytmiczne', 'intermediate'],
              solution: 'Two Pointers uzywa dwoch zmiennych (wskaznikow) do przeszukiwania tablicy. Dwa warianty: 1) Opposite direction - lewy od 0, prawy od n-1, poruszaja sie ku sobie (dla: sprawdzenia palindromu, Two Sum na posortowanej tablicy, container with most water). 2) Same direction - obydwa startuja od 0, ale poruszaja sie rozna predkoscia (fast/slow pointers, usuwanie duplikatow z posortowanej tablicy). Przyklad Two Sum na posortowanej: lewy=0, prawy=n-1. Jezeli arr[lewy]+arr[prawy] == target, znalezlismy. Jezeli suma < target, lewy++. Jezeli suma > target, prawy--. O(n) zamiast O(n^2) brute force.',
              points: 2,
              isPublished: false
            }
          ]
        },

        // -------------------------------------------------------
        // LEKCJA 2.2
        // -------------------------------------------------------
        {
          title: 'Lekcja 2.2: Linked Lists - Singly i Doubly',
          order: 2,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Linked List (lista polaczona) to alternatywa dla tablicy, ktora rozwiazuje jeden problem: **wstawianie i usuwanie w srodku jest O(1)**, jezeli mamy juz wskaznik do odpowiedniego miejsca. Zamiast jednego ciagiego bloku pamieci, Linked List to lancuch **wezlow** (nodes), gdzie kazdy wezel zawiera: **dane** (wartosc) i **wskaznik** (pointer/reference) do nastepnego wezla. Wezly moga lezec w pamieci gdziekolwiek - nie musza byc obok siebie.'
            },
            {
              blockType: 'text',
              content: '**Singly Linked List**: Kazdy wezel ma jeden wskaznik - do nastepnego wezla. Mozna poruszac sie tylko do przodu (od head do tail). Ostatni wezel ma wskaznik null. Operacje: wstawianie na poczatek O(1), wstawianie na koniec O(n) (lub O(1) jesli mamy wskaznik tail), usuwanie danego wezla O(1) (jezeli mamy poprzednika). Przyklad struktury: `class Node { int val; Node next; }`'
            },
            {
              blockType: 'text',
              content: '**Doubly Linked List**: Kazdy wezel ma dwa wskazniki - do nastepnego i do poprzedniego wezla. Mozna poruszac sie w obu kierunkach. Latwiejsze usuwanie (nie potrzeba poprzednika), ale wieksza zajmuje pamiec (dwa wskazniki na wezel zamiast jednego). Uzywana w implementacjach: LRU Cache, Deque, historia przegladarki (cofnij/dalej). Przyklad: `class Node { int val; Node next; Node prev; }`'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Diagram Singly i Doubly Linked List. Gorna czesc: Singly Linked List - head wskazuje na Node1 (val=5) -> Node2 (val=8) -> Node3 (val=3) -> null. Dolna czesc: Doubly Linked List - null <- Node1 (val=5) <-> Node2 (val=8) <-> Node3 (val=3) -> null. Wskazniki next sa niebieskie, wskazniki prev sa czerwone. Head i tail sa wyraznie oznaczone.',
              align: 'center',
              width: 'lg'
            },
            {
              blockType: 'table',
              caption: 'Array vs Linked List - kiedy co wybrac?',
              hasHeaders: true,
              headers: ['Operacja', 'Array', 'Linked List', 'Kiedy wybrac LL?'],
              rows: [
                ['Dostep po indeksie', 'O(1)', 'O(n)', 'Nigdy, gdy potrzebny random access'],
                ['Wyszukiwanie', 'O(n) / O(log n)', 'O(n)', 'Nie ma przewagi'],
                ['Wstawianie na poczatek', 'O(n)', 'O(1)', 'Czesto dodajesz na poczatek'],
                ['Wstawianie w srodku', 'O(n)', 'O(1)*', 'Masz wskaznik do miejsca'],
                ['Usuwanie z poczatku', 'O(n)', 'O(1)', 'Czesto usuwasz z poczatku'],
                ['Pamiec', 'Ciagla, mniej', 'Rozproszona, wiecej', 'Gdy pamiec nie jest krytyczna']
              ]
            },
            {
              blockType: 'text',
              content: 'Kluczowe techniki na rozmowach dotyczace Linked List:\n\n1. **Runner Technique (Fast & Slow Pointers)**: Dwa wskazniki - slow (krok o 1) i fast (krok o 2). Gdy fast dojdzie do konca, slow jest w polowie. Uzywane do: wykrywania cyklu (Floyda Cycle Detection), znalezienia srodka listy, k-tego elementu od konca.\n\n2. **Dummy Node**: Tworzenie sztucznego wezla przed head upraszcza kod gdy head moze sie zmieniac. Zamiast obslugi specjalnego przypadku dla head, wszystko traktujemy tak samo.\n\n3. **In-place Reversal**: Odwracanie listy bez dodatkowej pamieci - trzy wskazniki (prev, curr, next).'
            },
            {
              blockType: 'callout',
              variant: 'warning',
              title: 'Najczestsze bledy przy Linked List na rozmowie',
              content: 'Sprawdzaj zawsze: 1) Czy lista jest pusta (head == null)? 2) Czy lista ma tylko jeden element? 3) Czy poprawnie aktualizujesz next przed przesuniciem wskaznika (stracisz referencje!)? 4) Czy na koncu wskazujesz null? Mentalnie przetestuj swoj kod na liscie o 0, 1 i 2 elementach przed powiedzeniem "gotowe".'
            },
            {
              blockType: 'text',
              content: 'Cykl Floyda (Floyd\'s Cycle Detection) - musisz to znac: Wskaznik **slow** przesuwa sie o 1 wezel na raz, wskaznik **fast** o 2 wezly. Jezeli lista ma cykl, fast w koncu "dogoni" slow (beda na tym samym wezle). Jezeli lista nie ma cyklu, fast dojdzie do null. Dlaczego to dziala? Gdy slow wejdzie do cyklu, fast juz w nim jest. Roznica ich predkosci to 1 wezel/krok - wiec fast "zmniejsza dystans" do slow o 1 przy kazdym kroku i w koncu sie spotkaja. Time: O(n), Space: O(1).'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Jaka jest zlozonosc dostep do k-tego elementu Linked List?',
              tagSlugs: ['linked-list', 'big-o', 'beginner'],
              choices: [
                'O(1) - jak w tablicy',
                'O(log n) - mozna uzyc binary search',
                'O(n) - trzeba przejsc od head',
                'O(k) - tylko do k-tego elementu'
              ],
              correctAnswer: 'O(n) - trzeba przejsc od head',
              solution: 'Linked List nie ma random access jak tablica. Aby dostac sie do k-tego elementu, musisz zaczac od head i przejsc przez kolejne wezly (next.next.next...) az dojdziesz do k-tego. W najgorszym przypadku to n krokow = O(n). Dlatego Linked List jest slaba gdy czesto potrzebujesz dostepu po indeksie.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'Doubly Linked List zawsze jest lepsza od Singly Linked List, bo mozna poruszac sie w obu kierunkach.',
              tagSlugs: ['linked-list', 'beginner'],
              correctAnswer: 'false',
              solution: 'Falsz. Doubly Linked List uzywa wiecej pamieci (dwa wskazniki na wezel zamiast jednego) i bardziej skomplikowane sa operacje wstawiania/usuwania (trzeba aktualizowac wiecej wskaznikow). Jezeli nie potrzebujesz przemieszczania sie wstecz, Singly LL jest prostszy i wydajniejszy pod wzgledem pamieci.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'Algorytm Floyda (Fast & Slow Pointers) wykrywa cykl w Linked List. Jaka jest jego space complexity?',
              tagSlugs: ['linked-list', 'fast-slow-pointers', 'intermediate'],
              choices: [
                'O(n) - przechowuje odwiedzone wezly w hash set',
                'O(log n) - binary search po wezlach',
                'O(1) - tylko dwa wskazniki',
                'O(n^2) - porownuje kazdy wezel z kazdym'
              ],
              correctAnswer: 'O(1) - tylko dwa wskazniki',
              solution: 'Algorytm Floyda uzywa tylko dwoch wskaznikow (slow i fast) - zadnych dodatkowych struktur danych, tablic ani zbiorow. Dlatego space complexity to O(1). Dla porownania, podejscie z hash set (zaznaczanie odwiedzonych wezlow) rozwiazuje ten sam problem ale w O(n) space.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Wytlumacz jak odwrocic Singly Linked List in-place (bez dodatkowej tablicy). Opisz algorytm krok po kroku i podaj jego zlozonosc.',
              tagSlugs: ['linked-list', 'intermediate'],
              solution: 'Algorytm: Uzywamy trzech wskaznikow: prev (null na poczatku), curr (head), next (null). Iterujemy: 1) Zapisujemy curr.next do zmiennej next (bo za chwile go nadpiszemy). 2) Odwracamy wskaznik: curr.next = prev. 3) Przesuwamy prev = curr. 4) Przesuwamy curr = next. Powtarzamy az curr == null. Na koncu prev wskazuje na nowy head. Time complexity: O(n) - jeden przejazd. Space complexity: O(1) - tylko trzy zmienne wskaznikowe, niezaleznie od dlugosci listy.',
              points: 2,
              isPublished: false
            }
          ]
        },

        // -------------------------------------------------------
        // LEKCJA 2.3
        // -------------------------------------------------------
        {
          title: 'Lekcja 2.3: Stacks i Queues - gdy kolejnosc ma znaczenie',
          order: 3,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: '**Stack** (stos) to struktura danych LIFO - Last In, First Out. Ostatni element dodany jako pierwszy wychodzi. Wyobraz sobie stos talerzy: kladiesz nowe talerzena gorzeze na szczycie i zdejmujesz tez ze szczytu. Podstawowe operacje: **push** (dodaj na szczyt), **pop** (zdejmij ze szczytu), **peek/top** (odczytaj szczyt bez zdejmowania). Wszystkie w O(1). Implementacja: tablicowa lub za pomoca Linked List (tansza na implementacje rozmawiajac o zlozonosci).'
            },
            {
              blockType: 'text',
              content: '**Queue** (kolejka) to struktura FIFO - First In, First Out. Pierwszy element dodany jako pierwszy wychodzi. Jak kolejka w sklepie: wchodzisz od tylu (enqueue), wychodzisz od przodu (dequeue). Podstawowe operacje: **enqueue** (dodaj na tyl), **dequeue** (zdejmij z przodu), **peek/front** (odczytaj poczatek). Implementacja za pomoca Linked List jest naturalna (O(1) dla obu stron). Za pomoca tablicy wymaga "circular array" techniki, by uniknac O(n) shiftowania.'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Diagram porownujacy Stack i Queue. Lewa strona: Stack - blok pionowy z elementami 1,2,3, strzalka PUSH i POP wskazuja na szczyt (TOP). Etykieta LIFO. Prawa strona: Queue - blok poziomy z elementami 1,2,3, strzalka ENQUEUE wskazuje na prawy koniec (REAR/BACK), strzalka DEQUEUE wskazuje na lewy koniec (FRONT). Etykieta FIFO. Kolory: Stack - niebieski, Queue - zielony.',
              align: 'center',
              width: 'md'
            },
            {
              blockType: 'text',
              content: 'Zastosowania Stacka w prawdziwym swiecie:\n\n- **Historia przegladarki** (cofnij = pop)\n- **Stos wywolan funkcji** (call stack) - to dlatego mozemy "debugowac" i widzimy stack trace!\n- **Cofnij/Powrot (Undo/Redo)** w edytorach\n- **Walidacja nawiasowan** - check balanced brackets\n- **DFS** (Depth-First Search) w grafach\n- **Ewaluacja wyrazen matematycznych** (np. kalkulator)'
            },
            {
              blockType: 'text',
              content: 'Zastosowania Queue w prawdziwym swiecie:\n\n- **BFS** (Breadth-First Search) w grafach - najkrotsza sciezka\n- **Task scheduling** - CPU przydziela czas procesom w kolejnosci\n- **Buforowanie** - bufor wydruku, pakiety sieciowe\n- **Komunikaty asynchroniczne** - kolejki zadan (np. RabbitMQ, AWS SQS)\n- **Level-order traversal** drzew'
            },
            {
              blockType: 'callout',
              variant: 'tip',
              title: 'Monotoniczna stos - zaawansowany wzorzec',
              content: 'Monotonic Stack (stos monot.) to stack, ktory przechowuje elementy w rosnacym lub malejacym porzadku. Uzywany do: Next Greater Element, Largest Rectangle in Histogram, Daily Temperatures. Jezeli rekruter pyta o "nastepny wiekszy element" lub "zasiag", pomysl o monotonic stack - to sygnatura tego wzorca.'
            },
            {
              blockType: 'text',
              content: '**Deque** (Double-Ended Queue, wym. "deck") to hybryd - mozesz dodawac i usuwac z OBU konc. Implementuje zarowno Stack jak i Queue. W Pythonie `collections.deque`, w Javie `ArrayDeque`. Uzywany w: Sliding Window Maximum, palindrome check, BFS ze specjalnymi warunkami. Na rozmowie gdy potrzebujesz i Stack, i Queue - Deque to rozwiazanie.'
            },
            {
              blockType: 'callout',
              variant: 'info',
              title: 'Stack na rozmowie kwalifikacyjnej',
              content: 'Gdy widzisz w zadaniu: nawiasy (brackets, parentheses), cofanie operacji (undo), "nastepny wiekszy/mniejszy", rekurencyjne struktury drzew - pomysl o Stack. Pytanie o valid parentheses to klasyczny problem elementarny, ktory rozwiazuje sie Stackiem w O(n) i jest pytany na kazdym poziomie rozmow.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Jak sprawdzic, czy string ma poprawnie zbilansowane nawiasy: "({[]})" jest poprawny, "({])" jest niepoprawny. Jaka struktura danych najlepiej rozwiazuje ten problem?',
              tagSlugs: ['stack', 'beginner'],
              choices: [
                'Tablica (Array) - zlicz otwarcia i zamkniecia',
                'Queue - przetwarzaj znaki w kolejnosci FIFO',
                'Stack - push przy otwierajacym, pop i sprawdz przy zamykajacym',
                'Hash Table - mapuj kazdy nawias otwierajacy na zamykajacy'
              ],
              correctAnswer: 'Stack - push przy otwierajacym, pop i sprawdz przy zamykajacym',
              solution: 'Stack idealnie rozwiazuje ten problem: napotkany nawias otwierajacy (,{,[ push na stos. Napotkany zamykajacy - pop ze stosu i sprawdz czy pasuje. Jezeli stos jest pusty przy zamykajacym lub nie pasuja - niepoprawne. Na koncu sprawdz czy stos jest pusty (wszystkie otwarte zostaly zamkniete). Time: O(n), Space: O(n).',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'Queue implementowana za pomoca tablicy ma O(1) dla operacji dequeue (zdejmowania z przodu) bez zadnych dodatkowych technik.',
              tagSlugs: ['queue', 'gotchas', 'intermediate'],
              correctAnswer: 'false',
              solution: 'Falsz. Zdejmowanie z przodu tablicy wymaga przesuniecia wszystkich pozostalych elementow - O(n). Aby uzyskac O(1) dequeue, trzeba uzyc "circular array" (cyklicznej tablicy) z dwoma wskaznikami (front i rear). Implementacja przez Linked List naturalnie daje O(1) dla obu operacji.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'Ktora z operacji na Stack NIE ma zlozonosci O(1)?',
              tagSlugs: ['stack', 'big-o', 'beginner'],
              choices: [
                'push (dodanie na szczyt)',
                'pop (zdejmowanie ze szczytu)',
                'peek (odczytanie szczytu)',
                'search (znalezienie elementu w stosie)'
              ],
              correctAnswer: 'search (znalezienie elementu w stosie)',
              solution: 'Stack z definicji daje dostep tylko do szczytu (top). Aby znalezc element w srodku, trzeba by zdejmowac kolejne elementy jeden po drugim - O(n). Push, pop, peek sa wszystkie O(1) bo operuja tylko na szczycie. Stack nie oferuje random access.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 4,
              prompt: 'Implementujesz algorytm BFS (Breadth-First Search). Jaka struktura danych powinna przechowywac wezly do odwiedzenia?',
              tagSlugs: ['queue', 'bfs', 'intermediate'],
              choices: [
                'Stack (LIFO)',
                'Queue (FIFO)',
                'Array (Random Access)',
                'Priority Queue (Heap)'
              ],
              correctAnswer: 'Queue (FIFO)',
              solution: 'BFS odwiedza wezly warstwa po warstwie (level by level). Queue FIFO gwarantuje, ze najpierw przetworzysz wszystkich sasiadow biezacego wezla, zanim przejdziesz do nastepnego poziomu. Stack dalyby DFS. Priority Queue daje Dijkstre (BFS z wagami). To fundamentalna roznica: BFS = Queue, DFS = Stack.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 5,
              prompt: 'Wyjasnij roznice miedzy Stack (LIFO) a Queue (FIFO) i podaj po dwa realne zastosowania kazdej z tych struktur.',
              tagSlugs: ['stack', 'queue', 'beginner'],
              solution: 'Stack (LIFO - Last In First Out): ostatni dodany element wychodzi pierwszy. Jak stos talerzy. Zastosowania: 1) Historia przegladarki - kliknac "cofnij" zdejmuje ostatnio odwiedzana strone. 2) Call stack - system wykonywania funkcji - gdy funkcja wywoluje inna, wraca do poprzedniej po zakonczeniu (ostatnia wywolana, pierwsza konczy). Queue (FIFO - First In First Out): pierwszy dodany element wychodzi pierwszy. Jak kolejka w sklepie. Zastosowania: 1) Kolejka wydruku - dokumenty sa drukowane w kolejnosci ich dodania. 2) BFS w grafach - odwiedzamy wezly warstwa po warstwie, w kolejnosci ich odkrycia.',
              points: 2,
              isPublished: false
            }
          ]
        },

        // -------------------------------------------------------
        // LEKCJA 2.4
        // -------------------------------------------------------
        {
          title: 'Lekcja 2.4: Hash Tables i Hash Maps - O(1) w praktyce',
          order: 4,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Hash Table to prawdopodobnie najuzyteczniejsza struktura danych w codziennym programowaniu i na rozmowach kwalifikacyjnych. Oferuje **O(1) srednio** dla operacji wstawiania, wyszukiwania i usuwania. To magiczne O(1) pochodzi z prostego pomyslu: zamiast szukac elementu przegladajac cala liste, **obliczamy matematycznie gdzie powinien byc** i sprawdzamy tylko to miejsce. Ta funkcja obliczajaca to **funkcja hashujaca**.'
            },
            {
              blockType: 'text',
              content: '**Jak dziala Hash Table?** Mamy tablice "bucketow" (kubeczki/sloty) o stalym rozmiarze. Gdy chcemy dodac pare klucz-wartosc, obliczamy **hash(klucz) % rozmiar_tablicy** - to daje nam indeks bucketu. Wstawiamy tam wartosc. Przy wyszukiwaniu: obliczamy ten sam hash, idziemy do tego samego bucketu, i tam jest nasza wartosc. Dlatego O(1) - jedno obliczenie matematyczne + jeden dostep tablicowy.'
            },
            {
              blockType: 'text',
              content: '**Kolizje** to problem: dwa rozne klucze moga dac ten sam indeks. Jak to rozwiazac? **Chaining** (lancuchowanie): kazdy bucket jest lista. Kolizje dodajemy do tej samej listy. Wyszukiwanie: idz do bucketu, przeszukaj liste. Srednie O(1) gdy kolizji malo, O(n) worst case. **Open Addressing** (otwarte adresowanie): jezeli bucket zajety, szukaj nastepnego wolnego (linear probing, quadratic probing). Popularniejszy w implementacjach systemowych.'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Diagram Hash Table z Chaining. Pokazuje: 1) Trzy klucze ("apple", "banana", "cherry") z strzalkami do funkcji hash. 2) Funkcja hash produkuje indeksy (2, 5, 2). 3) Tablica 8 bucketow - bucket[2] zawiera liste ["apple"->1, "cherry"->3] (kolizja!), bucket[5] zawiera ["banana"->2]. Reszta bucketow pusta. Etykiety: "hash collision w buckecie 2", "chaining lista".',
              align: 'center',
              width: 'lg'
            },
            {
              blockType: 'table',
              caption: 'Hash Table - zlozonosci operacji',
              hasHeaders: true,
              headers: ['Operacja', 'Srednie', 'Worst Case', 'Kiedy worst case?'],
              rows: [
                ['Insert', 'O(1)', 'O(n)', 'Wszystkie klucze w jednym buckecie'],
                ['Search', 'O(1)', 'O(n)', 'Wszystkie klucze w jednym buckecie'],
                ['Delete', 'O(1)', 'O(n)', 'Wszystkie klucze w jednym buckecie'],
                ['Iteration', 'O(n)', 'O(n)', 'Zawsze linear - przegladamy wszystko']
              ]
            },
            {
              blockType: 'text',
              content: 'Na rozmowach Hash Table / Hash Map rozwiazuje ogromna liczbe problemow. Kluczowy wzorzec: **"potrzebujesz O(1) lookup? Uzyj Hash Map"**. Przykladowe problemy:\n\n- **Two Sum**: Zamiast O(n^2) brute force, uzywamy mapy {wartosc -> indeks}. Dla kazdego elementu sprawdzamy czy (target - element) jest juz w mapie. O(n) total.\n- **Group Anagrams**: Klucz = posortowany string, wartosci = lista anagramow. O(n*k log k) gdzie k to dlugosc stringa.\n- **Frequency Count**: Zlicz wystapienia elementow. Mapa {element -> liczba_wystapieniow}.'
            },
            {
              blockType: 'callout',
              variant: 'warning',
              title: 'Hash Set vs Hash Map',
              content: 'Hash Set przechowuje tylko klucze (bez wartosci). Uzywaj gdy potrzebujesz tylko sprawdzic "czy element istnieje?" (O(1)) bez przechowywania dodatkowych danych. Hash Map przechowuje pary klucz-wartosc. W Javie: HashSet i HashMap. W Pythonie: set i dict. W JavaScript: Set i Map (lub zwykly obiekt). Rozroznienie jest wazne na rozmowie!'
            },
            {
              blockType: 'text',
              content: 'Wazna uwaga dla JavaScript: zwykly **obiekt {}** to de facto Hash Map, ale z ograniczeniami (klucze tylko stringi/Symbole, prototypowe dziedziczenie). **Map** w ES6 jest lepsza: klucze moga byc dowolnego typu, ma metody .get(), .set(), .has(), .delete(), .size, i zachowuje porzadek wstawiania. Na rozmowach z JavaScript zawsze pytaj czy uzyc obiektu czy Map - jezeli klucze sa nie-stringami, zawsze Map.'
            },
            {
              blockType: 'callout',
              variant: 'tip',
              title: 'Regula kciuka: Hash Map jako "pierwsze narzedzie"',
              content: 'Gdy na rozmowie nie wiesz od czego zaczac, zapytaj siebie: "Czy Hash Map pomoglby mi zapamiectac cos, co widze po raz pierwszy, co przyda mi sie pozniej?" W 70% problemow na LeetCode kategoria Easy/Medium - odpowiedz to TAK. Hash Map to Twoje Swiss Army Knife na rozmowach kwalifikacyjnych.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Jaka jest srednia zlozonosc wyszukiwania w Hash Table (przy dobrej funkcji hashujace i niewielu kolizjach)?',
              tagSlugs: ['hash-table', 'big-o', 'beginner'],
              choices: [
                'O(log n)',
                'O(n)',
                'O(1)',
                'O(n^2)'
              ],
              correctAnswer: 'O(1)',
              solution: 'Hash Table oblicza hash klucza, ktory bezposrednio wskazuje na bucket. To jeden krok obliczeniowy niezaleznie od rozmiaru tablicy - stad O(1). W worst case (wiele kolizji, wszystko w jednym buckecie) spada do O(n), dlatego dobra funkcja hashujaca jest kluczowa.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'Masz problem Two Sum: znajdz dwa indeksy, ktorych suma jest rowna target. Jakie jest optymalne rozwiazanie i jaka jest jego zlozonosc?',
              tagSlugs: ['hash-map', 'array', 'intermediate'],
              choices: [
                'Dwie zagniezdzone petle - O(n^2) time, O(1) space',
                'Posortuj tablice i uzyj two pointers - O(n log n) time, O(1) space',
                'Hash Map: dla kazdego elementu sprawdz czy (target - element) jest w mapie - O(n) time, O(n) space',
                'Binary search dla kazdego elementu - O(n log n) time, O(1) space'
              ],
              correctAnswer: 'Hash Map: dla kazdego elementu sprawdz czy (target - element) jest w mapie - O(n) time, O(n) space',
              solution: 'To optymalne rozwiazanie dla oryginalnego Two Sum (bez zalozenia o posortowaniu, potrzebujemy indeksow). Iterujemy raz: dla kazdego nums[i] sprawdzamy czy (target - nums[i]) jest juz w mapie. Jezeli tak - mamy odpowiedz. Jezeli nie - dodajemy nums[i] -> i do mapy. O(n) time, O(n) space. To klasyczny przyklad time-space trade-off.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'Hash Table gwarantuje O(1) worst case dla operacji wyszukiwania.',
              tagSlugs: ['hash-table', 'gotchas', 'intermediate'],
              correctAnswer: 'false',
              solution: 'Falsz. Hash Table gwarantuje O(1) tylko srednio (average case). W worst case, jezeli wszystkie klucze hashuja sie do tego samego bucketu (np. przez celowy atak "hash flooding"), wyszukiwanie staje sie O(n) - trzeba przeszukac cala liste w jednym buckecie. Dlatego wazna jest dobra funkcja hashujaca i rehashing.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 4,
              prompt: 'Chcesz sprawdzic czy dana liczba juz pojawila sie wczesniej w tablicy (bez przechowywania dodatkowych danych o liczbie). Ktora strukture powinienes uzyc?',
              tagSlugs: ['hash-table', 'beginner'],
              choices: [
                'Hash Map (klucz -> wartosc)',
                'Hash Set (tylko klucze)',
                'Priority Queue',
                'Sorted Array'
              ],
              correctAnswer: 'Hash Set (tylko klucze)',
              solution: 'Gdy potrzebujesz tylko sprawdzic "czy element istnieje?" (bez dodatkowych danych), Hash Set jest idealny - mniejszy niz Hash Map, ta sama zlozonosc O(1). Hash Map bylby "overkill" - musialbys dodac sztuczna wartosc (np. boolean true). Hash Set to czystsza, bardziej semantyczna odpowiedz.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 5,
              prompt: 'Wyjasnij co to jest "kolizja" w Hash Table i jakie sa dwie glowne metody jej rozwiazywania. Ktora metode preferujesz i dlaczego?',
              tagSlugs: ['hash-table', 'intermediate'],
              solution: 'Kolizja wystepuje gdy dwa rozne klucze produkuja ten sam hash (indeks bucketu). Dwie metody rozwiazywania: 1) Chaining (lancuchowanie): kazdy bucket to lista. Kolizje dodawane sa do tej samej listy w danym buckecie. Zalety: prosta implementacja, dziala dobrze nawet przy wysokim fill ratio. Wady: dodatkowa pamiec na listy, cache-unfriendly (wskazniki rozrzucone po pamieci). 2) Open Addressing (otwarte adresowanie): jezeli bucket zajety, szukamy nastepnego wolnego (linear probing = +1, +2, +3...). Zalety: lepsza lokalnosc cache (dane w ciagowej tablicy), mniej wskaznikow. Wady: clustering (skupiska zajetch miejsc), wymaga niskiego fill ratio (<70%). Preferuje Chaining gdy fill ratio jest wysoki lub nie wiem z gory ile bedzie elementow. Open Addressing jest szybszy praktycznie przy niskim fill ratio ze wzgledu na cache locality.',
              points: 3,
              isPublished: false
            }
          ]
        }
      ]
    }
  ]
};
