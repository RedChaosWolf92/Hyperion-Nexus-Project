/****************************************************************************/
/* Hyperion Nexus Text-Based Game Logic                                     */
/*                                                                          */
/* This script will manage the game state, questions, choices, cultural     */
/* pathway scores, K-scale progression, and data collection for the         */
/* Hyperion Nexus game.                                                     */
/****************************************************************************/

// --- Game State Variables ---
let gameState = {
    playerName: "Player", 
    currentKScale: 0.9, 
    maxKScale: 1.5, // Target K-Scale to reach for game end consideration
    gameYear: 0,
    starshipName: "ISS Pioneer", // Default starship name
    culturalPathways: {
        science: 0,    
        military: 0,   
        ecological: 0, 
        subversive: 0, 
        psychic: 0     
    },
    playerRole: null, 
    choiceHistory: [], 
    currentQuestionIndex: 0, // Used for species/starship questions
    gamePhase: "species_creation", // Phases: species_creation, species_summary, starship_creation, starship_summary, role_selection_initial, k_scale_progression, game_end
    subPhase: null, // Used for multi-step phases like k_scale_progression (e.g., event vs role_change_decision)
    eventCounter: 0 // Counts events within a K-Scale milestone
};

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
            { id: "c1", text: "Rugged & Utilitarian: Thick, armored, durable.", effects: { military: 10, science: -5 } },
            { id: "c2", text: "Sleek & Exploratory: Streamlined, long-range, sensor acuity.", effects: { science: 10, ecological: 5, military: -5 } },
            { id: "c3", text: "Modular & Adaptable: Easy modification, versatile.", effects: { subversive: 10, science: 5 } },
            { id: "c4", text: "Stealth-Focused Profile: Minimized detection signature.", effects: { subversive: 15, military: -5 } },
            { id: "c5", text: "Bio-Integrated Hull: Organic, self-repairing components.", effects: { ecological: 10, psychic: 5, science: -5 } }
        ]
    },
    {
        id: "ssq2_engine_type",
        text: "The heart of your starship, the engine will carry you to other stars. What type of early warp drive technology do you initially invest in?",
        choices: [
            { id: "c1", text: "Standard Alcubierre Drive: Reliable, balanced performance.", effects: { science: 5, military: 5 } },
            { id: "c2", text: "High-Efficiency Long-Haul Drive: Fuel efficient, sustained travel.", effects: { ecological: 10, science: 5 } },
            { id: "c3", text: "Rapid-Acceleration Combat Drive: Quick bursts, maneuverable.", effects: { military: 15, science: -5 } },
            { id: "c4", text: "Experimental Gravitic Drive: Theoretical, manipulates gravity.", effects: { science: 10, psychic: 5, subversive: -5 } },
            { id: "c5", text: "Subspace Fold Inductor: Unstable micro-folds, short hops.", effects: { subversive: 10, psychic: 5, military: -5 } }
        ]
    },
    {
        id: "ssq3_sensor_focus",
        text: "Your ship\"s senses will be your eyes and ears in the void. What is the primary focus of its sensor suite?",
        choices: [
            { id: "c1", text: "Broad Spectrum Astronomical Survey: Detailed observation, resource detection.", effects: { science: 15, ecological: 5 } },
            { id: "c2", text: "Tactical Threat Detection: Identify hostiles, EW capabilities.", effects: { military: 10, subversive: 5 } },
            { id: "c3", text: "Deep Anomaly & Precursor Signature Analysis: Unusual energies, precursor artifacts.", effects: { psychic: 10, science: 5, subversive: 5 } },
            { id: "c4", text: "Covert Intelligence Gathering: Passive array, discreet observation.", effects: { subversive: 15 } },
            { id: "c5", text: "Biosphere & Ecological Scanner: Planetary environments, life signs.", effects: { ecological: 15, science: 5 } }
        ]
    }
];

