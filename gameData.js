/**
 * Hyperion Nexus Game Data Module
 * 
 * This module contains all game data structures including player roles,
 * species creation questions, starship creation questions, and K-Scale events.
 */

// --- Player Roles ---
const playerRoles = [
    "Captain", "Civilization Leader"
];

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
                { id: "c2", text: "Military readiness: Approach with caution and strength.", effects: { military: 15, ecological: -5 } },
                { id: "c3", text: "Cultural exchange: Share art, philosophy, and environmental practices.", effects: { ecological: 15, subversive: -5 } },
                { id: "c4", text: "Limited engagement: Reveal minimal information while gathering intelligence.", effects: { subversive: 15, psychic: -5 } },
                { id: "c5", text: "Consciousness connection: Attempt to establish psionic understanding.", effects: { psychic: 15, military: -5 } }
            ]
        }
    ],
    "1.3": [
        {
            id: "k13_e1",
            text_template: "Year {gameYear}: Your civilization has developed the technology to construct a Dyson swarm around your home star. The primary purpose of this megastructure will be:",
            choices: [
                { id: "c1", text: "Scientific advancement: Power vast research installations and computational arrays.", effects: { science: 20, ecological: -10 } },
                { id: "c2", text: "Military dominance: Energy for weapons development and fleet expansion.", effects: { military: 20, psychic: -10 } },
                { id: "c3", text: "Ecological harmony: Carefully designed to support natural systems and habitats.", effects: { ecological: 20, military: -10 } },
                { id: "c4", text: "Independent autonomy: Distributed power generation for decentralized colonies.", effects: { subversive: 20, science: -10 } },
                { id: "c5", text: "Consciousness expansion: Psionic amplification on an unprecedented scale.", effects: { psychic: 20, subversive: -10 } }
            ]
        }
    ],
    "1.5": [
        {
            id: "k15_e1",
            text_template: "Year {gameYear}: Your civilization stands at the threshold of becoming a true interstellar power. The guiding philosophy for your future expansion will be:",
            choices: [
                { id: "c1", text: "Knowledge seekers: Exploration and understanding above all else.", effects: { science: 25, military: -15 } },
                { id: "c2", text: "Galactic guardians: Security and protection for your people and allies.", effects: { military: 25, ecological: -15 } },
                { id: "c3", text: "Ecological stewards: Preserving and enhancing life throughout the cosmos.", effects: { ecological: 25, subversive: -15 } },
                { id: "c4", text: "Shadow network: Influence through subtlety and strategic positioning.", effects: { subversive: 25, psychic: -15 } },
                { id: "c5", text: "Psionic ascendancy: Evolving consciousness to transcend physical limitations.", effects: { psychic: 25, science: -15 } }
            ]
        }
    ]
};

// Make all data structures available globally
window.playerRoles = playerRoles;
window.speciesCreationQuestions = speciesCreationQuestions;
window.starshipCreationQuestions = starshipCreationQuestions;
window.kScaleEvents = kScaleEvents;

// Make the module available globally
window.gameDataModule = {
    playerRoles: playerRoles,
    speciesCreationQuestions: speciesCreationQuestions,
    starshipCreationQuestions: starshipCreationQuestions,
    kScaleEvents: kScaleEvents
};

console.log("Game Data module loaded, data structures exposed to window object");
