import { RESTDataSource } from 'apollo-datasource-rest';
import ApollosConfig from '@apollosproject/config';
import { ApolloError } from 'apollo-server';
import { createCursor, parseCursor } from '@apollosproject/server-core';
import Hypher from 'hypher';
import english from 'hyphenation.en-us';
import sanitize from 'sanitize-html';

export default class Craft extends RESTDataSource {
  baseURL = ApollosConfig.CRAFT.URL;

  willSendRequest = (request) => {
    request.headers.set('Authorization', ApollosConfig.CRAFT.GRAPH_TOKEN);
    request.headers.set('Content-Type', 'application/json');
  };

  // NOTE: Craft Integration
  query = (query, variables) =>
    this.post(
      '/',
      JSON.stringify({
        query,
        variables,
      })
    );

  entryFragment = `{
    id
    title
    typeId

    # series
    ... on series_series_Entry {
      seriesDescription
      hero {
        ... on hero_photoHero_BlockType {
          image {
            id
            title
            url
          }
        }
      }
    }

    # stories
    ... on stories_stories_Entry {
      subtitle
      storyPortrait {
        id
        title
        url
      }
    }

    # studies
    ... on studies_curriculum_Entry {
      studySummary
      image {
        id
        title
        url
      }
    }

    # articles
    ... on articles_article_Entry {
      excerpt
      hero {
        ... on hero_photoHero_BlockType {
          image {
            id
            title
            url
          }
        }
      }
    }
  }`;

  // Override for: https://github.com/ApollosProject/apollos-apps/blob/master/packages/apollos-data-connector-rock/src/content-channels/resolver.js#L6
  // eslint-disable-next-line
  getRootChannels() {
    return [
      {
        id: 7, // Matches Entry.typeId, craft doesn't expose a query for this
        name: 'Series',
      },
      {
        id: 29,
        name: 'Stories',
      },
      {
        id: 43,
        name: 'Studies',
      },
      {
        id: 15,
        name: 'Articles',
      },
    ];
  }

  // Override for: https://github.com/ApollosProject/apollos-apps/blob/master/packages/apollos-data-connector-rock/src/content-channels/resolver.js#L13
  // eslint-disable-next-line
  byContentChannelId(typeId) {
    return { typeId };
  }

  // Override: https://github.com/ApollosProject/apollos-apps/blob/master/packages/apollos-data-connector-rock/src/content-channels/data-source.js#L46
  async getFromId(id) {
    const result = await this.query(
      `query ($id: [QueryArgument]) {
        entry(id: $id) ${this.entryFragment}
      }`,
      { id }
    );
    if (result?.error)
      throw new ApolloError(result?.error?.message, result?.error?.code);
    return result?.data?.entry;
  }

  // Override for: https://github.com/ApollosProject/apollos-apps/blob/master/packages/apollos-data-connector-rock/src/content-channels/resolver.js#L12
  async paginate(props) {
    const { cursor: filter, args: { after, first = 20 } = {} } = props;

    let cursor = {};
    if (after) {
      cursor = parseCursor(after);
      if (!cursor && typeof cursor !== 'object') {
        throw new Error(`An invalid 'after' cursor was provided: ${after}`);
      }
    }

    const variables = {
      limit: first,
      offset: 0,
      orderBy: 'dateCreated',
      inReverse: true,
      ...cursor,
      ...filter,
    };

    const result = await this.query(
      `query ($limit: Int, $offset: Int, $orderBy: String, $inReverse: Boolean, $typeId: [QueryArgument]) {
        entries(
          limit: $limit
          offset: $offset
          orderBy: $orderBy
          inReverse: $inReverse
          typeId: $typeId
        ) ${this.entryFragment}
      }`,
      variables
    );
    console.log(result);

    if (!result || result.error)
      throw new ApolloError(result?.error?.message, result?.error?.code);

    // TODO: Might need REST API to get count but not necessary for UI
    const getTotalCount = () => 100;

    // build the edges - translate series to { edges: [{ node, cursor }] } format
    const edges = (result?.data?.entries || []).map((node, i) => ({
      node,
      cursor: createCursor({
        ...variables,
        offset: variables.offset + i + 1,
      }),
    }));

    return {
      edges,
      getTotalCount,
    };
  }

