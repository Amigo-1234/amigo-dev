import type { Project } from "@/content/projects";
import { site } from "@/content/site";
import { contentUpdated } from "@/content/updated";

/*
 * Schema.org structured data as one connected graph. The site-wide WebSite
 * and Person entities are defined once (in the root layout) with stable
 * @ids, and every page refers to them by @id instead of repeating them, so
 * search engines see one person and one site, never several conflicting
 * copies. Only facts that are visible on the site are stated here.
 */

export const WEBSITE_ID = `${site.url}/#website`;
export const PERSON_ID = `${site.url}/#person`;
const PORTRAIT_ID = `${site.url}/#portrait`;

const ref = (id: string) => ({ "@id": id });

/** Technologies used in the shipped projects documented on this site (see the case studies). */
const knowsAbout = [
  "Full-stack web development",
  "Next.js",
  "React",
  "TypeScript",
  "PostgreSQL",
  "Supabase",
  "Firebase",
  "Tailwind CSS",
  "Web Push",
  "Vercel",
];

/** Present on every page. */
export function siteGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: `${site.url}/`,
        name: site.brand,
        alternateName: [site.name, `${site.brand} — ${site.name}`],
        description: site.description,
        inLanguage: "en-NG",
        author: ref(PERSON_ID),
        publisher: ref(PERSON_ID),
      },
      {
        "@type": "Person",
        "@id": PERSON_ID,
        name: site.name,
        alternateName: site.brand,
        url: `${site.url}/`,
        jobTitle: "Full-Stack Developer",
        description: site.description,
        email: `mailto:${site.email}`,
        nationality: { "@type": "Country", name: "Nigeria" },
        affiliation: { "@type": "CollegeOrUniversity", name: "Ekiti State University", alternateName: "EKSU" },
        knowsAbout,
        ...(site.portrait
          ? {
              image: {
                "@type": "ImageObject",
                "@id": PORTRAIT_ID,
                url: `${site.url}/images/muftau-idris.jpg`,
                caption: site.name,
              },
            }
          : {}),
        sameAs: [site.social.github, site.social.linkedin, site.social.x],
      },
    ],
  };
}

/** The home page: a WebPage about the person. */
export function homePageGraph() {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${site.url}/#webpage`,
    url: `${site.url}/`,
    name: `${site.name} (${site.brand}) — Full-Stack Developer`,
    isPartOf: ref(WEBSITE_ID),
    about: ref(PERSON_ID),
    ...(site.portrait ? { primaryImageOfPage: ref(PORTRAIT_ID) } : {}),
    dateModified: contentUpdated["/"],
    inLanguage: "en-NG",
  };
}

/** The About page: a ProfilePage whose main entity is the person. */
export function profilePageGraph() {
  const url = `${site.url}/about`;
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${url}#profilepage`,
    url,
    name: `About ${site.name} (${site.brand})`,
    isPartOf: ref(WEBSITE_ID),
    mainEntity: ref(PERSON_ID),
    about: ref(PERSON_ID),
    dateModified: contentUpdated["/about"],
    inLanguage: "en-NG",
  };
}

/**
 * A case study: a CreativeWork written by the person, about the product it
 * describes (a website or a web application, linked when it is public), with
 * a breadcrumb back through Projects.
 */
export function caseStudyGraph(project: Project) {
  const url = `${site.url}/projects/${project.slug}`;
  const product = {
    "@type": project.categories.includes("Website") ? "WebSite" : "WebApplication",
    name: project.name,
    ...(project.links.live ? { url: project.links.live.href } : {}),
    ...(project.categories.includes("Website") ? {} : { applicationCategory: "WebApplication" }),
  };
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        "@id": `${url}#case-study`,
        url,
        name: `${project.name} — case study`,
        headline: `${project.name} — case study`,
        description: project.summary,
        author: ref(PERSON_ID),
        isPartOf: ref(WEBSITE_ID),
        about: product,
        keywords: project.stack.join(", "),
        dateModified: contentUpdated.caseStudies,
        inLanguage: "en-NG",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${site.url}/` },
          { "@type": "ListItem", position: 2, name: "Projects", item: `${site.url}/projects` },
          { "@type": "ListItem", position: 3, name: project.name, item: url },
        ],
      },
    ],
  };
}
