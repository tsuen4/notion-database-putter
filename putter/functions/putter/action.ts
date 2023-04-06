import { Client, isFullPage } from '@notionhq/client';
import {
    AppendBlockChildrenResponse,
    BlockObjectRequest,
    CreatePageResponse,
    PageObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';

export class Action {
    private client: Client;

    constructor(token: string, private readonly databaseId: string) {
        this.client = new Client({
            auth: token,
        });
    }

    #generateBlocks(input: string): BlockObjectRequest[] {
        const lines = input.split(/\n/);
        return lines.map<BlockObjectRequest>((line) => {
            const request: BlockObjectRequest = {
                type: 'paragraph',
                paragraph: {
                    rich_text: [],
                },
            };
            const urlSplitter = /https?:\/\/\S+/g;
            const urls = line.match(urlSplitter);
            const nonUrls = line.split(urlSplitter);
            const splittedTextByUrl = nonUrls
                .reduce((prev, current, i) => prev.concat(current, (urls && urls[i]) || ''), [] as string[])
                .filter(Boolean);
            splittedTextByUrl.map((part) => {
                if (urlSplitter.test(part)) {
                    request.paragraph.rich_text.push({
                        type: 'text',
                        text: {
                            content: part,
                            link: { url: part },
                        },
                    });
                } else {
                    request.paragraph.rich_text.push({
                        type: 'text',
                        text: {
                            content: part,
                        },
                    });
                }
            });
            return request;
        });
    }

    async #getPageByTitle(title: string): Promise<PageObjectResponse | null> {
        const response = await this.client.databases.query({
            database_id: this.databaseId,
            filter: {
                property: 'title',
                title: {
                    equals: title,
                },
            },
        });
        return (
            response.results
                .filter((result): result is PageObjectResponse => {
                    if (!isFullPage(result)) {
                        return false;
                    }
                    const parent = result.parent;
                    if (parent.type !== 'database_id') {
                        return false;
                    }
                    return (
                        parent.database_id === this.databaseId ||
                        parent.database_id.split('-').join('') === this.databaseId
                    );
                })
                .at(0) || null
        );
    }

    async #createPageWithText(title: string, input: string): Promise<CreatePageResponse> {
        return this.client.pages
            .create({
                parent: {
                    database_id: this.databaseId,
                },
                properties: {
                    title: [
                        {
                            text: {
                                content: title,
                            },
                        },
                    ],
                },
                children: this.#generateBlocks(input),
            })
            .then((response) => response);
    }

    async #appendText(blockId: string, input: string): Promise<AppendBlockChildrenResponse> {
        return this.client.blocks.children
            .append({
                block_id: blockId,
                children: this.#generateBlocks(input),
            })
            .then((response) => response);
    }

    async put(title: string, input: string): Promise<CreatePageResponse | AppendBlockChildrenResponse> {
        const page = await this.#getPageByTitle(title);
        if (page !== null) {
            return await this.#appendText(page.id, input);
        } else {
            return await this.#createPageWithText(title, input);
        }
    }
}