  resolveType = () => 'UniversalContentItem';

  createSummary = (entry) => {
    switch (entry.typeId) {
      case 7: {
        // series
        return sanitize(entry.seriesDescription, {
          allowedTags: ['p'],
          transformTags: {
            p() {
              return {};
            },
          },
        });
      }
      case 29: {
        // stories
        return entry.subtitle;
      }
      case 43: {
        // studies
        return sanitize(entry.studySummary, {
          allowedTags: ['p'],
          transformTags: {
            p() {
              return {};
            },
          },
        });
      }
      case 15: {
        // articles
        return entry.excerpt;
      }
      default: {
        return '';
      }
    }
  };

  getCoverImage = (entry) => {
    switch (entry.typeId) {
      case 7: {
        // series
        return {
          __typename: 'ImageMedia',
          key: entry.hero?.[0]?.image?.[0]?.id,
          name: entry.hero?.[0]?.image?.[0]?.title,
          sources: [{ uri: entry.hero?.[0]?.image?.[0]?.url }],
        };
      }
      case 29: {
        // stories
        return {
          __typename: 'ImageMedia',
          key: entry.storyPortrait?.[0]?.id,
          name: entry.storyPortrait?.[0]?.title,
          sources: [{ uri: entry.storyPortrait?.[0]?.url }],
        };
      }
      case 43: {
        // studies
        return {
          __typename: 'ImageMedia',
          key: entry.image?.[0]?.id,
          name: entry.image?.[0]?.title,
          sources: [{ uri: entry.image?.[0]?.url }],
        };
      }
      case 15: {
        // articles
        return {
          __typename: 'ImageMedia',
          key: entry.hero?.[0]?.image?.[0]?.id,
          name: entry.hero?.[0]?.image?.[0]?.title,
          sources: [{ uri: entry.hero?.[0]?.image?.[0]?.url }],
        };
      }
      default: {
        return null;
      }
    }
  };

  // eslint-disable-next-line
  createHyphenatedString({ text }) {
    const hypher = new Hypher(english);
    const words = text.split(' ');

    /* We only want to hyphenate the end of words because Hyper uses a language dictionary to add
     * "soft" hyphens at the appropriate places. By only adding "soft" hyphens to the end of we
     * guarantee that words that can fit will and that words that can't fit don't wrap prematurely.
     * Essentially, meaning words will always take up the maximum amount of space they can and only
     * very very long words will wrap after the 7th character.
     *
     * Example:
     * Devotional can be hyphenated as "de-vo-tion-al." However, we hyphenate this word as
     * "devotion-al." This means that the word can always fit but usually return to a new line as
     * "devotional" rather than wrapping mid-word as "devo-tional". There are situations your mind
     * can create where this might a wrap at `devotion-al` but this is a worst worst case scenario
     * and in our tests was exceedingly rare in the English language.
     *
     * Additionally, The magic number below (7) is used here because our current
     * `HorizontalHighlighCard`s have a fixed width of 240px and 7 is the maximum number of capital
     * "W" characters that will fit with a hyphen in our current typography. While this is an
     * unlikely occurrence it represents the worst case scenario for word length.
     *
     * TODO: Expose the hyphenation point to make this more flexible in the future.
     */
    const hyphenateEndOfWord = (word, segment) =>
      word.length > 7 ? `${word}\u00AD${segment}` : word + segment;

    const hyphenateLongWords = (word, hyphenateFunction) =>
      word.length > 7 ? hyphenateFunction(word) : word;

    return words
      .map((w) =>
        hyphenateLongWords(w, () =>
          hypher.hyphenate(w).reduce(hyphenateEndOfWord)
        )
      )
      .join(' ');
  }
}
