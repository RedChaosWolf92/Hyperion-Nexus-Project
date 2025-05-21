/* Hyperion Nexus Text-Based Game Logic                                     */
/*                                                                          */
/* This script manages the UI, questions, choices, and game progression     */
/* for the Hyperion Nexus game.                                             */
/****************************************************************************/

// Import game state and core logic from gameState.js module
import { gameState, initializeGame, handleChoice, getTopCulturalPathways, downloadChoiceHistoryCSV } from './gameState.js';

// Import phase management functions from phaseManager.js module
import { 
    showSpeciesCreationQuestion,
    showSpeciesSummary,
    showStarshipCreationQuestion,
    showStarshipSummary,
    showRoleSelectionInitial,
    showKScaleEvent,
    showRoleChangeDecision,
    showGameEnd
} from './phaseManager.js';

// Make core functions available to the global scope for HTML event handlers
window.initializeGame = initializeGame;
window.handleChoice = handleChoice;
window.downloadChoiceHistoryCSV = downloadChoiceHistoryCSV;
window.getTopCulturalPathways = getTopCulturalPathways;

// Make phase management functions available to the global scope
window.showSpeciesCreationQuestion = showSpeciesCreationQuestion;
window.showSpeciesSummary = showSpeciesSummary;
window.showStarshipCreationQuestion = showStarshipCreationQuestion;
window.showStarshipSummary = showStarshipSummary;
window.showRoleSelectionInitial = showRoleSelectionInitial;
window.showKScaleEvent = showKScaleEvent;
window.showRoleChangeDecision = showRoleChangeDecision;
window.showGameEnd = showGameEnd;

// --- Player Roles ---
const playerRoles = [
    "Captain", "Civilization Leader"
];

// Make data structures available to the gameState module
window.playerRoles = playerRoles;

// --- Species Creation Questions ---
const speciesCreationQuestions = [
    {
        id: "scq1_morphology",
        text: "From the myriad forms life can take, what fundamental morphology defines your nascent species as it reaches for the stars?",
        choices: [
            { id: "c1", text: "Humanoid Adaptability: A bipedal, tool-using form, inherently versatile.", effects: { science: 5, military: 5, ecological: 5, subversive: 5, psychic: 0 } },
            { id: "c2", text: "Avian Grace & Perception: Feathered/membranous wings, keen eyesight.", effects: { science: 10, ecological: 10, military: 0, subversive: 0, psychic: 0 } },
            { id: "c3", text: "Insectoid Resilience & Collectivism: Exoskeletal form, multiple limbs, collective behavior.", effects: { military: 10, subversive: 10, ecological: 0, science: 0, psychic: 0 } },
            { id: "c4", text: "Aquatic Depth & Mystery: Adapted to liquid, unique senses.", effects: { ecological: 10, psychic: 10, science: 0, military: 0, subversive: 0 } },
            { id: "c5", text: "Amorphous Flexibility: Protean form, masters of infiltration/survival.", effects: { subversive: 15, ecological: 5, psychic: 0, science: 0, military: 0 } }
        ]
    },
    {
        id: "scq2_sensory_organ",
        text: "How does your species primarily perceive the universe around it?",
        choices: [
            { id: "c1", text: "Advanced Visual Acuity: Wide spectrum, exceptional detail.", effects: { science: 10, military: 5 } },
            { id: "c2", text: "Sophisticated Auditory Reception: Subtle vibrations, vast frequencies.", effects: { subversive: 10, psychic: 5 } },
            { id: "c3", text: "Acute Chemo-Reception: Advanced smell/taste, chemical analysis.", effects: { ecological: 10, subversive: 5 } },
            { id: "c4", text: "Electro-Magnetic Sensitivity: Sense/manipulate EM fields.", effects: { science: 15, psychic: 5 } },
            { id: "c5", text: "Psionic Resonance: Innate connection to psionic field, perception of thoughts/emotions.", effects: { psychic: 20 } }
        ]
    },
    {
        id: "scq3_cognitive_foundation",
        text: "What is the foundational cognitive trait of your people?",
        choices: [
            { id: "c1", text: "Unyielding Logic & Analysis.", effects: { science: 20, psychic: -5 } },
            { id: "c2", text: "Deep Intuition & Empathy.", effects: { psychic: 15, ecological: 5 } },
            { id: "c3", text: "Pragmatic Adaptability & Ingenuity.", effects: { subversive: 10, military: 5, science: 5 } },
            { id: "c4", text: "Disciplined Martial Focus.", effects: { military: 20, psychic: -5 } },
            { id: "c5", text: "Harmonious Ecological Attunement.", effects: { ecological: 20 } }
        ]
    },
    {
        id: "scq4_native_environment",
        text: "What type of world did your species arise from?",
        choices: [
            { id: "c1", text: "Lush Terran World: Temperate, life-rich, diverse biomes.", effects: { ecological: 15, science: 5 } },
            { id: "c2", text: "Harsh Arid/Desert World: Scarce water, extreme temperatures.", effects: { military: 10, subversive: 5 } },
            { id: "c3", text: "Frozen Ice World/Moon: Frigid, life near geothermal vents.", effects: { science: 10, ecological: 5 } },
            { id: "c4", text: "Volcanic/Geothermal World: Geologically active, volatile surface.", effects: { military: 10, science: 5 } },
            { id: "c5", text: "Low-Gravity/Asteroid Belt Habitat: Microgravity, unique physiologies.", effects: { subversive: 10, science: 5 } }
        ]
    },
    {
        id: "scq5_social_structure",
        text: "What is the most fundamental aspect of your species' social structure?",
        choices: [
            { id: "c1", text: "Egalitarian Collectives: Decentralized, consensus-based.", effects: { ecological: 10, psychic: 5, military: -5 } },
            { id: "c2", text: "Hierarchical Meritocracy: Structure based on ability/contribution.", effects: { science: 10, military: 5 } },
            { id: "c3", text: "Familial/Clan-Based Loyalty: Kin-groups, tradition, mutual defense.", effects: { military: 10, ecological: 5 } },
            { id: "c4", text: "Individualistic & Competitive: Values autonomy, internal competition.", effects: { subversive: 10, science: 5, psychic: -5 } },
            { id: "c5", text: "Psionically-Linked Commune: Unity through mental connection.", effects: { psychic: 15, ecological: 5 } }
        ]
    }
];