// --- K-Scale Progression Events (6 events per 0.2 K-Scale, 20 years per 0.2 K-Scale) ---
const kScaleEvents = {
    "0.9": [
        { id: "e0.9_1", text_template: "Year {gameYear}: An unexpected solar flare disrupts local navigation systems. How do you adapt?", choices: [{id:"c1", text:"(Captain) Reroute through a volatile nebula.", effects:{military:5, science:-2}, role_affinity: "Captain"}, {id:"c2", text:"(Civ Leader) Invest in hardened systems.", effects:{science:5, ecological:-2}, role_affinity: "Civilization Leader"} , {id:"c3", text:"Wait for flare to pass, focusing on internal ship diagnostics.", effects:{science:2}} ] },
        { id: "e0.9_2", text_template: "Year {gameYear}: First contact with a nomadic trading species. They offer rare minerals for cultural data.", choices: [{id:"c1", text:"(Captain) Trade cautiously, verify data, ensure security protocols.", effects:{subversive:5, science:3, military:2}, role_affinity: "Captain"}, {id:"c2", text:"(Civ Leader) Embrace exchange, foster relations, share benign cultural information.", effects:{ecological:5, psychic:3, science:2}, role_affinity: "Civilization Leader"} , {id:"c3", text:"Decline the offer, potential for unknown risks is too high.", effects:{military:1, subversive:1}} ] },
        { id: "e0.9_3", text_template: "Year {gameYear}: A rogue asteroid is on a collision course with a fledgling mining outpost.", choices: [{id:"c1", text:"(Captain) Destroy asteroid with experimental ship weapon, accepting collateral risk.", effects:{military:10, science: -5, ecological:-2}, role_affinity: "Captain"}, {id:"c2", text:"(Civ Leader) Evacuate outpost personnel, minimize losses, and study asteroid trajectory for future prevention.", effects:{ecological:5, subversive:3, science:3}, role_affinity: "Civilization Leader"} , {id:"c3", text:"Attempt to deflect asteroid using tractor beams and precise calculations.", effects:{science:7, military: -2}} ] },
        { id: "e0.9_4", text_template: "Year {gameYear}: Ancient ruins are discovered on a barren moon, hinting at precursor technology.", choices: [{id:"c1", text:"(Captain) Secure site, conduct military analysis of any defensive capabilities.", effects:{military:7, subversive:3, science:2}, role_affinity: "Captain"}, {id:"c2", text:"(Civ Leader) Fund a large-scale scientific expedition to study and preserve findings.", effects:{science:10, psychic:2, ecological:1}, role_affinity: "Civilization Leader"} , {id:"c3", text:"Leave it undisturbed for now, mark for future, more advanced study.", effects:{ecological:3, subversive:1}} ] },
        { id: "e0.9_5", text_template: "Year {gameYear}: A segment of your population demands greater political autonomy and representation.", choices: [{id:"c1", text:"(Captain) Suppress dissent firmly to maintain order and unity aboard the {starshipName}.", effects:{military:8, ecological:-3, psychic:-2}, role_affinity: "Captain"}, {id:"c2", text:"(Civ Leader) Negotiate reforms, grant some autonomy, and integrate their concerns into governance.", effects:{psychic:5, subversive:5, ecological:2}, role_affinity: "Civilization Leader"} , {id:"c3", text:"Promise future consideration while launching a propaganda campaign for unity.", effects:{science:2, subversive:3}} ] },
        { id: "e0.9_6", text_template: "Year {gameYear}: A distress signal from an unknown, damaged vessel. It could be a trap or a genuine plea for help.", choices: [{id:"c1", text:"(Captain) Approach with extreme caution, full alert, and hail them from a safe distance.", effects:{military:5, subversive:2, science:1}, role_affinity: "Captain"}, {id:"c2", text:"(Civ Leader) Offer humanitarian aid immediately, preparing for all contingencies but leading with compassion.", effects:{ecological:7, psychic:3, military:-2}, role_affinity: "Civilization Leader"} , {id:"c3", text:"Ignore the signal; the risk to your own mission is too great.", effects:{science:-2, subversive:2}} ] }
    ],
    "1.1": [
        { id: "e1.1_1", text_template: "Year {gameYear}: A scientific breakthrough promises faster-than-light communication, potentially revolutionizing interstellar relations.", choices: [{id:"c1", text:"(Captain) Weaponize it for tactical advantage in fleet coordination and intelligence.", effects:{military:10, science:5, subversive:2}, role_affinity: "Captain"}, {id:"c2", text:"(Civ Leader) Share with allies for mutual benefit, fostering a galactic communication network.", effects:{ecological:7, psychic:3, science:5}, role_affinity: "Civilization Leader"} , {id:"c3", text:"Keep it a closely guarded secret, using it only for critical covert operations.", effects:{subversive:7, science:3}} ] },
        { id: "e1.1_2", text_template: "Year {gameYear}: A new philosophical movement gains traction, challenging established societal norms and cultural values.", choices: [{id:"c1", text:"(Captain) Monitor for subversive activities and potential threats to ship discipline.", effects:{military:5, subversive:5, psychic:-2}, role_affinity: "Captain"}, {id:"c2", text:"(Civ Leader) Promote dialogue and understanding, integrating valuable aspects into the evolving culture.", effects:{psychic:7, ecological:3, science:2}, role_affinity: "Civilization Leader"} , {id:"c3", text:"Officially endorse the movement, hoping to guide its development constructively.", effects:{psychic:10, science:-5, subversive:3}} ] },
        { id: "e1.1_3", text_template: "Year {gameYear}: Resource scarcity on a key newly established colony world threatens its stability and your civilization's expansion.", choices: [{id:"c1", text:"(Captain) Implement strict rationing and martial law to control distribution and quell unrest.", effects:{military:7, ecological:-3, subversive:2}, role_affinity: "Captain"}, {id:"c2", text:"(Civ Leader) Invest heavily in new extraction technologies and sustainable resource management programs.", effects:{science:10, subversive:2, ecological:5}, role_affinity: "Civilization Leader"} , {id:"c3", text:"Seek urgent trade deals for essential resources, even if unfavorable terms are offered.", effects:{ecological:5, subversive: -2}} ] },
        { id: "e1.1_4", text_template: "Year {gameYear}: An alien artist of a reclusive species seeks asylum, offering unique cultural insights and advanced aesthetic theories.", choices: [{id:"c1", text:"(Captain) Vet thoroughly for security risks and potential espionage before granting asylum.", effects:{subversive:5, military:2, psychic:1}, role_affinity: "Captain"}, {id:"c2", text:"(Civ Leader) Welcome the artist and promote vigorous cultural exchange programs to enrich your society.", effects:{psychic:5, ecological:5, science:3}, role_affinity: "Civilization Leader"} , {id:"c3", text:"Politely decline asylum, fearing cultural contamination or diplomatic complications.", effects:{science:-2, military:1}} ] },
        { id: "e1.1_5", text_template: "Year {gameYear}: Your species encounters a vast, dormant Dyson Swarm fragment, a relic of a K-Scale 2 civilization.", choices: [{id:"c1", text:"(Captain) Attempt to salvage valuable technology by force, dispatching engineering teams under armed guard.", effects:{military:10, science:-3, subversive:3}, role_affinity: "Captain"}, {id:"c2", text:"(Civ Leader) Send a dedicated research team to study it peacefully, respecting its ancient nature.", effects:{science:10, psychic:3, ecological:2}, role_affinity: "Civilization Leader"} , {id:"c3", text:"Observe from a safe distance, cataloging its properties without direct interaction.", effects:{subversive:5, science:2}} ] },
        { id: "e1.1_6", text_template: "Year {gameYear}: A diplomatic incident with a powerful neighboring empire. They demand a formal apology and concessions.", choices: [{id:"c1", text:"(Captain) Refuse their demands, bolster defenses, and prepare for potential conflict.", effects:{military:12, ecological:-5, subversive:2}, role_affinity: "Captain"}, {id:"c2", text:"(Civ Leader) Offer a carefully worded apology and minor concessions to de-escalate and maintain peace.", effects:{psychic:5, subversive:3, ecological:3}, role_affinity: "Civilization Leader"} , {id:"c3", text:"Demand an apology from them, accusing them of provocation and escalating tensions.", effects:{military:5, subversive:5, science:-3}} ] }
    ],
    "1.3": [
        { id: "e1.3_1", text_template: "Year {gameYear}: A previously unknown subspace anomaly is detected, offering a potential shortcut through a dense nebula but with unknown risks.", choices: [{id:"c1", text:"(Captain) Chart a course through it with the {starshipName}, prepared for anything.", effects:{military:7, science:3, subversive:-2}, role_affinity: "Captain"}, {id:"c2", text:"(Civ Leader) Fund a dedicated probe mission to assess its stability and scientific value first.", effects:{science:10, ecological:2, psychic:1}, role_affinity: "Civilization Leader"}, {id:"c3", text:"Avoid the anomaly entirely; the established routes are safer.", effects:{ecological:3, military:-1}} ] },
        { id: "e1.3_2", text_template: "Year {gameYear}: Contact with a species that communicates purely through psionic means. They are wary of 'loud' verbal species.", choices: [{id:"c1", text:"(Captain) Establish strict communication protocols, relying on your own psionic specialists if available.", effects:{psychic:7, military:3, subversive:2}, role_affinity: "Captain"}, {id:"c2", text:"(Civ Leader) Initiate a cultural sensitivity program to understand and adapt to their ways, fostering trust.", effects:{psychic:10, ecological:5, science:-2}, role_affinity: "Civilization Leader"}, {id:"c3", text:"Limit interaction, focusing on non-verbal, symbolic exchanges.", effects:{subversive:5, science:1}} ] },
        { id: "e1.3_3", text_template: "Year {gameYear}: A devastating plague sweeps through a nearby primitive civilization you were observing. They lack the means to combat it.", choices: [{id:"c1", text:"(Captain) Enforce a strict quarantine to protect your own people, offering no direct aid.", effects:{military:5, subversive:3, ecological:-5}, role_affinity: "Captain"}, {id:"c2", text:"(Civ Leader) Organize a humanitarian mission with medical supplies and expertise, despite the risks.", effects:{ecological:10, psychic:5, science:2, military:-3}, role_affinity: "Civilization Leader"}, {id:"c3", text:"Secretly airdrop basic medical supplies without making direct contact.", effects:{subversive:7, ecological:3, science:-1}} ] },
        { id: "e1.3_4", text_template: "Year {gameYear}: Your scientists propose a radical new terraforming technique that could make barren worlds habitable quickly, but with unknown long-term ecological impact.", choices: [{id:"c1", text:"(Captain) Implement on a test world immediately to secure new resources and territory.", effects:{military:5, science:5, ecological:-7}, role_affinity: "Captain"}, {id:"c2", text:"(Civ Leader) Authorize extensive long-term studies and simulations before any deployment.", effects:{science:7, ecological:5, psychic:2}, role_affinity: "Civilization Leader"}, {id:"c3", text:"Reject the proposal as too risky, focusing on adapting to existing environments.", effects:{ecological:7, science:-3}} ] },
        { id: "e1.3_5", text_template: "Year {gameYear}: An influential faction within your civilization advocates for aggressive expansion and conquest of less developed neighbors.", choices: [{id:"c1", text:"(Captain) Support the faction, drafting plans for military campaigns and resource acquisition.", effects:{military:12, subversive:3, ecological:-5}, role_affinity: "Captain"}, {id:"c2", text:"(Civ Leader) Oppose the faction, promoting peaceful coexistence and diplomatic solutions.", effects:{ecological:7, psychic:5, military:-3}, role_affinity: "Civilization Leader"}, {id:"c3", text:"Attempt to redirect their aggressive energies towards exploration and discovery.", effects:{science:5, subversive:2, military:2}} ] },
        { id: "e1.3_6", text_template: "Year {gameYear}: The {starshipName} discovers a derelict generation ship from an extinct species, its data core mostly intact.", choices: [{id:"c1", text:"(Captain) Prioritize salvaging any advanced weaponry or defensive technology schematics.", effects:{military:7, science:3, subversive:1}, role_affinity: "Captain"}, {id:"c2", text:"(Civ Leader) Focus on recovering their history, culture, and the reasons for their demise.", effects:{science:7, psychic:5, ecological:3}, role_affinity: "Civilization Leader"}, {id:"c3", text:"Declare the derelict a tomb and leave it undisturbed, out of respect for the fallen.", effects:{ecological:5, psychic:2, science:-2}} ] }
    ],
    "1.5": [
        { id: "e1.5_1", text_template: "Year {gameYear}: A cosmic string fragment passes through your system, causing widespread temporal distortions and technological malfunctions.", choices: [{id:"c1", text:"(Captain) Implement emergency protocols, focus on ship integrity and crew safety above all.", effects:{military:10, science:-3, ecological:-2}, role_affinity: "Captain"}, {id:"c2", text:"(Civ Leader) Mobilize scientific teams to study the phenomenon and develop countermeasures, while managing public panic.", effects:{science:10, psychic:5, subversive:3}, role_affinity: "Civilization Leader"}, {id:"c3", text:"Isolate affected systems and hope the phenomenon passes quickly with minimal long-term damage.", effects:{ecological:3, subversive: -2}} ] },
        { id: "e1.5_2", text_template: "Year {gameYear}: Your civilization has reached a technological threshold where artificial general intelligence becomes possible, with all its potential and risks.", choices: [{id:"c1", text:"(Captain) Develop AGI under strict military oversight, focusing on defense and strategic applications.", effects:{military:10, science:5, ecological:-3}, role_affinity: "Captain"}, {id:"c2", text:"(Civ Leader) Pursue a balanced approach with ethical guidelines and civilian oversight of AGI development.", effects:{science:7, psychic:5, ecological:3}, role_affinity: "Civilization Leader"}, {id:"c3", text:"Ban AGI research entirely, focusing instead on enhancing biological intelligence.", effects:{psychic:7, ecological:3, science:-5}} ] },
        { id: "e1.5_3", text_template: "Year {gameYear}: A neighboring civilization has achieved a significant technological breakthrough, potentially shifting the balance of power in their favor.", choices: [{id:"c1", text:"(Captain) Launch a preemptive strike to secure their research facilities before they can weaponize the technology.", effects:{military:15, subversive:5, ecological:-10}, role_affinity: "Captain"}, {id:"c2", text:"(Civ Leader) Propose a mutual research and development treaty to share benefits and maintain peaceful relations.", effects:{science:10, ecological:5, psychic:5}, role_affinity: "Civilization Leader"}, {id:"c3", text:"Accelerate your own research in the same field, accepting the temporary power imbalance.", effects:{science:7, military:-3}} ] },
        { id: "e1.5_4", text_template: "Year {gameYear}: Your scientists have discovered a method to enhance cognitive abilities through genetic modification, but it requires irreversible changes to the species.", choices: [{id:"c1", text:"(Captain) Implement the modifications for military personnel first, creating an elite force.", effects:{military:10, science:5, psychic:-3}, role_affinity: "Captain"}, {id:"c2", text:"(Civ Leader) Make the enhancement optional for all citizens, with full disclosure of risks and benefits.", effects:{science:7, psychic:7, ecological:3}, role_affinity: "Civilization Leader"}, {id:"c3", text:"Reject genetic modification in favor of technological augmentation that can be removed if needed.", effects:{science:5, ecological:3, psychic:-2}} ] },
        { id: "e1.5_5", text_template: "Year {gameYear}: A massive gravitational anomaly is detected at the edge of your territory, potentially a natural wormhole or artificial construct.", choices: [{id:"c1", text:"(Captain) Secure the anomaly with military forces, treating it as a strategic asset of the highest priority.", effects:{military:10, science:5, subversive:3}, role_affinity: "Captain"}, {id:"c2", text:"(Civ Leader) Establish a scientific outpost to study the anomaly while inviting other civilizations to participate.", effects:{science:12, ecological:5, psychic:3}, role_affinity: "Civilization Leader"}, {id:"c3", text:"Establish a quarantine zone around the anomaly until its nature and safety can be fully determined.", effects:{subversive:7, military:3, science:-2}} ] },
        { id: "e1.5_6", text_template: "Year {gameYear}: Your civilization faces a critical decision about its fundamental relationship with technology as you approach K-Scale 1.5.", choices: [{id:"c1", text:"(Captain) Embrace full integration of technology and biology, becoming a cybernetic civilization.", effects:{science:15, military:10, ecological:-5}, role_affinity: "Captain"}, {id:"c2", text:"(Civ Leader) Pursue a balanced approach where technology serves but does not fundamentally alter your species.", effects:{ecological:10, psychic:5, science:5}, role_affinity: "Civilization Leader"}, {id:"c3", text:"Reject further technological integration, focusing instead on developing natural biological potential.", effects:{psychic:15, ecological:5, science:-10}} ] }
    ]
};

