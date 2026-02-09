# User Request: XP System Implementation

let's work on the xp aspect of the app 

first define the levels as follows 


export const TEST_LEVELS: LevelNode[] = [
  { level: 1, xp: 0, title: "Tourist", reward: "Basic Map Access" },
  { level: 2, xp: 500, title: "Wanderer", reward: "Custom Avatar Frame" },
  { level: 3, xp: 1500, title: "Explorer", reward: "Create Public Routes" },
  { level: 4, xp: 3000, title: "Pathfinder", reward: "Night Mode Maps" },
  { level: 5, xp: 5000, title: "Navigator", reward: "Exclusive 'Undercity' Quests" },
  { level: 6, xp: 8000, title: "Cartographer", reward: "Custom Map Themes" },
  { level: 7, xp: 12000, title: "Street Savant", reward: "AR Vision (Beta)" },
  { level: 8, xp: 17000, title: "Urban Legend", reward: "Create Guilds" },
  { level: 9, xp: 25000, title: "City Hunter", reward: "Developer Badge" },
  { level: 10, xp: 35000, title: "Master Architect", reward: "The Key to the City" },
  { level: 11, xp: 50000, title: "Ethereal Guide", reward: "Global Custom Landmarks" },
  { level: 12, xp: 75000, title: "Omniscient", reward: "Game Master Controls" },
];


create a script to save the information 

next explore how we can access user xp 

and then define a mission model this describes a mission mainly visite location x 
and xp gained (first visit, second visit) 

the first visit give more xp second visit gives less 

maybe define a function with exp decay and min value 

next calculate user xp function 

save the xp somewhere 

and list the places visited under an activity model this way can now if the user visited the same place multiple time and know how many xp point we can give him 

create full plan divide it then into 3 MD PLANS one perphase 
and one global md that traks the plan add in the plan that we should edit @[prompts-lib/agent_guide/API_AGENT_GUIDE.md] 
