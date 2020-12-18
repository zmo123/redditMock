import { Field, Int, ObjectType } from "type-graphql";
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";
import { User } from "./User";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
	@Field(() => Int)
	@PrimaryGeneratedColumn()
	id!: number;

	@Field()
	@Column()
	text!: string;

	@Field()
	@Column({ type: "int", default: 0 })
	points!: number;

	@Field(() => String)
	@CreateDateColumn({ default: () => "NOW()" })
	createdAt: Date;

	@Field(() => String)
	@UpdateDateColumn({ default: () => "NOW()" })
	updatedAt: Date;

	@Field()
	@Column()
	title!: string;

	@Field()
	@Column()
	creatorId: number;

	@ManyToOne(() => User, (user) => user.posts)
	creator: User;
}