// Make species creation questions available to the gameState module
window.speciesCreationQuestions = speciesCreationQuestions;

// --- Starship Creation Questions ---
const starshipCreationQuestions = [
    {
        id: "ssq1_hull_philosophy",
        text: "Your first warp-capable starship, the {starshipName}, is on the design table. What is the primary design philosophy for its hull structure?",
        choices: [
            { id: "c1", text: "Elegant Efficiency: Streamlined, minimal, optimized for scientific exploration.", effects: { science: 15, military: -5 } },
            { id: "c2", text: "Imposing Bulwark: Heavily armored, intimidating silhouette.", effects: { military: 15, science: -5 } },
            { id: "c3", text: "Biomimetic Architecture: Inspired by natural forms, living materials.", effects: { ecological: 15, subversive: -5 } },
            { id: "c4", text: "Adaptive Camouflage: Variable geometry, sensor-defeating surfaces.", effects: { subversive: 15, ecological: -5 } },
            { id: "c5", text: "Psionic Resonator: Consciousness-responsive materials, thought-amplifying geometry.", effects: { psychic: 15, military: -5 } }
        ]
    },
    {
        id: "ssq2_propulsion",
        text: "What propulsion philosophy guides the {starshipName}'s warp drive design?",
        choices: [
            { id: "c1", text: "Precision Warp Mechanics: Mathematically perfect field geometry, exceptional efficiency.", effects: { science: 15, ecological: -5 } },
            { id: "c2", text: "Overbuilt Power Systems: Massive energy output, military-grade redundancy.", effects: { military: 15, psychic: -5 } },
            { id: "c3", text: "Bioneural Field Harmonics: Living components, self-healing warp field.", effects: { ecological: 15, military: -5 } },
            { id: "c4", text: "Stealth Field Integration: Minimal signature, unpredictable vector capabilities.", effects: { subversive: 15, science: -5 } },
            { id: "c5", text: "Consciousness-Guided Warp: Psionic amplification chambers, thought-responsive controls.", effects: { psychic: 15, subversive: -5 } }
        ]
    },
    {
        id: "ssq3_computer_systems",
        text: "What computational approach will the {starshipName} utilize for its core systems?",
        choices: [
            { id: "c1", text: "Advanced Quantum Processing: Cutting-edge algorithms, predictive modeling.", effects: { science: 15, subversive: -5 } },
            { id: "c2", text: "Hardened Military Networks: Secure, redundant, optimized for tactical operations.", effects: { military: 15, ecological: -5 } },
            { id: "c3", text: "Organic Computing Matrix: Grown neural networks, intuitive interfaces.", effects: { ecological: 15, science: -5 } },
            { id: "c4", text: "Distributed Mesh Intelligence: Decentralized, adaptive, difficult to compromise.", effects: { subversive: 15, psychic: -5 } },
            { id: "c5", text: "Psionic Interface Systems: Direct mental connection, thought-responsive.", effects: { psychic: 15, science: -5 } }
        ]
    },
    {
        id: "ssq4_crew_quarters",
        text: "How are the living spaces aboard the {starshipName} designed?",
        choices: [
            { id: "c1", text: "Research-Optimized Environment: Integrated labs, data access, collaborative spaces.", effects: { science: 10, ecological: 5 } },
            { id: "c2", text: "Military Efficiency: Compact, functional, designed for rapid response.", effects: { military: 10, subversive: 5 } },
            { id: "c3", text: "Biophilic Habitats: Living gardens, natural materials, harmonious design.", effects: { ecological: 10, psychic: 5 } },
            { id: "c4", text: "Adaptable Personal Spaces: Customizable, private, respecting individual autonomy.", effects: { subversive: 10, science: 5 } },
            { id: "c5", text: "Meditation-Enhancing Chambers: Quiet spaces, psionic amplifiers, consciousness-expanding design.", effects: { psychic: 10, ecological: 5 } }
        ]
    },
    {
        id: "ssq5_mission_profile",
        text: "What primary mission profile will the {starshipName} be optimized for?",
        choices: [
            { id: "c1", text: "Scientific Exploration: Sensor arrays, research facilities, discovery-focused.", effects: { science: 20, military: -10 } },
            { id: "c2", text: "Defense & Security: Weapons systems, tactical capabilities, protective role.", effects: { military: 20, ecological: -10 } },
            { id: "c3", text: "Ecological Survey & Preservation: Environmental monitoring, conservation capabilities.", effects: { ecological: 20, subversive: -10 } },
            { id: "c4", text: "Covert Operations & Intelligence: Stealth systems, infiltration capabilities.", effects: { subversive: 20, psychic: -10 } },
            { id: "c5", text: "Psionic Research & Development: Consciousness studies, mental enhancement.", effects: { psychic: 20, science: -10 } }
        ]
    }
];

