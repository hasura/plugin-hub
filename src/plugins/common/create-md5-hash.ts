import {createHash} from "node:crypto";
export function createMD5Hash(input: string): string {
    const hash = createHash('md5');
    hash.update(input);
    return hash.digest('hex');
}