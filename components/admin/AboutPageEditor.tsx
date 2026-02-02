"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "react-toastify";
import {
  Loader2,
  Save,
  Bold,
  Italic,
  List,
  Link,
  Eye,
  Code,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";

// Rich Text Editor Component
const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Enter your content...",
  className = "",
  minHeight = "150px",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isMarkdownMode, setIsMarkdownMode] = useState(false);
  const [textValue, setTextValue] = useState(value);
  const [showPreview, setShowPreview] = useState(false);

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
      <div className="flex items-center gap-1 p-2 border-b bg-muted/50 flex-wrap">
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
          {isMarkdownMode ? "Rich" : "HTML"}
        </Button>

        <Button
          type="button"
          variant={showPreview ? "default" : "outline"}
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          className="h-8 px-2"
        >
          <Eye className="h-4 w-4" />
          Preview
        </Button>

        {!isMarkdownMode && !showPreview && (
          <>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => executeCommand("bold")}
              className="h-8 px-2"
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => executeCommand("italic")}
              className="h-8 px-2"
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => executeCommand("insertUnorderedList")}
              className="h-8 px-2"
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={insertLink}
              className="h-8 px-2"
              title="Insert Link"
            >
              <Link className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => executeCommand("justifyLeft")}
              className="h-8 px-2"
              title="Align Left"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => executeCommand("justifyCenter")}
              className="h-8 px-2"
              title="Align Center"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => executeCommand("justifyRight")}
              className="h-8 px-2"
              title="Align Right"
            >
              <AlignRight className="h-4 w-4" />
            </Button>

            <select
              onChange={(e) => executeCommand("formatBlock", e.target.value)}
              className="h-8 px-2 text-sm border rounded ml-2"
            >
              <option value="div">Normal</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="h4">Heading 4</option>
              <option value="p">Paragraph</option>
            </select>
          </>
        )}
      </div>

      {/* Editor Content */}
      {showPreview ? (
        <div
          className="p-3 prose max-w-none"
          style={{ minHeight }}
          dangerouslySetInnerHTML={{ __html: value }}
        />
      ) : isMarkdownMode ? (
        <Textarea
          value={textValue}
          onChange={handleTextareaChange}
          placeholder={placeholder}
          className="border-0 focus-visible:ring-0 resize-none font-mono text-sm"
          style={{ minHeight }}
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className="p-3 focus:outline-none prose max-w-none"
          style={{
            minHeight,
            outline: "none",
          }}
          dangerouslySetInnerHTML={{ __html: value }}
          data-placeholder={placeholder}
        />
      )}
    </div>
  );
};

interface AboutPageContent {
  title: string;
  subtitle: string;
  ctaButton: string;
  story: {
    title: string;
    content: string;
  };
  mission: {
    title: string;
    description: string;
  };
  vision: {
    title: string;
    description: string;
  };
  values: {
    title: string;
    subtitle: string;
    values: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
  };
}

interface AboutPageEditorProps {
  initialData: AboutPageContent;
  onSave: (content: AboutPageContent) => Promise<void>;
  isLoading: boolean;
}