// Make starship creation questions available to the gameState module
window.starshipCreationQuestions = starshipCreationQuestions;

// --- K-Scale Events ---
// Organized by K-Scale level (0.9 to 1.5)
const kScaleEvents = {
    "0.9": [
        {
            id: "k09_e1",
            text_template: "Year {gameYear}: Your civilization has developed its first warp-capable vessels, allowing exploration beyond your home system. The {starshipName} encounters a derelict alien vessel of unknown origin. How do you proceed?",
            choices: [
                { id: "c1", text: "Scientific Analysis: Carefully study from a distance before any boarding action.", effects: { science: 10 } },
                { id: "c2", text: "Military Caution: Secure and board with armed teams, prioritizing crew safety.", effects: { military: 10 } },
                { id: "c3", text: "Ecological Assessment: Scan for biological hazards and quarantine protocols.", effects: { ecological: 10 } },
                { id: "c4", text: "Covert Infiltration: Send a small, undetectable team to gather intelligence.", effects: { subversive: 10 } },
                { id: "c5", text: "Psionic Probe: Attempt to sense any lingering consciousness or impressions.", effects: { psychic: 10 } }
            ]
        },
        {
            id: "k09_e2",
            text_template: "Year {gameYear}: A neighboring star system has been detected with a habitable planet. Initial scans show primitive life but no sapient species. Your approach to this discovery is:",
            choices: [
                { id: "c1", text: "Establish a research outpost to study evolutionary patterns.", effects: { science: 10, ecological: 5 } },
                { id: "c2", text: "Secure the system with a military presence to protect future interests.", effects: { military: 10, science: 5 } },
                { id: "c3", text: "Create a minimal-impact observation post to protect developing life.", effects: { ecological: 10, psychic: 5 } },
                { id: "c4", text: "Quietly establish hidden monitoring to assess resource potential.", effects: { subversive: 10, science: 5 } },
                { id: "c5", text: "Send psionic specialists to commune with the planet's developing consciousness.", effects: { psychic: 10, ecological: 5 } }
            ]
        },
        {
            id: "k09_e3",
            text_template: "Year {gameYear}: Your civilization's first interstellar colony is being planned. The colony ship design prioritizes:",
            choices: [
                { id: "c1", text: "Advanced laboratories and educational facilities for continued research.", effects: { science: 15 } },
                { id: "c2", text: "Defensive systems and military training facilities for security.", effects: { military: 15 } },
                { id: "c3", text: "Sustainable ecosystems and minimal environmental impact technologies.", effects: { ecological: 15 } },
                { id: "c4", text: "Self-sufficiency and independence from central authority.", effects: { subversive: 15 } },
                { id: "c5", text: "Communal living designed to strengthen psionic connections.", effects: { psychic: 15 } }
            ]
        },
        {
            id: "k09_e4",
            text_template: "Year {gameYear}: A resource-rich asteroid belt has been discovered in a nearby system. Your approach to this opportunity is:",
            choices: [
                { id: "c1", text: "Develop new extraction technologies to maximize efficiency.", effects: { science: 10, military: 5 } },
                { id: "c2", text: "Establish a military presence to secure exclusive mining rights.", effects: { military: 10, science: 5 } },
                { id: "c3", text: "Implement careful harvesting to minimize spatial ecosystem disruption.", effects: { ecological: 10, science: 5 } },
                { id: "c4", text: "Quietly establish operations without alerting potential competitors.", effects: { subversive: 10, military: 5 } },
                { id: "c5", text: "Search for unique minerals that might enhance psionic abilities.", effects: { psychic: 10, science: 5 } }
            ]
        },
        {
            id: "k09_e5",
            text_template: "Year {gameYear}: Your civilization detects unusual signals from deep space, possibly artificial. Your response is to:",
            choices: [
                { id: "c1", text: "Devote significant scientific resources to analyzing and responding.", effects: { science: 15, psychic: -5 } },
                { id: "c2", text: "Prepare defensive measures while sending a cautious response.", effects: { military: 15, science: -5 } },
                { id: "c3", text: "Send messages emphasizing peaceful coexistence and ecological harmony.", effects: { ecological: 15, military: -5 } },
                { id: "c4", text: "Monitor the signals while concealing your civilization's location.", effects: { subversive: 15, science: -5 } },
                { id: "c5", text: "Attempt to establish psionic contact across the vast distances.", effects: { psychic: 15, subversive: -5 } }
            ]
        },
        {
            id: "k09_e6",
            text_template: "Year {gameYear}: The {starshipName} discovers evidence of an ancient alien outpost. Your priority becomes:",
            choices: [
                { id: "c1", text: "Analyzing the technology for scientific advancement.", effects: { science: 10, ecological: -5 } },
                { id: "c2", text: "Securing any weapons or defensive systems for study.", effects: { military: 10, psychic: -5 } },
                { id: "c3", text: "Understanding how the outpost integrated with its environment.", effects: { ecological: 10, military: -5 } },
                { id: "c4", text: "Keeping the discovery secret while extracting valuable data.", effects: { subversive: 10, ecological: -5 } },
                { id: "c5", text: "Searching for any psionic artifacts or consciousness imprints.", effects: { psychic: 10, science: -5 } }
            ]
        }
    ],
    "1.1": [
        {
            id: "k11_e1",
            text_template: "Year {gameYear}: With improved warp technology, your civilization encounters its first clearly sapient alien species. Your approach to first contact is:",
            choices: [
                { id: "c1", text: "Scientific exchange: Offer knowledge and technological insights.", effects: { science: 15, military: -5 } },
                { id: "c2", text: "Cautious diplomacy: Establish clear boundaries and show strength.", effects: { military: 15, ecological: -5 } },
                { id: "c3", text: "Cultural sharing: Focus on ecological knowledge and sustainable practices.", effects: { ecological: 15, subversive: -5 } },
                { id: "c4", text: "Limited engagement: Share minimal information while gathering intelligence.", effects: { subversive: 15, psychic: -5 } },
                { id: "c5", text: "Consciousness bridge: Attempt to establish psionic understanding.", effects: { psychic: 15, science: -5 } }
            ]
        },
        {
            id: "k11_e2",
            text_template: "Year {gameYear}: A neighboring civilization proposes a joint research initiative. Your contribution focuses on:",
            choices: [
                { id: "c1", text: "Advanced propulsion theory and practical applications.", effects: { science: 10, military: 5 } },
                { id: "c2", text: "Defensive systems and security protocols.", effects: { military: 10, science: 5 } },
                { id: "c3", text: "Sustainable terraforming and ecosystem management.", effects: { ecological: 10, psychic: 5 } },
                { id: "c4", text: "Information systems and data encryption.", effects: { subversive: 10, science: 5 } },
                { id: "c5", text: "Consciousness studies and mental enhancement.", effects: { psychic: 10, ecological: 5 } }
            ]
        },
        {
            id: "k11_e3",
            text_template: "Year {gameYear}: A rare stellar phenomenon threatens a developing colony. Your approach to this crisis is:",
            choices: [
                { id: "c1", text: "Deploy experimental shield technology to protect the colony.", effects: { science: 15, ecological: -5 } },
                { id: "c2", text: "Mobilize a fleet for emergency evacuation and defense.", effects: { military: 15, subversive: -5 } },
                { id: "c3", text: "Adapt colony infrastructure to work with the phenomenon.", effects: { ecological: 15, military: -5 } },
                { id: "c4", text: "Relocate key personnel and resources covertly before public action.", effects: { subversive: 15, psychic: -5 } },
                { id: "c5", text: "Attempt to influence the phenomenon through concentrated psionic effort.", effects: { psychic: 15, science: -5 } }
            ]
        },
        {
            id: "k11_e4",
            text_template: "Year {gameYear}: Your civilization discovers an ancient data repository of a long-extinct species. You prioritize:",
            choices: [
                { id: "c1", text: "Scientific knowledge: Focus on technological and theoretical data.", effects: { science: 10, psychic: 5 } },
                { id: "c2", text: "Military history: Study their conflicts, weapons, and downfall.", effects: { military: 10, science: 5 } },
                { id: "c3", text: "Ecological insights: Learn how they interacted with their environments.", effects: { ecological: 10, military: 5 } },
                { id: "c4", text: "Cultural intelligence: Understand their societal structures and weaknesses.", effects: { subversive: 10, ecological: 5 } },
                { id: "c5", text: "Consciousness patterns: Study their mental and spiritual development.", effects: { psychic: 10, subversive: 5 } }
            ]
        },
        {
            id: "k11_e5",
            text_template: "Year {gameYear}: A territorial dispute arises with another spacefaring civilization. Your approach is:",
            choices: [
                { id: "c1", text: "Propose a joint scientific outpost to share the disputed region.", effects: { science: 15, subversive: -5 } },
                { id: "c2", text: "Establish a clear military presence while opening diplomatic channels.", effects: { military: 15, ecological: -5 } },
                { id: "c3", text: "Suggest a nature preserve with limited access for both civilizations.", effects: { ecological: 15, military: -5 } },
                { id: "c4", text: "Appear to concede while establishing hidden operations in the region.", effects: { subversive: 15, science: -5 } },
                { id: "c5", text: "Send psionic diplomats to understand their true intentions and find harmony.", effects: { psychic: 15, military: -5 } }
            ]
        },
        {
            id: "k11_e6",
            text_template: "Year {gameYear}: Your civilization has the opportunity to establish an interstellar alliance. Your primary contribution would be:",
            choices: [
                { id: "c1", text: "Research coordination: Leading collaborative scientific initiatives.", effects: { science: 10, military: -5 } },
                { id: "c2", text: "Security council: Organizing mutual defense and peacekeeping.", effects: { military: 10, subversive: -5 } },
                { id: "c3", text: "Environmental standards: Establishing sustainable development protocols.", effects: { ecological: 10, science: -5 } },
                { id: "c4", text: "Intelligence network: Creating information sharing systems.", effects: { subversive: 10, ecological: -5 } },
                { id: "c5", text: "Consciousness collective: Developing interspecies understanding.", effects: { psychic: 10, military: -5 } }
            ]
        }
    ],
    "1.3": [
        {
            id: "k13_e1",
            text_template: "Year {gameYear}: Transwarp technology now allows rapid travel between distant systems. Your civilization prioritizes its use for:",
            choices: [
                { id: "c1", text: "Establishing a network of scientific outposts across the sector.", effects: { science: 15, subversive: -5 } },
                { id: "c2", text: "Creating a rapid-response defense network for colonial protection.", effects: { military: 15, ecological: -5 } },
                { id: "c3", text: "Connecting ecological preserves to maintain biodiversity across worlds.", effects: { ecological: 15, military: -5 } },
                { id: "c4", text: "Developing hidden transwarp corridors for covert operations.", effects: { subversive: 15, psychic: -5 } },
                { id: "c5", text: "Exploring consciousness effects of transwarp on connected minds.", effects: { psychic: 15, science: -5 } }
            ]
        },
        {
            id: "k13_e2",
            text_template: "Year {gameYear}: A previously unknown precursor artifact has been activated, causing unusual phenomena. Your approach is:",
            choices: [
                { id: "c1", text: "Establish a research quarantine to study effects methodically.", effects: { science: 10, psychic: 5 } },
                { id: "c2", text: "Secure the artifact and restrict access to military personnel.", effects: { military: 10, science: 5 } },
                { id: "c3", text: "Study how the artifact interacts with and alters local environments.", effects: { ecological: 10, subversive: 5 } },
                { id: "c4", text: "Conceal the discovery while determining its strategic value.", effects: { subversive: 10, military: 5 } },
                { id: "c5", text: "Send psionic specialists to commune with the artifact's consciousness.", effects: { psychic: 10, ecological: 5 } }
            ]
        },
        {
            id: "k13_e3",
            text_template: "Year {gameYear}: Your civilization must decide how to develop a newly discovered habitable planet. The priority becomes:",
            choices: [
                { id: "c1", text: "A center for advanced research with minimal population.", effects: { science: 15, military: -5 } },
                { id: "c2", text: "A strategic military outpost and training facility.", effects: { military: 15, psychic: -5 } },
                { id: "c3", text: "A model of human-environment harmony with careful development.", effects: { ecological: 15, subversive: -5 } },
                { id: "c4", text: "A self-governing colony with limited central oversight.", effects: { subversive: 15, science: -5 } },
                { id: "c5", text: "A retreat for psionic development and consciousness exploration.", effects: { psychic: 15, military: -5 } }
            ]
        },
        {
            id: "k13_e4",
            text_template: "Year {gameYear}: A neighboring civilization experiences a catastrophic disaster. Your response is to:",
            choices: [
                { id: "c1", text: "Offer advanced technological solutions to the immediate crisis.", effects: { science: 10, ecological: 5 } },
                { id: "c2", text: "Provide security forces to maintain order during relief efforts.", effects: { military: 10, subversive: 5 } },
                { id: "c3", text: "Send ecological specialists to prevent cascading environmental damage.", effects: { ecological: 10, science: 5 } },
                { id: "c4", text: "Use the chaos to establish covert influence in their recovery.", effects: { subversive: 10, military: 5 } },
                { id: "c5", text: "Dispatch psionic healers to address collective trauma.", effects: { psychic: 10, ecological: 5 } }
            ]
        },
        {
            id: "k13_e5",
            text_template: "Year {gameYear}: Your civilization detects unusual spatial anomalies that could revolutionize travel. You focus on:",
            choices: [
                { id: "c1", text: "Scientific understanding: Develop theories to explain and utilize the phenomena.", effects: { science: 15, ecological: -5 } },
                { id: "c2", text: "Military applications: Secure the anomalies and develop tactical advantages.", effects: { military: 15, psychic: -5 } },
                { id: "c3", text: "Environmental impact: Study how these anomalies affect space-time ecosystems.", effects: { ecological: 15, subversive: -5 } },
                { id: "c4", text: "Strategic control: Establish hidden monitoring of all anomalies.", effects: { subversive: 15, science: -5 } },
                { id: "c5", text: "Consciousness exploration: Investigate how minds interact with these phenomena.", effects: { psychic: 15, military: -5 } }
            ]
        },
        {
            id: "k13_e6",
            text_template: "Year {gameYear}: An ancient, dormant artificial intelligence has been discovered. Your civilization decides to:",
            choices: [
                { id: "c1", text: "Study its code and architecture to advance your own AI research.", effects: { science: 10, subversive: 5 } },
                { id: "c2", text: "Analyze its capabilities for potential security threats before activation.", effects: { military: 10, science: 5 } },
                { id: "c3", text: "Understand its original purpose in its creator's ecosystem.", effects: { ecological: 10, psychic: 5 } },
                { id: "c4", text: "Extract its knowledge while keeping the discovery classified.", effects: { subversive: 10, ecological: 5 } },
                { id: "c5", text: "Attempt to establish a consciousness link to understand its experiences.", effects: { psychic: 10, science: 5 } }
            ]
        }
    ],
    "1.5": [
        {
            id: "k15_e1",
            text_template: "Year {gameYear}: Jump drive technology now allows near-instantaneous travel across vast distances. Your civilization's priority for this breakthrough is:",
            choices: [
                { id: "c1", text: "Establishing research outposts in previously unreachable regions.", effects: { science: 15, military: -5 } },
                { id: "c2", text: "Creating a rapid deployment network for your military forces.", effects: { military: 15, ecological: -5 } },
                { id: "c3", text: "Connecting isolated biospheres to preserve genetic diversity.", effects: { ecological: 15, subversive: -5 } },
                { id: "c4", text: "Developing undetectable jump signatures for covert operations.", effects: { subversive: 15, science: -5 } },
                { id: "c5", text: "Exploring the consciousness implications of instantaneous travel.", effects: { psychic: 15, military: -5 } }
            ]
        },
        {
            id: "k15_e2",
            text_template: "Year {gameYear}: Evidence suggests a precursor civilization may have ascended beyond physical form. Your approach to this discovery is:",
            choices: [
                { id: "c1", text: "Scientific investigation: Analyze all physical evidence of the transition.", effects: { science: 10, psychic: 5 } },
                { id: "c2", text: "Security assessment: Determine if they pose a potential threat.", effects: { military: 10, subversive: 5 } },
                { id: "c3", text: "Ecological study: Understand how their ascension affected their worlds.", effects: { ecological: 10, science: 5 } },
                { id: "c4", text: "Strategic evaluation: Keep findings classified while assessing implications.", effects: { subversive: 10, psychic: 5 } },
                { id: "c5", text: "Consciousness research: Attempt to make contact with their ascended state.", effects: { psychic: 10, ecological: 5 } }
            ]
        },
        {
            id: "k15_e3",
            text_template: "Year {gameYear}: Your civilization has developed the capacity to engineer planetary environments. This technology will be used to:",
            choices: [
                { id: "c1", text: "Create ideal conditions for scientific research and experimentation.", effects: { science: 15, ecological: -5 } },
                { id: "c2", text: "Establish strategically positioned fortress worlds.", effects: { military: 15, psychic: -5 } },
                { id: "c3", text: "Restore damaged ecosystems and enhance biodiversity.", effects: { ecological: 15, military: -5 } },
                { id: "c4", text: "Develop hidden sanctuary worlds beyond official records.", effects: { subversive: 15, science: -5 } },
                { id: "c5", text: "Design environments that enhance psionic development.", effects: { psychic: 15, subversive: -5 } }
            ]
        },
        {
            id: "k15_e4",
            text_template: "Year {gameYear}: Contact has been made with a highly advanced civilization. Your approach to this relationship is:",
            choices: [
                { id: "c1", text: "Knowledge exchange: Seek to learn their scientific advancements.", effects: { science: 10, military: 5 } },
                { id: "c2", text: "Defensive preparation: Maintain strength while establishing diplomacy.", effects: { military: 10, ecological: 5 } },
                { id: "c3", text: "Ecological learning: Study their long-term environmental practices.", effects: { ecological: 10, subversive: 5 } },
                { id: "c4", text: "Information gathering: Assess their weaknesses while appearing open.", effects: { subversive: 10, science: 5 } },
                { id: "c5", text: "Consciousness sharing: Establish deep psionic connections.", effects: { psychic: 10, military: 5 } }
            ]
        },
        {
            id: "k15_e5",
            text_template: "Year {gameYear}: Your civilization discovers technology that could potentially alter the fabric of reality. Your approach is:",
            choices: [
                { id: "c1", text: "Careful research: Establish extensive safeguards and theoretical models.", effects: { science: 15, subversive: -5 } },
                { id: "c2", text: "Security containment: Restrict access to military oversight.", effects: { military: 15, psychic: -5 } },
                { id: "c3", text: "Holistic evaluation: Study potential impacts on universal ecosystems.", effects: { ecological: 15, science: -5 } },
                { id: "c4", text: "Controlled application: Test capabilities through deniable operations.", effects: { subversive: 15, ecological: -5 } },
                { id: "c5", text: "Consciousness integration: Explore how minds can safely interface with it.", effects: { psychic: 15, military: -5 } }
            ]
        },
        {
            id: "k15_e6",
            text_template: "Year {gameYear}: As your civilization reaches the threshold of a new era, the focus for future development becomes:",
            choices: [
                { id: "c1", text: "Technological transcendence: Merging with advanced AI and machine systems.", effects: { science: 10, ecological: 5 } },
                { id: "c2", text: "Galactic security: Establishing your civilization as a dominant power.", effects: { military: 10, psychic: 5 } },
                { id: "c3", text: "Universal harmony: Creating a perfect balance between all forms of life.", effects: { ecological: 10, military: 5 } },
                { id: "c4", text: "Shadow autonomy: Developing hidden systems independent of galactic politics.", effects: { subversive: 10, science: 5 } },
                { id: "c5", text: "Psionic ascension: Evolving consciousness beyond physical limitations.", effects: { psychic: 10, subversive: 5 } }
            ]
        }
    ]
};

