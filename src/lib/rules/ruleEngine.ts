import { CategoryEnum, DrinkEnum } from '$lib/db/schema';
import type { Rule } from '$lib/db/schema';

// Base rule templates
const baseRules: Omit<Rule, 'id' | 'gameId' | 'order' | 'createdAt'>[] = [
  // Camera rules
  {
    text: "Every time {host} mentions a specific camera model",
    category: CategoryEnum.Camera,
    weight: 0.8,
    baseDrink: DrinkEnum.Sip,
    isCustom: false
  },
  {
    text: "When {host} shows the camera's viewfinder",
    category: CategoryEnum.Camera,
    weight: 0.6,
    baseDrink: DrinkEnum.Sip,
    isCustom: false
  },
  {
    text: "If {host} adjusts camera settings on screen",
    category: CategoryEnum.Camera,
    weight: 0.7,
    baseDrink: DrinkEnum.Gulp,
    isCustom: false
  },

  // Film rules
  {
    text: "Every time {host} mentions film stock",
    category: CategoryEnum.Film,
    weight: 0.9,
    baseDrink: DrinkEnum.Sip,
    isCustom: false
  },
  {
    text: "When {host} shows film being loaded",
    category: CategoryEnum.Film,
    weight: 0.5,
    baseDrink: DrinkEnum.Gulp,
    isCustom: false
  },
  {
    text: "If {host} discusses film development",
    category: CategoryEnum.Film,
    weight: 0.6,
    baseDrink: DrinkEnum.Pull,
    isCustom: false
  },

  // Technique rules
  {
    text: "When {host} explains a photography technique",
    category: CategoryEnum.Technique,
    weight: 0.7,
    baseDrink: DrinkEnum.Sip,
    isCustom: false
  },
  {
    text: "If {host} demonstrates manual focus",
    category: CategoryEnum.Technique,
    weight: 0.5,
    baseDrink: DrinkEnum.Gulp,
    isCustom: false
  },
  {
    text: "When {host} talks about composition",
    category: CategoryEnum.Technique,
    weight: 0.6,
    baseDrink: DrinkEnum.Sip,
    isCustom: false
  },

  // Location rules
  {
    text: "Every time {host} mentions a location",
    category: CategoryEnum.Location,
    weight: 0.8,
    baseDrink: DrinkEnum.Sip,
    isCustom: false
  },
  {
    text: "When {host} shows outdoor shooting",
    category: CategoryEnum.Location,
    weight: 0.6,
    baseDrink: DrinkEnum.Gulp,
    isCustom: false
  },

  // Equipment rules
  {
    text: "When {host} mentions any photography equipment",
    category: CategoryEnum.Equipment,
    weight: 0.7,
    baseDrink: DrinkEnum.Sip,
    isCustom: false
  },
  {
    text: "If {host} shows a tripod",
    category: CategoryEnum.Equipment,
    weight: 0.4,
    baseDrink: DrinkEnum.Gulp,
    isCustom: false
  },

  // General rules
  {
    text: "Every time {host} says 'film photography'",
    category: CategoryEnum.General,
    weight: 0.9,
    baseDrink: DrinkEnum.Sip,
    isCustom: false
  },
  {
    text: "When {host} shows the final photo",
    category: CategoryEnum.General,
    weight: 0.8,
    baseDrink: DrinkEnum.Pull,
    isCustom: false
  },
  {
    text: "If {host} mentions the cost of anything",
    category: CategoryEnum.General,
    weight: 0.6,
    baseDrink: DrinkEnum.Gulp,
    isCustom: false
  }
];

export function selectRules(intoxicationLevel: number, maxRules: number = 5): typeof baseRules {
  // Select 2-3 categories for diversity
	const categories = Object.values(CategoryEnum) as (typeof CategoryEnum[keyof typeof CategoryEnum])[];
	const selectedCategories = shuffleArray(categories).slice(
		0,
		Math.min(3, Math.max(2, Math.floor(maxRules / 2)))
	);
  
  // Filter rules by selected categories
  // @ts-ignore
  const categoryRules = baseRules.filter(rule => selectedCategories.includes(rule.category));
  
  // Weighted random selection
  const selectedRules: typeof baseRules = [];
  const usedCategories = new Set<string>();
  
  while (selectedRules.length < maxRules && categoryRules.length > 0) {
    // Calculate total weight for remaining rules
    const totalWeight = categoryRules.reduce((sum, rule) => sum + rule.weight, 0);
    
    // Random selection based on weight
    let random = Math.random() * totalWeight;
    let selectedIndex = -1;
    
    for (let i = 0; i < categoryRules.length; i++) {
      random -= categoryRules[i].weight;
      if (random <= 0) {
        selectedIndex = i;
        break;
      }
    }
    
    if (selectedIndex === -1) {
      selectedIndex = categoryRules.length - 1;
    }
    
    const selectedRule = categoryRules[selectedIndex];
    selectedRules.push(selectedRule);
    usedCategories.add(selectedRule.category);
    
    // Remove selected rule to avoid duplicates
    categoryRules.splice(selectedIndex, 1);
    
    // If we have enough categories represented, allow any category
    if (usedCategories.size >= 2) {
      break;
    }
  }
  
  // Fill remaining slots with any available rules
  while (selectedRules.length < maxRules && categoryRules.length > 0) {
    const randomIndex = Math.floor(Math.random() * categoryRules.length);
    selectedRules.push(categoryRules[randomIndex]);
    categoryRules.splice(randomIndex, 1);
  }
  
  return selectedRules;
}

export function calculateEffectiveDrink(baseDrink: number, intoxicationLevel: number): number {
  const effectiveDrink = baseDrink + intoxicationLevel;
  return Math.min(effectiveDrink, DrinkEnum.Shot);
}

export function getDrinkName(drinkLevel: number): { name: string; icon: string } {
  switch (drinkLevel) {
    case DrinkEnum.Sip: return { name: 'Sip', icon: '🥤' };
    case DrinkEnum.Gulp: return { name: 'Gulp', icon: '🥃' };
    case DrinkEnum.Pull: return { name: 'Pull', icon: '🍺' };
    case DrinkEnum.Shot: return { name: 'Shot', icon: '🥃' };
    default: return { name: 'Sip', icon: '🥤' };
  }
}

export function generateRulesForVideo({ 
  videoId, 
  videoTitle, 
  numberOfRules, 
  intoxicationLevel 
}: {
  videoId: string;
  videoTitle: string;
  numberOfRules: number;
  intoxicationLevel: number;
}) {
  // Select rules based on intoxication level and number requested
  const selectedRules = selectRules(intoxicationLevel, numberOfRules);
  
  // Replace {host} placeholder with "the host" or extract from video title if possible
  const hostName = extractHostName(videoTitle) || "the host";
  
  return selectedRules.map((rule, index) => ({
    text: rule.text.replace(/{host}/g, hostName),
    category: rule.category,
    baseDrink: calculateEffectiveDrink(rule.baseDrink, intoxicationLevel - 1), // Adjust for 0-based indexing
    weight: rule.weight,
    isCustom: false
  }));
}

function extractHostName(videoTitle: string): string | null {
  // Simple extraction - could be enhanced with more sophisticated logic
  // For now, just return "the host" as a safe default
  return "the host";
}

function shuffleArray<T>(array: readonly T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
} 