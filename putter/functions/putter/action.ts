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

    #generateChildren(text: string): BlockObjectRequest {
        return {
            paragraph: {
                rich_text: [
                    {
                        type: 'text',
                        text: {
                            content: text,
                        },
                    },
                ],
            },
        };
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

    async #createPageWithText(title: string, text: string): Promise<CreatePageResponse> {
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
                children: [this.#generateChildren(text)],
            })
            .then((response) => response);
    }

    async #appendText(blockId: string, text: string): Promise<AppendBlockChildrenResponse> {
        return this.client.blocks.children
            .append({
                block_id: blockId,
                children: [this.#generateChildren(text)],
            })
            .then((response) => response);
    }

    async put(title: string, text: string): Promise<CreatePageResponse | AppendBlockChildrenResponse> {
        const page = await this.#getPageByTitle(title);
        if (page !== null) {
            return await this.#appendText(page.id, text);
        } else {
            return await this.#createPageWithText(title, text);
        }
    }
}
