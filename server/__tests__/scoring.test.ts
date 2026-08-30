import { calculatePlayerPoints, BAY_AREA_BLITZ_RULES, PlayerStatLine } from '../services/scoring';

function points(stats: PlayerStatLine): number {
  return calculatePlayerPoints(stats, BAY_AREA_BLITZ_RULES);
}

describe('passing', () => {
  it('scores yardage at 1 pt per 25 yards with no bonus below 300', () => {
    expect(points({ passingYards: 250 })).toBe(10);
  });

  it('adds the 300-399 yard bonus', () => {
    expect(points({ passingYards: 300 })).toBe(14); // 12 + 2
  });

  it('adds only the 400+ yard bonus, not both tiers', () => {
    expect(points({ passingYards: 400 })).toBe(19); // 16 + 3
  });

  it('scores a TD pass under 40 yards with no distance bonus', () => {
    expect(points({ passingTdLengths: [35] })).toBe(4);
  });

  it('stacks the 40+ bonus onto a 40-49 yard TD pass', () => {
    expect(points({ passingTdLengths: [45] })).toBe(5); // 4 + 1
  });

  it('stacks both 40+ and 50+ bonuses onto a 50+ yard TD pass', () => {
    expect(points({ passingTdLengths: [55] })).toBe(7); // 4 + 1 + 2
  });

  it('penalizes interceptions and sacks', () => {
    expect(points({ interceptionsThrown: 1 })).toBe(-2);
    expect(points({ timesSacked: 1 })).toBe(-1);
  });
});

describe('rushing', () => {
  it('adds the 100-199 yard bonus', () => {
    expect(points({ rushingYards: 120 })).toBe(14); // 12 + 2
  });

  it('adds the 200+ yard bonus', () => {
    expect(points({ rushingYards: 210 })).toBe(25); // 21 + 4
  });

  it('stacks distance bonuses on a 50+ yard TD run', () => {
    expect(points({ rushingTdLengths: [55] })).toBe(10); // 6 + 2 + 2
  });
});

describe('receiving', () => {
  it('scores PPR receptions', () => {
    expect(points({ receptions: 5 })).toBe(5);
  });

  it('adds the 100-199 yard bonus', () => {
    expect(points({ receivingYards: 150 })).toBe(17); // 15 + 2
  });

  it('adds the 200+ yard bonus', () => {
    expect(points({ receivingYards: 220 })).toBe(25); // 22 + 3
  });

  it('stacks distance bonuses on a 50+ yard TD catch', () => {
    expect(points({ receivingTdLengths: [55] })).toBe(10); // 6 + 2 + 2
  });
});

describe('defense (IDP)', () => {
  it('scores tackles, assists, and turnovers independently', () => {
    expect(points({ tackles: 5 })).toBe(5);
    expect(points({ assistedTackles: 4 })).toBe(2);
    expect(points({ sacks: 2 })).toBe(2);
    expect(points({ defensiveInterceptions: 1 })).toBe(2);
    expect(points({ fumblesForced: 1, fumblesRecovered: 1 })).toBe(4);
    expect(points({ safeties: 1 })).toBe(2);
    expect(points({ stuffs: 1 })).toBe(2);
    expect(points({ passesDefensed: 1 })).toBe(1);
    expect(points({ blockedKicks: 1 })).toBe(2);
  });
});

describe('kicking', () => {
  it('scores makes and penalizes misses per distance tier', () => {
    expect(points({ fg0to39Made: 2 })).toBe(6);
    expect(points({ fg0to39Missed: 1 })).toBe(-1);
    expect(points({ fg40to49Made: 1 })).toBe(3);
    expect(points({ patMade: 3, patMissed: 1 })).toBe(2);
  });

  it('falls back to the 40-49 rate for 50+ yard field goals', () => {
    expect(points({ fg50PlusMade: 1 })).toBe(3);
    expect(points({ fg50PlusMissed: 1 })).toBe(-1);
  });
});

describe('misc / special teams', () => {
  it('combines the per-yard rate with the every-25-yard bonus', () => {
    expect(points({ kickReturnYards: 100 })).toBe(9); // 5 + 4
    expect(points({ puntReturnYards: 50 })).toBe(4.5); // 2.5 + 2
  });

  it('scores return TDs and fumbles', () => {
    expect(points({ returnTds: 1 })).toBe(6);
    expect(points({ fumbles: 1, fumblesLost: 1 })).toBe(-3);
  });
});

describe('combined stat line', () => {
  it('sums across categories', () => {
    const stat: PlayerStatLine = {
      passingYards: 310,
      passingTdLengths: [12, 45],
      interceptionsThrown: 1,
    };
    // yards: 310/25=12.4 +2(300 bonus) = 14.4
    // TDs: 4 + (4+1) = 9 -> total TD points = 4*2 + 1 (distance bonus) = 9
    // interception: -2
    expect(points(stat)).toBe(21.4);
  });
});
