import * as tf from "@tensorflow/tfjs";

/**
 * Creates a basic TensorFlow correlation model between pain and mood.
 */
export async function trainPainMoodModel(painLevels: number[], moodScores: number[]) {
  if (painLevels.length !== moodScores.length || painLevels.length === 0) return null;
  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
  model.compile({ optimizer: "adam", loss: "meanSquaredError" });

  const xs = tf.tensor2d(painLevels, [painLevels.length, 1]);
  const ys = tf.tensor2d(moodScores, [moodScores.length, 1]);
  await model.fit(xs, ys, { epochs: 30, verbose: 0 });

  return model;
}