// Initialize call counter for displayCurrentState to prevent infinite recursion
displayCurrentState.callCount = 0;

// --- UI Management Functions ---
function clearGameUI() {
    try {
        const questionArea = document.getElementById("question-area");
        const choicesArea = document.getElementById("choices-area");
        const storyArea = document.getElementById("storyArea");
        const resultsArea = document.getElementById("results-area");
        
        if(questionArea) questionArea.textContent = "";
        if(choicesArea) choicesArea.innerHTML = "";
        if(storyArea) storyArea.innerHTML = "";
        if(resultsArea) resultsArea.style.display = "none";
        
        return true;
    } catch (error) {
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.UI, { action: 'clearGameUI' });
            window.HyperionErrorHandling.displayErrorToUser("Failed to clear game UI. Please refresh the page.", null, true);
        } else {
            console.error("Error in clearGameUI:", error);
        }
        return false;
    }
}

function updateStatusBar() {
    try {
        const statusBar = document.getElementById("statusBar");
        if (!statusBar) {
            throw new Error("Status bar element not found");
        }
        
        statusBar.textContent = `Game Year: ${gameState.gameYear} | K-Scale: ${gameState.currentKScale.toFixed(1)} | Role: ${gameState.playerRole || "N/A"}`;
        return true;
    } catch (error) {
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.UI, { action: 'updateStatusBar' });
            window.HyperionErrorHandling.displayErrorToUser("Failed to update status bar.", null, false);
        } else {
            console.error("Error in updateStatusBar:", error);
        }
        return false;
    }
}