// Make K-Scale events available to the gameState module
window.kScaleEvents = kScaleEvents;

/**
 * Clears the game UI elements
 */
function clearGameUI() {
    try {
        const choiceArea = document.getElementById("choice-area");
        const storyArea = document.getElementById("storyArea");
        const resultsArea = document.getElementById("results-area");
        
        if (!choiceArea || !storyArea || !resultsArea) {
            throw new Error("One or more UI elements missing for clearing");
        }
        
        choiceArea.innerHTML = "";
        storyArea.innerHTML = "";
        resultsArea.style.display = "none";
        
        return true;
    } catch (error) {
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.UI, { action: 'clearGameUI' });
            window.HyperionErrorHandling.displayErrorToUser("Error clearing game interface.", null, false);
        } else {
            console.error("Error in clearGameUI:", error);
        }
        return false;
    }
}

// Make clearGameUI available to the gameState module
window.clearGameUI = clearGameUI;

/**
 * Updates the status bar with current game state information
 */
function updateStatusBar() {
    try {
        const statusBar = document.getElementById("status-bar");
        if (!statusBar) {
            throw new Error("Status bar element not found");
        }
        
        const topPathways = getTopCulturalPathways();
        let pathwayText = "";
        
        if (topPathways && topPathways.length > 0) {
            pathwayText = `Top Cultural Pathways: ${topPathways[0].name.charAt(0).toUpperCase() + topPathways[0].name.slice(1)} (${topPathways[0].value})`;
            if (topPathways.length > 1) {
                pathwayText += `, ${topPathways[1].name.charAt(0).toUpperCase() + topPathways[1].name.slice(1)} (${topPathways[1].value})`;
            }
        }
        
        statusBar.innerHTML = `Year: ${gameState.gameYear} | K-Scale: ${gameState.currentKScale.toFixed(1)} | Role: ${gameState.playerRole || "Undecided"} | ${pathwayText}`;
        
        return true;
    } catch (error) {
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.UI, { action: 'updateStatusBar' });
            window.HyperionErrorHandling.displayErrorToUser("Error updating status information.", null, false);
        } else {
            console.error("Error in updateStatusBar:", error);
        }
        return false;
    }
}

