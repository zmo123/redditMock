import { cacheExchange, Resolver } from "@urql/exchange-graphcache";
import {
	dedupExchange,
	Exchange,
	fetchExchange,
	stringifyVariables,
} from "urql";
import { pipe, tap } from "wonka";
import {
	DeletePostMutationVariables,
	LoginMutation,
	LogoutMutation,
	MeDocument,
	MeQuery,
	RegisterMutation,
	VoteMutationVariables,
} from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";
import Router from "next/router";
import gql from "graphql-tag";
import { isServer } from "./isServer";
const errorExchange: Exchange = ({ forward }) => (ops$) => {
	return pipe(
		forward(ops$),
		tap(({ error }) => {
			//if the operationResult has an error sends a request to sentry
			if (error) {
				//the error is a CombinedError with networkError and a graphqlErrors properties
				if (error?.message.includes("not authenticated")) {
					Router.replace("/login");
				}
			}
		})
	);
};

const cursorPagination = (): Resolver => {
	return (_parent, fieldArgs, cache, info) => {
		const { parentKey: entityKey, fieldName } = info;

		//reading data from the cache
		const allFields = cache.inspectFields(entityKey); //search for the entityKey in the current cache
		const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);

		const size = fieldInfos.length;
		if (size === 0) {
			return undefined;
		}

		//need to tell urql that we need to fetch data from server rather than cache
		const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
		//check if the data is already in the cache
		const isItInTheCache = cache.resolve(
			cache.resolve(entityKey, fieldKey) as string,
			"posts"
		);
		//if the data is already in the cache, no need to fetch from server, else fetch from server
		info.partial = !isItInTheCache; //partial return
		let hasMore = true;
		const results: string[] = [];
		fieldInfos.forEach((fi) => {
			const key = cache.resolve(entityKey, fi.fieldKey) as string;
			const data = cache.resolve(key, "posts") as string[];
			const _hasMore = cache.resolve(key, "hasMore");
			if (!_hasMore) {
				hasMore = _hasMore as boolean;
			}

			results.push(...data);
		});

		return {
			__typename: "PaginatedPosts",
			hasMore,
			posts: results,
		};
	};
};

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
	let cookie = "";
	if (isServer()) {
		cookie = ctx?.req?.headers?.cookie;
	}
	return {
		url: "http://localhost:4000/graphql",
		fetchOptions: {
			credentials: "include" as const,
			headers: cookie
				? {
						cookie,
				  }
				: undefined,
		},
		exchanges: [
			dedupExchange,
			cacheExchange({
				keys: {
					PaginatedPosts: () => null,
				},
				resolvers: {
					Query: {
						posts: cursorPagination(),
					},
				},
				updates: {
					Mutation: {
						deletePost: (_result, args, cache, __) => {
							//invalidate this by default, by changing it to post
							cache.invalidate({
								__typename: "Post",
								id: (args as DeletePostMutationVariables).id,
							});
						},
						vote: (_result, args, cache, __) => {
							const { postId, value } = args as VoteMutationVariables;
							const data = cache.readFragment(
								gql`
									fragment __ on Post {
										id
										points
										voteStatus
									}
								`,
								{ id: postId } as any
							);

							if (data) {
								if (data.voteStatus === value) {
									return;
								}
								const newPoints =
									(data.points as number) + (!data.voteStatus ? 1 : 2) * value;
								cache.writeFragment(
									gql`
										fragment _ on Post {
											points
											voteStatus
										}
									`,
									{ id: postId, points: newPoints, voteStatus: value } as any
								);
							}
						},
						createPost: (_result, _, cache, __) => {
							const allFields = cache.inspectFields("Query"); //search for the entityKey in the current cache
							const fieldInfos = allFields.filter(
								(info) => info.fieldName === "posts"
							);

							fieldInfos.forEach((fi) => {
								console.log(fi.arguments);
								cache.invalidate("Query", "posts", fi.arguments || {});
							});
							console.log(cache);
						},
						login: (_result, _, cache, __) => {
							betterUpdateQuery<LoginMutation, MeQuery>(
								cache,
								{ query: MeDocument },
								_result,
								(result, query) => {
									if (result.login.errors) {
										return query;
									} else {
										return {
											me: result.login.user,
										};
									}
								}
							);
						},
						register: (_result, args, cache, info) => {
							betterUpdateQuery<RegisterMutation, MeQuery>(
								cache,
								{ query: MeDocument },
								_result,
								(result, query) => {
									if (result.register.errors) {
										return query;
									} else {
										return {
											me: result.register.user,
										};
									}
								}
							);
						},
						logout: (_result, args, cache, info) => {
							betterUpdateQuery<LogoutMutation, MeQuery>(
								cache,
								{ query: MeDocument },
								_result,
								() => ({ me: null })
							);
						},
					},
				},
			}),
			errorExchange,
			ssrExchange,
			fetchExchange,
		],
	};
};