function displayCurrentState() {
    // Initialize call counter if not already set
    if (typeof displayCurrentState.callCount !== 'number') {
        displayCurrentState.callCount = 0;
    }
    
    // Increment call counter
    displayCurrentState.callCount++;
    
    try {
        const questionArea = document.getElementById("question-area");
        const choicesArea = document.getElementById("choices-area");
        const storyArea = document.getElementById("storyArea");
        const gameOutput = document.getElementById("game-output");
        const debugLog = document.getElementById("debugLog");

        if (debugLog) {
            debugLog.innerHTML += "DEBUG: displayCurrentState called #" + displayCurrentState.callCount + 
                                ". Phase: " + gameState.gamePhase + 
                                ", SubPhase: " + gameState.subPhase + 
                                ", QIndex: " + gameState.currentQuestionIndex + "<br>";
            debugLog.innerHTML += "DEBUG: UI Elements - gameOutput: " + (gameOutput ? "Found" : "MISSING") + 
                                ", questionArea: " + (questionArea ? "Found" : "MISSING") + 
                                ", choicesArea: " + (choicesArea ? "Found" : "MISSING") + 
                                ", storyArea: " + (storyArea ? "Found" : "MISSING") + "<br>";
        }
        
        // Safety check to prevent infinite recursion
        if (displayCurrentState.callCount > 10) {
            const errorMsg = "CRITICAL ERROR: Possible infinite recursion detected in displayCurrentState!";
            if (window.HyperionErrorHandling) {
                window.HyperionErrorHandling.logError(errorMsg, window.HyperionErrorHandling.ErrorType.GAME_STATE, { callCount: displayCurrentState.callCount });
                window.HyperionErrorHandling.displayErrorToUser("Critical error detected. Game stopped to prevent browser crash.", null, true);
            } else {
                console.error(errorMsg);
                if(gameOutput) gameOutput.innerHTML = "<span style='color:red;'>CRITICAL ERROR: Infinite recursion detected. Game stopped.</span>";
                if(debugLog) debugLog.innerHTML += "DEBUG: CRITICAL ERROR - Infinite recursion detected! Call count: " + displayCurrentState.callCount + "<br>";
            }
            displayCurrentState.callCount = 0; // Reset for next attempt
            return;
        }

        if (!questionArea || !choicesArea || !storyArea || !gameOutput) {
            const errorMsg = "CRITICAL UI ERROR: One or more essential display elements not found in displayCurrentState!";
            if (window.HyperionErrorHandling) {
                window.HyperionErrorHandling.logError(errorMsg, window.HyperionErrorHandling.ErrorType.UI, { 
                    questionArea: !!questionArea, 
                    choicesArea: !!choicesArea, 
                    storyArea: !!storyArea, 
                    gameOutput: !!gameOutput 
                });
                window.HyperionErrorHandling.displayErrorToUser("Critical UI error. Essential elements missing.", null, true);
            } else {
                console.error(errorMsg);
                if(gameOutput) gameOutput.innerHTML = "<span style='color:red;'>CRITICAL UI ERROR: Essential display elements missing. Cannot continue.</span>";
                if(debugLog) debugLog.innerHTML += "DEBUG: CRITICAL ERROR - Missing essential UI elements!<br>";
            }
            return;
        }

        let currentQuestion;
        let questionSet;

        if (gameState.gamePhase === "species_creation") {
            questionSet = speciesCreationQuestions;
            if (gameState.currentQuestionIndex < questionSet.length) {
                currentQuestion = questionSet[gameState.currentQuestionIndex];
                questionArea.textContent = currentQuestion.text.replace('{starshipName}', gameState.starshipName);
                choicesArea.innerHTML = ''; 
                currentQuestion.choices.forEach(choice => {
                    if (!choice.condition || choice.condition(gameState.culturalPathways)) {
                        const button = document.createElement('button');
                        button.textContent = choice.text;
                        button.onclick = () => handleChoice(choice.id);
                        choicesArea.appendChild(button);
                    }
                });
            } else {
                showSpeciesSummary();
            }
        } else if (gameState.gamePhase === "starship_creation") {
            questionSet = starshipCreationQuestions;
            if (gameState.currentQuestionIndex < questionSet.length) {
                currentQuestion = questionSet[gameState.currentQuestionIndex];
                questionArea.textContent = currentQuestion.text.replace('{starshipName}', gameState.starshipName);
                choicesArea.innerHTML = ''; 
                currentQuestion.choices.forEach(choice => {
                    if (!choice.condition || choice.condition(gameState.culturalPathways)) {
                        const button = document.createElement('button');
                        button.textContent = choice.text;
                        button.onclick = () => handleChoice(choice.id);
                        choicesArea.appendChild(button);
                    }
                });
            } else {
                showStarshipSummary();
            }
        } else if (gameState.gamePhase === "role_selection_initial") {
            showRoleSelectionInitial();
        } else if (gameState.gamePhase === "k_scale_progression") {
            if (gameState.subPhase === "event") {
                showKScaleEvent();
            } else if (gameState.subPhase === "role_change_decision") {
                showRoleChangeDecision();
            } else { 
                gameState.subPhase = "event";
                showKScaleEvent();
            }
        } else if (gameState.gamePhase === "game_end") {
            // Game end is handled by endGame function
        }
        updateStatusBar();
        
        // Reset call counter after successful execution
        displayCurrentState.callCount = 0;
        
        // Save game state after successful display update
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.saveGameState(gameState);
        }
        
        return true;
    } catch (error) {
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.UI, { 
                action: 'displayCurrentState',
                gamePhase: gameState.gamePhase,
                subPhase: gameState.subPhase,
                questionIndex: gameState.currentQuestionIndex
            });
            window.HyperionErrorHandling.displayErrorToUser("Error updating game display. Try refreshing the page.", null, true);
        } else {
            console.error("Error in displayCurrentState:", error);
            const gameOutput = document.getElementById("game-output");
            if(gameOutput) gameOutput.innerHTML += "<span style='color:red;'>Error updating game display. Try refreshing the page.</span><br>";
        }
        
        // Reset call counter after error
        displayCurrentState.callCount = 0;
        return false;
    }
}

