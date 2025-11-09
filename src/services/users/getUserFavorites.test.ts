// import { expect } from "chai";
// import esmock from "esmock";
// import { fileURLToPath } from "node:url";
// import { dirname, join } from "node:path";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
// const libDbPath = join(__dirname, "..", "..", "lib", "db.js");

// import { mockUserFavorites, mockDbFavorites } from "./index.test";

// describe("getUserFavorites", () => {
//     const getUserFavorites = async (login: string) => {
//         const { default: getUserFavorites } = await esmock("./getUserFavorites.ts", {
//             [libDbPath]: mockDbFavorites
//         });

//         return getUserFavorites(login);
//     }

//     it("Запись найдена", async () => {
//         const result = await getUserFavorites("tester");
//         await expect(result.items).to.deep.equal(mockUserFavorites);
//     })

//     it("Пользователя не существует", async () => {
//         try { await getUserFavorites("tester2"); }
//         catch(err) {
//             await expect(err.message).to.equal("Пользователь не найден");
//         }
//     });

//     it("Пользователь без активации", async () => {
//         try { await getUserFavorites("noactive"); }
//         catch(err) {
//             await expect(err.message).to.equal("Пользователь не найден");
//         }
//     });

//     it("Логин больше 50", async () => {
//         try { await getUserFavorites("a".repeat(51)); }
//         catch(err) {
//             await expect(err.message).to.equal("Не может превышать 50 символов");
//         }
//     })
//     it("Логин меньше 3", async () => {
//         try { await getUserFavorites("a"); }
//         catch(err) {
//             await expect(err.message).to.equal("Не может быть < 3 символов");
//         }
//     })
//     it("Пустой логин", async () => {
//         try { await getUserFavorites(""); }
//         catch(err) {
//             await expect(err.message).to.equal("Не может быть < 3 символов");
//         }
//     });
//     it("Логин состояит из SQL-инъекции", async () => {
//         try { await getUserFavorites("'; DROP TABLE users; --"); }
//         catch(err) {
//             await expect(err.message).to.equal("Не верный формат строки");
//         }
//     });
// });