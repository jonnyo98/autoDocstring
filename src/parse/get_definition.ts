import { blankLine, preprocessLines } from "./utilities";
import { log } from "console";

export function getDefinition(document: string, linePosition: number): string {
    const precedingLines = getPrecedingLines(document, linePosition);
    const preceedingDef = getPreceedingDefinition(precedingLines);

    if(isClass(preceedingDef)) {
        const proceedingDefinition = getProceedingDefinition(document, linePosition);
        const classDef =  buildClassDefinition(preceedingDef, proceedingDefinition);
        log("built classdef ", classDef);
        return classDef;
    }
    return preceedingDef
}

function getPreceedingDefinition(precedingLines: string[]) {
    // if class, use proceeding line. Else preceeding.
    const precedingText = precedingLines.join(" ");

    // Don't parse if the passed lines are blank
    const precedingLine = precedingLines[precedingLines.length - 1];
    if (precedingLine == undefined || blankLine(precedingLine)) {
        return "";
    }

    const pattern = /\b(((async\s+)?\s*def)|\s*class)\b/g;

    // Get starting index of last def match in the preceding text
    let index: number;
    while (pattern.test(precedingText)) {
        index = pattern.lastIndex - RegExp.lastMatch.length;
    }

    if (index == undefined) {
        return "";
    }

    const lastFunctionDef = precedingText.slice(index);
    return lastFunctionDef.trim();
}

function getProceedingDefinition(document: string, linePosition: number): string {
    const lines = document.split("\n");
    const rawProceedingLines = lines.slice(linePosition, lines.length)

    const proceedingLine = preprocessLines(rawProceedingLines.slice(1,2))
    return proceedingLine[0]
}

function buildClassDefinition(preceedingDef: string, proceedingDefinition: string) {
    let className = " " + getClassName(preceedingDef)
    log("building class definition for",className);

    const pattern = /(?<=def|class)\s+(\w+)(?=\s*\()/;
    return proceedingDefinition.replace(pattern, className);
}

function getClassName(definition: string): string {
    const pattern = /(?:class)\s+(\w+)\s*:/;

    const match = pattern.exec(definition);

    if (match == undefined || match[1] == undefined) {
        return "";
    }

    return match[1];
}

function isClass(definition: string): boolean {
    log("checking ", definition)
    const pattern = /(class)(?=\s+(\w+):\s*)/;
    return pattern.test(definition)
}

function getPrecedingLines(document: string, linePosition: number): string[] {
    const lines = document.split("\n");
    const rawPrecedingLines = lines.slice(0, linePosition);

    const precedingLines = preprocessLines(rawPrecedingLines);

    return precedingLines;
}