function handleChoice(choiceId) {
    try {
        // Input validation
        if (!choiceId) {
            throw new Error("Invalid choice ID: " + choiceId);
        }
        
        const gameOutput = document.getElementById("game-output");
        const debugLog = document.getElementById("debugLog");
        if (debugLog) debugLog.innerHTML += `DEBUG: handleChoice - Phase: ${gameState.gamePhase}, QIndex: ${gameState.currentQuestionIndex}, EventCounter: ${gameState.eventCounter}, Choice: ${choiceId}<br>`;

        let questionSet, choiceMade, questionTextForLog;

        if (gameState.gamePhase === "species_creation") {
            questionSet = speciesCreationQuestions;
            if (gameState.currentQuestionIndex >= questionSet.length) {
                throw new Error("Invalid question index for species creation: " + gameState.currentQuestionIndex);
            }
            choiceMade = questionSet[gameState.currentQuestionIndex].choices.find(c => c.id === choiceId);
            if (!choiceMade) {
                throw new Error(`Choice ${choiceId} not found in species creation question ${gameState.currentQuestionIndex}`);
            }
            questionTextForLog = questionSet[gameState.currentQuestionIndex].text;
        } else if (gameState.gamePhase === "starship_creation") {
            questionSet = starshipCreationQuestions;
            if (gameState.currentQuestionIndex >= questionSet.length) {
                throw new Error("Invalid question index for starship creation: " + gameState.currentQuestionIndex);
            }
            choiceMade = questionSet[gameState.currentQuestionIndex].choices.find(c => c.id === choiceId);
            if (!choiceMade) {
                throw new Error(`Choice ${choiceId} not found in starship creation question ${gameState.currentQuestionIndex}`);
            }
            questionTextForLog = questionSet[gameState.currentQuestionIndex].text;
        } else if (gameState.gamePhase === "role_selection_initial") {
            if (choiceId === "captain") gameState.playerRole = "Captain";
            else if (choiceId === "civ_leader") gameState.playerRole = "Civilization Leader";
            else throw new Error("Invalid role selection choice: " + choiceId);
            
            choiceMade = { text: `Chosen role: ${gameState.playerRole}`, effects: {} }; 
            questionTextForLog = "Initial Role Selection";
            gameState.gamePhase = "k_scale_progression";
            gameState.subPhase = "event"; 
            gameState.currentQuestionIndex = 0; 
            gameState.eventCounter = 0; 
            gameState.gameYear += 0; 
        } else if (gameState.gamePhase === "k_scale_progression") {
            const kEvents = kScaleEvents[gameState.currentKScale.toFixed(1)];
            if (!kEvents) {
                throw new Error("No events found for K-Scale: " + gameState.currentKScale.toFixed(1));
            }
            
            if (gameState.subPhase === "event" && kEvents && gameState.eventCounter < kEvents.length) {
                choiceMade = kEvents[gameState.eventCounter].choices.find(c => c.id === choiceId);
                if (!choiceMade) {
                    throw new Error(`Choice ${choiceId} not found in K-Scale event ${gameState.eventCounter}`);
                }
                questionTextForLog = kEvents[gameState.eventCounter].text_template;
            } else if (gameState.subPhase === "role_change_decision") {
                if (choiceId === "continue_role") { /* No change */ }
                else if (choiceId === "change_to_captain") gameState.playerRole = "Captain";
                else if (choiceId === "change_to_civ_leader") gameState.playerRole = "Civilization Leader";
                else throw new Error("Invalid role change choice: " + choiceId);
                
                choiceMade = { text: `Role decision: ${choiceId}, New Role: ${gameState.playerRole}`, effects: {} };
                questionTextForLog = "K-Scale Milestone Role Decision";
                
                gameState.currentKScale = parseFloat((gameState.currentKScale + 0.2).toFixed(1));
                gameState.gameYear += 20; 
                if(gameOutput) gameOutput.innerHTML += `<br><b>Technological Leap! Your starship capabilities have been upgraded reflecting advancements over the last 20 years!</b><br>`;

                gameState.subPhase = "event";
                gameState.eventCounter = 0; 
                
                // Check for game end *after* K-Scale update and *before* next displayCurrentState for this new K-Scale
                if (gameState.currentKScale > gameState.maxKScale) {
                    endGame("K-Scale limit reached. Civilization journey complete!");
                    return; // Important to return here to prevent further processing
                }
            }
        }

        if (choiceMade) {
            gameState.choiceHistory.push({
                year: gameState.gameYear,
                kScale: gameState.currentKScale.toFixed(1),
                phase: gameState.gamePhase,
                subPhase: gameState.subPhase,
                role: gameState.playerRole,
                question: questionTextForLog ? questionTextForLog.replace('{starshipName}', gameState.starshipName).replace('{gameYear}', gameState.gameYear) : "N/A",
                choiceText: choiceMade.text,
                effects: JSON.parse(JSON.stringify(choiceMade.effects)), 
                pathwaysBefore: JSON.parse(JSON.stringify(gameState.culturalPathways)) 
            });

            for (const path in choiceMade.effects) {
                if (gameState.culturalPathways.hasOwnProperty(path)) {
                    gameState.culturalPathways[path] += choiceMade.effects[path];
                }
            }
            gameState.choiceHistory[gameState.choiceHistory.length-1].pathwaysAfter = JSON.parse(JSON.stringify(gameState.culturalPathways));

            if (debugLog) debugLog.innerHTML += `DEBUG: Cultural Pathways Updated: ${JSON.stringify(gameState.culturalPathways)}<br>`;
            if (gameOutput && choiceMade.text) gameOutput.innerHTML += `> ${choiceMade.text}<br>`;
            if (gameOutput) gameOutput.scrollTop = gameOutput.scrollHeight;
        }

        if (gameState.gamePhase === "species_creation" || gameState.gamePhase === "starship_creation") {
            gameState.currentQuestionIndex++;
        } else if (gameState.gamePhase === "k_scale_progression" && gameState.subPhase === "event") {
            gameState.eventCounter++; 
            const currentKEvents = kScaleEvents[gameState.currentKScale.toFixed(1)];
            if (!currentKEvents || gameState.eventCounter >= 6) { 
                gameState.subPhase = "role_change_decision";
            }
        }

        // Increment game year for each event in k_scale_progression
        if (gameState.gamePhase === "k_scale_progression" && gameState.subPhase === "event") {
            gameState.gameYear += 3; // Approximately 20 years over 6 events
        }

        // Save game state after successful choice handling
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.saveGameState(gameState);
        }

        displayCurrentState();
        return true;
    } catch (error) {
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.GAME_STATE, { 
                action: 'handleChoice',
                choiceId: choiceId,
                gamePhase: gameState.gamePhase,
                subPhase: gameState.subPhase,
                questionIndex: gameState.currentQuestionIndex,
                eventCounter: gameState.eventCounter
            });
            window.HyperionErrorHandling.displayErrorToUser("Error processing your choice. Please try again or refresh the page.", null, true);
        } else {
            console.error("Error in handleChoice:", error);
            const gameOutput = document.getElementById("game-output");
            if(gameOutput) gameOutput.innerHTML += "<span style='color:red;'>Error processing your choice. Please try again or refresh the page.</span><br>";
        }
        return false;
    }
}

function getTopCulturalPathways() {
    try {
        const pathways = gameState.culturalPathways;
        if (!pathways) {
            throw new Error("Cultural pathways not found in game state");
        }
        
        const sortedPaths = Object.entries(pathways).sort((a, b) => b[1] - a[1]);
        return sortedPaths.slice(0, 2).map(entry => ({ name: entry[0], value: entry[1] }));
    } catch (error) {
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.DATA, { action: 'getTopCulturalPathways' });
            window.HyperionErrorHandling.displayErrorToUser("Error calculating cultural pathways.", null, false);
        } else {
            console.error("Error in getTopCulturalPathways:", error);
        }
        // Return default values in case of error
        return [{ name: "science", value: 0 }, { name: "military", value: 0 }];
    }
}

function showSpeciesCreationQuestion() {
    try {
        const questionArea = document.getElementById("question-area");
        const choicesArea = document.getElementById("choices-area");
        const storyArea = document.getElementById("storyArea");
        const debugLog = document.getElementById("debugLog");
        
        if (debugLog) debugLog.innerHTML += "DEBUG: showSpeciesCreationQuestion called. Current index: " + gameState.currentQuestionIndex + "<br>";
        
        if(storyArea) storyArea.innerHTML = ""; 

        // Safety check to prevent infinite recursion
        if (gameState.currentQuestionIndex >= speciesCreationQuestions.length) {
            if (debugLog) debugLog.innerHTML += "DEBUG: Index exceeds questions length, showing summary.<br>";
            showSpeciesSummary();
            return; // Important to return here to prevent further processing
        }

        const currentQuestion = speciesCreationQuestions[gameState.currentQuestionIndex];
        if (!currentQuestion) {
            throw new Error("Question not found at index: " + gameState.currentQuestionIndex);
        }
        
        if(questionArea) questionArea.textContent = currentQuestion.text;
        if(choicesArea) choicesArea.innerHTML = '';
        
        currentQuestion.choices.forEach(choice => {
            const button = document.createElement('button');
            button.textContent = choice.text;
            button.onclick = () => handleChoice(choice.id);
            if(choicesArea) choicesArea.appendChild(button);
        });
        
        return true;
    } catch (error) {
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.UI, { 
                action: 'showSpeciesCreationQuestion',
                questionIndex: gameState.currentQuestionIndex
            });
            window.HyperionErrorHandling.displayErrorToUser("Error displaying species creation question.", null, true);
        } else {
            console.error("Error in showSpeciesCreationQuestion:", error);
            const gameOutput = document.getElementById("game-output");
            if(gameOutput) gameOutput.innerHTML += "<span style='color:red;'>Error displaying species creation question.</span><br>";
        }
        return false;
    }
}

function showSpeciesSummary() {
    try {
        const questionArea = document.getElementById("question-area");
        const choicesArea = document.getElementById("choices-area");
        const storyArea = document.getElementById("storyArea");
        const gameOutput = document.getElementById("game-output");
        const debugLog = document.getElementById("debugLog");
        
        if (debugLog) debugLog.innerHTML += "DEBUG: showSpeciesSummary called.<br>";
        
        gameState.gamePhase = "species_summary";
        
        const topPathways = getTopCulturalPathways();
        const pathwayNames = {
            science: "Scientific",
            military: "Military",
            ecological: "Ecological",
            subversive: "Subversive",
            psychic: "Psychic"
        };
        
        if(questionArea) questionArea.textContent = "Your species has been defined. These are your dominant cultural pathways:";
        if(storyArea) storyArea.innerHTML = `<b>${topPathways[0].name.charAt(0).toUpperCase() + topPathways[0].name.slice(1)}</b>: ${topPathways[0].value} points<br><b>${topPathways[1].name.charAt(0).toUpperCase() + topPathways[1].name.slice(1)}</b>: ${topPathways[1].value} points`;
        
        if(gameOutput) gameOutput.innerHTML += `<br>Species creation complete. Dominant pathways: ${pathwayNames[topPathways[0].name]} (${topPathways[0].value}) and ${pathwayNames[topPathways[1].name]} (${topPathways[1].value}).<br>`;
        
        if(choicesArea) choicesArea.innerHTML = '';
        
        const proceedButton = document.createElement('button');
        proceedButton.textContent = "Proceed to Starship Design";
        proceedButton.onclick = () => {
            gameState.gamePhase = "starship_creation";
            gameState.currentQuestionIndex = 0;
            displayCurrentState();
        };
        if(choicesArea) choicesArea.appendChild(proceedButton);
        
        return true;
    } catch (error) {
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.UI, { action: 'showSpeciesSummary' });
            window.HyperionErrorHandling.displayErrorToUser("Error displaying species summary.", null, true);
        } else {
            console.error("Error in showSpeciesSummary:", error);
            const gameOutput = document.getElementById("game-output");
            if(gameOutput) gameOutput.innerHTML += "<span style='color:red;'>Error displaying species summary.</span><br>";
        }
        return false;
    }
}

