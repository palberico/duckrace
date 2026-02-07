
const adjectives = [
    "Captain", "Speedy", "Sir", "Neon", "Professor", "Doctor", "Mister", "Miss", "Lady", "Baron",
    "Duke", "Turbo", "Mega", "Super", "Ultra", "Thunder", "Lightning", "Storm", "Aqua", "Hydro",
    "Rubber", "Squeaky", "Golden", "Silver", "Crystal", "Cosmic", "Galactic", "Quantum", "Hyper",
    "Dashing", "Brave", "Bold", "Lucky", "Happy", "Jolly", "Sunny", "Cloudy", "Windy", "Rainy",
    "Snowy", "Icy", "Fiery", "Electric", "Magnetic", "Sonic", "Rapid", "Swift", "Zoom", "Zip",
    "Waddling", "Swimming", "Floating", "Flying", "Diving", "Surfing", "Sailing", "Cruising",
    "Majestic", "Royal", "Grand", "Epic", "Legendary", "Mythical", "Mystic", "Magic", "Secret"
];

const nouns = [
    "Quack", "Waddles", "Feathers", "Bill", "Beak", "Wing", "Web", "Puddle", "Pond", "Lake",
    "River", "Ocean", "Sea", "Wave", "Splash", "Bubble", "Foam", "Drop", "Rain", "Storm",
    "Duck", "Drake", "Mallard", "Goose", "Swan", "Bird", "Fowl", "Chick", "Egg", "Nest",
    "Racer", "Sprinter", "Dash", "Zoom", "Flash", "Bolt", "Speed", "Velocity", "Momentum",
    "Pilot", "Aviator", "Captain", "Commander", "Admiral", "Navigator", "Explorer", "Adventurer",
    "Hero", "Champion", "Winner", "Star", "Comet", "Rocket", "Jet", "Plane", "Glider",
    "Orbiter", "Voyager", "Traveler", "Wanderer", "Drifter", "Floater", "Bobber", "Squeaker"
];

export const generateDuckName = () => {
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];

    // 10% chance to be just "The [Noun]" or "[Adjective] [Noun] [Number]" for variety?
    // Let's keep it simple "Adjective Noun" for now as requested.
    return `${randomAdjective} ${randomNoun}`;
};
