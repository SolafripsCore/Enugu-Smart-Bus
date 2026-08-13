import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowRight } from "@/components/ui/Icons";
import { Section } from "@/components/ui/Section";
import { formatDate, posts, site } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find((item) => item.slug === slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.image],
      type: "article",
    },
  };
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const post = posts.find((item) => item.slug === slug);
  if (!post) notFound();

  const related = posts.filter((item) => item.slug !== post.slug).slice(0, 3);

  return (
    <>
      <article>
        <header className="relative isolate overflow-hidden bg-navy-950">
          <Image
            src={post.image}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/85 to-navy-900/40" />
          <div className="container relative py-16 sm:py-20">
            <nav aria-label="Breadcrumb" className="mb-6 text-xs text-white/60">
              <Link href="/" className="hover:text-white">
                Home
              </Link>
              <span className="px-2">/</span>
              <Link href="/blog" className="hover:text-white">
                Blog
              </Link>
            </nav>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-grass-300">
              {post.category}
            </p>
            <h1 className="heading-lg mt-4 max-w-3xl text-white">
              {post.title}
            </h1>
            <p className="mt-5 text-sm text-white/60">
              {formatDate(post.date)} · {post.readingTime}
            </p>
          </div>
        </header>

        <Section className="bg-white">
          <div className="mx-auto max-w-3xl space-y-6 text-base leading-relaxed text-navy-900/80">
            <p className="text-lg font-medium text-navy-900">{post.excerpt}</p>
            <p>
              {site.name} continues to roll out a public transport network built
              around three commitments: safety on every trip, predictable
              service on every route, and cashless payment that works for every
              rider. This update is part of the programme&apos;s ongoing
              communication with citizens, partners and stakeholders across
              Enugu State.
            </p>
            <p>
              Operations are coordinated by {site.operator}, which manages fleet
              maintenance, driver training and the automatic fare collection
              systems behind the ESB Wallet and Smart Card. Live vehicle data
              feeds route planning, so timetables and frequencies keep improving
              as ridership grows.
            </p>
            <h2 className="heading-md pt-4 text-navy-900">
              What it means for riders
            </h2>
            <p>
              Riders can register in about a minute, top up instantly with a
              card, bank transfer, USSD or voucher, then board by tapping a
              Smart Card or scanning the in-app QR code. Trip history, receipts
              and concession applications are all available in the app.
            </p>
            <p>
              For enquiries about this update, contact our team on{" "}
              <a
                className="font-medium text-grass-700 underline"
                href={`mailto:${site.emails.media}`}
              >
                {site.emails.media}
              </a>{" "}
              or call {site.phone}.
            </p>
          </div>
        </Section>
      </article>

      <Section className="bg-sand">
        <div className="flex items-end justify-between gap-6">
          <h2 className="heading-md text-navy-900">More stories</h2>
          <Link
            href="/blog"
            className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-navy-700 hover:text-grass-600"
          >
            All articles
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {related.map((item) => (
            <article key={item.slug} className="card-surface overflow-hidden">
              <div className="relative aspect-[16/10]">
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-grass-600">
                  {item.category}
                </p>
                <h3 className="mt-3 font-display text-base font-semibold leading-snug text-navy-800">
                  <Link href={`/blog/${item.slug}`} className="hover:underline">
                    {item.title}
                  </Link>
                </h3>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
