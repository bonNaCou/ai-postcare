export default function DataDeletion() {
  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-purple-600 mb-4">
        Data Deletion Instructions
      </h1>
      <p>
        If you have used AI PostCare and wish to delete your account or any personal data associated with it, please contact our support team.
      </p>
      <p className="mt-4">
        📧 Email:{" "}
        <a href="mailto:jerezcode.es@gmail.com" className="text-purple-600">
          jerezcode.es@gmail.com
        </a>
      </p>
      <p className="mt-4">
        Your data will be permanently removed from our systems within 72 hours
        of receiving your request. This includes all messages, recovery logs,
        and related medical information stored securely in Firebase.
      </p>
    </main>
  );
}
