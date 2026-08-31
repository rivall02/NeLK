import "dotenv/config";
import { extractScheduleWithAI } from "../src/lib/ai";
import { logger } from "../src/lib/logger";

logger.warn = (msg, err) => console.log("WARN:", msg, err);

async function main() {
  const tinyImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  
  try {
    const result = await extractScheduleWithAI(tinyImage);
    console.log("Success:", result);
  } catch (error) {
    console.error("Failed:", error);
  }
}

main();
