// data/courses/dsa-course-pt2.js
// MODUL 3: Algorytmy Sortowania
// MODUL 4: Algorytmy Wyszukiwania i Kluczowe Wzorce

module.exports = {
  subject: {
    name: 'Computer Science & Algorytmy',
    slug: 'computer-science-algorytmy'
  },

  course: {
    title: 'DSA & Algorytmy: Kompletne Przygotowanie do Rozmow Kwalifikacyjnych (Junior SWE)',
    slug: 'dsa-interview-prep-junior',
    description: 'Kompleksowy kurs przygotowujacy do technicznych rozmow kwalifikacyjnych na stanowisko Junior Software Engineer. Opanujesz Big O Notation, kluczowe struktury danych, algorytmy sortowania i wyszukiwania, drzewa, grafy oraz programowanie dynamiczne - dokladnie to, czego szukaja rekruterzy w 2025 roku.',
    level: 'BEGINNER',
    isPublished: false
  },

  modules: [

    // =========================================================
    // MODUL 3: Algorytmy Sortowania
    // =========================================================
    {
      title: 'Modul 3: Algorytmy Sortowania',
      order: 3,
      isPublished: false,

      lessons: [

        // -------------------------------------------------------
        // LEKCJA 3.1
        // -------------------------------------------------------
        {
          title: 'Lekcja 3.1: Sortowanie O(n^2) - Bubble, Selection, Insertion Sort',
          order: 1,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Algorytmy sortowania O(n^2) to "wolne" algorytmy, ktore rzadko uzywamy w produkcji dla duzych danych. Ale **musisz je znac na rozmowie** z trzech powodow: po pierwsze, rekruterzy pytaja o nie bezposrednio ("wytlumacz Bubble Sort"). Po drugie, Insertion Sort jest zaskakujaco dobry dla malych lub prawie posortowanych danych i jest uzywany w hybrydowych algorytmach jak TimSort. Po trzecie, rozumienie prostych algorytmow buduje intuicje dla trudniejszych. Zacznijmy od najprostszego: **Bubble Sort**.'
            },
            {
              blockType: 'text',
              content: '**Bubble Sort** - "babelkowanie" wiekszych elementow na koniec. Porownujemy sasiadujace pary elementow i zamieniamy je jezeli sa w zlej kolejnosci. Po jednym przejsciu przez tablice, najwiekszy element "babelkuje" na koniec. Powtarzamy dla pozostalych n-1 elementow. Optymalizacja: jezeli w danym przejsciu nie bylo zadnej zamiany, tablica jest juz posortowana - mozemy zakonczyc wczesnie. Dzieki temu best case (juz posortowane) to O(n).\n\n```\nfunction bubbleSort(arr) {\n  for (let i = 0; i < arr.length; i++) {\n    let swapped = false;\n    for (let j = 0; j < arr.length - i - 1; j++) {\n      if (arr[j] > arr[j+1]) {\n        [arr[j], arr[j+1]] = [arr[j+1], arr[j]];\n        swapped = true;\n      }\n    }\n    if (!swapped) break; // optymalizacja\n  }\n  return arr;\n}\n```'
            },
            {
              blockType: 'text',
              content: '**Selection Sort** - "znajdz minimum i postaw na poczatek". W kazdej iteracji przeszukujemy nieposortowana czesc tablicy, szukamy minimalnego elementu i zamieniamy go z pierwszym elementem tej czesci. Po n iteracjach tablica jest posortowana. Selection Sort zawsze wykonuje dokladnie O(n^2) porownan - nie ma optymalizacji dla posortowanych danych. Jego jedyna zaleta: wykonuje minimalna liczbe zamian (n-1 zamian), co moze byc wazne gdy operacja zamiany jest kosztowna.\n\n```\nfunction selectionSort(arr) {\n  for (let i = 0; i < arr.length; i++) {\n    let minIdx = i;\n    for (let j = i+1; j < arr.length; j++) {\n      if (arr[j] < arr[minIdx]) minIdx = j;\n    }\n    if (minIdx !== i) [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];\n  }\n  return arr;\n}\n```'
            },
            {
              blockType: 'text',
              content: '**Insertion Sort** - "sortowanie jak karty do gry". Budujemy posortowana czesc tablicy element po elemencie. Dla kazdego nowego elementu, wstawiamy go we wlasciwe miejsce w juz posortowanej czesci - przesuwajac wieksze elementy w prawo. Kluczowa zaleta: **O(n) best case** (juz posortowane) i **bardzo szybki dla malych n i prawie posortowanych danych**. Dlatego TimSort (Python, Java) uzywa Insertion Sort dla malych podtablic (n < 64).\n\n```\nfunction insertionSort(arr) {\n  for (let i = 1; i < arr.length; i++) {\n    let key = arr[i];\n    let j = i - 1;\n    while (j >= 0 && arr[j] > key) {\n      arr[j+1] = arr[j];\n      j--;\n    }\n    arr[j+1] = key;\n  }\n  return arr;\n}\n```'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Wizualizacja trzech algorytmow sortowania na przykladzie tablicy [5, 3, 8, 1, 2]. Trzy panele obok siebie: 1) Bubble Sort - strzalki miedzy sasiadujacymi elementami pokazujace porownania i zamiany, zacieniowane elementy juz na miejscu. 2) Selection Sort - strzalka "szukam minimum" przelatujaca po nieposortowanej czesci, zaznaczony minimalny element i zamiana. 3) Insertion Sort - posortowana czesc (zielona) i wstawianie nowego elementu we wlasciwe miejsce ze strzalkami przesuniecia. Kazdy panel z innym kolorem tla.',
              align: 'center',
              width: 'lg'
            },
            {
              blockType: 'table',
              caption: 'Porownanie algorytmow O(n^2)',
              hasHeaders: true,
              headers: ['Algorytm', 'Best Case', 'Average Case', 'Worst Case', 'Space', 'Stable?'],
              rows: [
                ['Bubble Sort', 'O(n)*', 'O(n^2)', 'O(n^2)', 'O(1)', 'Tak'],
                ['Selection Sort', 'O(n^2)', 'O(n^2)', 'O(n^2)', 'O(1)', 'Nie'],
                ['Insertion Sort', 'O(n)', 'O(n^2)', 'O(n^2)', 'O(1)', 'Tak']
              ]
            },
            {
              blockType: 'callout',
              variant: 'info',
              title: 'Czym jest "stabilny" algorytm sortowania?',
              content: 'Algorytm sortowania jest **stabilny** (stable) jezeli zachowuje wzgledna kolejnosc rownych elementow. Przyklad: masz tablice [(Jan, 25), (Anna, 25), (Ewa, 30)] posortowana po imieniu. Po posortowaniu po wieku (stable): [(Jan, 25), (Anna, 25), (Ewa, 30)] - Jan nadal jest przed Anna. Niestabilny moze je przestawic: [(Anna, 25), (Jan, 25), (Ewa, 30)]. Na rozmowie pytanie o stability to sygnal ze rekruter wie co robi.'
            },
            {
              blockType: 'callout',
              variant: 'tip',
              title: 'Kiedy uzywac Insertion Sort w prawdziwym kodzie?',
              content: 'Insertion Sort jest uzywany w praktyce gdy: 1) n jest male (< 20-30 elementow) - wtedy stale czynniki robia go szybszym niz Merge Sort. 2) Dane sa prawie posortowane - O(n) best case bije inne algorytmy. 3) Dane przychodza strumieniowo (online) - mozesz dodawac nowe elementy do juz posortowanej struktury. TimSort (default Python/Java) uzywa Insertion Sort dla malych "chunbow", a Merge Sort do lacznie - to hybryda obu swiatch.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Ktory algorytm sortowania ma najlepszy best-case time complexity gdy tablica jest juz prawie posortowana?',
              tagSlugs: ['sortowanie', 'beginner'],
              choices: [
                'Bubble Sort (z optymalizacja wczesnego zatrzymania)',
                'Selection Sort',
                'Insertion Sort',
                'Oba: Bubble Sort i Insertion Sort maja O(n) best case'
              ],
              correctAnswer: 'Oba: Bubble Sort i Insertion Sort maja O(n) best case',
              solution: 'Zarowno Bubble Sort (z optymalizacja flagi "swapped") jak i Insertion Sort maja O(n) best case dla posortowanej tablicy. Bubble Sort wykrywa brak zamian i konczy. Insertion Sort nie musi przenosic zadnych elementow. Selection Sort zawsze wykonuje O(n^2) porownan niezaleznie od ukladu - brak optymalizacji dla posortowanych danych.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'Selection Sort jest algorytmem stabilnym (stable) - zachowuje wzgledna kolejnosc rownych elementow.',
              tagSlugs: ['sortowanie', 'intermediate'],
              correctAnswer: 'false',
              solution: 'Falsz. Selection Sort NIE jest stabilny. Gdy zamienia element minimalny z biezaca pozycja, moze zaburzyc wzgledna kolejnosc rownych elementow. Przyklad: [3a, 3b, 1] - Selection Sort zamieni 1 z 3a, dajac [1, 3b, 3a], gdzie 3b jest teraz przed 3a, choc w oryginale bylo odwrotnie. Bubble Sort i Insertion Sort sa stable.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'Jakie jest worst-case time complexity Insertion Sort i kiedy wystepuje?',
              tagSlugs: ['sortowanie', 'insertion-sort', 'beginner'],
              choices: [
                'O(n) - gdy tablica jest posortowana rosnaco',
                'O(n log n) - zawsze tak samo jak Merge Sort',
                'O(n^2) - gdy tablica jest posortowana odwrotnie (malejaco)',
                'O(n^2) - gdy tablica jest losowa'
              ],
              correctAnswer: 'O(n^2) - gdy tablica jest posortowana odwrotnie (malejaco)',
              solution: 'Worst case Insertion Sort to O(n^2), ktory wystepuje gdy tablica jest posortowana w odwrotnej kolejnosci (malejaco). Wtedy kazdy nowy element musi byc przesuniaty az na poczatek posortowanej czesci - i-ty element wymaga i porownан/przesuniec. Suma 1+2+3+...+n-1 = n(n-1)/2 = O(n^2).',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Wytlumacz jak dziala Bubble Sort krok po kroku na przykladzie tablicy [4, 2, 7, 1]. Ile przejsc (pass) bedzie potrzebnych? Jaka jest jego zlozonosc w worst case i dlaczego?',
              tagSlugs: ['sortowanie', 'bubble-sort', 'beginner'],
              solution: 'Bubble Sort porownuje sasiadujace pary i zamienia je jezeli sa w zlej kolejnosci. Na [4, 2, 7, 1]: Pass 1: (4,2)->zamiana [2,4,7,1], (4,7)->ok [2,4,7,1], (7,1)->zamiana [2,4,1,7]. 7 jest na miejscu. Pass 2: (2,4)->ok, (4,1)->zamiana [2,1,4,7]. 4 jest na miejscu. Pass 3: (2,1)->zamiana [1,2,4,7]. Gotowe - 3 przejscia dla n=4. Worst case O(n^2): dla n elementow robimy n-1 przejsc, w pierwszym n-1 porownan, w drugim n-2 itd. Suma: (n-1)+(n-2)+...+1 = n(n-1)/2 = O(n^2).',
              points: 2,
              isPublished: false
            }
          ]
        },

        // -------------------------------------------------------
        // LEKCJA 3.2
        // -------------------------------------------------------
        {
          title: 'Lekcja 3.2: Merge Sort - Divide and Conquer',
          order: 2,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Merge Sort to elegancki algorytm oparty na paradygmacie **Divide and Conquer** (Dziel i Rzadz). Idea jest prosta i genialna zarazem: jezeli nie wiesz jak posortowac duzego problemu, podziel go na dwa mniejsze, posortuj kazdy z nich osobno, a potem polacz (scal) wyniki. Rekurencja wykona podzial az do tablic jednoelementowych (ktore sa z definicji posortowane), a potem scalamy parami - az do finalnej posortowanej tablicy. Gwarantuje **O(n log n) zawsze** - w best, average i worst case.'
            },
            {
              blockType: 'text',
              content: 'Merge Sort sklada sie z dwoch czesci:\n\n**1) Divide (podziel)**: Podziel tablice na dwa rowne polowy. Posortuj lewa polowe rekurencyjnie. Posortuj prawa polowe rekurencyjnie. Baza rekurencji: tablica o 0 lub 1 elemencie jest juz posortowana.\n\n**2) Merge (scal)**: Masz dwie posortowane tablice - scal je w jedna posortowana. To kluczowa operacja: uzywasz dwoch wskaznikow (po jednym na kazda tablice), porownujesz biezace elementy i zawsze wybierasz mniejszy. O(n) dla scalenia tablic o lacznym rozmiarze n.'
            },
            {
              blockType: 'text',
              content: 'Implementacja Merge Sort:\n\n```\nfunction mergeSort(arr) {\n  if (arr.length <= 1) return arr; // baza rekurencji\n\n  const mid = Math.floor(arr.length / 2);\n  const left = mergeSort(arr.slice(0, mid));  // posortuj lewa\n  const right = mergeSort(arr.slice(mid));    // posortuj prawa\n  return merge(left, right);                  // scal\n}\n\nfunction merge(left, right) {\n  const result = [];\n  let l = 0, r = 0;\n  while (l < left.length && r < right.length) {\n    if (left[l] <= right[r]) result.push(left[l++]);\n    else result.push(right[r++]);\n  }\n  return result.concat(left.slice(l)).concat(right.slice(r));\n}\n```'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Drzewo rekurencji Merge Sort dla tablicy [8, 3, 5, 1]. Gora: [8,3,5,1] dzielone na [8,3] i [5,1]. [8,3] na [8] i [3], [5,1] na [5] i [1]. Potem strzalki idace w gore: merge([8],[3])->[3,8], merge([5],[1])->[1,5], merge([3,8],[1,5])->[1,3,5,8]. Kazdy poziom drzewa oznaczony: "poziom 0 - divide", "poziom 1 - divide", "poziom 2 - baza", "poziom 1 - merge", "poziom 0 - merge". Pokazuje logn poziomow i n pracy na poziom = O(n log n).',
              align: 'center',
              width: 'lg'
            },
            {
              blockType: 'text',
              content: 'Dlaczego Merge Sort to **O(n log n)**? Drzewko rekurencji ma **log n poziomow** (bo za kazdym razem dzielimy na pol). Na **kazdym poziomie** lacznie wykonujemy **O(n)** pracy (scalanie wszystkich par). Wiec calkowita zlozonosc: log n poziomow * O(n) praca na poziom = **O(n log n)**. To matematycznie optymalne dla algorytmow opartych na porownaniach - nie mozna zrobic szybciej (powiemy wiecej o tym w lekcji o Quick Sort).'
            },
            {
              blockType: 'callout',
              variant: 'info',
              title: 'Merge Sort jest stabilny i gwarantuje O(n log n)',
              content: 'Dwa kluczowe atuty Merge Sort: (1) Jest **stabilny** - zachowuje wzgledna kolejnosc rownych elementow, bo przy rownowadze zawsze wybieramy lewy element (left[l] <= right[r]). (2) Gwarantuje **O(n log n) w worst case** - w przeciwienstwie do Quick Sort, ktory moze degenerowac do O(n^2). Dlatego Merge Sort jest uzywany gdy stabilnosc jest wymagana lub gdy dane sa nieprzewidywalne.'
            },
            {
              blockType: 'callout',
              variant: 'warning',
              title: 'Space complexity Merge Sort: O(n)',
              content: 'Merge Sort wymaga O(n) dodatkowej pamieci na tymczasowe tablice podczas scalania. To jego glowna wada w porownaniu do Quick Sort (O(log n) space dla stosu rekurencji). Na rozmowie jezeli rekruter zapyta "dlaczego nie uzywamy zawsze Merge Sort skoro jest bezpieczniejszy?" - odpowiedz: space complexity i gorsza cache locality niz Quick Sort w praktyce.'
            },
            {
              blockType: 'text',
              content: 'Merge Sort doskonale nadaje sie do **sortowania linked list** - w przeciwienstwie do Quick Sort, ktory potrzebuje random access. Dla linked list dzielenie na pol to O(n) (trzeba dojsc do srodka), ale merge jest naturalne - wystarczy laczyc wezly wskaznikami bez kopiowania danych. Warto zapamietac: "Chcesz posortowac linked list? Uzyj Merge Sort." To czeste pytanie na rozmowach.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Jaka jest time complexity Merge Sort w worst case?',
              tagSlugs: ['merge-sort', 'big-o', 'beginner'],
              choices: [
                'O(n^2)',
                'O(n)',
                'O(n log n)',
                'O(log n)'
              ],
              correctAnswer: 'O(n log n)',
              solution: 'Merge Sort gwarantuje O(n log n) zawsze - w best, average i worst case. Drzewo rekurencji ma log n poziomow (dzielenie na pol), a na kazdym poziomie wykonujemy O(n) pracy (scalanie). To jedna z kluczowych zalet Merge Sort nad Quick Sort, ktory w worst case spada do O(n^2).',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'Jaka jest space complexity Merge Sort?',
              tagSlugs: ['merge-sort', 'space-complexity', 'beginner'],
              choices: [
                'O(1) - in-place algorithm',
                'O(log n) - tylko stos rekurencji',
                'O(n) - tymczasowe tablice przy scalaniu',
                'O(n log n) - tyle ile operacji'
              ],
              correctAnswer: 'O(n) - tymczasowe tablice przy scalaniu',
              solution: 'Merge Sort wymaga O(n) dodatkowej pamieci na tymczasowe tablice tworzone podczas operacji scalania. To jego glowna wada w porownaniu do Quick Sort. Stos rekurencji dodaje O(log n), ale dominujacym skladnikiem jest O(n) z operacji merge.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'Merge Sort jest algorytmem stabilnym (stable sort).',
              tagSlugs: ['merge-sort', 'intermediate'],
              correctAnswer: 'true',
              solution: 'Prawda. Merge Sort jest stabilny gdy podczas scalania przy rownych elementach zawsze wybieramy element z lewej (pierwotnej) tablicy jako pierwszy: if (left[l] <= right[r]). Dzieki temu rowne elementy zachowuja swoja wzgledna kolejnosc z oryginalnej tablicy.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Wyjasnij paradygmat "Divide and Conquer" na przykladzie Merge Sort. Jakie sa trzy kroki tego paradygmatu i jak odpowiadaja im elementy Merge Sort?',
              tagSlugs: ['merge-sort', 'divide-and-conquer', 'intermediate'],
              solution: 'Divide and Conquer sklada sie z trzech krokow: 1) DIVIDE (Podziel) - podziel problem na mniejsze podproblemy tego samego typu. W Merge Sort: podziel tablice na dwie rowne polowy (arr.slice(0, mid) i arr.slice(mid)). Powtarzaj rekurencyjnie az do tablic jednoelementowych. 2) CONQUER (Podbij) - rozwiaz podproblemy rekurencyjnie. Baza rekurencji: tablica o 0 lub 1 elemencie jest "posortowana" automatycznie. 3) COMBINE (Polacz) - scal rozwiazania podproblemow w jedno rozwiazanie. W Merge Sort: operacja merge() - scalenie dwoch posortowanych tablic w jedna posortowana, uzywajac dwoch wskaznikow i zawsze wybierajac mniejszy element. Kluczowa insight: latwo scalic dwie posortowane tablice (O(n)), wiec rozbijamy problem az do trywialnych przypadkow.',
              points: 2,
              isPublished: false
            }
          ]
        },

        // -------------------------------------------------------
        // LEKCJA 3.3
        // -------------------------------------------------------
        {
          title: 'Lekcja 3.3: Quick Sort - ulubieniec rekruterow',
          order: 3,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Quick Sort to **najpopularniejszy algorytm sortowania w praktyce** i czesto najczesciej pytany na rozmowach kwalifikacyjnych. Dlaczego? Bo jest szybki w praktyce (mimo ze Merge Sort ma lepszy worst case), jest in-place (O(log n) space vs O(n) Merge Sort), i ma doskonala cache locality. Rozumienie Quick Sort - nie tylko "jak" ale "dlaczego" - jest sygnatura wyrosnietego inzynierego.'
            },
            {
              blockType: 'text',
              content: 'Idea Quick Sort: **wybierz pivot (element osiowy), podziel tablice tak by po lewej byly mniejsze a po prawej wieksze od pivota, posortuj rekurencyjnie obie czesci**. To tez Divide and Conquer, ale inaczej niz Merge Sort: tutaj cala praca jest w fazie dzielenia (partition), a laczenie jest trywialne (nic nie robimy - tablice sa juz na miejscu).\n\n```\nfunction quickSort(arr, low = 0, high = arr.length - 1) {\n  if (low < high) {\n    const pivotIdx = partition(arr, low, high);\n    quickSort(arr, low, pivotIdx - 1);  // lewa czesc\n    quickSort(arr, pivotIdx + 1, high); // prawa czesc\n  }\n  return arr;\n}\n```'
            },
            {
              blockType: 'text',
              content: 'Kluczowa operacja: **partition** (Lomuto scheme - prosta wersja):\n\n```\nfunction partition(arr, low, high) {\n  const pivot = arr[high]; // wybieramy ostatni element jako pivot\n  let i = low - 1;         // i wskazuje na mniejszy region\n\n  for (let j = low; j < high; j++) {\n    if (arr[j] <= pivot) {\n      i++;\n      [arr[i], arr[j]] = [arr[j], arr[i]]; // zamien\n    }\n  }\n  [arr[i+1], arr[high]] = [arr[high], arr[i+1]]; // postaw pivot na miejsce\n  return i + 1; // indeks pivota\n}\n```\nPo partition: wszystko po lewej stronie pivota jest <= pivot, wszystko po prawej >= pivot. Pivot jest na swoim ostatecznym miejscu.'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Wizualizacja Quick Sort na tablicy [3, 6, 8, 10, 1, 2, 1]. Pivot = 1 (ostatni element). Partition: zaznaczone elementy <= pivot po lewej (1), pivot na miejscu (indeks 1). Rekurencja: lewa czesc [1] (juz posortowana), prawa czesc [3,6,8,10,2]. Strzalki pokazujace podzial i rekurencyjne wywolania. Zielona ramka wokol elementow juz na finalnym miejscu.',
              align: 'center',
              width: 'lg'
            },
            {
              blockType: 'table',
              caption: 'Quick Sort - zlozonosci i wybor pivota',
              hasHeaders: true,
              headers: ['Przypadek', 'Time', 'Kiedy?', 'Jak zapobiec?'],
              rows: [
                ['Best Case', 'O(n log n)', 'Pivot zawsze dzieli na pol', 'Wybor mediany'],
                ['Average Case', 'O(n log n)', 'Losowy porzadek danych', 'Losowy pivot'],
                ['Worst Case', 'O(n^2)', 'Juz posortowana tablica + pivot = ostatni', 'Randomized pivot'],
                ['Space (avg)', 'O(log n)', 'Stos rekurencji', '-'],
                ['Space (worst)', 'O(n)', 'Zdegenerowane drzewo', 'Tail recursion opt.']
              ]
            },
            {
              blockType: 'text',
              content: '**Worst Case Quick Sort**: Jezeli zawsze wybieramy jako pivot element, ktory jest minimalny lub maksymalny (np. ostatni element posortowanej tablicy), partition zawsze dzieli tablice na [n-1] i [0]. Drzewo rekurencji ma n poziomow zamiast log n. Rozwiazanie: **Randomized Quick Sort** - losowo wybieraj pivot przed partition. W praktyce niemal eliminuje worst case. Alternatywnie: **Median-of-Three** - wybierz mediane z pierwszego, srodkowego i ostatniego elementu.'
            },
            {
              blockType: 'callout',
              variant: 'tip',
              title: 'Dlaczego Quick Sort jest szybszy od Merge Sort w praktyce?',
              content: 'Mimo ze oba maja O(n log n) average case, Quick Sort jest zazwyczaj 2-3x szybszy w praktyce z dwoch powodow: 1) **Cache locality** - Quick Sort operuje in-place, wiec dane sa blisko siebie w pamieci. Merge Sort kopiuje do nowej tablicy - wieksza szansa na cache miss. 2) **Mniejsza stala** - operacja partition jest prostsza niz merge. Na rozmowie jezeli zapytaja "dlaczego std::sort uzywa QuickSort a nie MergeSort?" - to jest odpowiedz.'
            },
            {
              blockType: 'callout',
              variant: 'info',
              title: 'Introsort - best of both worlds',
              content: 'Wiele produkcyjnych implementacji (C++ std::sort, .NET Array.Sort) uzywa **Introsort** - hybrydy Quick Sort, Heap Sort i Insertion Sort. Zaczyna jako Quick Sort, ale gdy drzewo rekurencji staje sie za glebokie (sygnalizujac worst case), przelacza sie na Heap Sort (gwarantowany O(n log n)). Dla malych n uzywa Insertion Sort. To pragmatyczne podejscie inzyniersie - wiedza o tym wyroznia kandidatow.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Kiedy Quick Sort osiaga swoj worst case O(n^2)?',
              tagSlugs: ['quick-sort', 'big-o', 'intermediate'],
              choices: [
                'Gdy tablica zawiera duplikaty',
                'Gdy pivot zawsze jest minimalnym lub maksymalnym elementem (np. posortowana tablica z pivot=ostatni)',
                'Gdy tablica ma nieparzysta liczbe elementow',
                'Gdy tablica jest posortowana odwrotnie'
              ],
              correctAnswer: 'Gdy pivot zawsze jest minimalnym lub maksymalnym elementem (np. posortowana tablica z pivot=ostatni)',
              solution: 'Worst case wystepuje gdy partition zawsze dzieli tablice na [n-1, pivot, 0] zamiast ~[n/2, pivot, n/2]. To sie dzieje gdy pivot to min lub max. Przyklad: posortowana tablica [1,2,3,4,5] z pivot=ostatni element - za kazdym razem partition daje [n-1] elementow po lewej i 0 po prawej. Drzewo rekurencji ma n poziomow = O(n^2).',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'Quick Sort jest algorytmem in-place (space complexity O(1)).',
              tagSlugs: ['quick-sort', 'space-complexity', 'intermediate'],
              correctAnswer: 'false',
              solution: 'Czesciowo prawda, ale formalnie falsz. Quick Sort jest in-place w sensie ze nie tworzy kopii danych, ale rekurencja uzywa stosu wywolan. Average case space complexity to O(log n) (glebokosc drzewa rekurencji), worst case to O(n). Mowiac "in-place" na rozmowie warto dodac "z O(log n) space dla stosu rekurencji".',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'Jak mozna zapobiec worst case O(n^2) w Quick Sort?',
              tagSlugs: ['quick-sort', 'intermediate'],
              choices: [
                'Uzyc zawsze pierwszego elementu jako pivot',
                'Uzyc zawsze srodkowego elementu jako pivot',
                'Losowo wybierac pivot (Randomized Quick Sort)',
                'Posortowac tablice przed uzyciem Quick Sort'
              ],
              correctAnswer: 'Losowo wybierac pivot (Randomized Quick Sort)',
              solution: 'Randomized Quick Sort przed kazdym partition losowo wybiera pivot (zamienia losowy element z ostatnim). Dzieki temu worst case jest ekstremalnie nieprawdopodobny (wymaga bardzo pechowego ciagu losowych wyborow). Average case pozostaje O(n log n). To standardowe rozwiazanie w praktyce.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Porownaj Merge Sort i Quick Sort: zlozonosci (best/avg/worst), space complexity, stabilnosc. Kiedy wybralbys kazdy z nich?',
              tagSlugs: ['merge-sort', 'quick-sort', 'intermediate'],
              solution: 'Merge Sort: O(n log n) zawsze (best/avg/worst). Space: O(n). Stabilny. Quick Sort: O(n log n) best/avg, O(n^2) worst. Space: O(log n) avg. Niestabilny. Kiedy Merge Sort: gdy potrzebujesz stabilnego sortowania (np. sort po kluczu, zachowujac porzadek drugiego klucza), gdy masz linked list (Merge Sort jest naturalny bez random access), gdy worst case musi byc O(n log n) (dane krytyczne bezpieczenstwiowo). Kiedy Quick Sort: gdy priorytetem jest szybkosc w praktyce (lepsza cache locality, mniejsza stala), gdy masz losowe dane (worst case nieprawdopodobny z random pivot), gdy space jest ograniczone (O(log n) vs O(n)). W praktyce std::sort w C++ i wiekszosc jezyzow uzywa hybryd (Introsort) laczacych Quick Sort, Heap Sort i Insertion Sort.',
              points: 3,
              isPublished: false
            }
          ]
        },

        // -------------------------------------------------------
        // LEKCJA 3.4
        // -------------------------------------------------------
        {
          title: 'Lekcja 3.4: Heap Sort i wielkie porownanie algorytmow',
          order: 4,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Heap Sort laczy dwie struktury: **tablice** i **heap** (kopiec). Idea: zbuduj max-heap z tablicy, a potem wielokrotnie wyciagaj maksimum i wstaw na koniec. Heap Sort jest in-place (O(1) space, bez liczenia stosu rekurencji) i gwarantuje O(n log n) zawsze - tak jak Merge Sort, ale bez zuzycia dodatkowej pamieci. Brzmisko jak idealne? Jest jeden haczyk: jest **niestabilny** i ma gorsza cache locality niz Quick Sort - dlatego rzadziej widzimy go w praktyce, ale rekruterzy pytaja o niego jako o proof of knowledge.'
            },
            {
              blockType: 'text',
              content: 'Algorytm Heap Sort w dwoch fazach:\n\n**Faza 1 - Buduj Max-Heap (Heapify)**: Przeksztalc tablice w max-heap. Wszystkie elementy w poprawnym ukladzie kopcowym - rodzic zawsze wiekszy niz dzieci. Czas: O(n) (mozna to udowodnic, intuicja: wiele wezlow na dole nie wymagaja duzo pracy).\n\n**Faza 2 - Ekstrahuj i sortuj**: Powtarzaj n razy: zamien korzen (maksimum) z ostatnim elementem, zmniejsz rozmiar heapa o 1, przywroc wlasnosc heap (sift-down = O(log n)). Po n krokach tablica jest posortowana rosnaco. Czas: n * O(log n) = O(n log n).'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Diagram Heap Sort w dwoch fazach. Faza 1: Tablica [4, 10, 3, 5, 1] zamieniana w Max-Heap, pokazana jako drzewo binarne z korzeniem 10 i dziecmi 5,3,4,1. Strzalki "heapify". Faza 2: Korzen (10) zamieniany z ostatnim elementem, heap shrinks, sift-down przywraca heap property. Kolejne kroki: [5,4,3,1|10], [4,1,3|5,10], [3,1|4,5,10], [1|3,4,5,10], [1,3,4,5,10]. Zielone elementy = juz na miejscu.',
              align: 'center',
              width: 'lg'
            },
            {
              blockType: 'table',
              caption: 'Wielkie porownanie algorytmow sortowania',
              hasHeaders: true,
              headers: ['Algorytm', 'Best', 'Avg', 'Worst', 'Space', 'Stable', 'Praktyczne uzycie'],
              rows: [
                ['Bubble Sort', 'O(n)', 'O(n^2)', 'O(n^2)', 'O(1)', 'Tak', 'Edukacja, prawie nigdy'],
                ['Selection Sort', 'O(n^2)', 'O(n^2)', 'O(n^2)', 'O(1)', 'Nie', 'Gdy zamiany kosztowne'],
                ['Insertion Sort', 'O(n)', 'O(n^2)', 'O(n^2)', 'O(1)', 'Tak', 'Male n, prawie posortowane'],
                ['Merge Sort', 'O(n log n)', 'O(n log n)', 'O(n log n)', 'O(n)', 'Tak', 'Linked lists, stabilnosc wazna'],
                ['Quick Sort', 'O(n log n)', 'O(n log n)', 'O(n^2)', 'O(log n)', 'Nie', 'Ogolne sortowanie, szybki'],
                ['Heap Sort', 'O(n log n)', 'O(n log n)', 'O(n log n)', 'O(1)', 'Nie', 'Gdy O(1) space i gwarancja O(n log n)'],
                ['Tim Sort', 'O(n)', 'O(n log n)', 'O(n log n)', 'O(n)', 'Tak', 'Python/Java default, hybryda']
              ]
            },
            {
              blockType: 'text',
              content: '**Sortowania nieporownawcze** (Counting Sort, Radix Sort, Bucket Sort) moga byc szybsze niz O(n log n), bo nie porownuja elementow! Przyklad: Counting Sort dziala w O(n + k) gdzie k to zakres wartosci. Jezeli masz n liczb z zakresu [0, 100], Counting Sort jest O(n) - beatujac teoretyczne minimum O(n log n) dla algorytmow porownawczych. Ale maja ograniczenia: dzialaja tylko na liczbach calkowitych lub danych dajacych sie skwantyzowac, i nie zawsze sa praktyczne dla duzego k.'
            },
            {
              blockType: 'callout',
              variant: 'tip',
              title: 'Jak odpowiedziec na "Ktory algorytm sortowania jest najlepszy?"',
              content: 'Na rozmowie nigdy nie ma jednej odpowiedzi. Poprawna: "To zalezy od kontekstu." Pytania do zadania: Jak duze dane? Czy sa juz czesciowo posortowane? Czy potrzebujemy stabilnosci? Czy pamiec jest ograniczona? Czy dane sa liczbami calkowitymi o ograniczonym zakresie? W ogolnym przypadku Quick Sort (lub hybryda jak Introsort) jest zwykle najszybszy w praktyce. Dla stabilnosci: Merge Sort lub Tim Sort. Dla ograniczonej pamieci z gwarancja: Heap Sort. Dla liczb calkowitych malego zakresu: Counting Sort.'
            },
            {
              blockType: 'callout',
              variant: 'info',
              title: 'Lower bound sortowania porownawczego: Omega(n log n)',
              content: 'Udowodniono matematycznie, ze ZADNY algorytm porownawczy nie moze sortowac szybciej niz O(n log n) w worst case. Dowod: drzewo decyzyjne dla n elementow ma n! lisci (wszystkie mozliwe permutacje). Drzewo binarne z n! listmi ma glebokosc >= log2(n!) ≈ n log n (Stirling). Dlatego Merge Sort i Heap Sort sa optymalne w klasie algorytmow porownawczych. Wiedza o tym lower boundzie imponuje rekruterom.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Ktory z ponizszych algorytmow sortowania gwarantuje O(n log n) worst case ORAZ dziala in-place (bez dodatkowej pamieci O(n))?',
              tagSlugs: ['sortowanie', 'heap-sort', 'intermediate'],
              choices: [
                'Merge Sort',
                'Quick Sort',
                'Heap Sort',
                'Tim Sort'
              ],
              correctAnswer: 'Heap Sort',
              solution: 'Heap Sort to jedyny popularny algorytm laczacy O(n log n) gwarantowane (best/avg/worst) z O(1) dodatkowa pamiecia (in-place). Merge Sort ma O(n log n) ale wymaga O(n) space. Quick Sort ma O(log n) space i O(n^2) worst case. Tim Sort ma O(n) space. Heap Sort idealny gdy oba kryteria musza byc spelnione jednoczesnie.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'Jaka jest zlozonosc teorytyczna dolnego ograniczenia (lower bound) dla algorytmow sortowania porownawczego?',
              tagSlugs: ['sortowanie', 'big-o', 'advanced'],
              choices: [
                'O(n)',
                'O(n log n)',
                'O(n^2)',
                'O(log n)'
              ],
              correctAnswer: 'O(n log n)',
              solution: 'Udowodniono, ze zadny algorytm oparty na porownaniach nie moze sortowac szybciej niz O(n log n) w worst case. Dowod przez drzewo decyzyjne: n elementow ma n! mozliwych permutacji, drzewo binarne z n! listmi ma glebokosc log2(n!) ≈ n log n. Merge Sort i Heap Sort sa optymalne w tej klasie. Szybsze algorytmy (Counting Sort, Radix Sort) nie sa porownawcze i wymagaja dodatkowych zalozeniach o danych.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'Counting Sort (sortowanie przez zliczanie) moze sortowac szybciej niz O(n log n).',
              tagSlugs: ['sortowanie', 'advanced'],
              correctAnswer: 'true',
              solution: 'Prawda. Counting Sort dziala w O(n + k) gdzie k to zakres wartosci. Nie jest algorytmem porownawczym - nie porownuje par elementow, tylko zlicza wystapienia. Dolne ograniczenie O(n log n) dotyczy TYLKO algorytmow porownawczych. Counting Sort jest szybszy dla liczb calkowitych o malym zakresie, np. sortowanie ocen (0-100) w O(n).',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Rekruter pyta: "Masz tablice 10 milionow liczb calkowitych z zakresu [0, 1000]. Jaki algorytm sortowania wybierzesz i dlaczego?" Opisz swoje rozumowanie.',
              tagSlugs: ['sortowanie', 'intermediate'],
              solution: 'Odpowiedz: Uzyje Counting Sort lub Radix Sort. Uzasadnienie: 1) n = 10 milionow, k = 1000 (zakres wartosci). Counting Sort: O(n + k) = O(10M + 1000) ≈ O(n). To liniowe! Szybciej niz O(n log n) = O(10M * 23) ≈ 230M operacji. 2) Liczby calkowite o ograniczonym zakresie - idealny przypadek dla Counting Sort. 3) Pamiec: tablica zliczen ma rozmiar k = 1001 elementow - pomijalna. Algorytm: tworze tablice count[0..1000], zliczam wystapienia kazdej wartosci, potem odtwarzam posortowana tablice. Jezeli rekruter zapyta o stable sort lub potrzebuje sortowac obiekty po kluczu - Radix Sort lub Tim Sort.',
              points: 3,
              isPublished: false
            }
          ]
        }
      ]
    },

    // =========================================================
    // MODUL 4: Algorytmy Wyszukiwania i Kluczowe Wzorce
    // =========================================================
    {
      title: 'Modul 4: Algorytmy Wyszukiwania i Kluczowe Wzorce Algorytmiczne',
      order: 4,
      isPublished: false,

      lessons: [

        // -------------------------------------------------------
        // LEKCJA 4.1
        // -------------------------------------------------------
        {
          title: 'Lekcja 4.1: Linear Search vs Binary Search',
          order: 1,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Wyszukiwanie to jeden z fundamentalnych problemow w informatyce. Masz kolekcje danych i szukasz konkretnego elementu - jak to zrobic najefektywniej? Odpowiedz zalezy od **jednej kluczowej informacji: czy dane sa posortowane?** Jezeli nie - musisz sprawdzic kazdy element (O(n)). Jezeli tak - mozesz wielokrotnie eliminowac polowe danych (O(log n)). Ta roznica miedzy O(n) a O(log n) to roznica miedzy sprawdzeniem miliarda elementow lub 30 krokow.'
            },
            {
              blockType: 'text',
              content: '**Linear Search** (wyszukiwanie liniowe): sprawdz kazdy element po kolei. Proste, zawsze dziala, nie wymaga posortowanych danych. Zlozonosc: O(n). Kiedy uzywac: dane nieposortowane, maly zbior danych, szukasz czegos co nie jest oparte na kluczy posortowanym (np. znalezienie pierwszego elementu spelniajacego warunek). W JavaScript: arr.find(), arr.indexOf(), arr.includes() - wszystkie to linear search O(n).'
            },
            {
              blockType: 'text',
              content: '**Binary Search** (wyszukiwanie binarne): dziala TYLKO na posortowanych danych. Porownaj target z elementem srodkowym. Jezeli rowny - znalazles. Jezeli target < srodkowy - szukaj w lewej polowie. Jezeli target > srodkowy - szukaj w prawej polowie. Powtarzaj. Kazda iteracja eliminuje polowe pozostalych elementow.\n\n```\nfunction binarySearch(arr, target) {\n  let left = 0, right = arr.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;    // znaleziono\n    if (arr[mid] < target) left = mid + 1; // szukaj w prawej\n    else right = mid - 1;                  // szukaj w lewej\n  }\n  return -1; // nie znaleziono\n}\n```'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Wizualizacja Binary Search szukajacego wartosci 7 w tablicy [1, 3, 5, 7, 9, 11, 13]. Krok 1: left=0, right=6, mid=3, arr[3]=7=target - znaleziono! Drugi diagram pokazuje szukanie wartosci 5: Krok 1 mid=3, arr[3]=7>5 -> right=2. Krok 2 mid=1, arr[1]=3<5 -> left=2. Krok 3 mid=2, arr[2]=5=target. Kolorowe strzalki i zaznaczenie aktywnego obszaru poszukiwan w kazdym kroku.',
              align: 'center',
              width: 'lg'
            },
            {
              blockType: 'text',
              content: 'Dlaczego Binary Search to O(log n)? Zaczynamy od n elementow. Po 1 kroku: n/2. Po 2 krokach: n/4. Po k krokach: n/2^k. Szukamy az zostanie 1 element: n/2^k = 1, wiec k = log2(n). Przyklad: n = 1 000 000 000 (miliard elementow). Log2(10^9) ≈ 30. Trzydziesci krokow zamiast miliarda! To moc logarytmu.\n\n**Czesta pulapka**: warunek `left <= right` (nie `left < right`). Gdy `left === right`, wciaz jest jeden element do sprawdzenia. Uzywasz `<` i mozesz pominac poprawna odpowiedz. Testuj zawsze na tablicy jednoelementowej!'
            },
            {
              blockType: 'callout',
              variant: 'warning',
              title: 'Czesty bug: Integer Overflow przy obliczaniu mid',
              content: 'W C++/Java piszac `mid = (left + right) / 2` mozesz miec integer overflow gdy left i right sa bliskie MAX_INT. Bezpieczna wersja: `mid = left + (right - left) / 2`. W JavaScript nie ma tego problemu (liczby sa float64), ale warto znac poprawna forme na rozmowie - pokazuje ze myslisz o edge cases.'
            },
            {
              blockType: 'text',
              content: 'Binary Search ma wiele wariantow na rozmowach:\n\n- **Find First/Last Occurrence**: Znajdz pierwsze lub ostatnie wystapienie elementu w tablicy z duplikatami. Modyfikacja: gdy znajdziesz target, nie zwracaj od razu - kontynuuj przeszukiwanie w lewo/prawo.\n- **Search in Rotated Array**: Tablica posortowana i obrucona (np. [4,5,6,7,0,1,2]). Binary Search nadal dziala z modyfikacja - sprawdzaj ktora polowa jest posortowana.\n- **Binary Search on Answer**: Zamiast szukac w tablicy, binsearchwj po mozliwej odpowiedzi. Przyklad: "znajdz minimalna predkosc jedzenia bananow". Klasyczny wzorzec 2025!'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Ile krokow (maksymalnie) potrzebuje Binary Search dla tablicy 1024 elementow?',
              tagSlugs: ['binary-search', 'big-o', 'beginner'],
              choices: [
                '1024 krokow',
                '512 krokow',
                '10 krokow',
                '32 kroki'
              ],
              correctAnswer: '10 krokow',
              solution: 'Binary Search wykonuje log2(n) krokow. Log2(1024) = 10, bo 2^10 = 1024. Po kazdym kroku eliminujemy polowe elementow: 1024 -> 512 -> 256 -> 128 -> 64 -> 32 -> 16 -> 8 -> 4 -> 2 -> 1. Dokladnie 10 krokow. Dla porownania Linear Search moze potrzebowac 1024 krokow.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'Binary Search mozna zastosowac na nieposortowanej tablicy aby znalezc element w O(log n).',
              tagSlugs: ['binary-search', 'gotchas', 'beginner'],
              correctAnswer: 'false',
              solution: 'Falsz. Binary Search wymaga posortowanych danych - to absolutny warunek wstepny. Cala logika opiera sie na tym, ze jezeli element srodkowy jest mniejszy od targetu, target na pewno jest po prawej stronie. Bez posortowania ta zalozenie nie dziala i algorytm da bledne wyniki.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'Dlaczego w Binary Search bezpieczniej pisac `mid = left + (right - left) / 2` zamiast `mid = (left + right) / 2`?',
              tagSlugs: ['binary-search', 'gotchas', 'intermediate'],
              choices: [
                'Pierwsza wersja jest szybsza obliczeniowo',
                'Druga wersja moze spowodowac integer overflow w jezykach z ograniczonym int (Java, C++)',
                'Pierwsza wersja daje dokladniejszy wynik dla liczb float',
                'Nie ma roznicy, obie sa identyczne'
              ],
              correctAnswer: 'Druga wersja moze spowodowac integer overflow w jezykach z ograniczonym int (Java, C++)',
              solution: 'W Javie/C++ int ma zakres do ~2.1 miliarda. Gdy left i right sa bliskie MAX_INT, ich suma (left + right) moze przekroczyc zakres i stac sie ujemna (overflow). left + (right - left) / 2 oblicza to samo ale bez ryzyka overflow, bo (right - left) jest zawsze <= MAX_INT. W JavaScript nie ma tego problemu (Number to float64), ale znajomosc tego edge case imponuje rekruterom.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Wyjasnij wzorzec "Binary Search on Answer". Czym rozni sie od standardowego Binary Search? Podaj przykladowy problem, gdzie go mozna zastosowac.',
              tagSlugs: ['binary-search', 'wzorce-algorytmiczne', 'advanced'],
              solution: 'Standardowy Binary Search szuka wartosci w posortowanej tablicy. Binary Search on Answer zamiast tego przeszukuje **przestrzen mozliwych odpowiedzi**. Warunek: musi istniecs funkcja "czy ta odpowiedz jest mozliwa?" ktora ma wlasnosc monotoniczna (jezeli X jest mozliwa, to Y > X tez jest mozliwa - lub odwrotnie). Przyklad: "Koko zjada banany z przetkosc k bananow/h. Ile ma stosow o roznych rozmiarach, musi skonczyc w h godzin. Znajdz minimalne k." Zamiast szukac k w tablicy, robimy binary search po wartosci k (od 1 do max(piles)). Dla kazdego k sprawdzamy czy Koko zdazy - jezeli tak, probujemy mniejsze k; jezeli nie, probujemy wieksze. O(n log m) gdzie m to zakres mozliwych odpowiedzi.',
              points: 2,
              isPublished: false
            }
          ]
        },

        // -------------------------------------------------------
        // LEKCJA 4.2
        // -------------------------------------------------------
        {
          title: 'Lekcja 4.2: Two Pointers Pattern - elegancja w O(n)',
          order: 2,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Two Pointers to jeden z najpotezniejszych i najczesciej uzywanych wzorcow w algorytmach tablicowych. Idea: zamiast jednej petli przegladas wspolna z brute force O(n^2), uzywamy dwoch wskaznikow ktore razem "przechodza" dane - kazdy element jest odwiedzany co najwyzej raz. Wynik: O(n) zamiast O(n^2). To chyba najlepszy przyklad jak elegancka obserwacja zamienia nieefektywne rozwiazanie w optymalne.'
            },
            {
              blockType: 'text',
              content: 'Dwa warianty Two Pointers:\n\n**1) Opposite Direction (ku sobie)**: Lewy wskaznik startuje od 0, prawy od n-1. Poruszaja sie ku sobie az sie spotkaja. Uzycie: problemy na posortowanych tablicach, palindromy, Two Sum na posortowanej.\n\n**2) Same Direction (w tym samym kierunku / Fast-Slow)**: Oba wskazniki startuja z lewej, ale jeden przesuwa sie szybciej. "Slow" to czesto wskaznik do "poprawnej" pozycji, "fast" skanuje elementy. Uzycie: usuwanie duplikatow, partycja, cykl w linked list.'
            },
            {
              blockType: 'text',
              content: 'Przyklad klasyczny - Two Sum na posortowanej tablicy:\n\n```\nfunction twoSumSorted(arr, target) {\n  let left = 0, right = arr.length - 1;\n  while (left < right) {\n    const sum = arr[left] + arr[right];\n    if (sum === target) return [left, right]; // znaleziono!\n    if (sum < target) left++;  // suma za mala - zwiekszamy lewa\n    else right--;              // suma za duza - zmniejszamy prawa\n  }\n  return []; // nie znaleziono\n}\n```\nDlaczego to dziala? Tablica posortowana gwarantuje ze: jezeli suma < target, jedynym sposobem na zwiekszenie sumy jest przesuniecie lewego wskaznika w prawo (wiekszy element). Jezeli suma > target, jedynym sposobem na zmniejszenie jest przesuniecie prawego w lewo. O(n) time, O(1) space.'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Diagram Two Pointers Opposite Direction dla Two Sum. Tablica [1, 3, 5, 7, 9, 11], target = 10. Krok 1: L=0 (1), R=5 (11), suma=12>10 -> R--. Krok 2: L=0 (1), R=4 (9), suma=10=target - znaleziono! Strzalki L i R nad tablica, zaznaczony biezacy krok. Drugi mini-diagram pokazujacy Same Direction Two Pointers przy usuwaniu duplikatow z [1,1,2,3,3,4]: slow wskazuje na ostatni "dobry" element, fast skanuje.',
              align: 'center',
              width: 'lg'
            },
            {
              blockType: 'text',
              content: 'Usuwanie duplikatow z posortowanej tablicy in-place (klasyczne pytanie!):\n\n```\nfunction removeDuplicates(arr) {\n  if (arr.length === 0) return 0;\n  let slow = 0; // wskazuje na ostatni unikalny element\n  for (let fast = 1; fast < arr.length; fast++) {\n    if (arr[fast] !== arr[slow]) { // nowy unikalny element\n      slow++;\n      arr[slow] = arr[fast];\n    }\n    // jezeli duplikat - fast skacze, slow stoi\n  }\n  return slow + 1; // liczba unikalnych elementow\n}\n// [1, 1, 2, 3, 3, 4] -> [1, 2, 3, 4, _, _], zwraca 4\n```\nSlow = wskaznik zapisu (gdzie piszemy nastepny unikalny), Fast = wskaznik odczytu (co aktualnie sprawdzamy). O(n) time, O(1) space.'
            },
            {
              blockType: 'callout',
              variant: 'info',
              title: 'Sygnatury Two Pointers w tresci zadania',
              content: 'Jak rozpoznac kiedy uzyc Two Pointers? Kluczowe slowa: "posortowana tablica", "para elementow", "palindrome", "container with most water", "remove duplicates in-place", "partition array". Jezeli zadanie mowi ze mozna modyfikowac tablice in-place i pracujesz na posortowanych danych - prawie zawsze to Two Pointers.'
            },
            {
              blockType: 'text',
              content: 'Inne klasyczne problemy Two Pointers:\n\n- **Container With Most Water**: Dwa wskazniki od krawedzi, zawsze przesuwaj krotszy slup. Dlaczego? Przesuwanie dluzszego slupa nigdy nie moze zwiekszyc obszaru (ograniczony krotszym i odleglosc maleje).\n- **3Sum**: Dla kazdego elementu (jako trzeci), uzyj Two Pointers na pozostalej czesci. O(n^2) total.\n- **Trapping Rain Water**: Precompute maxLeft i maxRight, lub uzyj two pointers z biezacymi maksimami - O(n) time, O(1) space.\n- **Valid Palindrome**: Lewy od 0, prawy od n-1, porownuj i zbliazaj ku sobie, ignoruj non-alphanumeric.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Jaka jest time complexity Two Sum uzywanego z Two Pointers na posortowanej tablicy vs brute force?',
              tagSlugs: ['two-pointers', 'big-o', 'beginner'],
              choices: [
                'Two Pointers: O(n^2), Brute Force: O(n)',
                'Two Pointers: O(n log n), Brute Force: O(n^2)',
                'Two Pointers: O(n), Brute Force: O(n^2)',
                'Oba: O(n log n)'
              ],
              correctAnswer: 'Two Pointers: O(n), Brute Force: O(n^2)',
              solution: 'Brute Force Two Sum: dwie zagniezdzone petle - sprawdz kazda pare O(n^2). Two Pointers na posortowanej: jeden przejazd, lewwy i prawy wskaznik poruszaja sie ku sobie, kazdy element odwiedzany raz - O(n). Nalezy pamietac ze jezeli dane nie sa posortowane, trzeba je najpierw posortowac O(n log n), wiec lacznie O(n log n). Dla niesort. danych Hash Map O(n) jest lepszy niz Two Pointers O(n log n).',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'Wzorzec Two Pointers Same Direction (slow/fast) moze byc uzywany do wykrywania cyklu w Linked List.',
              tagSlugs: ['two-pointers', 'fast-slow-pointers', 'intermediate'],
              correctAnswer: 'true',
              solution: 'Prawda. To algorytm Floyda (Cycle Detection). Slow przesuwa sie o 1 krok, fast o 2 kroki. Jezeli jest cykl, fast w koncu "dogoni" slow - spotkaja sie na tym samym wezle. Jezeli listy nie ma cyklu, fast dotrze do null. O(n) time, O(1) space - lepsza od podejscia z hash set O(n) space.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'W zadaniu "Remove Duplicates from Sorted Array" z Two Pointers (slow/fast), co oznacza wskaznik "slow"?',
              tagSlugs: ['two-pointers', 'array', 'beginner'],
              choices: [
                'Ostatnio odczytany element',
                'Pozycja gdzie powinien byc wpisany nastepny unikalny element',
                'Aktualnie przetwarzany element',
                'Srodek tablicy'
              ],
              correctAnswer: 'Pozycja gdzie powinien byc wpisany nastepny unikalny element',
              solution: '"Slow" (lub "write pointer") wskazuje gdzie wpisac nastepny unikalny element. Zaczyna od 0. "Fast" (read pointer) skanuje do przodu i gdy znajdzie element rozny od arr[slow], wpisuje go pod arr[slow+1] i inkrementuje slow. Dzieki temu unikalne elementy zbierane sa na poczatku tablicy in-place w O(n) time, O(1) space.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Opisz jak rozwiazac problem "Valid Palindrome" sprawdzajac czy string (ignorujac spacje i interpunkcje, case-insensitive) jest palindromem. Uzyj Two Pointers i opisz zlozonosc.',
              tagSlugs: ['two-pointers', 'intermediate'],
              solution: 'Algorytm: 1) Inicjalizuj left=0, right=s.length-1. 2) W petli (left < right): przesun left w prawo jezeli s[left] nie jest alphanumeric. Przesun right w lewo jezeli s[right] nie jest alphanumeric. Gdy oba wskazuja na alphanumeric: porownaj s[left].toLowerCase() z s[right].toLowerCase(). Jezeli rozne - nie jest palindromem (return false). Jezeli takie same - left++, right--. 3) Jezeli petla sie skonczyla bez returna - return true. Zlozonosc: O(n) time - kazdy znak odwiedzany co najwyzej raz. O(1) space - tylko dwa wskazniki. Przyklad: "A man, a plan, a canal: Panama" -> po oczyszczeniu "amanaplanacanalpanama" -> palindrom.',
              points: 2,
              isPublished: false
            }
          ]
        },

        // -------------------------------------------------------
        // LEKCJA 4.3
        // -------------------------------------------------------
        {
          title: 'Lekcja 4.3: Sliding Window - okno ktore przesuwa wszystko',
          order: 3,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Sliding Window (przesuwa okno) to wzorzec do rozwiazywania problemow dotyczacych **ciagłych podtablic lub podstringow**. Wyobraz sobie "okno" pewnej szerokosci, ktore przesuwa sie po tablicy od lewej do prawej. Zamiast za kazdym razem przeliczac wszystko od nowa (brute force O(n^2) lub O(n^3)), uzywamy informacji z poprzedniej pozycji okna - dodajemy nowy element z prawej i usuwamy stary z lewej. Kazdy element jest przetwarzany co najwyzej dwa razy: raz przy dodaniu, raz przy usuniecia. Wynik: O(n).'
            },
            {
              blockType: 'text',
              content: 'Dwa warianty okna:\n\n**1) Fixed Size Window**: Okno stalej szerokosci k. Przyklad: "znajdz maximum sumy podtablicy dlugosci k".\n```\nfunction maxSumSubarray(arr, k) {\n  let windowSum = 0;\n  for (let i = 0; i < k; i++) windowSum += arr[i]; // pierwsze okno\n  let maxSum = windowSum;\n  for (let i = k; i < arr.length; i++) {\n    windowSum += arr[i] - arr[i - k]; // dodaj nowy, usun stary\n    maxSum = Math.max(maxSum, windowSum);\n  }\n  return maxSum;\n}\n```\n**2) Variable Size Window**: Okno zmiennego rozmiaru spelniajace warunek. Lewy i prawy wskaznik, prawy sie zawsze przesuwa, lewy gdy warunek przestaje byc spelniany.'
            },
            {
              blockType: 'text',
              content: 'Klasyczny przyklad Variable Window: **Longest Substring Without Repeating Characters**:\n```\nfunction lengthOfLongestSubstring(s) {\n  const seen = new Map(); // znak -> ostatni indeks\n  let left = 0, maxLen = 0;\n  for (let right = 0; right < s.length; right++) {\n    if (seen.has(s[right]) && seen.get(s[right]) >= left) {\n      left = seen.get(s[right]) + 1; // przesun lewy za duplikat\n    }\n    seen.set(s[right], right);\n    maxLen = Math.max(maxLen, right - left + 1);\n  }\n  return maxLen;\n}\n```\nKazdy znak dodajemy do mapy. Gdy natrafiamy na duplikat ktory jest w biezacym oknie (>= left), przesuwamy left za jego poprzednie wystapienie. O(n) time, O(k) space gdzie k to liczba unikalnych znakow.'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Diagram Sliding Window dla Longest Substring bez powtorzen na stringu "abcabcbb". Seria krokow: krok 1: okno "a" (L=0, R=0). Krok 2: "ab" (L=0, R=1). Krok 3: "abc" (L=0, R=2) - maxLen=3. Krok 4: R=3, napotykamy "a" ktore jest w oknie, L przesuwa sie na 1. Okno "bca" (L=1, R=3). Strzalki L i R nad znakami, zaznaczony aktywny zakres okna.',
              align: 'center',
              width: 'lg'
            },
            {
              blockType: 'table',
              caption: 'Klasyczne problemy Sliding Window',
              hasHeaders: true,
              headers: ['Problem', 'Typ okna', 'Zlozonosc', 'Kluczowa technika'],
              rows: [
                ['Max Sum Subarray of Size K', 'Fixed', 'O(n)', 'Dodaj nowy, usun stary element'],
                ['Longest Substr. bez powtorzen', 'Variable', 'O(n)', 'HashMap znak -> ostatni indeks'],
                ['Minimum Window Substring', 'Variable', 'O(n)', 'Frequency map + licznik'],
                ['Max Sum Subarray (Kadane)', 'Variable', 'O(n)', 'Zresetuj okno gdy suma < 0'],
                ['Fruit Into Baskets', 'Variable', 'O(n)', 'Max 2 unikalne w oknie']
              ]
            },
            {
              blockType: 'callout',
              variant: 'tip',
              title: 'Jak rozpoznac problem Sliding Window?',
              content: 'Kluczowe slowa w zadaniu: "podtablica" (subarray), "podstring" (substring), "ciagla sekwencja" (contiguous), "najdluzszy/najkrotszy spelniajacy warunek", "maximum/minimum w oknie k". Jezeli problem dotyczy ciaglosci i szukasz optimum - pomysl Sliding Window. Jezeli okno ma stala szerokosc - fixed. Jezeli musi spelniac warunek - variable.'
            },
            {
              blockType: 'text',
              content: '**Kadane\'s Algorithm** to specjalny przypadek Sliding Window dla **Maximum Subarray** (znajdz podtablice o maksymalnej sumie):\n```\nfunction maxSubarray(arr) {\n  let currentSum = arr[0];\n  let maxSum = arr[0];\n  for (let i = 1; i < arr.length; i++) {\n    // czy zaczynamy od nowa czy kontynuujemy?\n    currentSum = Math.max(arr[i], currentSum + arr[i]);\n    maxSum = Math.max(maxSum, currentSum);\n  }\n  return maxSum;\n}\n```\nKluczowa decyzja: jezeli currentSum + arr[i] < arr[i], lepiej zaczac nowe okno od arr[i] (stary nie pomaga). O(n) time, O(1) space. To jedno z najbardziej eleganckich rozwiazан w algorytmice.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Jaka jest time complexity algorytmu Sliding Window (Variable Size) dla problemu Longest Substring Without Repeating Characters?',
              tagSlugs: ['sliding-window', 'big-o', 'beginner'],
              choices: [
                'O(n^2) - dla kazdego znaku sprawdzamy cale okno',
                'O(n log n) - sortujemy znaki w oknie',
                'O(n) - kazdy znak dodawany i usuwany co najwyzej raz',
                'O(n * k) gdzie k to liczba unikalnych znakow'
              ],
              correctAnswer: 'O(n) - kazdy znak dodawany i usuwany co najwyzej raz',
              solution: 'Kluczowa wlasnosc Sliding Window: lewy wskaznik porusza sie tylko w prawo, prawy tylko w prawo. Kazdy znak jest dodawany do okna dokladnie raz (right++) i usuwany dokladnie raz (left++). Lacznie 2n operacji = O(n). HashMap daje O(1) lookup i insert, wiec calkowita zlozonosc to O(n).',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'Masz tablice [-2, 1, -3, 4, -1, 2, 1, -5, 4]. Jaka jest maksymalna suma ciagłej podtablicy (Maximum Subarray)?',
              tagSlugs: ['sliding-window', 'beginner'],
              choices: [
                '4',
                '5',
                '6',
                '7'
              ],
              correctAnswer: '6',
              solution: 'Odpowiedz: 6, dla podtablicy [4, -1, 2, 1]. Kadane\'s Algorithm: start currentSum=maxSum=-2. i=1: max(1, -2+1=-1)=1, maxSum=1. i=2: max(-3, 1-3=-2)=-2, maxSum=1. i=3: max(4, -2+4=2)=4, maxSum=4. i=4: max(-1, 4-1=3)=3, maxSum=4. i=5: max(2, 3+2=5)=5, maxSum=5. i=6: max(1, 5+1=6)=6, maxSum=6. i=7: max(-5, 6-5=1)=1, maxSum=6. i=8: max(4, 1+4=5)=5, maxSum=6. Wynik: 6.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'Sliding Window Fixed Size zawsze dziala w O(n) niezaleznie od rozmiaru okna k.',
              tagSlugs: ['sliding-window', 'big-o', 'beginner'],
              correctAnswer: 'true',
              solution: 'Prawda. Sliding Window Fixed Size przetwarza kazdy element dokladnie dwa razy (raz przy dodaniu do okna, raz przy usuniecia). Niezaleznie od k, calkowita liczba operacji to 2n = O(n). Brute Force dla tego samego problemu bylby O(n*k) - dla kazdego okna sumuje k elementow od nowa.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Wytlumacz Kadane\'s Algorithm dla Maximum Subarray. Jaka jest kluczowa decyzja w kazdym kroku i dlaczego jest poprawna? Podaj zlozonosc.',
              tagSlugs: ['sliding-window', 'dynamic-programming', 'intermediate'],
              solution: 'Kadane\'s Algorithm: w kazdym kroku i podejmujemy decyzje: "czy dolaczamy arr[i] do biezacej podtablicy, czy zaczynamy nowa podtablice od arr[i]?" Formalnie: currentSum = max(arr[i], currentSum + arr[i]). Uzasadnienie: jezeli currentSum < 0, dodanie jej do arr[i] zmniejsza wynik - lepiej zaczac od nowa. Jezeli currentSum >= 0, dolaczenie tylko pomoze lub bedzie neutralne. Aktualizujemy maxSum = max(maxSum, currentSum). Zlozonosc: O(n) time - jeden przejazd. O(1) space - tylko dwie zmienne. To faktycznie specjalny przypadek 1D Dynamic Programming gdzie dp[i] = max subarray konczacy sie na indeksie i, a dp[i] = max(arr[i], dp[i-1] + arr[i]).',
              points: 2,
              isPublished: false
            }
          ]
        },

        // -------------------------------------------------------
        // LEKCJA 4.4
        // -------------------------------------------------------
        {
          title: 'Lekcja 4.4: Fast and Slow Pointers - wykrywanie cykli i wiecej',
          order: 4,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Fast and Slow Pointers (znane tez jako "Tortoise and Hare" - Zolw i Zajac) to specjalizowany wariant Two Pointers, gdzie jeden wskaznik porusza sie dwa razy szybciej od drugiego. Choc brzmi prosto, ten wzorzec rozwiazuje kilka klas problemow, ktore inaczej wymagalyby dodatkowej pamieci lub skomplikowanego kodu. Kluczowe zastosowania: wykrywanie cykli (Linked List i grafy), znajdowanie srodka listy, oraz k-ty element od konca.'
            },
            {
              blockType: 'text',
              content: '**Wykrywanie cyklu (Cycle Detection) - algorytm Floyda**:\n```\nfunction hasCycle(head) {\n  let slow = head, fast = head;\n  while (fast !== null && fast.next !== null) {\n    slow = slow.next;       // krok 1\n    fast = fast.next.next;  // krok 2\n    if (slow === fast) return true; // spotkali sie - jest cykl!\n  }\n  return false; // fast dotarl do null - brak cyklu\n}\n```\nDlaczego to dziala? Jezeli jest cykl, fast i slow obydwa wejda do cyklu. Fast goni slow ze stalym "tempem" (fast - slow = 1 wezel/krok w cyklu). Wiec za co najwyzej dlugosc cyklu krokow, fast "oklazy" slow i je dogoni. Time: O(n), Space: O(1).'
            },
            {
              blockType: 'text',
              content: '**Znalezienie srodka Linked List**:\n```\nfunction findMiddle(head) {\n  let slow = head, fast = head;\n  while (fast !== null && fast.next !== null) {\n    slow = slow.next;\n    fast = fast.next.next;\n  }\n  return slow; // slow jest w srodku gdy fast dotarl do konca\n}\n```\nKiedy fast przebywa cala liste (n krokow), slow przebywa polowe (n/2 krokow). Wiec slow jest w srodku! Dla nieparzystej dlugosci - dokladny srodek. Dla parzystej - drugi ze srodkowych wezlow. Uzywane w: Merge Sort dla Linked List, Palindrome Linked List check.'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Dwa diagramy Fast and Slow Pointers. Diagram 1 - Cycle Detection: Linked List z cyklem (1->2->3->4->5->3). Slow i Fast startuja na 1. Strzalki pokazujace ruch po krokach: krok 1 slow=2, fast=3; krok 2 slow=3, fast=5; krok 3 slow=4, fast=4 - SPOTKANIE. Krok 4 slow=5, fast=3; ruch w cyklu. Diagram 2 - Finding Middle: lista 1->2->3->4->5. Slow i Fast krok po kroku, slow zatrzymuje sie na 3 gdy fast na 5.',
              align: 'center',
              width: 'lg'
            },
            {
              blockType: 'text',
              content: '**Bonus: Znajdowanie punktu wejscia do cyklu** (nie tylko "czy jest cykl", ale "gdzie zaczyna sie cykl?"):\n\n```\nfunction detectCycleStart(head) {\n  let slow = head, fast = head;\n  // Faza 1: znajdz punkt spotkania\n  while (fast && fast.next) {\n    slow = slow.next;\n    fast = fast.next.next;\n    if (slow === fast) break;\n  }\n  if (!fast || !fast.next) return null; // brak cyklu\n  // Faza 2: slow wraca na head, oba krok po kroku\n  slow = head;\n  while (slow !== fast) {\n    slow = slow.next;\n    fast = fast.next; // teraz oba krok 1\n  }\n  return slow; // poczatek cyklu\n}\n```\nMatematyczne uzasadnienie: jesli F = odleglosc head->start cyklu, C = dlugosc cyklu. Slow przebyl F+a kroków, fast F+a+nC. Fast = 2*slow => F+a+nC = 2(F+a) => F = nC-a. Wiec gdy slow idzie od head a fast od punktu spotkania (oba po 1 kroku), spotykaja sie na starcie cyklu!'
            },
            {
              blockType: 'callout',
              variant: 'info',
              title: 'Happy Number jako cykl',
              content: 'Problem "Happy Number": Liczba jest "szczesliwa" jezeli wielokrotne sumowanie kwadratow cyfr ostatecznie daje 1. Jezeli nie, wpada w cykl. Rozwiazanie: uzyj Fast and Slow Pointers na tej "sekwencji liczb"! Slow i fast sa liczbami a nie wezlami listy. Slow = next(slow), fast = next(next(fast)). Jezeli spotkaja sie na 1 - szczesliwa. Jezeli spotkaja sie gdzie indziej - cykl, nie szczesliwa. O(log n) time, O(1) space vs O(log n) space z hash set.'
            },
            {
              blockType: 'callout',
              variant: 'tip',
              title: 'Sygnatury Fast and Slow na rozmowie',
              content: 'Uzyj Fast and Slow gdy problem dotyczy: cyklu w sekwencji (linked list, ciag liczb), srodka listy, k-tego elementu od konca bez znajomosci dlugosci, lub gdy potrzebujesz O(1) space zamiast hash set do sledzenia. Jezeli rekruter pyta "czy mozesz to zrobic bez dodatkowej pamieci?" przy problemie z cyklami - Fast and Slow jest odpowiedzia.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Jaka jest space complexity algorytmu Floyda (Fast & Slow Pointers) do wykrywania cyklu w porownaniu do podejscia z Hash Set?',
              tagSlugs: ['fast-slow-pointers', 'space-complexity', 'beginner'],
              choices: [
                'Floyd: O(n), Hash Set: O(1)',
                'Floyd: O(1), Hash Set: O(n)',
                'Oba: O(n)',
                'Oba: O(1)'
              ],
              correctAnswer: 'Floyd: O(1), Hash Set: O(n)',
              solution: 'Algorytm Floyda uzywa tylko dwoch wskaznikow (slow i fast) - O(1) space. Podejscie z Hash Set dodaje kazdy odwiedzony wezel do zbioru i sprawdza czy wezel juz jest w zbiorze - w najgorszym przypadku O(n) space (gdy brak cyklu lub cykl na koncu). To kluczowa zaleta Floyda: osiaga ten sam wynik bez dodatkowej pamieci.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'Gdy Fast Pointer (krok o 2) i Slow Pointer (krok o 1) spotkaja sie, zawsze sa na srodku listy.',
              tagSlugs: ['fast-slow-pointers', 'gotchas', 'intermediate'],
              correctAnswer: 'false',
              solution: 'Falsz. Fast i Slow spotykaja sie na srodku TYLKO jezeli lista nie ma cyklu i algorytm jest uzywany do znalezienia srodka (fast dotarl do konca). Jezeli lista MA cykl, spotkanie nastepuje wewnatrz cyklu - niekoniecznie na srodku. Wazne jest rozroznienie dwoch zastosowan: znalezienie srodka vs wykrywanie cyklu.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'Jak znalezc k-ty element od konca Linked List w jednym przejsciu (bez znajomosci dlugosci listy)?',
              tagSlugs: ['fast-slow-pointers', 'linked-list', 'intermediate'],
              choices: [
                'Odwroc liste, potem przejdz k krokow od nowa',
                'Przejdz liste raz, zapamietaj wszystkie wezly w tablicy, zwroc arr[n-k]',
                'Ustaw fast k krokow przed slow; gdy fast = null, slow wskazuje na k-ty od konca',
                'Uzyj rekurencji - wracajac liczone sa kroki od konca'
              ],
              correctAnswer: 'Ustaw fast k krokow przed slow; gdy fast = null, slow wskazuje na k-ty od konca',
              solution: 'Algorytm: 1) Przesun fast o k krokow od head. 2) Przesun oba (slow i fast) o 1 krok jednoczesnie az fast = null. 3) Slow wskazuje na k-ty od konca. Dlaczego? Gdy fast dotrze do konca, slow jest o dokladnie k pozycji za fast - czyli k elementow od konca. O(n) time, O(1) space, jeden przejazd.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Opisz jak mozna uzyc Fast and Slow Pointers do sprawdzenia czy Linked List jest palindromem (bez dodatkowej tablicy/stosu). Jaka jest zlozonosc?',
              tagSlugs: ['fast-slow-pointers', 'linked-list', 'intermediate'],
              solution: 'Algorytm (O(n) time, O(1) space): 1) Znajdz srodek listy uzywajac Fast and Slow Pointers (slow bedzie na srodku gdy fast na koncu). 2) Odwroc druga polowe listy (od slow.next do konca) in-place uzywajac trzech wskaznikow (prev, curr, next). 3) Porownuj pierwsza polowe (od head) z odwrocona druga polowa jednoczesnie z dwoch konc. Jezeli wszystkie pary pasuja - palindrom. 4) (Opcjonalnie) Przywroc liste do oryginalnego stanu (odwroc znowu). Time: O(n) - kazdy krok jest O(n). Space: O(1) - brak dodatkowych struktur. Alternatywa nieoptymalna: kopiuj do tablicy i sprawdz palindrom - O(n) space.',
              points: 3,
              isPublished: false
            }
          ]
        }
      ]
    }
  ]
};
