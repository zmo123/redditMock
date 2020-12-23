import { Field, Int, ObjectType } from "type-graphql";
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";
import { Updoot } from "./Updoot";
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

	@Field(() => Int, { nullable: true }) //this is not a column in the db, just appear in the schema
	voteStatus: number | null; //1 or -1 or null different for each user

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

	@Field()
	@ManyToOne(() => User, (user) => user.posts)
	creator: User;

	@OneToMany(() => Updoot, (updoot) => updoot.post)
	updoots: Updoot[];
}
