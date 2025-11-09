import http from "k6/http";
import { check } from "k6";

export const options = {
  scenarios: {
    user_get: {
      executor: "constant-arrival-rate",
      rate: 2000,
      timeUnit: "1s",
      duration: "2m",
      preAllocatedVUs: 100,
      maxVUs: 200,
      exec: "testGetUser"
    },
     user_get_avatar: {
        executor: "constant-arrival-rate",
        rate: 2000,
        timeUnit: "1s",
        duration: "2m",
        preAllocatedVUs: 100,
        maxVUs: 200,
        exec: "testGetUserAvatar"
    },
    user_get_favorites: {
        executor: "constant-arrival-rate",
        rate: 2000,
        timeUnit: "1s",
        duration: "2m",
        preAllocatedVUs: 100,
        maxVUs: 200,
        exec: "testGetUserFavorites"
    }
  }
};

export function testGetUser() {
  const res = http.get("http://localhost:3000/v1/users/wmgcat", {
    headers: { "Connection": "keep-alive"}
  });
  check(res, { "status 200": (r) => r.status === 200 });
}

export function testGetUserAvatar() {
    const res = http.get("http://localhost:3000/v1/users/wmgcat/avatar", {
      headers: { "Connection": "keep-alive"}
    });
    check(res, { "status 200": (r) => r.status === 200 });
}

export function testGetUserFavorites() {
    const res = http.get("http://localhost:3000/v1/users/wmgcat/favorites", {
      headers: { "Connection": "keep-alive"}
    });
    check(res, { "status 200": (r) => r.status === 200 });
}