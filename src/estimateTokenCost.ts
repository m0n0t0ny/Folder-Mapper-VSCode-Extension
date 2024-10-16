import * as fs from "fs";

export async function estimateTokenCost(filePath: string): Promise<number> {
  try {
    const content = await fs.promises.readFile(filePath, "utf8");

    const words = content.split(/\s+/).length;

    const estimatedTokens = Math.ceil(words * 1.3);

    return estimatedTokens;
  } catch (error) {
    console.error("Error estimating token cost:", error);
    throw error;
  }
}
