import { typeDefs } from './typedefs';

import types from "./types";


/**
 * Returns a field configuration object for a given field descriptor.
 *
 * The field configuration object defines the properties of a field in a
 * GraphQL schema and is created by extracting the `type`, `args`, and
 * `resolve` properties from the field descriptor using the `parameters`,
 * `returns`, and `liftResolver` methods.
 *
 * @param {object} receiver An object that holds the field descriptor.
 * @param {string} propertyName The name of the field.
 * @param {object} descriptor The field descriptor object.
 * @return {GraphQLFieldConfig<any, any>} A field configuration object for the
 * given field descriptor.
 */
const buildField = ({ receiver, propertyName, descriptor }: any) => {
  const args = descriptor.parameters({ receiver });
  const returns = descriptor.returns({ receiver });
  const resolve = descriptor.liftResolver({
    receiver,
    method: descriptor.value
  });
  return { type: returns, args, resolve };
};

const buildFieldsForReceiver = (aggPropsMethod: string) => (receiver) =>
  Array.from(
    receiver.aggPropsMethod(),
    ([ propertyName, descriptor ]) => ({
      [descriptor.name({ receiver })]: buildField({
        receiver,
        propertyName,
        descriptor
      })
    })
  );

/**
 * Returns a function that aggregates fields from a list of classes.
 *
 * The returned function takes a list of classes as input and returns a map of
 * fields that are created by iterating over the list of classes and reducing
 * the fields of each class into a single map. The fields of each class are
 * extracted using the `attrsGetter` function, which should return an array of
 * field descriptors for the class.
 *
 * @param {function} attrsGetter A function that returns an array of field 
 * descriptors for a given class.
 * @return {function} A function that aggregates fields from a list of classes.
 */
const makeFieldAggregator = (aggPropsMethod: string) => (types: any) =>
  types
    .flatmap(buildFieldArgsForReceiver(attrsGetter))
    .reduce(Object.assign, {})

/**
 * Returns a root type object for a given root type name and field getter
 * function.
 *
 * The root type object represents a root type in a GraphQL schema and is
 * created by aggregating the fields of the root type using the
 * `makeFieldAggregator` function and the `getFields` function, which should
 * return an array of field descriptors for the root type. The root type
 * object is only created if the aggregated fields object has at least one
 * field.
 *
 * @param {string} rootTypeName The name of the root type.
 * @param {function} attrsGetter A function that returns an array of field
 * descriptors for the root type.
 * @return {object} A root type object for the given root type name and field
 * getter function.
 */
const createRootType = (
  rootTypeName: string,
  aggPropsMethodName: string
) => {
  const fields = makeFieldAggregator(aggPropsMethodName)(types);
  if (Object.keys(fields).length > 0) {
    return {
      [rootTypeName.toLowercase()]: new GraphQLObjectType({
        name: rootTypeName,
        fields
      })
    };
  }
};

export const schema = new GraphQLSchema(
  Object.entries({
    Query: "getQueryProps",
    Mutation: "getMutationProps",
    Subscription: "getSubscriptionProps"
  })
    .map((args) => createRootType(...args))
    .reduce(Object.assign, {})
);

export default schema;
