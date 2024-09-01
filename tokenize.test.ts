import { expect, test, describe } from 'bun:test';

enum TokenType {
    Parenthesis = 'Parenthesis',
    Number = 'Number',
    String = 'String',
    Name = 'Name',
    Operator = 'Operator',
    Keyword = 'Keyword',
}

type Token = {
    type: TokenType | string;
    value: string | number;
}

const tokenize = (code: string): Token[] => {
    const result: Token[] = [];
    let current = '';

    const push = (type: TokenType, value: string | number) => {
        result.push({ type, value });
        current = '';
    }

    for (let i = 0; i < code.length; i++) {
        const char = code.charAt(i);

        if (/\s/.test(char)) continue;
        current += char;

        if ('()'.includes(current)) {
            push(TokenType.Parenthesis, current);
            continue;
        }

        if (/[0-9]/.test(current)) {
            while (/[0-9]/.test(code.charAt(i+1))) current += code.charAt(++i);
            push(TokenType.Number, Number(current));
            continue;
        }

        if (/[a-zA-Z_]/.test(current)) {
            while (/[a-zA-Z_]/.test(code.charAt(i+1))) current += code.charAt(++i);
            push(TokenType.Name, current);
            continue;
        }

        if ('"' === current) {
            let string = '';
            while ('"' !== code.charAt(++i)) string += code.charAt(i);
            push(TokenType.String, string);
            continue;
        }
    }
    return result;
}

describe('tokenize', () => {
    test('should return an array', () => {
        expect(Array.isArray(tokenize(''))).toBe(true);
    });

    test('should be able to tokenize a pair of parentheses', () => {
        const input = '()';
        const result = [
            { type: 'Parenthesis', value: '(' },
            { type: 'Parenthesis', value: ')' },
        ];

        expect(tokenize(input)).toEqual(result);
    });

    test('should ignore whitespace completely', () => {
        const input = '                  ';
        const result: Token[] = [];

        expect(tokenize(input)).toEqual(result);
    });

    // Exercise 1 - Begin
    test('should correctly tokenize a single digit', () => {
        const input = '2';
        const result = [{ type: 'Number', value: 2 }];

        expect(tokenize(input)).toEqual(result);
    });

    test('should be able to handle single numbers in expressions', () => {
        const input = '(1 2)';

        const result = [
            { type: 'Parenthesis', value: '(' },
            { type: 'Number', value: 1 },
            { type: 'Number', value: 2 },
            { type: 'Parenthesis', value: ')' },
        ];

        expect(tokenize(input)).toEqual(result);
    });

    test('should be able to handle single letters in expressions', () => {
        const input = '(a b)';

        const result = [
            { type: 'Parenthesis', value: '(' },
            { type: 'Name', value: 'a' },
            { type: 'Name', value: 'b' },
            { type: 'Parenthesis', value: ')' },
        ];

        expect(tokenize(input)).toEqual(result);
    });
    // Exercise 1: End

    test('should be able to handle multiple-digit numbers', () => {
        const input = '(11 22)';

        const result = [
            { type: 'Parenthesis', value: '(' },
            { type: 'Number', value: 11 },
            { type: 'Number', value: 22 },
            { type: 'Parenthesis', value: ')' },
        ];

        expect(tokenize(input)).toEqual(result);
    });

    // Exercise 2 Begin
    test('should correctly tokenize a simple expression', () => {
        const input = '(add 2 3)';
        const result = [
            { type: 'Parenthesis', value: '(' },
            { type: 'Name', value: 'add' },
            { type: 'Number', value: 2 },
            { type: 'Number', value: 3 },
            { type: 'Parenthesis', value: ')' },
        ];

        expect(tokenize(input)).toEqual(result);
    });

    test('should ignore whitespace', () => {
        const input = '   (add    2 3)';
        const result = [
            { type: 'Parenthesis', value: '(' },
            { type: 'Name', value: 'add' },
            { type: 'Number', value: 2 },
            { type: 'Number', value: 3 },
            { type: 'Parenthesis', value: ')' },
        ];

        expect(tokenize(input)).toEqual(result);
    });
    // Exercise 2 End

    test('should know about strings', () => {
        const input = '(log "hello" "world")';
        const result = [
            { type: 'Parenthesis', value: '(' },
            { type: 'Name', value: 'log' },
            { type: 'String', value: 'hello' },
            { type: 'String', value: 'world' },
            { type: 'Parenthesis', value: ')' },
        ];

        expect(tokenize(input)).toEqual(result);
    });
});
