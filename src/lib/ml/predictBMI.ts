// @ts-ignore
import * as tf from "@tensorflow/tfjs";

/**
 * Lightweight predictive model for BMI trend
 * Returns both current BMI and a 7-day projected value
 */
export async function predictBMI(weight: number, height: number, lastBMIs: number[]) {
  if (!weight || !height) return { bmi: null, predicted: null };

  const bmi = +(weight / Math.pow(height, 2)).toFixed(1);

  // Create tiny linear-regression model to project future trend
  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
  model.compile({ optimizer: "sgd", loss: "meanSquaredError" });

  const xs = tf.tensor1d(lastBMIs.map((_, i) => i));
  const ys = tf.tensor1d(lastBMIs);

  await model.fit(xs, ys, { epochs: 20, verbose: 0 });

  // @ts-ignore
  const next = model.predict(tf.tensor2d([[lastBMIs.length]]));
  const predicted = +(await next.data())[0];

  return { bmi, predicted: +predicted.toFixed(1) };
}