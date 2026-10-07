import { PcBuilderSlotsType } from '../flagship-enthusiast-pcbuild/pc-builder-slots-type';
import { HardwareCategory, HardwarePart } from './hardware-part';

/**
 * One slot of the current build. Keeps the App Builder generated
 * PcBuilderSlotsType shape so the existing slot card bindings still apply.
 */
export interface BuildSlot extends PcBuilderSlotsType {
  category: HardwareCategory;
  selectedComponentName: string;
  specsDetail: string;
  wattage: number;
  price: number;
  imageUrl: string;
  part: HardwarePart | null;
}
