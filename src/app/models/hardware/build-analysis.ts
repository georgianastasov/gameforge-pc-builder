import { HARDWARE_CATEGORIES, HardwareCategory, HardwarePart } from './hardware-part';

/** `pending` means a check can't run yet because a part it needs isn't selected. */
export type CheckStatus = 'pass' | 'warning' | 'fail' | 'pending';

/** Worst-first overall state of a report. */
export type BuildHealth = 'pass' | 'warning' | 'fail';

export type CheckId = 'slots' | 'cpu-socket' | 'ram-board' | 'board-case' | 'gpu-clearance' | 'cooling-case' | 'cooler-cpu' | 'psu-capacity';

export interface CompatibilityCheck {
  id: CheckId;
  label: string;
  status: CheckStatus;
  detail: string;
}

export interface PowerReport {
  /** Sum of every selected part's rated draw (W). */
  drawW: number;
  /** Selected PSU's rated output (W); `null` without a PSU. */
  capacityW: number | null;
  /** Draw as a share of PSU capacity (can exceed 100). */
  utilisationPct: number;
  /** Capacity left over (W); negative when overloaded. */
  headroomW: number;
  headroomPct: number;
  /** e.g. "Platinum", parsed from the PSU's 80+ rating. */
  efficiencyRating: string | null;
  status: BuildHealth;
  summary: string;
}

export interface BuildAnalysis {
  power: PowerReport;
  checks: CompatibilityCheck[];
  /** Checks that failed or need attention, worst first. */
  issues: CompatibilityCheck[];
  failureCount: number;
  warningCount: number;
  missingSlots: HardwareCategory[];
  isComplete: boolean;
  health: BuildHealth;
}

export type SelectedParts = Record<HardwareCategory, HardwarePart | null>;

/** Utilisation above this share of PSU capacity loses efficiency and transient headroom. */
export const PSU_OPTIMAL_LOAD_PCT = 80;
/** GPUs with less spare length than this are a tight fit for cabling and airflow. */
export const GPU_CLEARANCE_MARGIN_MM = 20;

const check = (id: CheckId, label: string, status: CheckStatus, detail: string): CompatibilityCheck => ({ id, label, status, detail });

const pending = (id: CheckId, label: string, ...needs: string[]) =>
  check(id, label, 'pending', `Select a ${needs.join(' and ')} to verify.`);

export function analysePower(parts: SelectedParts): PowerReport {
  const drawW = HARDWARE_CATEGORIES.reduce((sum, category) => sum + (parts[category]?.tdpWattage ?? 0), 0);
  const psu = parts.PSU;
  const capacityW = psu?.wattageCapacity ?? null;
  const efficiencyRating = psu?.specsDetail.match(/80\+ (\w+)/)?.[1] ?? null;

  if (!capacityW) {
    return { drawW, capacityW, utilisationPct: 0, headroomW: 0, headroomPct: 0, efficiencyRating, status: 'warning', summary: 'Select a PSU to calculate headroom' };
  }

  const utilisationPct = Math.round((drawW / capacityW) * 100);
  const headroomW = capacityW - drawW;
  const headroomPct = Math.round((headroomW / capacityW) * 100);
  const status: BuildHealth = utilisationPct > 100 ? 'fail' : utilisationPct > PSU_OPTIMAL_LOAD_PCT ? 'warning' : 'pass';
  const summary = status === 'fail'
    ? `Exceeds PSU capacity by ${-headroomW}W`
    : status === 'warning'
      ? `Above ${PSU_OPTIMAL_LOAD_PCT}% load: limited transient headroom`
      : `Optimal 80+ ${efficiencyRating ?? 'Rated'} Range`;
  return { drawW, capacityW, utilisationPct, headroomW, headroomPct, efficiencyRating, status, summary };
}