function showStarshipCreationQuestion() {
    try {
        const questionArea = document.getElementById("question-area");
        const choicesArea = document.getElementById("choices-area");
        const storyArea = document.getElementById("storyArea");
        const debugLog = document.getElementById("debugLog");
        
        if (debugLog) debugLog.innerHTML += "DEBUG: showStarshipCreationQuestion called. Current index: " + gameState.currentQuestionIndex + "<br>";
        
        if(storyArea) storyArea.innerHTML = ""; 

        // Safety check to prevent infinite recursion
        if (gameState.currentQuestionIndex >= starshipCreationQuestions.length) {
            if (debugLog) debugLog.innerHTML += "DEBUG: Index exceeds starship questions length, showing summary.<br>";
            showStarshipSummary();
            return; // Important to return here to prevent further processing
        }

        const currentQuestion = starshipCreationQuestions[gameState.currentQuestionIndex];
        if (!currentQuestion) {
            throw new Error("Starship question not found at index: " + gameState.currentQuestionIndex);
        }
        
        if(questionArea) questionArea.textContent = currentQuestion.text.replace('{starshipName}', gameState.starshipName);
        if(choicesArea) choicesArea.innerHTML = '';
        
        currentQuestion.choices.forEach(choice => {
            const button = document.createElement('button');
            button.textContent = choice.text;
            button.onclick = () => handleChoice(choice.id);
            if(choicesArea) choicesArea.appendChild(button);
        });
        
        return true;
    } catch (error) {
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.UI, { 
                action: 'showStarshipCreationQuestion',
                questionIndex: gameState.currentQuestionIndex
            });
            window.HyperionErrorHandling.displayErrorToUser("Error displaying starship creation question.", null, true);
        } else {
            console.error("Error in showStarshipCreationQuestion:", error);
            const gameOutput = document.getElementById("game-output");
            if(gameOutput) gameOutput.innerHTML += "<span style='color:red;'>Error displaying starship creation question.</span><br>";
        }
        return false;
    }
}

function showStarshipSummary() {
    try {
        const questionArea = document.getElementById("question-area");
        const choicesArea = document.getElementById("choices-area");
        const storyArea = document.getElementById("storyArea");
        const gameOutput = document.getElementById("game-output");
        const debugLog = document.getElementById("debugLog");
        
        if (debugLog) debugLog.innerHTML += "DEBUG: showStarshipSummary called.<br>";
        
        gameState.gamePhase = "starship_summary";
        
        const topPathways = getTopCulturalPathways();
        const pathwayNames = {
            science: "Scientific",
            military: "Military",
            ecological: "Ecological",
            subversive: "Subversive",
            psychic: "Psychic"
        };
        
        if(questionArea) questionArea.textContent = `The ${gameState.starshipName} is ready for its maiden voyage. These are your current cultural pathways:`;
        if(storyArea) storyArea.innerHTML = `<b>${topPathways[0].name.charAt(0).toUpperCase() + topPathways[0].name.slice(1)}</b>: ${topPathways[0].value} points<br><b>${topPathways[1].name.charAt(0).toUpperCase() + topPathways[1].name.slice(1)}</b>: ${topPathways[1].value} points`;
        
        if(gameOutput) gameOutput.innerHTML += `<br>Starship design complete. The ${gameState.starshipName} reflects your cultural values: ${pathwayNames[topPathways[0].name]} (${topPathways[0].value}) and ${pathwayNames[topPathways[1].name]} (${topPathways[1].value}).<br>`;
        
        if(choicesArea) choicesArea.innerHTML = '';
        
        const proceedButton = document.createElement('button');
        proceedButton.textContent = "Choose Your Role";
        proceedButton.onclick = () => {
            gameState.gamePhase = "role_selection_initial";
            displayCurrentState();
        };
        if(choicesArea) choicesArea.appendChild(proceedButton);
        
        return true;
    } catch (error) {
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.UI, { action: 'showStarshipSummary' });
            window.HyperionErrorHandling.displayErrorToUser("Error displaying starship summary.", null, true);
        } else {
            console.error("Error in showStarshipSummary:", error);
            const gameOutput = document.getElementById("game-output");
            if(gameOutput) gameOutput.innerHTML += "<span style='color:red;'>Error displaying starship summary.</span><br>";
        }
        return false;
    }
}

function showRoleSelectionInitial() {
    try {
        const questionArea = document.getElementById("question-area");
        const choicesArea = document.getElementById("choices-area");
        const storyArea = document.getElementById("storyArea");
        if(storyArea) storyArea.innerHTML = ""; 

        if(questionArea) questionArea.textContent = `The journey ahead requires a leader. Will you command the ${gameState.starshipName} as its Captain, focusing on exploration and defense, or will you guide your civilization's destiny as its Civilization Leader, focusing on development and diplomacy?`;
        if(choicesArea) choicesArea.innerHTML = '';
        
        const captainButton = document.createElement('button');
        captainButton.classList.add("role-selection");
        captainButton.textContent = "Choose: Captain";
        captainButton.onclick = () => handleChoice("captain");
        if(choicesArea) choicesArea.appendChild(captainButton);

        const leaderButton = document.createElement('button');
        leaderButton.classList.add("role-selection");
        leaderButton.textContent = "Choose: Civilization Leader";
        leaderButton.onclick = () => handleChoice("civ_leader");
        if(choicesArea) choicesArea.appendChild(leaderButton);
        
        return true;
    } catch (error) {
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.UI, { action: 'showRoleSelectionInitial' });
            window.HyperionErrorHandling.displayErrorToUser("Error displaying role selection.", null, true);
        } else {
            console.error("Error in showRoleSelectionInitial:", error);
            const gameOutput = document.getElementById("game-output");
            if(gameOutput) gameOutput.innerHTML += "<span style='color:red;'>Error displaying role selection.</span><br>";
        }
        return false;
    }
}

function showKScaleEvent() {
    try {
        const questionArea = document.getElementById("question-area");
        const choicesArea = document.getElementById("choices-area");
        const storyArea = document.getElementById("storyArea");
        if(storyArea) storyArea.innerHTML = ""; 

        const currentKValue = gameState.currentKScale.toFixed(1);
        const eventsForKScale = kScaleEvents[currentKValue];

        if (!eventsForKScale) {
            throw new Error("No events found for K-Scale: " + currentKValue);
        }

        if (eventsForKScale && gameState.eventCounter < eventsForKScale.length && gameState.eventCounter < 6) {
            const event = eventsForKScale[gameState.eventCounter];
            if (!event) {
                throw new Error(`Event not found at index ${gameState.eventCounter} for K-Scale ${currentKValue}`);
            }
            
            if(questionArea) questionArea.textContent = event.text_template.replace('{gameYear}', gameState.gameYear).replace('{starshipName}', gameState.starshipName);
            if(choicesArea) choicesArea.innerHTML = '';
            
            event.choices.forEach(choice => {
                if (!choice.role_affinity || choice.role_affinity === gameState.playerRole) {
                    const button = document.createElement('button');
                    button.textContent = choice.text;
                    button.onclick = () => handleChoice(choice.id);
                    if(choicesArea) choicesArea.appendChild(button);
                }
            });
        } else {
            gameState.subPhase = "role_change_decision";
            displayCurrentState();
        }
        
        return true;
    } catch (error) {
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.UI, { 
                action: 'showKScaleEvent',
                kScale: gameState.currentKScale.toFixed(1),
                eventCounter: gameState.eventCounter
            });
            window.HyperionErrorHandling.displayErrorToUser("Error displaying K-Scale event.", null, true);
        } else {
            console.error("Error in showKScaleEvent:", error);
            const gameOutput = document.getElementById("game-output");
            if(gameOutput) gameOutput.innerHTML += "<span style='color:red;'>Error displaying K-Scale event.</span><br>";
        }
        return false;
    }
}

