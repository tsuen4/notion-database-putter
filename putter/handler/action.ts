import {Client} from '@notionhq/client';
import {
  AppendBlockChildrenResponse,
  BlockObjectRequest,
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

  async #getPageByTitle(
    title: string
  ): Promise<PageObjectResponse | undefined> {
    const response = await this.client.databases.query({
      database_id: this.databaseId,
      filter: {
        property: 'title',
        title: {
          equals: title,
        },
      },
    });
    return response.results
      .filter((result): result is PageObjectResponse => {
        const parent = (result as PageObjectResponse).parent;
        if (parent.type !== 'database_id') {
          return false;
        }
        return parent.database_id.split('-').join('') === this.databaseId;
      })
      .at(0);
  }

  async #createPageWithText(
    title: string,
    text: string
  ): Promise<PageObjectResponse> {
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
      .then(response => response as PageObjectResponse);
  }

  async #appendText(
    blockId: string,
    text: string
  ): Promise<AppendBlockChildrenResponse> {
    return this.client.blocks.children
      .append({
        block_id: blockId,
        children: [this.#generateChildren(text)],
      })
      .then(response => response as AppendBlockChildrenResponse);
  }

  async put(title: string, text: string): Promise<void> {
    const existPage = await this.#getPageByTitle(title);
    if (existPage !== undefined) {
      await this.#appendText(existPage.id, text);
    } else {
      await this.#createPageWithText(title, text);
    }
  }
}
