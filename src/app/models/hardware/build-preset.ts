import { CustomPcBuildsType } from '../elite-flagship-pctrio/custom-pc-builds-type';
import { HardwareCategory } from './hardware-part';

/** Part ids keyed by slot. `null` means the slot is empty. */
export type BuildSelection = Record<HardwareCategory, string | null>;

/** A featured GameForge configuration shown on Home. */
export interface BuildPreset extends CustomPcBuildsType {
  id: string;
  name: string;
  tier: string;
  imageUrl: string;
  /** 3DMark Time Spy overall score measured on the assembled rig. */
  benchmarkScore: number;
  specsSummary: string;
  /** Sum of the preset's part prices; derived from the catalog. */
  price: number;
  parts: Record<HardwareCategory, string>;
}
