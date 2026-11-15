import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Reply } from "lucide-react";
import DOMPurify from "dompurify";
import api from "../../api/axios";
import { useEmail } from "../../context/EmailContext";

export default function EmailDetail() {
  const { id } = useParams();
  const { setCurrentEmail } = useEmail();

  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");
    setEmail(null);

    api
      .get(`/auth/emails/${id}`)
      .then((response) => {
        if (!active) return;

        const fetchedEmail = response.data.email;

        setEmail(fetchedEmail);
        setCurrentEmail(fetchedEmail);
      })
      .catch((requestError) => {
        console.error("Error loading email:", requestError);

        if (active) {
          setError(
            requestError.response?.data?.message ||
              "Unable to load this email."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, setCurrentEmail]);

  if (loading) {
    return (
      <div className="py-24 text-center text-sm text-[#86868b] animate-pulse">
        Loading email...
      </div>
    );
  }

  if (!email) {
    return (
      <div className="empty-state">
        <p className="text-sm">{error || "Email not found."}</p>

        <Link
          to="/"
          className="text-sm text-[#0066cc] mt-4 inline-block"
        >
          Back to Inbox
        </Link>
      </div>
    );
  }

  const headers = email.payload?.headers || [];

  const getHeader = (name) =>
    headers.find(
      (header) => header.name?.toLowerCase() === name.toLowerCase()
    )?.value || "";

  const subject = getHeader("Subject") || "(No subject)";
  const from = getHeader("From");
  const to = getHeader("To");
  const date = getHeader("Date");

  // Sanitize email HTML before rendering it.
  const safeEmailBody = email.decodedBody
    ? DOMPurify.sanitize(email.decodedBody, {
        USE_PROFILES: { html: true },
      })
    : "";

  const replyAddress =
    from.match(/<(.+?)>/)?.[1] || from || "";

  const replySubject = subject.startsWith("Re:")
    ? subject
    : `Re: ${subject}`;

  return (
    <article className="detail-card mx-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs text-[#0066cc] hover:underline mb-7"
      >
        <ArrowLeft size={14} />
        Back to Inbox
      </Link>

      <p className="page-eyebrow">Message</p>

      <h1 className="text-[27px] leading-tight tracking-[-.035em] font-bold mt-2 break-words">
        {subject}
      </h1>

      <div className="mt-7 rounded-xl bg-[#f8f8fa] p-4 space-y-2.5 text-xs text-[#6e6e73]">
        <p>
          <span className="inline-block w-12 text-[#a1a1a6]">
            From
          </span>
          <span className="text-[#1d1d1f]">{from || "Unknown"}</span>
        </p>

        <p>
          <span className="inline-block w-12 text-[#a1a1a6]">
            To
          </span>
          <span className="text-[#1d1d1f]">{to || "Unknown"}</span>
        </p>

        <p>
          <span className="inline-block w-12 text-[#a1a1a6]">
            Date
          </span>
          <span className="text-[#1d1d1f]">{date || "Unknown"}</span>
        </p>
      </div>

      <div className="border-t border-[#eeeef2] my-7" />

      <div className="email-message-content text-[14px] leading-7 text-[#333336] overflow-x-auto">
        {email.decodedBody ? (
          <div
            dangerouslySetInnerHTML={{
              __html: safeEmailBody,
            }}
          />
        ) : (
          <p className="whitespace-pre-wrap">
            {email.snippet || "No email content available."}
          </p>
        )}
      </div>

      <div className="mt-8 pt-5 border-t border-[#eeeef2]">
        <Link
          to="/compose"
          state={{
            to: replyAddress,
            subject: replySubject,
          }}
          className="secondary-btn inline-flex items-center gap-2"
        >
          <Reply size={14} />
          Reply
        </Link>
      </div>
    </article>
  );
}