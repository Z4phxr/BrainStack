// data/courses/dsa-course-pt3.js
// MODUL 5: Drzewa (Trees)
// MODUL 6: Grafy (Graphs)

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
    // MODUL 5: Drzewa (Trees)
    // =========================================================
    {
      title: 'Modul 5: Drzewa - Binary Trees, BST, Heaps',
      order: 5,
      isPublished: false,

      lessons: [

        // -------------------------------------------------------
        // LEKCJA 5.1
        // -------------------------------------------------------
        {
          title: 'Lekcja 5.1: Binary Trees - podstawy i traversals (DFS i BFS)',
          order: 1,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Drzewa to hierarchiczne struktury danych wszechobecne w informatyce: drzewo systemow plikow, DOM w przegladarce, drzewo skladniowe jezyka programowania, hierarchia klas w OOP. **Binary Tree** (drzewo binarne) to drzewo gdzie kazdy wezel ma co najwyzej dwoje dzieci: **lewe** i **prawe**. Kazdy wezel zawiera: wartosc (val), referencje do lewego dziecka (left), referencje do prawego dziecka (right). Wezel bez rodzica to **korzen** (root), wezly bez dzieci to **liscie** (leaves).'
            },
            {
              blockType: 'text',
              content: 'Podstawowa terminologia drzew:\n\n- **Korzen (Root)**: Wezel na szczycie - jedyny bez rodzica\n- **Rodzic (Parent)** / **Dziecko (Child)**: Relacja miedzy polaczonymi wezlami\n- **Lisc (Leaf)**: Wezel bez dzieci\n- **Wysokosc drzewa (Height)**: Najdluzsa sciezka od korzenia do liscia\n- **Glebokosc wezla (Depth)**: Odleglosc od korzenia do danego wezla\n- **Poddrzewo (Subtree)**: Wezel i wszyscy jego potomkowie\n- **Zbalansowane drzewo**: Wysokosc lewego i prawego poddrzewa rozni sie co najwyzej o 1\n\nKluczowe rownanie: drzewo o n wezlach ma **n-1 krawedzi**.'
            },
            {
              blockType: 'text',
              content: 'Typy Binary Tree:\n\n- **Full Binary Tree**: Kazdy wezel ma 0 lub 2 dzieci (nigdy 1)\n- **Complete Binary Tree**: Wszystkie poziomy pelne oprocz ostatniego, ktory wypelniony jest od lewej\n- **Perfect Binary Tree**: Wszystkie poziomy w pelni zapelnione. n wezlow = 2^(h+1) - 1\n- **Balanced Binary Tree**: |height(left) - height(right)| <= 1 dla kazdego wezla (AVL Tree, Red-Black Tree)\n- **Degenerate Tree**: Kazdy wezel ma co najwyzej jedno dziecko - faktycznie Linked List! O(n) dla wszystkich operacji zamiast O(log n).'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Diagram czterech typow Binary Tree obok siebie. 1) Full Binary Tree: korzen z 2 dziecmi, kazde dziecko ma 0 lub 2 dzieci. 2) Complete Binary Tree: wszystkie poziomy pelne oprocz ostatniego, ostatni wypelniony od lewej. 3) Perfect Binary Tree: wszystkie poziomy pelne - symetryczny trojkat. 4) Degenerate Tree: kazdy wezel ma jedno prawe dziecko - wyglada jak lista. Kazdy typ opatrzony etykieta i krotkim opisem pod spodem.',
              align: 'center',
              width: 'lg'
            },
            {
              blockType: 'text',
              content: '**Traversals (Przechodzenie drzewa)** - 4 sposoby odwiedzenia wszystkich wezlow:\n\n**DFS - Depth First Search** (rekurencja lub stos):\n- **Inorder** (Lewy, Korzen, Prawy): Dla BST daje elementy **posortowane rosnaco**!\n- **Preorder** (Korzen, Lewy, Prawy): Uzywane do kopiowania drzewa, serializacji\n- **Postorder** (Lewy, Prawy, Korzen): Uzywane do usuwania drzewa, obliczania rozmiarow poddrzew\n\n**BFS - Breadth First Search** (kolejka):\n- **Level Order**: Odwiedzamy wezly poziom po poziomie. Uzywane do: najkrotszej sciezki, sprawdzenia czy drzewo zbalansowane, widok z boku drzewa (right side view).'
            },
            {
              blockType: 'text',
              content: 'Implementacja DFS rekurencyjnie:\n```\n// Inorder traversal\nfunction inorder(root) {\n  if (!root) return [];\n  return [\n    ...inorder(root.left),\n    root.val,\n    ...inorder(root.right)\n  ];\n}\n\n// Preorder traversal\nfunction preorder(root) {\n  if (!root) return [];\n  return [\n    root.val,\n    ...preorder(root.left),\n    ...preorder(root.right)\n  ];\n}\n```\nBFS z kolejka:\n```\nfunction levelOrder(root) {\n  if (!root) return [];\n  const result = [];\n  const queue = [root];\n  while (queue.length > 0) {\n    const levelSize = queue.length;\n    const level = [];\n    for (let i = 0; i < levelSize; i++) {\n      const node = queue.shift();\n      level.push(node.val);\n      if (node.left) queue.push(node.left);\n      if (node.right) queue.push(node.right);\n    }\n    result.push(level);\n  }\n  return result;\n}\n```'
            },
            {
              blockType: 'callout',
              variant: 'tip',
              title: 'Zlota regula drzew na rozmowie: DFS vs BFS',
              content: 'DFS (rekurencja): gdy problem dotyczy sciezek od korzenia do lisci, wlasciwosci poddrzew, high/max depth, sprawdzenia symetrii. Dziala naturalnie rekurencyjnie - "mysl lokalnie". BFS (kolejka): gdy problem dotyczy najkrotszej sciezki, poziomu wezla, widoku z boku, minimalnej glebokosci. "Mysl warstwami". Zasada kciuka: jezeli nie wiesz - zacznij od DFS, jest prostszy do implementacji.'
            },
            {
              blockType: 'callout',
              variant: 'warning',
              title: 'Baza rekurencji: null check ZAWSZE pierwszy',
              content: 'Kazda funkcja rekurencyjna na drzewie musi zaczac od sprawdzenia if (!root) return [odpowiednia_wartosc]. Zapomnienie o tym to gwarantowany blad na rozmowie. Co zwrocic dla null? Zalezy: dla sumy zwroc 0, dla tablicy zwroc [], dla bool zwroc true (lub false - zalezy od logiki), dla height zwroc -1 lub 0. Przemysl to przed napisaniem kodu.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Dla Binary Search Tree z wartosciami [5, 3, 7, 1, 4], w jakiej kolejnosci zwroci elementy Inorder traversal?',
              tagSlugs: ['binary-tree', 'tree-traversal', 'beginner'],
              choices: [
                '5, 3, 7, 1, 4',
                '1, 3, 4, 5, 7',
                '5, 3, 1, 4, 7',
                '1, 4, 3, 7, 5'
              ],
              correctAnswer: '1, 3, 4, 5, 7',
              solution: 'Inorder traversal (Lewy, Korzen, Prawy) dla BST zawsze zwraca elementy posortowane rosnaco. Dla drzewa z korzeniem 5, lewym poddrzewem (3 -> 1, 4) i prawym 7: najpierw odwiedzamy 1 (lewy lisci), potem 3 (korzen), potem 4 (prawy), potem 5 (korzen calego), potem 7. Wynik: 1, 3, 4, 5, 7.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'Ktory traversal uzywany jest w BFS (Breadth-First Search) na drzewie?',
              tagSlugs: ['binary-tree', 'bfs', 'beginner'],
              choices: [
                'Inorder',
                'Preorder',
                'Postorder',
                'Level Order'
              ],
              correctAnswer: 'Level Order',
              solution: 'BFS na drzewie to Level Order Traversal - odwiedzamy wezly poziom po poziomie (wszystkie wezly na glebokosci 1, potem 2, potem 3...). Wymaga kolejki (queue). DFS (Inorder, Preorder, Postorder) jest zazwyczaj implementowany rekurencyjnie lub ze stosem.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'Drzewo zdegenerowane (degenerate tree), gdzie kazdy wezel ma tylko jedno dziecko, ma takie same zlozonosci operacji jak Linked List.',
              tagSlugs: ['binary-tree', 'big-o', 'intermediate'],
              correctAnswer: 'true',
              solution: 'Prawda. Zdegenerowane drzewo jest efektywnie lista polaczona. Wyszukiwanie, wstawianie i usuwanie to O(n) (trzeba przejsc cala "liste"), zamiast O(log n) w zbalansowanym drzewie. To pokazuje dlaczego balansowanie drzewa (AVL, Red-Black) jest kluczowe dla zachowania O(log n) operacji.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 4,
              prompt: 'Ktory traversal najlepiej nadaje sie do obliczenia sumy wszystkich wezlow drzewa?',
              tagSlugs: ['binary-tree', 'tree-traversal', 'beginner'],
              choices: [
                'Inorder - bo odwiedza wszystkie wezly posortowane',
                'Preorder - bo korzen jest pierwszy',
                'Postorder - bo suma dzieci jest liczona przed korzeniem',
                'Dowolny traversal - wynik bedzie taki sam'
              ],
              correctAnswer: 'Dowolny traversal - wynik bedzie taki sam',
              solution: 'Do obliczenia sumy wszystkich wezlow wystarczy odwiedzic kazdy wezel dokladnie raz i dodac jego wartosc. Kolejnosc odwiedzania nie ma znaczenia - suma jest przemienna. Mozesz uzyc Inorder, Preorder, Postorder lub Level Order - wynik bedzie identyczny. Wazne by NIE pominac zadnego wezla.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 5,
              prompt: 'Napisz (pseudokodem lub kodem) funkcje obliczajaca wysokosc Binary Tree (maksymalna glebokosc). Wyjasnij logike rekurencyjna i podaj zlozonosc.',
              tagSlugs: ['binary-tree', 'dfs', 'intermediate'],
              solution: 'function height(root) { if (!root) return 0; // baza: puste drzewo ma wysokosc 0. const leftH = height(root.left); const rightH = height(root.right); return 1 + Math.max(leftH, rightH); // 1 + wiekszy z poddrzew }. Logika: wysokosc drzewa to 1 (biezacy wezel) plus wyzsza z dwoch poddrzew. Rekurencja naturalnie przetwarza drzewo od dolu do gory (postorder). Baza: null zwraca 0 (brak wezla = brak wysokosci). Zlozonosc: O(n) time - odwiedzamy kazdy wezel raz. O(h) space - stos rekurencji o glebokosci h (wysokosc drzewa), gdzie h = O(log n) dla zbalansowanego, O(n) dla zdegenerowanego.',
              points: 2,
              isPublished: false
            }
          ]
        },

        // -------------------------------------------------------
        // LEKCJA 5.2
        // -------------------------------------------------------
        {
          title: 'Lekcja 5.2: Binary Search Tree (BST) - porzadek w drzewie',
          order: 2,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: '**Binary Search Tree (BST)** to Binary Tree z dodatkowa wlasnoscia porzadku: dla kazdego wezla, **wszystkie wartosci w lewym poddrzewie sa mniejsze**, a **wszystkie wartosci w prawym poddrzewie sa wieksze**. Ta wlasnosc obowiazuje rekurencyjnie dla kazdego wezla w drzewie. Dzieki niej, wyszukiwanie elementu to jak Binary Search - za kazdym krokiem eliminujemy polowe drzewa. W zbalansowanym BST: O(log n) dla search, insert, delete.'
            },
            {
              blockType: 'text',
              content: 'Wyszukiwanie w BST:\n```\nfunction search(root, target) {\n  if (!root) return null;           // nie znaleziono\n  if (root.val === target) return root; // znaleziono!\n  if (target < root.val)\n    return search(root.left, target);  // szukaj w lewym\n  else\n    return search(root.right, target); // szukaj w prawym\n}\n```\nWstawianie:\n```\nfunction insert(root, val) {\n  if (!root) return new Node(val); // tworzy nowy wezel\n  if (val < root.val)\n    root.left = insert(root.left, val);\n  else if (val > root.val)\n    root.right = insert(root.right, val);\n  return root; // zwraca zmodyfikowane drzewo\n}\n```\nOba algorytmy dzialaja w O(h) gdzie h to wysokosc drzewa. h = O(log n) dla zbalansowanego, O(n) dla zdegenerowanego.'
            },
            {
              blockType: 'text',
              content: 'Usuwanie z BST to najtrudniejsza operacja - trzy przypadki:\n\n**Przypadek 1**: Wezel jest lisciem (brak dzieci) - po prostu usun (zwroc null).\n\n**Przypadek 2**: Wezel ma jedno dziecko - zastap wezel jego dzieckiem.\n\n**Przypadek 3**: Wezel ma dwoje dzieci - znajdz **Inorder Successor** (najmniejszy element w prawym poddrzewie) lub **Inorder Predecessor** (najwiekszy w lewym), skopiuj jego wartosc do biezacego wezla, usun successor/predecessor z prawego poddrzewa.\n\nDlaczego Inorder Successor? Bo to najmniejsza wartosc wieksza od biezacej - idealna do zastapienia, zachowuje wlasnosc BST.'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Diagram BST z przykladami operacji. Glowne drzewo: korzen 5, lewe poddrzewo (3->1,4), prawe poddrzewo (7->6,9). Panel 1: Search(4) - sciezka 5->3->4 zaznaczona na czerwono z opisem "4<5 idz w lewo, 4>3 idz w prawo, znaleziono 4". Panel 2: Insert(8) - sciezka 5->7->9->lewe dziecko 9, nowy wezel 8. Panel 3: Delete(5) - Inorder Successor=6, wartsc 5 zastapiona przez 6, 6 usuniete z oryginalnej pozycji.',
              align: 'center',
              width: 'lg'
            },
            {
              blockType: 'table',
              caption: 'BST operacje - zlozonosci zbalansowanego vs zdegenerowanego',
              hasHeaders: true,
              headers: ['Operacja', 'Zbalansowane BST', 'Zdegenerowane BST', 'Hash Table (dla porownania)'],
              rows: [
                ['Search', 'O(log n)', 'O(n)', 'O(1) avg'],
                ['Insert', 'O(log n)', 'O(n)', 'O(1) avg'],
                ['Delete', 'O(log n)', 'O(n)', 'O(1) avg'],
                ['Min/Max', 'O(log n)', 'O(n)', 'O(n)'],
                ['Inorder (sorted)', 'O(n)', 'O(n)', 'O(n log n) (trzeba sortowac)'],
                ['Range Query', 'O(log n + k)', 'O(n)', 'O(n)']
              ]
            },
            {
              blockType: 'text',
              content: 'Walidacja BST - czesty problem na rozmowie! Prosta implementacja sprawdzajaca tylko bezposrednie dzieci jest **BLEDNA**. Nalezy propagowac granice (min, max):\n```\nfunction isValidBST(root, min = -Infinity, max = Infinity) {\n  if (!root) return true; // puste drzewo jest BST\n  if (root.val <= min || root.val >= max) return false;\n  return (\n    isValidBST(root.left, min, root.val) &&  // lewe: max = biezacy\n    isValidBST(root.right, root.val, max)    // prawe: min = biezacy\n  );\n}\n```\nDlaczego propagacja granic? Wezel w lewym poddrzewie korzenia musi byc mniejszy nie tylko od swojego rodzica, ale od korzenia i wszystkich przodkow!'
            },
            {
              blockType: 'callout',
              variant: 'warning',
              title: 'Najczestszy blad: walidacja BST tylko lokalna',
              content: 'Bledna walidacja: sprawdzaj czy root.val > root.left.val i root.val < root.right.val dla kazdego wezla. To nie wystarczy! Kontrprzyklad: drzewo z korzeniem 5, lewym dzieckiem 4, a prawym dzieckiem 4 lewego to 6 - lokalnie OK ale 6 > 5 narusza BST! Zawsze przekazuj granice min i max w rekurencji.',
              
            },
            {
              blockType: 'callout',
              variant: 'info',
              title: 'Kiedy BST, kiedy Hash Table?',
              content: 'Hash Table wygrywa szybkoscia (O(1) vs O(log n)) ale BST ma unikalne zalety: przechowuje elementy **posortowane** (Inorder = sorted), wspiera **range queries** (elementy miedzy a i b w O(log n + k)), **min/max w O(log n)**, **predecessor/successor**. Kiedy potrzebujesz posortowanych danych lub operacji zakresowych - BST (lub jego zbalansowane wersje: AVL, Red-Black, TreeMap w Javie). Gdy tylko lookup/insert/delete - Hash Table.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Jaka jest zlozonosc wyszukiwania w zbalansowanym BST?',
              tagSlugs: ['bst', 'big-o', 'beginner'],
              choices: [
                'O(1)',
                'O(log n)',
                'O(n)',
                'O(n log n)'
              ],
              correctAnswer: 'O(log n)',
              solution: 'W zbalansowanym BST, kazda decyzja (isc w lewo czy prawo) eliminuje polowe pozostalych elementow - identycznie jak Binary Search. Po log n krokach docieramy do szukanego elementu lub null. Kluczowe: to tylko dla ZBALANSOWANEGO BST. Zdegenerowane (np. posortowane wstawianie bez balansowania) spada do O(n).',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'Inorder traversal BST zwraca elementy w posortowanej kolejnosci rosnaccej.',
              tagSlugs: ['bst', 'tree-traversal', 'beginner'],
              correctAnswer: 'true',
              solution: 'Prawda. Inorder traversal (Lewy, Korzen, Prawy) odwiedza najpierw cale lewe poddrzewo (mniejsze wartosci), potem korzen, potem cale prawe poddrzewo (wieksze wartosci). Ze wzgledu na wlasnosc BST (lewe < korzen < prawe), gwarantuje to posortowana kolejnosc rosnaca. To sprytny sposob na posortowanie danych przy uzyciu BST w O(n log n) insert + O(n) inorder.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'Usuwasz wezel z BST, ktory ma DWOJE dzieci. Czym go zastepujesz?',
              tagSlugs: ['bst', 'intermediate'],
              choices: [
                'Lewym dzieckiem',
                'Prawym dzieckiem',
                'Inorder Successor (najmniejszy w prawym poddrzewie) lub Inorder Predecessor (najwiekszy w lewym)',
                'Korzeniem prawego poddrzewa'
              ],
              correctAnswer: 'Inorder Successor (najmniejszy w prawym poddrzewie) lub Inorder Predecessor (najwiekszy w lewym)',
              solution: 'Gdy usuwany wezel ma dwoje dzieci, jego miejsce musi zajac wartosc, ktora zachowa wlasnosc BST. Inorder Successor to najmniejsza wartosc wieksza od biezacej (skrajnie lewy wezel prawego poddrzewa) - spelniai BST bo jest > lewe poddrzewo i <= prawe. Inorder Predecessor to najwieksza wartosc mniejsza od biezacej. Obie opcje sa poprawne.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Wyjasnij dlaczego prosta walidacja BST (sprawdzam tylko czy kazdy wezel > lewe dziecko i < prawe dziecko) jest niepoprawna. Podaj kontrprzyklad i opisz poprawny algorytm.',
              tagSlugs: ['bst', 'intermediate'],
              solution: 'Kontrprzyklad: Wezel korzen=10, lewe dziecko=5, prawe dziecko lewego=15. Lokalnie 5 < 10 (OK) i 15 > 5 (OK). Ale 15 > 10 narusza wlasnosc BST - wszystkie wartosci w lewym poddrzewie korzenia musza byc < 10! Prosta lokalna walidacja tego nie wykryje. Poprawny algorytm: propaguj granice min i max. isValidBST(root, min=-Infinity, max=Infinity): jezeli root.val <= min lub root.val >= max - zwroc false. Rekurencja: isValidBST(root.left, min, root.val) - lewe poddrzewo musi byc < biezacy (max=root.val). isValidBST(root.right, root.val, max) - prawe musi byc > biezacy (min=root.val). Propagacja granic gwarantuje ze kazdy wezel spelnia ograniczenia wszystkich swoich przodkow.',
              points: 2,
              isPublished: false
            }
          ]
        },

        // -------------------------------------------------------
        // LEKCJA 5.3
        // -------------------------------------------------------
        {
          title: 'Lekcja 5.3: Heaps i Priority Queue - zawsze masz dostep do min/max',
          order: 3,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: '**Heap** (kopiec) to Complete Binary Tree z dodatkowa wlasnoscia kopcowa. W **Max-Heap**: rodzic zawsze >= dzieci (korzen to maksimum). W **Min-Heap**: rodzic zawsze <= dzieci (korzen to minimum). Nie jest to BST - nie ma porzadku lewy/prawy. Heap gwarantuje tylko ze korzen jest max/min. Glowna zaletazalet: **O(1) dostep do max/min** (korzen) i **O(log n)** dla wstawiania i usuwania. Idealny do Priority Queue.'
            },
            {
              blockType: 'text',
              content: 'Heap jest przechowywany jako **tablica** (nie jako drzewo z wskaznikami). Complete Binary Tree mapuje sie naturalnie: korzen = index 0. Dla wezla pod indeksem i: lewe dziecko = 2i+1, prawe dziecko = 2i+2, rodzic = floor((i-1)/2). Dzieki tej reprezentacji nie potrzebujemy wskaznikow - caly heap to jeden ciagly blok pamieci (dobra cache locality!).\n\nPrzyklad: Max-Heap [10, 7, 8, 5, 3, 6, 1] reprezentuje drzewo z korzeniem 10, dziecmi 7 i 8, itd.'
            },
            {
              blockType: 'text',
              content: 'Kluczowe operacje Heap:\n\n**Push (Insert)**: Dodaj element na koniec tablicy. Wykonaj **sift-up** (bubble-up): porownuj z rodzicem, zamien jezeli narusza wlasnosc, powtarzaj az do korzenia. O(log n).\n\n**Pop (Extract Max/Min)**: Zamien korzen z ostatnim elementem. Usun ostatni. Wykonaj **sift-down** (heapify-down): porownuj z dziecmi, zamien z wiekszym/mniejszym dzieckiem, powtarzaj az do liscia. O(log n).\n\n**Peek**: Odczytaj korzen (max/min) bez usuwania. O(1).\n\n**Heapify**: Zbuduj heap z dowolnej tablicy. O(n) - nie O(n log n) jak by sie wydawalo!'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Diagram Max-Heap jako drzewo i tablica. Gora: drzewo z korzeniem 10, dziecmi 7 i 8, wnukami 5,3,6,1. Strzalki pokazuja relacje rodzic-dziecko z etykietami indeksow. Dol: tablica [10, 7, 8, 5, 3, 6, 1] z indeksami 0-6. Strzalki laczace pozycje w tablicy z wezlami drzewa. Formuly dla lewego/prawego dziecka i rodzica zapisane obok.',
              align: 'center',
              width: 'md'
            },
            {
              blockType: 'text',
              content: '**Priority Queue** (kolejka priorytetowa) to abstrakcja zbudowana na Heap. Elementy sa wyciagane w kolejnosci priorytetu, nie FIFO. Zastosowania:\n\n- **Dijkstra**: Zawsze przetwarzaj wezel o najmniejszej odleglosci - Min-Heap\n- **Heap Sort**: Wielokrotnie wyciagaj max z Max-Heap\n- **Top K Elements**: Znajdz k najwiekszych elementow uzywajac Min-Heap rozmiaru k\n- **Median from Data Stream**: Dwa heapy (max-heap dla lewej polowy, min-heap dla prawej)\n- **Task Scheduling**: Przetwarzaj zadania wg priorytetu'
            },
            {
              blockType: 'text',
              content: 'Wzorzec **Top K Elements** z Min-Heap - czesto na rozmowie:\n```\n// Znajdz k najwiekszych elementow z tablicy nums\nfunction topKElements(nums, k) {\n  const minHeap = new MinHeap();\n  for (const num of nums) {\n    minHeap.push(num);\n    if (minHeap.size() > k) {\n      minHeap.pop(); // usun najmniejszy z k+1\n    }\n  }\n  return minHeap.toArray(); // pozostale k elementow to TOP K\n}\n```\nDlaczego Min-Heap a nie Max-Heap? Min-Heap rozmiaru k przechowuje k NAJWIEKSZYCH elementow. Jezeli nowy element jest wiekszy od min (korzenia) - wstaw go i usun min. Efektywnie filtrujemy k largest. O(n log k) zamiast O(n log n) sortowania.'
            },
            {
              blockType: 'callout',
              variant: 'info',
              title: 'Heap w Jezyku Programowania',
              content: 'JavaScript nie ma wbudowanego Heap - musisz zaimplementowac lub uzywac biblioteki. Python: heapq (domyslnie min-heap; dla max-heap neguj wartosci: heapq.heappush(h, -val)). Java: PriorityQueue (domyslnie min-heap; dla max-heap: new PriorityQueue<>(Collections.reverseOrder())). C++: priority_queue (domyslnie max-heap; dla min-heap: priority_queue<int, vector<int>, greater<int>>). Wiedza o API jezyka robi wrazenie na rozmowie.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Jaka jest zlozonosc operacji peek (odczyt max/min bez usuwania) na Heap?',
              tagSlugs: ['heap', 'big-o', 'beginner'],
              choices: [
                'O(n)',
                'O(log n)',
                'O(1)',
                'O(n log n)'
              ],
              correctAnswer: 'O(1)',
              solution: 'Max lub Min jest zawsze przechowywany w korzeniu Heap, ktory jest zawsze pod indeksem 0 w tablicowej reprezentacji. Dostep do arr[0] to O(1). To jedna z kluczowych zalet Heap nad innymi strukturami - gwarantowany O(1) dostep do extremum bez naruszania struktury.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'Min-Heap mozna uzyc do znalezienia k najwiekszych elementow z tablicy w O(n log k).',
              tagSlugs: ['heap', 'priority-queue', 'intermediate'],
              correctAnswer: 'true',
              solution: 'Prawda. Utrzymuj Min-Heap rozmiaru k. Dla kazdego elementu: wstaw do heapa. Jezeli rozmiar > k, usun minimum. Po przetworzeniu wszystkich elementow, heap zawiera dokladnie k najwiekszych. Time: O(n log k) - n elementow, kazdy insert/delete to O(log k). Lepsza od posortowania: O(n log n) vs O(n log k) gdy k << n.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'Jaka jest zlozonosc budowania Heap z istniejacej tablicy n elementow (operacja Heapify)?',
              tagSlugs: ['heap', 'big-o', 'intermediate'],
              choices: [
                'O(n^2)',
                'O(n log n)',
                'O(n)',
                'O(log n)'
              ],
              correctAnswer: 'O(n)',
              solution: 'Budowanie Heap (Heapify) z tablicy to O(n) - nie O(n log n) jak mogloby sie wydawac. Intuicja: wezly blizej lisciam (wiekszosc wezlow) wymagaja malej pracy sift-down. Matematyczny dowod z serii geometrycznej pokazuje sum = O(n). Dlatego Heap Sort ma O(n) dla fazy budowania i O(n log n) dla fazy ekstrakcji, lacznie O(n log n).',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Wytlumacz roznice miedzy BST a Heap. Kiedy uzylbys kazdego z nich? Podaj konkretne przypadki uzycia.',
              tagSlugs: ['heap', 'bst', 'intermediate'],
              solution: 'BST: zachowuje pelny porzadek (Inorder = posortowane), mozna szukac dowolnego elementu w O(log n), wspiera range queries i predecessor/successor. Heap: zachowuje tylko wlasnosc kopcowa (korzen = min/max), O(1) dostep do max/min, brak pelnego porzadku - nie mozna efektywnie szukac arbitrary elementu. Kiedy BST: sortowane przechowywanie z szybkim wyszukiwaniem (np. mapa posortowanych klientow), range queries (klienci z wiekiem 25-35), predecessor/successor (nastepna wizyta w kalendarzu). Kiedy Heap/Priority Queue: zawsze potrzebujesz dostepu do max/min (Dijkstra, A*, task scheduler), Top K elements, Median from data stream, Merge K Sorted Lists. Kluczowa roznica: Heap jest lepszy gdy interesuje Cie TYLKO extremum; BST gdy potrzebujesz posortowanego porzadku i wyszukiwania.',
              points: 2,
              isPublished: false
            }
          ]
        },

        // -------------------------------------------------------
        // LEKCJA 5.4
        // -------------------------------------------------------
        {
          title: 'Lekcja 5.4: Klasyczne pytania o drzewach na interview',
          order: 4,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Kilka problemow pojawia sie na rozmowach tak czesto, ze sa niemal standardem dla poziomu junior. Opanowanie ich nie tylko daje konkretne rozwiazania, ale buduje intuicje DFS/BFS, ktora przenosi sie na nowe, niewidziane wczesniej zadania. W tej lekcji przejdziemy przez najwazniejsze klasyki: Maximum Depth, Symmetric Tree, Path Sum, Lowest Common Ancestor i Right Side View.'
            },
            {
              blockType: 'text',
              content: '**Maximum Depth of Binary Tree** - znajdz maksymalna glebokosc:\n```\nfunction maxDepth(root) {\n  if (!root) return 0;\n  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));\n}\n```\nProste i eleganckie. Baza: null = 0. Rekurencja: 1 + max(lewe, prawe). O(n) time, O(h) space.\n\n**Symmetric Tree** - czy drzewo jest symetryczne wzgledem osi pionowej:\n```\nfunction isSymmetric(root) {\n  function isMirror(left, right) {\n    if (!left && !right) return true;  // oba null\n    if (!left || !right) return false; // jeden null\n    return left.val === right.val\n      && isMirror(left.left, right.right)  // zewnetrzne\n      && isMirror(left.right, right.left); // wewnetrzne\n  }\n  return isMirror(root.left, root.right);\n}'
            },
            {
              blockType: 'text',
              content: '**Path Sum** - czy istnieje sciezka od korzenia do liscia o sumie = target:\n```\nfunction hasPathSum(root, targetSum) {\n  if (!root) return false;\n  if (!root.left && !root.right) // liscie - sprawdz reszte\n    return root.val === targetSum;\n  return (\n    hasPathSum(root.left, targetSum - root.val) ||\n    hasPathSum(root.right, targetSum - root.val)\n  );\n}\n```\nKlucz: zmniejszamy target o wartosc biezacego wezla. Na lisciu sprawdzamy czy zostalo dokladnie root.val (czyli targetSum - accumulated = 0 po odjeciu).\n\n**Lowest Common Ancestor (LCA)** - znajdz najmlodszego wspolnego przodka wezlow p i q:\n```\nfunction lowestCommonAncestor(root, p, q) {\n  if (!root || root === p || root === q) return root;\n  const left = lowestCommonAncestor(root.left, p, q);\n  const right = lowestCommonAncestor(root.right, p, q);\n  if (left && right) return root; // p i q po roznych stronach\n  return left || right; // oba po tej samej stronie\n}\n```'
            },
            {
              blockType: 'text',
              content: '**Right Side View** - co widzisz patrzac na drzewo z prawej strony (BFS):\n```\nfunction rightSideView(root) {\n  if (!root) return [];\n  const result = [];\n  const queue = [root];\n  while (queue.length > 0) {\n    const levelSize = queue.length;\n    for (let i = 0; i < levelSize; i++) {\n      const node = queue.shift();\n      if (i === levelSize - 1) result.push(node.val); // ostatni w poziomie\n      if (node.left) queue.push(node.left);\n      if (node.right) queue.push(node.right);\n    }\n  }\n  return result;\n}\n```\nKlucz: BFS poziom po poziomie, ostatni element na kazdym poziomie jest widoczny z prawej. O(n) time i space.'
            },
            {
              blockType: 'callout',
              variant: 'tip',
              title: 'Szablon DFS na drzewie - naucz sie na pamiec',
              content: 'Wiekszosc problemow drzewowych ma ten sam szkielet: function solve(root) { if (!root) return BASE_CASE; const leftResult = solve(root.left); const rightResult = solve(root.right); return COMBINE(root.val, leftResult, rightResult); }. Zmienisz tylko: BASE_CASE (co zwroc dla null), i COMBINE (jak polaczyc wyniki dzieci z biezacym wezlem). Nauka tego szablonu na pamiec pozwala szybko wygenerowac rozwiazanie i skupic sie na logice specyficznej dla danego problemu.'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Cztery mini-diagramy klasycznych problemow drzewowych. 1) Max Depth: drzewo z zaznaczona najdluzszaaz sciezka od korzenia do najglabszego liscia i etykieta "depth=3". 2) Symmetric Tree: drzewo symetryczne z kolorowymi liniami laczacymi lustrzane wezly. 3) Path Sum: drzewo z zaznaczona sciezka ktora sumuje sie do 22 (5->4->11->2), pozostale sciezki wyszarzone. 4) Right Side View: drzewo z strzalka z prawej strony i wyroznionym ostatnim wezlem na kazdym poziomie.',
              align: 'center',
              width: 'lg'
            },
            {
              blockType: 'callout',
              variant: 'info',
              title: 'Diameter of Binary Tree - tricksy problem',
              content: 'Diameter (srednica) drzewa to najdluzszasciezka miedzy dowolnymi dwoma wezlami (niekoniecznie przez korzen!). Trik: dla kazdego wezla, diameter przechodzacy przez niego = height(left) + height(right). Szukamy maksimum po wszystkich wezlach. Implementacja: w funkcji height() aktualizuj globalne maximum. O(n) time, O(h) space. Jezeli probowac rozwiazac bez triku - O(n^2). To czesty "tricksy" problem na Medium level interview.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Jaka struktury danych uzywamy do implementacji BFS (Level Order Traversal) na drzewie?',
              tagSlugs: ['binary-tree', 'bfs', 'beginner'],
              choices: [
                'Stack (LIFO)',
                'Queue (FIFO)',
                'Priority Queue (Heap)',
                'Hash Set'
              ],
              correctAnswer: 'Queue (FIFO)',
              solution: 'BFS uzywa Queue. Logika: wstawiamy korzen do kolejki. W petli: zdejmujemy wezel z przodu, przetwarzamy, dodajemy jego dzieci na tyl kolejki. FIFO gwarantuje ze przetwarzamy wezly w kolejnosci odkrycia - warstwa po warstwie. Stack daje DFS. Priority Queue daje Dijkstre (wazony BFS).',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'Lowest Common Ancestor (LCA) wezlow p i q jest zawsze jednym z nich (p lub q).',
              tagSlugs: ['binary-tree', 'intermediate'],
              correctAnswer: 'false',
              solution: 'Falsz. LCA to NAJMLODSZY wspolny przodek - moze byc dowolnym wezlem w drzewie, niekoniecznie p lub q. Wyjatkiem jest gdy p jest przodkiem q (lub odwrotnie) - wtedy LCA to wlasnie p (lub q). W ogolnym przypadku LCA to wezel gdzie sciezki do p i q "rozgaleziaja sie".',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'Chcesz sprawdzic czy Binary Tree jest zbalansowany (height difference <= 1 dla kazdego wezla). Jaka jest optymalna time complexity?',
              tagSlugs: ['binary-tree', 'dfs', 'intermediate'],
              choices: [
                'O(n^2) - oblicz wysokosc dla kazdego wezla osobno',
                'O(n log n) - potrzebne poziomy i wysokosci',
                'O(n) - oblicz wysokosc i sprawdz balans w jednym przebiegu DFS',
                'O(log n) - wystarczy sprawdzic sciezki do lisciam'
              ],
              correctAnswer: 'O(n) - oblicz wysokosc i sprawdz balans w jednym przebiegu DFS',
              solution: 'Optymalne: jeden przebieg DFS ktory jednoczesnie oblicza wysokosc i sprawdza balans. Jezeli poddrzewo jest niezbalansowane, zwroc -1 (sentinel value). Jezeli |leftH - rightH| > 1, zwroc -1. Inaczej zwroc max(leftH, rightH) + 1. O(n^2) naiwne podejscie oblicza wysokosc od nowa dla kazdego wezla. O(n) optymalne - kazdy wezel odwiedzony raz.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Opisz algorytm obliczania srednicy (Diameter) Binary Tree - najdluzszej sciezki miedzy dowolnymi dwoma wezlami. Dlaczego naiwne podejscie jest O(n^2) i jak zoptymalizowac do O(n)?',
              tagSlugs: ['binary-tree', 'dfs', 'intermediate'],
              solution: 'Naiwne O(n^2): dla kazdego wezla oblicz height(left) + height(right) jako potencjalny diameter. height() kosztuje O(n), wiec dla n wezlow = O(n^2). Optymalne O(n): w funkcji obliczajacej wysokosc, jednoczesnie aktualizuj globalne maksimum diametra. function height(root): if (!root) return 0; leftH = height(root.left); rightH = height(root.right); diameter = max(diameter, leftH + rightH); // aktualizuj globalny maks. return 1 + max(leftH, rightH). Wywolaj height(root) - globalny diameter bedzie poprawny. Kazdy wezel odwiedzany raz = O(n). Kluczowy insight: diameter przechodzacy przez dany wezel = leftH + rightH (suma wysokosci obu poddrzew).',
              points: 2,
              isPublished: false
            }
          ]
        }
      ]
    },

    // =========================================================
    // MODUL 6: Grafy (Graphs)
    // =========================================================
    {
      title: 'Modul 6: Grafy - DFS, BFS, Topological Sort, Union-Find',
      order: 6,
      isPublished: false,

      lessons: [

        // -------------------------------------------------------
        // LEKCJA 6.1
        // -------------------------------------------------------
        {
          title: 'Lekcja 6.1: Reprezentacja grafow, DFS i BFS',
          order: 1,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: '**Graf** to struktury danych skladajacy sie z **wezlow** (vertices/nodes) i **krawedzi** (edges) laczacych te wezly. Drzewa to specjalny przypadek grafow (acykliczne, spojne, skierowane). Grafy sa wszedzie: siec znajomych (Facebook), mapa miast (Google Maps), zaleznosci pakietow (npm), strony internetowe (Google PageRank), obwody elektroniczne. Rozumienie grafow otwiera dostep do ogromnej klasy problemow.'
            },
            {
              blockType: 'text',
              content: 'Podstawowe typy grafow:\n\n- **Skierowany (Directed)**: Krawedzie maja kierunek A->B. Nie oznacza ze jest B->A. Przyklad: media spolecznosciowe (followujesz kogos, niekoniecznie on Ciebie).\n- **Nieskierowany (Undirected)**: Krawedzie sa obustronne A-B = B-A. Przyklad: przyjazn na Facebooku.\n- **Wazony (Weighted)**: Krawedzie maja wagi (odleglosc, koszt). Dijkstra szuka najkrotszej sciezki w wazonym grafie.\n- **Cykliczny (Cyclic)**: Istnieje sciezka prowadzaca z wezla z powrotem do niego.\n- **Acykliczny (DAG - Directed Acyclic Graph)**: Brak cykli. Topological Sort dziala tylko na DAG.'
            },
            {
              blockType: 'text',
              content: 'Dwa sposoby reprezentacji grafow:\n\n**1) Adjacency List** (lista sasiadow) - PREFEROWANA:\n```\n// Graf: 0-1, 0-2, 1-3\nconst graph = {\n  0: [1, 2],\n  1: [0, 3],\n  2: [0],\n  3: [1]\n};\n// Lub tablica tablic: [[1,2], [0,3], [0], [1]]\n```\nPrzestrzec: O(V + E) gdzie V = wezly, E = krawedzie.\n\n**2) Adjacency Matrix** - dla gestych grafow:\n```\n// matrix[i][j] = 1 jezeli istnieje krawedz i->j\nconst matrix = [\n  [0, 1, 1, 0],\n  [1, 0, 0, 1],\n  [1, 0, 0, 0],\n  [0, 1, 0, 0]\n];\n```\nPrzestrzec: O(V^2). Sprawdzenie krawedzi: O(1). Najlepsza dla gestych grafow gdzie E ≈ V^2.'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Diagram grafu nieskierowanego z 4 wezlami (0,1,2,3) i krawedziami 0-1, 0-2, 1-3. Obok dwie reprezentacje: Adjacency List - tabela z kluczami 0,1,2,3 i listami sasiadow. Adjacency Matrix - macierz 4x4 z zerami i jedynkami. Kolor zielony dla Adjacency List z podpisem "O(V+E) space - rzadkie grafy", kolor niebieski dla Matrix z podpisem "O(V^2) space - geste grafy".',
              align: 'center',
              width: 'lg'
            },
            {
              blockType: 'text',
              content: 'DFS na grafie (w odroznieniu od drzewa musimy sledzic odwiedzone wezly aby uniknac nieskonczonych petli!):\n```\nfunction dfs(graph, start) {\n  const visited = new Set();\n  const result = [];\n  function explore(node) {\n    if (visited.has(node)) return; // juz odwiedzony!\n    visited.add(node);\n    result.push(node);\n    for (const neighbor of graph[node]) {\n      explore(neighbor);\n    }\n  }\n  explore(start);\n  return result;\n}\n```\nBFS na grafie:\n```\nfunction bfs(graph, start) {\n  const visited = new Set([start]);\n  const queue = [start];\n  const result = [];\n  while (queue.length > 0) {\n    const node = queue.shift();\n    result.push(node);\n    for (const neighbor of graph[node]) {\n      if (!visited.has(neighbor)) {\n        visited.add(neighbor);\n        queue.push(neighbor);\n      }\n    }\n  }\n  return result;\n}\n```'
            },
            {
              blockType: 'table',
              caption: 'DFS vs BFS na grafach - kiedy co wybrac?',
              hasHeaders: true,
              headers: ['Kryterium', 'DFS', 'BFS'],
              rows: [
                ['Implementacja', 'Rekurencja lub Stack', 'Queue'],
                ['Time Complexity', 'O(V + E)', 'O(V + E)'],
                ['Space Complexity', 'O(V) stos rekurencji', 'O(V) kolejka'],
                ['Najkrotsza sciezka (unweighted)', 'NIE gwarantuje', 'TAK gwarantuje'],
                ['Wykrywanie cyklu', 'TAK (back edges)', 'TAK'],
                ['Topological Sort', 'TAK', 'TAK (Kahn\'s)'],
                ['Connected Components', 'TAK', 'TAK'],
                ['Glebokie drzewa', 'Ryzyko stack overflow', 'Bezpieczniejszy']
              ]
            },
            {
              blockType: 'callout',
              variant: 'tip',
              title: 'Number of Islands - must-know problem',
              content: 'Number of Islands to NAJCZESCIEJ PYTANY problem grafowy na rozmowach junior. Masz siatke 2D z "1" (zyemia) i "0" (woda). Policz wyspy (spojne obszary "1"). Rozwiazanie: DFS/BFS. Dla kazdej "1" ktora nie jest odwiedzona, uruchom DFS - oznacza to znalezienie nowej wyspy. DFS zaznacza caly spojny obszar jako odwiedzony. Zlicz starty DFS = liczba wysp. O(m*n) time i space gdzie m, n to wymiary siatki.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Jaka jest space complexity Adjacency List dla grafu z V wezlami i E krawedziami?',
              tagSlugs: ['grafy', 'big-o', 'beginner'],
              choices: [
                'O(V)',
                'O(E)',
                'O(V + E)',
                'O(V^2)'
              ],
              correctAnswer: 'O(V + E)',
              solution: 'Adjacency List przechowuje V list (jeden wpis na wezel) plus lacznie E elementow w tych listach (kazda krawedz jest reprezentowana raz dla skierowanego, dwa razy dla nieskierowanego). Dlatego O(V + E). Dla rzadkich grafow (E << V^2) jest znacznie wydajniejsza niz Adjacency Matrix O(V^2).',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'BFS gwarantuje znalezienie najkrotszej sciezki (pod wzgledem liczby krawedzi) w grafie nieskierowanym niewazonm.',
              tagSlugs: ['grafy', 'bfs', 'beginner'],
              correctAnswer: 'true',
              solution: 'Prawda. BFS odwiedza wezly warstwa po warstwie - najpierw wszystkie wezly w odleglosci 1, potem 2, itd. Gdy po raz pierwszy dotrze do celu, gwarantuje ze uzylo minimalnej liczby krawedzi. DFS nie daje tej gwarancji - moze znalezc dluzsza sciezke. Ta wlasnosc BFS jest kluczowa dla algorytmow shortest path na grafach niewazonch.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'Dlaczego przy DFS/BFS na grafach (w przeciwienstwie do drzew) musimy sledzic odwiedzone wezly?',
              tagSlugs: ['grafy', 'dfs', 'bfs', 'beginner'],
              choices: [
                'Aby posortowac wezly podczas przeszukiwania',
                'Aby uniknac nieskonczonych petli spowodowanych cyklami w grafie',
                'Aby zapamietac kolejnosc odwiedzin dla raportowania',
                'Drzewa tez wymagaja sledzenia, to nieprawdziwe stwierdzenie'
              ],
              correctAnswer: 'Aby uniknac nieskonczonych petli spowodowanych cyklami w grafie',
              solution: 'Grafy moga miec cykle - sciezki wracajace do poprzednich wezlow. Bez zestawu "odwiedzonych" wezlow, DFS/BFS moglyby krazyzc w cyklu w nieskonczonosc. Drzewa sa acykliczne - nie ma sciezek powrotnych, wiec nie potrzebujemy sledzenia. Uzycie Set/boolean array "visited" to obowiazkowy element implementacji grafowej.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Opisz rozwiazanie problemu "Number of Islands" (2D siatka z 0 i 1, policz spojne obszary z 1). Jaka struktura danych i algorytm uzyjesz? Jaka jest zlozonosc?',
              tagSlugs: ['grafy', 'dfs', 'intermediate'],
              solution: 'Algorytm: Iteruj po wszystkich polach siatki. Gdy napotkasz "1" ktore nie jest odwiedzone: incrementuj licznik wysp, uruchom DFS/BFS z tego pola aby zaznaczyc caly spojny obszar jako odwiedzony (zmien "1" na "0" lub uzyj osobnej tablicy visited). DFS: od biezacego pola rekurencyjnie odwiedz 4 sasiadow (gora, dol, lewo, prawo) jezeli sa "1" i w granicach siatki. BFS: alternatywnie uzyj kolejki. Zlozonosc: O(m*n) time - kazde pole odwiedzamy co najwyzej dwa razy (raz przy skanowaniu, raz przy DFS). O(m*n) space - worst case cala siatka to jedna wyspa, DFS stack/BFS queue O(m*n). Modyfikacja siatki in-place eliminuje potrzebe dodatkowej tablicy visited.',
              points: 2,
              isPublished: false
            }
          ]
        },

        // -------------------------------------------------------
        // LEKCJA 6.2
        // -------------------------------------------------------
        {
          title: 'Lekcja 6.2: Topological Sort - porzadek zaleznosci',
          order: 2,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: '**Topological Sort** to liniowe uporzadkowanie wezlow **DAG** (Directed Acyclic Graph) takie, ze dla kazdej krawedzi U->V, wezel U pojawia sie przed V. Intuicja: zadania z zaleznostami - zanim zaczniesz zadanie B, musisz skonczyc A. Topological sort daje kolejnosc wykonywania zadan, ktora respektuje wszystkie zaleznosci. Uzywany w: kompilatorach (kolejnosc kompilacji modulow), package managers (npm install), make/build systems, kursach (prerequisity).'
            },
            {
              blockType: 'text',
              content: 'Dwa glowne algorytmy Topological Sort:\n\n**1) Kahn\'s Algorithm (BFS-based)**:\n- Oblicz in-degree (liczba krawedzi wchodzacych) dla kazdego wezla\n- Wstaw wszystkie wezly z in-degree = 0 do kolejki\n- W petli: zdejmij wezel z kolejki, dodaj do wyniku, dla kazdego sasiada zmniejsz jego in-degree o 1; jezeli in-degree sasiada = 0, dodaj do kolejki\n- Jezeli wynik zawiera wszystkie V wezlow - sukces. Jezeli nie - graf ma cykl!\n\n**2) DFS-based (post-order)**:\n- Uruchom DFS na wszystkich nieodwiedzonych wezlach\n- Po zakonczeniu DFS dla wezla (post-order), wstaw na POCZATEK stosu wynikow\n- Wynik = stos (odwrotna kolejnosc post-order)'
            },
            {
              blockType: 'text',
              content: 'Implementacja Kahn\'s Algorithm:\n```\nfunction topologicalSort(numCourses, prerequisites) {\n  // Build graph i in-degree\n  const graph = Array.from({length: numCourses}, () => []);\n  const inDegree = new Array(numCourses).fill(0);\n  for (const [course, prereq] of prerequisites) {\n    graph[prereq].push(course);\n    inDegree[course]++;\n  }\n  // Start z zerowym in-degree\n  const queue = [];\n  for (let i = 0; i < numCourses; i++) {\n    if (inDegree[i] === 0) queue.push(i);\n  }\n  const order = [];\n  while (queue.length > 0) {\n    const node = queue.shift();\n    order.push(node);\n    for (const neighbor of graph[node]) {\n      inDegree[neighbor]--;\n      if (inDegree[neighbor] === 0) queue.push(neighbor);\n    }\n  }\n  return order.length === numCourses ? order : []; // [] = cykl\n}\n```'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Diagram Topological Sort na grafie kursow: kurs A (Math) -> kurs B (Physics), kurs A -> kurs C (Chemistry), kurs B -> kurs D (Engineering), kurs C -> kurs D. Lewa strona: graf z krawedzia i in-degree kazdego wezla (A=0, B=1, C=1, D=2). Prawa strona: krok po kroku Kahn\'s: queue=[A], przetworz A -> queue=[B,C] -> przetworz B -> queue=[C] -> przetworz C -> queue=[D] -> przetworz D. Wynik: A,B,C,D.',
              align: 'center',
              width: 'lg'
            },
            {
              blockType: 'text',
              content: 'Kluczowy problem: **Course Schedule** (LeetCode #207) - czy mozna ukonczyc wszystkie kursy biorac pod uwage wymagania wstepne? To pytanie o **wykrywanie cyklu w DAG**:\n\n- Jezeli Topological Sort (Kahn\'s) przetworzy wszystkie V wezlow - brak cyklu, mozna ukonczyc\n- Jezeli przetworzy mniej niz V - jest cykl, niemozliwe\n\nTo jeden z najczesciej pytanych problemow grafowych na poziomie junior/mid. Kahn\'s jest preferowany bo intuicyjny i naturalne wykrywa cykl przez porownanie `order.length === numCourses`.'
            },
            {
              blockType: 'callout',
              variant: 'warning',
              title: 'Topological Sort wymaga DAG - brak cyklow!',
              content: 'Topological Sort jest mozliwy TYLKO dla DAG (Directed Acyclic Graph). Jezeli graf ma cykl (A zalezny od B, B od C, C od A) - nie ma mozliwego uporzadkowania topologicznego. Kahn\'s Algorithm automatycznie wykrywa to: jezeli po przetworzeniu kolejki wynik zawiera mniej wezlow niz V, to pozostale wezly sa w cyklu. DFS-based: wezel w cyklu bedzie "szary" (w trakcie odwiedzania) gdy go napotkamy ponownie.'
            },
            {
              blockType: 'callout',
              variant: 'info',
              title: 'Zastosowania Topological Sort w praktyce',
              content: 'npm install i pip install uzywaja Topological Sort do ustalenia kolejnosci instalacji pakietow (pakiet B instalowany po A jezeli A jest zaleznoscia B). Kompilatory C++/Java kompiluja pliki w kolejnosci topologicznej (plik zalezny od innego musi byc skompilowany pozniej). GNU Make i systemy CI/CD (Jenkins, GitHub Actions) tez uzywaja Topological Sort dla zadan z zaleznosci.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Topological Sort mozna wykonac na:',
              tagSlugs: ['grafy', 'topological-sort', 'beginner'],
              choices: [
                'Dowolnym grafie skierowanym',
                'Tylko grafach nieskierowanych',
                'Tylko DAG (Directed Acyclic Graph)',
                'Tylko grafach spojnych'
              ],
              correctAnswer: 'Tylko DAG (Directed Acyclic Graph)',
              solution: 'Topological Sort wymaga dwoch warunkoow: (1) Graf musi byc SKIEROWANY (krawedzie maja kierunek, definiujacy porzadek). (2) Graf musi byc ACYKLICZNY (brak cykli - jezeli A zalezny od B a B od A, niemozliwe jest uporzadkowanie). DAG = Directed Acyclic Graph spelnia oba warunki.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'W algorytmie Kahna (BFS-based Topological Sort), jezeli liczba przetworzonych wezlow jest mniejsza niz V, oznacza to ze graf zawiera cykl.',
              tagSlugs: ['grafy', 'topological-sort', 'intermediate'],
              correctAnswer: 'true',
              solution: 'Prawda. Jezeli graf ma cykl, wezly w cyklu nigdy nie osiagna in-degree = 0 (bo zawsze jest krawedz "wchodzaca" od innego wezla w cyklu). Dlatego nie wejda do kolejki i nie beda przetworzone. Jezeli order.length < numCourses, brakujace wezly sa w cyklu - topological sort jest niemozliwy.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'Jaka jest time complexity algorytmu Kahna (BFS Topological Sort) dla grafu z V wezlami i E krawedziami?',
              tagSlugs: ['grafy', 'topological-sort', 'big-o', 'intermediate'],
              choices: [
                'O(V^2)',
                'O(V * E)',
                'O(V + E)',
                'O(E log V)'
              ],
              correctAnswer: 'O(V + E)',
              solution: 'Kahn\'s Algorithm: budowanie grafu i in-degree O(V + E). Inicjalizacja kolejki O(V). Glowna petla: kazdy wezel przetworzony raz O(V), dla kazdego wezla przetwarzamy jego krawedzie raz O(E). Lacznie O(V + E). To identyczne jak DFS/BFS na grafie - co ma sens, bo obie operacje sa oparte o przetworzenie wszystkich wezlow i krawedzi.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Masz n kursow (0..n-1) i liste wymagań [a, b] oznaczajacych "aby wziac kurs a, musisz najpierw wziac kurs b". Opisz algorytm sprawdzajacy czy mozna ukonczyc wszystkie kursy (Course Schedule problem).',
              tagSlugs: ['grafy', 'topological-sort', 'intermediate'],
              solution: 'Algorytm (Kahn\'s): 1) Zbuduj graf skierowany: dla kazdego [a,b] dodaj krawedz b->a (b jest prereq dla a). 2) Oblicz in-degree (liczba prerequsitow) kazdego kursu. 3) Wstaw do kolejki wszystkie kursy z in-degree=0 (brak wymagan). 4) BFS: zdejmij kurs z kolejki, dla kazdego kursu ktory go potrzebuje (sasiedzi) zmniejsz in-degree o 1. Jezeli in-degree sasiada = 0, dodaj do kolejki. 5) Policz przetworzone kursy. Jezeli == n - mozna ukonczyc (return true). Jezeli < n - jest cykl (return false). Kurs A wymaga B wymaga A = cykl = niemozliwe. Time: O(V + E), Space: O(V + E).',
              points: 2,
              isPublished: false
            }
          ]
        },

        // -------------------------------------------------------
        // LEKCJA 6.3
        // -------------------------------------------------------
        {
          title: 'Lekcja 6.3: Union-Find (Disjoint Set Union)',
          order: 3,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: '**Union-Find** (znany tez jako Disjoint Set Union, DSU) to struktura danych do efektywnego zarzadzania zbiorami rozlaczymi i odpowiadania na pytania: "Czy elementy A i B naleza do tego samego zbioru?" i "Polacz zbiory zawierajace A i B". Uzywana w: wykrywaniu cyklow w grafie, Kruskal\'s MST Algorithm, Number of Connected Components, Dynamic Connectivity. Kluczowa zaleta: operacje **Find** i **Union** sa prawie O(1) po zastosowaniu optymalizacji!'
            },
            {
              blockType: 'text',
              content: 'Implementacja Union-Find z optymalizacjami:\n```\nclass UnionFind {\n  constructor(n) {\n    this.parent = Array.from({length: n}, (_, i) => i); // kazdy jest swoim rodzicem\n    this.rank = new Array(n).fill(0); // do Union by Rank\n  }\n\n  find(x) { // z Path Compression\n    if (this.parent[x] !== x) {\n      this.parent[x] = this.find(this.parent[x]); // path compression!\n    }\n    return this.parent[x];\n  }\n\n  union(x, y) { // Union by Rank\n    const rootX = this.find(x);\n    const rootY = this.find(y);\n    if (rootX === rootY) return false; // juz w tym samym zbiorze\n    if (this.rank[rootX] < this.rank[rootY]) [rootX, rootY] = [rootY, rootX];\n    this.parent[rootY] = rootX;\n    if (this.rank[rootX] === this.rank[rootY]) this.rank[rootX]++;\n    return true; // polaczono\n  }\n\n  connected(x, y) {\n    return this.find(x) === this.find(y);\n  }\n}\n```'
            },
            {
              blockType: 'text',
              content: 'Dwie kluczowe optymalizacje:\n\n**1) Path Compression**: Podczas operacji find(), sprasuj sciezke - ustaw rodzica bezposrednio na korzen. Nastepne find() dla tego samego wezla bedzie O(1). Implementacja: `parent[x] = find(parent[x])` (rekurencja sprasowuje na biezaco).\n\n**2) Union by Rank (lub Union by Size)**: Zawsze podpinaj mniejsze drzewo pod wieksze. Zapobiega zdegenerowanym dlugim lancuchom. Z obiema optymalizacjami: amortyzowana zlozonosc to praktycznie **O(alpha(n))** gdzie alpha to funkcja odwrotna Ackermanna - rosnie absolutnie wolno, dla wszelkich praktycznych n wynosi <= 4.'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Diagram Union-Find. Lewa strona: poczatkowy stan - 5 wezlow, kazdy sam sobie rodzicem (parent=[0,1,2,3,4]). Srodek: po union(0,1), union(1,2) - 0 jest korzeniem dla 0,1,2. Prawa strona: path compression - po find(2), parent[2] wskazuje bezposrednio na 0 zamiast na 1. Dwa drzewa: przed i po path compression, pokazujace jak sciezka sie "sprasowuje".',
              align: 'center',
              width: 'lg'
            },
            {
              blockType: 'text',
              content: 'Wykrywanie cyklu za pomoca Union-Find:\n```\nfunction hasCycle(n, edges) {\n  const uf = new UnionFind(n);\n  for (const [u, v] of edges) {\n    if (uf.connected(u, v)) return true; // juz w tym samym zbiorze = cykl!\n    uf.union(u, v);\n  }\n  return false;\n}\n```\nLogika: dla kazdej krawedzi (u, v) sprawdzamy czy u i v sa juz polaczone (connected). Jezeli tak - dodanie krawedzi (u, v) stworzyloby cykl. Jezeli nie - laczymy je (union). O(E * alpha(n)) ≈ O(E) dla E krawedzi.'
            },
            {
              blockType: 'callout',
              variant: 'info',
              title: 'Union-Find vs DFS do Connected Components',
              content: 'Oba rozwiazuja "ile jest spojnych skladowych?". DFS: O(V + E), jednorazowe przetworzenie statycznego grafu. Union-Find: O(E * alpha(n)), ale obsluguje **dynamiczne dodawanie krawedzi** - mozesz pytac o lacznosc po kazdym dodaniu krawedzi. To kluczowa przewaga: Union-Find dla dynamic connectivity, DFS dla static graph. Jesli pytanie dotyczy krawedzi dodawanych online - Union-Find.'
            },
            {
              blockType: 'callout',
              variant: 'tip',
              title: 'Kiedy szybko rozpoznac problem Union-Find?',
              content: 'Kluczowe slowa: "polacz grupy", "sprawdz czy w tej samej grupie", "liczba spojnych skladowych", "Minimum Spanning Tree (Kruskal)", "Redundant Connection", "Accounts Merge". Jezeli problem dotyczy grupowania lub sprawdzania lacznosci bez potrzeby pelnego traversalu - Union-Find. Szybszy od DFS/BFS dla dynamicznych zapytan o lacznosc.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Jaka jest amortyzowana zlozonosc operacji find() w Union-Find z Path Compression i Union by Rank?',
              tagSlugs: ['union-find', 'big-o', 'intermediate'],
              choices: [
                'O(n)',
                'O(log n)',
                'O(alpha(n)) - praktycznie O(1)',
                'O(1) dokladnie'
              ],
              correctAnswer: 'O(alpha(n)) - praktycznie O(1)',
              solution: 'Z obiema optymalizacjami (Path Compression + Union by Rank/Size), amortyzowana zlozonosc to O(alpha(n)) gdzie alpha to funkcja odwrotna Ackermanna. Dla wszelkich praktycznych wartosci n (nawet n = 10^80), alpha(n) <= 4. Wiec w praktyce jest to stala - niemal O(1). Formalnie nie jest O(1), bo alpha(n) rosnie (bardzo, bardzo wolno), ale na rozmowie mozna mowic "praktycznie O(1) amortyzowane".',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'Path Compression w Union-Find zmienia logiczna strukture zbiorow (ktore elementy naleza do ktorego zbioru).',
              tagSlugs: ['union-find', 'intermediate'],
              correctAnswer: 'false',
              solution: 'Falsz. Path Compression zmienia tylko wewnetrzna reprezentacje (wskaznik parent[]), ale nie zmienia KTORE elementy naleza do KTOREGO zbioru. Wszystkie elementy na sprasowanej sciezce nadal wskazuja na ten sam korzen - wiec connected(x, y) zwroci ten sam wynik przed i po compression. To optymalizacja struktury, nie zmiany logiki.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'Uzyjesz Union-Find do wykrywania cyklu w grafie nieskierowanym. Przetwarzasz krawedz (u, v). Jak stwierdzasz ze ta krawedz tworzy cykl?',
              tagSlugs: ['union-find', 'grafy', 'intermediate'],
              choices: [
                'Gdy find(u) == u (u jest korzeniem swojego zbioru)',
                'Gdy find(u) == find(v) przed wykonaniem union(u, v)',
                'Gdy rank[u] > rank[v]',
                'Gdy u i v sa sasiadami w grafie'
              ],
              correctAnswer: 'Gdy find(u) == find(v) przed wykonaniem union(u, v)',
              solution: 'Jezeli find(u) == find(v), oznacza to ze u i v sa juz w tym samym spojnym zbiorze - istnieje juz sciezka miedzy nimi. Dodanie krawedzi (u, v) stworzyloby drugi sposob polaczenia = cykl. Dlatego przed kazda union sprawdzamy connected(u, v). Jezeli true - cykl. Jezeli false - bezpiecznie laczymy.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Wytlumacz optymalizacje "Union by Rank" w Union-Find. Dlaczego jest potrzebna? Jaki problem rozwiazuje bez niej?',
              tagSlugs: ['union-find', 'intermediate'],
              solution: 'Bez Union by Rank: zawsze podpinamy drugie drzewo pod pierwsze niezaleznie od ich rozmiarow. Prowadzi to do zdegenerowanych lancuchow: union(0,1), union(1,2), union(2,3)... tworzy lancuch 0->1->2->3->... Operacja find() na koncu lancucha wymaga O(n) krokow - caly sens Union-Find spada do efektywnosci Linked List. Union by Rank: zawsze podpinamy mniejsze drzewo pod wieksze (wedlug rangi/glebokosci). Rank wzrasta o 1 tylko gdy dwa drzewa o tej samej randze sie lacza. Gwarantuje ze rank(drzewo) <= log(rozmiar). Bez Path Compression: find() = O(log n). Z Path Compression: amortyzowane O(alpha(n)). Razem obie optymalizacje daja prawie O(1) operacje.',
              points: 2,
              isPublished: false
            }
          ]
        },

        // -------------------------------------------------------
        // LEKCJA 6.4
        // -------------------------------------------------------
        {
          title: 'Lekcja 6.4: Klasyczne zadania grafowe na interview',
          order: 4,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'W tej lekcji skupiamy sie na najczesciej pytanych problemach grafowych, ktore pojawiaja sie na rozmowach poziomu junior i mid. Znajomosc tych problemow - nie tylko "jak" ale "dlaczego dane podejscie dziala" - wyroznia kandydatow. Przejdziemy przez: Rotting Oranges (BFS multi-source), Clone Graph, Course Schedule II oraz wzorzec "Bipartite Graph Check".'
            },
            {
              blockType: 'text',
              content: '**Rotting Oranges** (BFS Multi-Source): Masz siatke z swiezymi (1) i gnijaacymi (2) pomaraczami. Co minute kazda swiezka sasiadujaca z gnijaca staje sie gnijaca. Ile czasu minie az wszystkie zgnieja? Rozwiazanie: BFS startujacy jednoczesnie ze WSZYSTKICH gnijacych pomaranczy (multi-source BFS!). Zamiast jednego punktu startowego, wstawiamy wszystkie "2" do kolejki naraz. Krok BFS = jedna minuta. Po zakonczeniu sprawdzamy czy pozostaly swieze.\n\nKlucz: Multi-Source BFS = jednoczesne rozprzestrzenianie sie "zarazy" ze wszystkich zrodel naraz. O(m*n) time i space.'
            },
            {
              blockType: 'text',
              content: '**Clone Graph** (klonowanie grafu): Podany wezel grafu, sklonuj caly graf (deep copy). Kazdy wezel ma val i liste neighbors. Rozwiazanie z HashMap:\n```\nfunction cloneGraph(node) {\n  if (!node) return null;\n  const cloned = new Map(); // original -> kopia\n  function dfs(n) {\n    if (cloned.has(n)) return cloned.get(n); // juz sklonowany!\n    const copy = new Node(n.val);\n    cloned.set(n, copy); // ZANIM rekurencja (unika cykli)\n    for (const neighbor of n.neighbors) {\n      copy.neighbors.push(dfs(neighbor));\n    }\n    return copy;\n  }\n  return dfs(node);\n}\n```\nKlucz: ustaw clone w mapie PRZED rekurencyjnym przetworzeniem sasiadow - zapobiega nieskonczonym petlom przy cyklach. O(V + E) time i space.'
            },
            {
              blockType: 'text',
              content: '**Bipartite Graph Check** (sprawdzenie dwudzielnosci): Graf jest dwudzielny jezeli mozna pokolorowac jego wezly na dwa kolory tak, ze zadne dwa sasiednie wezly nie maja tego samego koloru. Przyklad: matching pracownikow do zadan, sprawdzenie konfliktow. Algorytm: BFS/DFS z kolorowaniem. Zacznij z dowolnego wezla, koloruj na kolor 0. Wszystkich sasiadow koloruj na kolor 1. Ich sasiadow z powrotem 0. Jezeli napotkamy sasiad juz pokolorowany tym samym kolorem co biezacy - nie jest dwudzielny.'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Cztery mini-diagramy. 1) Rotting Oranges: siatka 3x3 z pomaraczami, gnijace zaznaczone czerwonym, strzalki rozprzestrzeniania sie w czasie T=0,1,2. 2) Clone Graph: oryginalny graf (wezly z numerami) i jego kopia z zaznaczonymi "nowymi" wezlami, strzalka "deep copy". 3) Bipartite: graf z wezlami pokolorowanymi na niebiesko i czerwono, brak krawedzi miedzy jednakowymi kolorami. 4) Course Schedule: DAG z kursami jako wezly i prerequsitami jako krawedzie, zaznaczona kolejnosc topologiczna.',
              align: 'center',
              width: 'lg'
            },
            {
              blockType: 'callout',
              variant: 'tip',
              title: 'Wzorce grafowe na rozmowie - szybka mapa decyzyjna',
              content: 'Zapamiaj te sygnatury: "najkrotsza sciezka w grafie niewazonm" -> BFS. "Czy istnieje sciezka / liczba spojnych skladowych" -> DFS lub BFS + visited. "Zaleznosci, kolejnosc wykonania" -> Topological Sort (Kahn\'s). "Czy mozna polaczyc X do Y / wykryj cykl w grafie nieskierowanym" -> Union-Find. "Coraz wiekszy obszar rozrasta sie od wielu punktow" -> Multi-Source BFS. "Pokoloruj / sprawdz dwudzielnosc" -> DFS/BFS + color array.'
            },
            {
              blockType: 'callout',
              variant: 'info',
              title: 'Dijkstra - skrot dla zainteresowanych',
              content: 'Dijkstra to algorytm najkrotszej sciezki w grafie WAZONM z nieujemnymi wagami. Uzywa Min-Heap (Priority Queue): startuj od zrodla z dystansem 0. Zawsze przetwarzaj wezel o najmniejszym biezacym dystansie. Aktualizuj dystanse sasiadow. O((V + E) log V) z Min-Heap. Na poziomie junior rzadko wymagany w pelni, ale warto wiedziec ze "BFS niewazone = Dijkstra z wagami 1, Dijkstra wazony = BFS z Priority Queue".'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'W problemie "Rotting Oranges", dlaczego uzywamy Multi-Source BFS (wiele punktow startowych) zamiast uruchamiania oddzielnego BFS dla kazdej gnilej pomaranczy?',
              tagSlugs: ['grafy', 'bfs', 'intermediate'],
              choices: [
                'Bo oddzielne BFS-y bylyby wolniejsze algorytmicznie (wyzsze Big O)',
                'Bo gnijace pomaranzcze gnieja jednoczesnie - symulujemy rownolegle rozprzestrzenianie sie, a Multi-Source BFS naturalnie to modeluje',
                'Bo nie mozna uruchomic BFS wiele razy na tej samej siatce',
                'Bo oddzielne BFS-y nie wykrylyby wszystkich swiezych pomaranczy'
              ],
              correctAnswer: 'Bo gnijace pomaranzcze gnieja jednoczesnie - symulujemy rownolegle rozprzestrzenianie sie, a Multi-Source BFS naturalnie to modeluje',
              solution: 'Gnijace pomaranzcze psuja sasiadow jednoczesnie (w tej samej minucie), nie sekwencyjnie. Multi-Source BFS modeluje to idealnie: wszystkie zrodla sa w kolejce naraz, krok BFS = jedna minuta czasu. Sekwencyjne BFS-y bylyby semantycznie bledne - pierwsza gnijaca rozprzestrzeniaby sie "przed" druga, zamiast rownoczesnie. Algorytmicznie oba sa O(m*n), ale Multi-Source jest semantycznie poprawny.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'Kazdy graf skierowany acykliczny (DAG) jest grafem dwudzielnym (bipartite).',
              tagSlugs: ['grafy', 'advanced'],
              correctAnswer: 'false',
              solution: 'Falsz. DAG i bipartite to niezalezne wlasciwosci. DAG = brak cykli, skierowany. Bipartite = mozna 2-kolorowac (brak nieparzystych cykli). Graf moze byc DAG ale nie bipartite (np. trojkat skierowany acyklicznie), i odwrotnie - bipartite ale nie DAG (graf nieskierowany dwudzielny ma cykle parzyste). Nie ma zawierania miedzy tymi klasami.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'Przy klonowaniu grafu z cyklami (Clone Graph), dlaczego musimy przechowywac juz sklonowane wezly w HashMap przed rekurencyjnym przetwarzaniem sasiadow?',
              tagSlugs: ['grafy', 'dfs', 'intermediate'],
              choices: [
                'Aby posortowac sklonowane wezly',
                'Aby zapobiec nieskonczonym petlom rekurencyjnym przy natrafieniu na juz sklonowany wezel (cykl)',
                'Aby zwolnic pamiec szybciej po klonowaniu',
                'HashMap jest wymagana tylko dla grafow z wagami'
              ],
              correctAnswer: 'Aby zapobiec nieskonczonym petlom rekurencyjnym przy natrafieniu na juz sklonowany wezel (cykl)',
              solution: 'W grafie z cyklami: wezel A ma sasiada B, B ma sasiada A. Bez HashMap: klonujemy A, klonujemy B (sasiad A), probiemy sklonowac A ponownie (sasiad B), i tak w nieskonczonosc. Z HashMap: klonujemy A, ZAPISUJEMY w mapie, klonujemy B. Gdy B przetwarza sasiada A, sprawdzamy mape - A juz sklonowany, zwracamy kopie. Cykl "zlamany".',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Opisz algorytm sprawdzajacy czy graf nieskierowany jest dwudzielny (Bipartite). Podaj przykladowe zastosowanie tej wlasciwosci i zlozonosc algorytmu.',
              tagSlugs: ['grafy', 'bfs', 'intermediate'],
              solution: 'Algorytm: Uzyj BFS/DFS z tablicą kolorow (color[], -1 = niepokolorowany, 0 lub 1 = kolor). Dla kazdego nieodwiedzonego wezla: pokoloruj go na 0, wstaw do kolejki. BFS: dla kazdego sasiada, jezeli niepokolorowany - pokoloruj na 1-color[biezacy] (przeciwny kolor), dodaj do kolejki. Jezeli juz pokolorowany TYM SAMYM kolorem - zwroc false (nie bipartite). Jezeli przetworzymy wszystkie wezly bez konfliktu - return true. Zastosowanie: matching pracownikow do stanowisk (pracownicy sa jednym zbiorem, stanowiska drugim, krawedz = moze pracowac), sprawdzenie konfliktow haromonogramu, kolorowanie mapy. Zlozonosc: O(V + E) time, O(V) space.',
              points: 2,
              isPublished: false
            }
          ]
        }
      ]
    }
  ]
};
