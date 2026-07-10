import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Mainlayout from "@/layout/Mainlayout";
import { useAuth } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function AskPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    tags: [] as string[],
  });
  const [newTag, setNewTag]               = useState("");
  const [existingTags, setExistingTags]   = useState<string[]>([]);
  const [suggestions, setSuggestions]     = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch all existing tags from questions on mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await axiosInstance.get("/question/getallquestion");
        const questions = res.data.data;
        const tagSet = new Set<string>();
        questions.forEach((q: any) => {
          q.questiontags?.forEach((t: string) => {
            if (t.trim()) tagSet.add(t.trim().toLowerCase());
          });
        });
        setExistingTags(Array.from(tagSet).sort());
      } catch (error) {
        console.log(error);
      }
    };
    fetchTags();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleTagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewTag(val);
    if (val.trim().length >= 1) {
      const matches = existingTags.filter(
        (t) =>
          t.includes(val.trim().toLowerCase()) &&
          !formData.tags.includes(t)
      );
      setSuggestions(matches.slice(0, 6));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleAddTag = (e?: React.MouseEvent) => {
    e?.preventDefault();
    const trimmed = newTag.trim().toLowerCase();
    if (!trimmed) return;
    if (formData.tags.length >= 5) {
      toast.error("Maximum 5 tags allowed");
      return;
    }
    if (formData.tags.includes(trimmed)) {
      toast.error("Tag already added");
      return;
    }
    setFormData({ ...formData, tags: [...formData.tags, trimmed] });
    setNewTag("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSelectSuggestion = (tag: string) => {
    if (formData.tags.length >= 5) {
      toast.error("Maximum 5 tags allowed");
      return;
    }
    if (!formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
    }
    setNewTag("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tagToRemove),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
    if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to ask a question");
      router.push("/auth");
      return;
    }
    if (!formData.title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!formData.body.trim() || formData.body.trim().length < 20) {
      toast.error("Body must be at least 20 characters");
      return;
    }
    if (formData.tags.length === 0) {
      toast.error("Please add at least one tag");
      return;
    }
    try {
      const res = await axiosInstance.post("/question/ask", {
        postquestiondata: {
          questiontitle: formData.title,
          questionbody: formData.body,
          questiontags: formData.tags,
          userposted: user.name,
          userid: user?._id,
        },
      });
      if (res.data.data) {
        toast.success("Question posted successfully");
        router.push("/");
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <Mainlayout>
      <div className="max-w-6xl mx-auto p-4 lg:p-6">
        <h1 className="text-xl lg:text-2xl font-semibold mb-6">
          Ask a public question
        </h1>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg lg:text-xl">
                Writing a good question
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Title */}
              <div>
                <Label htmlFor="title" className="text-base font-semibold">
                  Title
                </Label>
                <p className="text-sm text-gray-600 mb-2">
                  Be specific and imagine you're asking a question to another person.
                </p>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. How to center a div in CSS?"
                  className="w-full"
                />
              </div>

              {/* Body */}
              <div>
                <Label htmlFor="body" className="text-base font-semibold">
                  What are the details of your problem?
                </Label>
                <p className="text-sm text-gray-600 mb-2">
                  Introduce the problem and expand on what you put in the title. Minimum 20 characters.
                </p>
                <Textarea
                  id="body"
                  value={formData.body}
                  onChange={handleChange}
                  placeholder="Describe your problem in detail..."
                  className="min-h-32 lg:min-h-48 w-full"
                />
              </div>

              {/* Tags */}
              <div>
                <Label className="text-base font-semibold">Tags</Label>
                <p className="text-sm text-gray-600 mb-2">
                  Add up to 5 tags. Type to search existing tags or create a new one.
                </p>

                {/* Selected tags */}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-blue-100 text-blue-800 flex items-center gap-1 text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Tag input */}
                {formData.tags.length < 5 && (
                  <div className="relative">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          value={newTag}
                          onChange={handleTagInput}
                          onKeyDown={handleKeyDown}
                          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                          onFocus={() => {
                            if (suggestions.length > 0) setShowSuggestions(true);
                          }}
                          placeholder="e.g. javascript, react, node.js"
                          className="w-full"
                        />
                        {/* Suggestions dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                          <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                            {suggestions.map((s) => (
                              <button
                                key={s}
                                type="button"
                                onMouseDown={() => handleSelectSuggestion(s)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 flex items-center gap-2"
                              >
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                                  {s}
                                </span>
                              </button>
                            ))}
                            {newTag.trim() &&
                              !existingTags.includes(newTag.trim().toLowerCase()) && (
                                <button
                                  type="button"
                                  onMouseDown={() => handleSelectSuggestion(newTag.trim().toLowerCase())}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-green-50 border-t flex items-center gap-2 text-green-700"
                                >
                                  <Plus className="w-3 h-3" />
                                  Create new tag: <strong>{newTag.trim().toLowerCase()}</strong>
                                </button>
                              )}
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={handleAddTag}
                        variant="outline"
                        size="sm"
                        type="button"
                        className="bg-orange-600 text-white hover:bg-orange-700"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {5 - formData.tags.length} tag{5 - formData.tags.length !== 1 ? "s" : ""} remaining
                    </p>
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
                  Post Your Question
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </Mainlayout>
  );
}