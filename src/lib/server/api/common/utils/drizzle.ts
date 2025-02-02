import type { BuildQueryResult, DBQueryConfig, ExtractTablesWithRelations } from 'drizzle-orm';
import * as schema from '../../db/libsql/drizzle-schema';
import { NotFound } from './exceptions';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';

type Schema = typeof schema;

export type Transaction = Parameters<Parameters<LibSQLDatabase<Schema>['transaction']>[0]>[0];
export type Client = LibSQLDatabase<Schema>;

type TSchema = ExtractTablesWithRelations<Schema>;

export type IncludeRelation<TableName extends keyof TSchema> = DBQueryConfig<
	'one' | 'many',
	boolean,
	TSchema,
	TSchema[TableName]
>['with'];

export type InferResultType<
	TableName extends keyof TSchema,
	With extends IncludeRelation<TableName> | undefined = undefined
> = BuildQueryResult<
	TSchema,
	TSchema[TableName],
	{
		with: With;
	}
>;

// get the first element of an array or return null
export const takeFirst = <T>(values: T[]): T | null => {
	return values.shift() || null;
};

// get the first element of an array or throw a 404 error
export const takeFirstOrThrow = <T>(values: T[]): T => {
	const value = values.shift();
	if (!value) throw NotFound('The requested resource was not found.');
	return value;
};
