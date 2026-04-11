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
    // MODULE 5: DOCKER + KUBERNETES
    // ─────────────────────────────────────────────
    {
      title: 'Module 5: Docker i Kubernetes',
      order: 5,
      isPublished: false,

      lessons: [
        // ── LESSON 5.1 ──────────────────────────
        {
          title: 'Lesson 5.1: Docker Deep Dive - Obrazy, Kontenery, Networking i Volumes',
          order: 1,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Masz juz podstawy Dockera - wiesz ze kontenery izoluja aplikacje i sa szybsze od VM. W tej lekcji idziemy glebiej: jak dziala warstwowa architektura obrazow, jak optymalizowac Dockerfile dla produkcji, jak dziala sieciowanie kontenerow i jak zarzadzac trwalymi danymi przez volumes. To wiedza ktora rozroznia kogos kto "uzywal Dockera" od kogos kto "rozumie Dockera" - i na tym poziomie beda pytania w Relativity.'
            },
            {
              blockType: 'text',
              content: '**Warstwowa architektura obrazow Docker (Layer System)**\n\nKazda instrukcja w Dockerfile tworzy nowa, niemutowalna warstwe. Docker keszuje warstwy - jesli warstwa sie nie zmienila, jest pobierana z cache. To fundamentalne dla szybkich buildow i mniejszych obrazow.\n\n```dockerfile\n# Kazda linia = nowa warstwa\nFROM openjdk:17-slim        # Warstwa 1: bazowy obraz\nWORKDIR /app                # Warstwa 2: ustawienie katalogu\nCOPY pom.xml .              # Warstwa 3: plik POM\nRUN mvn dependency:go-offline # Warstwa 4: dependencje (keszowana!)\nCOPY src ./src              # Warstwa 5: kod zrodlowy\nRUN mvn package -DskipTests # Warstwa 6: kompilacja\nEXPOSE 8080\nCMD ["java", "-jar", "target/app.jar"]\n```\n\nKluczowa optymalizacja: **rzeczy ktore zmieniaja sie rzadko = wczesniej w Dockerfile**. Dependencje zmieniaja sie rzadziej niz kod - dlatego COPY pom.xml i mvn dependency przed COPY src. Jezeli zmienisz tylko kod, Docker uzyje cache dla warstw 1-4 i przebuduje tylko 5-6!'
            },
            {
              blockType: 'text',
              content: '**Optymalizacja Dockerfile - Multi-Stage Build**\n\nMulti-stage build pozwala na budowanie w jednym kontenerze i kopiowanie tylko artefaktow do finalnego, lekkiego obrazu. Idealny dla Java - JDK do kompilacji, JRE tylko do uruchamiania.\n\n```dockerfile\n# Stage 1: Build (duzy obraz z JDK i Maven)\nFROM maven:3.9-openjdk-17 AS builder\nWORKDIR /app\nCOPY pom.xml .\nRUN mvn dependency:go-offline        # cache dependencji\nCOPY src ./src\nRUN mvn package -DskipTests          # kompilacja\n\n# Stage 2: Runtime (maly obraz - tylko JRE!)\nFROM openjdk:17-jre-slim AS runtime  # JRE, nie JDK - duzo mniejszy!\nWORKDIR /app\nCOPY --from=builder /app/target/app.jar ./app.jar  # kopiuj tylko JAR\nEXPOSE 8080\nCMD ["java", "-jar", "app.jar"]\n\n# Rezultat: obraz produkcyjny ~200MB zamiast ~800MB!\n# Nie ma kodu zrodlowego, Mavena, kompilatorow w produkcyjnym obrazie\n```\n\nTo samo dziala dla .NET:\n```dockerfile\nFROM mcr.microsoft.com/dotnet/sdk:8.0 AS build\nWORKDIR /src\nCOPY *.csproj .\nRUN dotnet restore\nCOPY . .\nRUN dotnet publish -c Release -o /app\n\nFROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime\nWORKDIR /app\nCOPY --from=build /app .\nENTRYPOINT ["dotnet", "MyApi.dll"]\n```'
            },
            {
              blockType: 'text',
              content: '**Docker Networking - jak kontenery sie komunikuja**\n\nDocker tworzy wirtualne sieci dla kontenerow. Domyslne sieci:\n\n- **bridge** (domyslna): kontenery na tej samej sieci moga sie komunikowac przez nazwy. Kontenery sa odizolowane od hosta.\n- **host**: kontener uzywa sieci hosta bezposrednio (brak izolacji sieciowej, szybsze)\n- **none**: brak sieci - izolowany kontener\n\n```bash\n# Tworzenie sieci\ndocker network create my-app-network\n\n# Uruchamianie kontenerow w tej samej sieci\ndocker run -d --name postgres --network my-app-network \\\n  -e POSTGRES_PASSWORD=secret postgres:15\n\ndocker run -d --name my-api --network my-app-network \\\n  -e DB_HOST=postgres \\ # uzywamy NAZWY kontenera jako hostname!\n  -p 8080:8080 my-api:latest\n\n# W my-api mozesz polaczys sie z "postgres" jako hostname\n# Docker DNS rozwiaze nazwe kontenera na jego IP w sieci!\n\n# Inspekcja sieci\ndocker network inspect my-app-network\ndocker network ls\n```'
            },
            {
              blockType: 'text',
              content: '**Docker Volumes - trwale przechowywanie danych**\n\nKontenery sa efemeryczne - po usunieciu tracisz dane. Volumes pozwalaja na trwale przechowywanie danych poza kontenerem.\n\n```bash\n# Trzy typy montowania:\n\n# 1. Named Volume (preferowane!) - Docker zarzadza lokalizacja\ndocker volume create postgres-data\ndocker run -d \\\n  -v postgres-data:/var/lib/postgresql/data \\ # named volume\n  postgres:15\n\n# 2. Bind Mount - mapowanie katalogu hosta (dla development!)\ndocker run -d \\\n  -v $(pwd)/data:/var/lib/postgresql/data \\ # konkretna sciezka hosta\n  postgres:15\n# Uzywaj bind mounts w development (live reload kodu!)\n# NIE uzywaj bind mounts w produkcji (zaleznosc od hosta)\n\n# 3. tmpfs Mount - tylko w pamieci (nie zapisywane)\ndocker run -d --tmpfs /tmp my-app\n\n# Zarzadzanie volumes\ndocker volume ls\ndocker volume inspect postgres-data\ndocker volume rm postgres-data\ndocker volume prune # usun nieuzywane volumes (ostroznosc!)\n```'
            },
            {
              blockType: 'text',
              content: '**Kluczowe komendy Docker - cheatsheet**\n\n```bash\n# Obrazy\ndocker build -t my-app:1.0 .         # budowanie\ndocker build -t my-app:1.0 -f Dockerfile.prod .  # z konkretnym plikiem\ndocker images                         # lista obrazow\ndocker pull nginx:alpine              # pobierz z registry\ndocker push my-registry/my-app:1.0   # wyslij do registry\ndocker rmi my-app:1.0                 # usun obraz\ndocker image prune                    # usun nieuzywane\n\n# Kontenery\ndocker run -d -p 8080:80 --name web nginx      # uruchom w tle\ndocker run -it --rm ubuntu bash               # interaktywnie, usun po wyjsciu\ndocker ps                                     # dzialajace kontenery\ndocker ps -a                                  # wszystkie (tez zatrzymane)\ndocker stop web && docker rm web              # zatrzymaj i usun\ndocker exec -it web bash                      # wejdz do dzialajacego kontenera\ndocker logs web                               # logi kontenera\ndocker logs web -f                            # live logi (--follow)\ndocker inspect web                            # szczegolowe info\n\n# Zmienne srodowiskowe\ndocker run -e DB_HOST=localhost -e DB_PORT=5432 my-app\ndocker run --env-file .env my-app             # z pliku\n\n# Cleanup\ndocker system prune -a                        # usun WSZYSTKO nieuzywane (ostroznosc!)\n```'
            },
            {
              blockType: 'text',
              content: '[IMAGE_PLACEHOLDER: Diagram architektury Docker. Gorna czesc: Host OS -> Docker Engine -> dwa kontenery (ContainerA i ContainerB) w tej samej sieci "my-network". Strzalki komunikacji miedzy kontenerami przez nazwy DNS. Port mapping: Host:8080 -> ContainerA:80. Srodkowa czesc: Warstwy obrazu (Layer System) - 6 warstw jako poziome prostokaty, od FROM (dol) do CMD (gora), z zaznaczeniem ktore sa keszowane. Dolna czesc: Volume mounting - Named Volume poza kontenerem z strzalka do /data w kontenerze, Bind Mount z folderu hosta. Czytelne etykiety, kolorowe rozroznienie czesci.]'
            },
            {
              blockType: 'text',
              content: '**Docker Compose - wielokontenerowe aplikacje**\n\nDocker Compose definiuje i uruchamia wielokontenerowe aplikacje przez plik YAML:\n\n```yaml\n# docker-compose.yml\nversion: \'3.8\'\n\nservices:\n  api:\n    build: ./api                    # buduj z lokalnego Dockerfile\n    ports:\n      - "8080:8080"\n    environment:\n      - DB_HOST=postgres             # nazwa serwisu jako hostname!\n      - DB_PORT=5432\n      - REDIS_HOST=redis\n    depends_on:\n      - postgres\n      - redis\n    networks:\n      - app-network\n\n  postgres:\n    image: postgres:15              # gotowy obraz\n    environment:\n      POSTGRES_DB: myapp\n      POSTGRES_USER: user\n      POSTGRES_PASSWORD: secret\n    volumes:\n      - postgres-data:/var/lib/postgresql/data\n    networks:\n      - app-network\n\n  redis:\n    image: redis:7-alpine\n    networks:\n      - app-network\n\nvolumes:\n  postgres-data:                   # named volume\n\nnetworks:\n  app-network:\n    driver: bridge\n```\n\n```bash\ndocker-compose up -d              # uruchom wszystkie serwisy w tle\ndocker-compose down               # zatrzymaj i usun kontenery\ndocker-compose down -v            # takze usun volumes!\ndocker-compose logs api           # logi konkretnego serwisu\ndocker-compose ps                 # status serwisow\ndocker-compose build              # przebuduj obrazy\n```'
            },
            {
              blockType: 'callout',
              variant: 'warning',
              title: 'Sekrety i bezpieczenstwo w Docker',
              content: 'Nigdy nie umieszczaj hasel, kluczy API ani sekretow w Dockerfile lub docker-compose.yml ktore sa w repozytorium! Nawet jesli pozniej usuniesz layer - zostaje w historii obrazu. Uzyj: zmiennych srodowiskowych z pliku .env (ktory jest w .gitignore), Docker Secrets (dla Swarm), Kubernetes Secrets, lub zewnetrznych narzedzi jak Azure Key Vault / AWS Secrets Manager. To punkt ktory czesto jest sprawdzany na code review w Relativity.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Dlaczego w Dockerfile powinno sie kopiowac pliki konfiguracji zaleznosci (pom.xml, package.json) PRZED kodem zrodlowym i instalowac zaleznosci oddzielnie?',
              tagSlugs: ['docker', 'intermediate'],
              choices: [
                'To wymog Dockera - nie mozna kopiowac wszystkich plikow naraz',
                'Zaleznosci zmieniaja sie rzadziej niz kod - oddzielne warstwy pozwalaja keszowac instalacje zaleznosci i przebudowywac tylko zmieniony kod',
                'Zmniejsza rozmiar finalnego obrazu o 50%',
                'Przyspiesza dzialanie kontenera w runtime'
              ],
              correctAnswer: 'Zaleznosci zmieniaja sie rzadziej niz kod - oddzielne warstwy pozwalaja keszowac instalacje zaleznosci i przebudowywac tylko zmieniony kod',
              solution: 'Docker keszuje warstwy - jesli warstwa sie nie zmienila, jest uzywana z cache. Zaleznosci (pom.xml, package.json) zmieniaja sie duzo rzadziej niz kod zrodlowy. Kopiujac je jako osobna warstwe i instalujac zaleznosci przed kopiowaniem kodu, zapewniamy ze przy kazdej zmianie kodu Docker uzyje cache dla warstwy zaleznosci (kosztowne pobieranie/kompilacja) i przebuduje tylko warstwy z kodem. Bez tego - kazda zmiana kodu wymaga ponownej instalacji wszystkich zaleznosci.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'Jaka jest glowna roznica miedzy Named Volume a Bind Mount w Docker?',
              tagSlugs: ['docker', 'intermediate'],
              choices: [
                'Named Volume jest szybszy, Bind Mount wolniejszy',
                'Named Volume jest zarzadzany przez Docker (lepsza przenosnosc), Bind Mount mapuje konkretny katalog hosta (zalezny od systemu plikow hosta)',
                'Bind Mount jest trwaly, Named Volume znika po zatrzymaniu kontenera',
                'Named Volume dziala tylko w Docker Compose, Bind Mount w standalone kontenerach'
              ],
              correctAnswer: 'Named Volume jest zarzadzany przez Docker (lepsza przenosnosc), Bind Mount mapuje konkretny katalog hosta (zalezny od systemu plikow hosta)',
              solution: 'Named Volume - Docker sam zarzadza lokalizacja danych (zwykle /var/lib/docker/volumes/). Przenosny, dziala tak samo na kazda maszyna z Dockerem. Preferowany dla produkcji i danych baz danych. Bind Mount - mapuje konkretna sciezke z hosta do kontenera. Zalezny od struktury katalogow hosta - sciezka /home/user/data nie istnieje na innej maszynie. Idealny dla developmentu (live reload kodu, edycja plikow na hoscie widoczna w kontenerze natychmiast).',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'W Docker Compose, serwisy moga sie komunikowac uzywajac nazwy serwisu jako hostname bez dodatkowej konfiguracji DNS.',
              tagSlugs: ['docker', 'intermediate'],
              correctAnswer: 'true',
              solution: 'Prawda. Docker Compose automatycznie tworzy siec dla wszystkich serwisow i konfiguruje wbudowany DNS. Serwis "api" moze polaczys sie z "postgres" uzywajac nazwy "postgres" jako hostname - Docker DNS rozwiaze ja na IP kontenera. To dlaczego w przykladzie environment: DB_HOST=postgres dziala - nie potrzeba znac IP kontenera. Warunek: serwisy musza byc w tej samej sieci (domyslnie Docker Compose tworzy jedna siec dla wszystkich serwisow).',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Co to jest Multi-Stage Build w Docker i jakie sa jego glowne zalety? Opisz jak byloby uzyty dla aplikacji Java/Spring Boot.',
              tagSlugs: ['docker', 'intermediate'],
              solution: 'Multi-Stage Build pozwala na uzycie wielu FROM w jednym Dockerfile, gdzie kazdy stage jest osobnym srodowiskiem. Zalety: 1) Dramatycznie mniejszy obraz produkcyjny - stage budowania zawiera JDK, Maven, kod zrodlowy (~800MB), ale do finalnego obrazu kopiujemy tylko skompilowany JAR i uzywamy lekkiego JRE zamiast JDK (~200MB). 2) Bezpieczenstwo - kod zrodlowy, testy, narzedzia budowania nie trafiaja do obrazu produkcyjnego. 3) Jeden Dockerfile zamiast dwoch. Dla Spring Boot: Stage 1 (builder) - FROM maven:3.9-openjdk-17, kopiuj pom.xml i src, RUN mvn package. Stage 2 (runtime) - FROM openjdk:17-jre-slim, COPY --from=builder /app/target/app.jar, CMD java -jar app.jar. Finalny obraz zawiera tylko JRE i JAR - minimal attack surface.',
              points: 3,
              isPublished: false
            }
          ]
        },

        // ── LESSON 5.2 ──────────────────────────
        {
          title: 'Lesson 5.2: Kubernetes - Core Concepts i Architektura',
          order: 2,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Kubernetes (K8s) to platforma do orkiestracji kontenerow - automatyzuje deployment, skalowanie i zarzadzanie aplikacjami kontenerowymi. Relativity jako duza platforma chmurowa uzywa Kubernetes do zarzadzania swoimi serwisami. Nie musisz byc ekspertem K8s na internship, ale rozumienie architektury i kluczowych konceptow jest oczekiwane i pokazuje dojrzalosc inzynierska.'
            },
            {
              blockType: 'text',
              content: '**Architektura Kubernetes - Control Plane i Worker Nodes**\n\nKlaster K8s sklada sie z dwoch typow maszyn:\n\n**Control Plane (Master Node)** - "mozg" klastra:\n- **API Server** - punkt wejscia dla wszystkich operacji (kubectl komunikuje sie z nim)\n- **etcd** - rozproszony key-value store przechowujacy stan klastra\n- **Scheduler** - decyduje na ktorym node uruchomic Pod\n- **Controller Manager** - zapewnia ze stan faktyczny = stan pozadany (np. uruchamia Pody jesli za malo)\n\n**Worker Nodes** - gdzie dzialaja aplikacje:\n- **kubelet** - agent na kazdym node, komunikuje sie z API Server, uruchamia Pody\n- **kube-proxy** - zarzadza regiolami sieciowymi, implementuje Services\n- **Container Runtime** - Docker, containerd, CRI-O - uruchamia kontenery'
            },
            {
              blockType: 'text',
              content: '**Pod - najmniejsza jednostka w K8s**\n\nPod to opakownie dla jednego lub wiecej kontenerow ktore wspoldziela siec i storage. Kontenery w Pod moga sie komunikowac przez localhost.\n\n```yaml\n# pod.yaml - przyklad definicji Pod\napiVersion: v1\nkind: Pod\nmetadata:\n  name: my-api-pod\n  labels:\n    app: my-api           # etykiety - kluczowe dla selekcji!\n    version: "1.0"\nspec:\n  containers:\n  - name: api\n    image: my-registry/my-api:1.0\n    ports:\n    - containerPort: 8080\n    env:\n    - name: DB_HOST\n      value: "postgres-service"\n    resources:\n      requests:            # minimalne zasoby (scheduler uzywa do planowania)\n        memory: "256Mi"\n        cpu: "250m"       # 250 millicores = 0.25 CPU\n      limits:             # maksymalne zasoby\n        memory: "512Mi"\n        cpu: "500m"\n    livenessProbe:        # czy kontener zyje?\n      httpGet:\n        path: /health\n        port: 8080\n      initialDelaySeconds: 30\n      periodSeconds: 10\n    readinessProbe:       # czy gotowy do odbierania ruchu?\n      httpGet:\n        path: /ready\n        port: 8080\n      initialDelaySeconds: 5\n```\n\nWazne: Pody sa efemeryczne - jak umra, nie wracaja same. Do tego sluza kontrolery!'
            },
            {
              blockType: 'text',
              content: '**Deployment - deklaratywne zarzadzanie Podami**\n\nDeployment to kontroler ktory zapewnia ze zawsze dziala N kopii Poda. Jesli Pod umrze - Deployment stworzy nowy. Obsluguje rolling updates i rollbacki.\n\n```yaml\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: my-api-deployment\nspec:\n  replicas: 3             # chce 3 kopie Poda\n  selector:\n    matchLabels:\n      app: my-api         # zarzadza Podami z ta etykieta\n  strategy:\n    type: RollingUpdate\n    rollingUpdate:\n      maxSurge: 1         # max 1 dodatkowy Pod podczas update\n      maxUnavailable: 0   # 0 niedostepnych podczas update (zero-downtime!)\n  template:               # szablon Poda (to samo co spec Poda powyzej)\n    metadata:\n      labels:\n        app: my-api\n    spec:\n      containers:\n      - name: api\n        image: my-registry/my-api:1.0\n        ports:\n        - containerPort: 8080\n```\n\n```bash\n# Zastosowanie\nkubectl apply -f deployment.yaml\n\n# Rolling update - zmien wersje obrazu\nkubectl set image deployment/my-api-deployment api=my-registry/my-api:2.0\n# K8s stopniowo zastepuje stare Pody nowymi - zero downtime!\n\n# Rollback jesli cos poszlo nie tak\nkubectl rollout undo deployment/my-api-deployment\n\n# Historia rolloutow\nkubectl rollout history deployment/my-api-deployment\n```'
            },
            {
              blockType: 'text',
              content: '**Service - stabilny punkt dostepowy dla Podow**\n\nPody maja zmieniajace sie IP (efemeryczne). Service to stabilna nazwa i IP ktora zawsze wskazuje na aktywne Pody (load balancing).\n\n```yaml\napiVersion: v1\nkind: Service\nmetadata:\n  name: my-api-service\nspec:\n  selector:\n    app: my-api            # wskazuje na Pody z ta etykieta\n  ports:\n  - port: 80               # port Service\n    targetPort: 8080        # port w kontenerze\n  type: ClusterIP          # domyslny - dostepny tylko wewnatrz klastra\n```\n\nTypy Service:\n- **ClusterIP** (domyslny): wewnetrzny dostep w klastrze. Inne Pody komunikuja sie przez nazwe serwisu.\n- **NodePort**: ekspozycja na porcie kazdego Node (30000-32767). Dla dev/testing.\n- **LoadBalancer**: tworzy zewnetrzny load balancer w chmurze (AWS ELB, Azure Load Balancer). Dla produkcji.\n- **ExternalName**: mapuje Service na zewnetrzna nazwe DNS.\n\n```bash\n# Komunikacja wewnetrzna - Pod moze uzyc nazwy Service jako hostname\n# http://my-api-service:80 -> load balanced do aktywnych Podow\ncurl http://my-api-service/api/users\n```'
            },
            {
              blockType: 'text',
              content: '**ConfigMap i Secret - konfiguracja i sekrety**\n\n```yaml\n# ConfigMap - konfiguracja nie-wrazliwa\napiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: app-config\ndata:\n  DB_HOST: "postgres-service"\n  DB_PORT: "5432"\n  LOG_LEVEL: "INFO"\n  app.properties: |       # caly plik konfiguracyjny!\n    server.port=8080\n    feature.x.enabled=true\n\n---\n# Secret - wraliwe dane (base64 encoded)\napiVersion: v1\nkind: Secret\nmetadata:\n  name: app-secrets\ntype: Opaque\ndata:\n  DB_PASSWORD: c2VjcmV0MTIz  # "secret123" w base64\n  API_KEY: bXktYXBpLWtleQ==\n```\n\n```yaml\n# Uzycie w Deployment\nspec:\n  containers:\n  - name: api\n    envFrom:\n    - configMapRef:\n        name: app-config    # wszystkie klucze jako env vars\n    env:\n    - name: DB_PASSWORD\n      valueFrom:\n        secretKeyRef:\n          name: app-secrets\n          key: DB_PASSWORD  # konkretny klucz z Secret\n```'
            },
            {
              blockType: 'text',
              content: '**Namespace - izolacja zasobow w klastrze**\n\n```bash\n# Namespace to wirtualny klaster wewnatrz klastra - izolacja zasobow\nkubectl create namespace development\nkubectl create namespace production\nkubectl create namespace monitoring\n\n# Praca w konkretnym namespace\nkubectl get pods -n development\nkubectl apply -f deployment.yaml -n production\n\n# Domyslnie: kubectl operuje na namespace "default"\n\n# Kluczowe: Service z innego namespace\n# Format: <service-name>.<namespace>.svc.cluster.local\ncurl http://my-api-service.production.svc.cluster.local/api/users\n```'
            },
            {
              blockType: 'text',
              content: '[IMAGE_PLACEHOLDER: Diagram architektury Kubernetes. Gorna czesc: Control Plane z 4 komponentami (API Server, etcd, Scheduler, Controller Manager) polaczonymi strzalkami. Dolna czesc: 3 Worker Nodes, kazdy z kubelet i kube-proxy. Na kazdym Node: 2-3 Pody. Strzalki od API Server do kubelets. Po prawej: kubectl (uzytkownik) wysyla requesty do API Server. Srodek: Service z selektorem wskazujacym na Pody z label "app: my-api" z load-balancing strzalkami. Ruch zewnetrzny wchodzi przez LoadBalancer Service. Pody komunikuja sie z ConfigMap i Secret. Kolorowy, kompletny diagram K8s.]'
            },
            {
              blockType: 'callout',
              variant: 'info',
              title: 'Secrets w K8s - nie sa tak bezpieczne jak nazwa sugeruje',
              content: 'Kubernetes Secrets sa domyslnie przechowywane jako base64 (nie szyfrowanie!). Kazdy kto ma dostep do klastra i odpowiednie RBAC permissions moze je odczytac. Dla produkcji uzywaj zewnetrznych systemow: Azure Key Vault (z Azure Workload Identity), AWS Secrets Manager, HashiCorp Vault, lub External Secrets Operator. W Relativity jako platforma enterprise, na pewno uzywaja zewnetrznego zarzadzania sekretami - wspomnij swiadomosc tego na rozmowie.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Ktory komponent Kubernetes odpowiada za decydowanie, na ktorym Node uruchomic nowy Pod?',
              tagSlugs: ['kubernetes', 'intermediate'],
              choices: [
                'etcd - przechowuje stan klastra',
                'kubelet - uruchamia kontenery na Node',
                'Scheduler - wybiera odpowiedni Node na podstawie zasobow i constraints',
                'Controller Manager - zapewnia pozadany stan'
              ],
              correctAnswer: 'Scheduler - wybiera odpowiedni Node na podstawie zasobow i constraints',
              solution: 'Kubernetes Scheduler obserwuje nowo tworzone Pody bez przypisanego Node i wybiera odpowiedni Node na podstawie: dostepnych zasobow (CPU, pamiec), constraints (nodeSelector, affinity/anti-affinity), taints i tolerations, oraz innych polityk. etcd przechowuje stan. kubelet uruchamia kontenery. Controller Manager zapewnia pozadany stan (np. ze jest 3 repliki).',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'Dlaczego nie powinno sie wdrazac aplikacji produkcyjnych jako samodzielne Pody zamiast przez Deployment?',
              tagSlugs: ['kubernetes', 'intermediate'],
              choices: [
                'Pody sa duzo wolniejsze niz Deploymenty',
                'Pody sa efemeryczne - jesli umra, nie sa automatycznie restartowane. Deployment zapewnia zadana liczbe replik i obsluguje rolling updates',
                'Deployment jest tansza opcja kosztowo',
                'Pody nie moga korzystac z ConfigMap i Secret'
              ],
              correctAnswer: 'Pody sa efemeryczne - jesli umra, nie sa automatycznie restartowane. Deployment zapewnia zadana liczbe replik i obsluguje rolling updates',
              solution: 'Standalone Pod - jesli Node padnie lub Pod sie zawiesi, nic go nie zrestartuje. Deployment to kontroler ktory: utrzymuje zadana liczbe replik (replicas: 3), automatycznie restartuje Pody ktore padly, obsluguje rolling updates (zero-downtime deploy przez stopniowe zastepowanie), pozwala na rollback do poprzedniej wersji. W produkcji zawsze uzywaj Deployment (lub StatefulSet dla stanowych aplikacji).',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'Kubernetes Secret przechowuje wraliwe dane w postaci zaszyfrowanej, co gwarantuje pelne bezpieczenstwo.',
              tagSlugs: ['kubernetes', 'intermediate'],
              correctAnswer: 'false',
              solution: 'Falsz. Kubernetes Secrets domyslnie sa przechowywane w etcd jako base64 - to kodowanie, NIE szyfrowanie. Base64 mozna latwo odkodowac. Mozna skonfigurowac encryption at rest dla etcd, ale to dodatkowa konfiguracja. Dla produkcyjnych systemow enterprise (jak Relativity) zaleca sie uzywanie zewnetrznych systemow do zarzadzania sekretami: Azure Key Vault, AWS Secrets Manager, HashiCorp Vault integrowanych z K8s przez External Secrets Operator lub CSI Secret Store Driver.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Wyjasnij roznice miedzy livenessProbe a readinessProbe w Kubernetes. Dlaczego warto definiowac oba? Podaj przyklad scenariusza gdzie aplikacja jest "zywa" ale nie "gotowa".',
              tagSlugs: ['kubernetes', 'intermediate'],
              solution: 'livenessProbe sprawdza czy kontener zyje - jesli probe sie nie powiedzie, K8s restartuje kontener. Sluzy do wykrycia deadlocku lub frozen state gdzie aplikacja dziala ale nie przetwarza requestow. readinessProbe sprawdza czy kontener jest gotowy do odbierania ruchu - jesli nie, jest usuwany z load balancera Service (ruch przestaje do niego trafiach) ale kontener NIE jest restartowany. Warto definiowac oba: liveness zapobiega "zombie" kontenerom, readiness zapobiega wysylaniu ruchu do kontenera ktory nie jest jeszcze gotowy. Scenariusz: aplikacja Java startuje, JVM sie rozgrzewa, polacza z baza danych, wczytuje cache (20-30 sekund). W tym czasie kontener ZYJE (liveness OK) ale NIE JEST GOTOWY (readiness FAIL). Bez readinessProbe, K8s wyslalby ruch do nie-gotowego kontenera powodujac bledy 500. Z readinessProbe, ruch trafia do kontenera dopiero gdy zwroci 200 na /ready endpoint.',
              points: 3,
              isPublished: false
            }
          ]
        },

        // ── LESSON 5.3 ──────────────────────────
        {
          title: 'Lesson 5.3: Kubernetes w Praktyce - Skalowanie, HPA i kubectl',
          order: 3,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Wiedza teoretyczna o K8s jest wazna, ale rownie wazna jest umiejetnosc pracy z klastrem przez kubectl i rozumienie jak K8s radzi sobie ze skalowaniem i dostepnoscia. Ta lekcja pokrywa praktyczne aspekty: komendy kubectl ktore beda Ci potrzebne na co dzien, Horizontal Pod Autoscaler (HPA) dla automatycznego skalowania, i wzorce zapewniajace wysoka dostepnosc.'
            },
            {
              blockType: 'text',
              content: '**kubectl - podstawowe komendy (musisz znac!)**\n\n```bash\n# Informacje o zasobach\nkubectl get pods                          # Pody w default namespace\nkubectl get pods -n production            # Pody w konkretnym namespace\nkubectl get pods -o wide                  # z info o Node i IP\nkubectl get all                           # wszystkie zasoby\nkubectl get deployments\nkubectl get services\nkubectl get configmaps\nkubectl get nodes\n\n# Szczegoly zasobu\nkubectl describe pod my-api-pod-abc123    # szczegolowe info + Events!\nkubectl describe deployment my-api\nkubectl describe node worker-1\n\n# Logi\nkubectl logs my-api-pod-abc123            # logi Poda\nkubectl logs my-api-pod-abc123 -f         # live (follow)\nkubectl logs my-api-pod-abc123 --previous # logi poprzedniego kontenera (po restarcie!)\nkubectl logs deployment/my-api            # logi Poda z Deploymenta\n\n# Exec - wejscie do kontenera\nkubectl exec -it my-api-pod-abc123 -- bash\nkubectl exec -it my-api-pod-abc123 -- sh  # jesli bash niedostepny (alpine)\nkubectl exec my-api-pod-abc123 -- env     # wydrukuj zmienne srodowiskowe\n\n# Stosowanie i usuwanie\nkubectl apply -f deployment.yaml          # zastosuj (tworzy lub aktualizuje)\nkubectl delete -f deployment.yaml         # usun zasoby z pliku\nkubectl delete pod my-api-pod-abc123      # usun konkretny Pod (Deployment stworzy nowy!)\nkubectl delete deployment my-api          # usun Deployment (i wszystkie jego Pody)\n\n# Port forwarding - dostep lokalny do Poda (debugging!)\nkubectl port-forward pod/my-api-pod-abc123 8080:8080\nkubectl port-forward service/my-api-service 8080:80\n# Teraz mozesz curl localhost:8080/api/users\n\n# Skalowanie\nkubectl scale deployment my-api --replicas=5\nkubectl rollout status deployment/my-api   # monitoruj update\nkubectl rollout undo deployment/my-api     # rollback\n```'
            },
            {
              blockType: 'text',
              content: '**Horizontal Pod Autoscaler (HPA) - automatyczne skalowanie**\n\nHPA automatycznie zwieksza lub zmniejsza liczbe replik Poda na podstawie metryk (CPU, pamiec, custom metrics).\n\n```yaml\napiVersion: autoscaling/v2\nkind: HorizontalPodAutoscaler\nmetadata:\n  name: my-api-hpa\nspec:\n  scaleTargetRef:\n    apiVersion: apps/v1\n    kind: Deployment\n    name: my-api-deployment\n  minReplicas: 2            # minimum - wysoka dostepnosc\n  maxReplicas: 10           # maksimum - kontrola kosztow\n  metrics:\n  - type: Resource\n    resource:\n      name: cpu\n      target:\n        type: Utilization\n        averageUtilization: 70  # skaluj gdy srednie CPU > 70%\n  - type: Resource\n    resource:\n      name: memory\n      target:\n        type: Utilization\n        averageUtilization: 80  # skaluj gdy pamiec > 80%\n```\n\n```bash\n# Tworzenie HPA przez kubectl (szybko)\nkubectl autoscale deployment my-api --cpu-percent=70 --min=2 --max=10\n\n# Status\nkubectl get hpa\nkubectl describe hpa my-api-hpa\n# TARGETS: 45%/70% - aktualnie 45% CPU, cel to 70%\n# REPLICAS: 3 - aktualnie 3 repliki\n```\nWazne: aby HPA dzialalo, Pody MUSZA miec ustawione resource requests (CPU/memory). Bez requests, Metrics Server nie moze obliczyc procentu wykorzystania!'
            },
            {
              blockType: 'text',
              content: '**Rolling Updates i Zero-Downtime Deployment**\n\nRolling Update to domyslna strategia Deployment - K8s stopniowo zastepuje stare Pody nowymi:\n\n```yaml\nstrategy:\n  type: RollingUpdate\n  rollingUpdate:\n    maxSurge: 1         # max 1 dodatkowy Pod ponad "replicas" podczas update\n    maxUnavailable: 0   # 0 Podow niedostepnych podczas update\n# Wlasciwosci: zamow nowy Pod (surge), poczekaj az bedzie Ready, usun stary\n# Wynik: zawsze replicas Podow dostepnych, zero downtime!\n```\n\nInna strategia: **Recreate** - zatrzymaj wszystkie stare Pody, potem uruchom nowe. Przerwa w dzialaniu! Tylko gdy nowa wersja NIE jest kompatybilna ze stara.\n\n```bash\n# Monitorowanie rolling update\nkubectl rollout status deployment/my-api\n# Waiting for deployment "my-api" rollout to finish: 1 out of 3 new replicas have been updated...\n# Waiting for deployment "my-api" rollout to finish: 2 out of 3 new replicas have been updated...\n# deployment "my-api" successfully rolled out\n\n# Historia\nkubectl rollout history deployment/my-api\n# REVISION  CHANGE-CAUSE\n# 1         kubectl apply -f deployment.yaml\n# 2         kubectl set image deployment/my-api api=my-api:2.0\n\n# Rollback do poprzedniej wersji\nkubectl rollout undo deployment/my-api\n# Rollback do konkretnej wersji\nkubectl rollout undo deployment/my-api --to-revision=1\n```'
            },
            {
              blockType: 'text',
              content: '**Resource Quotas i Limits - wazne dla multi-tenant**\n\n```yaml\n# ResourceQuota - ogranicza zasoby w namespace\napiVersion: v1\nkind: ResourceQuota\nmetadata:\n  name: dev-quota\n  namespace: development\nspec:\n  hard:\n    requests.cpu: "4"        # max 4 CPU requests w tym namespace\n    requests.memory: 8Gi     # max 8GB memory requests\n    limits.cpu: "8"\n    limits.memory: 16Gi\n    pods: "20"               # max 20 Podow\n    services: "10"\n\n# LimitRange - domyslne limity dla Podow bez ustawionych limits\napiVersion: v1\nkind: LimitRange\nmetadata:\n  name: default-limits\n  namespace: development\nspec:\n  limits:\n  - default:\n      cpu: "500m"\n      memory: "512Mi"\n    defaultRequest:\n      cpu: "200m"\n      memory: "256Mi"\n    type: Container\n```'
            },
            {
              blockType: 'text',
              content: '**Ingress - HTTP routing do Serwisow**\n\nIngress to zasob K8s ktory zarzadza zewnetrznym dostepem HTTP/HTTPS do serwisow w klastrze - routing po sciezce lub hoscie.\n\n```yaml\napiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  name: my-ingress\n  annotations:\n    nginx.ingress.kubernetes.io/rewrite-target: /\nspec:\n  ingressClassName: nginx\n  rules:\n  - host: api.myapp.com\n    http:\n      paths:\n      - path: /api/users\n        pathType: Prefix\n        backend:\n          service:\n            name: users-service\n            port:\n              number: 80\n      - path: /api/orders\n        pathType: Prefix\n        backend:\n          service:\n            name: orders-service\n            port:\n              number: 80\n  tls:\n  - hosts:\n    - api.myapp.com\n    secretName: tls-secret    # certyfikat TLS\n```\nIngress wymaga Ingress Controller (np. NGINX Ingress Controller, Traefik). Azure oferuje Application Gateway Ingress Controller (AGIC) zintegrowany z AKS.'
            },
            {
              blockType: 'callout',
              variant: 'tip',
              title: 'Debugging Podow - krok po kroku',
              content: 'Gdy Pod nie startuje: 1) kubectl get pods - sprawdz STATUS (CrashLoopBackOff, ImagePullBackOff, Pending). 2) kubectl describe pod <name> - sekcja "Events" zawiera przyczyne. ImagePullBackOff = zly obraz lub brak dostepu do registry. Pending = brak zasobow na Node lub niespelnione constraints. 3) kubectl logs <pod> --previous - logi przed crashem. 4) kubectl exec -it <pod> -- sh - wejdz i sprawdz co sie dzieje wewnatrz. To podstawowy debug workflow ktory bedziesz uzywac codziennie.'
            },
            {
              blockType: 'table',
              caption: 'Kubernetes - kluczowe obiekty i ich przeznaczenie',
              hasHeaders: true,
              headers: ['Obiekt', 'Przeznaczenie', 'Kiedy uzywac'],
              rows: [
                ['Pod', 'Uruchomienie kontenerow', 'Rzadko bezposrednio - przez kontrolery'],
                ['Deployment', 'Bezstanowe aplikacje z replikami', 'Serwisy API, web apps'],
                ['StatefulSet', 'Stanowe aplikacje z trwalymi danymi', 'Bazy danych, kolejki w K8s'],
                ['Service', 'Stabilny dostep do Podow', 'Zawsze z Deployment'],
                ['Ingress', 'HTTP routing z zewnatrz', 'Ekspozycja serwisow na internet'],
                ['ConfigMap', 'Konfiguracja nie-wrazliwa', 'Config pliki, env vars'],
                ['Secret', 'Wrazliwe dane', 'Hasla, tokeny, certyfikaty'],
                ['HPA', 'Automatyczne skalowanie', 'Aplikacje ze zmiennym ruchem'],
                ['PersistentVolumeClaim', 'Trwaly storage', 'Bazy, logi, pliki uzytkownikow'],
                ['Namespace', 'Izolacja zasobow', 'Oddzielenie dev/staging/prod']
              ]
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Pod ma STATUS "CrashLoopBackOff". Ktore komendy kubectl najlepiej uzys do diagnozy problemu?',
              tagSlugs: ['kubernetes', 'intermediate'],
              choices: [
                'kubectl get pod <name> -o yaml > sprawdz pelna specyfikacje',
                'kubectl describe pod <name> (sprawdz Events) i kubectl logs <name> --previous (logi przed crashem)',
                'kubectl delete pod <name> i kubectl apply ponownie',
                'kubectl exec -it <name> -- bash > sprawdz procesy'
              ],
              correctAnswer: 'kubectl describe pod <name> (sprawdz Events) i kubectl logs <name> --previous (logi przed crashem)',
              solution: 'CrashLoopBackOff oznacza ze kontener startuje i crashuje w petli. Diagnoza: 1) kubectl describe pod <name> - sekcja Events pokaze przyczyne (OOMKilled = za malo pamieci, blad montowania volume, zly image). 2) kubectl logs <name> --previous - logi z poprzedniego uruchomienia przed crashem (bez --previous dostaniesz logi aktualnie uruchamianego kontenera ktory jeszcze sie nie rozpadl). exec jest bezuzyteczny gdy kontener nie startuje. Delete i apply nie rozwiazuje przyczyny.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'Horizontal Pod Autoscaler (HPA) moze dzialac poprawnie nawet jesli Pody nie maja ustawionych resource requests.',
              tagSlugs: ['kubernetes', 'intermediate'],
              correctAnswer: 'false',
              solution: 'Falsz. HPA bazujace na CPU/memory utilization wymaga resource requests w spec Poda. Metrics Server oblicza procent wykorzystania jako: (faktyczne zuzycie) / (requested). Bez requests nie ma mianownika i Metrics Server nie moze obliczyc procentu - HPA nie bedzie skalowac. To czesty blad poczatkujacych z K8s. Zawsze ustawiaj resources.requests w spec kontenera przy uzyciu HPA.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'Chcesz wdrozyc nowa wersje aplikacji bez przerwy w dzialaniu (zero downtime). Ktora strategia Kubernetes Deployment powinna byc uzyta?',
              tagSlugs: ['kubernetes', 'intermediate'],
              choices: [
                'Recreate - zatrzymaj wszystkie stare Pody, uruchom nowe',
                'RollingUpdate - stopniowo zastepuj stare Pody nowymi, utrzymujac dostepnosc',
                'BlueGreen - uruchom nowy zestaw Podow, przelacz ruch jednoczesnie',
                'Canary - wyslij 5% ruchu do nowej wersji'
              ],
              correctAnswer: 'RollingUpdate - stopniowo zastepuj stare Pody nowymi, utrzymujac dostepnosc',
              solution: 'RollingUpdate (domyslna strategia) stopniowo zastepuje stare Pody nowymi. Z maxUnavailable: 0 i maxSurge: 1, K8s najpierw tworzy nowy Pod, czeka az bedzie Ready, potem usuwa stary. Zawsze sa dostepne replicas Podow. Recreate powoduje przyw w dzialaniu. BlueGreen i Canary to wzorce deployment ktore mozna zrealizowac w K8s ale wymagaja dodatkowej konfiguracji (Ingress, service mesh) - nie sa natywna strategia Deployment.',
              points: 1,
              isPublished: false
            }
          ]
        }
      ]
    },

    // ─────────────────────────────────────────────
    // MODULE 6: AZURE FUNDAMENTALS
    // ─────────────────────────────────────────────
    {
      title: 'Module 6: Azure Fundamentals i Cloud Patterns',
      order: 6,
      isPublished: false,

      lessons: [
        // ── LESSON 6.1 ──────────────────────────
        {
          title: 'Lesson 6.1: Azure Core Services - AKS, App Service, Storage i Networking',
          order: 1,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Relativity dziala na Azure - Microsoft Azure jest ich platformą chmurową. Jako intern w firmie uzywajacy C# i .NET (Microsoft stack), Azure jest naturalnym wyborem. Nie musisz byc certyfikowanym Azure architektem, ale rozumienie kluczowych serwisow, terminologii i tego jak .NET aplikacje sa hostowane w Azure - to wiedza ktora zaimponuje rekruterom i pozwoli Ci szybko stac sie produktywnym czlonkiem zespolu.'
            },
            {
              blockType: 'text',
              content: '**Azure Kubernetes Service (AKS) - zarzadzany K8s**\n\nAKS to Kubernetes as a Service - Microsoft zarzadza Control Plane (API Server, etcd, Scheduler), Ty zarzadzasz Worker Nodes i aplikacjami. Relativity prawie na pewno uzywa AKS do wdrazania swoich mikroserwisow.\n\n```bash\n# Tworzenie klastra AKS przez Azure CLI\naz group create --name my-resource-group --location eastus\n\naz aks create \\\n  --resource-group my-resource-group \\\n  --name my-aks-cluster \\\n  --node-count 3 \\\n  --enable-addons monitoring \\\n  --generate-ssh-keys \\\n  --node-vm-size Standard_D2s_v3\n\n# Polaczenie kubectl z AKS\naz aks get-credentials --resource-group my-resource-group --name my-aks-cluster\nkubectl get nodes  # teraz kubectl operuje na AKS!\n\n# Skalowanie node pool\naz aks scale --resource-group my-resource-group --name my-aks-cluster --node-count 5\n\n# AKS integruje sie z:\n# - Azure Container Registry (ACR) - prywatny registry obrazow Docker\n# - Azure Active Directory (AAD) - autentykacja uzytkownikow\n# - Azure Key Vault - sekrety\n# - Azure Monitor - logi i metryki\n# - Azure Load Balancer - zewnetrzny ruch\n```'
            },
            {
              blockType: 'text',
              content: '**Azure App Service - PaaS dla aplikacji webowych**\n\nApp Service to Platform as a Service - wdrazasz kod lub kontener, Azure zarzadza infrastruktura (serwery, OS, skalowanie, load balancing). Prostszy niz AKS dla pojedynczych aplikacji.\n\n```bash\n# Tworzenie App Service Plan (pricing tier)\naz appservice plan create \\\n  --name my-app-plan \\\n  --resource-group my-rg \\\n  --sku B2 \\\n  --is-linux\n\n# Tworzenie Web App dla .NET\naz webapp create \\\n  --resource-group my-rg \\\n  --plan my-app-plan \\\n  --name my-dotnet-api \\\n  --runtime "DOTNETCORE:8.0"\n\n# Deploy kodu przez Git lub ZIP\naz webapp deployment source config-zip \\\n  --resource-group my-rg \\\n  --name my-dotnet-api \\\n  --src app.zip\n\n# Ustawienie zmiennych srodowiskowych (Application Settings)\naz webapp config appsettings set \\\n  --resource-group my-rg \\\n  --name my-dotnet-api \\\n  --settings DB_CONNECTION_STRING="Server=..." LOG_LEVEL="Info"\n\n# Scaling: Auto Scale dla App Service\naz monitor autoscale create \\\n  --resource-group my-rg \\\n  --resource my-app-plan \\\n  --min-count 2 --max-count 10 --count 2\n```\n\nKiedy App Service zamiast AKS: prosta aplikacja webowa lub API, szybki start, brak potrzeby mikroserwisow i orchestracji. Kiedy AKS: wiele mikroserwisow, potrzeba zaawansowanej orchestracji, pelna kontrola nad infrastruktura.'
            },
            {
              blockType: 'text',
              content: '**Azure Storage - typy przechowywania danych**\n\nAzure Storage to umbrella service dla kilku typow storage:\n\n```\nAzure Storage Account\n├── Blob Storage       - pliki, dokumenty, obrazy, backupy (S3 equivalent)\n│   ├── Block Blobs    - pliki do 190.7 TB (np. dokumenty, filmy)\n│   ├── Append Blobs   - log files (tylko dopisywanie)\n│   └── Page Blobs     - dyski VM (VHD files)\n├── File Storage       - udostepnione udzialy plikow (SMB/NFS)\n├── Queue Storage      - kolejki wiadomosci (Azure Queue Storage)\n└── Table Storage      - NoSQL key-value store (legacy)\n```\n\n```csharp\n// Uzycie Azure Blob Storage w .NET\nusing Azure.Storage.Blobs;\n\nBlobServiceClient blobServiceClient = new BlobServiceClient(connectionString);\nBlobContainerClient containerClient = blobServiceClient.GetBlobContainerClient("documents");\n\n// Upload pliku (np. dokument prawniczy w Relativity!)\nBlobClient blobClient = containerClient.GetBlobClient("contract_2024.pdf");\nawait blobClient.UploadAsync(fileStream, overwrite: true);\n\n// Download\nBlobDownloadInfo download = await blobClient.DownloadAsync();\nusing FileStream file = File.OpenWrite("local_contract.pdf");\nawait download.Content.CopyToAsync(file);\n\n// Generate SAS (Shared Access Signature) URL - tymczasowy dostep\nBlobSasBuilder sasBuilder = new BlobSasBuilder {\n    BlobContainerName = "documents",\n    BlobName = "contract_2024.pdf",\n    Resource = "b",\n    ExpiresOn = DateTimeOffset.UtcNow.AddHours(1) // wazny przez 1 godzine\n};\nsasBuilder.SetPermissions(BlobSasPermissions.Read);\nUri sasUri = blobClient.GenerateSasUri(sasBuilder);\n```\nRelativity jako platforma do analizy dokumentow prawniczych na pewno intensywnie uzywa Azure Blob Storage do przechowywania dokumentow.'
            },
            {
              blockType: 'text',
              content: '**Azure SQL Database - zarzadzany SQL Server w chmurze**\n\nAzure SQL Database to SQL Server jako usluga chmurowa - brak zarzadzania serwerem, automatyczne backupy, High Availability, skalowanie.\n\n```csharp\n// Polaczenie z Azure SQL w .NET - identyczne jak lokalny SQL Server!\n// Connection string z Azure Portal\nstring connectionString = "Server=myserver.database.windows.net;\n    Database=mydb;User=admin;Password=secret;\n    Encrypt=True;TrustServerCertificate=False\";\n\n// Uzycie z Entity Framework Core\nbuilder.Services.AddDbContext<AppDbContext>(options =>\n    options.UseSqlServer(connectionString));\n\n// Lub bezposrednio\nusing SqlConnection conn = new SqlConnection(connectionString);\nawait conn.OpenAsync();\n// ... standardowe T-SQL zapytania\n```\n\nKluczowe warstwy cenowe: Basic (5 DTU - dev/test), Standard (10-3000 DTU), Premium (125-4000 DTU, In-Memory OLTP), Hyperscale (do 100 TB!), Business Critical (Always On, read replicas).\n\nAlternatywa: Azure SQL Managed Instance - pelna kompatybilnosc z SQL Server (SQL Agent, CLR, linked servers), ale zarzadzana infrastruktura. Dla migracji z on-premises SQL Server.'
            },
            {
              blockType: 'text',
              content: '**Azure Virtual Network (VNet) - sieciowanie**\n\n```\nAzure Networking - kluczowe koncepty:\n\nVirtual Network (VNet)\n├── Subnets - podzial sieci (np. frontend-subnet, backend-subnet, db-subnet)\n├── Network Security Groups (NSG) - reguly firewall (inbound/outbound)\n├── Azure Firewall - zaawansowany firewall\n└── VNet Peering - laczenie VNetow\n\nPrivate Endpoints - dostep do serwisow Azure przez prywatne IP\n├── Azure SQL przez Private Endpoint - SQL widoczny w VNet, nie z internetu\n└── Azure Blob przez Private Endpoint - Storage niedostepny z internetu\n\nAzure Load Balancer / Application Gateway\n├── Load Balancer (Layer 4) - TCP/UDP load balancing\n└── Application Gateway (Layer 7) - HTTP routing, WAF, SSL termination\n   (jak Ingress w K8s ale na poziomie Azure)\n```\n\nBest practice: aplikacje w prywatnych subnetach, bazy danych za Private Endpoints, ruch przychodzacy przez Application Gateway lub Load Balancer. Publiczne IP tylko dla frontendow.'
            },
            {
              blockType: 'text',
              content: '[IMAGE_PLACEHOLDER: Diagram architektury Azure dla typowej .NET aplikacji. Na gorze: Internet -> Azure Application Gateway (z WAF) -> AKS Cluster. Wewnatrz AKS: Deployment z 3 Podami (my-api). Pody lacza sie przez Private Endpoints z: Azure SQL Database i Azure Blob Storage. Osobny Service Bus dla kolejek. Azure Key Vault dla sekretow. Azure Container Registry (ACR) jako zrodlo obrazow Docker dla AKS. Azure Monitor zbiera logi i metryki ze wszystkiego. Wszystko w jednym VNet z podziałem na subnety. Profesjonalny diagram architektury Azure w stylu Azure Architecture Center.]'
            },
            {
              blockType: 'table',
              caption: 'Azure Core Services - odpowiedniki AWS i opis',
              hasHeaders: true,
              headers: ['Azure Service', 'AWS Odpowiednik', 'Opis', 'Kiedy uzywac'],
              rows: [
                ['AKS', 'EKS', 'Zarzadzany Kubernetes', 'Mikroserwisy, orchestracja kontenerow'],
                ['App Service', 'Elastic Beanstalk', 'PaaS dla web apps', 'Proste API, webapps bez K8s'],
                ['Azure Blob Storage', 'S3', 'Object storage', 'Pliki, dokumenty, backupy'],
                ['Azure SQL Database', 'RDS SQL Server', 'Zarzadzany SQL Server', 'Relacyjne dane'],
                ['Azure Cosmos DB', 'DynamoDB', 'NoSQL multi-model', 'Globalne, skalowalne NoSQL'],
                ['Azure Service Bus', 'SQS/SNS', 'Kolejki i tematy', 'Async komunikacja miedzy serwisami'],
                ['Azure Key Vault', 'AWS Secrets Manager', 'Sekrety i certyfikaty', 'Hasla, klucze, certyfikaty'],
                ['Azure Active Directory', 'AWS IAM', 'Tozsamosc i dostep', 'Autentykacja i autoryzacja'],
                ['Azure Monitor', 'CloudWatch', 'Logi, metryki, alerty', 'Observability platformy'],
                ['Azure DevOps / GitHub Actions', 'CodePipeline', 'CI/CD', 'Automatyzacja deploymentow']
              ]
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Masz aplikacje ASP.NET Core ktora chcesz wdrozyc na Azure. Aplikacja ma jeden serwis i proste wymagania. Ktore rozwiazanie jest najprostsze i najszybsze?',
              tagSlugs: ['azure', 'cloud', 'intermediate'],
              choices: [
                'Azure AKS - bo Kubernetes to standard dla .NET',
                'Azure App Service - PaaS, wdrazasz kod bez zarzadzania infrastruktura',
                'Azure Virtual Machines - pelna kontrola nad srodowiskiem',
                'Azure Functions - serverless dla ASP.NET Core'
              ],
              correctAnswer: 'Azure App Service - PaaS, wdrazasz kod bez zarzadzania infrastruktura',
              solution: 'Azure App Service to PaaS (Platform as a Service) - wdrazasz kod lub kontener, Azure zarzadza serwerami, OS, load balancingiem i skalowaniem. Dla prostej aplikacji to najszybsze i najlatwiejsze rozwiazanie. AKS jest potrzebny dla wielu mikroserwisow i zaawansowanej orchestracji. VM to IaaS - zarzadzasz wszystkim samodzielnie. Azure Functions to serverless dla funkcji wyzwalanych zdarzeniami, nie dla pelnych aplikacji webowych.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'Azure Blob Storage mozna uzywac do przechowywania obrazow Docker zamiast Azure Container Registry.',
              tagSlugs: ['azure', 'docker', 'intermediate'],
              correctAnswer: 'false',
              solution: 'Falsz. Azure Blob Storage to object storage dla plikow (dokumenty, obrazy, backupy) ale nie obsluguje protokolu Docker Registry (OCI Distribution Spec). Do przechowywania i dystrybucji obrazow Docker w Azure sluzy Azure Container Registry (ACR) - prywatny registry kontenerow zintegrowany z AKS, App Service i innymi serwisami Azure. ACR obsluguje Docker pull/push, geo-replikacje i security scanning.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'Dlaczego uzywamy Private Endpoints dla Azure SQL Database zamiast publicznego dosteppu przez internet?',
              tagSlugs: ['azure', 'cloud', 'intermediate'],
              choices: [
                'Private Endpoints sa szybsze bo omijaja publiczny internet',
                'Private Endpoints to jedyna opcja - Azure SQL nie ma publicznego IP',
                'Private Endpoints daja baza danych prywatne IP w VNet - ruch do SQL nie wychodzi na publiczny internet, zmniejszajac attack surface',
                'Private Endpoints sa wymagane przez prawo dla danych finansowych'
              ],
              correctAnswer: 'Private Endpoints daja baza danych prywatne IP w VNet - ruch do SQL nie wychodzi na publiczny internet, zmniejszajac attack surface',
              solution: 'Private Endpoint tworzy prywatny interfejs sieciowy dla serwisu Azure (np. SQL Database) w Twoim VNecie. Ruch miedzy aplikacja a baza danych nie wychodzi przez publiczny internet - zostaje w sieci Microsoft. Zmniejsza to attack surface (SQL nie jest osiagalny z internetu), eliminuje ryzyko przechwycenia danych (MitM), i pozwala uzywac Network Security Groups do kontroli dostepu. To security best practice dla wszelkich baz danych i storage w Azure.',
              points: 1,
              isPublished: false
            }
          ]
        },

        // ── LESSON 6.2 ──────────────────────────
        {
          title: 'Lesson 6.2: Cloud Patterns - Skalowanie, Resilience i Distributed Systems',
          order: 2,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Relativity jest platforma klasy enterprise obslugujaca duze kancelarie prawne i korporacje z milionami dokumentow. Zbudowanie takiego systemu wymaga znajomosci wzorcow architektonicznych dla skalowalnych, odpornych i rozproszonych systemow. Ta lekcja omawia kluczowe cloud patterns - wiedze ktora rozroznia developera backend od cloud engineer i ktora moze pojawic sie jako pytania "design-level" na technical interview.'
            },
            {
              blockType: 'text',
              content: '**Circuit Breaker Pattern - odpornosc na awarie**\n\nCircuit Breaker chroni system przed kaskadowymi awariami. Gdy zewnetrzny serwis zwraca bledy, Circuit Breaker "otwiera" i zatrzymuje kolejne proby (dajac serwisowi czas na recovery), zwracajac fallback zamiast czekac na timeout.\n\n```csharp\n// Implementacja z Polly (popularna biblioteka .NET dla resilience)\nusing Polly;\nusing Polly.CircuitBreaker;\n\nvar circuitBreaker = Policy<HttpResponseMessage>\n    .Handle<HttpRequestException>()\n    .OrResult(r => !r.IsSuccessStatusCode)\n    .CircuitBreakerAsync(\n        handledEventsAllowedBeforeBreaking: 5,  // po 5 bledach -> otwieramy\n        durationOfBreak: TimeSpan.FromSeconds(30) // otwarty przez 30s\n    );\n\n// Stany Circuit Breaker:\n// CLOSED (normalny) -> OPEN (po N bledach) -> HALF-OPEN (probuje po czasie) -> CLOSED lub OPEN\n\n// Retry Pattern (z Polly)\nvar retryPolicy = Policy\n    .Handle<HttpRequestException>()\n    .WaitAndRetryAsync(\n        retryCount: 3,\n        sleepDurationProvider: attempt => TimeSpan.FromSeconds(Math.Pow(2, attempt)),\n        // Exponential backoff: 2s, 4s, 8s\n        onRetry: (exception, timeSpan, attempt, context) => {\n            logger.LogWarning($"Retry {attempt} after {timeSpan}: {exception.Message}");\n        }\n    );\n\n// Laczone polityki (Wrap)\nvar policy = Policy.WrapAsync(circuitBreaker, retryPolicy);\nvar response = await policy.ExecuteAsync(() => httpClient.GetAsync(url));\n```'
            },
            {
              blockType: 'text',
              content: '**Message Queue Pattern - asynchroniczna komunikacja**\n\nZamiast synchronicznego wywolania HTTP (OrderService -> EmailService), uzyj kolejki wiadomosci. Producent publikuje wiadomosc, konsument przetwarza asynchronicznie. Decoupling!\n\n```csharp\n// Azure Service Bus - kolejki i tematy (Publisher/Subscriber)\nusing Azure.Messaging.ServiceBus;\n\n// PRODUCENT - OrderService\nServiceBusClient client = new ServiceBusClient(connectionString);\nServiceBusSender sender = client.CreateSender("order-completed\");\n\nvar message = new ServiceBusMessage(JsonSerializer.Serialize(new {\n    OrderId = order.Id,\n    CustomerId = order.CustomerId,\n    Total = order.Total\n}));\nawait sender.SendMessageAsync(message);\n// OrderService konczy - nie czeka na EmailService!\n\n// KONSUMENT - EmailService (osobny serwis!)\nServiceBusProcessor processor = client.CreateProcessor("order-completed\");\nprocessor.ProcessMessageAsync += async args => {\n    var orderData = JsonSerializer.Deserialize<OrderCompletedEvent>(args.Message.Body);\n    await emailService.SendConfirmationAsync(orderData);\n    await args.CompleteMessageAsync(args.Message); // potwierdz przetworzenie\n};\nawait processor.StartProcessingAsync();\n```\n\nZalety: decoupling (serwisy niezalezne), buforowanie (Email slow nie blokuje Order), retry automatyczny (Service Bus ponawia jesli brak ACK), skalowanie niezalezne.'
            },
            {
              blockType: 'text',
              content: '**CQRS i Event Sourcing - zaawansowane wzorce**\n\n**CQRS** (Command Query Responsibility Segregation) - oddziela operacje zapisu (Commands) od odczytu (Queries). Oddzielne modele i ewentualnie oddzielne bazy dla reads i writes.\n\n```csharp\n// Command (zmiana stanu)\npublic record CreateOrderCommand(int CustomerId, List<OrderItem> Items);\npublic class CreateOrderHandler : ICommandHandler<CreateOrderCommand> {\n    public async Task Handle(CreateOrderCommand cmd) {\n        var order = new Order(cmd.CustomerId, cmd.Items);\n        await orderRepository.SaveAsync(order); // zapis do write DB\n        await eventBus.PublishAsync(new OrderCreatedEvent(order)); // event\n    }\n}\n\n// Query (odczyt - moze byc z innej bazy, np. read replica lub Elasticsearch)\npublic record GetOrdersByCustomerQuery(int CustomerId);\npublic class GetOrdersHandler : IQueryHandler<GetOrdersByCustomerQuery, List<OrderDto>> {\n    public async Task<List<OrderDto>> Handle(GetOrdersByCustomerQuery query) {\n        return await readDb.Orders\n            .Where(o => o.CustomerId == query.CustomerId)\n            .Select(o => new OrderDto(o.Id, o.Total, o.Status))\n            .ToListAsync(); // zoptymalizowany read model\n    }\n}\n```\n\n**Event Sourcing** - zamiast przechowywac aktualny stan, przechowujesz sekwencje zdarzen. Stan = replay wszystkich eventow. Pelna historia zmian! Uzywane w systemach finansowych, prawniczych (Relativity moze uzywac podobnego podejscia dla audit trail dokumentow).'
            },
            {
              blockType: 'text',
              content: '**Horizontal vs Vertical Scaling**\n\n**Vertical Scaling (Scale Up)** - dodajesz zasoby do istniejacego serwera (wiecej CPU, RAM). Proste, ale ma limity i jest drogi przy duzej skali. Single point of failure.\n\n**Horizontal Scaling (Scale Out)** - dodajesz wiecej instancji (wiecej serwerow/kontenerow). Teoretycznie bez limitu, lepsze dla High Availability. Wymaga aplikacji bezstanowej (stateless).\n\n```\nVertical:   [Server: 8 CPU, 32GB] -> [Server: 32 CPU, 128GB]\n            Prosto, ale drogo i ma limity\n\nHorizontal: [Server: 4 CPU] x3 -> [Server: 4 CPU] x10\n            Skaluj do potrzeb, tanie, HA\n            Wymaga: Load Balancer, Session Sharing (Redis), Stateless apps\n```\n\n**Stateless application** - kluczowy wymog dla horizontal scaling. Sesja uzytkownika nie moze byc przechowywana lokalnie na instancji - bo nastepny request moze trafic do innej instancji!\n\n```csharp\n// ZLE - sesja lokalna (nie skaluje poziomo!)\nHttpContext.Session.SetString("UserId", userId); // local memory\n\n// DOBRZE - zewnetrzny session store\nbuilder.Services.AddStackExchangeRedisCache(options =>\n    options.Configuration = redisConnectionString); // Redis jako shared session store\n// Wszystkie instancje api czytaja sesje z tego samego Redis!\n```'
            },
            {
              blockType: 'text',
              content: '**Health Checks, Observability i 12-Factor App**\n\n```csharp\n// Health Checks w ASP.NET Core\nbuilder.Services.AddHealthChecks()\n    .AddSqlServer(connectionString, name: "database")\n    .AddRedis(redisConnection, name: "cache")\n    .AddUrlGroup(new Uri("https://external-api.com/health"), name: "external-api\");\n\napp.MapHealthChecks("/health\", new HealthCheckOptions {\n    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse\n});\napp.MapHealthChecks(\"/ready\"); // osobny endpoint dla readinessProbe K8s\n\n// Metryki - Application Insights (Azure native APM)\nbuilder.Services.AddApplicationInsightsTelemetry();\n// Automatycznie zbiera: request rate, duration, failures, dependencies\n\n// Structured logging z Serilog\nLog.Logger = new LoggerConfiguration()\n    .WriteTo.Console()\n    .WriteTo.ApplicationInsights(telemetryConfiguration, TelemetryConverter.Traces)\n    .Enrich.FromLogContext()\n    .CreateLogger();\n\n// Structured log (JSON, nie plain text)\nlogger.LogInformation("Order {OrderId} created by {UserId} total {Total}\",\n    order.Id, user.Id, order.Total);\n// Pozwala na query: "znajdz wszystkie zamowienia UserId=123 powyzej 1000"\n```'
            },
            {
              blockType: 'text',
              content: '**CAP Theorem - teoria dla distributed systems**\n\nCAP Theorem mowi ze rozproszony system moze zagwarantowac co najwyzej DWA z trzech wlasciwosci:\n\n- **C - Consistency**: kazdy odczyt zwraca najnowszy zapis lub blad\n- **A - Availability**: kazde zadanie otrzymuje odpowiedz (moze nie byc najnowsza)\n- **P - Partition Tolerance**: system dziala mimo utraty polaczenia miedzy nodami\n\nW praktyce P jest wymagane (sieci sa zawodne), wiec wybierasz miedzy C a A:\n- **CP systemy** (Consistency + Partition): MongoDB (w default config), HBase, ZooKeeper. Przy partycji - zwraca blad zamiast nieaktualnych danych. Uzywaj dla: transakcji finansowych, bankowych.\n- **AP systemy** (Availability + Partition): Cassandra, CouchDB, DynamoDB (eventually consistent). Przy partycji - zwraca moze nieaktualne dane. Uzywaj dla: social media, rekomendacje, logi.\n\nRelativity jako platforma prawnicza - dane musza byc spojne (C wazniejsze), wiec SQL Server (CP).'
            },
            {
              blockType: 'callout',
              variant: 'tip',
              title: 'Na rozmowie: Jak mowic o projektowaniu systemow',
              content: 'Gdy dostaniesz pytanie "Jak zaprojektowalbys system X?" - uzywaj struktury: 1) Wymagania (functional: co robi, non-functional: skala, latencja, dostepnosc). 2) Szacowanie skali (ile uzytkownikow, ile requestow/s, ile danych). 3) High-level architektura (klient, load balancer, serwisy, bazy). 4) Szczegoly kluczowych komponentow. 5) Mozliwe usprawnienia. Wzmianka o: Circuit Breaker, HPA, stateless design, message queues, observability - to plusy pokazujace cloud-native thinking.'
            },
            {
              blockType: 'table',
              caption: 'Cloud Patterns - krotkie podsumowanie',
              hasHeaders: true,
              headers: ['Pattern', 'Problem', 'Rozwiazanie', 'Przyklad w Azure'],
              rows: [
                ['Circuit Breaker', 'Kaskadowe awarie zewnetrznych serwisow', 'Zatrzymaj proby po N bledach', 'Polly + Azure Service Bus'],
                ['Retry z Backoff', 'Przejsciowe bledy sieciowe', 'Ponow z wyklotniczym opoznieniem', 'Polly WaitAndRetry'],
                ['Message Queue', 'Synchroniczne sprzezenie serwisow', 'Asynchroniczna komunikacja', 'Azure Service Bus'],
                ['CQRS', 'Rozne wymagania reads/writes', 'Oddzielne modele i serwisy', 'Mediator + EF Core'],
                ['Sidecar', 'Cross-cutting concerns (logi, proxy)', 'Dodatkowy kontener obok glownego', 'Envoy sidecar w K8s'],
                ['Stateless App', 'Trudne skalowanie z lokalnym stanem', 'Przenies stan do zewnetrznego store', 'Redis Cache w Azure'],
                ['Health Check', 'Niewidoczne awarie aplikacji', 'Endpoint /health i /ready', 'K8s probes + App Insights']
              ]
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Twoj serwis wywoluje zewnetrzne API ktore sporadycznie przestaje odpowiadac przez kilka minut. Bez zadnego wzorca, co sie stanie z Twoim serwisem?',
              tagSlugs: ['azure', 'cloud', 'distributed-systems', 'intermediate'],
              choices: [
                'Nic - HTTP automatycznie powtarza zapytania',
                'Watki beda blokowane czekajac na timeout, wyczerpujac pule polaczen i prowadzac do kaskadowej awarii calego serwisu',
                'Load balancer automatycznie przekieruje ruch do innego endpointu',
                'Docker automatycznie zrestartuje kontener'
              ],
              correctAnswer: 'Watki beda blokowane czekajac na timeout, wyczerpujac pule polaczen i prowadzac do kaskadowej awarii calego serwisu',
              solution: 'Bez Circuit Breaker: klient wysyla request -> czeka na timeout (np. 30 sekund) -> ponawia. Jesli wiele requestow przychodzi jednoczesnie, wiele watkow jest zablokowanych czekajac na timeout zewnetrznego API. Pula watkow i polaczen sie wyczerpuje. Nowe requesty nie moga byc obsluzone. Twoj serwis pada - choc sam nie jest uszkodzony. To kaskadowa awaria. Circuit Breaker rozwiazuje to: po N bledach "otwiera" i natychmiast zwraca fallback zamiast czekac na timeout.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'Horizontal Scaling (dodawanie instancji) dziala poprawnie nawet gdy aplikacja przechowuje stan sesji uzytkownika w pamieci lokalnej instancji.',
              tagSlugs: ['azure', 'cloud', 'intermediate'],
              correctAnswer: 'false',
              solution: 'Falsz. Aplikacja przechowujaca stan w lokalnej pamieci jest "stateful" - stan jest powiazany z konkretna instancja. Przy horizontal scaling, kolejny request uzytkownika moze trafic do innej instancji (load balancer round-robin), ktora nie ma jego sesji -> uzytkownik zostaje wylogowany lub traci dane. Rozwiazanie: przechowuj stan w zewnetrznym, wspoldzielonym storze (Redis, database). Wszystkie instancje api czytaja i zapisuja sesje w tym samym miejscu. To "stateless" design - wymagany dla poprawnego horizontal scaling.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'CAP Theorem mowi ze rozproszony system moze zagwarantowac co najwyzej dwie z trzech wlasciwosci. Ktore sa to wlasciwosci?',
              tagSlugs: ['cloud', 'distributed-systems', 'intermediate'],
              choices: [
                'Consistency, Availability, Performance',
                'Consistency, Availability, Partition Tolerance',
                'Concurrency, Atomicity, Persistence',
                'Caching, Autoscaling, Persistence'
              ],
              correctAnswer: 'Consistency, Availability, Partition Tolerance',
              solution: 'CAP: Consistency (kazdy odczyt zwraca najnowszy zapis lub blad), Availability (kazde zadanie dostaje odpowiedz, niekoniecznie najnowsza), Partition Tolerance (system dziala mimo utraty polaczen miedzy nodami). Partition Tolerance jest wymagana w praktyce (sieci zawodne) wiec realny wybor to CP (Consistency + Partition - zwraca blad zamiast nieaktualnych danych, np. SQL Server) lub AP (Availability + Partition - zwraca moze stare dane, np. Cassandra, DynamoDB). SQL Server w Azure (uzywany przez Relativity) to CP.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Zaprojektuj na wysokim poziomie system powiadomien email dla platformy Relativity: gdy prawnik dodaje komentarz do dokumentu, wszyscy wspolpracownicy ze sprawy dostaja powiadomienie email. System ma obsluzyc 10 000 komentarzy dziennie i gwarantowac dostarczenie emaila. Jakie wzorce i Azure serwisy uzylbys?',
              tagSlugs: ['azure', 'cloud', 'distributed-systems', 'microservices', 'intermediate'],
              solution: 'Architektura: 1) DocumentService (istniejacy) - gdy komentarz zostaje dodany, publikuje zdarzenie CommentAddedEvent do Azure Service Bus Topic (nie Queue - bo wielu konsumentow moze subskrybowac). 2) NotificationService - subskrybuje CommentAddedEvent, pobiera liste osob do powiadomienia (sprawdza dostep do sprawy w DocumentService lub lokalnej bazie), tworzy EmailNotification i publikuje do EmailQueue w Service Bus. Decoupling - NotificationService nie wie o emailach. 3) EmailService - subskrybuje EmailQueue, wyysyla email przez Azure Communication Services lub SendGrid. Service Bus gwarantuje dostarczenie (dead-letter queue dla bledow, retry automatyczny). Skalowanie: EmailService skaluje sie horizontalnie (HPA w K8s) gdy kolejka rosnie. Odpornosc: Circuit Breaker w EmailService dla Azure Communication Services. Dead-letter queue - nieudane emaile sa przechowywane do ponownego przetworzenia lub recznej analizy. 10k komentarzy dziennie = ~7/minute - prosta skala, nawet 1 instancja EmailService wystarczy.',
              points: 3,
              isPublished: false
            }
          ]
        },

        // ── LESSON 6.3 ──────────────────────────
        {
          title: 'Lesson 6.3: Azure w Kontekscie Relativity - CI/CD, DevOps i Agile',
          order: 3,
          isPublished: false,

          theoryBlocks: [
            {
              blockType: 'text',
              content: 'Relativity wspomina w opisie stanowiska: Azure, Docker, Kubernetes, Visual Studio, JIRA, GitHub, i SCRUM. Ta lekcja laczy wszystkie poprzednie elementy w kontekscie jak wyglada codziennosc developera w takiej firmie - od kodu przez CI/CD az do wdrozenia. Rozumienie pelnego cyklu jest tym co rozroznia praktyka od teoretyka.'
            },
            {
              blockType: 'text',
              content: '**CI/CD Pipeline - od kodu do produkcji**\n\nCI (Continuous Integration) - automatycznie buduj i testuj kod przy kazdym commicie.\nCD (Continuous Deployment/Delivery) - automatycznie wdrazaj przetestowany kod.\n\n```yaml\n# .github/workflows/deploy.yml - GitHub Actions pipeline\nname: Build and Deploy to AKS\n\non:\n  push:\n    branches: [ main ]  # trigger na push do main\n\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n    - uses: actions/checkout@v3\n\n    - name: Setup .NET\n      uses: actions/setup-dotnet@v3\n      with:\n        dotnet-version: 8.0\n\n    - name: Restore dependencies\n      run: dotnet restore\n\n    - name: Build\n      run: dotnet build --no-restore\n\n    - name: Run Tests\n      run: dotnet test --no-build --verbosity normal\n\n  build-and-push:\n    needs: test  # tylko jesli testy przeszly!\n    runs-on: ubuntu-latest\n    steps:\n    - uses: actions/checkout@v3\n\n    - name: Login to Azure Container Registry\n      uses: docker/login-action@v2\n      with:\n        registry: myregistry.azurecr.io\n        username: ${{ secrets.ACR_USERNAME }}\n        password: ${{ secrets.ACR_PASSWORD }}\n\n    - name: Build and Push Docker Image\n      run: |\n        docker build -t myregistry.azurecr.io/my-api:${{ github.sha }} .\n        docker push myregistry.azurecr.io/my-api:${{ github.sha }}\n\n  deploy:\n    needs: build-and-push\n    runs-on: ubuntu-latest\n    steps:\n    - name: Set AKS Context\n      uses: azure/aks-set-context@v3\n      with:\n        resource-group: my-rg\n        cluster-name: my-aks\n\n    - name: Deploy to AKS\n      run: |\n        kubectl set image deployment/my-api \\\n          api=myregistry.azurecr.io/my-api:${{ github.sha }}\n        kubectl rollout status deployment/my-api\n```'
            },
            {
              blockType: 'text',
              content: '**Azure DevOps vs GitHub Actions**\n\nOba narzedzia do CI/CD, Relativity uzywa obu (wspomniany GitHub w opisie stanowiska):\n\n```\nAzure DevOps:\n├── Azure Repos - Git repozytoria (alternatywa GitHub)\n├── Azure Pipelines - CI/CD (YAML lub klasyczne)\n├── Azure Boards - zarzadzanie zadaniami (alternatywa JIRA)\n├── Azure Artifacts - paczki NuGet/npm\n└── Azure Test Plans - zarzadzanie testami\n\nGitHub Actions:\n├── Workflows (.github/workflows/)\n├── Triggers: push, PR, schedule, manual\n├── Jobs i Steps\n├── Marketplace: tysiace gotowych Actions\n└── Integracja z Azure (azure/login, azure/aks-set-context etc.)\n\nNa rozmowie: wspomnij ze masz doswiadczenie z GitHub Actions\n(EventFlow projekt - CI/CD przez GitHub Actions z Dockerem)\n```'
            },
            {
              blockType: 'text',
              content: '**SCRUM i Agile - co musisz wiedziec**\n\nRelativity pracuje w SCRUM - to wymienione wprost w opisie stanowiska. Podstawowe elementy:\n\n```\nSCRUM Team:\n├── Product Owner (PO) - priorytety backlogu, reprezentuje biznes\n├── Scrum Master - facilitator, usuwa przeszkody, pilnuje procesu\n└── Development Team - self-organizing, cross-functional (Ty!)\n\nSCRUM Events (Ceremonies):\n├── Sprint Planning - planowanie co robimy w tym sprincie (zwykle 2 tygodnie)\n├── Daily Standup (Daily Scrum) - co robiem, co bede robil, blokery (max 15 min!)\n├── Sprint Review - demo dla stakeholderow co zrobiony\n└── Sprint Retrospective - co poszlo dobrze/zle, jak poprawic proces\n\nSCRUM Artifacts:\n├── Product Backlog - lista wszystkich User Stories (PO zarzadza)\n├── Sprint Backlog - zadania na ten sprint (Team zarzadza)\n└── Increment - dzialajace oprogramowanie po sprincie\n\nUser Story: "Jako [rola], chce [dzialanie], aby [wartosc biznesowa]"\nDefinition of Done: kryteria kiedy zadanie jest "skonzone"\nStory Points: wzgledna estymacja zlozonosci (Fibonacci: 1,2,3,5,8,13)\n```'
            },
            {
              blockType: 'text',
              content: '**Git Workflow - jak pracowac w zespole**\n\n```bash\n# Feature Branch Workflow (standard w Relativity)\ngit checkout main\ngit pull origin main            # aktualizuj main\ngit checkout -b feature/REL-123-add-user-export  # nowy branch z JIRA ticket ID\n\n# Praca...\ngit add .\ngit commit -m "feat(users): add CSV export endpoint\n\nImplemented GET /api/users/export endpoint that returns\nfiltered users as CSV file. Closes REL-123.\"\n# Conventional Commits: feat, fix, docs, style, refactor, test, chore\n\ngit push origin feature/REL-123-add-user-export\n# Pull Request na GitHub -> Code Review -> CI/CD -> Merge do main\n\n# Po merge:\ngit checkout main\ngit pull origin main\ngit branch -d feature/REL-123-add-user-export  # usun lokalny branch\n\n# Interaktywny rebase (czysc historique przed PR)\ngit rebase -i HEAD~3  # edytuj ostatnie 3 commity (squash, reword)\n\n# Przydatne w codziennej pracy\ngit stash                     # zapisz zmiany tymczasowo\ngit stash pop                 # przywroc zmiany\ngit cherry-pick abc123        # kopiuj konkretny commit z innego brancha\ngit log --oneline --graph     # wizualizacja historii\n```'
            },
            {
              blockType: 'text',
              content: '**Code Review Best Practices - jak robic i odbierac**\n\nCode Review to kluczowy element pracy w Relativity. Jako intern bedziesz zarowno reviewowac kod innych (tak!) i dostawac review od seniorow.\n\n**Jako autor PR:**\n- Maleanr PR-y (max 400 linii) - latwe do przejrzenia\n- Opis co i dlaczego (nie tylko jak)\n- Linki do JIRA ticket i dokumentacji\n- Self-review przed wysylaniem\n- Brak TODO w mergowanym kodzie\n\n**Co sprawdzac w Review:**\n- Poprawnosc logiki biznesowej\n- Obsluga bledow i edge cases\n- Bezpieczenstwo (SQL injection, auth, sekrety w kodzie)\n- Performance (N+1 query, brak indeksow, nieefektywne petle)\n- Testowalnosc (czy logika jest mockowalna?)\n- Czytelnosc i nazewnictwo\n- SOLID naruszenia\n\n**Jak dawac feedback:**\n- "Suggest" zamiast "Demand" dla niefunkcjonalnych uwag\n- Wytlumacz DLACZEGO, nie tylko co zmienic\n- Zadawaj pytania: "Czy rozwazylas uzycie X zamiast Y?"\n- Chwali dobry kod! Nie tylko krytykuj.'
            },
            {
              blockType: 'callout',
              variant: 'info',
              title: 'Twoje projekty jako atut - EventFlow i WorkshopHub',
              content: 'Masz na CV EventFlow (Java, Spring Boot, microservices, Docker, RabbitMQ) i WorkshopHub (ASP.NET Core, React, SQL Server). To bezposrednio odpowiada wymaganiom Relativity! Na rozmowie aktywnie nawiazuj do tych projektow: "W EventFlow implementowalam wzorzec API Gateway i asynchroniczna komunikacje przez RabbitMQ - to podobne do Azure Service Bus pattern ktory omawiacie". Twoje projekty to konkrety - uzywaj ich jako dowodow kompetencji, nie tylko wymieniai na CV.'
            },
            {
              blockType: 'text',
              content: '[VIDEO_PLACEHOLDER: "GitHub Actions CI/CD Pipeline for Docker and Kubernetes" by TechWorld with Nana (YouTube, 25 min). Topics covered: tworzenie workflow YAML, build Docker image, push do registry, deploy do K8s. Recommended timestamp: 00:00-25:00. Link: https://www.youtube.com/watch?v=R8_veQiYBjI Why helpful: Nana to najlepsza nauczycielka DevOps na YouTube - jasne, praktyczne tlumaczenie kompletnego CI/CD pipeline identycznego z tym co uzywa Relativity. Quality notes: Doskonala jakosc, profesjonalny level, duzo praktycznych przykladow.]'
            },
            {
              blockType: 'table',
              caption: 'Cykl pracy developera w Relativity (typowy sprint)',
              hasHeaders: true,
              headers: ['Etap', 'Aktywnosc', 'Narzedzia'],
              rows: [
                ['Planowanie', 'Sprint Planning, estymacja Story Points', 'JIRA, SCRUM'],
                ['Development', 'Feature branch, TDD, local Docker', 'IntelliJ/Visual Studio, Docker, Git'],
                ['Code Review', 'Pull Request, feedback, poprawki', 'GitHub, ESLint/Sonar'],
                ['CI', 'Automatyczne testy, build, analiza kodu', 'GitHub Actions, Azure DevOps'],
                ['CD', 'Push do registry, deploy na staging', 'ACR, AKS, GitHub Actions'],
                ['Testing', 'QA na staging, testy integracyjne', 'Azure App Service, Postman'],
                ['Release', 'Deploy na produkcje, monitoring', 'AKS rolling update, Azure Monitor'],
                ['Retrospective', 'Co poprawic w procesie', 'JIRA, SCRUM retro board']
              ]
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'W SCRUM, kto jest odpowiedzialny za priorytyzowanie Product Backlogu?',
              tagSlugs: ['interview-prep', 'intermediate'],
              choices: [
                'Scrum Master - zarzadza procesem i backlogiem',
                'Caly Development Team - wspolnie decyduja o priorytetach',
                'Product Owner - reprezentuje potrzeby biznesu i klientow',
                'Stakeholderzy - klienci decyduja o kolejnosci'
              ],
              correctAnswer: 'Product Owner - reprezentuje potrzeby biznesu i klientow',
              solution: 'Product Owner (PO) jest odpowiedzialny za Product Backlog - jego tworzenie, utrzymanie i priorytyzowanie. PO reprezentuje interesy biznesu i klientow w zespole. PO decyduje CO bedzie budowane (nie JAK). Scrum Master facilituje proces i usuwa przeszkody, ale nie decyduje o priorytetach. Development Team decyduje o tym jak zrealizowac zadania i ile moga wziesc na sprint. Stakeholderzy moga wplywac przez PO, ale nie zarzadzaja backlogiem bezposrednio.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'W CI/CD pipeline, deployment do produkcji powinien byc uruchamiany reczenie przez programiste po kazdym commicie.',
              tagSlugs: ['azure', 'interview-prep', 'intermediate'],
              correctAnswer: 'false',
              solution: 'Falsz. Celem CI/CD jest automatyzacja. Continuous Integration - automatycznie buduje i testuje przy kazdym commicie. Continuous Deployment/Delivery - automatycznie wdraza przetestowany kod (CD). Reczny deployment jest antywzorcem - wolny, podatny na bledy ludzkie, niepowtarzalny. Dobry pipeline: commit -> testy -> build obrazu -> deploy na staging (automatyczny) -> ewentualnie reczne zatwierdzenie (gate) przed produkcja -> deploy na prod (automatyczny po zatwierdzeniu). W pelnym CD nawet gate jest zautomatyzowany (canary release, smoke tests).',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'Jakie informacje powinien zawierac dobry komunikat commita git (commit message)?',
              tagSlugs: ['interview-prep', 'best-practices', 'intermediate'],
              choices: [
                'Tylko numer JIRA ticketu: "REL-123"',
                'Krótki opis co zmienilam: "fix bug"',
                'Typ zmiany i opis w trybie rozkazujacym z opcjonalnym ciałem wyjasniajacym DLACZEGO: "feat(auth): add JWT token refresh endpoint"',
                'Pelny diff zmienionego kodu w tekscie commita'
              ],
              correctAnswer: 'Typ zmiany i opis w trybie rozkazujacym z opcjonalnym ciałem wyjasniajacym DLACZEGO: "feat(auth): add JWT token refresh endpoint"',
              solution: 'Conventional Commits to standard: typ(scope): opis. Typy: feat (nowa funkcja), fix (poprawka), docs, style, refactor, test, chore. Opis w trybie rozkazujacym ("add", nie "added" lub "adds"). Cialo commita (po pustej linii) wyjasnia DLACZEGO - nie co (to widac z kodu). Footer zawiera referencje: "Closes REL-123". Dobre commity: latwe do przejrzenia w git log, generuja automatyczny CHANGELOG, ulatwiaja bisect i blame. "fix bug" to przyklad zlego commita - nie mowi co za bug, w czym, jak naprawiony.',
              points: 1,
              isPublished: false
            }
          ]
        }
      ]
    }
  ]
};
