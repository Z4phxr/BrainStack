// data/courses/us-igaming-law-course.js
// Modules 1-2: The Big Picture + Federal Laws

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
    // MODULE 1: THE BIG PICTURE - HOW US LAW WORKS
    // =========================================================
    {
      title: 'Module 1: The Big Picture - How US Law Works',
      order: 1,
      isPublished: false,

      lessons: [
        // ----------------------------------------------------------
        // LESSON 1.1: The US Legal System - Federal vs. State Power
        // ----------------------------------------------------------
        {
          title: 'Lesson 1.1: The US Legal System - Federal vs. State Power',
          order: 1,
          isPublished: false,

          theoryBlocks: [
            // HOOK
            {
              blockType: 'text',
              content: 'Why can you legally bet on sports from your phone in New Jersey, but doing the exact same thing in Texas could get you arrested? Why is online poker legal in Nevada but online casino slots are not? Why do some Native American tribes operate massive casinos under completely different rules than everyone else? The answer to all of these questions comes down to one fundamental feature of American governance: **the division of power between the federal government and the 50 individual states**. To understand US iGaming law, you must first understand how American law itself is structured.'
            },

            // THE CONSTITUTION AS THE FOUNDATION
            {
              blockType: 'text',
              content: 'The United States Constitution is the supreme law of the land. Everything else - every federal statute, every state law, every court ruling - must operate within its boundaries. The Constitution created a system of **federalism**: a division of governmental authority between a central (federal) government and individual state governments. This was a deliberate design choice by the Founding Fathers, who were deeply suspicious of concentrated power. As a result, the US ended up with not one legal system, but effectively **51 overlapping legal systems** (one federal + 50 states), each with the power to regulate different aspects of life.'
            },

            // THE 10TH AMENDMENT - KEY TO GAMBLING LAW
            {
              blockType: 'text',
              content: 'The **10th Amendment** to the Constitution is perhaps the single most important provision for understanding gambling law. It reads: "The powers not delegated to the United States by the Constitution, nor prohibited by it to the States, are reserved to the States respectively, or to the people." In plain English: if the Constitution does not give the federal government a specific power, that power belongs to the states. The Constitution never mentions gambling. Therefore, regulating gambling has historically been considered a **state power** - which is why gambling laws vary so dramatically from state to state. This principle became the centerpiece of the landmark 2018 Supreme Court case *Murphy v. NCAA*, which we will cover in depth later.'
            },

            // THE COMMERCE CLAUSE - FEDERAL REACH INTO GAMBLING
            {
              blockType: 'text',
              content: 'So if gambling is a state matter, how does the federal government get involved at all? The answer is the **Commerce Clause** (Article I, Section 8 of the Constitution), which gives Congress the power to regulate commerce "among the several States." When gambling crosses state lines - such as placing a bet over the internet, which travels through wires and servers in multiple states - the federal government gains constitutional authority to act. This is how federal gambling laws like the Wire Act (1961) and UIGEA (2006) came into existence. The internet, which is inherently interstate, significantly expanded the federal government\'s ability to regulate online gambling.'
            },

            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Diagram showing the US federalism structure as it applies to gambling law. Top level: US Constitution (supreme law). Two branches below: Federal Government (left) with powers from Commerce Clause, and State Governments (right) with reserved powers from 10th Amendment. Below Federal: show federal gambling laws (Wire Act, UIGEA, PASPA). Below States: show examples of state gambling laws (NJ online casino, NV poker, TX no online gambling). Use arrows to show where jurisdiction overlaps. Clean infographic style with labels.',
              align: 'center',
              width: 'lg'
            },

            // THE HIERARCHY OF LAW
            {
              blockType: 'text',
              content: 'American law operates in a clear hierarchy known as the **Supremacy Clause** (Article VI of the Constitution). The hierarchy works as follows:\n\n1. **US Constitution** - supreme law, overrides everything\n2. **Federal statutes** (laws passed by Congress) - override state law when there is a conflict\n3. **Federal regulations** (rules issued by federal agencies like the DOJ or CFTC) - have force of law within their domain\n4. **State constitutions** - supreme within each state, but subordinate to federal law\n5. **State statutes** (laws passed by state legislatures) - can be more restrictive than federal law, but cannot conflict with it\n6. **State regulations** (rules issued by state agencies like gaming commissions) - most granular layer\n\nFor iGaming operators, this hierarchy means you must simultaneously comply with **all applicable layers** - federal law sets the floor, and states can build on top of it.'
            },

            // PREEMPTION - CRITICAL CONCEPT
            {
              blockType: 'text',
              content: '**Federal preemption** is the doctrine that federal law supersedes (overrides) conflicting state law. There are two types relevant to gambling:\n\n- **Express preemption**: Congress explicitly states that federal law overrides state law. PASPA (the sports betting ban struck down in 2018) was a classic example - it expressly prohibited states from legalizing sports betting.\n- **Implied preemption**: Even without express language, federal law can preempt state law if Congress clearly intended to occupy an entire field, or if state and federal law directly conflict.\n\nUnderstanding preemption is critical because it explains why states cannot simply legalize anything they want. A state cannot, for example, legalize interstate wire fraud just because it passes a state law saying so. The federal Wire Act still applies.'
            },

            {
              blockType: 'callout',
              variant: 'tip',
              title: 'The Golden Rule of US iGaming Compliance',
              content: 'When analyzing whether any iGaming activity is legal, always ask TWO questions: (1) Does federal law prohibit this? (2) Does state law permit this? You need a "yes" on question 2 AND a "no" on question 1 to operate legally. Federal prohibition always wins.'
            },

            // COURTS AND HOW LAW GETS INTERPRETED
            {
              blockType: 'text',
              content: 'Laws as written by Congress or state legislatures are often ambiguous - courts interpret what they mean. The **federal court system** has three tiers: District Courts (trial level), Courts of Appeals (12 regional circuits), and the Supreme Court. Supreme Court decisions are binding on everyone in the US. This matters enormously for iGaming: the Supreme Court\'s 2018 decision in *Murphy v. NCAA* invalidated a federal law and opened the door to legal sports betting across the country. A single Supreme Court ruling can transform the entire regulatory landscape overnight.'
            },

            // WHAT THIS MEANS FOR IGAMING
            {
              blockType: 'text',
              content: 'The result of this complex system for iGaming is a **patchwork of laws** that is arguably the most complicated gambling regulatory environment in the world. An operator offering online casino games must navigate: federal laws that apply everywhere, the specific state laws of every state where their players are located, tribal gaming compacts in states with tribal casinos, and multiple regulatory agencies at both levels. This complexity is not an accident - it is a direct product of American constitutional design. Understanding the architecture before memorizing individual laws will make everything else much clearer.'
            },

            {
              blockType: 'table',
              caption: 'Key Constitutional Provisions Relevant to US Gambling Law',
              hasHeaders: true,
              headers: ['Provision', 'Location', 'Relevance to Gambling'],
              rows: [
                ['Commerce Clause', 'Article I, Section 8', 'Gives federal government power over interstate gambling, including internet gambling'],
                ['10th Amendment', 'Bill of Rights', 'Reserves non-delegated powers to states - basis for state gambling authority'],
                ['Supremacy Clause', 'Article VI', 'Federal law overrides conflicting state law'],
                ['Due Process Clause', '5th & 14th Amendments', 'Protects against arbitrary enforcement; used in many gambling cases'],
                ['Indian Commerce Clause', 'Article I, Section 8', 'Gives Congress authority over commerce with tribes - basis for IGRA']
              ]
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Which constitutional amendment is most directly responsible for states having the primary power to regulate gambling?',
              tagSlugs: ['federalism', 'us-gambling-law', 'beginner'],
              choices: [
                'The 1st Amendment (freedom of speech)',
                'The 10th Amendment (powers reserved to states)',
                'The 14th Amendment (equal protection)',
                'The 4th Amendment (protection against searches)'
              ],
              correctAnswer: 'The 10th Amendment (powers reserved to states)',
              solution: 'The 10th Amendment states that powers not delegated to the federal government are reserved to the states. Since the Constitution never explicitly grants the federal government power over gambling, gambling regulation has historically been a state power. This is why gambling laws vary so dramatically between states.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'What constitutional provision allows the federal government to regulate internet gambling even though gambling is traditionally a state matter?',
              tagSlugs: ['federalism', 'commerce-clause', 'beginner'],
              choices: [
                'The 10th Amendment',
                'The Bill of Rights',
                'The Commerce Clause',
                'The Supremacy Clause'
              ],
              correctAnswer: 'The Commerce Clause',
              solution: 'The Commerce Clause (Article I, Section 8) gives Congress power to regulate commerce "among the several States." Internet gambling inherently crosses state lines (data travels through servers in multiple states), bringing it within federal reach. This is the constitutional basis for federal gambling laws like the Wire Act and UIGEA.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'A state can legalize a form of online gambling that federal law explicitly prohibits, as long as a majority of the state\'s residents support it.',
              tagSlugs: ['federalism', 'us-gambling-law', 'beginner'],
              correctAnswer: 'false',
              solution: 'False. Under the Supremacy Clause, federal law overrides conflicting state law. No matter how much popular support a state law has, it cannot override a federal prohibition. States can expand gambling rights beyond the federal minimum, but they cannot authorize what federal law forbids.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Explain in your own words why iGaming law in the United States is so complex compared to most other countries. Reference at least two specific constitutional features in your answer.',
              tagSlugs: ['federalism', 'us-gambling-law', 'beginner'],
              solution: 'US iGaming law is complex primarily because of the federal system established by the Constitution. First, the 10th Amendment reserves gambling regulation to the states, meaning all 50 states can (and do) create their own gambling laws independently - resulting in 50 different legal frameworks. Second, the Commerce Clause gives the federal government authority over interstate activity, meaning federal laws like the Wire Act and UIGEA apply on top of state laws whenever activity crosses state lines. Operators must comply with both layers simultaneously, and the interaction between federal and state law is often ambiguous and contested in courts.',
              points: 3,
              isPublished: false
            }
          ]
        },

        // ----------------------------------------------------------
        // LESSON 1.2: The History of US Gambling Law (1900s-2018)
        // ----------------------------------------------------------
        {
          title: 'Lesson 1.2: The History of US Gambling Law (1900s-2018)',
          order: 2,
          isPublished: false,

          theoryBlocks: [
            // HOOK
            {
              blockType: 'text',
              content: 'To understand where US iGaming law is today, you need to understand how it got here. The history of gambling regulation in America is a story of moral panics, organized crime, technological disruption, and political compromise. Laws that seem arbitrary often make perfect sense once you know the historical context in which they were written. The Wire Act, for example, was written in 1961 to fight the Mob - not to regulate the internet, which wouldn\'t exist for another 30 years. Yet it still shapes online gambling law today. History is not just background - it is the key to understanding the law.'
            },

            // EARLY HISTORY - ANTI-GAMBLING SENTIMENT
            {
              blockType: 'text',
              content: 'In the early 20th century, most gambling in the United States was either illegal or tightly restricted. Fueled by progressive-era moral reform movements, states across the country criminalized most forms of betting. By the 1910s, **horse racing** was one of the only legal forms of gambling in many states, and even that faced periodic bans. The dominant view was that gambling was a vice associated with poverty, crime, and corruption - an obstacle to the industrious, virtuous American character that reformers wanted to promote. This cultural and legal hostility toward gambling would shape policy for decades.'
            },

            // ORGANIZED CRIME ERA
            {
              blockType: 'text',
              content: 'Prohibition (1920-1933) taught America a painful lesson: banning popular activities drives them underground and into the hands of organized crime. The same pattern applied to gambling. Illegal bookmaking operations and "numbers" games flourished throughout the mid-20th century, often run by or connected to organized crime syndicates. By the 1950s, the **Kefauver Committee** - a Senate investigation into organized crime - exposed how deeply gambling and the Mob were intertwined. This created enormous political pressure for federal action against illegal gambling operations, especially those using telephone wires to take bets across state lines.'
            },

            // THE WIRE ACT (1961)
            {
              blockType: 'text',
              content: 'In 1961, Attorney General **Robert F. Kennedy** championed the passage of the **Interstate Wire Act** (also called the Federal Wire Act). Kennedy\'s target was clear: illegal bookmaking operations that used telephone wires to take sports bets across state lines, often controlled by organized crime. The Wire Act made it a federal crime to use wire communications to transmit bets or betting information across state lines. For nearly 40 years, the Wire Act was understood as applying only to **sports betting** - a view that would become critical when the internet arrived. The full implications of this 1961 law are still being debated in courts today.'
            },

            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Timeline graphic of US gambling law history from 1900 to 2018. Key milestones as markers on a horizontal timeline: 1910s (widespread gambling prohibition), 1931 (Nevada legalizes casino gambling), 1961 (Federal Wire Act), 1970 (RICO Act), 1988 (Indian Gaming Regulatory Act - IGRA), 1992 (PASPA - federal sports betting ban), 2006 (UIGEA), 2011 (DOJ Wire Act reinterpretation for online poker/casino), 2018 (Murphy v. NCAA strikes down PASPA). Use color coding: red for prohibition-era laws, blue for expansion moments, green for court decisions. Clean, readable horizontal timeline format.',
              align: 'center',
              width: 'lg'
            },

            // NEVADA EXCEPTION AND STATE LEGALIZATION
            {
              blockType: 'text',
              content: 'While most of America maintained strict anti-gambling laws, **Nevada** broke from the pack in 1931 by legalizing casino gambling statewide during the Great Depression as an economic stimulus measure. Nevada\'s model - a state-licensed, regulated casino industry - would eventually become the template for gambling regulation across the country, but it took decades. **New Jersey** legalized Atlantic City casino gambling in 1976, creating the second major US casino market. Through the 1980s and 1990s, a wave of state-level legalization began as states recognized gambling\'s revenue potential - lotteries, riverboat casinos, and eventually tribal casinos all expanded the footprint of legal gambling.'
            },

            // IGRA 1988 - TRIBAL GAMING
            {
              blockType: 'text',
              content: 'The **Indian Gaming Regulatory Act of 1988 (IGRA)** created an entirely separate regulatory universe for tribal gambling. IGRA was passed after the Supreme Court ruled in *California v. Cabazon Band* (1987) that states could not apply their gambling laws to tribes on tribal land. IGRA established a framework where tribes could offer gambling if the state permitted gambling of that type for other purposes. This created the complex **tribal-state compact** system, where tribes negotiate gaming agreements directly with state governments. Today, tribal gaming is a multi-billion-dollar industry operating under its own distinct legal framework - one that intersects awkwardly with online gambling in ways that are still being resolved.'
            },

            // PASPA 1992 - THE SPORTS BETTING BAN
            {
              blockType: 'text',
              content: 'In 1992, Congress passed the **Professional and Amateur Sports Protection Act (PASPA)**. PASPA was lobbied for intensely by professional sports leagues (NFL, NBA, MLB, NHL, NCAA) who argued that widespread sports betting would corrupt the integrity of their games. PASPA prohibited states from authorizing sports betting, with four exceptions for states that already had some form of sports betting (Nevada, Delaware, Montana, and Oregon). The effect was to give **Nevada a near-monopoly on legal sports betting** for over 25 years. PASPA would eventually be struck down as unconstitutional, but not before dramatically shaping the development of offshore and illegal sports betting markets.'
            },

            // INTERNET ERA AND UIGEA
            {
              blockType: 'text',
              content: 'The internet transformed gambling in the late 1990s. Offshore gambling sites - operating from jurisdictions like Antigua, Kahnawake (Canada), Gibraltar, and Malta - began accepting bets from US players. By the mid-2000s, billions of dollars in US gambling money was flowing to these offshore sites annually. Congress responded in 2006 with the **Unlawful Internet Gambling Enforcement Act (UIGEA)**. Critically, UIGEA did not make online gambling itself illegal - it prohibited **financial institutions from processing payments** to unlawful online gambling sites. UIGEA caused many major offshore poker and casino sites to exit the US market, but it did not eliminate offshore gambling - it just made it harder to fund accounts.'
            },

            // BLACK FRIDAY 2011 AND DOJ OPINION
            {
              blockType: 'text',
              content: '**April 15, 2011** is known as "**Black Friday**" in the poker world. The US Department of Justice indicted the three largest online poker sites operating in the US - PokerStars, Full Tilt Poker, and Absolute Poker - for bank fraud and illegal gambling offenses. The sites were shut down for US players. Ironically, just months later in December 2011, the DOJ issued a landmark **legal opinion reinterpreting the Wire Act**, concluding that it applied only to sports betting - not to other forms of online gambling. This opened the door for states to legalize online casino and poker within their borders. New Jersey, Delaware, and Nevada quickly moved to do exactly that.'
            },

            {
              blockType: 'callout',
              variant: 'warning',
              title: 'UIGEA Common Misconception',
              content: 'Many people believe UIGEA made online gambling illegal in the US. It did not. UIGEA targeted payment processing, not gambling itself. The legality of online gambling under federal law was (and still is) primarily determined by the Wire Act and state law - not UIGEA. This distinction is critical for compliance analysis.'
            },

            // MURPHY V NCAA 2018 - THE REVOLUTION
            {
              blockType: 'text',
              content: 'The most consequential gambling law event of the 21st century happened on May 14, 2018, when the **US Supreme Court ruled 6-3 in *Murphy v. NCAA*** that PASPA was unconstitutional. The Court held that PASPA violated the **anti-commandeering doctrine** - a principle that Congress cannot force state legislatures to enact or maintain laws that serve federal purposes. In other words, the federal government cannot simply order states to keep sports betting illegal. The decision effectively returned sports betting regulation to the states. Within weeks, states began passing sports betting legislation. By 2024, over 35 states had legalized sports betting in some form - a transformation that would have been unthinkable just a decade earlier.'
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'The Federal Wire Act of 1961 was primarily passed to combat which problem?',
              tagSlugs: ['wire-act', 'history-of-gambling', 'beginner'],
              choices: [
                'Offshore internet gambling sites taking bets from US players',
                'Organized crime using telephone wires for illegal interstate sports bookmaking',
                'States running illegal lottery operations across state borders',
                'Horse racing corruption and match-fixing'
              ],
              correctAnswer: 'Organized crime using telephone wires for illegal interstate sports bookmaking',
              solution: 'The Wire Act was championed by Attorney General Robert F. Kennedy specifically to target organized crime\'s illegal bookmaking operations, which used telephone wires to accept sports bets across state lines. The internet did not exist in 1961, so the law\'s application to online gambling was never the original intent.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'What did UIGEA (2006) actually make illegal?',
              tagSlugs: ['uigea', 'history-of-gambling', 'beginner'],
              choices: [
                'All forms of online gambling by US residents',
                'Online poker specifically',
                'Financial institutions processing payments to unlawful online gambling sites',
                'Offshore gambling companies from accepting US players'
              ],
              correctAnswer: 'Financial institutions processing payments to unlawful online gambling sites',
              solution: 'UIGEA targeted the payment infrastructure, not gambling itself. It prohibited banks and payment processors from knowingly processing transactions to unlawful online gambling sites. UIGEA did not make online gambling itself illegal and did not define what "unlawful" meant - it relied on existing federal and state law for that definition.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'What was the constitutional basis for the Supreme Court striking down PASPA in Murphy v. NCAA (2018)?',
              tagSlugs: ['murphy-v-ncaa', 'paspa', 'federalism', 'intermediate'],
              choices: [
                'PASPA violated the Commerce Clause by interfering with interstate commerce',
                'PASPA violated the anti-commandeering doctrine by forcing states to maintain prohibitions serving federal purposes',
                'PASPA violated the 1st Amendment right to receive sports information',
                'PASPA was unconstitutional because Nevada was given an unfair monopoly'
              ],
              correctAnswer: 'PASPA violated the anti-commandeering doctrine by forcing states to maintain prohibitions serving federal purposes',
              solution: 'The Supreme Court held that PASPA violated the anti-commandeering doctrine - the principle that Congress cannot force state governments to enact or maintain laws serving federal regulatory purposes. PASPA effectively commanded states to keep sports betting illegal, which the Court found was beyond Congress\'s constitutional power. The decision restored states\' ability to decide their own sports betting policies.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Trace the legal journey of sports betting in the US from 1961 to 2018, identifying at least three key legal developments and explaining their significance.',
              tagSlugs: ['history-of-gambling', 'sports-betting', 'paspa', 'murphy-v-ncaa', 'intermediate'],
              solution: 'Key developments: (1) Wire Act 1961 - targeted illegal interstate bookmaking but established the framework of federal involvement in gambling; unclear how it applied to sports betting specifically. (2) PASPA 1992 - prohibited states from authorizing sports betting, creating a near-monopoly for Nevada and pushing sports betting underground or offshore; the sports leagues lobbied for this claiming game integrity concerns. (3) UIGEA 2006 - while targeting online gambling broadly, reinforced the difficulty of operating legal sports betting online by restricting payment processing. (4) Murphy v. NCAA 2018 - Supreme Court struck down PASPA as violating the anti-commandeering doctrine, returning sports betting regulation to the states and triggering a wave of state legalization. Each step reflects the tension between federal control and state autonomy that defines American gambling law.',
              points: 3,
              isPublished: false
            }
          ]
        },

        // ----------------------------------------------------------
        // LESSON 1.3: What is iGaming? Defining the Products
        // ----------------------------------------------------------
        {
          title: 'Lesson 1.3: What is iGaming? Defining the Products Legally',
          order: 3,
          isPublished: false,

          theoryBlocks: [
            // HOOK
            {
              blockType: 'text',
              content: 'Not all online gambling is treated the same under US law. A slot machine and a sports bet and a poker hand and a daily fantasy sports lineup and a prediction market contract all involve wagering money on uncertain outcomes - but legally, they are treated as entirely different things. Whether an activity is a game of **chance**, a game of **skill**, a **financial contract**, or a **lottery** determines which laws apply, which regulators have jurisdiction, and whether it is legal at all. Before diving into specific laws, you need to understand how the law categorizes these products - because the categories determine everything.'
            },

            // DEFINING GAMBLING LEGALLY
            {
              blockType: 'text',
              content: 'Most US jurisdictions define gambling using three elements, all of which must be present:\n\n1. **Consideration** - something of value wagered (usually money)\n2. **Chance** - the outcome is at least partially determined by chance\n3. **Prize** - something of value is awarded based on the outcome\n\nThis "consideration-chance-prize" test is used by courts and legislatures across the country. Activities that eliminate one of these three elements may escape gambling classification entirely. This is why **sweepstakes** casinos eliminate "consideration" by offering free entries, and why **DFS** operators argue their games eliminate the "chance" element by being predominantly skill-based.'
            },

            // ONLINE CASINO - GAMES OF CHANCE
            {
              blockType: 'text',
              content: '**Online casino games** (slots, roulette, blackjack, baccarat) are paradigmatic games of chance. The outcome is determined primarily by a random number generator (RNG) or random physical process. While players can make decisions in games like blackjack, the fundamental outcome still depends substantially on chance. Online casino games are the most heavily regulated product in US iGaming - only six states (New Jersey, Pennsylvania, Michigan, Delaware, West Virginia, and Connecticut) have fully legalized them. This is partly because slots, in particular, are viewed as the most "addictive" gambling product and face the most political resistance.'
            },

            // SPORTS BETTING
            {
              blockType: 'text',
              content: '**Sports betting** occupies an interesting middle ground. Betting on sports involves both chance (you cannot know for certain who will win) and skill (sharp bettors use statistical analysis to identify value). However, courts and legislatures have consistently classified sports betting as **gambling** subject to gambling laws rather than as a skill game exempt from gambling regulations. Sports betting is now legal in over 35 states following *Murphy v. NCAA* (2018). It is regulated primarily at the state level through dedicated sports betting laws, though federal laws like the Wire Act still apply. The product comes in many forms: fixed-odds betting, parlays, prop bets, live in-game betting, and more.'
            },

            // ONLINE POKER
            {
              blockType: 'text',
              content: '**Online poker** has a complex legal status in the US. Poker operators and many courts have argued that poker is primarily a **game of skill** - that skilled players consistently outperform unskilled players over time, making the dominant factor skill rather than chance. However, most US jurisdictions still classify poker as gambling subject to gambling laws. Only a handful of states have expressly legalized online poker (Nevada, New Jersey, Delaware, Michigan, West Virginia, Pennsylvania). A key feature of online poker law is the possibility of **multi-state poker liquidity compacts** - agreements between states that allow their players to compete in the same poker pools, which is necessary for viable player liquidity in a fragmented US market.'
            },

            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Diagram showing the legal classification of different iGaming products along two axes: vertical axis labeled "Skill vs. Chance" (Chance at bottom, Skill at top), horizontal axis labeled "Regulatory Clarity" (Gray Area on left, Well-defined on right). Position products as labeled bubbles: Slots (bottom-right: high chance, well-defined regulation), Sports Betting (middle-right: mixed skill/chance, increasingly well-defined), Online Poker (upper-middle: more skill, moderately defined), DFS (upper-left: high skill claim, gray area), Prediction Markets (upper-far-left: high skill, most gray area), Sweepstakes Casinos (bottom-left: chance-based but legally gray). Use distinct colors for each bubble.',
              align: 'center',
              width: 'lg'
            },

            // DFS - THE SKILL GAME ARGUMENT
            {
              blockType: 'text',
              content: '**Daily Fantasy Sports (DFS)** is one of the most interesting legal constructs in US iGaming. Companies like DraftKings and FanDuel argued that DFS is a game of skill - that selecting a lineup of real athletes based on statistical analysis is fundamentally different from betting on the outcome of a game. This skill argument was critical because many state gambling laws exempt games of skill from their reach. Congress arguably gave DFS a boost by including a carve-out in UIGEA for fantasy sports contests that meet certain criteria. Today, DFS is explicitly legal in about 40+ states, though the exact regulatory treatment varies significantly. Notably, the skill argument that justified DFS has been used as a template by other operators seeking to escape gambling regulation.'
            },

            // PREDICTION MARKETS
            {
              blockType: 'text',
              content: '**Prediction markets** are the newest and most legally complex product in this space. A prediction market allows participants to buy and sell contracts whose value depends on real-world outcomes - for example, a contract that pays $1 if a particular candidate wins an election, and $0 if they lose. Companies like **Kalshi** and **PredictIt** operate prediction markets in the US. The legal twist is that prediction markets are regulated not by state gambling authorities, but by the **Commodity Futures Trading Commission (CFTC)** as derivatives contracts under the Commodity Exchange Act. This makes prediction markets a federal matter, largely bypassing state gambling laws. However, the CFTC\'s jurisdiction over event contracts is itself contested and rapidly evolving.'
            },

            // SKILL VS. CHANCE - THE DOMINANT FACTOR TEST
            {
              blockType: 'text',
              content: 'The central legal battleground across all these products is the **"dominant factor" test** - the question of whether skill or chance is the dominant factor determining outcomes. Most US states use some version of this test. If skill dominates, an activity may escape gambling regulation entirely; if chance dominates, full gambling regulation applies. This test has been fought over extensively in litigation involving poker, DFS, and more recently various "skill-based" slot machine hybrids. The test is fact-intensive and courts often reach different conclusions even with similar evidence. This legal ambiguity creates ongoing compliance risk for operators of products that blend skill and chance elements.'
            },

            {
              blockType: 'callout',
              variant: 'info',
              title: 'The Sweepstakes Casino Model',
              content: 'Sweepstakes casinos (like Chumba, Pulsz, and McLuck) operate in nearly all US states by eliminating "consideration" from the gambling equation. They offer free virtual currency (Sweeps Coins) that can be used to play casino-style games, with prizes redeemable for real money. Because the free entry option makes the consideration element optional, sweepstakes operators argue they are running promotions - not gambling. This model is highly controversial and faces growing regulatory scrutiny, but as of 2024 remains legal in most states.'
            },

            {
              blockType: 'table',
              caption: 'US iGaming Product Legal Classification Overview',
              hasHeaders: true,
              headers: ['Product', 'Primary Classification', 'Key Federal Regulator', 'States Fully Legal (approx.)'],
              rows: [
                ['Online Casino (slots, table games)', 'Game of Chance / Gambling', 'DOJ (Wire Act, UIGEA)', '6 states'],
                ['Sports Betting', 'Gambling (mixed skill/chance)', 'DOJ (Wire Act)', '35+ states'],
                ['Online Poker', 'Gambling (skill argument contested)', 'DOJ (Wire Act)', '6 states'],
                ['Daily Fantasy Sports (DFS)', 'Skill Game / Gambling (varies)', 'No direct federal regulator', '40+ states'],
                ['Prediction Markets', 'Derivatives Contract', 'CFTC', 'Federal level (CFTC-regulated)'],
                ['Sweepstakes Casinos', 'Promotional Sweepstakes (contested)', 'FTC / State AGs', 'Most states (gray area)']
              ]
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'What three elements must typically all be present for an activity to be legally classified as "gambling" in US law?',
              tagSlugs: ['us-gambling-law', 'beginner'],
              choices: [
                'License, registration, and compliance',
                'Consideration, chance, and prize',
                'Wager, odds, and payout',
                'Contract, risk, and reward'
              ],
              correctAnswer: 'Consideration, chance, and prize',
              solution: 'The traditional legal definition of gambling requires all three elements: consideration (something of value wagered), chance (outcome at least partially determined by chance), and prize (something of value awarded). Eliminating any one element can take an activity outside the legal definition of gambling - which is how sweepstakes casinos and some other operators structure their products.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'Which US regulatory body has jurisdiction over prediction markets, making them different from all other iGaming products?',
              tagSlugs: ['prediction-markets', 'cftc', 'intermediate'],
              choices: [
                'The Department of Justice (DOJ)',
                'The Federal Trade Commission (FTC)',
                'The Commodity Futures Trading Commission (CFTC)',
                'The Securities and Exchange Commission (SEC)'
              ],
              correctAnswer: 'The Commodity Futures Trading Commission (CFTC)',
              solution: 'Prediction markets are regulated by the CFTC as derivatives contracts under the Commodity Exchange Act, not by state gambling regulators or the DOJ under gambling laws. This federal regulatory framework makes prediction markets unique among iGaming products - they largely bypass state gambling law and operate at the federal level.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'Daily Fantasy Sports (DFS) is illegal at the federal level in the United States.',
              tagSlugs: ['dfs', 'beginner'],
              correctAnswer: 'false',
              solution: 'False. DFS is not illegal at the federal level. UIGEA actually included a carve-out for fantasy sports contests meeting certain criteria. DFS legality is determined at the state level, and approximately 40+ states have either explicitly legalized DFS or allow it without restriction. DFS operators argue their products are games of skill, which in many states exempts them from gambling regulations entirely.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Explain why sweepstakes casinos can operate in nearly all US states while traditional online casinos are only legal in 6 states. What specific legal argument do sweepstakes casinos rely on?',
              tagSlugs: ['sweepstakes-casinos', 'us-gambling-law', 'intermediate'],
              solution: 'Sweepstakes casinos exploit the three-element definition of gambling (consideration, chance, prize). Traditional online casinos require all three: players pay money (consideration) to play games of chance (chance) for real money prizes (prize). Sweepstakes casinos eliminate the consideration element by offering free virtual currency (Sweeps Coins) alongside any purchase option - because free entry is available, the "consideration" element is arguably absent. Without all three elements, the activity falls outside the legal definition of gambling and can be characterized as a promotional sweepstakes, which is legal in virtually all states. This is a legally creative but controversial argument that regulators in some states are beginning to challenge.',
              points: 3,
              isPublished: false
            }
          ]
        }
      ]
    },

    // =========================================================
    // MODULE 2: FEDERAL LAWS THAT SHAPE EVERYTHING
    // =========================================================
    {
      title: 'Module 2: Federal Laws That Shape Everything',
      order: 2,
      isPublished: false,

      lessons: [
        // ----------------------------------------------------------
        // LESSON 2.1: The Wire Act (1961) - The Foundation
        // ----------------------------------------------------------
        {
          title: 'Lesson 2.1: The Wire Act (1961) - The Foundation of Federal Gambling Law',
          order: 1,
          isPublished: false,

          theoryBlocks: [
            // HOOK
            {
              blockType: 'text',
              content: 'A law written in 1961 to stop the Mafia from using telephone wires to run illegal bookmaking operations is still one of the most important laws governing online gambling today. The **Federal Wire Act** (18 U.S.C. § 1084) has been interpreted, reinterpreted, litigated, and debated for over 60 years - and there is still no final, settled answer on its exact scope. For anyone working in US iGaming, understanding the Wire Act is not optional. It is the bedrock federal statute that determines what can and cannot be done across state lines.'
            },

            // WHAT THE WIRE ACT SAYS
            {
              blockType: 'text',
              content: 'The Wire Act\'s core prohibition is relatively straightforward. It makes it a federal crime for anyone "engaged in the business of betting or wagering" to use wire communications (originally telephone, now including internet) to:\n\n1. **Transmit bets or wagers** on any sporting event or contest across state or international lines, OR\n2. **Transmit information** for use in placing bets or wagers on any sporting event or contest, OR\n3. **Receive money or credit** as a result of such bets or wagers\n\nViolations carry penalties of up to **2 years imprisonment** and fines. The key question that has defined Wire Act litigation for decades: does "any sporting event or contest" limit the law to sports, or was it meant to reach all forms of gambling?'
            },

            // THE SPORTS-ONLY VS ALL-GAMBLING DEBATE
            {
              blockType: 'text',
              content: 'For decades after 1961, the Wire Act was understood to apply broadly to all forms of interstate gambling - not just sports. The DOJ consistently took this position. Then in **December 2011**, the DOJ\'s Office of Legal Counsel issued a landmark opinion concluding that the Wire Act applied **only to sports betting** - not to online poker, casino games, or lottery sales. This opinion was in response to requests from Illinois and New York, which wanted to sell lottery tickets online. The 2011 DOJ opinion opened the floodgates: New Jersey, Delaware, and Nevada all passed online gambling legislation within a few years.'
            },

            // THE 2018 DOJ REVERSAL
            {
              blockType: 'text',
              content: 'In January **2019**, the Trump administration\'s DOJ reversed course and issued a new opinion concluding that the Wire Act **does apply to all forms of online gambling** - not just sports. This opinion was immediately challenged in court by the New Hampshire Lottery Commission. In June 2021, the **First Circuit Court of Appeals** ruled against the DOJ\'s 2019 interpretation, holding that the Wire Act applies only to sports betting. However, the First Circuit\'s ruling only binds the states in its circuit (Maine, Massachusetts, New Hampshire, Rhode Island, and Puerto Rico). The Supreme Court has not yet addressed the question, leaving a genuine legal cloud over online gambling in other circuits. This unresolved conflict is one of the biggest ongoing legal risks in US iGaming.'
            },

            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Timeline showing Wire Act interpretation evolution: 1961 (Wire Act passed, broadly interpreted), 2011 (DOJ opinion: sports-only), 2012-2018 (states legalize online gambling based on 2011 opinion), January 2019 (DOJ reverses to all-gambling interpretation), 2021 (First Circuit Court rules sports-only, contradicting 2019 DOJ). Below timeline, show a US map highlighting the First Circuit states (ME, MA, NH, RI, Puerto Rico) where sports-only interpretation is binding versus the rest of the country where it is legally uncertain. Use clear color coding.',
              align: 'center',
              width: 'lg'
            },

            // WIRE ACT AND INTERSTATE OPERATIONS
            {
              blockType: 'text',
              content: 'Even under the sports-only interpretation, the Wire Act creates significant compliance complexity for online gambling operators. Consider a licensed New Jersey online casino: its servers might be located in Nevada or New Jersey, its payment processor might route transactions through states that have not legalized online gambling, and its players may travel to other states while holding NJ accounts. Every time data or money crosses a state line in connection with a bet, there is potential Wire Act exposure. Operators invest heavily in **geolocation technology** to ensure players are physically located within the licensed state when placing bets - a direct response to Wire Act compliance requirements.'
            },

            // WHO THE WIRE ACT APPLIES TO
            {
              blockType: 'text',
              content: 'The Wire Act applies only to those "**engaged in the business of betting or wagering**" - not to individual bettors. This means an occasional bettor placing bets for personal use is generally not the target of Wire Act prosecution. The law is aimed at operators, bookmakers, and gambling businesses. However, individuals who regularly engage in betting as a business activity could be swept in. This distinction matters because it means US players using offshore gambling sites are not typically prosecuted under the Wire Act - it is the offshore operators who face legal risk for accepting their bets (though prosecution of offshore operators is practically difficult since they are outside US jurisdiction).'
            },

            // THE WIRE ACT AND TRIBAL GAMING ONLINE
            {
              blockType: 'text',
              content: 'The Wire Act creates particular complications for tribal gaming operators who want to offer online gambling. Under IGRA, tribes have certain rights to offer gambling on tribal lands. But when a tribal casino offers online gambling, the bets may be placed by players who are not physically on tribal land - creating Wire Act issues. Some tribes have argued that their sovereignty provides protection from federal gambling laws, but this argument has not been fully tested in courts for online gambling. As states legalize online gambling through compacts with tribes, the intersection of the Wire Act, IGRA, and state law creates some of the most complex legal issues in the entire iGaming space.'
            },

            {
              blockType: 'callout',
              variant: 'warning',
              title: 'The Wire Act\'s Unresolved Status',
              content: 'As of 2024, the scope of the Wire Act remains legally uncertain outside the First Circuit states. The DOJ\'s 2019 all-gambling interpretation was rejected by the First Circuit but has not been addressed by the Supreme Court. Any multi-state online gambling operation faces Wire Act risk that has not been fully resolved by federal courts. This is a live, active legal risk - not a historical footnote.'
            },

            {
              blockType: 'table',
              caption: 'Wire Act Interpretation Timeline',
              hasHeaders: true,
              headers: ['Date', 'Development', 'Impact on iGaming'],
              rows: [
                ['1961', 'Wire Act passed by Congress', 'Creates federal prohibition on interstate wire gambling communications'],
                ['1961-2011', 'DOJ/courts treat Wire Act as applying broadly', 'Online gambling across state lines considered presumptively illegal federally'],
                ['Dec 2011', 'DOJ opinion: Wire Act = sports only', 'States can legalize non-sports online gambling; NJ, DE, NV move forward'],
                ['Jan 2019', 'DOJ reverses: Wire Act = all gambling', 'Major legal uncertainty; existing operators face potential federal risk'],
                ['Jun 2021', 'First Circuit rejects 2019 DOJ opinion', 'Sports-only interpretation binding in ME, MA, NH, RI; rest of US uncertain'],
                ['2024+', 'Supreme Court has not ruled; conflict continues', 'Ongoing compliance risk for all multi-state online gambling operations']
              ]
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'The Wire Act (1961) was originally passed primarily to address which problem?',
              tagSlugs: ['wire-act', 'history-of-gambling', 'beginner'],
              choices: [
                'Offshore internet gambling sites operating without US licenses',
                'State lotteries selling tickets across state lines',
                'Organized crime using telephone wires for illegal interstate sports bookmaking',
                'Sports corruption and match-fixing in professional leagues'
              ],
              correctAnswer: 'Organized crime using telephone wires for illegal interstate sports bookmaking',
              solution: 'Attorney General Robert F. Kennedy championed the Wire Act specifically to combat organized crime\'s use of telephone wire communications to run illegal interstate bookmaking operations. The Mafia had extensive illegal gambling networks, and the Wire Act was a targeted anti-organized-crime measure - not a general online gambling prohibition.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'What was the significance of the DOJ\'s December 2011 Wire Act opinion?',
              tagSlugs: ['wire-act', 'intermediate'],
              choices: [
                'It made all online gambling federally legal',
                'It concluded the Wire Act applies only to sports betting, not other online gambling',
                'It expanded the Wire Act to cover all internet activity',
                'It created a new federal licensing system for online gambling'
              ],
              correctAnswer: 'It concluded the Wire Act applies only to sports betting, not other online gambling',
              solution: 'The 2011 DOJ opinion concluded that the Wire Act\'s prohibition on "sporting events or contests" limited its reach to sports betting only - not online casino games, poker, or lottery sales. This interpretation was the legal green light that allowed states like New Jersey, Delaware, and Nevada to move forward with legalizing online gambling.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'Individual US residents who place bets on offshore gambling sites are typically prosecuted under the Wire Act.',
              tagSlugs: ['wire-act', 'beginner'],
              correctAnswer: 'false',
              solution: 'False. The Wire Act applies to those "engaged in the business of betting or wagering" - targeting operators and gambling businesses, not individual bettors. While individual bettors may technically violate state gambling laws, federal prosecution of individual players under the Wire Act is essentially unheard of. Offshore operators are the target, though practically prosecuting them from outside US jurisdiction is very difficult.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Explain why the ongoing uncertainty about the Wire Act\'s scope (sports-only vs. all gambling) creates compliance risk for licensed online casino operators in states like New Jersey. What practical measures do operators take in response?',
              tagSlugs: ['wire-act', 'compliance', 'intermediate'],
              solution: 'The Wire Act\'s unresolved scope creates risk because online casino operations inherently involve data and transactions that cross state lines - even if both the operator and player are in New Jersey, payment processing may route through other states, servers may be located elsewhere, and players traveling out of state may attempt to access their accounts. If a court in a non-First Circuit jurisdiction were to adopt the all-gambling interpretation, these cross-border data flows could constitute Wire Act violations. In response, operators invest heavily in: (1) geolocation technology to verify players are physically in the licensed state at time of play; (2) legal structuring to minimize interstate data flows; (3) server location within the licensed state; and (4) ongoing legal monitoring of Wire Act developments. The risk is real, live, and unresolved.',
              points: 3,
              isPublished: false
            }
          ]
        },

        // ----------------------------------------------------------
        // LESSON 2.2: UIGEA (2006) - The Game Changer
        // ----------------------------------------------------------
        {
          title: 'Lesson 2.2: UIGEA (2006) - Targeting the Money Flow',
          order: 2,
          isPublished: false,

          theoryBlocks: [
            // HOOK
            {
              blockType: 'text',
              content: 'By 2006, online gambling was a massive, mostly unregulated industry. US players were depositing billions of dollars annually to offshore sites operating from Antigua, Gibraltar, Kahnawake, and other jurisdictions. The DOJ had struggled to prosecute these offshore operators directly - they were beyond US jurisdiction. Congress decided to attack the problem from a different angle: instead of going after the gambling sites themselves, they would go after the **financial infrastructure** that allowed US money to reach those sites. The result was the **Unlawful Internet Gambling Enforcement Act (UIGEA)** - buried in an unrelated port security bill and passed at midnight before a Congressional recess.'
            },

            // WHAT UIGEA ACTUALLY DOES
            {
              blockType: 'text',
              content: 'UIGEA (31 U.S.C. §§ 5361-5367) prohibits **financial institutions** - banks, credit card companies, payment processors - from knowingly accepting, processing, or transmitting payments connected to "unlawful Internet gambling." Critically, UIGEA itself does not define what "unlawful Internet gambling" is. Instead, it relies on existing federal and state law to determine legality. If a bet would be illegal under the Wire Act or under the law of the state where the bet is placed or received, then processing payment for it violates UIGEA. UIGEA enforcement operates through regulations issued by the **Federal Reserve and Department of Treasury** requiring financial institutions to have policies to identify and block restricted transactions.'
            },

            // WHAT UIGEA DOESN'T DO
            {
              blockType: 'text',
              content: 'It is crucial to understand what UIGEA **does not** do:\n\n- **It does not make online gambling itself a crime.** UIGEA only targets payment processing.\n- **It does not define what is "unlawful."** Legality is determined by the Wire Act and state law.\n- **It does not apply to players.** The prohibition is on financial institutions, not on individual gamblers.\n- **It does not ban all online gambling payments.** It targets payments to "unlawful" sites - legal, licensed sites can still accept payments.\n- **It did not eliminate offshore gambling.** Many players and offshore sites found workarounds through cryptocurrency, prepaid cards, and overseas bank accounts.\n\nMisunderstanding UIGEA as a "ban on online gambling" is one of the most common errors in iGaming legal analysis.'
            },

            // THE FANTASY SPORTS EXEMPTION
            {
              blockType: 'text',
              content: 'UIGEA includes an explicit exemption for certain fantasy sports contests. Under UIGEA, fantasy sports are not "unlawful Internet gambling" if:\n\n1. **Prizes are established in advance** and are not determined by the number of participants or amount of fees paid\n2. **Outcomes reflect the relative knowledge and skill** of participants, not chance\n3. **No outcome is based on the score, point spread**, or performance of a single real-world team\n4. **No outcome is based solely on any single performance** of a single athlete in a single real-world event\n\nThis exemption is the federal legal foundation for the DFS industry. DraftKings and FanDuel designed their products to meet these criteria. However, the exemption is not unlimited - state law can still restrict DFS regardless of UIGEA.'
            },

            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Flow diagram showing how UIGEA works in practice. Start with "Player wants to deposit money to online gambling site." Arrow to decision diamond: "Is the gambling lawful under Wire Act and state law?" YES branch leads to "Payment allowed - financial institution can process" (green). NO branch leads to "Payment blocked - financial institution must decline" (red). Also show the regulatory chain: Treasury/Federal Reserve issue regulations, banks must comply, banks have policies to identify restricted transactions. Show carve-outs box on side: Fantasy Sports (UIGEA exemption), Horse Racing (Interstate Horseracing Act), Legal state-licensed gambling.',
              align: 'center',
              width: 'md'
            },

            // IMPACT ON THE INDUSTRY
            {
              blockType: 'text',
              content: 'UIGEA had an immediate and dramatic impact on the US online gambling market. Many major operators - including **PartyPoker, 888, and several others** - chose to exit the US market entirely rather than face the compliance burden and legal risk. PokerStars, Full Tilt Poker, and Absolute Poker chose to remain, relying on various legal arguments and creative payment processing solutions. This created the conditions for **Black Friday (2011)**, when the DOJ indicted those remaining sites for bank fraud related to their payment processing workarounds. UIGEA effectively pruned the US online poker market from a dozen major operators down to the three that were ultimately shut down in 2011.'
            },

            // UIGEA AND LICENSED OPERATORS TODAY
            {
              blockType: 'text',
              content: 'For licensed US online gambling operators today, UIGEA is actually a relatively manageable compliance requirement. Because licensed operators (e.g., a NJ online casino) are operating lawfully under state law, their gambling activity is not "unlawful Internet gambling" for UIGEA purposes, and their payment processing is permitted. The bigger UIGEA compliance challenge falls on **financial institutions** - banks must have "policies and procedures reasonably designed" to identify and block unlawful transactions, but they are not required to block all gambling transactions. In practice, many US banks and credit cards still decline gambling transactions even from legal sites, because it is easier to block all gambling than to distinguish legal from illegal.'
            },

            // BANKING CHALLENGES IN IGAMING
            {
              blockType: 'text',
              content: 'The banking access problem in US iGaming remains significant even for fully licensed operators. Many major credit card networks (Visa, Mastercard) route gambling transactions through **Merchant Category Codes (MCCs)** that many banks are programmed to decline. Players on licensed NJ, PA, or MI casino sites frequently find their debit or credit cards declined, not because the gambling is illegal, but because their bank has a blanket policy against gambling MCCs. This has driven investment in alternative payment methods - **PayPal, ACH bank transfers, Play+ prepaid cards, and online banking products** like Trustly - as operators seek to maximize payment success rates for players who are legally gambling.'
            },

            {
              blockType: 'callout',
              variant: 'tip',
              title: 'How to Remember What UIGEA Does',
              content: 'Think of UIGEA as a "traffic cop for money" - it does not determine what gambling is legal (the Wire Act and state law do that), it simply ensures that money cannot flow to gambling that those other laws have already declared illegal. Legal gambling = legal money flow. Illegal gambling = financial institution must block the payment.'
            },

            {
              blockType: 'table',
              caption: 'UIGEA Key Provisions Summary',
              hasHeaders: true,
              headers: ['Provision', 'What It Does', 'Who It Affects'],
              rows: [
                ['Core Prohibition', 'Bans accepting/processing payments for unlawful internet gambling', 'Banks, payment processors, credit card companies'],
                ['Unlawful Definition', 'Does not define unlawful - defers to Wire Act and state law', 'Operators (legality must be determined under existing law)'],
                ['Player Exemption', 'Does not apply to individual bettors', 'Players (not targeted by UIGEA)'],
                ['Fantasy Sports Carve-out', 'Exempts qualifying fantasy sports contests from "unlawful" definition', 'DFS operators (DraftKings, FanDuel, etc.)'],
                ['Regulatory Enforcement', 'Treasury and Fed Reserve implement through bank regulations', 'Federal bank regulators, financial institutions'],
                ['Horse Racing Exception', 'Interstate Horseracing Act carve-out for legal horse racing bets', 'ADW (advance deposit wagering) operators']
              ]
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'What does UIGEA primarily prohibit?',
              tagSlugs: ['uigea', 'beginner'],
              choices: [
                'US residents from placing bets on online gambling sites',
                'Online gambling companies from accepting US players',
                'Financial institutions from processing payments to unlawful online gambling sites',
                'All online gambling in the United States'
              ],
              correctAnswer: 'Financial institutions from processing payments to unlawful online gambling sites',
              solution: 'UIGEA targets the payment processing side of online gambling, not gambling itself. It prohibits banks, credit card companies, and payment processors from knowingly accepting or processing transactions connected to unlawful internet gambling. It does not apply to players and does not define what gambling is lawful - that determination is made by the Wire Act and state law.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'Under UIGEA, a fully licensed New Jersey online casino operator is engaged in "unlawful Internet gambling."',
              tagSlugs: ['uigea', 'intermediate'],
              correctAnswer: 'false',
              solution: 'False. UIGEA targets "unlawful" Internet gambling, and a licensed NJ online casino is lawfully operating under New Jersey state law. Because the activity is lawful, it is not "unlawful Internet gambling" under UIGEA, and financial institutions can process payments to that operator. UIGEA\'s practical impact on licensed US operators is minimal - it was designed to target illegal offshore gambling.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'Why do many US players on legal, licensed online gambling sites still have their credit cards declined?',
              tagSlugs: ['uigea', 'compliance', 'intermediate'],
              choices: [
                'Because UIGEA prohibits all gambling-related credit card transactions',
                'Because the gambling site is not actually licensed',
                'Because banks have blanket policies declining all gambling merchant codes regardless of legality',
                'Because credit card companies are not allowed to operate in gambling states'
              ],
              correctAnswer: 'Because banks have blanket policies declining all gambling merchant codes regardless of legality',
              solution: 'Many banks program their systems to decline transactions coded as gambling (through Merchant Category Codes) across the board - it is simpler operationally than trying to distinguish legal from illegal gambling sites. This is a business decision by banks, not a legal requirement. It creates significant friction for legal US operators, driving investment in alternative payment methods like PayPal, ACH, and dedicated gambling payment products.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Explain how the UIGEA fantasy sports exemption enabled the rise of companies like DraftKings and FanDuel. What specific criteria must a fantasy contest meet to qualify for the exemption?',
              tagSlugs: ['uigea', 'dfs', 'intermediate'],
              solution: 'UIGEA\'s fantasy sports exemption was critical to DFS because it provided a federal legal basis for arguing that DFS contests are not "unlawful Internet gambling" subject to UIGEA\'s payment processing restrictions. This meant financial institutions could process payments to DFS sites without UIGEA liability. To qualify: (1) prizes must be established in advance and not based on the number of participants or entry fees paid; (2) outcomes must reflect the relative knowledge and skill of participants rather than chance; (3) no outcome can be based on the score, point spread, or performance of a single real-world team; (4) no outcome can be based solely on any single athlete\'s performance in a single real-world event. DraftKings and FanDuel designed their daily contests specifically to meet these criteria - for example, requiring lineup construction across multiple players from multiple teams, and fixing prize pools in advance.',
              points: 3,
              isPublished: false
            }
          ]
        },

        // ----------------------------------------------------------
        // LESSON 2.3: PASPA & Murphy v. NCAA - The Sports Betting Revolution
        // ----------------------------------------------------------
        {
          title: 'Lesson 2.3: PASPA & Murphy v. NCAA - The Sports Betting Revolution',
          order: 3,
          isPublished: false,

          theoryBlocks: [
            // HOOK
            {
              blockType: 'text',
              content: 'May 14, 2018 is the most important date in the history of US iGaming. On that day, the Supreme Court issued its ruling in *Murphy v. National Collegiate Athletic Association* - a case that began as a New Jersey governor\'s challenge to a federal law and ended up transforming gambling regulation across the entire country. In a single decision, the Court unlocked sports betting for potentially hundreds of millions of Americans and triggered the largest expansion of legal gambling in US history. Understanding *Murphy* is not optional for anyone serious about iGaming law - it is the foundation on which the entire modern US sports betting industry is built.'
            },

            // WHAT PASPA WAS
            {
              blockType: 'text',
              content: '**PASPA (the Professional and Amateur Sports Protection Act)** was passed by Congress in 1992. Its core provision prohibited any state from "sponsoring, operating, advertising, promoting, licensing, or authorizing by law or compact" any lottery, sweepstakes, or other betting scheme "based directly or indirectly on one or more competitive games in which amateur or professional athletes participate." In other words: **states could not legalize sports betting**. The only exceptions were states that already had some form of sports betting legalized at the time of PASPA\'s passage - Nevada (full sports betting), Delaware, Montana, and Oregon (limited parlay games).'
            },

            // WHY PASPA WAS PASSED
            {
              blockType: 'text',
              content: 'PASPA was enacted at the request of professional sports leagues - the NFL, NBA, MLB, NHL, and NCAA - who argued that widespread legal sports betting would threaten the **integrity of their games**. The leagues feared that legal bookmaking would increase opportunities for match-fixing, point-shaving, and other forms of corruption that had already tainted college sports in several scandals. New Jersey, which had been lobbying for casino expansion, was given a one-year window to legalize sports betting before PASPA took effect - a window the state failed to use, setting the stage for 25 years of litigation.'
            },

            // NEW JERSEY\'S CHALLENGE
            {
              blockType: 'text',
              content: 'In 2011, New Jersey voters approved a constitutional amendment authorizing the state legislature to legalize sports betting. The legislature passed a sports betting law in 2012. The sports leagues immediately sued New Jersey, arguing PASPA preempted the state law. New Jersey\'s legal argument evolved through years of litigation: the state ultimately argued that PASPA violated the **anti-commandeering doctrine** by forcing states to maintain prohibitions that served federal regulatory purposes. After losing in multiple federal courts, New Jersey\'s case - now captioned under Governor Murphy - reached the Supreme Court. New Jersey received support from an unusual coalition of amici: tech companies, media organizations, and gambling advocates all filed briefs supporting the challenge.'
            },

            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Visual timeline of the Murphy v. NCAA case journey. Show: 2011 NJ voters approve constitutional amendment, 2012 NJ legislature passes sports betting law, 2012 Leagues sue NJ in federal court, 2013 District Court rules for leagues, 2013 Third Circuit affirms, NJ tries partial repeal strategy in 2014, 2016 Third Circuit en banc rules for leagues again, 2017 Supreme Court grants certiorari, May 14 2018 Supreme Court rules 6-3 for New Jersey. After ruling: show rapid state adoption with a US map showing states that legalized sports betting by end of 2018 (NJ, PA, MS, WV, RI, DE highlighted). Clean timeline with milestone icons.',
              align: 'center',
              width: 'lg'
            },

            // THE SUPREME COURT RULING
            {
              blockType: 'text',
              content: 'The Supreme Court, in a 6-3 opinion written by Justice Samuel Alito, held that PASPA violated the **anti-commandeering doctrine** established in prior cases like *New York v. United States* (1992) and *Printz v. United States* (1997). The anti-commandeering doctrine holds that the federal government cannot "commandeer" state governments - it cannot force state legislatures to enact laws or maintain regulatory schemes that serve federal purposes. The Court found that PASPA did exactly this: it prevented states from modifying or repealing their own prohibitions on sports betting, effectively forcing states to be instruments of federal policy. The Court struck down PASPA entirely rather than severing particular provisions.'
            },

            // WHAT MURPHY DID NOT DO
            {
              blockType: 'text',
              content: 'It is important to understand what *Murphy* did **not** do:\n\n- It did **not** make sports betting legal federally. It only struck down PASPA.\n- It did **not** prevent Congress from passing a new federal sports betting law.\n- It did **not** strike down the Wire Act or any other federal gambling law.\n- It did **not** require states to legalize sports betting - it simply gave them the option.\n- It did **not** resolve questions about tribal gaming rights as applied to sports betting.\n\n*Murphy* returned sports betting to the states. Each state must individually choose whether and how to legalize it. The Wire Act still applies. The decision created an opportunity, not an automatic right.'
            },

            // THE AFTERMATH - STATE LEGALIZATION WAVE
            {
              blockType: 'text',
              content: 'The aftermath of *Murphy* was a legislative tidal wave. **New Jersey** launched legal sports betting within weeks of the ruling - the state had been so confident it would win that it had operators lined up and ready to go. By the end of 2018, seven states had launched legal sports betting. By 2024, **over 35 states** had legalized sports betting in some form. The US legal sports betting market has grown into a multi-billion-dollar industry, with major operators like DraftKings, FanDuel, BetMGM, Caesars Sportsbook, and ESPN Bet competing for market share. The sports leagues - who had fought legalization for decades - quickly reversed course and sought partnerships with operators, inserting themselves into the regulatory process as advocates for "integrity fees."'
            },

            // SPORTS LEAGUE ABOUT-FACE AND INTEGRITY FEES
            {
              blockType: 'text',
              content: 'One of the more remarkable post-*Murphy* developments was the **sports leagues\' reversal** on sports betting. Having spent 25 years arguing that legal betting would corrupt their sports, the leagues pivoted almost immediately after *Murphy* to seeking commercial benefits from the industry they had opposed. Initially, leagues lobbied states for **"integrity fees"** - a percentage of all sports betting revenue (typically 1% of handle, which translates to roughly 20-25% of gross gaming revenue) paid to leagues ostensibly for protecting game integrity. This effort largely failed: no state adopted mandatory integrity fees. Instead, leagues have pursued **official data deals** (requiring sportsbooks to use official league data for in-game betting), **partnership deals** with operators, and **official sponsor status** for gambling companies.'
            },

            {
              blockType: 'callout',
              variant: 'info',
              title: 'Why Murphy Matters Beyond Sports Betting',
              content: 'Murphy v. NCAA established that the anti-commandeering doctrine limits Congress\'s ability to force states to maintain gambling prohibitions. This has implications beyond sports betting - advocates for federal online casino or poker legalization must consider whether any federal scheme would run into anti-commandeering issues. Murphy also reinvigorated states\' rights arguments in gambling law more broadly, giving states confidence to be more aggressive in expanding (or restricting) gambling within their borders.'
            },

            {
              blockType: 'table',
              caption: 'PASPA vs. Post-Murphy Framework',
              hasHeaders: true,
              headers: ['Aspect', 'Under PASPA (pre-2018)', 'Post-Murphy (2018+)'],
              rows: [
                ['Who could authorize sports betting', 'Only Nevada (+ 3 states with limited games)', 'Any state that passes legislation'],
                ['Federal role', 'Active prohibition through PASPA', 'Wire Act still applies; no PASPA replacement passed'],
                ['Sports leagues\' position', 'Opposed sports betting (integrity argument)', 'Partnering with operators; seeking data deals and sponsorships'],
                ['Number of legal markets', '1 full market (Nevada)', '35+ markets by 2024'],
                ['Market size', 'Nevada handles: ~$5B/year', 'National market: $100B+ in annual handle'],
                ['Primary regulatory authority', 'Federal (PASPA)', 'State-by-state (with Wire Act overlay)']
              ]
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'What constitutional doctrine did the Supreme Court use to strike down PASPA in Murphy v. NCAA?',
              tagSlugs: ['murphy-v-ncaa', 'paspa', 'federalism', 'intermediate'],
              choices: [
                'The Commerce Clause - PASPA exceeded federal power over interstate commerce',
                'The 1st Amendment - PASPA restricted free speech about sports betting',
                'The anti-commandeering doctrine - PASPA forced states to maintain federal prohibitions',
                'The Equal Protection Clause - PASPA treated states unequally'
              ],
              correctAnswer: 'The anti-commandeering doctrine - PASPA forced states to maintain federal prohibitions',
              solution: 'The Supreme Court held that PASPA violated the anti-commandeering doctrine - the constitutional principle that Congress cannot force state governments to enact or maintain laws serving federal regulatory purposes. PASPA prevented states from modifying their sports betting prohibitions, effectively commandeering state legislatures to enforce federal policy. The Court has long held this is beyond Congress\'s power.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 2,
              prompt: 'The Murphy v. NCAA decision made sports betting automatically legal across the United States.',
              tagSlugs: ['murphy-v-ncaa', 'sports-betting', 'beginner'],
              correctAnswer: 'false',
              solution: 'False. Murphy struck down PASPA, which had prohibited states from legalizing sports betting. But the decision returned the question to each state individually - states must pass their own sports betting legislation to legalize it. Murphy created the legal opportunity; states must act to take advantage of it. Additionally, the Wire Act still applies to sports betting, and any multi-state wagering activity must comply with federal law.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 3,
              prompt: 'Which of the following best describes the professional sports leagues\' position on sports betting AFTER the Murphy decision?',
              tagSlugs: ['murphy-v-ncaa', 'sports-betting', 'intermediate'],
              choices: [
                'They continued fighting sports betting legalization through new legislation',
                'They pivoted to seeking commercial partnerships and data deals with operators',
                'They supported a federal legalization bill with no commercial conditions',
                'They withdrew entirely from the sports betting debate'
              ],
              correctAnswer: 'They pivoted to seeking commercial partnerships and data deals with operators',
              solution: 'After Murphy, the sports leagues - who had spent 25 years opposing sports betting on integrity grounds - quickly reversed course and sought commercial opportunities. They lobbied for integrity fees (largely unsuccessfully), official data deals requiring use of league-licensed data for in-game betting, sponsorship relationships with operators, and official partnerships. The leagues recognized that legal sports betting would drive fan engagement and sought to monetize it.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'PASPA was described as protecting sports integrity when it was passed in 1992, yet the sports leagues reversed their position after Murphy v. NCAA in 2018. Analyze this reversal. What does it reveal about the relationship between law, economics, and regulatory positions?',
              tagSlugs: ['murphy-v-ncaa', 'paspa', 'sports-betting', 'advanced'],
              solution: 'The sports leagues\' reversal reveals that regulatory positions often reflect economic interests more than stated policy rationales. In 1992, legal sports betting represented uncompensated risk (integrity threats) with no direct financial upside for the leagues. By 2018, the offshore sports betting market had grown enormously regardless of PASPA - integrity risk existed whether betting was legal or not. Legal betting offered new revenue streams (integrity fees, official data licensing at premium rates, sponsorship dollars from operators), increased fan engagement and viewership, and opportunities to control the betting ecosystem. Once PASPA fell and legalization was inevitable, maintaining opposition would have cost the leagues commercial relationships without preventing the activity. This pattern - industries opposing regulation until they can benefit from it, then seeking to shape it - is common in regulatory history and visible across iGaming (e.g., major Las Vegas casino companies initially opposing online gambling, then becoming licensed online operators).',
              points: 3,
              isPublished: false
            }
          ]
        },

        // ----------------------------------------------------------
        // LESSON 2.4: Other Federal Laws (RICO, Travel Act, IGRA, IHA)
        // ----------------------------------------------------------
        {
          title: 'Lesson 2.4: Other Federal Laws - RICO, Travel Act, IGRA, and More',
          order: 4,
          isPublished: false,

          theoryBlocks: [
            // HOOK
            {
              blockType: 'text',
              content: 'The Wire Act, UIGEA, and PASPA/Murphy get most of the attention in US iGaming law - but they are not the only federal statutes that matter. A full picture of the federal legal landscape requires understanding several other laws that can apply to gambling operations. The RICO Act can turn gambling violations into organized crime charges. The Travel Act federalizes violations of state gambling laws. The Indian Gaming Regulatory Act creates an entirely separate framework for tribal casinos. The Interstate Horseracing Act creates a unique carve-out for online horse betting. Each of these laws adds a layer of complexity that any sophisticated iGaming operator or attorney must understand.'
            },

            // RICO
            {
              blockType: 'text',
              content: 'The **Racketeer Influenced and Corrupt Organizations Act (RICO)**, passed in 1970, was designed to combat organized crime but has become one of the most powerful tools in federal law enforcement. RICO makes it a federal crime to conduct or participate in the affairs of an "enterprise" through a "pattern of racketeering activity." The critical iGaming connection: **illegal gambling** is one of the listed predicate acts of racketeering. This means that operating an illegal gambling business that would be a crime under state law can become a RICO violation if done through an enterprise with a pattern of activity. RICO carries massive penalties - up to 20 years per count, criminal forfeiture, and civil RICO allows private plaintiffs to sue for treble (triple) damages. The DOJ used RICO-adjacent charges (bank fraud, money laundering) in the Black Friday indictments against major poker sites.'
            },

            // TRAVEL ACT
            {
              blockType: 'text',
              content: 'The **Travel Act** (18 U.S.C. § 1952), also from the Kennedy-era anti-organized-crime push, makes it a federal crime to travel in interstate commerce or use any facility of interstate commerce (including telephone wires or the internet) with intent to promote, manage, establish, or carry on any "unlawful activity" - which includes violations of state gambling laws. The Travel Act effectively **federalizes state gambling law violations**: if you use the internet (an interstate facility) to operate a gambling business that violates state law, you commit a federal crime. This gives federal prosecutors authority to charge gambling offenses even when the primary violation is of state rather than federal law. The Travel Act, combined with the Wire Act, creates a powerful federal toolkit against illegal gambling operations.'
            },

            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Diagram showing the web of federal laws applicable to iGaming. Center: iGaming Operation (represented by laptop/phone icon). Surrounding it with labeled arrows pointing inward: Wire Act (1961) - interstate wire communications for sports bets; UIGEA (2006) - payment processing for unlawful gambling; Travel Act (1952) - using interstate facilities for unlawful gambling; RICO (1970) - pattern of illegal gambling as racketeering; IGRA (1988) - tribal gaming operations; Interstate Horseracing Act - horse racing carve-out; CFTC/Commodity Exchange Act - prediction markets. Show which laws are prohibitory (red arrows) vs. enabling/exempting (green arrows). Clean spoke-and-hub diagram layout.',
              align: 'center',
              width: 'lg'
            },

            // IGRA - TRIBAL GAMING
            {
              blockType: 'text',
              content: 'The **Indian Gaming Regulatory Act (IGRA)**, passed in 1988, is one of the most unique and complex pieces of legislation in US gambling law. IGRA was passed after the Supreme Court held in *California v. Cabazon Band* (1987) that states generally could not apply their gambling laws on tribal lands. IGRA created a three-class regulatory framework:\n\n- **Class I** (traditional ceremonial games): Regulated solely by tribes\n- **Class II** (bingo, certain card games): Regulated by tribes with federal oversight through the National Indian Gaming Commission (NIGC)\n- **Class III** (casino games, slot machines, sports betting): Regulated by tribal-state compacts negotiated between tribes and states\n\nClass III gaming - the most commercially significant category - requires a negotiated compact between the tribe and the state government. These compacts define permitted games, regulatory oversight, revenue sharing, and problem gambling measures.'
            },

            // IGRA AND ONLINE GAMBLING COMPLICATIONS
            {
              blockType: 'text',
              content: 'IGRA\'s tribal gaming framework creates fascinating complications for online gambling. The core question is: when a player sitting off tribal land plays on a tribal online casino through an app or website, is that gambling "on Indian lands" protected by IGRA? The **Seminole Compact** in Florida (2021) attempted to grant a tribe a statewide online sports betting monopoly by arguing that bets are placed at the server location on tribal land, regardless of where the bettor physically sits. This legal theory - known as the "hub and spoke" model - was initially struck down by a federal district court but later upheld by the DC Circuit Court of Appeals, creating an important precedent. How IGRA applies to online gambling remains one of the most actively litigated questions in US iGaming law.'
            },

            // INTERSTATE HORSERACING ACT
            {
              blockType: 'text',
              content: 'The **Interstate Horseracing Act (IHA)** of 1978 is a notable exception to the general federal prohibition on interstate gambling. The IHA permits **off-track betting on horse races across state lines** with the consent of the relevant racing commissions and horse racing associations. This creates the legal basis for **Advance Deposit Wagering (ADW)** - online platforms like TVG, TwinSpires, and BetAmerica that allow US residents to bet on horse races online from almost anywhere in the country. ADW is one of the oldest forms of legal online gambling in the US, predating the broader iGaming debate. UIGEA explicitly carves out IHA-compliant horse racing from its payment processing prohibition.'
            },

            // THE ILLEGAL GAMBLING BUSINESS ACT
            {
              blockType: 'text',
              content: 'The **Illegal Gambling Business Act (IGBA)** (18 U.S.C. § 1955) specifically targets illegal gambling businesses operating in violation of state law. It applies to gambling businesses that: (1) violate state or local law, (2) involve five or more persons who conduct, finance, manage, supervise, direct, or own the business, and (3) have been in operation for more than 30 days OR generate gross revenues over $2,000 in any single day. The IGBA is often used alongside Travel Act and Wire Act charges in prosecutions of large illegal gambling operations. Like the Travel Act, it federalizes state law violations for sufficiently large operations.'
            },

            {
              blockType: 'callout',
              variant: 'info',
              title: 'The Federal Toolkit Against Illegal Gambling',
              content: 'Federal prosecutors combating illegal gambling have multiple overlapping tools: the Wire Act (for interstate wire communications), the Travel Act (for using any interstate facility), RICO (for organized criminal enterprises), the IGBA (for large illegal gambling businesses), and money laundering statutes. These laws are typically charged together, which dramatically increases penalties and gives prosecutors leverage in negotiations. Understanding this toolkit explains why illegal offshore operators face such serious legal risk when they can be apprehended.'
            },

            {
              blockType: 'table',
              caption: 'Other Key Federal Laws Affecting iGaming',
              hasHeaders: true,
              headers: ['Law', 'Year', 'Key Prohibition/Authorization', 'Primary Target'],
              rows: [
                ['Travel Act (18 U.S.C. § 1952)', '1952', 'Using interstate commerce facilities for unlawful gambling activities', 'Operators violating state gambling law via internet'],
                ['RICO (18 U.S.C. §§ 1961-1968)', '1970', 'Pattern of racketeering activity including illegal gambling', 'Organized gambling enterprises'],
                ['IGBA (18 U.S.C. § 1955)', '1970', 'Illegal gambling businesses with 5+ persons violating state law', 'Large-scale illegal gambling operations'],
                ['IGRA (25 U.S.C. §§ 2701-2721)', '1988', 'Framework for tribal casino gaming (Class I, II, III)', 'Tribal gaming operations'],
                ['Interstate Horseracing Act', '1978', 'Authorizes interstate off-track horse race betting with consent', 'ADW online horse betting platforms'],
                ['Money Laundering Statutes (18 U.S.C. §§ 1956-1957)', 'Various', 'Prohibit financial transactions involving illegal gambling proceeds', 'Anyone moving money from illegal gambling']
              ]
            }
          ],

          tasks: [
            {
              type: 'MULTIPLE_CHOICE',
              order: 1,
              prompt: 'Under IGRA, which class of gaming requires a negotiated compact between a tribe and the state government?',
              tagSlugs: ['igra', 'tribal-gaming', 'intermediate'],
              choices: [
                'Class I (traditional ceremonial games)',
                'Class II (bingo and certain card games)',
                'Class III (casino games, slots, sports betting)',
                'All classes of gaming require state compacts'
              ],
              correctAnswer: 'Class III (casino games, slots, sports betting)',
              solution: 'IGRA divides tribal gaming into three classes. Class I (traditional games) is regulated solely by tribes. Class II (bingo, certain card games) requires tribal-federal oversight through the NIGC. Class III - the most commercially significant category, including casino table games, slot machines, and sports betting - requires a compact negotiated between the tribe and the state government. These compacts define what games are permitted, how they are regulated, and how revenues are shared.',
              points: 1,
              isPublished: false
            },
            {
              type: 'MULTIPLE_CHOICE',
              order: 2,
              prompt: 'What makes the Travel Act particularly powerful as a federal gambling enforcement tool?',
              tagSlugs: ['us-gambling-law', 'intermediate'],
              choices: [
                'It carries higher penalties than any other federal law',
                'It applies to individual bettors, not just operators',
                'It federalizes state gambling law violations when interstate facilities (like the internet) are used',
                'It applies only to land-based gambling, not online operations'
              ],
              correctAnswer: 'It federalizes state gambling law violations when interstate facilities (like the internet) are used',
              solution: 'The Travel Act\'s power comes from its ability to turn state gambling law violations into federal crimes whenever interstate facilities are used. Since the internet is inherently interstate, virtually any online gambling operation that violates state law also violates the federal Travel Act. This gives federal prosecutors authority over gambling offenses regardless of which state\'s law is violated and significantly expands the reach of federal enforcement.',
              points: 1,
              isPublished: false
            },
            {
              type: 'TRUE_FALSE',
              order: 3,
              prompt: 'The Interstate Horseracing Act (IHA) is an exception to federal gambling law that permits interstate online betting on horse races.',
              tagSlugs: ['us-gambling-law', 'intermediate'],
              correctAnswer: 'true',
              solution: 'True. The IHA permits interstate off-track betting on horse races with the consent of the relevant racing commissions and horse racing associations. This is the legal basis for Advance Deposit Wagering (ADW) platforms - online sites like TVG and TwinSpires that allow betting on horses from across the US. UIGEA also explicitly carves out IHA-compliant horse racing from its payment processing restrictions, making horse race betting one of the longest-established forms of legal online gambling in the United States.',
              points: 1,
              isPublished: false
            },
            {
              type: 'OPEN_ENDED',
              order: 4,
              prompt: 'Explain the legal theory behind the "hub and spoke" model of tribal online gambling, as used in the Seminole Compact in Florida. Why is this theory legally significant and what are its implications for the future of online gambling and IGRA?',
              tagSlugs: ['igra', 'tribal-gaming', 'advanced'],
              solution: 'The hub and spoke theory argues that when a player bets through an online platform or app on tribal casino games, the bet is legally "placed" at the server location - which is on tribal land - regardless of where the player physically sits. Under this theory, the player\'s device is just an input terminal; the actual gambling transaction occurs at the server hub on tribal land, bringing it within IGRA\'s protection for gaming "on Indian lands." This was the core of the Seminole Compact in Florida, which attempted to give the Seminole Tribe an effective statewide monopoly on online sports betting. The DC Circuit ultimately upheld this theory. Its significance is substantial: if widely adopted, it could allow tribes to offer online gambling statewide (or potentially nationwide) without state legislative authorization, bypassing the state-by-state legalization framework that currently governs non-tribal online gambling. This could dramatically reshape the competitive landscape of US iGaming and create significant uncertainty about which state laws apply to tribal online gambling operations.',
              points: 3,
              isPublished: false
            }
          ]
        }
      ]
    }
  ]
};