function slotsCheck(missing: HardwareCategory[]): CompatibilityCheck {
  const label = 'Hardware slots';
  return missing.length
    ? check('slots', label, 'fail', `Missing ${missing.join(', ')}. All ${HARDWARE_CATEGORIES.length} slots are required.`)
    : check('slots', label, 'pass', `All ${HARDWARE_CATEGORIES.length} required slots are populated.`);
}

function cpuSocketCheck({ CPU: cpu, Motherboard: board }: SelectedParts): CompatibilityCheck {
  const label = 'CPU & motherboard socket';
  if (!cpu || !board) {
    return pending('cpu-socket', label, 'CPU', 'motherboard');
  }
  return cpu.socket === board.socket
    ? check('cpu-socket', label, 'pass', `${cpu.name} matches the ${board.socket} socket on the ${board.name}.`)
    : check('cpu-socket', label, 'fail', `${cpu.name} needs ${cpu.socket}, but the ${board.name} is ${board.socket}.`);
}

function ramBoardCheck({ RAM: ram, Motherboard: board }: SelectedParts): CompatibilityCheck {
  const label = 'Memory & motherboard';
  if (!ram || !board) {
    return pending('ram-board', label, 'RAM kit', 'motherboard');
  }
  return ram.memoryType === board.memoryType
    ? check('ram-board', label, 'pass', `${ram.memoryType} kit is supported by the ${board.name}.`)
    : check('ram-board', label, 'fail', `${ram.name} is ${ram.memoryType}, but the ${board.name} takes ${board.memoryType}.`);
}

function boardCaseCheck({ Motherboard: board, Case: chassis }: SelectedParts): CompatibilityCheck {
  const label = 'Motherboard & case form factor';
  if (!board || !chassis) {
    return pending('board-case', label, 'motherboard', 'case');
  }
  return board.formFactor && chassis.supportedFormFactors?.includes(board.formFactor)
    ? check('board-case', label, 'pass', `${board.formFactor} board fits the ${chassis.name}.`)
    : check('board-case', label, 'fail', `The ${chassis.name} does not accept ${board.formFactor ?? 'this'} motherboards.`);
}

function gpuClearanceCheck({ GPU: gpu, Case: chassis }: SelectedParts): CompatibilityCheck {
  const label = 'GPU length clearance';
  if (!gpu || !chassis) {
    return pending('gpu-clearance', label, 'GPU', 'case');
  }
  const length = gpu.lengthMm ?? 0;
  const max = chassis.maxGpuLengthMm ?? 0;
  const spare = max - length;
  if (spare < 0) {
    return check('gpu-clearance', label, 'fail', `${length}mm ${gpu.name} is ${-spare}mm too long for the ${max}mm bay in the ${chassis.name}.`);
  }
  return spare < GPU_CLEARANCE_MARGIN_MM
    ? check('gpu-clearance', label, 'warning', `${length}mm GPU leaves only ${spare}mm of the ${max}mm bay for cabling.`)
    : check('gpu-clearance', label, 'pass', `${length}mm GPU clears the ${max}mm bay with ${spare}mm to spare.`);
}

function coolingCaseCheck({ Cooling: cooler, Case: chassis }: SelectedParts): CompatibilityCheck {
  const label = 'Cooler & case fit';
  if (!cooler || !chassis) {
    return pending('cooling-case', label, 'cooler', 'case');
  }
  if (cooler.radiatorMm) {
    const max = chassis.maxRadiatorMm ?? 0;
    return cooler.radiatorMm <= max
      ? check('cooling-case', label, 'pass', `${cooler.radiatorMm}mm radiator mounts in the ${chassis.name} (up to ${max}mm).`)
      : check('cooling-case', label, 'fail', `${cooler.radiatorMm}mm radiator exceeds the ${max}mm mounts in the ${chassis.name}.`);
  }
  const height = cooler.heightMm ?? 0;
  const max = chassis.maxCoolerHeightMm ?? 0;
  return height <= max
    ? check('cooling-case', label, 'pass', `${height}mm air cooler fits under the ${max}mm limit of the ${chassis.name}.`)
    : check('cooling-case', label, 'fail', `${height}mm ${cooler.name} is ${height - max}mm taller than the ${max}mm limit of the ${chassis.name}.`);
}

