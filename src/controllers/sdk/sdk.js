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


IOY.highscores = {};

IOY.highscores.get = async () => {
  const response = await fetch(`${IOY.api}/highscores/rank`, {
    credentials: "include"
  }).then(e => e?.json?.());
  return response;
}

IOY.highscores.all = async () => {
  const response = await fetch(`${IOY.api}/highscores/top`, {
    credentials: "include"
  }).then(e => e?.json?.());
  return response;
}

IOY.highscores.set = async (score) => {
  const response = await fetch(`${IOY.api}/highscores`, {
    credentials: "include",
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      score
    })
  }).then(e => e?.json?.());
  return response;
}