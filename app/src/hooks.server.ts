import { startServer } from "@/server/api";

export const init = async () => {
	await startServer();
}