function showRoleChangeDecision() {
    try {
        const questionArea = document.getElementById("question-area");
        const choicesArea = document.getElementById("choices-area");
        const storyArea = document.getElementById("storyArea");
        const gameOutput = document.getElementById("game-output");

        if(storyArea) storyArea.innerHTML = `Your civilization has advanced. Your starship, the ${gameState.starshipName}, has undergone significant upgrades reflecting the technological leaps of the past 20 years.`;
        // The ship upgrade message is now primarily in handleChoice when K-Scale advances.
        // This is a secondary place for it if needed.
        // if(gameOutput && !gameOutput.innerHTML.includes("Technological Leap!")) { 
        //     gameOutput.innerHTML += `<br><b>Technological Leap! Your starship capabilities have been upgraded reflecting advancements over the last 20 years!</b><br>`;
        //     gameOutput.scrollTop = gameOutput.scrollHeight;
        // }

        if(questionArea) questionArea.textContent = `Year ${gameState.gameYear}, K-Scale ${gameState.currentKScale.toFixed(1)}: You've reached a significant milestone. Do you wish to continue in your current role as ${gameState.playerRole}, or is it time to take on the mantle of ${gameState.playerRole === "Captain" ? "Civilization Leader" : "Captain"}?`;
        if(choicesArea) choicesArea.innerHTML = '';

        const continueButton = document.createElement('button');
        continueButton.classList.add("role-selection");
        continueButton.textContent = `Continue as ${gameState.playerRole}`;
        continueButton.onclick = () => handleChoice("continue_role");
        if(choicesArea) choicesArea.appendChild(continueButton);

        const changeRoleButton = document.createElement('button');
        changeRoleButton.classList.add("role-selection");
        const otherRole = gameState.playerRole === "Captain" ? "Civilization Leader" : "Captain";
        changeRoleButton.textContent = `Change role to ${otherRole}`;
        changeRoleButton.onclick = () => handleChoice(gameState.playerRole === "Captain" ? "change_to_civ_leader" : "change_to_captain");
        if(choicesArea) choicesArea.appendChild(changeRoleButton);
        
        return true;
    } catch (error) {
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.UI, { action: 'showRoleChangeDecision' });
            window.HyperionErrorHandling.displayErrorToUser("Error displaying role change decision.", null, true);
        } else {
            console.error("Error in showRoleChangeDecision:", error);
            const gameOutput = document.getElementById("game-output");
            if(gameOutput) gameOutput.innerHTML += "<span style='color:red;'>Error displaying role change decision.</span><br>";
        }
        return false;
    }
}

function endGame(reason) {
    try {
        gameState.gamePhase = "game_end";
        const questionArea = document.getElementById("question-area");
        const choicesArea = document.getElementById("choices-area");
        const storyArea = document.getElementById("storyArea");
        const resultsArea = document.getElementById("results-area");
        const pathwayScoresDiv = document.getElementById("pathway-scores");
        const choiceHistoryLog = document.getElementById("choice-history-log");
        const downloadLogButton = document.getElementById("download-log-button");
        const gameOutput = document.getElementById("game-output");

        if (!questionArea || !choicesArea || !storyArea || !resultsArea || !pathwayScoresDiv || !choiceHistoryLog || !downloadLogButton) {
            throw new Error("One or more UI elements missing for end game display");
        }

        const topPathways = getTopCulturalPathways();

        if(questionArea) questionArea.innerHTML = "Game Over";
        if(choicesArea) choicesArea.innerHTML = ''; 
        if(storyArea) storyArea.innerHTML = `<b>Reason: ${reason}</b><br><br>Your civilization has reached K-Scale ${gameState.currentKScale.toFixed(1)} after ${gameState.gameYear} years of development.<br><br>Dominant cultural pathways:<br>- ${topPathways[0].name.charAt(0).toUpperCase() + topPathways[0].name.slice(1)}: ${topPathways[0].value} points<br>- ${topPathways[1].name.charAt(0).toUpperCase() + topPathways[1].name.slice(1)}: ${topPathways[1].value} points`;
        
        if(gameOutput) gameOutput.innerHTML += `<br><b>Game Over: ${reason}</b><br>`;
        
        if(resultsArea) resultsArea.style.display = 'block';
        
        if(pathwayScoresDiv) {
            pathwayScoresDiv.innerHTML = '';
            const pathwayNames = {
                science: "Scientific",
                military: "Military",
                ecological: "Ecological",
                subversive: "Subversive",
                psychic: "Psychic"
            };
            
            const totalPoints = Object.values(gameState.culturalPathways).reduce((sum, val) => sum + Math.max(0, val), 0);
            
            for (const [pathway, score] of Object.entries(gameState.culturalPathways)) {
                const pathwayDiv = document.createElement('div');
                pathwayDiv.className = 'pathway-result';
                
                const pathwayNameSpan = document.createElement('span');
                pathwayNameSpan.className = 'pathway-name';
                pathwayNameSpan.textContent = pathwayNames[pathway] || pathway.charAt(0).toUpperCase() + pathway.slice(1);
                
                const barContainer = document.createElement('div');
                barContainer.className = 'pathway-bar-container';
                
                const bar = document.createElement('div');
                bar.className = 'pathway-bar';
                
                // Calculate percentage (minimum 5% for visibility if any points)
                const percentage = totalPoints > 0 ? Math.max(5, (score / totalPoints) * 100) : 0;
                bar.style.width = `${percentage}%`;
                
                // Set color based on pathway
                switch(pathway) {
                    case 'science': bar.style.backgroundColor = '#4a90e2'; break; // Blue
                    case 'military': bar.style.backgroundColor = '#e74c3c'; break; // Red
                    case 'ecological': bar.style.backgroundColor = '#2ecc71'; break; // Green
                    case 'subversive': bar.style.backgroundColor = '#34495e'; break; // Dark Blue/Gray
                    case 'psychic': bar.style.backgroundColor = '#9b59b6'; break; // Purple
                }
                
                bar.textContent = `${score} (${Math.round(percentage)}%)`;
                
                barContainer.appendChild(bar);
                pathwayDiv.appendChild(pathwayNameSpan);
                pathwayDiv.appendChild(barContainer);
                pathwayScoresDiv.appendChild(pathwayDiv);
            }
        }
        
        if(choiceHistoryLog) {
            choiceHistoryLog.innerHTML = '';
            gameState.choiceHistory.forEach((entry, index) => {
                choiceHistoryLog.innerHTML += `Year ${entry.year} (K-Scale ${entry.kScale}): ${entry.choiceText}<br>`;
            });
        }
        
        if(downloadLogButton) {
            downloadLogButton.style.display = 'inline-block';
        }
        
        return true;
    } catch (error) {
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.UI, { 
                action: 'endGame',
                reason: reason
            });
            window.HyperionErrorHandling.displayErrorToUser("Error displaying game end screen.", null, true);
        } else {
            console.error("Error in endGame:", error);
            const gameOutput = document.getElementById("game-output");
            if(gameOutput) gameOutput.innerHTML += "<span style='color:red;'>Error displaying game end screen.</span><br>";
        }
        return false;
    }
}

