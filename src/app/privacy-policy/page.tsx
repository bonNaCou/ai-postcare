export default function PrivacyPolicy() {
  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-purple-600 mb-4">Privacy Policy</h1>
      <p>
        AI PostCare collects minimal data for post-surgery recovery support.
        Messages and health-related notes are processed securely through
        Firebase and Google AI APIs. No personal data is sold or shared.
      </p>
      <p className="mt-4">
        You may request deletion of your data anytime by contacting{" "}
        <a href="mailto:aipostcare@gmail.com" className="text-purple-600">
        aipostcare@gmail.com
        </a>.
      </p>
    </main>
  );
}
