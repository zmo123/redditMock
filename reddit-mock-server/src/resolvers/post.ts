import { Post } from "../entities/Post";
import {
	Resolver,
	Query,
	Arg,
	Mutation,
	InputType,
	Field,
	Ctx,
	UseMiddleware,
	Int,
	FieldResolver,
	Root,
	ObjectType,
} from "type-graphql";

import { MyContext } from "src/types";
import { isAuth } from "../middleware/isAuth";
import { getConnection } from "typeorm";
import { Updoot } from "../entities/Updoot";

@InputType()
class PostInput {
	@Field()
	title: string;
	@Field()
	text: string;
}

@ObjectType()
class PaginatedPosts {
	@Field(() => [Post])
	posts: Post[];
	@Field()
	hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
	@FieldResolver(() => String)
	textSnippet(@Root() root: Post) {
		return root.text.slice(0, 50);
	}

	@Mutation(() => Boolean)
	@UseMiddleware(isAuth)
	async vote(
		@Arg("postId", () => Int) postId: number,
		@Arg("value", () => Int) value: number,
		@Ctx() { req }: MyContext
	) {
		const isUpdoot = value !== -1;
		const realValue = isUpdoot ? 1 : -1;
		const { userId } = req.session;
		// await Updoot.insert({
		// 	userId,
		// 	postId,
		// 	value: realValue,
		// });

		await getConnection().query(
			`
		START TRANSACTION;
		insert into updoot ("userId", "postId",value)
		values (${userId},${postId}, ${realValue});
		update post  
		set points = points + ${realValue}
		where id = ${postId};
		COMMIT;
		`
		);
		return true;
	}

	@Query(() => PaginatedPosts) //setting graphQL type
	async posts(
		@Arg("limit", () => Int) limit: number,
		@Arg("cursor", () => String, { nullable: true }) cursor: string | null
	): Promise<PaginatedPosts> {
		//setting typescript function return type
		const realLimit = Math.min(50, limit);

		//using this trick to check if we have more posts to fetch

		/*fixed the issue of undefined database by relating to this issue:
		https://github.com/typeorm/typeorm/issues/747 */
		const realLimitPlusOne = realLimit + 1;
		const qb = getConnection()
			.getRepository(Post)
			.createQueryBuilder("p")
			.innerJoinAndSelect("p.creator", "u", "u.id = p.creatorId")
			.orderBy("p.createdAt", "DESC")
			.take(realLimitPlusOne);

		if (cursor) {
			qb.where("p.createdAt < :cursor", {
				cursor: new Date(parseInt(cursor)),
			});
		}

		const posts = await qb.getMany();

		return {
			posts: posts.slice(0, realLimit),
			hasMore: posts.length === realLimitPlusOne,
		};
	}

	@Query(() => Post, { nullable: true })
	post(@Arg("id") id: number): Promise<Post | undefined> {
		return Post.findOne(id);
	}

	@Mutation(() => Post)
	@UseMiddleware(isAuth)
	async createPost(
		@Arg("input") input: PostInput,
		@Ctx() { req }: MyContext
	): Promise<Post | any> {
		//this is actually 2 sql queries
		return Post.create({ ...input, creatorId: req.session.userId }).save();
	}

	@Mutation(() => Post, { nullable: true })
	async updatePost(
		@Arg("id") id: number,
		@Arg("title", () => String, { nullable: true }) title: string
	): Promise<Post | null> {
		const post = await Post.findOne(id);

		if (!post) {
			return null;
		}
		if (typeof title !== "undefined") {
			Post.update({ id }, { title });
		}
		return post;
	}

	@Mutation(() => Boolean)
	async deletePost(@Arg("id") id: number): Promise<boolean> {
		await Post.delete(id);
		return true;
	}
}