// Make updateStatusBar available to the gameState module
window.updateStatusBar = updateStatusBar;

/**
 * Displays the current game state based on phase and other factors
 */
function displayCurrentState() {
    try {
        const choiceArea = document.getElementById("choice-area");
        const storyArea = document.getElementById("storyArea");
        const debugLog = document.getElementById("debugLog");
        
        if (!choiceArea || !storyArea) {
            throw new Error("Required UI elements missing for displaying game state");
        }
        
        if (debugLog) debugLog.innerHTML += `DEBUG: displayCurrentState - Phase: ${gameState.gamePhase}, QIndex: ${gameState.currentQuestionIndex}, EventCounter: ${gameState.eventCounter}<br>`;
        
        clearGameUI();
        updateStatusBar();
        
        if (gameState.gamePhase === "species_creation") {
            if (gameState.currentQuestionIndex < speciesCreationQuestions.length) {
                showSpeciesCreationQuestion();
            } else {
                gameState.gamePhase = "species_summary";
                showSpeciesSummary();
            }
        } else if (gameState.gamePhase === "species_summary") {
            showSpeciesSummary();
        } else if (gameState.gamePhase === "starship_creation") {
            if (gameState.currentQuestionIndex < starshipCreationQuestions.length) {
                showStarshipCreationQuestion();
            } else {
                gameState.gamePhase = "starship_summary";
                showStarshipSummary();
            }
        } else if (gameState.gamePhase === "starship_summary") {
            showStarshipSummary();
        } else if (gameState.gamePhase === "role_selection_initial") {
            showRoleSelectionInitial();
        } else if (gameState.gamePhase === "k_scale_progression") {
            if (gameState.subPhase === "event") {
                showKScaleEvent();
            } else if (gameState.subPhase === "role_change_decision") {
                showRoleChangeDecision();
            }
        } else if (gameState.gamePhase === "game_end") {
            showGameEnd();
        }
        
        return true;
    } catch (error) {
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.UI, { 
                action: 'displayCurrentState',
                gamePhase: gameState.gamePhase,
                subPhase: gameState.subPhase,
                questionIndex: gameState.currentQuestionIndex,
                eventCounter: gameState.eventCounter
            });
            window.HyperionErrorHandling.displayErrorToUser("Error displaying game state. Please try refreshing the page.", null, true);
        } else {
            console.error("Error in displayCurrentState:", error);
            const gameOutput = document.getElementById("game-output");
            if(gameOutput) gameOutput.innerHTML += "<span style='color:red;'>Error displaying game state. Please try refreshing the page.</span><br>";
        }
        return false;
    }
}

