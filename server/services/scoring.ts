export interface ScoringRules {
  passing: {
    yardsPerPoint: number;
    td: number;
    tdBonus40: number;
    tdBonus50: number;
    interception: number;
    yards300Bonus: number;
    yards400Bonus: number;
    sacked: number;
  };
  rushing: {
    yardsPerPoint: number;
    td: number;
    tdBonus40: number;
    tdBonus50: number;
    yards100Bonus: number;
    yards200Bonus: number;
  };
  receiving: {
    yardsPerPoint: number;
    reception: number;
    td: number;
    tdBonus40: number;
    tdBonus50: number;
    yards100Bonus: number;
    yards200Bonus: number;
  };
  defense: {
    sack: number;
    blockedKick: number;
    interception: number;
    fumbleRecovered: number;
    fumbleForced: number;
    safety: number;
    tackle: number;
    assistedTackle: number;
    stuff: number;
    passDefensed: number;
  };
  kicking: {
    patMade: number;
    patMissed: number;
    fg0to39Made: number;
    fg0to39Missed: number;
    fg40to49Made: number;
    fg40to49Missed: number;
  };
  misc: {
    kickReturnYardsPerPoint: number;
    kickReturn25YardBonus: number;
    puntReturnYardsPerPoint: number;
    puntReturn25YardBonus: number;
    returnTd: number;
    fumble: number;
    fumbleLost: number;
  };
}

/** Bay Area BLITZ league scoring — see project brief. 40+/50+ yard TD bonuses stack
 * (a 50+ yard TD gets both the 40+ and 50+ bonus), matching ESPN's own custom-scoring UI.
 * FG 40-49 rate is reused for 50+ since the league brief doesn't specify a separate tier. */
export const BAY_AREA_BLITZ_RULES: ScoringRules = {
  passing: {
    yardsPerPoint: 25,
    td: 4,
    tdBonus40: 1,
    tdBonus50: 2,
    interception: -2,
    yards300Bonus: 2,
    yards400Bonus: 3,
    sacked: -1,
  },
  rushing: {
    yardsPerPoint: 10,
    td: 6,
    tdBonus40: 2,
    tdBonus50: 2,
    yards100Bonus: 2,
    yards200Bonus: 4,
  },
  receiving: {
    yardsPerPoint: 10,
    reception: 1,
    td: 6,
    tdBonus40: 2,
    tdBonus50: 2,
    yards100Bonus: 2,
    yards200Bonus: 3,
  },
  defense: {
    sack: 1,
    blockedKick: 2,
    interception: 2,
    fumbleRecovered: 2,
    fumbleForced: 2,
    safety: 2,
    tackle: 1,
    assistedTackle: 0.5,
    stuff: 2,
    passDefensed: 1,
  },
  kicking: {
    patMade: 1,
    patMissed: -1,
    fg0to39Made: 3,
    fg0to39Missed: -1,
    fg40to49Made: 3,
    fg40to49Missed: -1,
  },
  misc: {
    kickReturnYardsPerPoint: 20,
    kickReturn25YardBonus: 1,
    puntReturnYardsPerPoint: 20,
    puntReturn25YardBonus: 1,
    returnTd: 6,
    fumble: -1,
    fumbleLost: -2,
  },
};

export interface PlayerStatLine {
  passingYards?: number;
  passingTdLengths?: number[];
  interceptionsThrown?: number;
  timesSacked?: number;

  rushingYards?: number;
  rushingTdLengths?: number[];

  receptions?: number;
  receivingYards?: number;
  receivingTdLengths?: number[];

  sacks?: number;
  blockedKicks?: number;
  defensiveInterceptions?: number;
  fumblesRecovered?: number;
  fumblesForced?: number;
  safeties?: number;
  tackles?: number;
  assistedTackles?: number;
  stuffs?: number;
  passesDefensed?: number;

  patMade?: number;
  patMissed?: number;
  fg0to39Made?: number;
  fg0to39Missed?: number;
  fg40to49Made?: number;
  fg40to49Missed?: number;
  fg50PlusMade?: number;
  fg50PlusMissed?: number;

  kickReturnYards?: number;
  puntReturnYards?: number;
  returnTds?: number;
  fumbles?: number;
  fumblesLost?: number;
}

function yardageTierBonus(yards: number, tiers: { min: number; bonus: number }[]): number {
  const tier = tiers
    .filter((t) => yards >= t.min)
    .sort((a, b) => b.min - a.min)[0];
  return tier?.bonus ?? 0;
}

function tdDistanceBonus(lengths: number[], bonus40: number, bonus50: number): number {
  return lengths.reduce((total, length) => {
    let bonus = 0;
    if (length >= 40) bonus += bonus40;
    if (length >= 50) bonus += bonus50;
    return total + bonus;
  }, 0);
}

