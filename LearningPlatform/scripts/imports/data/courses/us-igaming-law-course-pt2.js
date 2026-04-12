// data/courses/us-igaming-law-course-pt2.js
// Modules 3-4: State Regulation + Product-Specific Law

module.exports = {
  subject: {
    name: 'Gaming Law & Regulation',
    slug: 'gaming-law-regulation'
  },

  course: {
    title: 'US iGaming Law: Federal & State Framework',
    slug: 'us-igaming-law-federal-state-framework',
    description: 'A comprehensive deep dive into how US federal and state law governs online gambling - covering online casino, sports betting, poker, DFS, and prediction markets. From the Wire Act to Murphy v. NCAA, learn how the most complex gambling regulatory system in the world actually works.',
    level: 'BEGINNER',
    isPublished: false
  },

  modules: [
    // =========================================================
    // MODULE 3: STATE REGULATION - THE PATCHWORK
    // =========================================================
    {
      title: 'Module 3: State Regulation - The Patchwork',
      order: 3,
      isPublished: false,

      lessons: [
        // ----------------------------------------------------------
        // LESSON 3.1: How States Regulate - Licensing, Taxes, Enforcement
        // ----------------------------------------------------------
        {
          title: 'Lesson 3.1: How States Regulate - Licensing, Taxes, and Enforcement',
          order: 1,
          isPublished: false,

          theoryBlocks: [
            // HOOK
            {
              blockType: 'text',
              content: 'Federal law sets the floor - but the real action in US iGaming is at the state level. Every state that legalizes online gambling must build a complete regulatory infrastructure from scratch: licensing frameworks, tax structures, consumer protections, technical standards, enforcement mechanisms, and problem gambling programs. No two states have done this identically. Understanding how state regulation works - the mechanics of licensing, the logic behind tax structures, and the tools available for enforcement - is essential for anyone operating in or analyzing the US iGaming market.'
            },

            // THE STATE REGULATORY MODEL
            {
              blockType: 'text',
              content: 'When a state legalizes online gambling, it typically creates or designates a **regulatory agency** to oversee the industry. Most states use existing gaming commissions (originally established for casinos or lotteries) and expand their mandate to cover online gambling. Key agencies include the New Jersey Division of Gaming Enforcement (DGE), the Pennsylvania Gaming Control Board (PGCB), and the Michigan Gaming Control Board (MGCB). These agencies have broad powers: they issue licenses, conduct background investigations, set technical standards, audit operators, investigate complaints, and impose sanctions. The regulatory model is built on the premise that the state acts as a permanent partner in the gambling business - monitoring it continuously rather than just at the point of licensing.'
            },

            // LICENSING STRUCTURE
            {
              blockType: 'text',
              content: 'Online gambling licensing in the US typically operates on a **tiered structure**. At the top are **primary licenses** held by major operators - often casino companies, horse racing facilities, or lottery corporations that are already licensed for land-based gambling. These primary licensees serve as the "anchor" for online operations. Below them are **vendor licenses** or **supplier licenses** for technology providers, software companies, payment processors, and other service providers. Most states also require **key employee licenses** for individuals in management, compliance, or technical roles. This layered approach means that a single online casino operation may involve dozens of separately licensed entities, each subject to ongoing regulatory oversight.'
            },

            // BACKGROUND INVESTIGATIONS
            {
              blockType: 'text',
              content: 'The licensing process for a major online gambling operator is extraordinarily rigorous. State gaming commissions conduct **comprehensive background investigations** that can take 12-24 months and cost millions of dollars. Investigators examine: the applicant\'s full corporate structure and beneficial ownership; the financial history of all key individuals; criminal background checks across multiple jurisdictions and databases; source of funds for the business; history of regulatory compliance in other jurisdictions; and business relationships with other entities. In New Jersey, the DGE\'s investigation is so thorough that a "qualified" NJ license is recognized by many other states, reducing duplicative investigation costs. This mutual recognition concept is gradually spreading across the industry.'
            },

            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Flowchart showing the typical US state online gambling licensing process. Steps shown in sequence: 1. Application Submission (operator submits detailed application with corporate docs, financials, key personnel). 2. Initial Review (regulatory agency checks completeness). 3. Background Investigation (12-24 months, financial, criminal, regulatory history checks). 4. Technical Certification (gaming systems tested by approved labs). 5. Public Comment Period (in some states). 6. Commission Hearing and Vote. 7. License Issued (with conditions). 8. Ongoing Compliance (annual audits, reporting, renewal). Show timeline estimates at each stage. Use a clean vertical flowchart with icons for each stage.',
              align: 'center',
              width: 'md'
            },

            // TAX STRUCTURES
            {
              blockType: 'text',
              content: 'Tax rates on online gambling revenue vary dramatically across states, reflecting different policy priorities and negotiating dynamics between legislatures and industry. The key metric is **Gross Gaming Revenue (GGR)** - total player losses, or equivalently, total operator revenue before expenses. Tax rates on GGR range from:\n\n- **Delaware**: ~43% (effectively a state monopoly through the lottery)\n- **Pennsylvania**: 36% on slots, 16% on table games/poker\n- **New York**: 51% on mobile sports betting (among the highest in the world)\n- **New Jersey**: 17.5% on online casino, 13% on online sports betting\n- **Michigan**: 20-28% on online casino (tiered by product)\n- **Nevada**: 6.75% on sports betting (very low; reflects Nevada\'s competitive position)\n\nHigh tax rates (Pennsylvania, New York) reduce operator margins and can suppress the number of viable competitors, while low rates (Nevada, New Jersey) support more competitive markets.'
            },

            // TECHNICAL STANDARDS AND TESTING
            {
              blockType: 'text',
              content: 'Before a single real-money bet can be placed, online gambling **software and systems** must be certified by a state-approved testing laboratory. Independent test labs like **GLI (Gaming Laboratories International)**, **BMM Testlabs**, and **eCOGRA** conduct exhaustive technical audits of:\n\n- **Random Number Generator (RNG) integrity** - confirming game outcomes are truly random\n- **Return-to-player (RTP) rates** - verifying payback percentages match what is advertised\n- **Geolocation accuracy** - ensuring players are physically located within the licensed state\n- **Identity verification systems** - confirming KYC processes meet regulatory standards\n- **Responsible gambling tools** - testing deposit limits, self-exclusion, and cooling-off features\n- **Data security** - verifying protection of player financial and personal data\n\nThis certification process is repeated whenever significant software updates are deployed, creating an ongoing compliance obligation rather than a one-time hurdle.'
            },

            // GEOLOCATION - A CRITICAL COMPLIANCE TOOL
            {
              blockType: 'text',
              content: '**Geolocation technology** is perhaps the most operationally critical compliance tool for US online gambling operators. Because licensing is state-specific, operators must ensure players are physically located within the licensed state at the time they place a bet. This goes beyond IP address checking - sophisticated players can mask their location with VPNs, and IP geolocation has meaningful error rates. Licensed US operators use dedicated geolocation providers like **GeoComply** (the dominant provider) that cross-reference multiple data points: GPS signals, Wi-Fi triangulation, cell tower data, IP address, and device fingerprinting. GeoComply processes billions of geolocation checks annually and maintains error rates below 0.1%. The technology is effective enough that players in a border area can be precisely determined to be in-state or out-of-state within a few meters.'
            },

            {
              blockType: 'callout',
              variant: 'info',
              title: 'The Geolocation Border Problem',
              content: 'Living near a state border creates real iGaming complications. A player in Camden, New Jersey (which borders Philadelphia, Pennsylvania) can legally play on a NJ-licensed online casino from their home. If they drive across the Ben Franklin Bridge to Philadelphia, their geolocation check fails - they are now in Pennsylvania, outside the NJ license area. If Pennsylvania also has online gambling (it does), the same player might need a separate PA account. This state-by-state fragmentation is a defining feature of US iGaming that has no equivalent in most other regulated markets.'
            },

            // RESPONSIBLE GAMBLING REQUIREMENTS
            {
              blockType: 'text',
              content: 'All US states that have legalized online gambling require operators to implement **responsible gambling (RG) programs** as a condition of licensing. Mandatory requirements typically include:\n\n- **Self-exclusion programs**: Players can voluntarily ban themselves from the platform; operators must honor these bans and have systems to enforce them\n- **Deposit limits**: Players can set daily, weekly, or monthly deposit caps that the operator cannot help them circumvent\n- **Session limits**: Time-based alerts or session cutoffs\n- **Reality checks**: Periodic notifications about time spent gambling and money wagered\n- **Cool-off periods**: Mandatory waiting periods before increasing limits\n- **Problem gambling resources**: Required display of helpline numbers and treatment resources\n\nStates maintain **statewide self-exclusion databases** that all licensed operators must check - a player self-excluded in New Jersey is excluded from all NJ-licensed operators simultaneously.'
            },

            {
              blockType: 'table',
              caption: 'State Online Gambling Regulatory Comparison',
              hasHeaders: true,
              headers: ['State', 'Primary Regulator', 'Online Casino Tax Rate', 'Sports Betting Tax Rate', 'Year Launched'],
              rows: [
                ['New Jersey', 'Division of Gaming Enforcement (DGE)', '17.5% GGR', '13% GGR', '2013'],
                ['Pennsylvania', 'Gaming Control Board (PGCB)', '36% slots / 16% table games', '36% online / 8.5% retail', '2019'],
                ['Michigan', 'Gaming Control Board (MGCB)', '20-28% GGR (tiered)', '8.4% GGR', '2021'],
                ['New York', 'Gaming Commission (NYGC)', 'Not yet legal', '51% GGR (mobile)', '2022 (sports only)'],
                ['Nevada', 'Gaming Control Board (NGCB)', 'Not legal (poker only)', '6.75% GGR', '2010 (poker)'],
                ['Delaware', 'Lottery Office', '~43% GGR', '~50% GGR', '2013']
              ]
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'What is "Gross Gaming Revenue" (GGR) and why is it the primary tax base for online gambling?',
              tagSlugs: ['state-law', 'licensing', 'beginner'],
              choices: [
                'Total bets placed by players, used because it is the largest number',
                'Total operator revenue after expenses, used because it reflects actual profit',
                'Total player losses (operator revenue before expenses), used as the most consistent measure of gambling activity',
                'Total deposits by players, used because it is easiest to track'
              ],
              correctAnswer: 'Total player losses (operator revenue before expenses), used as the most consistent measure of gambling activity',
              solution: 'GGR equals total player losses, which is the same as operator revenue before deducting operating expenses. It is used as the primary tax base because it represents the consistent economic value generated by gambling activity regardless of operator efficiency. Unlike net revenue (after expenses), GGR cannot be artificially reduced through cost allocations. It is the standard measure across virtually all regulated gambling jurisdictions worldwide.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'IP address checking alone is sufficient for geolocation compliance in US online gambling.',
              tagSlugs: ['compliance', 'state-law', 'intermediate'],
              correctAnswer: 'false',
              solution: 'False. IP address geolocation has significant error rates and can be easily bypassed with VPNs or proxies. Regulators require more robust geolocation solutions that cross-reference multiple data points: GPS signals, Wi-Fi triangulation, cell tower data, IP address, and device fingerprinting. Providers like GeoComply use multi-signal verification to achieve sub-0.1% error rates. IP-only checking would not meet regulatory standards and would expose operators to license violations.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'Which state has the highest mobile sports betting tax rate among those listed?',
              tagSlugs: ['state-law', 'sports-betting', 'beginner'],
              choices: [
                'New Jersey at 13%',
                'Pennsylvania at 36%',
                'Nevada at 6.75%',
                'New York at 51%'
              ],
              correctAnswer: 'New York at 51%',
              solution: 'New York has a 51% GGR tax rate on mobile sports betting - among the highest in the world for a regulated gambling market. This extremely high rate significantly compresses operator margins. While it generates substantial state revenue, critics argue it makes New York a less competitive market and may push players toward unlicensed alternatives with better odds and promotions.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Explain why the state-by-state licensing model in US iGaming creates operational challenges that do not exist in single-jurisdiction markets like the UK. Give at least two specific examples.',
              tagSlugs: ['state-law', 'compliance', 'intermediate'],
              solution: 'The US state-by-state model creates challenges absent in unified markets like the UK in several ways. First, geolocation: in the UK a licensed operator can serve any player in the country; in the US an operator licensed in NJ must prevent PA-resident players from playing, requiring continuous geolocation monitoring that adds cost and friction. Second, fragmented player pools: an online poker site in Nevada cannot combine its player pool with NJ players without a specific multi-state compact, unlike UK operators who can serve the entire country from one license. Third, compliance cost multiplication: each state has different technical standards, tax filing requirements, responsible gambling mandates, and reporting obligations - a multi-state operator may pay 10x the compliance cost of a single-state operator. Fourth, multiple licensing processes: each state conducts its own extensive background investigation, creating parallel 12-24 month processes that must be managed simultaneously for market expansion.',
              points: 3,
              isPublished: false
            }
          ]
        },

        // ----------------------------------------------------------
        // LESSON 3.2: Online Casino States - The Six-State Club
        // ----------------------------------------------------------
        {
          title: 'Lesson 3.2: Online Casino States - The Six-State Club',
          order: 2,
          isPublished: false,

          theoryBlocks: [
            // HOOK
            {
              blockType: 'text',
              content: 'As of 2024, only **six US states** have legalized real-money online casino gambling: New Jersey, Pennsylvania, Michigan, Delaware, West Virginia, and Connecticut. Together they represent less than 15% of the US population - yet they constitute a multi-billion-dollar market that is growing rapidly. Each state took a different path to legalization, established different regulatory frameworks, and reflects different political dynamics. Understanding these six markets - why they legalized, how they structured their regulation, and what has made them succeed - is essential for understanding the future of US online casino expansion.'
            },

            // NEW JERSEY - THE PIONEER
            {
              blockType: 'text',
              content: '**New Jersey** is the undisputed pioneer and largest US online casino market. NJ legalized online gambling in 2013, authorizing online casino games and poker tied to its Atlantic City brick-and-mortar casino licensees. The legal framework: each AC casino can partner with up to three online "skins" (brands), creating the possibility of multiple online brands per license. New Jersey\'s approach was market-oriented - relatively low tax rates (17.5%), a competitive multi-operator market, and an early embrace of major international operators. The NJ DGE developed a reputation for regulatory sophistication that became a model for other states. By 2024, NJ online casino GGR exceeds **$2 billion annually** - extraordinary for a state of 9 million people - driven by operators like BetMGM, DraftKings, Caesars, and Golden Nugget.'
            },

            // PENNSYLVANIA
            {
              blockType: 'text',
              content: '**Pennsylvania** legalized online casino, poker, and sports betting in 2017, launching in 2019. PA is the second-largest US online casino market by GGR, with revenues exceeding $1.5 billion annually. The PA model differs from NJ significantly: the state imposed a **36% tax rate on online slots** - nearly double New Jersey\'s rate - and **16% on table games and poker**. The high slot tax rate has made PA slots among the tightest-paying in the regulated US market (lower RTPs than NJ), as operators compensate for higher costs by adjusting game settings. PA also has a higher licensing fee structure, which has limited the number of operators. Despite this, PA\'s large population (13 million) and robust sports culture have made it a major market. PA was also the first state to legalize **igaming peer-to-peer poker** tied to land-based casinos.'
            },

            // MICHIGAN
            {
              blockType: 'text',
              content: '**Michigan** legalized online gambling in December 2019 (signed by Governor Whitmer) and launched real-money play in January 2021. Michigan is notable for several reasons: it was the **first state to give tribal gaming operators equal access to online gambling** - tribal casinos in Michigan can offer online casino games alongside commercial casinos, without requiring land-based partnerships. Michigan also authorized **online poker**, though player liquidity has been a challenge. Michigan\'s 2021 launch was remarkable for its scale - multiple operators launched simultaneously including DraftKings, FanDuel, BetMGM, and several tribal brands. Michigan has grown rapidly to become the third-largest US online casino market, with GGR exceeding $1 billion annually.'
            },

            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'US map highlighting the six online casino states. Color the following states in green: New Jersey, Pennsylvania, Michigan, Delaware, West Virginia, Connecticut. All other states in light gray. Add callout labels for each legal state showing: state name, year launched, approximate annual GGR, and key distinguishing feature (e.g., NJ: "Pioneer market, $2B+ GGR"; PA: "36% slot tax rate, $1.5B GGR"; MI: "Tribal operators included, $1B+ GGR"; DE: "State lottery monopoly"; WV: "Rural market, smaller scale"; CT: "Tribal exclusivity, 2021"). Clean political map style.',
              align: 'center',
              width: 'lg'
            },

            // DELAWARE, WEST VIRGINIA, CONNECTICUT
            {
              blockType: 'text',
              content: '**Delaware** (2013) was actually the first state to legalize comprehensive online gambling, launching ahead of New Jersey. However, Delaware\'s model - a state lottery monopoly operating through three racinos - has produced modest results due to limited competition and a small population (~1 million). **West Virginia** (2019, launched 2020) legalized online casino and sports betting, becoming the fifth online casino state. WV\'s market is smaller due to its rural population (~1.8 million), but it was notable for authorizing **mobile-first operation** without requiring players to register in-person at a land-based casino. **Connecticut** (2021) took a unique approach, granting online gambling rights exclusively to the two existing tribal operators (Mohegan Sun and Foxwoods) plus the state lottery for sports betting - effectively creating a regulated oligopoly in exchange for tribal cooperation on a new compact.'
            },

            // RHODE ISLAND - NEW ADDITION
            {
              blockType: 'text',
              content: '**Rhode Island** became the **seventh online casino state** in 2024, when Governor Dan McKee signed legislation authorizing online casino gambling through the state lottery. Rhode Island joins the small club of legal online casino states, though its small population (~1.1 million) will limit market size. The RI model follows a lottery-operated approach similar to Delaware. Rhode Island\'s legalization is significant because it suggests the ongoing, if slow, expansion of online casino legalization even in the absence of a major federal push - states are gradually recognizing the tax revenue potential and consumer demand for regulated online casino products.'
            },

            // WHY MORE STATES HAVEN'T LEGALIZED
            {
              blockType: 'text',
              content: 'The most important question for the future of US online casino is: **why have only 6-7 states legalized it, while 35+ have legalized sports betting?** Several factors explain this gap:\n\n1. **Moral opposition**: Casino gambling - especially slot machines - carries stronger moral objections than sports betting, which is normalized through sports culture\n2. **Land-based casino opposition**: Brick-and-mortar casinos (particularly in early-adopter states) initially feared online cannibalization of their revenue, though data has consistently shown the opposite\n3. **Tribal gaming concerns**: Tribes in many states oppose online casino legalization that would compete with or complicate their land-based exclusivity agreements\n4. **Political complexity**: Online casino requires more complex legislation than sports betting and faces opposition from more interest groups\n5. **Revenue underestimation**: Many state legislators underestimate online casino revenue potential compared to sports betting'
            },

            {
              blockType: 'callout',
              variant: 'tip',
              title: 'Online Casino vs. Sports Betting: The Revenue Reality',
              content: 'Counterintuitively, online casino typically generates far more revenue per capita than sports betting. New Jersey\'s online casino GGR is roughly 3-4x its online sports betting GGR. This is because casino games have a higher hold percentage and players engage more frequently. States that legalize only sports betting are leaving significant tax revenue on the table - a fact that is increasingly cited in state legislative debates about online casino expansion.'
            },

            {
              blockType: 'table',
              caption: 'US Online Casino States: Key Metrics Comparison',
              hasHeaders: true,
              headers: ['State', 'Year Live', 'Tax Rate (Slots)', 'Model', 'Tribal Access'],
              rows: [
                ['New Jersey', '2013', '17.5% GGR (all games)', 'Multi-operator, AC casino anchored', 'No tribal casinos in NJ'],
                ['Delaware', '2013', '~43% GGR', 'State lottery monopoly via 3 racinos', 'N/A'],
                ['Pennsylvania', '2019', '36% slots / 16% table games', 'Multi-operator, PA casino anchored', 'Limited tribal presence'],
                ['Michigan', '2021', '20-28% GGR (tiered)', 'Multi-operator including tribal operators', 'Yes - full tribal access'],
                ['West Virginia', '2020', '15% GGR', 'Multi-operator, WV casino anchored', 'Limited'],
                ['Connecticut', '2021', '18% GGR', 'Tribal operators + lottery (oligopoly)', 'Yes - tribal exclusivity']
              ]
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Which state was the first to launch real-money online gambling in the United States?',
              tagSlugs: ['state-law', 'online-casino', 'beginner'],
              choices: [
                'New Jersey (2013)',
                'Nevada (2013)',
                'Delaware (2013)',
                'Pennsylvania (2019)'
              ],
              correctAnswer: 'Delaware (2013)',
              solution: 'Delaware technically launched online gambling before New Jersey, making it the first US state with live real-money online casino games. However, Delaware\'s state lottery monopoly model and small population have kept its market much smaller than New Jersey\'s, which is why NJ is typically described as the "pioneer" of the US online casino industry in terms of market impact and regulatory influence.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'Why does Pennsylvania\'s high slot tax rate (36%) affect player experience compared to lower-tax states?',
              tagSlugs: ['state-law', 'online-casino', 'intermediate'],
              choices: [
                'Players must pay higher fees to register accounts',
                'Operators set slot RTPs lower to compensate for higher costs, resulting in tighter games',
                'Players in PA receive fewer promotional bonuses than in other states',
                'PA slots have fewer game titles available due to tax-related licensing restrictions'
              ],
              correctAnswer: 'Operators set slot RTPs lower to compensate for higher costs, resulting in tighter games',
              solution: 'When tax rates are high, operators have less revenue after taxes and may adjust slot machine Return-to-Player (RTP) settings downward to maintain profitability. PA slots tend to have lower average RTPs than NJ slots - meaning players get back a smaller percentage of their wagers over time in PA. This is one of the consumer-facing consequences of high tax rates that legislators often overlook when setting tax policy.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'Online casino typically generates more tax revenue per capita than online sports betting.',
              tagSlugs: ['online-casino', 'state-law', 'intermediate'],
              correctAnswer: 'true',
              solution: 'True. Online casino (particularly slots and table games) generates significantly higher revenue per capita than sports betting. New Jersey\'s online casino GGR is roughly 3-4x its sports betting GGR. Casino games have higher hold percentages than sportsbooks (which compete on razor-thin margins), and players engage more frequently. This revenue differential is increasingly cited in arguments for states that have legalized sports betting to also legalize online casino.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Michigan was the first state to grant tribal gaming operators equal access to online gambling alongside commercial operators. Why is this significant, and what challenges does the inclusion of tribal operators create for online gambling regulation?',
              tagSlugs: ['online-casino', 'tribal-gaming', 'michigan', 'intermediate'],
              solution: 'Michigan\'s inclusion of tribal operators is significant because it resolved a major political obstacle to legalization: tribal opposition. In many states, tribes oppose online gambling expansion because they fear it will cannibalize their land-based casino revenue. Michigan\'s model addressed this by giving tribes an equal competitive position in the online market, aligning their interests with legalization rather than against it. This may serve as a template for other states seeking to pass online casino legislation. The challenges it creates include: regulatory complexity (tribes operate under IGRA, not just state law, creating dual-jurisdiction issues); potential IGRA legal questions about whether online gambling by tribal operators is "gaming on Indian lands"; competitive dynamics between tribal and commercial operators who may not have the same cost structures or scale; and the political challenge of preventing tribal-state compact renegotiations when online gambling revenues shift market dynamics.',
              points: 3,
              isPublished: false
            }
          ]
        },

        // ----------------------------------------------------------
        // LESSON 3.3: Sports Betting - 35+ States Deep Dive
        // ----------------------------------------------------------
        {
          title: 'Lesson 3.3: Sports Betting - The 35+ State Landscape',
          order: 3,
          isPublished: false,

          theoryBlocks: [
            // HOOK
            {
              blockType: 'text',
              content: 'The post-Murphy sports betting expansion is one of the fastest regulatory rollouts in American history. In the six years following the May 2018 Supreme Court ruling, over 35 states and Washington DC legalized some form of sports betting - a rate of roughly six new markets per year. Yet despite this rapid expansion, no two state sports betting markets are identical. Mobile vs. retail-only, number of operators permitted, tax rates, in-game betting rules, college sports restrictions - every state made different choices. Understanding the landscape means understanding not just which states are legal, but **how** they are legal and what that means in practice.'
            },

            // THE MOBILE VS RETAIL DIVIDE
            {
              blockType: 'text',
              content: 'The single most commercially important distinction between state sports betting markets is **mobile vs. retail only**. Mobile sports betting - placing bets from your smartphone anywhere in the state - accounts for roughly 85-95% of all legal sports betting handle in states where it is available. Retail sports betting (in-person at a sportsbook location) generates only a small fraction of total volume. States like **Mississippi and Montana** originally legalized only retail betting, severely limiting their market potential. States like **New York and New Jersey** launched with robust mobile markets and immediately generated billions in annual handle. When analysts project potential sports betting revenue for a state, the presence or absence of mobile betting is the most decisive variable.'
            },

            // THE OPERATOR LICENSE MODEL
            {
              blockType: 'text',
              content: 'States take very different approaches to how many operators can be licensed:\n\n- **Open competitive market** (New Jersey, Michigan): Many operators licensed, competitive market drives better odds and promotions for players. NJ had 20+ online sportsbooks active at peak.\n- **Limited license model** (New York): Initially licensed only 9 mobile operators tied to land-based casino bids. Controlled competition, but operators paid billions in licensing fees.\n- **Monopoly model** (Delaware, Rhode Island): Single operator (usually the state lottery), maximum state revenue capture, minimum competition and consumer choice.\n- **Casino-anchored model** (many states): Online licenses must be tied to existing land-based casino licenses, limiting new entrants and protecting incumbent casino operators.\n\nThe choice of model significantly affects consumer experience, operator profitability, and long-term market health.'
            },

            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Comprehensive US map showing sports betting legal status by state as of 2024. Color coding: Dark green = legal and operational (mobile + retail), Light green = legal retail only, Yellow = legal but not yet operational, Orange = legislation pending, Red = no legislation / illegal. Label each state with its abbreviation. Include a small legend box explaining color codes. Also include a small inset timeline chart showing cumulative number of legal states from 2018 to 2024 (showing rapid growth curve). Major states should be large enough to read without zooming.',
              align: 'center',
              width: 'lg'
            },

            // KEY STATE MODELS
            {
              blockType: 'text',
              content: '**New Jersey** set the gold standard for sports betting launch speed and market structure. NJ launched within weeks of *Murphy*, using its existing Atlantic City casino framework. The state\'s low 13% GGR tax rate and competitive multi-operator market made it the early national leader. **New York** launched mobile sports betting in January 2022 with the highest tax rate in the nation (51% GGR) but also the largest population - the New York market generated over $1.7 billion in GGR in its first full year, making it the largest US sports betting market by revenue despite (or because of) enormous operator promotional investment. **Colorado** (2020) is notable for its unique tax-to-water-projects structure. **Tennessee** (2020) was the first state to authorize mobile-only betting with no retail requirement.'
            },

            // COLLEGE SPORTS RESTRICTIONS
            {
              blockType: 'text',
              content: 'Many states impose specific restrictions on **college sports betting** that do not apply to professional sports. These restrictions come in two main forms:\n\n- **In-state college team bans**: Some states (like New Jersey initially, Georgia for university-sponsored discussions) prohibit betting on in-state college teams, reasoning that it creates undue pressure on student athletes and local programs. New Jersey later removed this restriction.\n- **Proposition bet bans on college sports**: Many states prohibit "prop bets" (individual player performance bets) on college athletes - you can bet on who wins the game, but not on whether a specific college quarterback throws for more than 200 yards. This is largely a response to concerns about student athlete exploitation.\n\nThe college sports betting restriction landscape is evolving rapidly as states gather data and the NIL (Name, Image, Likeness) era changes the college sports landscape.'
            },

            // IN-GAME BETTING AND DATA
            {
              blockType: 'text',
              content: '**In-game (live) betting** - placing bets on rapidly changing odds during an ongoing game - is one of the fastest-growing segments of sports betting and a major area of regulatory development. Live betting requires real-time data feeds and sophisticated risk management systems. Several states have enacted or are considering **official league data mandates** - requirements that sportsbooks use official league-licensed data (rather than commercially available data) for in-game betting markets. The NBA and MLB have been the most aggressive advocates for these mandates, arguing that official data is more accurate and that leagues deserve compensation for generating the data. Critics argue that official data mandates are simply a revenue mechanism for leagues with no demonstrated accuracy benefit.'
            },

            {
              blockType: 'callout',
              variant: 'warning',
              title: 'The Big States Still Missing',
              content: 'As of 2024, several major population states remain without legal mobile sports betting: Texas (2nd largest state by population), Florida (3rd - complex tribal issues; see Seminole Compact), California (1st - two failed ballot initiatives in 2022), and Georgia. These four states alone represent nearly 100 million Americans. Their legalization would roughly double the addressable US sports betting market. Texas and California are the biggest prizes in American iGaming, and political developments in both states are closely watched by the entire industry.'
            },

            {
              blockType: 'table',
              caption: 'Key US Sports Betting Markets Compared',
              hasHeaders: true,
              headers: ['State', 'Mobile Available', 'Tax Rate (GGR)', 'License Model', 'Notable Feature'],
              rows: [
                ['New Jersey', 'Yes', '13%', 'Multi-operator, casino-anchored', 'Pioneer market; competitive'],
                ['New York', 'Yes', '51%', 'Limited (9 mobile operators)', 'Highest tax; largest revenue'],
                ['Nevada', 'Yes (limited)', '6.75%', 'Multi-operator, casino-anchored', 'Lowest tax; retail-focused legacy market'],
                ['Colorado', 'Yes', '10%', 'Multi-operator, casino-anchored', 'Tax revenue earmarked for water projects'],
                ['Tennessee', 'Yes', '20% on handle (unique)', 'Mobile-only, no retail', 'First mobile-only state'],
                ['Mississippi', 'No (retail only)', '12%', 'Casino-anchored retail', 'Mobile still not authorized']
              ]
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Approximately what percentage of legal sports betting handle is generated through mobile (vs. retail in-person) in states where mobile is available?',
              tagSlugs: ['sports-betting', 'state-law', 'beginner'],
              choices: [
                '30-40%',
                '50-60%',
                '85-95%',
                '99% or more'
              ],
              correctAnswer: '85-95%',
              solution: 'Mobile betting accounts for approximately 85-95% of legal sports betting handle in states where it is available. This dominance of mobile explains why the presence or absence of mobile authorization is the most decisive variable in projecting state sports betting market size. States with retail-only authorization generate a small fraction of the revenue of comparable states with mobile markets.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'New York generates more sports betting revenue (GGR) than New Jersey, despite having a much higher tax rate.',
              tagSlugs: ['sports-betting', 'new-jersey', 'intermediate'],
              correctAnswer: 'true',
              solution: 'True. New York\'s enormous population (20 million+) makes it the largest US sports betting market by revenue even with a 51% GGR tax rate - more than three times New Jersey\'s 13% rate. New York generated over $1.7 billion in GGR in its first full year of mobile betting. Population size can outweigh tax rate disadvantages when the market is large enough, though NY\'s high tax rate does suppress operator margins and promotional budgets.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'What are "official league data mandates" in sports betting regulation?',
              tagSlugs: ['sports-betting', 'state-law', 'intermediate'],
              choices: [
                'Requirements that sportsbooks display official league logos on their websites',
                'Requirements that sportsbooks use league-licensed data for in-game betting markets',
                'Requirements that operators share a percentage of revenue with leagues',
                'Requirements that leagues approve all sportsbook marketing materials'
              ],
              correctAnswer: 'Requirements that sportsbooks use league-licensed data for in-game betting markets',
              solution: 'Official league data mandates require sportsbooks to purchase and use official league-licensed data (rather than cheaper commercially available data) for in-game (live) betting markets. Leagues like the NBA and MLB advocate for these mandates, arguing official data is more accurate and that leagues should be compensated for generating the underlying activity. Critics argue these mandates are revenue mechanisms for leagues without demonstrated accuracy benefits, effectively creating a mandatory licensing fee.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Texas and California together have approximately 80 million residents. Why have both of these massive states failed to legalize sports betting, and what are the main obstacles in each state?',
              tagSlugs: ['sports-betting', 'state-law', 'advanced'],
              solution: 'Texas: The Texas legislature is constitutionally restricted - gambling expansion requires a constitutional amendment, which must pass both legislative chambers by a 2/3 supermajority and then be approved by voters. The Texas legislature meets only every two years and is dominated by social conservatives who have historically opposed gambling. Additionally, major casino operators including Las Vegas Sands have lobbied for broader casino legalization alongside sports betting, creating a complex lobbying coalition. The powerful evangelical Christian constituency in Texas represents a significant political obstacle. California: California attempted to resolve sports betting legalization through two competing ballot initiatives in November 2022 - one backed by tribal gaming interests (Prop 26, retail only) and one backed by commercial operators/DraftKings/FanDuel (Prop 27, mobile). Both failed badly, with Prop 27 losing 83%-17%. California tribes have near-monopoly power over gambling in the state through exclusive gaming compacts and see mobile sports betting without tribal involvement as a direct threat. Any future California legalization will likely require tribal buy-in. Massive initiative campaign spending ($500M+ combined) failed to persuade voters, suggesting the political environment remains challenging.',
              points: 3,
              isPublished: false
            }
          ]
        },

        // ----------------------------------------------------------
        // LESSON 3.4: Gray Areas - Sweepstakes, Offshore, and Social Gaming
        // ----------------------------------------------------------
        {
          title: 'Lesson 3.4: Gray Areas - Sweepstakes Casinos, Offshore Sites, and the Unregulated Market',
          order: 4,
          isPublished: false,

          theoryBlocks: [
            // HOOK
            {
              blockType: 'text',
              content: 'For every legal, licensed online casino in the US, there are dozens of unlicensed alternatives also serving US players. The US iGaming market is not just six licensed online casino states - it is also a massive gray and black market operating in the spaces between clearly legal and clearly illegal. Sweepstakes casinos serve all 50 states using legal workarounds. Offshore sites operate outside US jurisdiction while accepting American players. Crypto gambling sites reject the premise of US regulation entirely. Understanding these gray areas is essential - both because they represent the reality of what most US players actually experience, and because they are reshaping the regulatory debate about how far legal gambling should expand.'
            },

            // SWEEPSTAKES CASINOS
            {
              blockType: 'text',
              content: '**Sweepstakes casinos** are the most commercially significant gray-area model in US iGaming. Companies like **Chumba Casino, Pulsz, McLuck, High 5 Casino, and Fortune Coins** operate casino-style games using a dual-currency model: **Gold Coins** (play money, no real-money value) and **Sweeps Coins** (which can be redeemed for real prizes). The key legal mechanism: players can obtain Sweeps Coins **for free** by requesting them via mail or other no-purchase-required methods - eliminating the "consideration" element of gambling. Because there is a free entry option, the sweepstakes model is characterized as a promotional sweepstakes rather than gambling. This model is legal in nearly all US states (typically excluding Washington State and a few others).'
            },

            // WHY SWEEPSTAKES IS CONTROVERSIAL
            {
              blockType: 'text',
              content: 'The sweepstakes casino model is controversial for several reasons:\n\n- **Functionally identical to gambling**: Players experience sweepstakes slots, table games, and other casino products in exactly the same way as real-money games. The psychology and gameplay are identical.\n- **Rapid growth**: The sweepstakes market has grown from a niche novelty to a multi-billion-dollar industry. Some estimates suggest sweepstakes casino revenues exceed those of licensed online casino markets.\n- **Regulatory arbitrage**: Operators avoid the compliance costs, tax obligations, and player protection requirements that licensed operators must follow. No formal problem gambling programs, KYC requirements, or AML compliance is mandated.\n- **Regulatory response**: Several states are beginning to scrutinize sweepstakes casinos more closely. Connecticut and Michigan have taken enforcement positions, and the broader regulatory trend suggests increased oversight is coming.'
            },

            // OFFSHORE GAMBLING SITES
            {
              blockType: 'text',
              content: '**Offshore gambling sites** - operating from jurisdictions like Malta, Curacao, Antigua, Gibraltar, Isle of Man, and Kahnawake - have served US players since the late 1990s. Sites like **BetOnline, Bovada, MyBookie, and Ignition** explicitly accept US players and offer sports betting, casino games, and poker. These operators are licensed in their home jurisdictions but hold no US licenses. Their US legality is genuinely ambiguous: operating such a site likely violates federal law (Wire Act, UIGEA, Travel Act), but the US has limited practical ability to prosecute operators located abroad. Players using these sites are generally not prosecuted, but they have no regulatory protections - no license, no consumer dispute mechanism, no guaranteed game fairness, and no deposit protection if the site fails.'
            },

            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Spectrum diagram showing US iGaming market segments from most regulated to least regulated. Left side labeled "Fully Regulated" to right side labeled "Unregulated." Position segments as colored bands: (1) Licensed State Online Casinos - dark green, far left - NJ, PA, MI, DE, WV, CT, RI; (2) Licensed State Sports Betting - green, left-center - 35+ states; (3) Tribal Online Gaming - yellow-green, center-left - varies by state/compact; (4) ADW Horse Racing - yellow, center - IHA-licensed nationally; (5) Sweepstakes Casinos - orange, center-right - legal in most states, no gambling license; (6) Social Casinos - light orange, right-center - free to play, no real prizes; (7) Offshore Licensed Sites - red-orange, far right - foreign license, no US license; (8) Truly Illegal Sites - red, far right - no license anywhere. Add player population estimates for each segment if possible.',
              align: 'center',
              width: 'lg'
            },

            // CRYPTO GAMBLING
            {
              blockType: 'text',
              content: '**Cryptocurrency gambling sites** represent the fastest-growing unregulated segment. Sites like **Stake.com, Rollbit, and BC.Game** accept cryptocurrency deposits, eliminating the UIGEA-driven banking complications that hobble offshore sites accepting US players. Because transactions occur on blockchain networks rather than through traditional banking, payment processing restrictions are harder to enforce. These sites often claim to operate outside the scope of US law (some geo-block US players nominally while employing aggressive VPN-tolerance policies). Crypto gambling sites typically have no formal licensing, no verifiable RNG certification, no AML compliance, and no consumer protections. They represent the most significant law enforcement blind spot in the current US iGaming regulatory framework.'
            },

            // SOCIAL CASINOS
            {
              blockType: 'text',
              content: '**Social casinos** - free-to-play casino apps where players use virtual chips with no real-money prize option - occupy the clearest legal position: they are universally legal because they lack both the "prize" and "consideration" elements of gambling. Apps by Playtika (Slotomania, WSOP), Zynga (Zynga Poker), and dozens of others generate billions in revenue through in-app purchases of virtual currency (never redeemable for cash). Social casinos serve as a legal "feeder" that familiarizes players with casino game mechanics and builds brand relationships that can convert to real-money gambling when players move to jurisdictions where it is legal. Many licensed iGaming operators maintain companion social casino apps for this reason.'
            },

            {
              blockType: 'callout',
              variant: 'warning',
              title: 'Player Protection Gap in the Gray Market',
              content: 'US players who use offshore or sweepstakes gambling sites have virtually no regulatory protections. If an offshore site refuses to pay a withdrawal, the player has no regulatory body to complain to. If a sweepstakes casino changes its terms to make winning harder, there is no gaming commission to intervene. If an unlicensed crypto site is simply a scam, there is no deposit protection fund. The regulatory patchwork in the US leaves the majority of online gamblers - those outside the six licensed casino states - in a consumer protection vacuum.'
            },

            {
              blockType: 'table',
              caption: 'US iGaming Market Segments: Legal Status and Consumer Protection',
              hasHeaders: true,
              headers: ['Segment', 'Legal Status', 'Consumer Protection', 'Regulatory Body'],
              rows: [
                ['Licensed Online Casino (6-7 states)', 'Fully legal in licensed states', 'High - state gaming commission oversight', 'State gaming commissions'],
                ['Licensed Sports Betting (35+ states)', 'Fully legal in licensed states', 'High - state oversight', 'State gaming commissions'],
                ['Sweepstakes Casinos', 'Legal in most states (gray area)', 'Low - no formal gambling oversight', 'State AGs (informally)'],
                ['Offshore Licensed Sites', 'Legally ambiguous / likely violates US law', 'Low - foreign regulator only', 'Foreign gaming authority (limited reach)'],
                ['Crypto Gambling Sites', 'Likely illegal / unenforceable', 'None', 'None effectively'],
                ['Social Casinos', 'Fully legal everywhere', 'Moderate - consumer protection laws apply', 'FTC / State AGs']
              ]
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'What is the key legal mechanism that allows sweepstakes casinos to operate across nearly all US states?',
              tagSlugs: ['sweepstakes-casinos', 'us-gambling-law', 'intermediate'],
              choices: [
                'They are registered as charities and are therefore exempt from gambling law',
                'They operate on federal land outside state jurisdiction',
                'They eliminate the "consideration" element of gambling by offering free entry options',
                'They hold offshore gaming licenses that are recognized by US states'
              ],
              correctAnswer: 'They eliminate the "consideration" element of gambling by offering free entry options',
              solution: 'Sweepstakes casinos operate legally by eliminating "consideration" - one of the three required elements of gambling (consideration, chance, prize). By offering free entry methods (such as mail-in requests for Sweeps Coins), they argue that players do not have to pay to participate. Without mandatory consideration, the activity is characterized as a promotional sweepstakes rather than gambling, which is legal in virtually all states. However, this legal theory is increasingly challenged by regulators.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'Players who experience problems with offshore gambling sites (such as withheld withdrawals) have the same regulatory protections as players at licensed US online casinos.',
              tagSlugs: ['offshore-gambling', 'gray-market', 'beginner'],
              correctAnswer: 'false',
              solution: 'False. Players at licensed US online casinos have substantial protections: state gaming commissions investigate complaints, require operators to segregate player funds, and can compel payouts or revoke licenses. Players at offshore sites have no US regulatory recourse - their only option is to complain to the foreign licensing authority, which has limited enforcement power in the US. This consumer protection gap is one of the strongest arguments for expanding legal online gambling to more US states.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'Why do cryptocurrency gambling sites present a particularly challenging enforcement problem for US regulators?',
              tagSlugs: ['crypto-gambling', 'gray-market', 'intermediate'],
              choices: [
                'Cryptocurrency is legal tender and therefore exempt from gambling law',
                'Crypto transactions bypass traditional banking systems, making UIGEA-based payment blocking ineffective',
                'Crypto gambling sites are all licensed in jurisdictions that have treaties with the US',
                'US regulators have explicitly decided not to pursue crypto gambling enforcement'
              ],
              correctAnswer: 'Crypto transactions bypass traditional banking systems, making UIGEA-based payment blocking ineffective',
              solution: 'UIGEA\'s primary enforcement mechanism is blocking payments through banks and traditional financial institutions. Cryptocurrency operates on blockchain networks outside traditional banking, making it impossible for UIGEA-mandated payment blocks to stop crypto gambling transactions. This creates a major enforcement gap - the central tool Congress created to combat illegal online gambling is simply ineffective against crypto-based operators.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Argue both sides of the regulatory debate about sweepstakes casinos: (1) the argument that sweepstakes casinos should continue to be treated as legal promotional sweepstakes, and (2) the argument that they should be regulated as gambling. Which argument do you find more persuasive, and why?',
              tagSlugs: ['sweepstakes-casinos', 'us-gambling-law', 'advanced'],
              solution: 'Pro-sweepstakes (should remain legal as promotions): The free entry option is real and meaningful - players can and do request Sweeps Coins without paying. Sweepstakes law is well-established and the model fits within it. Regulating sweepstakes as gambling would require legislative action in 40+ states and would likely shut down a product millions of Americans enjoy legally and responsibly. Heavy-handed regulation of a technically legal product could harm the industry without clear public benefit. Pro-regulation (should be treated as gambling): The free entry option is a legal fiction - the overwhelming majority of players pay to obtain Sweeps Coins, and the mail-in method is practically impossible for most players. The product is functionally identical to casino gambling in every experiential and psychological dimension. Sweepstakes operators avoid the consumer protections, AML compliance, problem gambling programs, and tax obligations that licensed casinos bear, creating unfair competitive advantages and consumer protection gaps. The scale of the industry ($10B+ market) makes it inappropriate to treat as a minor promotional activity. Personal assessment should acknowledge the genuine legal ambiguity and the policy tradeoffs between innovation, consumer freedom, and consumer protection.',
              points: 3,
              isPublished: false
            }
          ]
        }
      ]
    },

    // =========================================================
    // MODULE 4: PRODUCT-SPECIFIC LAW
    // =========================================================
    {
      title: 'Module 4: Product-Specific Law - Deep Dives',
      order: 4,
      isPublished: false,

      lessons: [
        // ----------------------------------------------------------
        // LESSON 4.1: Online Poker - Skill, Chance, and Multi-State Compacts
        // ----------------------------------------------------------
        {
          title: 'Lesson 4.1: Online Poker - The Skill Game That Is Still Regulated as Gambling',
          order: 1,
          isPublished: false,

          theoryBlocks: [
            // HOOK
            {
              blockType: 'text',
              content: 'Online poker occupies a unique and paradoxical position in US gambling law. A substantial body of academic research, mathematical analysis, and real-world data supports the conclusion that poker - particularly over significant sample sizes - is a game dominated by skill rather than chance. Skilled players consistently outperform unskilled players in ways that cannot be explained by luck alone. Yet despite this evidence, US law largely treats poker the same as slot machines and roulette: as gambling subject to full gambling regulation. The story of why - and what that means for operators and players - is one of the most intellectually interesting chapters in iGaming law.'
            },

            // THE SKILL ARGUMENT - THE CASE FOR POKER AS A SKILL GAME
            {
              blockType: 'text',
              content: 'The case that poker is predominantly a game of skill rests on several pillars:\n\n1. **Consistent winners exist**: In a pure chance game, no one can win consistently over thousands of hands. Professional poker players demonstrably do win consistently over hundreds of thousands of hands.\n2. **Mathematical analysis**: The skill-chance ratio in poker has been studied extensively. A 2012 study published in the *Journal of Gambling Studies* found that skill was the dominant factor in poker outcomes over the long run.\n3. **Uniform card distribution**: In poker, chance is equalized across all players - each player has the same probability of receiving strong or weak cards. Skill determines what you do with those cards.\n4. **A player can fold**: Unlike slots (where all spins play to completion), a poker player can choose not to contest a hand - a fundamentally skill-based decision unavailable in pure chance games.\n\nDespite these arguments, most US courts and legislatures have declined to exempt poker from gambling regulation.'
            },

            // WHY COURTS STILL CLASSIFY POKER AS GAMBLING
            {
              blockType: 'text',
              content: 'US courts have generally been reluctant to classify poker as a non-gambling skill game, for several reasons:\n\n- **The dominant factor test on a per-hand basis**: Courts often evaluate skill vs. chance on a single hand rather than across thousands of hands. In any individual hand, chance (the cards dealt) plays a significant role.\n- **Legislative deference**: Courts tend to defer to legislative definitions of gambling, and most state legislatures have not exempted poker.\n- **Policy concerns**: Courts are wary of creating a "skill game" exception that could be exploited to legalize other gambling products through creative skill arguments.\n- **Partial exceptions exist**: Some states have limited carve-outs. The federal UIGEA does not specifically exempt poker. The practical result is that poker is legal only in states that have explicitly legalized it.'
            },

            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Two-panel comparison diagram. Left panel: "The Skill Argument" showing factors favoring poker-as-skill: consistent professional winners (graph showing skilled players winning over 100k hands), ability to fold/bluff/read opponents, mathematical strategy depth (GTO theory), documented professional poker careers. Right panel: "The Legal Reality" showing why courts classify as gambling: per-hand chance element (card distribution diagram), legislative definitions, dominant factor test applied short-term, court deference to gambling statutes. Bottom: list of 6 states where online poker is currently legal. Clean infographic style with icons.',
              align: 'center',
              width: 'lg'
            },

            // THE SIX LEGAL STATES
            {
              blockType: 'text',
              content: 'Online poker is currently explicitly legal in **six US states**: Nevada, New Jersey, Delaware, Pennsylvania, Michigan, and West Virginia. Nevada, interestingly, only authorizes online poker - not online casino slots or table games - reflecting the state\'s political dynamics where land-based casino interests resisted online casino competition. The other five states allow both online poker and online casino. A seventh state, **Connecticut**, has authorized online poker through its tribal operators. Each state\'s online poker market operates as an **island** - players at a NJ poker site cannot compete against players at a PA site unless there is a specific multi-state agreement connecting the two markets.'
            },

            // MULTI-STATE POKER COMPACTS
            {
              blockType: 'text',
              content: '**Multi-state internet gaming compacts** (MSIGAs) are agreements between states that allow their licensed online poker operators to share player pools. Poker requires **liquidity** - enough players active at any given time to fill games across stakes levels and formats. A state with only 500,000 active poker players will have thin game selection, long wait times, and poor competition. By combining player pools, states can create viable poker markets even if each individual state\'s population is insufficient. The current multi-state poker compact connects **Nevada, New Jersey, Delaware, and Michigan**. Pennsylvania and West Virginia are authorized to join but have not fully implemented connectivity. PokerStars and WSOP.com (888poker) operate shared pools across these states.'
            },

            // THE LIQUIDITY PROBLEM
            {
              blockType: 'text',
              content: 'Liquidity is the defining competitive challenge of US online poker. Even with multi-state compacts, the US regulated poker market is a fraction of the size of the global online poker market. **PokerStars\' global platform** has vastly more traffic than all US regulated states combined - creating an enormous competitive disadvantage for licensed US sites. The liquidity gap means that US regulated poker sites struggle to offer:\n\n- **High-stakes games** (not enough players willing to play at those levels)\n- **Exotic formats** (Spin & Go, fast-fold poker, etc.) with viable player pools\n- **Guaranteed large tournament prize pools** without significant operator subsidy\n- **24/7 game availability** across all stakes\n\nThis liquidity problem is a strong argument for expanding the multi-state compact network - and ultimately for some form of federal online poker authorization that would allow a truly national player pool.'
            },

            {
              blockType: 'callout',
              variant: 'info',
              title: 'The International Liquidity Dream',
              content: 'Some US poker advocates have proposed allowing licensed US online poker sites to share player pools with international regulated markets (like the UK, France, or Spain) - creating genuinely liquid, global poker games within a regulatory framework. This would require significant federal-level action and international regulatory cooperation. While legally complex, it represents the most discussed solution to the US online poker liquidity problem and has precedent in the European shared liquidity framework among certain EU states.'
            },

            {
              blockType: 'table',
              caption: 'US Online Poker Market Overview',
              hasHeaders: true,
              headers: ['State', 'Online Poker Legal', 'In MSIGA Compact', 'Major Operators', 'Unique Feature'],
              rows: [
                ['Nevada', 'Yes (poker only - no casino)', 'Yes', 'WSOP.com, BetMGM Poker', 'Poker-only online market; casino not legal online'],
                ['New Jersey', 'Yes', 'Yes', 'PokerStars, WSOP.com, BetMGM', 'Pioneer; largest NJ player pool'],
                ['Delaware', 'Yes', 'Yes', '888 Poker (state platform)', 'Tiny population; needs compact for viability'],
                ['Michigan', 'Yes', 'Yes', 'PokerStars MI, BetMGM, WSOP', 'Tribal operators included; joined compact 2023'],
                ['Pennsylvania', 'Yes', 'Not yet connected', 'PokerStars PA, BetMGM', 'Authorized for compact; implementation pending'],
                ['West Virginia', 'Yes', 'Not yet connected', 'DraftKings, BetMGM', 'Smallest legal poker market by population']
              ]
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'What is the primary reason that online poker operators need "liquidity" to offer a viable product?',
              tagSlugs: ['online-poker', 'intermediate'],
              choices: [
                'Poker sites need large cash reserves to pay jackpots',
                'Enough active players are needed to fill games across stakes and formats at any given time',
                'Liquidity refers to the speed of financial transactions on poker sites',
                'Poker sites must maintain liquid assets to comply with state reserve requirements'
              ],
              correctAnswer: 'Enough active players are needed to fill games across stakes and formats at any given time',
              solution: 'Liquidity in poker refers to player liquidity - having enough active players to populate games at various stake levels and formats around the clock. Unlike casino games where a player competes against the house, poker requires other players. A site with too few players cannot offer full game variety, creates long wait times, and cannot sustain economically viable tournaments. This is why multi-state compacts that combine player pools across states are essential to US online poker\'s viability.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'Nevada allows its residents to play online casino slots and table games as well as online poker.',
              tagSlugs: ['online-poker', 'nevada', 'beginner'],
              correctAnswer: 'false',
              solution: 'False. Nevada has legalized online poker but has NOT legalized online casino games (slots, table games). This unusual situation reflects the political influence of Nevada\'s land-based casino industry, which supported online poker legalization (to retain players who were going to offshore sites) but opposed online casino legalization (fearing it would cannibalize their slot and table game revenue). Nevada remains the only state where online poker is legal but online casino is not.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'What is a Multi-State Internet Gaming Agreement (MSIGA)?',
              tagSlugs: ['online-poker', 'state-law', 'intermediate'],
              choices: [
                'A federal law authorizing national online poker',
                'An agreement between states allowing their licensed online poker operators to share player pools',
                'A compact between states and tribal operators to co-regulate online poker',
                'An international treaty allowing US poker sites to compete with European platforms'
              ],
              correctAnswer: 'An agreement between states allowing their licensed online poker operators to share player pools',
              solution: 'A MSIGA is an interstate compact that allows licensed online poker operators in member states to combine their player pools - so a player registered in New Jersey can compete at the same table as a player registered in Nevada or Michigan. This is essential for poker viability because it expands the active player base that any single state\'s market could support alone. The current compact connects Nevada, New Jersey, Delaware, and Michigan.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'A federal judge in North Carolina must rule on whether a defendant charged with running an illegal poker room can use the "skill game" defense to argue that poker is not gambling under state law. Outline the strongest arguments on each side of this question.',
              tagSlugs: ['online-poker', 'skill-vs-chance', 'advanced'],
              solution: 'Defense (poker is a skill game): (1) Academic and mathematical evidence shows skilled players win consistently over large sample sizes - impossible in pure chance games. (2) Poker uniquely allows players to fold, bluff, and make strategic decisions that change expected outcomes. (3) Professional poker careers exist and are sustained, which is impossible in games of pure chance. (4) The Poker Players Alliance and academic researchers have produced substantial peer-reviewed evidence of skill dominance. (5) Several courts (including a 2012 Eastern District of NY ruling) have found poker to be predominantly skill. Prosecution (poker is gambling): (1) Per-hand, chance (card distribution) is a significant factor - the dominant factor test should be applied short-term, not over thousands of hands. (2) North Carolina law has traditionally treated poker as gambling and the legislature has not created an exception. (3) Courts typically defer to legislative definitions of gambling. (4) Even skill-dominated games can constitute gambling if they meet the consideration-chance-prize test, which poker does on each hand. (5) Creating a skill exception for poker opens the door to other operators claiming similar exemptions. Most courts have sided with the prosecution position, though the legal debate is genuine.',
              points: 3,
              isPublished: false
            }
          ]
        },

        // ----------------------------------------------------------
        // LESSON 4.2: Daily Fantasy Sports - The Skill Game Carve-Out
        // ----------------------------------------------------------
        {
          title: 'Lesson 4.2: Daily Fantasy Sports (DFS) - The Skill Game That Worked',
          order: 2,
          isPublished: false,

          theoryBlocks: [
            // HOOK
            {
              blockType: 'text',
              content: 'While poker\'s skill game argument has largely failed to exempt it from gambling regulation, **Daily Fantasy Sports** largely succeeded with a nearly identical argument. DraftKings and FanDuel built multi-billion-dollar businesses on the premise that selecting a lineup of real athletes is a skill activity exempt from gambling law - and in most US states, they won that argument. Understanding how DFS achieved this legal status, and how it differs from sports betting in ways that matter legally (rather than just semantically), is essential for understanding the full spectrum of US iGaming law.'
            },

            // WHAT IS DFS
            {
              blockType: 'text',
              content: '**Daily Fantasy Sports** involves participants paying an entry fee to compete in short-duration (usually single-day or single-week) contests in which they assemble a virtual "lineup" of real professional athletes subject to a salary cap. Contestants are awarded points based on the actual statistical performance of their chosen athletes during real games. Contestants compete against other participants, with prizes awarded to those who accumulate the most points. DFS differs from traditional (season-long) fantasy sports in its compressed timeframe - rather than managing a team for an entire season, DFS players compete one slate at a time, enabling participation multiple times per week with real-money stakes.'
            },

            // THE UIGEA CARVE-OUT AND SKILL ARGUMENT
            {
              blockType: 'text',
              content: 'DFS operators successfully claimed two legal foundations for their products. First, the **UIGEA fantasy sports exemption** (discussed in Module 2) exempts qualifying fantasy sports from the definition of unlawful internet gambling for payment processing purposes. Second, and more broadly, DFS operators argued that their contests are **games of skill** exempt from state gambling laws. The skill arguments for DFS are strong: expert DFS players (called "sharks") consistently outperform beginners through superior player evaluation, lineup construction strategy, and game-theory optimal entry strategies in tournament formats. A 2020 study found that the top 1% of DFS players accounted for a disproportionate percentage of all winnings - a pattern consistent with skill dominance.'
            },

            // THE DRAFTKINGS/FANDUEL CRISIS OF 2015
            {
              blockType: 'text',
              content: 'The DFS industry faced its greatest legal crisis in **October 2015** when an inside-information scandal erupted. A DraftKings employee was found to have used non-public ownership data from his own platform to win $350,000 on FanDuel in the same week. The scandal prompted massive media scrutiny and triggered a wave of **state attorney general investigations**. New York AG Eric Schneiderman issued a cease-and-desist letter to both DraftKings and FanDuel, arguing that DFS was illegal gambling under New York law. Nevada\'s Gaming Control Board declared DFS to be gambling requiring a gaming license. The industry went from a $1 billion valuation darling to an existential legal crisis in a matter of weeks.'
            },

            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'US map showing DFS legal status by state. Color coding: Dark green = DFS explicitly legal by statute; light green = DFS legal under general skill game laws or no prohibition; yellow = legal with restrictions or pending legislation; orange = legal gray area (no explicit law either way); red = DFS specifically prohibited or AG has ruled illegal (historically: Washington State). Include a legend. Add a callout box showing "~40+ states where DFS is explicitly legal or permitted" and "Key states: NY (legalized 2016 after initial ban), NV (requires gaming license)". Clean political map style.',
              align: 'center',
              width: 'md'
            },

            // STATE RESPONSES TO DFS
            {
              blockType: 'text',
              content: 'The 2015 DFS crisis forced states to formally address the legal status of daily fantasy sports. Responses varied dramatically:\n\n- **Explicit legalization** (most states): Legislatures passed specific DFS bills that defined DFS as a skill contest, established registration or licensing requirements, set consumer protection rules, and collected small fees or taxes from operators.\n- **Nevada approach**: Treated DFS as gambling requiring a full gaming license - a standard DraftKings and FanDuel initially declined to meet, exiting Nevada before eventually returning.\n- **Washington State**: Maintained that DFS is illegal gambling under state law. DraftKings and FanDuel blocked Washington players.\n- **No action** (several states): DFS operates in a legal gray area without explicit authorization or prohibition, operators proceed on a risk-managed basis.\n\nBy 2024, roughly 40+ states have either explicitly legalized DFS or allow it without prohibition.'
            },

            // DFS VS SPORTS BETTING - THE KEY LEGAL DISTINCTIONS
            {
              blockType: 'text',
              content: 'The legal distinction between DFS and sports betting is important to understand precisely, because the two products are now offered by the same companies (DraftKings and FanDuel) and serve similar customer appetites:\n\n- **DFS**: Compete against other players; outcome based on aggregate athlete performance across a slate; no single-game outcome determines result; skill in lineup construction is the primary differentiator\n- **Sports betting**: Compete against the house (sportsbook); outcome based on single game or event results; point spreads, moneylines, and totals based on single real-world outcomes; operator profit comes from the vig/juice\n\nThe UIGEA DFS exemption specifically prohibits outcomes based solely on a single athlete\'s performance or a single team\'s score - which is precisely what sports betting is based on. This statutory distinction has held up even as the practical boundary between the two products has blurred with same-game parlays, prop bets, and other innovations.'
            },

            {
              blockType: 'callout',
              variant: 'tip',
              title: 'DraftKings and FanDuel: From DFS Specialists to Full Gaming Companies',
              content: 'DraftKings and FanDuel both began as pure DFS companies and used DFS as their legal and commercial beachhead into the US market. After Murphy v. NCAA (2018), both companies pivoted aggressively to sports betting and online casino, using their DFS-built customer bases and regulatory relationships as competitive advantages. DraftKings is now a publicly traded company (DKNG) and one of the largest online gambling operators in the US, with DFS now representing a relatively small portion of overall revenue.'
            },

            {
              blockType: 'table',
              caption: 'DFS vs. Sports Betting: Legal Distinctions',
              hasHeaders: true,
              headers: ['Factor', 'Daily Fantasy Sports (DFS)', 'Sports Betting'],
              rows: [
                ['Competition structure', 'Player vs. player (tournament or head-to-head)', 'Player vs. house (sportsbook)'],
                ['Outcome basis', 'Aggregate athlete stats across multiple games', 'Single game/event result'],
                ['Operator profit mechanism', 'Entry fee rake (typically 10-15%)', 'Vig/juice built into odds'],
                ['UIGEA treatment', 'Exempted as fantasy sports', 'Subject to UIGEA (not exempted)'],
                ['Dominant legal argument', 'Skill game (lineup construction strategy)', 'Gambling (outcome chance-based)'],
                ['States where legal', '40+ states', '35+ states']
              ]
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'What event in October 2015 triggered the first major legal crisis for the DFS industry?',
              tagSlugs: ['dfs', 'intermediate'],
              choices: [
                'The DOJ issued a formal opinion that DFS violates the Wire Act',
                'A DraftKings employee used non-public data from his own platform to win money on FanDuel',
                'Congress introduced legislation to ban DFS under UIGEA',
                'A federal court ruled that DFS constitutes illegal gambling under Nevada law'
              ],
              correctAnswer: 'A DraftKings employee used non-public data from his own platform to win money on FanDuel',
              solution: 'In October 2015, a DraftKings employee was found to have used non-public player ownership data from DraftKings to gain an unfair advantage and win $350,000 on FanDuel in the same week. The scandal raised integrity concerns about DFS operators, triggered state attorney general investigations, and prompted New York AG Eric Schneiderman to issue a cease-and-desist order against both companies, creating an existential legal crisis for the industry.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'Under UIGEA, a DFS contest where the prize pool is based on a single athlete\'s performance in a single real-world event qualifies for the fantasy sports exemption.',
              tagSlugs: ['dfs', 'uigea', 'intermediate'],
              correctAnswer: 'false',
              solution: 'False. The UIGEA fantasy sports exemption explicitly requires that no outcome be based solely on any single athlete\'s performance in a single real-world event, and no outcome be based on the score, point spread, or performance of a single real-world team. A contest based on a single athlete\'s single-game performance would resemble a sports prop bet more than a fantasy contest and would NOT qualify for the UIGEA exemption. DFS contests must be based on aggregate performance across multiple players.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'How does Nevada treat DFS differently from most other states?',
              tagSlugs: ['dfs', 'nevada', 'intermediate'],
              choices: [
                'Nevada has completely banned DFS as illegal gambling',
                'Nevada classifies DFS as a skill game exempt from all gambling regulation',
                'Nevada requires DFS operators to obtain a full gaming license',
                'Nevada allows DFS only for Nevada residents physically in the state'
              ],
              correctAnswer: 'Nevada requires DFS operators to obtain a full gaming license',
              solution: 'The Nevada Gaming Control Board determined that DFS constitutes gambling that requires a full Nevada gaming license to operate. This is a much higher regulatory bar than most states that have simply passed DFS-specific skill game legislation. DraftKings and FanDuel initially withdrew from Nevada rather than seek gaming licenses, before eventually returning with proper licensing. Nevada\'s approach reflects its strict gaming regulatory culture where any activity resembling gambling is brought within the formal licensing framework.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'As same-game parlays, player prop bets, and other sports betting innovations begin to look increasingly like DFS (multiple player performances, aggregate outcomes), and DFS "pick\'em" contests begin to look increasingly like sports betting (selecting over/under on individual athlete statistics), is the legal distinction between DFS and sports betting sustainable? Analyze the blurring boundary.',
              tagSlugs: ['dfs', 'sports-betting', 'skill-vs-chance', 'advanced'],
              solution: 'The legal distinction is under genuine stress. Traditional DFS (lineup construction against other players) remains legally distinct from sports betting (house-banked outcome wagering). But the product boundaries are blurring rapidly. DFS "pick\'em" products (offered by PrizePicks, Underdog, Sleeper) ask players to select whether individual athletes will beat or miss statistical thresholds - essentially sports prop bets structured as player-vs-player contests to claim the DFS exemption. Sports betting same-game parlays aggregate multiple player performances in ways that resemble DFS scoring. Several state regulators (most notably Michigan and Ohio) have begun scrutinizing pick\'em products as potential illegal sports betting operating without a sports betting license. The sustainability of the distinction depends on: (1) how courts and regulators apply the UIGEA criteria - particularly whether pick\'em products truly avoid "single athlete single event" outcomes; (2) whether state legislatures clarify their DFS laws to include or exclude pick\'em; and (3) whether DFS-licensed operators can successfully argue that any player-vs-player format qualifies regardless of its structural similarity to sports betting. The trend suggests increasing regulatory pressure on the DFS/sports betting boundary, with eventual clarification likely required from either courts or legislatures.',
              points: 3,
              isPublished: false
            }
          ]
        },

        // ----------------------------------------------------------
        // LESSON 4.3: Prediction Markets - The New Frontier
        // ----------------------------------------------------------
        {
          title: 'Lesson 4.3: Prediction Markets - CFTC, Event Contracts, and the New Frontier',
          order: 3,
          isPublished: false,

          theoryBlocks: [
            // HOOK
            {
              blockType: 'text',
              content: 'Prediction markets are the most legally novel product in the US iGaming landscape - and arguably the most intellectually fascinating. Unlike casino games, sports betting, poker, or DFS, prediction markets are regulated not as gambling but as **financial instruments** by the **Commodity Futures Trading Commission (CFTC)**. They bypass state gambling laws almost entirely, operating in federal regulatory space. Companies like **Kalshi, PredictIt, Polymarket, and Robinhood Markets** have pushed prediction markets into the mainstream, creating billion-dollar markets for contracts on everything from elections to Federal Reserve interest rate decisions to the Academy Awards. Understanding this product means understanding a completely different regulatory universe.'
            },

            // WHAT PREDICTION MARKETS ARE
            {
              blockType: 'text',
              content: 'A **prediction market** (also called an **event contract** or **binary options market**) allows participants to buy and sell contracts whose value depends on the outcome of a real-world event. For example:\n\n- A contract that pays **$1 if Candidate A wins the presidential election** and **$0 if they lose**\n- A contract that pays **$1 if the Federal Reserve raises rates** at its next meeting and **$0 if it holds rates flat**\n- A contract that pays **$1 if a particular company reports earnings above $2.50 per share** and **$0 if below**\n\nParticipants can buy contracts at current market prices (which reflect collective probability assessments) and sell them before resolution. The market price of the contract at any moment reflects the crowd\'s consensus probability of the event occurring. If a candidate\'s contract trades at $0.65, the market believes there is a 65% chance they will win.'
            },

            // THE CFTC FRAMEWORK
            {
              blockType: 'text',
              content: 'The **Commodity Futures Trading Commission (CFTC)** regulates financial derivatives markets under the **Commodity Exchange Act (CEA)**. Under the CEA, a contract for the purchase or sale of a commodity for future delivery is a "futures contract" subject to CFTC regulation. The CFTC has long recognized that event contracts - where the payout depends on a real-world event rather than a commodity price - fall within its jurisdiction. To legally offer event contracts to US participants, an exchange must register with the CFTC as a **Designated Contract Market (DCM)** or operate under a CFTC exemption. **Kalshi** was the first US company to receive CFTC DCM designation specifically for event contracts, a milestone achieved in 2020 after years of regulatory engagement.'
            },

            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Diagram comparing the regulatory frameworks for prediction markets vs. sports betting. Left column: Prediction Markets - regulated by CFTC as event contracts/derivatives under the Commodity Exchange Act; federal regulatory jurisdiction; applies nationwide; examples: Kalshi, PredictIt. Right column: Sports Betting - regulated by state gaming commissions as gambling under state gambling statutes; state-by-state regulatory jurisdiction; legal in 35+ states; examples: DraftKings Sportsbook, FanDuel Sportsbook. Center: show products they can both cover (sports outcomes, economic indicators). Bottom: list key legal distinctions: "Prediction Markets bypass state gambling law" vs "Sports Betting requires state-level legalization." Clean split-column infographic.',
              align: 'center',
              width: 'lg'
            },

            // KALSHI AND THE ELECTION MARKETS BATTLE
            {
              blockType: 'text',
              content: 'The most contentious chapter in US prediction market history unfolded in 2024 when **Kalshi** applied to the CFTC to offer contracts on the outcome of **US congressional elections**. The CFTC initially rejected the application, arguing that election contracts could involve gaming or manipulation contrary to the public interest - a specific CEA disqualification. Kalshi sued the CFTC. In September 2024, the **DC Circuit Court of Appeals** ruled in Kalshi\'s favor, holding that the CFTC had not adequately justified its rejection. Kalshi launched US election contracts immediately after the ruling. By election day 2024, hundreds of millions of dollars in election contracts were trading on Kalshi, making it the largest real-money prediction market for US elections in history. This case fundamentally expanded what prediction markets can cover.'
            },

            // PREDICTIT AND THE ACADEMIC EXCEPTION
            {
              blockType: 'text',
              content: '**PredictIt** operates under a different and increasingly precarious legal framework. PredictIt is run by Victoria University of Wellington (New Zealand) under a **CFTC no-action letter** issued in 2014, which allowed the site to operate for academic research purposes with limited position sizes ($850 maximum per contract) and limited markets. The CFTC threatened to revoke PredictIt\'s no-action letter in 2022, citing mission creep beyond academic research - the site had grown far beyond a research tool. After significant legal and political battles, PredictIt negotiated to continue operating under enhanced conditions. PredictIt\'s uncertain status highlights the fragility of operating under regulatory exceptions rather than full licensing.'
            },

            // POLYMARKET AND OFFSHORE PREDICTION MARKETS
            {
              blockType: 'text',
              content: '**Polymarket** is the world\'s largest prediction market by trading volume, but it operates offshore (from the Bahamas) and is technically unavailable to US residents - though enforcement is effectively impossible and many Americans use it via VPNs or crypto wallets. Polymarket settles contracts in USDC cryptocurrency on blockchain networks, fully bypassing the traditional financial system and CFTC oversight. Polymarket was fined $1.4 million by the CFTC in 2022 for failing to register as a DCM and serving US customers. The fine was paid and Polymarket geo-blocked US users - but its global trading volumes (exceeding $1 billion in contracts during the 2024 US elections) demonstrate the massive appetite for prediction market products that US regulatory frameworks have not yet fully accommodated.'
            },

            {
              blockType: 'callout',
              variant: 'info',
              title: 'Prediction Markets vs. Sports Betting: Can They Coexist?',
              content: 'Prediction markets and sports betting are converging products. Kalshi and other CFTC-regulated exchanges now offer contracts on major sporting events - who will win the Super Bowl, NBA Finals outcomes - that are economically identical to sports betting but regulated as financial derivatives rather than gambling. This creates a fascinating regulatory arbitrage: the exact same bet on the same sporting outcome can be legal nationwide through a CFTC-regulated prediction market, while being illegal in states without sports betting legalization through a traditional sportsbook. This inconsistency may force either a legal resolution or Congressional action.'
            },

            {
              blockType: 'table',
              caption: 'Major US Prediction Market Operators Compared',
              hasHeaders: true,
              headers: ['Platform', 'Regulatory Status', 'US Availability', 'Contract Types', 'Settlement'],
              rows: [
                ['Kalshi', 'CFTC-regulated DCM (licensed)', 'Available to US residents', 'Politics, economics, entertainment, sports', 'USD'],
                ['PredictIt', 'CFTC no-action letter (academic)', 'Available with $850 position limit', 'Politics, policy', 'USD'],
                ['Polymarket', 'Offshore (CFTC fined; US blocked)', 'Technically blocked, widely accessed via VPN/crypto', 'Politics, economics, sports, crypto', 'USDC crypto'],
                ['Robinhood Markets', 'CFTC-regulated (launched 2024)', 'Available to US residents', 'Politics, economics', 'USD'],
                ['CFTC-exempt small exchanges', 'Various exemptions', 'Limited/variable', 'Varies', 'Varies']
              ]
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Which federal regulatory agency oversees prediction markets in the United States?',
              tagSlugs: ['prediction-markets', 'cftc', 'beginner'],
              choices: [
                'The Securities and Exchange Commission (SEC)',
                'The Federal Reserve',
                'The Commodity Futures Trading Commission (CFTC)',
                'The Department of Justice (DOJ)'
              ],
              correctAnswer: 'The Commodity Futures Trading Commission (CFTC)',
              solution: 'Prediction markets are regulated by the CFTC as event contracts under the Commodity Exchange Act (CEA). This federal financial regulatory framework means prediction markets bypass state gambling laws entirely - they are regulated as financial derivatives, not as gambling. The CFTC requires prediction market operators to register as Designated Contract Markets (DCMs). Kalshi was the first company to obtain this designation specifically for event contracts.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'A CFTC-regulated prediction market offering contracts on sporting event outcomes is operating as an unlicensed sportsbook under state sports betting laws.',
              tagSlugs: ['prediction-markets', 'sports-betting', 'advanced'],
              correctAnswer: 'false',
              solution: 'False - but this is genuinely contested. CFTC-regulated prediction markets argue that their event contracts are regulated as financial derivatives under federal law, which preempts state gambling regulation. Under this theory, a Kalshi contract on who wins the Super Bowl is a CFTC-regulated derivatives contract, not a sports bet subject to state gaming law. Some state regulators dispute this, arguing that the substance of the transaction is sports betting regardless of how it is labeled. No court has fully resolved this question, making it one of the most active areas of iGaming legal development.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'What was the outcome of Kalshi\'s 2024 lawsuit against the CFTC over election contracts?',
              tagSlugs: ['prediction-markets', 'intermediate'],
              choices: [
                'The CFTC won; election contracts remain prohibited in the US',
                'Kalshi won; the DC Circuit ruled the CFTC had not adequately justified its rejection',
                'The case was settled; Kalshi agreed to limit election contracts to non-federal races',
                'The Supreme Court took the case and is expected to rule in 2025'
              ],
              correctAnswer: 'Kalshi won; the DC Circuit ruled the CFTC had not adequately justified its rejection',
              solution: 'In September 2024, the DC Circuit Court of Appeals ruled in Kalshi\'s favor, holding that the CFTC had not adequately justified its rejection of Kalshi\'s application to offer US congressional election contracts. Kalshi launched election contracts immediately after the ruling. By election day 2024, hundreds of millions of dollars in contracts were trading on Kalshi\'s platform, making it the largest real-money prediction market for a US election in history.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Kalshi and traditional sportsbooks like DraftKings both allow users to bet on who will win a major sporting event, but they are regulated completely differently. Analyze the legal, economic, and public policy implications of this regulatory inconsistency.',
              tagSlugs: ['prediction-markets', 'sports-betting', 'cftc', 'advanced'],
              solution: 'Legal implications: Kalshi operates under federal CFTC jurisdiction, accessible nationwide without state-by-state licensing. DraftKings operates under state gaming authority, requiring separate licenses in each jurisdiction. This means a consumer in Texas (where sports betting is illegal) can legally use Kalshi to bet on the same Super Bowl outcome they cannot legally bet on through DraftKings. This regulatory arbitrage may be challenged by state gaming regulators arguing that substance should determine jurisdiction, not form. Economic implications: CFTC-regulated markets have different cost structures than state-licensed sportsbooks (lower compliance costs, no state-specific license fees, but CFTC registration requirements). Prediction markets typically offer narrower lines with no vig/juice (market-determined prices), while sportsbooks embed a spread. Long-term, CFTC-regulated markets could attract price-sensitive bettors and create competitive pressure on sportsbook margins. Public policy implications: The inconsistency undermines state authority over gambling and the tax revenue states derive from sports betting licensing. It raises questions about whether the CFTC or state gaming commissions are better equipped to protect consumers in gambling-adjacent markets. Congressional action may eventually be needed to clarify jurisdiction, either by explicitly bringing prediction market sporting contracts under state gambling law or by establishing a clear federal regulatory framework.',
              points: 3,
              isPublished: false
            }
          ]
        },

        // ----------------------------------------------------------
        // LESSON 4.4: Tribal Gaming & IGRA - A Parallel Universe
        // ----------------------------------------------------------
        {
          title: 'Lesson 4.4: Tribal Gaming & IGRA - A Parallel Regulatory Universe',
          order: 4,
          isPublished: false,

          theoryBlocks: [
            // HOOK
            {
              blockType: 'text',
              content: 'The United States has not one gambling regulatory system - it has at least two that operate in parallel, sometimes cooperatively and sometimes in conflict. Alongside the federal-state framework we have examined for commercial gambling, there exists a completely separate framework for **tribal gaming** governed by the **Indian Gaming Regulatory Act (IGRA)**. Tribal gaming is a $41 billion annual industry (exceeding commercial casino revenues in some years), operating under sovereignty-based legal principles that create both special rights and special complexities. For anyone working in US iGaming, understanding tribal gaming is not optional - tribes are central players in the politics, economics, and law of US gambling in virtually every state.'
            },

            // TRIBAL SOVEREIGNTY - THE FOUNDATION
            {
              blockType: 'text',
              content: '**Tribal sovereignty** is the bedrock principle underlying all of tribal gaming law. Federally recognized Native American tribes are considered **domestic dependent nations** with a government-to-government relationship with the United States. This means tribes have inherent sovereign authority to govern themselves - including regulating activities on their own lands. States traditionally have limited authority to enforce their civil regulatory laws on tribal lands. This principle was established clearly in *California v. Cabazon Band* (1987), where the Supreme Court held that California could not apply its gambling regulations to tribal bingo and card rooms operating on tribal land, because those regulations were civil-regulatory rather than criminal-prohibitory in nature.'
            },

            // IGRA STRUCTURE
            {
              blockType: 'text',
              content: 'Congress responded to *Cabazon* by passing IGRA in 1988, creating a three-class framework designed to balance tribal sovereignty against state interests and ensure gaming integrity:\n\n- **Class I Gaming** (traditional ceremonial games, social gaming with small prizes): Exclusively regulated by tribes, no state or federal involvement required.\n- **Class II Gaming** (bingo and non-banked card games like certain poker formats): Regulated by tribes and the National Indian Gaming Commission (NIGC), a federal regulatory body. States have no formal role, though the game must not be "specifically prohibited" by state law.\n- **Class III Gaming** (everything else: slot machines, banked table games, sports betting, lotteries): Legal only pursuant to a **tribal-state compact** negotiated between the tribe and the state government.'
            },

            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Three-tier pyramid diagram showing IGRA gaming classes. Bottom tier (widest): Class I - Traditional and ceremonial games, regulated by tribe only, minimal commercial significance. Middle tier: Class II - Bingo, non-banked card games, regulated by tribe + NIGC (National Indian Gaming Commission), no state compact required, commercially significant (tribal bingo halls, some poker). Top tier (smallest, most commercially significant): Class III - Slot machines, table games, sports betting, requires tribal-state compact, regulated by tribe + state + federal oversight, the vast majority of tribal casino revenue. Show dollar amounts: Class III = ~95% of $41B tribal gaming revenue. Use distinct colors for each tier.',
              align: 'center',
              width: 'md'
            },

            // TRIBAL-STATE COMPACTS
            {
              blockType: 'text',
              content: '**Tribal-state compacts** are the negotiated agreements that authorize Class III gaming. These compacts can be extraordinarily complex legal documents covering: permitted games and devices, regulatory jurisdiction and oversight responsibilities, technical standards for gaming equipment, background investigation requirements for tribal gaming employees, revenue sharing with the state (tribes often pay a percentage of gaming revenue to the state as a compact condition), dispute resolution procedures, and exclusivity provisions. Many tribes negotiate **exclusivity** as a compact condition - in exchange for revenue sharing, the tribe receives exclusive rights to offer certain games (typically slot machines and table games) in a defined geographic area, preventing commercial competition. This exclusivity is economically valuable and is the reason many tribes vehemently oppose online gambling expansion by non-tribal operators.'
            },

            // IGRA'S GOOD-FAITH NEGOTIATION REQUIREMENT
            {
              blockType: 'text',
              content: 'IGRA requires states to negotiate compacts with tribes in **good faith**. If a state refuses to negotiate or fails to negotiate in good faith, a tribe can sue the state in federal court. However, the Supreme Court ruled in *Seminole Tribe v. Florida* (1996) that the 11th Amendment bars tribes from suing states in federal court without the state\'s consent. Congress attempted to create an alternative mechanism, but its effectiveness has been limited. In practice, compact negotiations can stall for years when states and tribes disagree on revenue sharing rates, game authorizations, or other terms. Some tribes have pursued Class II gaming strategies specifically to avoid dependence on state compact cooperation.'
            },

            // THE SEMINOLE COMPACT AND ONLINE GAMBLING
            {
              blockType: 'text',
              content: 'Florida\'s **Seminole Compact** (signed by Governor DeSantis in 2021) represents the most ambitious attempt to extend IGRA into online gambling. Under the compact, the Seminole Tribe was granted the right to offer **statewide mobile sports betting** through apps that route bets through servers on tribal land. The "**hub and spoke**" legal theory: regardless of where the bettor sits, the bet is consummated at the server on tribal land, making it gaming "on Indian lands" under IGRA. A federal district court initially struck down the compact\'s online gambling provisions, but the **DC Circuit Court of Appeals reversed** in 2023, upholding the compact. The Supreme Court declined to review the DC Circuit\'s ruling, leaving the Seminole Compact intact. If widely adopted, this model could enable tribes across the country to offer statewide online gambling without state legislative authorization, fundamentally reshaping the US iGaming landscape.'
            },

            // TRIBAL GAMING REGULATORY BODIES
            {
              blockType: 'text',
              content: 'Tribal gaming is regulated by multiple overlapping bodies:\n\n1. **National Indian Gaming Commission (NIGC)**: Federal agency with oversight authority over Class II gaming and approval authority over tribal gaming ordinances and management contracts. The NIGC can issue fines and shutdowns.\n2. **Tribal Gaming Regulatory Authorities (TGRAs)**: Each tribe must establish its own gaming regulatory body, which handles day-to-day licensing, compliance, and enforcement on tribal gaming operations.\n3. **State Gaming Commissions**: For Class III gaming, states have a role defined by the compact - which varies from minimal oversight to substantial regulatory involvement.\n4. **Federal Bureau of Investigation (FBI)**: Investigates major gaming crimes and corruption on tribal lands.\n\nThis multi-layered regulatory structure means tribal gaming facilities may be subject to simultaneous oversight by their own tribal regulators, the state gaming commission, and federal authorities.'
            },

            {
              blockType: 'callout',
              variant: 'warning',
              title: 'Tribal Gaming and Online Expansion: The Tension',
              content: 'Many tribes view commercial online gambling expansion as a direct economic threat to their land-based casino revenues. If players can access online casino games from home, they may visit tribal casinos less frequently. This is why tribal organizations have been among the most powerful opponents of online casino legalization in states like California. At the same time, tribes that have successfully negotiated online rights (as in Michigan and Connecticut) have become advocates for online expansion - demonstrating that tribal opposition to online gambling is about economics and compact terms, not principled opposition to the product itself.'
            },

            {
              blockType: 'table',
              caption: 'IGRA Regulatory Structure Summary',
              hasHeaders: true,
              headers: ['Factor', 'Class II Gaming', 'Class III Gaming'],
              rows: [
                ['Examples', 'Bingo, non-banked card games (some poker)', 'Slot machines, blackjack, roulette, sports betting'],
                ['State compact required', 'No', 'Yes - tribal-state compact mandatory'],
                ['Federal regulator', 'NIGC (active oversight)', 'NIGC (limited; compact-based)'],
                ['State role', 'None formally (game must not be state-prohibited)', 'Negotiated in compact; varies significantly'],
                ['Revenue sharing to state', 'Typically none', 'Often required as compact condition'],
                ['Exclusivity possible', 'Limited', 'Yes - often negotiated in compact']
              ]
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Which Supreme Court case established that states cannot apply their civil gambling regulations to tribal gaming operations on tribal land?',
              tagSlugs: ['tribal-gaming', 'igra', 'intermediate'],
              choices: [
                'Murphy v. NCAA (2018)',
                'Seminole Tribe v. Florida (1996)',
                'California v. Cabazon Band (1987)',
                'New York v. United States (1992)'
              ],
              correctAnswer: 'California v. Cabazon Band (1987)',
              solution: 'California v. Cabazon Band (1987) established that states cannot apply civil-regulatory gambling laws to tribal gaming on tribal lands. The Court distinguished between criminal-prohibitory laws (which states can enforce on tribal lands) and civil-regulatory laws (which they generally cannot). Since California\'s gambling law was civil-regulatory (gambling was permitted in some forms), it could not be applied to tribal bingo and card rooms. This ruling directly led Congress to pass IGRA in 1988 to create a regulatory framework for tribal gaming.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'Under IGRA, a tribe can offer slot machines on its land without negotiating a tribal-state compact as long as the tribe\'s gaming ordinance is approved by the NIGC.',
              tagSlugs: ['tribal-gaming', 'igra', 'intermediate'],
              correctAnswer: 'false',
              solution: 'False. Slot machines are Class III gaming under IGRA, and Class III gaming requires a tribal-state compact - there is no way to offer Class III games without one. Only Class II games (bingo, non-banked card games) can be offered without a state compact, as long as the game is not specifically prohibited by state law and the NIGC approves the tribal gaming ordinance. This distinction is why some tribes have strategically pursued Class II gaming strategies when compact negotiations with states stall.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'What is the "hub and spoke" theory as applied in the Florida Seminole Compact for online sports betting?',
              tagSlugs: ['tribal-gaming', 'igra', 'sports-betting', 'advanced'],
              choices: [
                'The theory that tribal casinos can serve as distribution hubs for online gambling licenses across the state',
                'The theory that a bet placed remotely is legally consummated at the server location on tribal land, making it gaming "on Indian lands"',
                'The theory that states must allow tribes to operate online gambling if they allow commercial operators to do so',
                'The theory that tribal sovereignty extends to all commercial online gambling within a state where tribes have compact rights'
              ],
              correctAnswer: 'The theory that a bet placed remotely is legally consummated at the server location on tribal land, making it gaming "on Indian lands"',
              solution: 'The hub and spoke theory argues that when a player bets through an online app on a tribal gaming platform, the bet is legally consummated at the server - located on tribal land (the "hub") - regardless of where the player physically sits (using their device as a "spoke"). Under this theory, statewide mobile sports betting through tribal servers constitutes gaming "on Indian lands" under IGRA, potentially allowing tribes to offer statewide online gambling under their existing compact authority. The DC Circuit upheld this theory in the Florida Seminole Compact case.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Explain why tribal gaming interests are sometimes opponents and sometimes allies of commercial online gambling expansion, using specific examples to support your analysis.',
              tagSlugs: ['tribal-gaming', 'igra', 'online-casino', 'advanced'],
              solution: 'Tribal interests are neither uniformly for nor against online gambling - their position depends on whether online expansion threatens or enhances their competitive position. Opposition examples: In California, tribal gaming interests (particularly large compact tribes with valuable exclusivity rights) spent hundreds of millions opposing online sports betting ballot measures in 2022, fearing that commercial mobile betting would cannibalize their land-based casino revenues and undermine the exclusivity they paid for through revenue sharing. In many states, tribes have lobbied against online casino bills for similar reasons. Support/ally examples: In Michigan, tribes were included in the 2019 online gambling legislation on equal terms with commercial operators, turning potential opponents into allies and achieving successful legalization. In Connecticut, the Mohegan and Mashantucket Pequot tribes received exclusive online gambling rights as part of their new compact with the state, making them the primary online casino operators. The Florida Seminole Tribe supported the 2021 compact that granted them statewide online sports betting rights, transforming a large tribe into an online gambling operator. The pattern: tribes oppose online expansion when excluded from it (it threatens their monopoly without compensation) and support it when they have equal or preferential access (it extends their market). This explains why the most successful US online gambling legislation has found ways to incorporate tribal interests.',
              points: 3,
              isPublished: false
            }
          ]
        }
      ]
    }
  ]
};
