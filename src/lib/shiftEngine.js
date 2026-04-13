/**
 * The Shift Engine tracks the 12-Day Forward Staggering Rota.
 * CYCLE_DAYS:
 * 1 = Morning 1, 2 = Morning 2, 3 = Morning 3
 * 4 = OFF
 * 5 = Night 1, 6 = Night 2, 7 = Night 3
 * 8 = OFF
 * 9 = Mid 1, 10 = Mid 2, 11 = Mid 3
 * 12 = OFF
 */
export const SHIFT_CYCLE = [
  'Morning', 'Morning', 'Morning',
  'Off',
  'Night', 'Night', 'Night',
  'Off',
  'Mid', 'Mid', 'Mid',
  'Off'
];

export const CREW_NAMES = ['A', 'B', 'C', 'D'];

// Calculate difference in exact days (ignoring hours)
export function getDaysDifference(anchorDateStr, targetDateStr) {
  // Normalize both dates to exactly midnight (UTC) to calculate absolute day differences
  // so that hours of the day do not interfere with the mathematical modulo
  const t1 = new Date(anchorDateStr);
  const t2 = new Date(targetDateStr);
  
  const utc1 = Date.UTC(t1.getFullYear(), t1.getMonth(), t1.getDate());
  const utc2 = Date.UTC(t2.getFullYear(), t2.getMonth(), t2.getDate());
  
  return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
}

/**
 * Given an anchor date (e.g. '2026-04-13') where Crew A is on Day 6 (index 5)
 * calculate the position of all 4 crews on `targetDateStr` ('YYYY-MM-DD').
 */
export function calculateShiftState(anchorDateStr, crewAAnchorCycleDayIndex, targetDateStr) {
  const diffDays = getDaysDifference(anchorDateStr, targetDateStr);

  const roster = {
    Morning: null,
    Night: null,
    Mid: null,
    Off: null
  };

  const results = [];

  for (let c = 0; c < 4; c++) {
    // Mathematical staggered offset: 
    // Shift B (+3 days ahead of A in the cycle)
    // Shift C (+6 days ahead of A)
    // Shift D (+9 days ahead of A)
    const crewOffset = (c * 3) % 12;
    
    let currentPosition = (crewAAnchorCycleDayIndex + diffDays + crewOffset) % 12;
    if (currentPosition < 0) {
       currentPosition += 12; // Handle JS modulo on negative numbers
    }

    const shiftType = SHIFT_CYCLE[currentPosition];
    const crewName = CREW_NAMES[c];

    results.push({
      crew: `Shift ${crewName}`,
      cycleDay: currentPosition + 1,
      shift: shiftType
    });

    if (roster[shiftType] === null) roster[shiftType] = [];
    roster[shiftType].push(`Shift ${crewName}`);
  }

  // Formatting output
  return {
    date: targetDateStr,
    assignments: {
      Morning: roster.Morning[0],
      Night: roster.Night[0],
      Mid: roster.Mid[0],
      Off: roster.Off[0]
    },
    crewDetails: results
  };
}
