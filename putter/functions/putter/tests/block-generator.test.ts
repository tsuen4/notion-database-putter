import { describe, expect, test } from '@jest/globals';
import { BlockGenerator } from '../block-generator';

describe('Generate block', () => {
    test('generate plain block', async () => {
        const input = 'hoge\nfuga';
        const gen = new BlockGenerator();
        const result = gen.invoke(input);
        expect(result).toHaveLength(1);

        if (result[0].type !== 'paragraph') {
            throw new Error('result[0].type is not "paragraph"');
        }
        const richText = result[0].paragraph.rich_text;
        expect(richText).toHaveLength(1);

        if (richText[0].type !== 'text') {
            throw new Error('richText[0].type is not "text"');
        }
        const text = richText[0].text;
        expect(text.content).toEqual(input);
        expect(text).not.toHaveProperty('link');
    });

    test.each([{ code: '\r' }, { code: '\n' }, { code: '\r\n' }])('generate multiple blocks (%#)', async ({ code }) => {
        const input = `hoge${code}fuga`;
        const gen = new BlockGenerator().enableSplitLine();
        const result = gen.invoke(input);
        expect(result).toHaveLength(2);

        // hoge
        if (result[0].type !== 'paragraph') {
            throw new Error('result[0].type is not "paragraph"');
        }
        const richText0 = result[0].paragraph.rich_text;
        expect(richText0).toHaveLength(1);

        if (richText0[0].type !== 'text') {
            throw new Error('richText0[0].type is not "text"');
        }
        const text0 = richText0[0].text;
        expect(text0.content).toEqual('hoge');
        expect(text0).not.toHaveProperty('link');

        // fuga
        if (result[1].type !== 'paragraph') {
            throw new Error('result[1].type is not "paragraph"');
        }
        const richText1 = result[1].paragraph.rich_text;
        expect(richText1).toHaveLength(1);

        if (richText1[0].type !== 'text') {
            throw new Error('richText1[0].type is not "text"');
        }
        const text1 = richText1[0].text;
        expect(text1.content).toEqual('fuga');
        expect(text1).not.toHaveProperty('link');
    });

    test('generate block include the URL', async () => {
        const input = 'hoge https://example.com fuga';
        const gen = new BlockGenerator().enableIncludeUrl();
        const result = gen.invoke(input);
        expect(result).toHaveLength(1);

        if (result[0].type !== 'paragraph') {
            throw new Error('result[0].type is not "paragraph"');
        }
        const richText = result[0].paragraph.rich_text;
        expect(richText).toHaveLength(3); // ['hoge ', 'https://example.com', ' fuga']

        // 'hoge '
        if (richText[0].type !== 'text') {
            throw new Error('richText[0].type is not "text"');
        }
        const text0 = richText[0].text;
        expect(text0.content).toEqual('hoge ');
        expect(text0).not.toHaveProperty('link');

        // 'https://example.com'
        if (richText[1].type !== 'text') {
            throw new Error('richText[1] is not "text"');
        }
        const text1 = richText[1].text;
        expect(text1.content).toEqual('https://example.com');
        expect(text1).toHaveProperty('link');
        expect(text1.link?.url).toEqual('https://example.com');

        // ' fuga'
        if (richText[2].type !== 'text') {
            throw new Error('richText[2] is not "text"');
        }
        const text2 = richText[2].text;
        expect(text2.content).toEqual(' fuga');
        expect(text2).not.toHaveProperty('link');
    });
});
