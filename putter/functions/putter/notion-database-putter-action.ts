import { Client, isFullPage } from '@notionhq/client';
import {
    AppendBlockChildrenResponse,
    CreatePageResponse,
    PageObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';
import { BlockGenerator } from './block-generator';

export class NotionDatabasePutterAction {
    private client: Client;

    constructor(token: string, private readonly databaseId: string, private readonly blockGenerator: BlockGenerator) {
        this.client = new Client({
            auth: token,
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
                children: this.blockGenerator.invoke(input),
            })
            .then((response) => response);
    }

    async #appendText(blockId: string, input: string): Promise<AppendBlockChildrenResponse> {
        return this.client.blocks.children
            .append({
                block_id: blockId,
                children: this.blockGenerator.invoke(input),
            })
            .then((response) => response);
    }

    async invoke(title: string, input: string): Promise<CreatePageResponse | AppendBlockChildrenResponse> {
        const page = await this.#getPageByTitle(title);
        if (page !== null) {
            return await this.#appendText(page.id, input);
        } else {
            return await this.#createPageWithText(title, input);
        }
    }
}
