"use client";

import { Blog, BlogData, BlogResponse, BlogsResponse, BlogFormData } from "@/types/blog.d";

const BASE_BLOG_URL = "https://api.answer24.nl/api/v1";

/* =====================
   GET ALL BLOGS
===================== */
export async function getAllBlogs(): Promise<BlogData> {
  try {
    const response = await fetch(`${BASE_BLOG_URL}/blogs`, {
      cache: "no-store",
    });

    if (!response.ok) throw new Error("Failed to fetch blogs");

    const result: BlogsResponse = await response.json();
    return result.data;
  } catch (error) {
    console.error("Get all blogs error:", error);
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

/* =====================
   GET BLOG BY SLUG
===================== */
export async function getBlogBySlug(slug: string): Promise<BlogResponse> {
  try {
    const response = await fetch(`${BASE_BLOG_URL}/blogs/${slug}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || "Failed to fetch blog post",
        data: {} as Blog,
      };
    }

    const result: BlogResponse = await response.json();
    return result;
  } catch (error) {
    console.error(`Error fetching blog ${slug}:`, error);
    return {
      success: false,
      message: "An unexpected error occurred.",
      data: {} as Blog,
    };
  }
}

/* =====================
   CREATE BLOG
===================== */
export async function createBlog(data: BlogFormData, token: string) {
  try {
    if (!token) {
      return { errors: { _form: ["Authentication required. Please log in."] } };
    }

    const response = await fetch(`${BASE_BLOG_URL}/blogs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to create blog");
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("Create blog error:", error);
    return {
      errors: {
        _form: [
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while creating the blog.",
        ],
      },
    };
  }
}

/* =====================
   UPDATE BLOG
===================== */
export async function updateBlog(id: string, data: BlogFormData, token: string) {
  try {
    if (!token) {
      return { errors: { _form: ["Authentication required. Please log in."] } };
    }

    const response = await fetch(`${BASE_BLOG_URL}/blogs/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to update blog");
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("Update blog error:", error);
    return {
      errors: {
        _form: [
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while updating the blog.",
        ],
      },
    };
  }
}

/* =====================
   DELETE BLOG
===================== */
export async function deleteBlog(id: string, token: string) {
  try {
    if (!token) {
      return { errors: { _form: ["Authentication required. Please log in."] } };
    }

    const response = await fetch(`${BASE_BLOG_URL}/blogs/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to delete blog post");
    }

    return { success: true };
  } catch (error) {
    console.error("Delete blog error:", error);
    return {
      errors: {
        _form: [
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while deleting the blog post.",
        ],
      },
    };
  }
}