export function AboutPageEditor({
  initialData,
  onSave,
  isLoading,
}: AboutPageEditorProps) {
  const t = useTranslations("AboutPage");
  const [activeTab, setActiveTab] = useState("general");
  const [content, setContent] = useState<AboutPageContent>(initialData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await onSave(content);
      toast.success("About page content saved successfully");
    } catch (error) {
      console.error("Error saving about page:", error);
      toast.error("Error saving about page");
    }
  };

  const handleChange = (section: string, field: string, value: string) => {
    setContent((prev) => ({
      ...prev,
      [section]: { ...(prev as any)[section], [field]: value },
    }));
  };

  const handleValueChange = (index: number, field: string, value: string) => {
    setContent((prev) => ({
      ...prev,
      values: {
        ...prev.values,
        values: prev.values.values.map((item, i) =>
          i === index ? { ...item, [field]: value } : item,
        ),
      },
    }));
  };

  const addValue = () => {
    setContent((prev) => ({
      ...prev,
      values: {
        ...prev.values,
        values: [
          ...prev.values.values,
          { icon: "", title: "", description: "" },
        ],
      },
    }));
  };

  const removeValue = (index: number) => {
    setContent((prev) => ({
      ...prev,
      values: {
        ...prev.values,
        values: prev.values.values.filter((_, i) => i !== index),
      },
    }));
  };

  const insertTemplate = (section: string) => {
    const templates = {
      story: `<h3>Our Journey</h3>
<p>Founded in <strong>2020</strong>, Schepenkring.nlbegan with a simple mission: to provide reliable, accessible answers to questions that matter most to people and businesses.</p>

<p>What started as a small team of dedicated professionals has grown into a comprehensive platform serving thousands of users worldwide. Our commitment to <em>quality</em>, <em>accuracy</em>, and <em>accessibility</em> remains at the heart of everything we do.</p>

<blockquote>
<p>"We believe that everyone deserves access to reliable information, regardless of time or location."</p>
</blockquote>

<p>Today, Schepenkring.nlcontinues to innovate and expand, always with our users' needs at the forefront of our development.</p>`,

      mission: `Our mission is to <strong>democratize access to reliable information</strong> by providing 24/7 expert consultation and research services. We strive to bridge the gap between complex questions and clear, actionable answers.`,

      vision: `To become the world's most trusted source for <em>instant expert knowledge</em>, empowering individuals and organizations to make informed decisions with confidence.`,
    };

    if (section === "story") {
      handleChange("story", "content", templates.story);
    } else if (section === "mission") {
      handleChange("mission", "description", templates.mission);
    } else if (section === "vision") {
      handleChange("vision", "description", templates.vision);
    }
  };

  if (isLoading && !content.title) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit About Page</h1>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="story">Our Story</TabsTrigger>
          <TabsTrigger value="mission-vision">Mission & Vision</TabsTrigger>
          <TabsTrigger value="values">Values</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit} className="space-y-6">
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Title
                  </label>
                  <Input
                    value={content.title}
                    onChange={(e) =>
                      setContent({ ...content, title: e.target.value })
                    }
                    placeholder="Welcome to Answer24"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Subtitle
                  </label>
                  <RichTextEditor
                    value={content.subtitle}
                    onChange={(value) =>
                      setContent({ ...content, subtitle: value })
                    }
                    placeholder="Enter your hero subtitle with formatting..."
                    minHeight="120px"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Button Text
                  </label>
                  <Input
                    value={content.ctaButton}
                    onChange={(e) =>
                      setContent({ ...content, ctaButton: e.target.value })
                    }
                    placeholder="Get Started"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="story" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Our Story</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertTemplate("story")}
                  >
                    Insert Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Title
                  </label>
                  <Input
                    value={content.story.title}
                    onChange={(e) =>
                      handleChange("story", "title", e.target.value)
                    }
                    placeholder="Our Story"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Content
                  </label>
                  <RichTextEditor
                    value={content.story.content}
                    onChange={(value) =>
                      handleChange("story", "content", value)
                    }
                    placeholder="Tell your story with rich formatting..."
                    minHeight="300px"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use the toolbar above for formatting. You can add headings,
                    bold text, lists, links, and more.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mission-vision" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Mission</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertTemplate("mission")}
                  >
                    Insert Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Title
                  </label>
                  <Input
                    value={content.mission.title}
                    onChange={(e) =>
                      handleChange("mission", "title", e.target.value)
                    }
                    placeholder="Our Mission"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <RichTextEditor
                    value={content.mission.description}
                    onChange={(value) =>
                      handleChange("mission", "description", value)
                    }
                    placeholder="Describe your mission with rich formatting..."
                    minHeight="150px"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Vision</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertTemplate("vision")}
                  >
                    Insert Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Title
                  </label>
                  <Input
                    value={content.vision.title}
                    onChange={(e) =>
                      handleChange("vision", "title", e.target.value)
                    }
                    placeholder="Our Vision"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <RichTextEditor
                    value={content.vision.description}
                    onChange={(value) =>
                      handleChange("vision", "description", value)
                    }
                    placeholder="Describe your vision with rich formatting..."
                    minHeight="150px"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="values" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Company Values</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addValue}
                  >
                    Add Value
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Section Title
                  </label>
                  <Input
                    value={content.values.title}
                    onChange={(e) =>
                      handleChange("values", "title", e.target.value)
                    }
                    placeholder="Our Values"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Section Subtitle
                  </label>
                  <RichTextEditor
                    value={content.values.subtitle}
                    onChange={(value) =>
                      handleChange("values", "subtitle", value)
                    }
                    placeholder="Describe your values section..."
                    minHeight="100px"
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Individual Values</h4>
                  {content.values.values.map((value, index) => (
                    <Card key={index} className="border-l-4 border-l-primary">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <h5 className="font-medium">Value #{index + 1}</h5>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeValue(index)}
                          >
                            Remove
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Icon
                            </label>
                            <Input
                              value={value.icon}
                              onChange={(e) =>
                                handleValueChange(index, "icon", e.target.value)
                              }
                              placeholder="🎯 or icon-name"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Use emoji or icon class
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Title
                            </label>
                            <Input
                              value={value.title}
                              onChange={(e) =>
                                handleValueChange(
                                  index,
                                  "title",
                                  e.target.value,
                                )
                              }
                              placeholder="Excellence"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Description
                            </label>
                            <RichTextEditor
                              value={value.description}
                              onChange={(value) =>
                                handleValueChange(index, "description", value)
                              }
                              placeholder="Describe this value..."
                              minHeight="80px"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </form>
      </Tabs>
    </div>
  );
}
