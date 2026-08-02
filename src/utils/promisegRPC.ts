const promisegRPC = (client, fn: string, params: Record<string, unknown>) => {
	return (new Promise((res, rej) => client[fn](params, (err, result) => {
		if (err)
			rej(err);

		res(result);
	})));
};

export default promisegRPC;
