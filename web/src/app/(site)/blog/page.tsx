import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { PageHero } from "@/components/PageHero";
import { ArrowRight } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import { formatDate, posts } from "@/lib/site";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Insights, updates and smart mobility stories from Enugu Smart Bus — routes, fares, sustainability, technology and community news.",
};

export default function BlogPage() {
  const featured = posts.find((post) => post.featured) ?? posts[0];
  const rest = posts.filter((post) => post.slug !== featured.slug);

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Insights, updates and smart mobility stories"
        description="Follow the journey as Enugu Smart Bus builds a safer, smarter and more sustainable transport system for everyone in Enugu State."
        image="/images/blogs/lead-post-img.webp"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Blog" }]}
      />

      <Section className="bg-white">
        <Reveal>
          <article className="card-surface grid overflow-hidden lg:grid-cols-2">
            <div className="relative min-h-[260px]">
              <Image
                src={featured.image}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center p-8 sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-wide text-grass-600">
                Featured · {featured.category}
              </p>
              <h2 className="heading-md mt-4 text-navy-900">
                <Link
                  href={`/blog/${featured.slug}`}
                  className="hover:underline"
                >
                  {featured.title}
                </Link>
              </h2>
              <p className="mt-4 leading-relaxed text-navy-900/70">
                {featured.excerpt}
              </p>
              <p className="mt-6 text-sm text-navy-900/50">
                {formatDate(featured.date)} · {featured.readingTime}
              </p>
              <Link
                href={`/blog/${featured.slug}`}
                className="mt-6 inline-flex items-center gap-2 font-semibold text-navy-700 transition hover:text-grass-600"
              >
                Read the story
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        </Reveal>
      </Section>

      <Section className="bg-sand">
        <SectionHeading
          align="left"
          eyebrow="All articles"
          title="Latest from the newsroom"
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((post, index) => (
            <Reveal key={post.slug} delay={(index % 3) * 70}>
              <article className="card-surface group flex h-full flex-col overflow-hidden">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={post.image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-grass-600">
                    {post.category} · {post.readingTime}
                  </p>
                  <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-navy-800">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="hover:underline"
                    >
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-navy-900/70">
                    {post.excerpt}
                  </p>
                  <p className="mt-5 text-xs text-navy-900/50">
                    {formatDate(post.date)}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
