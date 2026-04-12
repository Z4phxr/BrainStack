// data/courses/dsa-course-pt4.js
// MODUL 7: Programowanie Dynamiczne (Dynamic Programming)
// MODUL 8: Wzorce Rekrutacyjne i Strategia Rozmowy

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
    // MODUL 7: Programowanie Dynamiczne
    // =========================================================
    {
      title: 'Modul 7: Dynamic Programming - od rekurencji do mistrzostwa',
      order: 7,
      isPublished: false,

      lessons: [

        // -------------------------------------------------------
        // LEKCJA 7.1
        // -------------------------------------------------------
        {
          title: 'Lekcja 7.1: Czym jest DP - memoizacja vs tabulacja',
          order: 1,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: '**Dynamic Programming (DP)** to technika algorytmiczna, ktora eliminuje powielone obliczenia przez **zapamietywanie wynikow podproblemow**. Brzmi prosto, ale DP jest uznawane za jedno z najtrudniejszych zagadnien na rozmowach kwalifikacyjnych - wymaga innego sposobu myslenia. Klucz: DP stosujemy gdy problem mozna podzielic na **pokrywajace sie podproblemy** (overlapping subproblems) i ma **optymalna podstrukture** (optimal substructure) - optymalne rozwiazanie calego problemu skladaa sie z optymalnych rozwiazan podproblemow.'
            },
            {
              blockType: 'text',
              content: 'Przyklad dlaczego DP jest potrzebne: obliczanie n-tej liczby Fibonacciego rekurencyjnie bez DP:\n```\nfunction fib(n) {\n  if (n <= 1) return n;\n  return fib(n-1) + fib(n-2); // EKSPONENCJALNA zlozonosc!\n}\n```\nfib(50) wykonuje **ponad 2 miliardy** wywolan! Dlaczego? Bo fib(45) jest obliczane wielokrotnie - raz w galezi fib(47), raz w fib(46), raz w fib(45)... Kazdy wynik jest przeliczany od nowa. DP zapamietuje wyniki - kazdy podproblem obliczany **dokladnie raz**. Czas spada z O(2^n) do O(n).'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Drzewo rekurencji dla fib(6) bez memoizacji. Pokazuje wielokrotne obliczanie tych samych wartosci: fib(4) pojawia sie dwa razy, fib(3) trzy razy, fib(2) piec razy. Czerwone kolka zaznaczaja zduplikowane wywolania. Obok uproszczone drzewo z memoizacja - te same wywolania zaznaczone "cached", strzalki pomijajace ponowne obliczenia. Porownanie: "O(2^n) vs O(n) - ta sama odpowiedz, drastycznie mniej pracy".',
              align: 'center',
              width: 'lg'
            },
            {
              blockType: 'text',
              content: 'Dwa podejscia implementacji DP:\n\n**1) Memoization (Top-Down)**: Zacznij od problemu glownego, rozwiazuj rekurencyjnie, zapamietuj wyniki w tablicy/mapie. "Leniwe" - oblicza tylko potrzebne podproblemy.\n```\nfunction fib(n, memo = {}) {\n  if (n in memo) return memo[n]; // cache hit!\n  if (n <= 1) return n;\n  memo[n] = fib(n-1, memo) + fib(n-2, memo);\n  return memo[n];\n}\n// O(n) time, O(n) space\n```\n\n**2) Tabulation (Bottom-Up)**: Zacznij od najmniejszych podproblemow, buduj tablice dp[] od dolu do gory. "Gorliwe" - oblicza wszystkie podproblemy.\n```\nfunction fib(n) {\n  if (n <= 1) return n;\n  const dp = [0, 1];\n  for (let i = 2; i <= n; i++) {\n    dp[i] = dp[i-1] + dp[i-2];\n  }\n  return dp[n];\n}\n// O(n) time, O(n) space (mozna zoptymalizowac do O(1)!)\n```'
            },
            {
              blockType: 'table',
              caption: 'Memoization (Top-Down) vs Tabulation (Bottom-Up)',
              hasHeaders: true,
              headers: ['Aspekt', 'Memoization', 'Tabulation'],
              rows: [
                ['Kierunek', 'Top-Down (rekurencja)', 'Bottom-Up (iteracja)'],
                ['Implementacja', 'Latwa - dodaj cache do rekurencji', 'Trudniejsza - trzeba zaplanowac kolejnosc'],
                ['Podproblemy', 'Tylko potrzebne (leniwe)', 'Wszystkie (gorliwe)'],
                ['Ryzyko', 'Stack overflow dla duzego n', 'Brak - iteracja'],
                ['Cache', 'HashMap/tablica', 'Tablica dp[]'],
                ['Kiedy lepsze', 'Gdy nie wszystkie podproblemy potrzebne', 'Gdy wszystkie potrzebne, wydajniejsze']
              ]
            },
            {
              blockType: 'text',
              content: 'Jak rozpoznac problem DP? Szukaj dwoch wlasciwosci:\n\n**1) Overlapping Subproblems**: Problem rozklada sie na podproblemy, ktore pojawiaja sie wielokrotnie. Jezeli drzewo rekurencji ma powielone galezie - DP pomoze.\n\n**2) Optimal Substructure**: Optymalne rozwiazanie glownego problemu zawiera optymalne rozwiazania podproblemow. Jezeli "najlepsza sciezka do X" zalezy od "najlepszej sciezki do Y" - DP pomoze.\n\nPrzykladowe sygnatury DP w zadaniach: "ile sposobow", "ile maksymalnie/minimalnie", "czy istnieje", "najdluzsza/najkrotsza sekwencja", "optymalna wartosc".'
            },
            {
              blockType: 'callout',
              variant: 'tip',
              title: 'Moj przepis na DP - 4 kroki na rozmowie',
              content: '1) ZDEFINIUJ dp[i] (lub dp[i][j]): co dokladnie reprezentuje ta wartosc? Napisz to slowami. 2) ZNAJDZ PRZEJSCIE (transition): jak dp[i] wynika z poprzednich stanow dp[i-1], dp[i-2] itd? 3) BAZA: jakie sa wartosci poczatkowe dp[0], dp[1]? 4) WYNIK: co jest ostateczna odpowiedzia - dp[n], max(dp), dp[n][m]? Bez zdefiniowania dp[i] w 1 zdaniu - nie zaczniesz dobrze pisac przejscia.'
            },
            {
              blockType: 'callout',
              variant: 'warning',
              title: 'Czesta pulapka: rekurencja bez memoizacji',
              content: 'Jezeli piszesz rozwiazanie rekurencyjne i nie masz memoizacji - prawdopodobnie masz eksponencjalna zlozonosc. Na rozmowie, jezeli twoj kod dziala poprawnie ale jest za wolny, rekruter zapyta "jaka jest zlozonosc?" i "jak mozna to przyspieszyc?". Odpowiedz: "mozna dodac memoizacje i zamienic na DP" - to standard. Zawsze sprawdzaj czy twoja rekurencja przelicza te same podproblemy.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Jaka jest time complexity obliczania n-tej liczby Fibonacciego bez Dynamic Programming (czysta rekurencja)?',
              tagSlugs: ['dynamic-programming', 'big-o', 'beginner'],
              choices: [
                'O(n)',
                'O(n log n)',
                'O(2^n)',
                'O(n^2)'
              ],
              correctAnswer: 'O(2^n)',
              solution: 'Czysta rekurencja fib(n) tworzy drzewo rekurencji, gdzie kazde wywolanie generuje dwa podwywolania. Drzewo ma glebokosc n i do 2^n wezlow. Wiele podproblemow (np. fib(2), fib(3)) jest przeliczanych wielokrotnie. DP (memoizacja lub tabulacja) redukuje to do O(n) przez zapamietywanie wynikow.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'Ktore z ponizszych jest przykladem "overlapping subproblems" (nakladajacych sie podproblemow)?',
              tagSlugs: ['dynamic-programming', 'beginner'],
              choices: [
                'Binary Search - kazdy podproblem jest unikalny (inna czesc tablicy)',
                'Merge Sort - podproblemy sa rozlaczne (rozne czesci tablicy)',
                'Fibonacci - fib(3) jest obliczane wielokrotnie w drzewie rekurencji fib(10)',
                'Linear Search - kolejne porownania sa niezalezne'
              ],
              correctAnswer: 'Fibonacci - fib(3) jest obliczane wielokrotnie w drzewie rekurencji fib(10)',
              solution: 'Overlapping subproblems oznacza ze te same podproblemy pojawiaja sie wiele razy. fib(3) jest potrzebne do obliczenia fib(4), fib(5), fib(6)... - wielokrotnie ten sam podproblem. Binary Search i Merge Sort maja ROZLACZNE podproblemy - kazdy podproblem jest unikalny i nie powtarza sie. Dlatego Merge Sort to Divide and Conquer, nie DP.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'Memoization (Top-Down DP) zawsze oblicza wszystkie mozliwe podproblemy, podobnie jak Tabulation (Bottom-Up).',
              tagSlugs: ['dynamic-programming', 'memoization', 'intermediate'],
              correctAnswer: 'false',
              solution: 'Falsz. Memoization jest "leniwa" (lazy) - oblicza TYLKO podproblemy potrzebne do rozwiazania glownego problemu. Tabulation jest "gorliwa" (eager) - oblicza WSZYSTKIE podproblemy w ustalonej kolejnosci. Jezeli problem wymaga tylko czesci podproblemow, memoizacja moze byc efektywniejsza. Tabulation za to nie ryzykuje stack overflow i czesto jest szybsza praktycznie ze wzgledu na brak narzutu rekurencji.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Opisz roznice miedzy Divide and Conquer (np. Merge Sort) a Dynamic Programming. Oba dziela problem na podproblemy - co je odroznna?',
              tagSlugs: ['dynamic-programming', 'divide-and-conquer', 'intermediate'],
              solution: 'Kluczowa roznica: OVERLAP. Divide and Conquer (Merge Sort, Binary Search) dzieli problem na ROZLACZNE podproblemy - kazdy podproblem jest unikalny, nie powtarza sie, rozwiazywany dokladnie raz. Brak sensu zapamietywac wyniki. Dynamic Programming ma NAKLADAJACE SIE podproblemy - te same podproblemy pojawiaja sie wielokrotnie w drzewie rekurencji. Zapamietywanie wynikow (memoizacja/tabulacja) eliminuje powielone obliczenia. Druga roznica: DP wymaga optimal substructure - optymalne rozwiazanie calego problemu sklada sie z optymalnych podproblemow. Merge Sort tez ma optimal substructure, ale brak overlapping subproblems, wiec to D&C a nie DP.',
              points: 2,
              isPublished: false
            }
          ]
        },

        // -------------------------------------------------------
        // LEKCJA 7.2
        // -------------------------------------------------------
        {
          title: 'Lekcja 7.2: Klasyczne wzorce DP - 1D (Climbing Stairs, House Robber)',
          order: 2,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Jednoymiarowe DP to najlepsza brama wejsciowa do programowania dynamicznego. Tablica dp[] ma jeden wymiar - dp[i] to wynik dla podproblemu rozmiaru i. Przejscie (transition) zwykle odwoluje sie do dp[i-1], dp[i-2] lub dp[i-k]. Te problemy na rozmowach junior sa absolutnym standardem - rekruter zaklamuje ze byc ich nie zna bylby czerwona flaga. Nauczmy sie Climbing Stairs, House Robber i kilku warinatow.'
            },
            {
              blockType: 'text',
              content: '**Climbing Stairs** (ile sposobow wejsc na n schodkow, robiacy krok 1 lub 2):\n\nDefinicja dp[i]: liczba sposobow dotarcia do schodka i.\nPrzejscie: dp[i] = dp[i-1] + dp[i-2]. Dlaczego? Na schodek i mozemy wejsc ze schodka i-1 (krok 1) lub ze schodka i-2 (krok 2).\nBaza: dp[0] = 1 (jeden sposob na "schodek 0" - stoj), dp[1] = 1.\n\n```\nfunction climbStairs(n) {\n  if (n <= 2) return n;\n  let prev2 = 1, prev1 = 2;\n  for (let i = 3; i <= n; i++) {\n    const curr = prev1 + prev2;\n    prev2 = prev1;\n    prev1 = curr;\n  }\n  return prev1;\n}\n// O(n) time, O(1) space (zoptymalizowane - tylko dwie zmienne!)\n```\nTo identyczne jak Fibonacci! Srodkowosc i elegancja tego rozwiazania jest typowym powodem pytania o nie na rozmowie.'
            },
            {
              blockType: 'text',
              content: '**House Robber** (wlamywacz nie moze okrasc dwoch sasiadujacych domow, zmaksymalizuj lup):\n\nDefinicja dp[i]: maksymalny lup mozliwy do zdobycia z pierwszych i domow.\nPrzejscie: dp[i] = max(dp[i-1], dp[i-2] + nums[i]). Dla kazdego domu mamy wybor: pomin go (dp[i-1]) lub okradnij i wezmij dp[i-2] + wartoscbiez (bo dp[i-1] byloby sasiedni).\nBaza: dp[0] = nums[0], dp[1] = max(nums[0], nums[1]).\n\n```\nfunction rob(nums) {\n  if (nums.length === 1) return nums[0];\n  let prev2 = nums[0];\n  let prev1 = Math.max(nums[0], nums[1]);\n  for (let i = 2; i < nums.length; i++) {\n    const curr = Math.max(prev1, prev2 + nums[i]);\n    prev2 = prev1;\n    prev1 = curr;\n  }\n  return prev1;\n}\n// O(n) time, O(1) space\n```'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Dwa diagramy DP tabelarycznego. Diagram 1 - Climbing Stairs n=5: rząd dp[] = [1, 1, 2, 3, 5, 8] z indeksami 0-5. Strzalki pokazujace dp[i] = dp[i-1] + dp[i-2]. Zaznaczone ze to ciag Fibonacciego. Diagram 2 - House Robber nums=[2,7,9,3,1]: tabela dp[] = [2, 7, 11, 11, 12] z indeksami 0-4. Dla dp[2]: strzalki z dp[0]=2 i nums[2]=9, wynik 11. Dla dp[4]: max(dp[3]=11, dp[2]=11+1=12)=12.',
              align: 'center',
              width: 'lg'
            },
            {
              blockType: 'text',
              content: '**Min Cost Climbing Stairs** (wariant - kazdy schodek ma koszt, wejdz na szczyt minimalnym kosztem):\n\nDefinicja dp[i]: minimalny koszt dotarcia do schodka i.\nPrzejscie: dp[i] = cost[i] + min(dp[i-1], dp[i-2]).\nBaza: dp[0] = cost[0], dp[1] = cost[1].\nWynik: min(dp[n-1], dp[n-2]) - mozna skonczyc na n-1 lub n-2.\n\n**Coin Change** (ile minimum monet potrzeba na kwote target):\n\nDefinicja dp[i]: minimalna liczba monet dla kwoty i.\nPrzejscie: dp[i] = min(dp[i - coin] + 1) dla kazdej monety.\nBaza: dp[0] = 0, dp[i] = Infinity na poczatku.\n```\nfunction coinChange(coins, amount) {\n  const dp = new Array(amount + 1).fill(Infinity);\n  dp[0] = 0;\n  for (let i = 1; i <= amount; i++) {\n    for (const coin of coins) {\n      if (coin <= i) dp[i] = Math.min(dp[i], dp[i - coin] + 1);\n    }\n  }\n  return dp[amount] === Infinity ? -1 : dp[amount];\n}\n// O(amount * coins.length) time, O(amount) space\n```'
            },
            {
              blockType: 'callout',
              variant: 'tip',
              title: 'Optymalizacja Space: O(n) -> O(1)',
              content: 'Wiele problemow DP z przejsciem dp[i] = f(dp[i-1], dp[i-2]) mozna zoptymalizowac do O(1) space. Zamiast przechowywac cala tablice dp[], trzymamy tylko dwie zmienne (prev1, prev2). Climbing Stairs: zamiast dp[] - tylko dwa inty. House Robber: zamiast dp[] - prev1 i prev2. Fibonacci: zamiast dp[] - dwa inty. Jezeli rekruter zapyta "czy mozna zaoszczedzic pamiec?" - to jest odpowiedz.'
            },
            {
              blockType: 'callout',
              variant: 'info',
              title: 'Coin Change to klasyczny Unbounded Knapsack',
              content: 'Coin Change nalezy do rodziny "Unbounded Knapsack" - mozna uzywac tych samych monet wielokrotnie. Roznia sie od "0/1 Knapsack" gdzie kazdy przedmiot moze byc uzyty co najwyzej raz. W Coin Change dp[i - coin] oznacza ze moneta coin moze byc uzyta wiele razy dla tej samej kwoty. Zobaczysz wiecej o Knapsack w lekcji 7.4.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Jaka jest wartosc dp[5] dla problemu Climbing Stairs (gdzie dp[i] = liczba sposobow na i schodkow, krok 1 lub 2)?',
              tagSlugs: ['dynamic-programming', 'beginner'],
              choices: [
                '5',
                '7',
                '8',
                '13'
              ],
              correctAnswer: '8',
              solution: 'dp[0]=1, dp[1]=1, dp[2]=2, dp[3]=3, dp[4]=5, dp[5]=8. To ciag Fibonacciego (przesunipty o 1). dp[5] = dp[4] + dp[3] = 5 + 3 = 8. 8 roznych sposobow wejscia na 5 schodkow krokami o 1 lub 2.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'House Robber: nums = [2, 1, 1, 2]. Jaki jest maksymalny lup?',
              tagSlugs: ['dynamic-programming', 'beginner'],
              choices: [
                '3',
                '4',
                '6',
                '2'
              ],
              correctAnswer: '4',
              solution: 'dp[0]=2, dp[1]=max(2,1)=2, dp[2]=max(dp[1]=2, dp[0]+nums[2]=2+1=3)=3, dp[3]=max(dp[2]=3, dp[1]+nums[3]=2+2=4)=4. Optymalna strategia: okradnij dom 0 (wartosc 2) i dom 3 (wartosc 2) = 4. Nie mozna okrasc 0 i 1 ani 2 i 3 (sasiedzi).',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'W problemie Coin Change dp[0] = 0, bo potrzeba 0 monet aby uzyskac kwote 0.',
              tagSlugs: ['dynamic-programming', 'beginner'],
              correctAnswer: 'true',
              solution: 'Prawda. dp[0] = 0 to baza problemu Coin Change - aby uzyskac kwote 0, nie potrzebujemy zadnych monet. Ta baza pozwala poprawnie obliczac dp[coin] = dp[coin - coin] + 1 = dp[0] + 1 = 1 dla kazdej dostepnej monety. Bez tej bazy cale DP nie dziala.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Zdefiniuj dp[i] dla problemu House Robber, napisz przejscie (transition formula) i wyjasnij dlaczego jest poprawne.',
              tagSlugs: ['dynamic-programming', 'intermediate'],
              solution: 'Definicja: dp[i] = maksymalny lup mozliwy okradajac z pierwszych (i+1) domow (indeks 0..i). Przejscie: dp[i] = max(dp[i-1], dp[i-2] + nums[i]). Uzasadnienie dwoch opcji: 1) Pomin dom i - wtedy najlepszy lup to dp[i-1] (najlepszy wynik bez domu i). 2) Okradnij dom i - nie mozesz wziac dp[i-1] (bo dom i-1 jest sasiadem), wiec bierzesz dp[i-2] (najlepszy wynik do domu i-2) + nums[i] (wartosc biezacego domu). Baza: dp[0] = nums[0] (jeden dom - wez go), dp[1] = max(nums[0], nums[1]) (dwa domy - wez lepszy). Wynik: dp[n-1].',
              points: 2,
              isPublished: false
            }
          ]
        },

        // -------------------------------------------------------
        // LEKCJA 7.3
        // -------------------------------------------------------
        {
          title: 'Lekcja 7.3: Klasyczne wzorce DP - 2D (Unique Paths, LCS)',
          order: 3,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Dwuwymiarowe DP uzywa tablicy dp[i][j] - wynik dla podproblemu o dwoch parametrach (zazwyczaj dwa indeksy lub dwa obiekty). Wiekszos problemow na stringach, sekwencjach i siatkach to wlasnie 2D DP. Rozroznienie: jezeli w problemie pojawia sie "dwa stringi", "siatka 2D", lub "dwa parametry stanu" - pomysl o dp[i][j]. Kluczowe wzorce: Unique Paths, Longest Common Subsequence (LCS), Edit Distance.'
            },
            {
              blockType: 'text',
              content: '**Unique Paths** (ile unikalnych sciezek z lewego-gornego do prawego-dolnego rogu siatki m x n, ruch tylko prawo/dol):\n\nDefinicja dp[i][j]: liczba sciezek do komorki (i, j).\nPrzejscie: dp[i][j] = dp[i-1][j] + dp[i][j-1]. Do komorki mozna dojsc z gory lub z lewej.\nBaza: dp[0][j] = 1 (caly gorny rzad), dp[i][0] = 1 (cala lewa kolumna). Jeden sposob na kazda komorke z gornego rzadu i lewej kolumny (prosto w prawo lub prosto w dol).\n\n```\nfunction uniquePaths(m, n) {\n  const dp = Array.from({length: m}, () => new Array(n).fill(1));\n  for (let i = 1; i < m; i++) {\n    for (let j = 1; j < n; j++) {\n      dp[i][j] = dp[i-1][j] + dp[i][j-1];\n    }\n  }\n  return dp[m-1][n-1];\n}\n// O(m*n) time i space\n```'
            },
            {
              blockType: 'text',
              content: '**Longest Common Subsequence (LCS)** - najdluzsza wspolna podsekwencja dwoch stringow (nie musi byc ciagla):\n\nDefinicja dp[i][j]: dlugosc LCS dla s1[0..i-1] i s2[0..j-1].\nPrzejscie:\n- Jezeli s1[i-1] === s2[j-1]: dp[i][j] = dp[i-1][j-1] + 1 (znaki pasuja, dodajemy do LCS)\n- Inaczej: dp[i][j] = max(dp[i-1][j], dp[i][j-1]) (pomin znak z s1 lub z s2, wez lepszy wynik)\nBaza: dp[0][j] = 0, dp[i][0] = 0.\n\n```\nfunction longestCommonSubsequence(s1, s2) {\n  const m = s1.length, n = s2.length;\n  const dp = Array.from({length: m+1}, () => new Array(n+1).fill(0));\n  for (let i = 1; i <= m; i++) {\n    for (let j = 1; j <= n; j++) {\n      if (s1[i-1] === s2[j-1]) dp[i][j] = dp[i-1][j-1] + 1;\n      else dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);\n    }\n  }\n  return dp[m][n];\n}\n// O(m*n) time i space\n```'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Dwie tablice DP wypelnione wartosciami. Lewa: Unique Paths dla siatki 4x4. Tabela dp[i][j] wypelniona: gorny rzad same 1, lewa kolumna same 1, pozostale komorki = suma z gory + z lewej. Strzalki pokazujace przejscie. Prawa: LCS dla "ABCBDAB" i "BDCABA". Macierz 8x7 z wyliczonymi wartosciami. Zaznaczona diagonalna strzalka przy pasujacych znakach (dp[i-1][j-1]+1) i poziome/pionowe przy nie pasujacych (max).',
              align: 'center',
              width: 'lg'
            },
            {
              blockType: 'text',
              content: '**Longest Increasing Subsequence (LIS)** - najdluzsza rosnaca podsekwencja (nie musi byc ciagla):\n\nDefinicja dp[i]: dlugosc LIS konczacego sie na indeksie i.\nPrzejscie: dp[i] = max(dp[j] + 1) dla wszystkich j < i gdzie nums[j] < nums[i].\nBaza: dp[i] = 1 (kazdy element sam jest LIS dlugosci 1).\nWynik: max(dp[])\n\n```\nfunction lengthOfLIS(nums) {\n  const dp = new Array(nums.length).fill(1);\n  let maxLen = 1;\n  for (let i = 1; i < nums.length; i++) {\n    for (let j = 0; j < i; j++) {\n      if (nums[j] < nums[i]) {\n        dp[i] = Math.max(dp[i], dp[j] + 1);\n      }\n    }\n    maxLen = Math.max(maxLen, dp[i]);\n  }\n  return maxLen;\n}\n// O(n^2) time, O(n) space\n// Mozna zoptymalizowac do O(n log n) uzywajac Binary Search (patience sorting)\n```'
            },
            {
              blockType: 'callout',
              variant: 'info',
              title: 'Rozroznienie: Subsequence vs Substring',
              content: 'Subsequence (podsekwencja): znaki nie musza byc sasiadujace, zachowana kolejnosc. "ace" jest subsequence "abcde". Substring (podstring): znaki musza byc ciaglem blokiem. "bcd" jest substring "abcde", "ace" juz nie. LCS = Longest Common Subsequence. LCSS = Longest Common SubString (inne przejscie DP!). W problemach DP to kluczowe rozroznienie - zmienia formule przejscia.'
            },
            {
              blockType: 'callout',
              variant: 'tip',
              title: 'Jak wizualizowac 2D DP na rozmowie?',
              content: 'Narysuj tabele dp[i][j] na brudnopisie i wypelnij recznie dla malego przykladu. Widoczne wzorce w tabeli natychmiast ujawniaja formule przejscia. Dla LCS: przekatna = pasujace znaki, poziomo/pionowo = brak dopasowania. Dla Unique Paths: suma z gory i z lewej. Rekruter widzi ze rozumiesz problem, a nie tylko pamietasz formule. Ta wizualizacja rozroznia tych co rozumieja od tych co zapamiectali.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Jaka jest wartosc dp[2][3] w problemie Unique Paths dla siatki 3x4 (dp[i][j] = liczba sciezek do komorki i,j, indeksy od 0)?',
              tagSlugs: ['dynamic-programming', 'intermediate'],
              choices: [
                '4',
                '6',
                '10',
                '3'
              ],
              correctAnswer: '10',
              solution: 'Inicjalizacja: dp[0][j]=1 (gorny rzad), dp[i][0]=1 (lewa kolumna). Wypelniamy: dp[1][1]=dp[0][1]+dp[1][0]=1+1=2, dp[1][2]=dp[0][2]+dp[1][1]=1+2=3, dp[1][3]=dp[0][3]+dp[1][2]=1+3=4, dp[2][1]=dp[1][1]+dp[2][0]=2+1=3, dp[2][2]=dp[1][2]+dp[2][1]=3+3=6, dp[2][3]=dp[1][3]+dp[2][2]=4+6=10.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'W LCS dla stringow "CAT" i "ACT", jakie jest przejscie gdy s1[i-1] === s2[j-1]?',
              tagSlugs: ['dynamic-programming', 'lcs', 'beginner'],
              choices: [
                'dp[i][j] = max(dp[i-1][j], dp[i][j-1])',
                'dp[i][j] = dp[i-1][j-1] + 1',
                'dp[i][j] = dp[i-1][j-1]',
                'dp[i][j] = dp[i][j-1] + 1'
              ],
              correctAnswer: 'dp[i][j] = dp[i-1][j-1] + 1',
              solution: 'Gdy znaki pasuja (s1[i-1] === s2[j-1]), ten znak moze byc dolaczony do wspolnej podsekwencji. Dlugosc LCS wzrasta o 1 w stosunku do najlepszego wyniku bez tych znakow (dp[i-1][j-1]). To przejscie "po przekatnej" w tabeli DP. Gdy znaki nie pasuja, bierzemy max z pominiecia znaku s1 lub s2.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: '"ACE" jest zarwno subsequence jak i substring stringa "ABCDE".',
              tagSlugs: ['dynamic-programming', 'lcs', 'beginner'],
              correctAnswer: 'false',
              solution: '"ACE" jest subsequence "ABCDE" - zachowuje kolejnosc A(b)C(d)E. Ale "ACE" NIE jest substring "ABCDE" - substring wymaga ciaglego bloku. "BCD" jest substring. Rozroznienie subsequence vs substring zmienia formule DP: LCS (podsekwencja) ma inne przejscie niz Longest Common Substring (ciagly blok).',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Zdefiniuj dp[i] dla LIS (Longest Increasing Subsequence), napisz formule przejscia i oblicz LIS dla tablicy [10, 9, 2, 5, 3, 7, 101, 18].',
              tagSlugs: ['dynamic-programming', 'intermediate'],
              solution: 'Definicja: dp[i] = dlugosc najdluzszej rosnącej podsekwencji KONCZACEJ SIE na indeksie i. Przejscie: dp[i] = max(dp[j] + 1) dla wszystkich j < i gdzie nums[j] < nums[i]. Jezeli zadne j nie spelnia warunku, dp[i] = 1. Baza: dp[i] = 1 (kazdy element sam jest LIS). Wynik: max(dp[]). Dla [10,9,2,5,3,7,101,18]: dp[0]=1(10), dp[1]=1(9<10), dp[2]=1(2<wszystkich), dp[3]=2(2<5, dp[2]+1), dp[4]=2(2<3, dp[2]+1), dp[5]=3(2<3<7 lub 2<5<7, max=dp[3 lub 4]+1=3), dp[6]=4(dowolna<101, max+1=4), dp[7]=4(18<101, maks dp gdzie num<18, dp[5]=3+1=4). max(dp)=4. LIS: [2,3,7,101] lub [2,5,7,101] lub [2,5,7,18].',
              points: 3,
              isPublished: false
            }
          ]
        },

        // -------------------------------------------------------
        // LEKCJA 7.4
        // -------------------------------------------------------
        {
          title: 'Lekcja 7.4: Knapsack i jego warianty',
          order: 4,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: '**Knapsack Problem** (problem plecaka) to jeden z najbardziej klasycznych problemow optymalizacyjnych. Masz plecak o pojemnosci W i n przedmiotow, kazdy o wadze weights[i] i wartosci values[i]. Zmaksymalizuj wartosc przedmiotow, ktore mozesz wziac, nie przekraczajac pojemnosci. Istnieja dwa glowne warianty: **0/1 Knapsack** (kazdy przedmiot moze byc wziety co najwyzej raz) i **Unbounded Knapsack** (kazdy przedmiot mozna brac wielokrotnie). Coin Change to klasyczny Unbounded Knapsack!'
            },
            {
              blockType: 'text',
              content: '**0/1 Knapsack** - klasyczna implementacja:\n\nDefinicja dp[i][w]: maksymalna wartosc uzywajac pierwszych i przedmiotow z pojemnoscia w.\nPrzejscie:\n- Jezeli weights[i-1] > w: dp[i][w] = dp[i-1][w] (nie mozemy wziac - za ciezki)\n- Inaczej: dp[i][w] = max(dp[i-1][w], dp[i-1][w - weights[i-1]] + values[i-1])\n\n```\nfunction knapsack(weights, values, W) {\n  const n = weights.length;\n  const dp = Array.from({length: n+1}, () => new Array(W+1).fill(0));\n  for (let i = 1; i <= n; i++) {\n    for (let w = 0; w <= W; w++) {\n      if (weights[i-1] > w) {\n        dp[i][w] = dp[i-1][w]; // nie mozemy wziac\n      } else {\n        dp[i][w] = Math.max(\n          dp[i-1][w],                               // pomin\n          dp[i-1][w - weights[i-1]] + values[i-1]  // wez\n        );\n      }\n    }\n  }\n  return dp[n][W];\n}\n// O(n*W) time i space\n```'
            },
            {
              blockType: 'text',
              content: '**Subset Sum** - specjalny przypadek Knapsack: czy istnieje podzbiow tablicy sumujacy sie do target?\n\nDefinicja dp[i][s]: czy mozna uzyskac sume s uzywajac pierwszych i elementow.\nPrzejscie: dp[i][s] = dp[i-1][s] || dp[i-1][s - nums[i-1]]\n\nUproszczona wersja 1D:\n```\nfunction canPartition(nums, target) {\n  const dp = new Array(target + 1).fill(false);\n  dp[0] = true; // sume 0 zawsze mozna osiagnac (pusty zbior)\n  for (const num of nums) {\n    // Iteruj od tylu aby nie uzywac tego samego elementu dwa razy!\n    for (let s = target; s >= num; s--) {\n      dp[s] = dp[s] || dp[s - num];\n    }\n  }\n  return dp[target];\n}\n// O(n*target) time, O(target) space\n```\nKluczowy trik 0/1 Knapsack: iteruj pojemnosc od TYLU (target do 0). Gwarantuje ze kazdy przedmiot uzyty co najwyzej raz. Unbounded Knapsack: iteruj od PRZODU.'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Tabela DP dla 0/1 Knapsack z trzema przedmiotami: wagi [1,3,4], wartosci [1,4,5], pojemnosc W=6. Macierz (n+1) x (W+1) z wypelnionymi wartosciami. Wiersze: przedmioty (0-3), kolumny: pojemnosc (0-6). Zaznaczone przejscia: dla przedmiotu 2 (waga 3, wartosc 4) - "wziac" i "pomin" ze strzalkami. Ostatnia komorka dp[3][6]=9 z etykieta "maksymalna wartosc = 9".',
              align: 'center',
              width: 'lg'
            },
            {
              blockType: 'text',
              content: '**Partition Equal Subset Sum** (podziel tablice na dwa rowne podzbiory):\nTo bezposredni Subset Sum: czy istnieje podzbior sumujacy sie do sum(nums)/2?\n\nJezeli sum(nums) jest nieparzyste - niemozliwe. Jezeli parzyste - szukamy target = sum/2.\n\nTo ciezkie zadanie Medium na LeetCode (#416) i czesto pytane na rozmowach mid-level jako przyklad Subset Sum DP. Klucz: zredukuj do Subset Sum na target = total/2.'
            },
            {
              blockType: 'callout',
              variant: 'info',
              title: 'Rodzina Knapsack - mapa problemow',
              content: 'Unbounded Knapsack (kazdy element wielokrotnie): Coin Change (ile min monet), Coin Change II (ile sposobow), Rod Cutting. 0/1 Knapsack (kazdy element raz): Subset Sum, Partition Equal Subset Sum, Target Sum, Last Stone Weight II. Bounded Knapsack (kazdy element max k razy): rzadziej na rozmowach junior. Rozpoznanie rodziny Knapsack to klucz do rozwiazania - inne przejscie DP dla kazdego wariantu.'
            },
            {
              blockType: 'callout',
              variant: 'warning',
              title: 'Pseudo-polynomial: O(n * W) to nie O(n^2)!',
              content: 'Zlozonosc Knapsack to O(n * W) gdzie W to pojemnosc plecaka. To jest "pseudo-polynomial" - W moze byc bardzo duze (np. W = 10^9), wiec O(n * W) moze byc gorsze niz O(n^2) dla duzego W! Dlatego Knapsack jest NP-trudny dla duzych W. Na rozmowie jezeli rekruter zapyta o zlozonosc Knapsack, wspomnij ze to O(n * W) i ze W moze byc duze - to pokazuje glebsze rozumienie.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'W 0/1 Knapsack, dlaczego przy optymalizacji do 1D tablicy dp[] iterujemy pojemnosc od tylu (od W do 0)?',
              tagSlugs: ['dynamic-programming', 'knapsack', 'intermediate'],
              choices: [
                'Bo to szybsze algorytmicznie',
                'By nie uzywac tych samych przedmiotow wiele razy - iteracja od tylu gwarantuje ze korzystamy z wynikow "bez biezacego przedmiotu"',
                'By zainicjalizowac dp[W] jako pierwsza',
                'Kolejnosc iteracji nie ma znaczenia dla 0/1 Knapsack'
              ],
              correctAnswer: 'By nie uzywac tych samych przedmiotow wiele razy - iteracja od tylu gwarantuje ze korzystamy z wynikow "bez biezacego przedmiotu"',
              solution: 'W 0/1 Knapsack kazdy przedmiot moze byc uzyty co najwyzej raz. Przy iteracji od tylu: gdy obliczamy dp[w], dp[w - weight] nie zostal jeszcze zaktualizowany w biezacej rundzie - reprezentuje wynik bez biezacego przedmiotu. Przy iteracji od przodu: dp[w - weight] moglby byc juz zaktualizowany (= biezacy przedmiot juz wziety), co oznaczaloby uzycie go drugi raz - to Unbounded Knapsack!',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'Coin Change (minimalna liczba monet dla kwoty target) to przyklad 0/1 Knapsack.',
              tagSlugs: ['dynamic-programming', 'knapsack', 'beginner'],
              correctAnswer: 'false',
              solution: 'Falsz. Coin Change to Unbounded Knapsack - kazda moneta moze byc uzyta wielokrotnie. 0/1 Knapsack: kazdy element uzyty co najwyzej raz (np. Partition Equal Subset Sum, 0/1 wybor przedmiotow). Rozroznienie: Coin Change iteruje dp[] od przodu (pozwala na wielokrotne uzycie); 0/1 Knapsack iteruje od tylu (zapobiega wielokrotnemu uzyciu).',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'Jaka jest time complexity 0/1 Knapsack dla n przedmiotow i pojemnosci W?',
              tagSlugs: ['dynamic-programming', 'knapsack', 'big-o', 'intermediate'],
              choices: [
                'O(n^2)',
                'O(n * W)',
                'O(2^n)',
                'O(n log W)'
              ],
              correctAnswer: 'O(n * W)',
              solution: 'Knapsack wypelnia tablice dp o rozmiarze n x W (lub 1D tablica rozmiaru W iterowana n razy). Kazda komorka obliczana w O(1). Lacznie n * W komorek = O(n * W). To pseudo-polynomial - wyglada jak polynomial wzgledem n i W, ale W moze byc wykładniczo duze wzgledem liczby bitow reprezentacji, wiec Knapsack jest NP-trudny.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Wytlumacz problem "Partition Equal Subset Sum". Jak go zredukowac do klasycznego Subset Sum? Opisz algorytm DP krok po kroku.',
              tagSlugs: ['dynamic-programming', 'knapsack', 'intermediate'],
              solution: 'Problem: podziel tablice nums na dwa podzbiory o rownej sumie. Redukcja do Subset Sum: suma obu podzbiorow musi byc rowna total = sum(nums). Wiec kazdy podzbior ma sume = total/2. Jezeli total jest nieparzyste - zwroc false (niemozliwe). Jezeli parzyste - sprawdz czy istnieje podzbior sumujacy sie do target = total/2 (Subset Sum). Algorytm DP: dp[s] = true jezeli mozna uzyskac sume s uzywajac elementow nums. dp[0] = true. Dla kazdego num w nums: iteruj s od target do num (od tylu!): dp[s] = dp[s] || dp[s-num]. Zwroc dp[target]. Dlaczego od tylu: 0/1 Knapsack - kazdy element uzyty raz. Zlozonosc: O(n * target) time, O(target) space.',
              points: 2,
              isPublished: false
            }
          ]
        },

        // -------------------------------------------------------
        // LEKCJA 7.5
        // -------------------------------------------------------
        {
          title: 'Lekcja 7.5: Edit Distance i zaawansowane wzorce DP',
          order: 5,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: '**Edit Distance** (Levenshtein Distance) to minimalna liczba operacji (wstawienie, usuniecie, zamiana znaku) potrzebnych do przeksztalcenia jednego stringa w drugi. Uzywane w: sprawdzanie pisowni (spell checker), bioinformatyka (podobienstwo sekwencji DNA), wyszukiwanie "fuzzy" (Elasticsearch), auto-correct w klawiaturach. To jeden z najtrudniejszych klasycznych problemow 2D DP i czesto pytany na rozmowach mid-senior.'
            },
            {
              blockType: 'text',
              content: 'Edit Distance - definicja i przejscie:\n\nDefinicja dp[i][j]: minimalna liczba operacji do przeksztalcenia s1[0..i-1] w s2[0..j-1].\nPrzejscie:\n- Jezeli s1[i-1] === s2[j-1]: dp[i][j] = dp[i-1][j-1] (brak operacji, znaki pasuja)\n- Inaczej: dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])\n  - dp[i-1][j] + 1: USUNIECIE znaku z s1\n  - dp[i][j-1] + 1: WSTAWIENIE znaku do s1\n  - dp[i-1][j-1] + 1: ZAMIANA znaku w s1\nBaza: dp[0][j] = j (j wstawien by uzyskac s2[0..j-1] z pustego), dp[i][0] = i (i usuniec).\n\n```\nfunction minDistance(word1, word2) {\n  const m = word1.length, n = word2.length;\n  const dp = Array.from({length: m+1}, (_, i) =>\n    Array.from({length: n+1}, (_, j) => i === 0 ? j : j === 0 ? i : 0)\n  );\n  for (let i = 1; i <= m; i++) {\n    for (let j = 1; j <= n; j++) {\n      if (word1[i-1] === word2[j-1]) dp[i][j] = dp[i-1][j-1];\n      else dp[i][j] = 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);\n    }\n  }\n  return dp[m][n];\n}\n// O(m*n) time i space\n```'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Tabela Edit Distance dla "horse" i "ros". Macierz 7x4 (dlugosci+1 kazdego stringa). Gora: "" r o s. Lewa: "" h o r s e. Bazowe wartosci: dp[0][j]=j (0,1,2,3), dp[i][0]=i (0,1,2,3,4,5,6). Komorki wypelnione wartosciami z zaznaczonymi strzalkami trzech operacji: ukosna (replace/match), pozioma (insert), pionowa (delete). Wartosc finalna dp[6][3]=3 zaznaczona na zielono z etykieta "3 operacje".',
              align: 'center',
              width: 'lg'
            },
            {
              blockType: 'text',
              content: '**Palindrome Subproblems** - kilka powiazan problemow DP:\n\n**Longest Palindromic Subsequence (LPS)**: Najdluzsza podsekwencja palindromiczna. Redukcja: LPS(s) = LCS(s, reverse(s))! Mozna tez rozwiazac bezposrednio 2D DP.\n\n**Minimum Deletions to Make Palindrome**: n - LPS(s) (usun wszystkie znaki ktore nie sa w palindromowej podsekwencji).\n\n**Palindromic Substrings Count**: ile podstringow palindromicznych? DP lub "expand around center" O(n) - dla kazdego centrum (n centruw dla nieparzystych, n-1 dla parzystych) ekspanduj dopoki palindrom.'
            },
            {
              blockType: 'callout',
              variant: 'tip',
              title: 'Jak sie dowiedziec ze problem to DP?',
              content: 'Checklist: 1) Problem pyta o optimum (max/min) lub ilosc (ile sposobow)? 2) Czy brute force to drzewo rekurencji z powtorzeniami? 3) Czy "najlepsza sciezka do X" zalezy od "najlepszej sciezki do Y"? Jezeli wszystkie trzy tak - to DP. Jesli tylko jedno - rozwazt Greedy lub DFS/BFS. Jezeli nie masz pewnosci: napisz rekurencyjne rozwiazanie brute-force, narysuj drzewo rekurencji, sprawdz czy sa powtorzenia - jezeli tak, dodaj memo.'
            },
            {
              blockType: 'callout',
              variant: 'info',
              title: 'DP kontra Greedy',
              content: 'Greedy wybiera lokalnie optymalna decyzje na kazdym kroku, majac nadzieje ze prowadzi do globalnego optimum. Greedy jest szybszy (O(n) lub O(n log n)), ale nie zawsze poprawny. DP gwarantuje globalne optimum. Przyklad: Coin Change z mononami [1,5,6] i target 10. Greedy: 6+1+1+1+1 = 5 monet. DP: 5+5 = 2 monety. Greedy zawodzi! Jezeli masz watpliwosci czy Greedy jest poprawny - przetestuj na kontrprzyykladzie. Jezeli nie mozesz znalezc kontrprzykladdu po kilku probach - moze byc poprawny.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Jaka jest Edit Distance miedzy "cat" i "cut"?',
              tagSlugs: ['dynamic-programming', 'intermediate'],
              choices: [
                '0',
                '1',
                '2',
                '3'
              ],
              correctAnswer: '1',
              solution: '"cat" -> "cut": zamien "a" na "u" - 1 operacja (zamiana). dp["cat"]["cut"]: c==c (match), a!=u (replace, dp[1][1]+1=1), t==t (match, dp[2][2]=1). Edit Distance = 1.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'Jaka jest baza (dp[0][j] i dp[i][0]) w problemie Edit Distance?',
              tagSlugs: ['dynamic-programming', 'intermediate'],
              choices: [
                'dp[0][j] = 0 i dp[i][0] = 0 - pusty string nie wymaga operacji',
                'dp[0][j] = j i dp[i][0] = i - tyle wstawien/usuniec potrzeba do pustego stringa',
                'dp[0][j] = 1 i dp[i][0] = 1',
                'dp[0][j] = Infinity i dp[i][0] = Infinity'
              ],
              correctAnswer: 'dp[0][j] = j i dp[i][0] = i - tyle wstawien/usuniec potrzeba do pustego stringa',
              solution: 'Baza: przeksztalcenie pustego stringa w s2[0..j-1] wymaga j wstawien (dp[0][j] = j). Przeksztalcenie s1[0..i-1] w pusty string wymaga i usuniec (dp[i][0] = i). Te bazy sa kluczowe - bez poprawnej inicjalizacji cala tablica DP bedzie bledna.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'Longest Palindromic Subsequence (LPS) mozna rozwiazac jako LCS stringa z jego odwrocona wersja.',
              tagSlugs: ['dynamic-programming', 'lcs', 'intermediate'],
              correctAnswer: 'true',
              solution: 'Prawda. LPS(s) = LCS(s, reverse(s)). Kazda wspolna podsekwencja s i reverse(s) jest palindromem (poniewaz odpowiadajace sobie znaki z obu konc pasuja). Najdluzsza taka podsekwencja to LPS. To elegancka redukcja: zamiast implementowac osobny algorytm LPS, mozna uzyc LCS z reverse. O(n^2) time i space.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 5,
              prompt: 'Opisz trzy operacje w Edit Distance i wyjasn co kazda z nich reprezentuje w kontekscie dp[i][j]. Dlaczego baza dp[0][j] = j i dp[i][0] = i?',
              tagSlugs: ['dynamic-programming', 'advanced'],
              solution: 'Trzy operacje w przejsciu dp[i][j] = 1 + min(A, B, C): A) dp[i-1][j] + 1 = USUNIECIE. Usuwamy znak s1[i-1]. Problem sprowadza sie do przeksztalcenia s1[0..i-2] w s2[0..j-1] (dp[i-1][j]), plus 1 za usuniecie. B) dp[i][j-1] + 1 = WSTAWIENIE. Wstawiamy znak s2[j-1] do s1. Problem sprowadza sie do przeksztalcenia s1[0..i-1] w s2[0..j-2] (dp[i][j-1]), plus 1 za wstawienie. C) dp[i-1][j-1] + 1 = ZAMIANA. Zamieniamy s1[i-1] na s2[j-1]. Problem sprowadza sie do dp[i-1][j-1], plus 1 za zamiane (lub 0 gdy znaki sa takie same). Baza dp[0][j]=j: przeksztalcenie pustego stringa "" w s2[0..j-1] wymaga wstawienia j znakow. Baza dp[i][0]=i: przeksztalcenie s1[0..i-1] w "" wymaga usuniecia i znakow.',
              points: 3,
              isPublished: false
            }
          ]
        }
      ]
    },

    // =========================================================
    // MODUL 8: Wzorce Rekrutacyjne i Strategia Rozmowy
    // =========================================================
    {
      title: 'Modul 8: Wzorce Rekrutacyjne - Backtracking, Greedy i Strategia Interview',
      order: 8,
      isPublished: false,

      lessons: [

        // -------------------------------------------------------
        // LEKCJA 8.1
        // -------------------------------------------------------
        {
          title: 'Lekcja 8.1: Backtracking - wyczerpujace przeszukiwanie z cofaniem',
          order: 1,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: '**Backtracking** to algorytmiczny paradygmat budowania rozwiazania krok po kroku, cofajac sie gdy biezaca sciezka nie prowadzi do rozwiazania. Jest to wyczerpujace przeszukiwanie przestrzeni rozwiazn z inteligentnym przycinaniem (pruning) nieperspektywicznych galezi. Backtracking jest niezbedny gdy problem wymaga: znalezienia WSZYSTKICH rozwiazан (permutacje, kombinacje, podzbiory), znalezienia JEDNEGO rozwiazania (N-Queens, sudoku), lub sprawdzenia CZY ISTNIEJE rozwiazanie.'
            },
            {
              blockType: 'text',
              content: 'Szablon Backtracking - naucz sie na pamiec:\n```\nfunction backtrack(state, choices, result) {\n  // Warunek konca - mamy kompletne rozwiazanie\n  if (isComplete(state)) {\n    result.push([...state]); // kopia stanu!\n    return;\n  }\n\n  for (const choice of choices) {\n    // Pruning - sprawdz czy wybor jest poprawny\n    if (!isValid(state, choice)) continue;\n\n    // Dodaj wybor do stanu\n    state.push(choice);\n\n    // Rekurencja - idz glebiej\n    backtrack(state, nextChoices(choice), result);\n\n    // COFNIJ - usun wybor (backtrack!)\n    state.pop();\n  }\n}\n```\nKluczowy krok: **cofniecie (undo)** po rekurencji. Stan musi byc przywrocony do tego co byl przed wyborem, by nastepna iteracja miala czysty stan.'
            },
            {
              blockType: 'text',
              content: 'Trzy klasyczne kategorie Backtracking:\n\n**1) Permutacje**: Wszystkie uklady n elementow.\n```\nfunction permute(nums) {\n  const result = [];\n  const used = new Array(nums.length).fill(false);\n  function bt(current) {\n    if (current.length === nums.length) { result.push([...current]); return; }\n    for (let i = 0; i < nums.length; i++) {\n      if (used[i]) continue;\n      used[i] = true;\n      current.push(nums[i]);\n      bt(current);\n      current.pop();\n      used[i] = false;\n    }\n  }\n  bt([]);\n  return result;\n}\n```\nZlozonosc: O(n! * n) - n! permutacji, kazda dlugosc n.\n\n**2) Kombinacje**: Podzbiory rozmiaru k.\n**3) Podzbiory**: Wszystkie mozliwe podzbiory (Power Set).'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Drzewo rekurencji Backtracking dla permutacji [1,2,3]. Korzen: []. Pierwszy poziom: wybieramy 1, 2 lub 3. Dla galezi z "1": drugi poziom wybieramy 2 lub 3. Dla [1,2]: wybieramy 3 -> wynik [1,2,3]. Dla [1,3]: wybieramy 2 -> wynik [1,3,2]. Strzalki "backtrack" pokazujace cofanie po osiagnieciu liscia. Czerwone "X" przy galezi juz uzytego elementu (pruning). Wszystkie 6 permutacji jako liscie.',
              align: 'center',
              width: 'lg'
            },
            {
              blockType: 'text',
              content: '**N-Queens Problem**: Umieszcz N krolowych na szachownicy N x N tak by zadna nie atakowala innej. Klasyczny problem backtracking.\n\nKluczowe pruning: kolumna zajeta (cols Set), przekatna / (row-col = const), przekatna \\ (row+col = const).\n```\nfunction solveNQueens(n) {\n  const result = [];\n  const cols = new Set(), diag1 = new Set(), diag2 = new Set();\n  const board = Array.from({length: n}, () => new Array(n).fill("."));\n  function bt(row) {\n    if (row === n) { result.push(board.map(r => r.join(""))); return; }\n    for (let col = 0; col < n; col++) {\n      if (cols.has(col) || diag1.has(row-col) || diag2.has(row+col)) continue;\n      cols.add(col); diag1.add(row-col); diag2.add(row+col);\n      board[row][col] = "Q";\n      bt(row + 1);\n      board[row][col] = ".";\n      cols.delete(col); diag1.delete(row-col); diag2.delete(row+col);\n    }\n  }\n  bt(0);\n  return result;\n}\n```'
            },
            {
              blockType: 'callout',
              variant: 'tip',
              title: 'Pruning - serce efektywnego Backtrackingu',
              content: 'Bez przycinania (pruning) Backtracking to brute force z O(n!). Dobre pruning moze zmniejszyc przestrzen poszukiwan drastycznie. Zawsze pytaj: "Czy moge z tej galezi otrzymac poprawne rozwiazanie?". Jezeli nie - nie idz glebiej. W N-Queens: natychmiastowe sprawdzenie kolumny i przekatnych eliminuje 90%+ galezi. W Sudoku: constraint propagation eliminuje wiekszosci galezi przed rekurencja.'
            },
            {
              blockType: 'callout',
              variant: 'warning',
              title: 'Czesta pulapka: zapomnienie o kopii stanu',
              content: 'Gdy dodajesz rozwiazanie do wynikow: result.push([...current]) NIE result.push(current). Jezeli dodasz referencje do current, wszystkie wyniki beda pokazywac ten sam (pusty na koncu) stan. Ta pulapka jest wyjatkowo czesta i trudna do debugowania. Zawsze [...spread] lub .slice() dla tablic, lub nowy string - nigdy referencja do mutowalnej struktury.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Jaka jest time complexity generowania wszystkich permutacji tablicy n elementow (bez duplikatow)?',
              tagSlugs: ['backtracking', 'big-o', 'intermediate'],
              choices: [
                'O(n^2)',
                'O(2^n)',
                'O(n! * n)',
                'O(n log n)'
              ],
              correctAnswer: 'O(n! * n)',
              solution: 'Jest n! permutacji n elementow (n * (n-1) * (n-2) * ... * 1). Kazda permutacja ma dlugosc n, wiec skopiowanie jej do wyniku kosztuje O(n). Lacznie: O(n! * n). Drzewo rekurencji backtrackingu ma O(n!) lisci i calkowita liczbe wezlow O(n * n!) ale dominuje n! * n dla kopiowania wynikow.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'W backtrackingu krok "cofniecia" (undo) musi byc wykonany PO rekurencyjnym wywolaniu, aby przywrocic stan sprzed wyboru.',
              tagSlugs: ['backtracking', 'beginner'],
              correctAnswer: 'true',
              solution: 'Prawda. Wzorzec backtrackingu to: (1) Dodaj wybor do stanu. (2) Wywolaj rekurencje. (3) Cofnij wybor. Jezeli cofniecie jest przed rekurencja - stan jest przywrocony zanim rekurencja go uzyje. Jezeli brak cofniecia - stan akumuluje wszystkie poprzednie wybory i kolejne iteracje beda mialy niepoprawny punkt startowy.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'W N-Queens, ktore z ponizszych NIE jest poprawnym warunkiem pruning (przeszkodzenia) dla krolowej w wierszu "row" i kolumnie "col"?',
              tagSlugs: ['backtracking', 'intermediate'],
              choices: [
                'Kolumna col jest juz zajeta przez inna krolowa',
                'Przekatna / - wartosc (row - col) jest juz zajeta',
                'Przekatna \\ - wartosc (row + col) jest juz zajeta',
                'Wiersz row jest juz zajeta (sprawdzamy po jednej krolowej na wiersz)'
              ],
              correctAnswer: 'Wiersz row jest juz zajeta (sprawdzamy po jednej krolowej na wiersz)',
              solution: 'W implementacji N-Queens rekurencja przesuwa sie wiersz po wierszu (bt(row+1)). Dokladnie jedna krolowa na wiersz jest gwarantowana przez strukture rekurencji - nie musimy osobno sprawdzac czy wiersz jest zajety. Sprawdzamy tylko: kolumne (pionowe ataki), przekatna / (row-col) i przekatna \\ (row+col). To oszczedza jeden warunek i jest poprawne.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Opisz roznice miedzy generowaniem Permutacji, Kombinacji i Podzbiorow uzywajac Backtracking. Jakie sa kluczowe roznice w implementacji kazdego z nich?',
              tagSlugs: ['backtracking', 'intermediate'],
              solution: 'Permutacje: wszystkie uklady n elementow (kolejnosc ma znaczenie). n! wynikow. Implementacja: uzywaj tablicy "used[]" aby nie powtarzac elementow w jednej permutacji. Dla kazdej pozycji mozna uzyc dowolny nieuzywany element. Kombinacje rozmiaru k: podzbiory k elementow (kolejnosc bez znaczenia). C(n,k) wynikow. Implementacja: parametr "start" - dla kazdej pozycji zaczynaj od start, nie od 0. Eliminuje duplikaty kolejnosci: [1,2] != [2,1] tylko raz. Podzbiory (Power Set): wszystkie mozliwe podzbiory (0..n elementow). 2^n wynikow. Implementacja: brak warunku stopu opartego na dlugosci - ZAWSZE dodaj biezacy stan do wynikow (lacznie z pustym). Parametr "start" jak w kombinacjach. Glowne roznice: Permutacje - "used[]", brak parametru start. Kombinacje - parametr "start", warunek stopu dlugosc==k. Podzbiory - parametr "start", brak warunku stopu (dodaj zawsze).',
              points: 2,
              isPublished: false
            }
          ]
        },

        // -------------------------------------------------------
        // LEKCJA 8.2
        // -------------------------------------------------------
        {
          title: 'Lekcja 8.2: Greedy Algorithms - lokalna optymalizacja',
          order: 2,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: '**Greedy Algorithm** (algorytm zachlanny) to podejscie w ktorym na kazdym kroku wybieramy lokalnie optymalna decyzje, bez cofania sie i bez rozpatrywania przyszlosci. Zakladamy ze lokalne optimum prowadzi do globalnego optimum. Greedy jest zazwyczaj O(n log n) lub O(n) - znacznie szybszy od DP czy Backtracking. Ale uwaga: Greedy NIE zawsze daje poprawne rozwiazanie - wymaga matematycznego dowodu "Greedy Choice Property".'
            },
            {
              blockType: 'text',
              content: 'Klasyczne problemy Greedy:\n\n**Activity Selection** (wybor maksymalnej liczby nie-nakladadajacych sie wydarzen): Posortuj po czasie zakonczenia. Zawsze wybieraj nastepne wydarzenie ktore konczy sie najwczesniej i nie koliduje z ostatnio wybranym. Dowod: wybranie tego co konczy sie najwczesniej "pozostawia najwiecej miejsca" dla przyszlych wydarzen.\n\n**Jump Game** (czy mozna dojsc do konca tablicy?): Sledzpoz max_reach - najdalszy indeks osiagalny z biezacej pozycji. Dla kazdej pozycji i: max_reach = max(max_reach, i + nums[i]). Jezeli max_reach >= n-1 - TAK.\n\n**Fractional Knapsack** (mozna brac ulamki przedmiotow): Posortuj po stosunku wartosc/waga. Bierz przedmioty w malejacym stosunku az zapelnisz plecak.'
            },
            {
              blockType: 'text',
              content: '**Interval Problems** - klucz do wielu Greedy:\n\n**Merge Intervals**: Posortuj po czasie poczatku. Dla kazdego intervalu: jezeli naklada sie z ostatnim w wyniku (start <= prev.end) - scal (rozszerz end). Inaczej - dodaj nowy.\n\n**Non-overlapping Intervals** (minimalna liczba do usuniecia): Posortuj po czasie zakonczenia. Zlicz ile można ZACHOWAC (Activity Selection). Usuniecia = total - zachowane.\n\n**Meeting Rooms II** (minimalna liczba sal): Posortuj spotkania po starcie. Uzyj Min-Heap przechowujacego koniec aktywnych spotkan. Dla kazdego spotkania: jezeli heap.min <= start, zwolnij sala (pop). Wstaw nowy koniec (push). Odpowiedz = max rozmiar heapa.'
            },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Diagram Merge Intervals. Wejscie: lista 5 intervalow narysowanych na osi czasu: [1,3], [2,6], [8,10], [15,18], [9,12]. Po posortowaniu: [1,3],[2,6],[8,10],[9,12],[15,18]. Krok po kroku scalanie: [1,3] i [2,6] zachodza -> [1,6]. [1,6] i [8,10] nie zachodza -> dodaj [8,10]. [8,10] i [9,12] zachodza -> [8,12]. [8,12] i [15,18] nie zachodza -> dodaj. Wynik: [[1,6],[8,12],[15,18]].',
              align: 'center',
              width: 'lg'
            },
            {
              blockType: 'callout',
              variant: 'warning',
              title: 'Greedy nie zawsze dziala - wymaga dowodu!',
              content: 'Klasyczny kontrprzyklad: Coin Change z monetami [1, 5, 6] i target 10. Greedy (zawsze bierz najwieksza): 6+1+1+1+1 = 5 monet. Optymalne: 5+5 = 2 monety. Greedy tu zawodzi! Mozna uzyc Greedy tylko dla specjalnych systemow monet (np. euro, dolary) gdzie mniejsze banknoty sa wielokrotnosciami wiekszych. Na rozmowie jezeli chcesz uzyc Greedy - udowodnij poprawnosc lub chociaz przetestuj na kilku kontrprzykladach.'
            },
            {
              blockType: 'callout',
              variant: 'tip',
              title: 'Kiedy Greedy, kiedy DP?',
              content: 'Greedy dziala gdy: lokalne optimum zawsze prowadzi do globalnego (Greedy Choice Property), i problem ma optimal substructure. DP potrzebujemy gdy: lokalna decyzja zalezy od przyszlosci lub gdy Greedy nie daje poprawnego wyniku. Test: sprobuj Greedy, znajdz kontrprzyklad. Brak kontrprzykladow po kilku probach = sygnal ze Greedy moze dzialac. Przyklad szybkiej analizy: Activity Selection Greedy dziala (dowod matematyczny). Coin Change Greedy nie zawsze dziala (kontrprzyklad latwy do znalezienia).'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'W problemie "Jump Game" ([2,3,1,1,4], czy mozna dojsc do konca?), jaka jest greedy strategia?',
              tagSlugs: ['greedy', 'beginner'],
              choices: [
                'Zawsze skocz maksymalnie daleko',
                'Slledz max_reach (najdalszy osiagalny indeks); jezeli biezaca pozycja <= max_reach, kontynuuj i aktualizuj max_reach',
                'Uzywaj BFS od poczatku',
                'Sprawdz rekurencyjnie wszystkie mozliwe skoki'
              ],
              correctAnswer: 'Slledz max_reach (najdalszy osiagalny indeks); jezeli biezaca pozycja <= max_reach, kontynuuj i aktualizuj max_reach',
              solution: 'Greedy: max_reach = 0. Dla kazdego i od 0 do n-1: jezeli i > max_reach - niemozliwe (return false). max_reach = max(max_reach, i + nums[i]). Jezeli max_reach >= n-1 - return true. Nie trzeba byc na max_reach - wystarczy ze jest osiagalny. O(n) time, O(1) space. Elegancja Greedy: nie rozpatrujemy wszystkich mozliwych skokow, tylko sledzimmy najdalszy zasieg.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'Algorytm Greedy zawsze daje optymalnie rozwiazanie dla problemu Knapsack (plecaka).',
              tagSlugs: ['greedy', 'intermediate'],
              correctAnswer: 'false',
              solution: 'Falsz. Greedy (wybieraj przedmioty o najwyzszym stosunku wartosc/waga) dziala optymalnie dla FRACTIONAL Knapsack (mozna brac ulamki). Dla 0/1 Knapsack (cale przedmioty) - Greedy nie gwarantuje optymalnego wyniku. Kontrprzyklad: pojemnosc W=10, przedmioty: (waga=6,wartosc=12), (waga=5,wartosc=9), (waga=5,wartosc=9). Greedy bierze pierwszy (12/6=2) i jeden z pozostalych (9/5=1.8). Ale wziacie dwoch ostatnich daje wartosc 18 > 12+9=21... (oba sie mieszcza!) Dla 0/1 Knapsack zawsze uzywaj DP.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'Jaka jest time complexity algorytmu Merge Intervals dla n intervalow?',
              tagSlugs: ['greedy', 'big-o', 'intermediate'],
              choices: [
                'O(n)',
                'O(n log n)',
                'O(n^2)',
                'O(n log n + n) = O(n log n)'
              ],
              correctAnswer: 'O(n log n)'
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Wytlumacz algorytm "Meeting Rooms II" - znajdz minimalna liczbe sal konferencyjnych potrzebnych dla listy spotkan. Opisz strategie i jej zlozonosc.',
              tagSlugs: ['greedy', 'heap', 'intermediate'],
              solution: 'Problem: dana lista spotkan [[start, end]], znajdz minimalna liczbe sal. Podejscie z Min-Heap: 1) Posortuj spotkania po czasie startu. 2) Zainicjalizuj Min-Heap przechowujacy czasy zakonczenia aktywnych spotkan. 3) Dla kazdego spotkania [start, end]: jezeli heap nie pusty i heap.min <= start - ta sala sie zwolnila przed nowym spotkaniem (pop ze stosu). Wstaw end do heapa (zajmij sale lub twarza). 4) Odpowiedz = maksymalny rozmiar heapa obserwowany w trakcie. Dlaczego Min-Heap? Zawsze sprawdzamy czy najwczesniej konczace sie spotkanie sie skonczylo. Greedy insight: jezeli jakakolwiek sala jest wolna, uzyj jej; jezeli nie - otworz nowa. Zlozonosc: O(n log n) sortowanie + O(n log n) operacje na heapie = O(n log n) time, O(n) space.',
              points: 2,
              isPublished: false
            }
          ]
        },

        // -------------------------------------------------------
        // LEKCJA 8.3
        // -------------------------------------------------------
        {
          title: 'Lekcja 8.3: Jak myslec na glos podczas interview - STAR dla kodu',
          order: 3,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Coding interview to nie tylko test umiejetnosci programowania. Rekruterzy z Google, Meta, Microsoft oceniaja ROWNIEZ: jak komunikujesz swoje myslenie, jak reagujesz na podpowiedzi, jak debugujesz, jak rozmawiasz o trade-offach. Doskonale rozwiazanie napisane w ciszy bez komunikacji moze dac gorszy wynik niz rozwiazanie czesciowe z doskonala komunikacja. To nie jest niesprawiedliwe - w pracy tez musisz komunikowac swoje decyzje.'
            },
            {
              blockType: 'text',
              content: 'Proponowany schemat podejscia do zadania (5 krokow):\n\n**Krok 1 - Upewnienie sie co do problemu (2-3 minuty)**\n- Powtorz problem swoimi slowami: "Rozumiem ze mam..."\n- Zapytaj o edge cases: "Co jezeli tablica jest pusta?", "Czy liczby moga byc ujemne?", "Czy n moze byc 0?"\n- Zapytaj o zakresy: "Jaki jest max rozmiar n?", "Czy moge zakladac ze liczby sa w zakresie int?"\n- Sprawdz oczekiwany output: "Mam zwrocic indeksy czy wartosci?"\n\n**To jest CZAS INWESTYCJI** - 2 minuty teraz oszczedza 15 minut przepisywania.'
            },
            {
              blockType: 'text',
              content: '**Krok 2 - Brute force na glos (1-2 minuty)**\nNigdy nie zacznij od optymalnego rozwiazania bez wzmianki o brute force. Dlaczego?\n\n- Pokazuje ze rozumiesz problem (mozesz go rozwiazac, choc wolno)\n- Daje punkt startowy do optymalizacji\n- Rekruter moze powiedziec "dobrze, to wystarczy" (rzadko, ale zdarza sie)\n\n"Najprostsze rozwiazanie to dwie zagniezdzone petle, co da O(n^2). Moge zrobic lepiej?"\n\nPotem przejdz do optymalizacji - wyjasniaj jak redukujesz zlozonosc.'
            },
            {
              blockType: 'text',
              content: '**Krok 3 - Optymalne podejscie (omow, zanim zaczniesz kodowac)**\nNigdy nie rzucaj sie na klawiature bez planu. Najpierw omow:\n\n- Jaka strukture danych uzywasz i dlaczego\n- Jaka jest intuicja algorytmu\n- Jaka jest przewidywana zlozonosc\n\n"Zamierzam uzyc Hash Map do sledzenia indeksow. Dla kazdego elementu sprawdzam czy (target - element) jest juz w mapie. To da O(n) time i O(n) space. Czy to dobry kierunek?"\n\n**Poczekaj na kiwniecie glowy lub feedback** zanim zaczniesz pisac kod.'
            },
            {
              blockType: 'text',
              content: '**Krok 4 - Kodowanie z narracja**\nKoduj i komentuj jednoczesnie:\n\n- "Inicjalizuje mape..."\n- "Iteruje po tablicy, dla kazdego elementu..."\n- "Tu jest warunek dla edge case pustej tablicy..."\n- "Zwracam wynik..."\n\nJezeli sie zatrzymujesz - mow na glos co mysisz: "Hmm, mam problem z indeksami. Zastanowmy sie... ach, powinnam zaczac od left=0 a nie left=1."\n\nCisza to sygnał dla rekrutera ze albo cos poszlo zle, albo nie komunikujesz.'
            },
            {
              blockType: 'text',
              content: '**Krok 5 - Testowanie**\nPo napisaniu kodu - NIE mow "done". Przetestuj:\n\n1. Testuj na przykladzie z zadania - krok po kroku, reczna symulacja\n2. Testuj edge cases: pusta tablica, jeden element, wszystkie takie same\n3. Sprawdz off-by-one: czy petla konczy sie o jedno za wczesnie/pozno?\n4. Sprawdz null/undefined: co jesli wejscie jest null?\n\nNastepnie powiedz: "Jaka jest time complexity? O(n) bo jeden przejazd. Space complexity? O(n) bo hash map. Czy chce Pan/Pani bym zoptymalizowal space?"\n\nTa ostatnia inicjatywa pokazuje inzyniersie myslenie!'
            },
            {
              blockType: 'callout',
              variant: 'tip',
              title: 'Jezyk "wskazowki" na rozmowie',
              content: 'Jezeli utknales i rekruter daje wskazowke: "Co z Hash Table?" - reaguj entuzjastycznie i tworczo, nie defensywnie. Zle: "Hmm, nie wiem jak to pomoze". Dobrze: "O, dobry pomysl! Moze uzyc mapy do O(1) lookup dla kazdego... ach tak! Moge przechowywac [X] jako klucz i [Y] jako wartosc, co eliminuje zewnetrzna petle!". Rekruterzy CHCA ci pomagac - wziec wskazowke gracefully to kompetencja, nie slabos.'
            },
            {
              blockType: 'callout',
              variant: 'info',
              title: 'Czeste pytania po rozwiazaniu',
              content: 'Rekruter moze zapytac: "Jak byss to zoptymalizowal gdyby pamiec byla ograniczona?" - znaj trade-off time vs space. "Co jezeli dane bylyby strumieniem?" - jak zmieniloby sie rozwiazanie. "Jak byss to przetestowal w produkcji?" - unit testy, edge cases, property tests. "Jak skalujesz to na miliardy danych?" - distributed systems, sharding, MapReduce. Przygotuj sie na te pytania - pokazuja ze myslisz jak inzynier, nie tylko coder.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Co powinienes zrobic ZANIM zaczniesz pisac kod na coding interview?',
              tagSlugs: ['strategia-interview', 'beginner'],
              choices: [
                'Od razu zacznij kodowac - pokaz ze jestes szybki',
                'Upewnij sie ze rozumiesz problem, omow edge cases, przedstaw brute force, zaproponuj optymalne podejscie i poczekaj na feedback',
                'Zapytaj rekrutera o rozwiazanie',
                'Napisz najpierw testy, potem implementacje (TDD)'
              ],
              correctAnswer: 'Upewnij sie ze rozumiesz problem, omow edge cases, przedstaw brute force, zaproponuj optymalne podejscie i poczekaj na feedback',
              solution: 'Proces: 1) Powtorz problem i zapytaj o edge cases (2-3 min). 2) Zaproponuj brute force z zlozonoscia. 3) Omow optymalne podejscie - strukture danych, algorytm, zlozonosc. 4) Poczekaj na OK od rekrutera. 5) Dopiero koduj z narracja. Rzucenie sie na klawiature bez planowania to jeden z najczestszych bledow - mozesz sie pogubic w polowie i zmarnowac duzo czasu.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'Jezeli na rozmowie nie wiesz jak rozwiazac problem, najlepszym wyjsciem jest milczec i probowac samemu do konca.',
              tagSlugs: ['strategia-interview', 'beginner'],
              correctAnswer: 'false',
              solution: 'Falsz. Milczenie to jeden z gorszych sygnałów na coding interview. Poprawne postepowanie: (1) Mow na glos co myslisz, nawet jezeli nie jestes pewien. (2) Zapytaj o hint jezeli utknales: "Moge poprosic o wskazowke?". (3) Opisz co wiesz: "Wiem ze muszę sledzic [X], ale nie jestem pewien jak". Rekruterzy rozumieja ze nie kazdy problem jest latwy - oceniaja komunikacje i myslenie, nie tylko poprawnosc.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'Po napisaniu rozwiazania na rozmowie, co jest nastepnym krokiem?',
              tagSlugs: ['strategia-interview', 'beginner'],
              choices: [
                'Powiedziec "done" i czekac na ocene',
                'Zapytac rekrutera czy kod jest poprawny',
                'Samodzielnie przetestowac kod na przykladzie z zadania i edge casach, a nastepnie omowic zlozonosc',
                'Przepisac kod "czysciej"'
              ],
              correctAnswer: 'Samodzielnie przetestowac kod na przykladzie z zadania i edge casach, a nastepnie omowic zlozonosc',
              solution: 'Po napisaniu kodu: (1) Recznie symuluj kod na przykladzie z zadania (krok po kroku). (2) Sprawdz edge cases: pusta tablica, jeden element, null. (3) Sprawdz off-by-one. (4) Podaj time i space complexity. (5) Zapytaj czy jest cos do optymalizacji. Mowienie "done" bez testowania to czerwona flaga - w produkcji tez nikt nie deployuje bez testow.',
              points: 1,
              isPublished: false
            }
          ]
        },

        // -------------------------------------------------------
        // LEKCJA 8.4
        // -------------------------------------------------------
        {
          title: 'Lekcja 8.4: Najczestsze bledy i jak ich unikac',
          order: 4,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Coding interviews sa trudne nie tylko dlatego ze problemy sa ciezkie, ale dlatego ze latwo popelnic bledy, ktore nie maja nic wspolnego z wiedza algorytmiczna. Ta lekcja to zbior najczestszych pulapek zebranych od setek kandydatow. Znajomosc tych bledow i swiadome ich unikanie moze znaczaco poprawic twoje wyniki - nawet bez uczenia sie nowych algorytmow.'
            },
            {
              blockType: 'text',
              content: '**Blad 1: Off-By-One Errors (przesuniecia o jeden)**\nNajczestszy bug w kodzie algorytmicznym. Sprawdz:\n- Czy petla powinna byc `i < n` czy `i <= n`?\n- Czy Binary Search ma `left <= right` czy `left < right`?\n- Czy indeks mid to `(left+right)/2` czy `left + (right-left)/2`?\n- Czy po zakonczeniu Two Pointers zwracam `slow` czy `slow+1`?\n\nZasada: Przed napisaniem petli, sprawdz recznie na n=1 i n=2. To wykrywa wiekszos OB1 przed wysylaniem kodu.'
            },
            {
              blockType: 'text',
              content: '**Blad 2: Nie sprawdzanie null/pustych wejsc**\nKazda funkcja powinna zaczac od:\n```\nif (!root) return null; // dla drzew\nif (!arr || arr.length === 0) return []; // dla tablic\nif (n <= 0) return 0; // dla liczb\n```\nRekruter ZAWSZE przetestuje edge case z pustym wejsciem. Brak sprawdzenia = runtime error = zly sygnal.\n\n**Blad 3: Modyfikowanie wejscia bez pytania**\nCzesto pytania zakladaja ze nie wolno modyfikowac oryginalnej tablicy. Zapytaj: "Czy moge modyfikowac wejsciowa tablice, czy potrzebuje kopii?" Zaoszczedza przepisywania.'
            },
            {
              blockType: 'text',
              content: '**Blad 4: Ignorowanie Integer Overflow**\nW Java/C++: int to max ~2.1 mld. Jezeli sumujesz duze liczby lub obliczasz mid = (left+right)/2 dla duzych indeksow - ryzyko overflow. Uzyj long lub: `mid = left + (right-left)/2`. W JavaScript nie ma tego problemu (Number to float64), ale warto wiedziec na heterogeniczne rozmowy.\n\n**Blad 5: Niepoprawne usuniecie z Hash Map/Set podczas iteracji**\nW JavaScript/Java: nie usuwaj z kolekcji w trakcie iteracji po niej. Uzyj tymczasowej listy do usuniecia lub iteruj po kopii.'
            },
            {
              blockType: 'text',
              content: '**Blad 6: Zakladanie ze dane sa posortowane**\nNigdy nie zakladaj bez wyraZnego potwierdzenia ze tablica jest posortowana. Jezeli Binary Search wymaga posortowania - przetestuj ze wejscie jest posortowane lub posortuj (O(n log n)). Podobnie dla Two Pointers - zaznacza to w wymaganiach.\n\n**Blad 7: Zapomnienie o powrocie wyniku z kazdej galezi**\nW rekurencji: jezeli nie zwrocisz wartosci ze wszystkich galezi, czesc wywolan zwroci `undefined`. Sprawdz ze kazda sciezka kodu ma `return`.\n\n**Blad 8: Zla inicjalizacja zmiennych**\nmax = 0 gdy mozliwe ujemne wartosci - uzyj max = -Infinity. min = Infinity zawsze bezpieczne. dp[] = Infinity dla problemow minimalizacji, 0 dla maksymalizacji (zwykle).'
            },
            {
              blockType: 'table',
              caption: 'Najczestsze bledy i sposoby zapobiegania',
              hasHeaders: true,
              headers: ['Blad', 'Objaw', 'Zapobieganie'],
              rows: [
                ['Off-By-One', 'Ostatni element pominipty lub wyjscie poza tablice', 'Testuj na n=1, n=2 przed kodem'],
                ['Null check', 'NullPointerException, Cannot read property of null', 'Zawsze sprawdz null/empty na poczatku'],
                ['Modyfikacja wejscia', 'Testy z tym samym wejsciem daja rozne wyniki', 'Zapytaj rekrutera o pozwolenie'],
                ['Integer Overflow', 'Ujemne wyniki, bledne indeksy', 'Uzyj long lub left+(right-left)/2'],
                ['Brak return', 'undefined zamiast wyniku', 'Sprawdz ze kazda sciezka ma return'],
                ['Zla inicjalizacja', 'max=0 przy ujemnych wartosciach', 'max=-Infinity, min=Infinity, dp=0 lub Inf'],
                ['Brak kopii stanu', 'Backtracking wyniki wszystkie puste/takie same', 'result.push([...state]) nie push(state)']
              ]
            },
            {
              blockType: 'callout',
              variant: 'tip',
              title: 'Technika "recznie przetestuj przed wyslaniem"',
              content: 'Zanim powiesz "gotowe", wykonaj nastepujaca liste: 1) Uruchom kod mentalnie na przykladzie z zadania - zapisz wartosci zmiennych krok po kroku. 2) Sprawdz: pusta tablica/string, jeden element, dwa elementy, wszystkie takie same, min/max wartosci. 3) Sprawdz warunki petli: czy sa <= czy <? 4) Sprawdz czy wszystkie rekurencyjne galezie maja return. Ta checklist zajmuje 2-3 minuty ale lapie wiekszos bledow przed ich wykryciem przez rekrutera.'
            },
            {
              blockType: 'callout',
              variant: 'info',
              title: 'Mentalna symulacja kodu - przyklad',
              content: 'Dla binarySearch([1,3,5,7,9], 7): left=0, right=4. Iter 1: mid=2, arr[2]=5 < 7, left=3. Iter 2: mid=3, arr[3]=7 == 7, return 3. OK! Teraz test: binarySearch([1], 1): left=0, right=0. Iter 1: mid=0, arr[0]=1==1, return 0. OK! binarySearch([1], 2): left=0, right=0. Iter 1: mid=0, arr[0]=1 < 2, left=1. Teraz left > right, petla konczy sie. return -1. OK! Trzecia testem lapiesz 90% OB1 bugów.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Masz problem szukania maksimum w tablicy. Inicjalizujesz max = 0. Jaki jest problem z ta inicjalizacja?',
              tagSlugs: ['gotchas', 'beginner'],
              choices: [
                'Brak problemu - 0 to bezpieczna wartosc poczatkowa',
                'Jezeli wszystkie elementy sa ujemne, wynik bedzie niepoprawny (max = 0 zamiast najmniej ujemnego)',
                '0 jest za duze jako poczatkowe minimum',
                'Problem dotyczy tylko floatow, nie integerow'
              ],
              correctAnswer: 'Jezeli wszystkie elementy sa ujemne, wynik bedzie niepoprawny (max = 0 zamiast najmniej ujemnego)',
              solution: 'Jezeli tablica to [-5, -3, -1], poprawne max to -1, ale max=0 da wynik 0 (bo zaden element nie jest > 0). Bezpieczna inicjalizacja: max = -Infinity (lub max = arr[0] jezeli tablica jest gwarantowanie niepusta). Podobnie min = Infinity. Rekruterzy czesto testuja na tablicach z ujemnymi wartosciami wlasnie po to, by wykryc ten blad.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'W rekurencyjnym Backtrackingu, zamiast result.push(state) powinienes pisac result.push([...state]), bo inaczej wszystkie wpisy w result beda pokazywac ten sam finalny stan state.',
              tagSlugs: ['backtracking', 'gotchas', 'beginner'],
              correctAnswer: 'true',
              solution: 'Prawda. JavaScript (i wiele innych jezykow) przechowuje tablice jako referencje. result.push(state) dodaje REFERENCJE do tej samej tablicy - gdy state sie zmieni (pop/push w rekurencji), zmieni sie tez w result. result.push([...state]) tworzy KOPIE - zamraża aktualny stan. To jeden z najczestszych i najtrudniejszych do zdebugowania bledow w Backtracking.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'Jakie edge cases powinienes zawsze sprawdzic dla problemu z Linked List?',
              tagSlugs: ['gotchas', 'linked-list', 'beginner'],
              choices: [
                'Tylko dluga liste (n > 1000)',
                'Pusta lista (head = null), lista jednoelementowa, lista dwuelementowa',
                'Tylko liste z parzystym liczba elementow',
                'Tylko liste z duplikatami'
              ],
              correctAnswer: 'Pusta lista (head = null), lista jednoelementowa, lista dwuelementowa',
              solution: 'Dla Linked List zawsze testuj: (1) head = null - pusta lista, (2) jeden element - head.next = null, (3) dwa elementy - pozwala sprawdzic logike wskaznikow bez powtorzen. Wiele algorytmow na listach ma specjalne zachowanie dla n=0, 1 i 2. Recznie przetestuj te przypadki przed powiedzeniem "gotowe". Zdegenerowane przypadki to ulubione pytania rekruterow.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Opisz 5 krokow podejscia do zadania na coding interview od przeczytania problemu do powiedzenia "gotowe". Co powinienes robic i mowic na kazdym etapie?',
              tagSlugs: ['strategia-interview', 'beginner'],
              solution: 'Krok 1 - Zrozum problem (2-3 min): Powtorz problem swoimi slowami. Zapytaj o edge cases (null, puste, ujemne, duplikaty). Zapytaj o zakresy n, wartosci. Potwierdz format wyjscia. Krok 2 - Brute force (1-2 min): Zaproponuj najprostsze rozwiazanie z jego zlozonoscia. "Moglebym uzyc dwoch petli O(n^2), ale to za wolno - szukam lepszego podejscia". Krok 3 - Optymalizacja (2-3 min): Omow strukture danych i algorytm. Podaj przewidywana zlozonosc. Poczekaj na kiwniecie glowy. Krok 4 - Kodowanie z narracją: Pisz i komentuj jednoczesnie. Jezeli sie zatrzymujesz, mow co myslisz. Pytaj o wyjasnienie jezeli cos jest nieklarowne. Krok 5 - Testowanie i analiza: Recznie symuluj na przykladzie. Sprawdz edge cases. Podaj time i space complexity. Zapytaj "Czy chciałby Pan/Pani bym cos zoptymalizowal?"',
              points: 3,
              isPublished: false
            }
          ]
        }
      ]
    }
  ]
};
