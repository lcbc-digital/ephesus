import { ContentItem } from '@apollosproject/data-connector-rock';
import ApollosConfig from '@apollosproject/config';
import sanitizeHtml from '@apollosproject/data-connector-rock/lib/sanitize-html';

export const { schema } = ContentItem;

const newResolvers = {
  htmlContent: ({ description }) => sanitizeHtml(description),
  childContentItemsConnection: ({ id }, args, context) =>
    context.dataSources.ContentItem.getChildren(id),
  siblingContentItemsConnection: ({ id }, args, context) =>
    context.dataSources.ContentItem.getSiblings(id),
};

const contentItemTypes = Object.keys(ApollosConfig.ROCK_MAPPINGS.CONTENT_ITEM);

const baseResolver = {
  ...ContentItem.resolver,
};

export const resolver = contentItemTypes.reduce(
  (acc, curr) => ({
    ...acc,
    [curr]: { ...baseResolver[curr], ...newResolvers },
  }),
  {
    ...baseResolver,
  }
);

export dataSource from './CraftDataSource';
