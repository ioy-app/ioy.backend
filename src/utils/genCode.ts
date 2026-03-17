/**
 * Генерация случайного кода
 * 
 * @param {number} [length=6] Длина кода 
 * @returns {string}
*/
const genCode = (length: number = 6): string => {
    const digits: string = "0123456789";
    let code: string = "";
    for (let i = 0; i < length; i++)
        code += digits[~~(Math.random() * digits.length)];

    return code.padStart(length, "0");
}

export default genCode;