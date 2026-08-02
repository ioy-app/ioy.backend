import { vi } from "vitest";

const fakeRedis = () => {
	vi.mock("@/lib/redis", () => ({
		default: {
			readWithLog: vi.fn(async () => {}),
			writeWithLog: vi.fn(async () => {}),
			delWithLog: vi.fn(async () => {}),
			delAllWithLog: vi.fn(async () => {})
		}
	}));
}

export default fakeRedis;
