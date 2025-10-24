// @ts-ignore
import * as tf from "@tensorflow/tfjs";

export async function predictWeight(weightHistory: number[]) {
  if (!weightHistory || weightHistory.length < 2) return null;

  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
  model.compile({ optimizer: "sgd", loss: "meanSquaredError" });

  const xs = tf.tensor1d(weightHistory.map((_, i) => i));
  const ys = tf.tensor1d(weightHistory);

  await model.fit(xs, ys, { epochs: 25, verbose: 0 });

  // @ts-ignore
  const next = model.predict(tf.tensor2d([[weightHistory.length]]));
  const result = await next.data();
  return +result[0].toFixed(1);
}