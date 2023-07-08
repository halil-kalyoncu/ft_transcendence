
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class MessageEntity {

	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	message: string;

	@Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
	createdAt: Date;

}
