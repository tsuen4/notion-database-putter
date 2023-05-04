import { BlockObjectRequest } from '@notionhq/client/build/src/api-endpoints';

type GenerateMode = 'includeUrl' | 'splitLine';

type RichTextItemRequests<T = BlockObjectRequest> = T extends { paragraph: any } ? T['paragraph']['rich_text'] : never;
type RichTextItemRequest = RichTextItemRequests[number];

export class BlockGenerator {
    #modes: { [name in GenerateMode]: boolean } = {
        includeUrl: false,
        splitLine: false,
    };

    enableIncludeUrl() {
        this.#modes.includeUrl = true;
        return this;
    }

    enableSplitLine() {
        this.#modes.splitLine = true;
        return this;
    }

    #generateRichText(input: string, isLink: boolean = false): RichTextItemRequest {
        const request: RichTextItemRequest = {
            type: 'text',
            text: {
                content: input,
            },
        };

        if (isLink) {
            request.text.link = {
                url: input,
            };
        }
        return request;
    }

    #generateRichTexts(input: string): RichTextItemRequest[] {
        return this.#modes.includeUrl ? this.#generateRichTextsIncludeUrl(input) : [this.#generateRichText(input)];
    }

    #generateRichTextsIncludeUrl(input: string): RichTextItemRequest[] {
        const urlSplitter = /https?:\/\/\S+/g;
        const urls = input.match(urlSplitter);
        const nonUrls = input.split(urlSplitter);
        const splittedTextByUrl = nonUrls
            .reduce((prev, current, i) => [...prev, current, (urls && urls[i]) || ''], [] as string[])
            .filter(Boolean);

        return splittedTextByUrl.reduce(
            (prev, current) => [
                ...prev,
                urlSplitter.test(current) ? this.#generateRichText(current, true) : this.#generateRichText(current),
            ],
            [] as RichTextItemRequest[],
        );
    }

    invoke(input: string): BlockObjectRequest[] {
        const lines = this.#modes.splitLine ? input.split(/\r\n|\r|\n/) : [input];

        return lines.map<BlockObjectRequest>((line) => ({
                type: 'paragraph',
                paragraph: {
                    rich_text: this.#generateRichTexts(line),
                },
            })
        )
    }
}
