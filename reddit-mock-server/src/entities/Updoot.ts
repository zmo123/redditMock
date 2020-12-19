import { Field, Int, ObjectType } from "type-graphql";
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	PrimaryColumn,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

//m to n
//many to many relationship
// user <-> post, several user can upvote the same post, the user itself can upvote many post
// user -> join table <- posts
// user -> this is our file (Updoot) <- posts

@ObjectType()
@Entity()
export class Updoot extends BaseEntity {
	@Field()
	@Column({ type: "int" })
	value: number;

	@Field()
	@PrimaryColumn()
	userId: number;

	@Field(() => User)
	@ManyToOne(() => User, (user) => user.updoots)
	user: User;

	@Field()
	@PrimaryColumn()
	postId: number;

	@Field(() => Post)
	@ManyToOne(() => Post, (post) => post.updoots)
	post: Post;
}
