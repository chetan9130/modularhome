export interface MappedUrlMigration {
  content_type: "product" | "collection" | "page" | "blog" | "custom";
  source_handle: string;
  old_modularhome_path: string;
  new_path: string;
  action: "REDIRECT_301" | "PRESERVE" | "CANONICAL_UPDATE";
  verified: boolean;
  notes: string;
}

export function generateProductUrlMigration(handle: string, title: string): MappedUrlMigration {
  return {
    content_type: "product",
    source_handle: handle,
    old_modularhome_path: `/products/${handle}`,
    new_path: `/buildings/${handle}`,
    action: "REDIRECT_301",
    verified: true,
    notes: `Shopify product path to ModularHome buildings route for ${title}`,
  };
}

export function generateCollectionUrlMigration(handle: string, title: string): MappedUrlMigration {
  return {
    content_type: "collection",
    source_handle: handle,
    old_modularhome_path: `/collections/${handle}`,
    new_path: `/collections/${handle}`,
    action: "PRESERVE",
    verified: true,
    notes: `Preserved collection URL path for ${title}`,
  };
}

export function generatePageUrlMigration(handle: string, title: string): MappedUrlMigration {
  return {
    content_type: "page",
    source_handle: handle,
    old_modularhome_path: `/pages/${handle}`,
    new_path: `/${handle}`,
    action: "REDIRECT_301",
    verified: true,
    notes: `Shopify pages path to root page slug for ${title}`,
  };
}

export function generateBlogUrlMigration(blogHandle: string, handle: string, title: string): MappedUrlMigration {
  return {
    content_type: "blog",
    source_handle: handle,
    old_modularhome_path: `/blogs/${blogHandle}/${handle}`,
    new_path: `/resources/${handle}`,
    action: "REDIRECT_301",
    verified: true,
    notes: `Shopify blog path to ModularHome resources route for ${title}`,
  };
}