export function calculatePlayerPoints(stats: PlayerStatLine, rules: ScoringRules = BAY_AREA_BLITZ_RULES): number {
  let points = 0;

  if (stats.passingYards) points += stats.passingYards / rules.passing.yardsPerPoint;
  if (stats.passingTdLengths) {
    points += stats.passingTdLengths.length * rules.passing.td;
    points += tdDistanceBonus(stats.passingTdLengths, rules.passing.tdBonus40, rules.passing.tdBonus50);
  }
  if (stats.interceptionsThrown) points += stats.interceptionsThrown * rules.passing.interception;
  if (stats.timesSacked) points += stats.timesSacked * rules.passing.sacked;
  if (stats.passingYards) {
    points += yardageTierBonus(stats.passingYards, [
      { min: 300, bonus: rules.passing.yards300Bonus },
      { min: 400, bonus: rules.passing.yards400Bonus },
    ]);
  }

  if (stats.rushingYards) {
    points += stats.rushingYards / rules.rushing.yardsPerPoint;
    points += yardageTierBonus(stats.rushingYards, [
      { min: 100, bonus: rules.rushing.yards100Bonus },
      { min: 200, bonus: rules.rushing.yards200Bonus },
    ]);
  }
  if (stats.rushingTdLengths) {
    points += stats.rushingTdLengths.length * rules.rushing.td;
    points += tdDistanceBonus(stats.rushingTdLengths, rules.rushing.tdBonus40, rules.rushing.tdBonus50);
  }

  if (stats.receptions) points += stats.receptions * rules.receiving.reception;
  if (stats.receivingYards) {
    points += stats.receivingYards / rules.receiving.yardsPerPoint;
    points += yardageTierBonus(stats.receivingYards, [
      { min: 100, bonus: rules.receiving.yards100Bonus },
      { min: 200, bonus: rules.receiving.yards200Bonus },
    ]);
  }
  if (stats.receivingTdLengths) {
    points += stats.receivingTdLengths.length * rules.receiving.td;
    points += tdDistanceBonus(stats.receivingTdLengths, rules.receiving.tdBonus40, rules.receiving.tdBonus50);
  }

  if (stats.sacks) points += stats.sacks * rules.defense.sack;
  if (stats.blockedKicks) points += stats.blockedKicks * rules.defense.blockedKick;
  if (stats.defensiveInterceptions) points += stats.defensiveInterceptions * rules.defense.interception;
  if (stats.fumblesRecovered) points += stats.fumblesRecovered * rules.defense.fumbleRecovered;
  if (stats.fumblesForced) points += stats.fumblesForced * rules.defense.fumbleForced;
  if (stats.safeties) points += stats.safeties * rules.defense.safety;
  if (stats.tackles) points += stats.tackles * rules.defense.tackle;
  if (stats.assistedTackles) points += stats.assistedTackles * rules.defense.assistedTackle;
  if (stats.stuffs) points += stats.stuffs * rules.defense.stuff;
  if (stats.passesDefensed) points += stats.passesDefensed * rules.defense.passDefensed;

  if (stats.patMade) points += stats.patMade * rules.kicking.patMade;
  if (stats.patMissed) points += stats.patMissed * rules.kicking.patMissed;
  if (stats.fg0to39Made) points += stats.fg0to39Made * rules.kicking.fg0to39Made;
  if (stats.fg0to39Missed) points += stats.fg0to39Missed * rules.kicking.fg0to39Missed;
  if (stats.fg40to49Made) points += stats.fg40to49Made * rules.kicking.fg40to49Made;
  if (stats.fg40to49Missed) points += stats.fg40to49Missed * rules.kicking.fg40to49Missed;
  if (stats.fg50PlusMade) points += stats.fg50PlusMade * rules.kicking.fg40to49Made;
  if (stats.fg50PlusMissed) points += stats.fg50PlusMissed * rules.kicking.fg40to49Missed;

  if (stats.kickReturnYards) {
    points += stats.kickReturnYards / rules.misc.kickReturnYardsPerPoint;
    points += Math.floor(stats.kickReturnYards / 25) * rules.misc.kickReturn25YardBonus;
  }
  if (stats.puntReturnYards) {
    points += stats.puntReturnYards / rules.misc.puntReturnYardsPerPoint;
    points += Math.floor(stats.puntReturnYards / 25) * rules.misc.puntReturn25YardBonus;
  }
  if (stats.returnTds) points += stats.returnTds * rules.misc.returnTd;
  if (stats.fumbles) points += stats.fumbles * rules.misc.fumble;
  if (stats.fumblesLost) points += stats.fumblesLost * rules.misc.fumbleLost;

  return Math.round(points * 100) / 100;
}