function downloadChoiceHistoryCSV() {
    try {
        if (gameState.choiceHistory.length === 0) {
            const gameOutput = document.getElementById("game-output");
            if(gameOutput) gameOutput.innerHTML += "<br><span style='color:orange;'>No history to download.</span>";
            return false;
        }

        let csvContent = "data:text/csv;charset=utf-8,";
        const headers = ["Year", "KScale", "GamePhase", "SubPhase", "PlayerRole", "Question/Event", "ChoiceMade", "Effect_Science", "Effect_Military", "Effect_Ecological", "Effect_Subversive", "Effect_Psychic", "Path_Sci_Before", "Path_Mil_Before", "Path_Eco_Before", "Path_Sub_Before", "Path_Psy_Before", "Path_Sci_After", "Path_Mil_After", "Path_Eco_After", "Path_Sub_After", "Path_Psy_After"];
        csvContent += headers.join(",") + "\r\n";

        gameState.choiceHistory.forEach(entry => {
            const effects = entry.effects || {};
            const pathwaysBefore = entry.pathwaysBefore || {};
            const pathwaysAfter = entry.pathwaysAfter || {};
            
            const row = [
                entry.year,
                entry.kScale,
                entry.phase,
                entry.subPhase || "N/A",
                entry.role || "N/A",
                `"${(entry.question || "N/A").replace(/"/g, "\"\"")}"`,
                `"${(entry.choiceText || "N/A").replace(/"/g, "\"\"")}"`,
                effects.science || 0,
                effects.military || 0,
                effects.ecological || 0,
                effects.subversive || 0,
                effects.psychic || 0,
                pathwaysBefore.science || 0,
                pathwaysBefore.military || 0,
                pathwaysBefore.ecological || 0,
                pathwaysBefore.subversive || 0,
                pathwaysBefore.psychic || 0,
                pathwaysAfter.science || 0,
                pathwaysAfter.military || 0,
                pathwaysAfter.ecological || 0,
                pathwaysAfter.subversive || 0,
                pathwaysAfter.psychic || 0
            ];
            csvContent += row.join(",") + "\r\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "hyperion_nexus_game_log.csv");
        document.body.appendChild(link); 
        link.click();
        document.body.removeChild(link);
        
        const gameOutput = document.getElementById("game-output");
        if(gameOutput) gameOutput.innerHTML += "<br>Game log download initiated.";
        
        return true;
    } catch (error) {
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.DATA, { action: 'downloadChoiceHistoryCSV' });
            window.HyperionErrorHandling.displayErrorToUser("Error downloading game history.", null, false);
        } else {
            console.error("Error in downloadChoiceHistoryCSV:", error);
            const gameOutput = document.getElementById("game-output");
            if(gameOutput) gameOutput.innerHTML += "<span style='color:red;'>Error downloading game history.</span><br>";
        }
        return false;
    }
}
window.downloadChoiceHistoryCSV = downloadChoiceHistoryCSV; 

function initializeGame() {
    try {
        const gameOutput = document.getElementById("game-output");
        const storyArea = document.getElementById("storyArea");
        const debugLog = document.getElementById("debugLog");
        const resultsArea = document.getElementById("results-area");
        const startButton = document.getElementById("start-button");
        const restartButton = document.getElementById("restart-button");
        const downloadLogButton = document.getElementById("download-log-button");

        if (!gameOutput || !storyArea || !resultsArea || !startButton || !restartButton || !downloadLogButton) {
            throw new Error("One or more UI elements missing for game initialization");
        }

        if (debugLog) debugLog.innerHTML = "DEBUG: initializeGame called.<br>";

        // Check for saved game state
        let loadedState = null;
        if (window.HyperionErrorHandling && window.HyperionErrorHandling.canRecoverGameState()) {
            loadedState = window.HyperionErrorHandling.loadGameState();
            if (loadedState) {
                const confirmRestore = confirm("A saved game was found. Would you like to continue from where you left off?");
                if (confirmRestore) {
                    gameState = loadedState;
                    if(gameOutput) gameOutput.innerHTML += "<br><span style='color:green;'>Game state restored successfully.</span><br>";
                    displayCurrentState();
                    return true;
                }
            }
        }

        // Initialize new game if no saved state or user declined to restore
        gameState.gamePhase = "species_creation";
        gameState.currentQuestionIndex = 0;
        gameState.eventCounter = 0;
        gameState.culturalPathways = { science: 0, military: 0, ecological: 0, subversive: 0, psychic: 0 };
        gameState.playerRole = null;
        gameState.gameYear = 0;
        gameState.currentKScale = 0.9;
        gameState.choiceHistory = [];
        gameState.subPhase = null;

        clearGameUI(); 
        if(gameOutput) gameOutput.innerHTML = "Welcome! Let's begin creating your species.<br>";
        if(storyArea) storyArea.innerHTML = "The journey of a thousand stars begins with a single choice.";
        
        if (startButton) startButton.style.display = 'none';
        if (restartButton) restartButton.style.display = 'inline-block';
        if (downloadLogButton) downloadLogButton.style.display = 'none';
        if (resultsArea) resultsArea.style.display = 'none';
        if (debugLog) debugLog.style.display = 'block'; 

        if (debugLog) debugLog.innerHTML += "DEBUG: Game state reset. Starting species creation.<br>";
        
        displayCurrentState();
        updateStatusBar();
        
        if (debugLog) debugLog.innerHTML += "DEBUG: Game initialization complete. First question should be visible.<br>";
        
        return true;
    } catch (error) {
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.GAME_STATE, { action: 'initializeGame' });
            window.HyperionErrorHandling.displayErrorToUser("Error initializing game. Please refresh the page and try again.", null, true);
        } else {
            console.error("Error in initializeGame:", error);
            const gameOutput = document.getElementById("game-output");
            if(gameOutput) gameOutput.innerHTML += "<span style='color:red;'>Error initializing game. Please refresh the page and try again.</span><br>";
        }
        return false;
    }
}

window.initializeGame = initializeGame;
window.handleChoice = handleChoice; 
window.clearGameUI = clearGameUI;
window.displayCurrentState = displayCurrentState;
window.updateStatusBar = updateStatusBar;

document.addEventListener('DOMContentLoaded', () => {
    try {
        const downloadLogButton = document.getElementById('download-log-button');
        const storyArea = document.getElementById('storyArea');
        const gameOutput = document.getElementById('game-output');
        const debugLog = document.getElementById("debugLog");

        if (!downloadLogButton || !storyArea || !gameOutput) {
            throw new Error("One or more UI elements missing in DOMContentLoaded");
        }

        if (downloadLogButton) {
            downloadLogButton.onclick = downloadChoiceHistoryCSV; 
        }

        if (storyArea && (storyArea.innerHTML === '' || storyArea.textContent.trim() === '')) {
            if(gameOutput && gameOutput.innerHTML.includes("Welcome to the Hyperion Nexus Civilization Builder")){
                storyArea.innerHTML = "Awaiting your command to shape a new civilization.";
            } else if (!gameOutput || !gameOutput.innerHTML.includes("Welcome!")){
                if(gameOutput) gameOutput.innerHTML = 'Welcome to the Hyperion Nexus Civilization Builder. Click "Start Game" to begin.';
            }
        }
        
        updateStatusBar(); 
        
        if (debugLog) {
            debugLog.style.display = "none"; 
        } else {
            console.log("DEBUG: DOMContentLoaded. DebugLog element not found.");
        }
        
        // Check for recovery on page load
        if (window.HyperionErrorHandling && window.HyperionErrorHandling.canRecoverGameState()) {
            const gameOutput = document.getElementById("game-output");
            if(gameOutput) gameOutput.innerHTML += "<br><span style='color:blue;'>A saved game was found. Click 'Start Game' to continue or start a new game.</span><br>";
        }
        
        return true;
    } catch (error) {
        if (window.HyperionErrorHandling) {
            window.HyperionErrorHandling.logError(error, window.HyperionErrorHandling.ErrorType.UI, { action: 'DOMContentLoaded' });
            window.HyperionErrorHandling.displayErrorToUser("Error initializing UI. Please refresh the page.", null, true);
        } else {
            console.error("Error in DOMContentLoaded:", error);
            const gameOutput = document.getElementById("game-output");
            if(gameOutput) gameOutput.innerHTML += "<span style='color:red;'>Error initializing UI. Please refresh the page.</span><br>";
        }
        return false;
    }
});

console.log("hyperion_nexus_game.js script parsed and executed.");
