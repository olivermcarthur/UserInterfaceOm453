import { RealmAppService } from "./realm-app.service";

export function initializeApp(realmAppService: RealmAppService) {
  return () => new Promise(async (resolve, reject) => {
    try {
      const app = await realmAppService.getAppInstance();

      // Removed the username related lines
      return resolve(app);
    } catch (err) {
      console.error(err);
      return reject(err);
    }
  });
}