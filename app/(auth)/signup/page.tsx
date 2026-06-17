import SignupForm from "@/components/auth/SignupForm";

export const metadata = {
  title: "Create Account — nuExpense",
};

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo / Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 text-white rounded-2xl text-2xl font-extrabold mb-4 shadow-lg">
            n
          </div>
          <h1 className="text-2xl font-bold text-gray-900">nuExpense</h1>
          <p className="text-gray-500 text-sm mt-1">
            Start tracking expenses smarter
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Create your account
          </h2>
          <SignupForm />
        </div>
      </div>
    </main>
  );
}
