import {compare ,generate}

export const generateHash = asymc (
    plaintext: string,
    salt_round: number = parseInt(procees.env.SALT as string),
): promise<string>=>{
    return await hash(plaintext, salt_round)
};

export const compareHash = async (
    plaintext: string,
    hashValue: string,
): promise<boolean>=>{
    return await compare(plaintext, hashValue)
}