"use server";
import { z } from "zod";
import { BlogData, BlogResponse, BlogsResponse } from "@/types/blog.d";
import { revalidatePath } from "next/cache";
import { tokenUtils } from "@/utils/auth";

// ✅ Hardcoded API domain
const API_URL = "https://api.answer24.nl/api/v1";

// Zod schema for blog post
const blogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  status: z.enum(["published", "draft"]),
  excerpt: z.string().optional(),
  slug: z.string().optional(),
});

// ✅ CREATE BLOG
export async function createBlog(formData: FormData, token: string) {
  try {
    if (!token) {
      return { errors: { _form: ["Authentication required. Please log in again."] } };
    }

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const status = formData.get("status") as string;
    const excerpt = formData.get("excerpt") as string;
    const slug = formData.get("slug") as string;

    const validated = blogSchema.safeParse({ title, content, status, excerpt, slug });
    if (!validated.success) return { errors: validated.error.flatten().fieldErrors };

    const finalSlug =
      slug ||
      title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/--+/g, "-")
        .trim();

    const apiFormData = new FormData();
    apiFormData.append("title", title.trim());
    apiFormData.append("content", content.trim());
    apiFormData.append("excerpt", excerpt?.trim() || "");
    apiFormData.append("status", status);
    apiFormData.append("slug", finalSlug);

    const blogImage = formData.get("blog_image") as File;
    if (blogImage && blogImage.size > 0) {
      apiFormData.append("blog_image", blogImage);
    }

    const response = await fetch(`${API_URL}/blogs`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      body: apiFormData,
      cache: "no-store",
    });

    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      console.error("Non-JSON response from Laravel:", text);
      throw new Error("Invalid JSON returned from API");
    }

    if (!response.ok) {
      if (response.status === 401) {
        tokenUtils.removeToken();
        return { errors: { _form: ["Your session has expired. Please log in again."] } };
      }
      if (response.status === 422 && result.errors) return { errors: result.errors };
      throw new Error(result.message || `Failed to create blog (Status: ${response.status})`);
    }

    revalidatePath("/blogs");
    revalidatePath("/blogs");
    revalidatePath(`/blogs/${result.data?.slug}`);
    return { success: true, data: result.data };
  } catch (error) {
    console.error("Create blog error:", error);
    return { errors: { _form: [error instanceof Error ? error.message : "Unexpected error"] } };
  }
}

// ✅ UPDATE BLOG
export async function updateBlog(id: string, formData: FormData, token: string) {
  try {
    if (!token) {
      return { errors: { _form: ["Authentication required. Please log in again."] } };
    }

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const status = formData.get("status") as string;
    const excerpt = formData.get("excerpt") as string;
    const slug = formData.get("slug") as string;

    const validated = blogSchema.safeParse({ title, content, status, excerpt, slug });
    if (!validated.success) return { errors: validated.error.flatten().fieldErrors };

    const apiFormData = new FormData();
    apiFormData.append("title", title.trim());
    apiFormData.append("content", content.trim());
    apiFormData.append("excerpt", excerpt?.trim() || "");
    apiFormData.append("status", status);
    apiFormData.append("slug", slug);
    apiFormData.append("_method", "PUT");

    const blogImage = formData.get("blog_image") as File;
    if (blogImage && blogImage.size > 0) {
      apiFormData.append("blog_image", blogImage);
    }

    const response = await fetch(`${API_URL}/blogs/${id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      body: apiFormData,
      cache: "no-store",
    });

    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      console.error("Non-JSON response from Laravel:", text);
      throw new Error("Invalid JSON returned from API");
    }

    if (!response.ok) {
      if (response.status === 401) {
        tokenUtils.removeToken();
        return { errors: { _form: ["Your session has expired. Please log in again."] } };
      }
      if (response.status === 422 && result.errors) return { errors: result.errors };
      throw new Error(result.message || `Failed to update blog (Status: ${response.status})`);
    }

    // revalidatePath("/admin/blogs");
    revalidatePath("/blogs");
    revalidatePath("/blogs");
    revalidatePath(`/blogs/${result.data?.slug}`);
    return { success: true, data: result.data };
  } catch (error) {
    console.error("Update blog error:", error);
    return { errors: { _form: [error instanceof Error ? error.message : "Unexpected error"] } };
  }
}

// ✅ GET ALL BLOGS
export async function getAllBlogs(): Promise<BlogData> {
  try {
    const response = await fetch(`${API_URL}/blogs`, { cache: "no-store" });
    if (!response.ok) throw new Error("Failed to fetch blogs");

    const result: BlogsResponse = await response.json();
    return { ...result.data };
  } catch (error) {
    console.error(error);
    return {
      data: [],
      links: { first: "", last: "", prev: null, next: null },
      meta: {
        current_page: 1,
        from: 1,
        last_page: 1,
        links: [],
        path: "",
        per_page: 10,
        to: 1,
        total: 0,
      },
    };
  }
}

// ✅ DELETE BLOG
export async function deleteBlog(id: string, token: string) {
  try {
    if (!token) {
      return { errors: { _form: ["Authentication required. Please log in again."] } };
    }

    const response = await fetch(`${API_URL}/blogs/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) throw new Error("Failed to delete blog post");

    revalidatePath("/admin/blogs");
    return { success: true };
  } catch (error) {
    return { errors: { _form: ["An unexpected error occurred."] } };
  }
}
