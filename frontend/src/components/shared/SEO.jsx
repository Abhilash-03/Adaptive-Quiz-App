import { Helmet } from "react-helmet-async";

const defaultSEO = {
  title: "QuizAI - AI-Powered Adaptive Learning Platform",
  description:
    "Experience personalized learning that adapts to your skill level. QuizAI makes studying smarter, faster, and more engaging with intelligent quizzes.",
  image: "/og-image.png",
  url: "https://quizai-alpha.vercel.app",
};

export default function SEO({
  title,
  description = defaultSEO.description,
  image = defaultSEO.image,
  url = defaultSEO.url,
  type = "website",
}) {
  const fullTitle = title ? `${title} | QuizAI` : defaultSEO.title;
  const fullUrl = url.startsWith("http") ? url : `${defaultSEO.url}${url}`;
  const fullImage = image.startsWith("http") ? image : `${defaultSEO.url}${image}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
    </Helmet>
  );
}
