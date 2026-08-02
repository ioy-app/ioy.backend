import ContentError from "./ContentError";
import ValidError from "./ValidError";

const promisegRPC = (client, fn: string, params: Record<string, unknown>) => {
	return (new Promise((res, rej) => client[fn](params, (err, result) => {
		if (err) {
			if (["errors.invalid", "errors.required"].includes(err?.details)) {
				rej(new ValidError("promisegRPC", err?.details));
				return;
			}

			rej(new ContentError("promisegRPC", err?.details));
		}

		res(result);
	})));
};

export default promisegRPC;
