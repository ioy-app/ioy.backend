const IOY = {};

IOY.version = "1.0";
IOY.api = "/api/v1/sdk";

IOY.user = {};

/**
 * Get user info
 * @returns 
*/
IOY.user.info = async () => {
  const response = await fetch(`${IOY.api}/profile`, {
    credentials: "include"
  }).then(e => e?.json?.());
  return response;
}

IOY.user.avatar = async () => {
  const response = await fetch(`${IOY.api}/profile/avatar`, {
    credentials: "include"
  }).then(e => e.blob());

  const url = URL.createObjectURL(response);
  return url;
}