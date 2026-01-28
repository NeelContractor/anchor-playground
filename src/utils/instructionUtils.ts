import { FormattedInstruction } from "@/types";
import { IdlInstruction } from "@coral-xyz/anchor/dist/cjs/idl";

export const formatInstructions = (
    instructions: IdlInstruction[]
): FormattedInstruction[] => {
    return instructions.map((ix) => ({
        ...ix,
        displayName: ix.name.charAt(0).toUpperCase() + ix.name.slice(1).replace(/_/g, " "),
    }));
}

export const formatInstructionName = (name: string): string => {
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, " ");
}