function coolerCpuCheck({ Cooling: cooler, CPU: cpu }: SelectedParts): CompatibilityCheck {
  const label = 'Cooler mount & thermal capacity';
  if (!cooler || !cpu) {
    return pending('cooler-cpu', label, 'cooler', 'CPU');
  }
  if (cpu.socket && !cooler.supportedSockets?.includes(cpu.socket)) {
    return check('cooler-cpu', label, 'fail', `${cooler.name} has no ${cpu.socket} mounting kit.`);
  }
  const capacity = cooler.coolingCapacityW ?? 0;
  return cpu.tdpWattage > capacity
    ? check('cooler-cpu', label, 'warning', `${cpu.name} can draw ${cpu.tdpWattage}W, above the ${capacity}W rating of the ${cooler.name}.`)
    : check('cooler-cpu', label, 'pass', `${cooler.name} handles the ${cpu.tdpWattage}W ${cpu.name}.`);
}

function psuCheck(parts: SelectedParts, power: PowerReport): CompatibilityCheck {
  const label = 'PSU capacity';
  if (!parts.PSU) {
    return pending('psu-capacity', label, 'PSU');
  }
  const detail = `${power.drawW}W estimated draw on a ${power.capacityW}W PSU (${power.utilisationPct}% load).`;
  return check('psu-capacity', label, power.status, power.status === 'pass' ? detail : `${detail} ${power.summary}.`);
}

const SEVERITY: Record<CheckStatus, number> = { fail: 0, warning: 1, pending: 2, pass: 3 };

/** The hardware slots each check inspects. */
export const CHECK_SLOTS: Record<CheckId, readonly HardwareCategory[]> = {
  'slots': [],
  'cpu-socket': ['CPU', 'Motherboard'],
  'ram-board': ['RAM', 'Motherboard'],
  'board-case': ['Motherboard', 'Case'],
  'gpu-clearance': ['GPU', 'Case'],
  'cooling-case': ['Cooling', 'Case'],
  'cooler-cpu': ['Cooling', 'CPU'],
  'psu-capacity': ['PSU']
};

/** Worst status among the checks that involve `category`; `pending` for an empty slot. */
export function slotStatus(analysis: BuildAnalysis, category: HardwareCategory): CheckStatus {
  if (analysis.missingSlots.includes(category)) {
    return 'pending';
  }
  return analysis.checks
    .filter(c => CHECK_SLOTS[c.id].includes(category) && c.status !== 'pending')
    .reduce<CheckStatus>((worst, c) => SEVERITY[c.status] < SEVERITY[worst] ? c.status : worst, 'pass');
}

/** Runs every power and compatibility rule against the current selection. */
export function analyseBuild(parts: SelectedParts): BuildAnalysis {
  const missingSlots = HARDWARE_CATEGORIES.filter(category => !parts[category]);
  const power = analysePower(parts);
  const checks = [
    slotsCheck(missingSlots),
    cpuSocketCheck(parts),
    ramBoardCheck(parts),
    boardCaseCheck(parts),
    gpuClearanceCheck(parts),
    coolingCaseCheck(parts),
    coolerCpuCheck(parts),
    psuCheck(parts, power)
  ];
  const issues = checks
    .filter(c => c.status === 'fail' || c.status === 'warning')
    .sort((a, b) => SEVERITY[a.status] - SEVERITY[b.status]);
  const failureCount = issues.filter(c => c.status === 'fail').length;
  const warningCount = issues.length - failureCount;
  return {
    power,
    checks,
    issues,
    failureCount,
    warningCount,
    missingSlots,
    isComplete: missingSlots.length === 0,
    health: failureCount ? 'fail' : warningCount ? 'warning' : 'pass'
  };
}
