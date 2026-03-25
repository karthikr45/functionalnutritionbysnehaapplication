export const SITE_SETTINGS_QUERY = `
  *[_type == "siteSettings"][0] {
    heroBadge,
    heroTitle,
    heroSubtitle,
    heroHighlights,
    heroStats,
    "doctorImage": doctorImage.asset->url,
    aboutName,
    aboutTitle,
    aboutDescription,
    aboutCredentials,
    aboutStats,
    aboutSpecializations,
    "aboutImage": aboutImage.asset->url
  }
`;

export const ALL_POSTS_QUERY = `
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
    _id,
    title,
    slug,
    publishedAt,
    excerpt,
    readTime,
    isFeatured,
    "author": author->{ name, "image": image.asset->url },
    "categories": categories[]->{ title },
    "mainImage": mainImage.asset->url
  }
`;

export const POST_BY_SLUG_QUERY = `
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    publishedAt,
    excerpt,
    readTime,
    body,
    "author": author->{ name, bio, "image": image.asset->url },
    "categories": categories[]->{ title },
    "mainImage": mainImage.asset->url
  }
`;

export const FEATURED_POSTS_QUERY = `
  *[_type == "post" && isFeatured == true] | order(publishedAt desc)[0...3] {
    _id,
    title,
    slug,
    publishedAt,
    excerpt,
    readTime,
    "author": author->{ name },
    "categories": categories[]->{ title },
    "mainImage": mainImage.asset->url
  }
`;

export const ALL_SERVICES_QUERY = `
  *[_type == "service" && isActive == true] | order(sortOrder asc) {
    _id,
    title,
    slug,
    subtitle,
    description,
    icon,
    "image": image.asset->url,
    benefits,
    conditions,
    sortOrder
  }
`;

export const SERVICE_BY_SLUG_QUERY = `
  *[_type == "service" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    subtitle,
    description,
    icon,
    "image": image.asset->url,
    body,
    benefits,
    conditions
  }
`;

export const RECENT_POSTS_QUERY = `
  *[_type == "post"] | order(publishedAt desc)[0...3] {
    _id,
    title,
    slug,
    publishedAt,
    excerpt,
    readTime,
    "categories": categories[]->{ title },
    "mainImage": mainImage.asset->url
  }
`;