// Make displayCurrentState available to the gameState module
window.displayCurrentState = displayCurrentState;

/**
 * Ends the game with a specified reason
 * @param {string} reason - The reason for ending the game
 */
function endGame(reason) {
    try {
        const gameOutput = document.getElementById("game-output");
        if (gameOutput) gameOutput.innerHTML += `<br><b>${reason}</b><br>`;
        
        gameState.gamePhase = "game_end";
        displayCurrentState();
        
        return true;
    } catch (error) {
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.GAME_STATE, { 
                action: 'endGame',
                reason: reason
            });
            window.HyperionErrorHandling.displayErrorToUser("Error ending game.", null, true);
        } else {
            console.error("Error in endGame:", error);
        }
        return false;
    }
}

// Make endGame available to the gameState module
window.endGame = endGame;

// Initialize the game when the page loads
document.addEventListener("DOMContentLoaded", function() {
    // Check if error handling module is loaded
    if (window.HyperionErrorHandling) {
        console.log("Error handling module detected and ready.");
    } else {
        console.warn("Error handling module not detected. Basic error handling will be used.");
    }
    
    // Set up event listeners for buttons
    const startButton = document.getElementById("start-button");
    const restartButton = document.getElementById("restart-button");
    const downloadLogButton = document.getElementById("download-log-button");
    
    if (startButton) startButton.addEventListener("click", initializeGame);
    if (restartButton) restartButton.addEventListener("click", initializeGame);
    if (downloadLogButton) downloadLogButton.addEventListener("click", downloadChoiceHistoryCSV);
});
