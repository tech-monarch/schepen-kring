"use client";

import { useState, useEffect, useRef } from "react";
import { LegalPage } from "@/lib/legalPages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "react-toastify";
import {
  Loader2,
  Save,
  X,
  Eye,
  Edit,
  Trash2,
  Code,
  Type,
  Bold,
  Italic,
  List,
  Link,
} from "lucide-react";

// Rich Text Editor Component using ContentEditable
const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Enter your content...",
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isMarkdownMode, setIsMarkdownMode] = useState(false);
  const [textValue, setTextValue] = useState(value);

  useEffect(() => {
    setTextValue(value);
    if (editorRef.current && !isMarkdownMode) {
      editorRef.current.innerHTML = value;
    }
  }, [value, isMarkdownMode]);

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setTextValue(newValue);
    onChange(newValue);
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      executeCommand("createLink", url);
    }
  };

  return (
    <div className={`border rounded-lg ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b bg-muted/50">
        <Button
          type="button"
          variant={isMarkdownMode ? "default" : "outline"}
          size="sm"
          onClick={() => setIsMarkdownMode(!isMarkdownMode)}
          className="h-8 px-2"
        >
          {isMarkdownMode ? (
            <Type className="h-4 w-4" />
          ) : (
            <Code className="h-4 w-4" />
          )}
          {isMarkdownMode ? "Rich" : "Markdown"}
        </Button>

        {!isMarkdownMode && (
          <>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => executeCommand("bold")}
              className="h-8 px-2"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => executeCommand("italic")}
              className="h-8 px-2"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => executeCommand("insertUnorderedList")}
              className="h-8 px-2"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={insertLink}
              className="h-8 px-2"
            >
              <Link className="h-4 w-4" />
            </Button>
            <select
              onChange={(e) => executeCommand("formatBlock", e.target.value)}
              className="h-8 px-2 text-sm border rounded"
            >
              <option value="div">Normal</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="p">Paragraph</option>
            </select>
          </>
        )}
      </div>

      {/* Editor */}
      {isMarkdownMode ? (
        <Textarea
          value={textValue}
          onChange={handleTextareaChange}
          placeholder={placeholder}
          className="min-h-[300px] font-mono text-sm border-0 focus-visible:ring-0 resize-none"
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className="min-h-[300px] p-3 focus:outline-none prose max-w-none"
          style={{
            minHeight: "300px",
            outline: "none",
          }}
          dangerouslySetInnerHTML={{ __html: value }}
          data-placeholder={placeholder}
        />
      )}
    </div>
  );
};

interface LegalPageEditorProps {
  page: LegalPage;
  onSave: (page: LegalPage) => Promise<boolean>;
  onDelete: (slug: string) => Promise<void>;
  availableLanguages: string[];
}

export function LegalPageEditor({
  page,
  onSave,
  onDelete,
  availableLanguages,
}: LegalPageEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState<LegalPage>({ ...page });
  const [activeTab, setActiveTab] = useState(page.language);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setFormData({ ...page });
    setActiveTab(page.language);
  }, [page]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleContentChange = (content: string) => {
    setFormData((prev) => ({
      ...prev,
      content: content,
    }));
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.slug.trim()) {
      toast("Error: Title and slug are required");
      return;
    }

    setIsSaving(true);
    try {
      const success = await onSave(formData);
      if (success) {
        toast("Success: Page saved successfully");
        setIsEditing(false);
      }
    } catch (error) {
      toast("Error: Failed to save page");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this page? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(page.slug);
      toast("Success: Page deleted successfully");
    } catch (error) {
      toast("Error: Failed to delete page");
    } finally {
      setIsDeleting(false);
    }
  };

  const insertTemplate = (template: string) => {
    const templates = {
      privacy: `<h1>Privacy Policy</h1>
<p>Last updated: [DATE]</p>

<h2>Information We Collect</h2>
<p>We collect information you provide directly to us...</p>

<h2>How We Use Your Information</h2>
<p>We use the information we collect to...</p>

<h2>Information Sharing</h2>
<p>We may share your information in certain circumstances...</p>

<h2>Contact Us</h2>
<p>If you have questions about this Privacy Policy, please contact us at:</p>`,

      terms: `<h1>Terms of Service</h1>
<p>Last updated: [DATE]</p>

<h2>Acceptance of Terms</h2>
<p>By accessing and using this service, you accept and agree to be bound by the terms...</p>

<h2>Use of Service</h2>
<p>You may use our service for lawful purposes only...</p>

<h2>User Responsibilities</h2>
<p>As a user of our service, you are responsible for...</p>`,

      about: `<h1>About Us</h1>
<p>Welcome to Answer24...</p>

<h2>Our Mission</h2>
<p>Our mission is to...</p>

<h2>Our Team</h2>
<p>We are a dedicated team of professionals...</p>

<h2>Contact Information</h2>
<p>Get in touch with us:</p>
<ul>
<li>Email: info@answer24.nl</li>
<li>Phone: [PHONE]</li>
<li>Address: [ADDRESS]</li>
</ul>`,
    };

    setFormData((prev) => ({
      ...prev,
      content: templates[template as keyof typeof templates] || "",
    }));
  };

  if (!isEditing) {
    return (
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">{page.title}</CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="h-8 px-2"
            >
              <Eye className="h-4 w-4 mr-1" />
              {showPreview ? "Hide" : "Preview"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-8 px-2"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              className="h-8 px-2"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-1" />
              )}
              Delete
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showPreview ? (
            <div
              className="prose max-w-none p-4 border rounded-md bg-muted/20"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          ) : (
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center mb-2">
                <span className="font-medium mr-2">Slug:</span>
                <code className="bg-muted px-2 py-1 rounded text-xs">
                  /{page.slug}
                </code>
              </div>
              <div className="flex items-center mb-2">
                <span className="font-medium mr-2">Language:</span>
                <span className="text-foreground">
                  {page.language.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-medium mr-2">Last Updated:</span>
                <span className="text-foreground">
                  {new Date(page.last_updated_at).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4 border-primary">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Edit Page</CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(false)}
              className="h-8 px-2"
              disabled={isSaving}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="h-8 px-2"
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="slug" className="block text-sm font-medium mb-1">
                Slug *
              </label>
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="about-us"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                URL path: /{formData.slug || "your-slug"}
              </p>
            </div>
            <div>
              <label
                htmlFor="language"
                className="block text-sm font-medium mb-1"
              >
                Language *
              </label>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={(e) =>
                  setFormData({ ...formData, language: e.target.value })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                {availableLanguages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title *
            </label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Page Title"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="content" className="block text-sm font-medium">
                Content *
              </label>
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => insertTemplate("privacy")}
                >
                  Privacy Template
                </button>
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => insertTemplate("terms")}
                >
                  Terms Template
                </button>
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => insertTemplate("about")}
                >
                  About Template
                </button>
              </div>
            </div>

            <RichTextEditor
              value={formData.content}
              onChange={handleContentChange}
              placeholder="Enter your page content..."
              className="min-h-[300px]"
            />

            <div className="mt-1 text-xs text-muted-foreground">
              Use the toolbar above for formatting options, or switch to
              Markdown mode for advanced editing.
            </div>
          </div>

          {/* Live Preview */}
          <div>
            <h4 className="text-sm font-medium mb-2">Live Preview:</h4>
            <div
              className="prose max-w-none p-4 border rounded-md bg-muted/10 max-h-[200px] overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: formData.content }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
