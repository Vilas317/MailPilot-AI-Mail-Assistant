import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import { useEmail } from "../../context/EmailContext";

export default function EmailDetail() {
  const { id } = useParams();

  const { setCurrentEmail } = useEmail();

  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/auth/emails/${id}`)
      .then((res) => {
        setEmail(res.data.email);

        // Store the currently opened email
        setCurrentEmail(res.data.email);
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false);
      });
  }, [id, setCurrentEmail]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-lg text-gray-500 animate-pulse">
          Loading email...
        </p>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="text-6xl mb-4">📭</div>
  
        <h2 className="text-2xl font-semibold text-gray-800">
          Email not found
        </h2>
  
        <p className="mt-2 text-gray-500">
          The email may have been deleted or is no longer available.
        </p>
      </div>
    );
  }

  const headers = email.payload?.headers || [];

  const getHeader = (name) =>
    headers.find((h) => h.name === name)?.value || "";

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
      <h1 className="text-3xl font-bold">
        {getHeader("Subject")}
      </h1>

      <div className="mt-6 space-y-3 text-sm text-gray-700">
  <div>
    <span className="font-semibold">From:</span>{" "}
    {getHeader("From")}
  </div>

  <div>
    <span className="font-semibold">To:</span>{" "}
    {getHeader("To")}
  </div>

  <div>
    <span className="font-semibold">Date:</span>{" "}
    {getHeader("Date")}
  </div>
</div>

<hr className="my-8 border-gray-200" />

<div
  className="prose prose-gray max-w-none"
        dangerouslySetInnerHTML={{
          __html: email.decodedBody || email.snippet,
        }}
      />
    </div>
  );
}