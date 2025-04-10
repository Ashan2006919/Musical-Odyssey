import multer from "multer";

const storage = multer.memoryStorage(); // Store files in memory
export const upload = multer({ storage });

export async function runMiddleware(req, res, fn) {
  console.log("Running middleware...");
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        console.error("Middleware error:", result);
        return reject(result);
      }
      console.log("Middleware executed successfully.");
      return resolve(result);
    });
  });
}