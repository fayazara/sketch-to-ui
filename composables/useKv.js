import { createStorage } from "unstorage";
import cloudflareKVBindingDriver from "unstorage/drivers/cloudflare-kv-binding";
import memoryDriver from "unstorage/drivers/memory";
const isDevMode = process.env.NODE_ENV === "development";
export const useKv = () => {
  const storage = createStorage({
    driver: isDevMode ? memoryDriver() : cloudflareKVBindingDriver({ binding: globalThis.SKETCH })
  });
  return storage;
}
