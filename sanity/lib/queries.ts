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
