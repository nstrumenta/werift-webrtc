import { InterfaceAddresses } from "../../common/src/network";
import { Address } from "./types/model";
export declare function getGlobalIp(stunServer?: Address, interfaceAddresses?: InterfaceAddresses): Promise<string | undefined>;
export declare function normalizeFamilyNodeV18(family: string | number): 4 | 6;
